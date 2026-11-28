'use strict';
const test = require('node:test');
const assert = require('node:assert');
const D = require('../src/sn-cost-diagnostic.src.js');

/* ---- Fabrique de données au format API (sysparm_display_value=all) ---- */
const f = (v, d) => ({ value: String(v), display_value: d == null ? String(v) : String(d) });
const line = (o) => ({
  sys_id: f(o.id), number: f(o.number || o.id), source_id: f(o.src), task: f(o.task || o.src), state: f(o.state || 'processed'),
  amount_project_currency: f(o.amt, String(o.amt).replace(/\B(?=(\d{3})+(?!\d))/g, ',')), base_expense: f(o.base || ''),
  time_card: f(o.tc || ''), recalled: f(o.recalled ? 'true' : 'false'), cost_plan: f(o.plan === undefined ? 'CP1' : o.plan),
  expense_type: f(o.etype || 'opex'), date: f(o.date || '2026-11-10')
});
const wcField = (amt, cur = 'USD') => ({ value: 'c084dcd5fb3c5b10d9ddf5028eefdcfc', display_value: '$' + amt, currency_display_value: cur + ';' + amt });

/* Hiérarchie : racine P, tâche T1 (de P), sous-projet S, tâche TS1 (de S) */
const nodes = () => ({
  A: { sys_id: 'A', number: 'PRJ_ANC', isProject: true, isAnc: true },
  P: { sys_id: 'P', number: 'PRJ_P', isProject: true, isRoot: true },
  T1: { sys_id: 'T1', number: 'T1', parent: 'P' },
  T11: { sys_id: 'T11', number: 'T11', parent: 'T1' },
  S: { sys_id: 'S', number: 'PRJ_S', isProject: true, parent: 'P' },
  TS1: { sys_id: 'TS1', number: 'TS1', parent: 'S' }
});

/* io simulé : répond selon la table demandée */
function makeIO(data) {
  return {
    status() {},
    async rows(url) {
      const table = url.split('/api/now/table/')[1].split('?')[0];
      if (data.fail && data.fail.includes(table)) throw new Error('HTTP 403');
      return { rows: data[table] || [], total: (data[table] || []).length, partial: !!(data.partial && data.partial.includes(table)) };
    }
  };
}

test('SC_Pourpre : ligne d\'origine sur tâche + copie sur projet, aucun sous-projet', async () => {
  const n = { P: { sys_id: 'P', number: 'PRJ0010436', isProject: true, isRoot: true }, T: { sys_id: 'T', number: 'PRJTASK1', parent: 'P' } };
  const res = await D.analyze(n, makeIO({
    sys_properties: [],
    pm_project: [{ sys_id: f('P'), number: f('PRJ0010436'), actual_cost_project_currency: wcField('2000') }],
    fm_expense_line: [
      line({ id: 'E9', src: 'T', amt: 2000, tc: 'TC1' }),
      line({ id: 'E10', src: 'P', amt: 2000, base: 'E9' })
    ],
    cost_plan: [{ sys_id: f('CP1'), task: f('P'), actual_cost_project_currency: f('2000') }],
    cost_plan_breakdown: []
  }));
  const s = res.stats.P;
  assert.strictEqual(s.sumAt, 2000);          // la copie seule est portée par le projet
  assert.strictEqual(s.copyFromTasks, 2000);
  assert.strictEqual(s.tasksSum, 2000);       // l'origine est sur la tâche
  assert.strictEqual(s.own, 0);
  assert.strictEqual(res.wc.P.amt, 2000);
  assert.strictEqual(res.cpActual.P, 2000);
  assert.strictEqual(res.mode.mode, 'sans_sous_projet');
  assert.strictEqual(res.currency, 'USD');
});

test('lignes Pending exclues, négatives et recalled comptées à part', async () => {
  const n = nodes();
  const res = await D.analyze(n, makeIO({
    sys_properties: [],
    pm_project: [{ sys_id: f('P'), actual_cost_project_currency: wcField('1000') }, { sys_id: f('S'), actual_cost_project_currency: wcField('0') }],
    fm_expense_line: [
      line({ id: 'a', src: 'P', amt: 1500 }),
      line({ id: 'b', src: 'P', amt: -500, recalled: true }),
      line({ id: 'c', src: 'P', amt: 700, state: 'pending' }),
      line({ id: 'd', src: 'P', amt: 40, plan: '' })
    ]
  }));
  const s = res.stats.P;
  assert.strictEqual(s.sumAt, 1040);
  assert.strictEqual(s.pending, 700); assert.strictEqual(s.nPending, 1);
  assert.strictEqual(s.neg, -500); assert.strictEqual(s.nNeg, 1);
  assert.strictEqual(s.nRecalled, 1);
  assert.strictEqual(s.nNoPlan, 1); assert.strictEqual(s.noPlan, 40);
});

const subScenario = (kind) => {
  const L = [
    line({ id: 'o1', src: 'T1', amt: 3000 }),                        // dépense tâche du parent
    line({ id: 'os', src: 'TS1', amt: 2000 })                         // dépense tâche du sous-projet
  ];
  L.push(line({ id: 'c1', src: 'P', amt: 3000, base: 'o1' }));        // copie tâche -> parent
  L.push(line({ id: 'cs', src: 'S', amt: 2000, base: 'os' }));        // copie tâche -> sous-projet
  if (kind === 'copie') L.push(line({ id: 'cp', src: 'P', amt: 2000, base: 'os' })); // copie sous-projet -> parent
  const wcP = { copie: 5000, calcul: 5000, separe: 3000, autre: 4321 }[kind];
  return {
    sys_properties: [{ name: f('com.snc.project.rollup.cost'), value: f(kind === 'separe' ? 'false' : 'true') }],
    pm_project: [{ sys_id: f('P'), actual_cost_project_currency: wcField(String(wcP)) }, { sys_id: f('S'), actual_cost_project_currency: wcField('2000') }],
    fm_expense_line: L
  };
};

test('détection : parent cumulatif par copie de lignes', async () => {
  const r = await D.analyze(nodes(), makeIO(subScenario('copie')));
  assert.strictEqual(r.mode.mode, 'inclus_copie');
  assert.strictEqual(r.mode.confidence, 'élevée');
  assert.strictEqual(r.stats.P.nCopyFromSub, 1);
  assert.strictEqual(r.stats.P.copyFromTasks, 3000);
  assert.strictEqual(r.stats.P.sumAt, 5000);
});

test('détection : cumul calculé (work_cost parent = lignes + sous-projets, sans copie)', async () => {
  const r = await D.analyze(nodes(), makeIO(subScenario('calcul')));
  assert.strictEqual(r.mode.mode, 'inclus_calcul');
  assert.strictEqual(r.stats.P.sumAt, 3000);
});

test('détection : parent séparé', async () => {
  const r = await D.analyze(nodes(), makeIO(subScenario('separe')));
  assert.strictEqual(r.mode.mode, 'separe');
  assert.strictEqual(r.mode.propHint, '');                        // propriété false + parent séparé : cohérent, aucun avertissement
});

test('détection : chiffres incompatibles => indéterminé, pas de verdict', async () => {
  const r = await D.analyze(nodes(), makeIO(subScenario('autre')));
  assert.strictEqual(r.mode.mode, 'indetermine');
  assert.strictEqual(r.mode.confidence, 'faible');
});

test('détection : sous-projet sans dépense => indéterminé', async () => {
  const d = subScenario('separe');
  d.fm_expense_line = d.fm_expense_line.filter((l) => l.source_id.value !== 'TS1' && l.source_id.value !== 'S');
  d.pm_project = [{ sys_id: f('P'), actual_cost_project_currency: wcField('3000') }, { sys_id: f('S'), actual_cost_project_currency: wcField('0') }];
  const r = await D.analyze(nodes(), makeIO(d));
  assert.strictEqual(r.mode.mode, 'indetermine');
});

test('détection : devises différentes => aucun verdict', async () => {
  const d = subScenario('separe');
  d.pm_project = [{ sys_id: f('P'), actual_cost_project_currency: wcField('3000', 'USD') }, { sys_id: f('S'), actual_cost_project_currency: wcField('2000', 'EUR') }];
  const r = await D.analyze(nodes(), makeIO(d));
  assert.strictEqual(r.mode.mode, 'indetermine');
  assert.match(r.mode.text, /devise/);
});

test('détection : lecture partielle => aucun verdict', async () => {
  const d = subScenario('copie'); d.partial = ['fm_expense_line'];
  const r = await D.analyze(nodes(), makeIO(d));
  assert.strictEqual(r.mode.mode, 'indetermine');
  assert.strictEqual(r.partial, true);
});

test('sys_properties illisible ou vide : le verdict repose sur les chiffres', async () => {
  const d = subScenario('calcul'); d.fail = ['sys_properties'];
  const r = await D.analyze(nodes(), makeIO(d));
  assert.strictEqual(r.props, null);
  assert.strictEqual(r.mode.mode, 'inclus_calcul');
  assert.match(r.mode.propHint, /illisibles/);
});

test('work_cost sans currency_display_value => null, pas de verdict', async () => {
  const d = subScenario('calcul');
  d.pm_project = [{ sys_id: f('P'), actual_cost_project_currency: { value: 'c084dcd5fb3c5b10d9ddf5028eefdcfc', display_value: '' } }, { sys_id: f('S'), actual_cost_project_currency: wcField('2000') }];
  const r = await D.analyze(nodes(), makeIO(d));
  assert.strictEqual(r.wc.P.amt, null);
  assert.strictEqual(r.mode.mode, 'indetermine');
});

test('copie dont l\'origine est introuvable : classée « introuvable », jamais attribuée à un sous-projet', async () => {
  const d = subScenario('separe');
  d.fm_expense_line.push(line({ id: 'x', src: 'P', amt: 10, base: 'ZZZ' }));
  const r = await D.analyze(nodes(), makeIO(d));
  assert.strictEqual(r.stats.P.nCopyUnknown, 1);
  assert.strictEqual(r.stats.P.nCopyFromSub, 0);
});

test('currency2 : lit currency_display_value, jamais .value (sys_id)', () => {
  assert.deepStrictEqual(D.cur2(wcField('2000')), { cur: 'USD', amt: 2000 });
  assert.strictEqual(D.cur2({ value: '8884dcd5fb3c5b10d9ddf5028eefdcfc', display_value: '' }), null);
});

test('decimal : "2,000" en display_value ne casse pas la lecture (.value utilisé)', () => {
  const l = D.normLine(line({ id: 'z', src: 'P', amt: 2000 }));
  assert.strictEqual(l.amt, 2000);
});

test('breakdowns : task = Σ requirement par période et type de dépense, 2 plans', () => {
  const bd = (type, plan, per, et, cost, act) => ({ breakdown_type: f(type), cost_plan: f(plan), task: f('P'), fiscal_period: f(per, 'FY26 ' + per), expense_type: f(et),
    cost_project_currency: f(cost), actual_cost_project_currency: f(act) });
  const rows = [
    bd('requirement', 'CP1', 'M11', 'opex', 4000, 2000), bd('requirement', 'CP2', 'M11', 'opex', 1000, 500),
    bd('task', '', 'M11', 'opex', 5000, 2500),
    bd('requirement', 'CP1', 'M12', 'opex', 4000, 0), bd('task', '', 'M12', 'opex', 4000, 0),
    bd('requirement', 'CP3', 'M12', 'capex', 300, 0), bd('task', '', 'M12', 'capex', 250, 0),
    bd('program', '', 'M12', 'opex', 999, 999)
  ];
  const g = D.groupBreakdowns(rows, { M11: { start: '2026-11-01', end: '2026-11-30' }, M12: { start: '2026-12-01', end: '2026-12-31' } });
  assert.strictEqual(g.length, 3);                               // M11/opex, M12/opex, M12/capex ; la ligne program est ignorée
  const m11 = g.find((x) => x.periodId === 'M11');
  assert.strictEqual(m11.reqCost, 5000); assert.strictEqual(m11.taskCost, 5000); assert.strictEqual(m11.diffCost, 0);
  assert.strictEqual(m11.diffActual, 0);
  const capex = g.find((x) => x.etype === 'capex');
  assert.strictEqual(capex.diffCost, -50);                       // écart affiché, aucun verdict
});

test('dépenses par période : copies et Pending exclues', () => {
  const scope = D.buildScope(nodes());
  const L = [line({ id: 'a', src: 'T1', amt: 100, date: '2026-11-05' }), line({ id: 'b', src: 'P', amt: 100, base: 'a', date: '2026-11-05' }),
    line({ id: 'c', src: 'T1', amt: 50, state: 'pending', date: '2026-11-06' }), line({ id: 'd', src: 'T1', amt: 7, date: '2026-12-02' })].map(D.normLine);
  D.classify(L, scope);
  assert.strictEqual(D.expenseInPeriod(L, 'P', '2026-11-01', '2026-11-30'), 100);
  assert.strictEqual(D.expenseInPeriod(L, 'P', '', ''), null);
});

test('périmètre : ancêtres exclus, tâches rattachées à leur projet', () => {
  const sc = D.buildScope(nodes());
  assert.strictEqual(sc.root, 'P');
  assert.deepStrictEqual(sc.subs, ['S']);
  assert.strictEqual(sc.ownerOf.T11, 'P'); assert.strictEqual(sc.ownerOf.TS1, 'S');
  assert.ok(!sc.ids.includes('A'));
});
