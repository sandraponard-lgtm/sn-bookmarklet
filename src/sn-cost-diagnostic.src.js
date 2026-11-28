/* sn-cost-diagnostic — Diagnostic des coûts d'un projet (module chargé depuis Project Navigator)
 * Source lisible ; le fichier servi est sn-cost-diagnostic.js (minifié, voir CONTEXT.md).
 *
 * Contenu :
 *  1. Mode « sous-projets » détecté sur l'instance (propriétés + test empirique sur les dépenses du projet ouvert).
 *  2. Pont de réconciliation : de la somme brute des lignes de dépense au work_cost, avec les causes d'écart connues.
 *  3. Breakdowns par période et par type de dépense (BÊTA : chiffres bruts, aucun verdict automatique).
 * Lecture seule : aucune écriture sur l'instance. */
(function () {
  'use strict';
  var VER = 'v2026-11-28.1';
  var TOL = 0.01;                 /* tolérance d'arrondi, en devise projet */
  var PAGE = 500, MAXPAGES = 40, CHUNK = 150;
  var PROPS = ['com.snc.project.rollup.cost', 'glide.cost_mgmt.process_task_top_task', 'glide.cost_mgmt.calc_actual_cost'];
  var ID = 'snfus-diag-overlay', CSSID = 'snfus-diag-style';

  /* ---------- Lecture des valeurs de l'API (sysparm_display_value=all) ---------- */
  function val(f) { return f && typeof f === 'object' ? (f.value == null ? '' : f.value) : (f == null ? '' : f); }
  function dsp(f) { return f && typeof f === 'object' ? (f.display_value == null ? '' : f.display_value) : (f == null ? '' : f); }
  function num(v) { var x = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isNaN(x) ? 0 : x; }
  function dec(f) { return num(val(f)); }                       /* champ decimal : .value est le nombre */
  function cur2(f) {                                            /* champ currency2 : .value est un sys_id, le nombre est dans currency_display_value */
    var c = f && typeof f === 'object' ? f.currency_display_value : null;
    if (c && c.indexOf(';') >= 0) { var p = c.split(';'); return { cur: p[0], amt: num(p[1]) }; }
    return null;
  }
  function chunks(a, n) { var o = []; for (var i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
  function enc(s) { return encodeURIComponent(s); }
  function near(a, b) { return Math.abs(a - b) <= TOL; }

  /* ---------- Périmètre : projet ouvert, sous-projets, tâches (depuis window._snfusNodes) ---------- */
  function buildScope(nodes) {
    var list = Object.keys(nodes || {}).map(function (k) { return nodes[k]; }).filter(function (n) { return !n.isAnc; });
    var root = null;
    list.forEach(function (n) { if (n.isRoot) root = n; });
    if (!root) return null;
    function owner(n) {
      var g = 0;
      while (n && !n.isProject && g++ < 100) n = nodes[n.parent];
      return n && n.isProject ? n.sys_id : null;
    }
    var ownerOf = {}, label = {};
    list.forEach(function (n) { ownerOf[n.sys_id] = owner(n); if (n.isProject) label[n.sys_id] = n.number || n.sys_id; });
    var subs = list.filter(function (n) { return n.isProject && !n.isRoot; }).map(function (n) { return n.sys_id; });
    return { root: root.sys_id, rootNumber: root.number || '', subs: subs, projects: [root.sys_id].concat(subs),
      ids: list.map(function (n) { return n.sys_id; }), ownerOf: ownerOf, label: label };
  }

  /* ---------- Lignes de dépense ---------- */
  function normLine(r) {
    return {
      id: String(val(r.sys_id)), number: String(val(r.number)), src: String(val(r.source_id)), task: String(val(r.task)),
      state: String(val(r.state)).toLowerCase(), amt: dec(r.amount_project_currency), base: String(val(r.base_expense)),
      tc: String(val(r.time_card)), recalled: String(val(r.recalled)) === 'true', plan: String(val(r.cost_plan)),
      etype: String(val(r.expense_type)).toLowerCase(), date: String(val(r.date))
    };
  }

  /* Rattache chaque copie remontée à sa ligne d'origine (chaîne base_expense) et au projet propriétaire de l'origine. */
  function classify(lines, scope) {
    var byId = {};
    lines.forEach(function (l) { byId[l.id] = l; });
    lines.forEach(function (l) {
      l.owner = scope.ownerOf[l.src] || null;
      l.counted = l.state !== 'pending';
      l.isCopy = !!l.base;
      l.origin = null; l.originOwner = null;
      if (l.isCopy) {
        var c = l, g = 0;
        while (c && c.base && byId[c.base] && g++ < 10) c = byId[c.base];
        if (c && c !== l && !c.base) { l.origin = c; l.originOwner = scope.ownerOf[c.src] || null; }
      }
    });
    return byId;
  }

  /* Statistiques par projet du périmètre : lignes portées par le projet (source_id = projet) et par ses tâches. */
  function projectStats(lines, scope) {
    var st = {};
    scope.projects.forEach(function (p) {
      st[p] = { sumAt: 0, nAt: 0, own: 0, nOwn: 0, copies: 0, nCopies: 0, copyFromTasks: 0, nCopyFromTasks: 0, copyFromSub: 0, nCopyFromSub: 0,
        copyUnknown: 0, nCopyUnknown: 0, neg: 0, nNeg: 0, recalled: 0, nRecalled: 0, noPlan: 0, nNoPlan: 0,
        pending: 0, nPending: 0, tasksSum: 0, nTasks: 0, rawAt: 0 };
    });
    lines.forEach(function (l) {
      var atProject = st[l.src], s = atProject || st[l.owner];
      if (!s) return;
      if (!l.counted) { s.pending += l.amt; s.nPending++; if (atProject) s.rawAt += l.amt; return; }
      if (!atProject) { s.tasksSum += l.amt; s.nTasks++; return; }
      s.rawAt += l.amt; s.sumAt += l.amt; s.nAt++;
      if (l.amt < 0) { s.neg += l.amt; s.nNeg++; }
      if (l.recalled) { s.recalled += l.amt; s.nRecalled++; }
      if (!l.plan) { s.noPlan += l.amt; s.nNoPlan++; }
      if (!l.isCopy) { s.own += l.amt; s.nOwn++; return; }
      s.copies += l.amt; s.nCopies++;
      if (l.origin && l.originOwner === l.src) { s.copyFromTasks += l.amt; s.nCopyFromTasks++; }
      else if (l.origin && scope.subs.indexOf(l.originOwner) >= 0) { s.copyFromSub += l.amt; s.nCopyFromSub++; }
      else { s.copyUnknown += l.amt; s.nCopyUnknown++; }
    });
    return st;
  }

  /* ---------- Détection du mode « sous-projets » ----------
   * Entrées : work_cost du projet ouvert (devise projet), somme des lignes qu'il porte, copies venant de sous-projets,
   * somme des work_cost des sous-projets. Aucune supposition : le verdict ne se fonde que sur les chiffres observés. */
  function detectMode(i) {
    var out = { mode: 'indetermine', confidence: 'faible', text: '', details: i };
    if (!i.subs.length) {
      out.mode = 'sans_sous_projet';
      out.text = 'Ce projet n\'a pas de sous-projet : le mode ne peut pas être déterminé ici. Ouvrez un projet qui en a pour le détecter.';
      return out;
    }
    if (i.wcRoot == null || i.wcSubs == null) {
      out.text = 'work_cost illisible (champ currency2 sans valeur) : verdict impossible.';
      return out;
    }
    if (i.currencies.length > 1) {
      out.text = 'Les sous-projets n\'ont pas tous la même devise projet (' + i.currencies.join(', ') + ') : comparaison non fiable, aucun verdict.';
      return out;
    }
    if (i.partial) {
      out.text = 'Lecture partielle des lignes de dépense (limite de pages atteinte) : verdict non fiable.';
      return out;
    }
    if (i.wcSubs <= TOL && i.nCopyFromSub === 0) {
      out.text = 'Les sous-projets n\'ont pas de dépense comptée : rien à observer. Essayez avec un projet dont un sous-projet a des dépenses.';
      return out;
    }
    if (i.nCopyFromSub > 0 && near(i.wcRoot, i.sumAtRoot)) {
      out.mode = 'inclus_copie'; out.confidence = 'élevée';
      out.text = 'Le parent cumule les dépenses des sous-projets par copie de lignes (' + i.nCopyFromSub + ' ligne(s) copiée(s) depuis un sous-projet) et son work_cost correspond à ses lignes. Ne pas ajouter les sous-projets au total du parent.';
      return out;
    }
    if (i.nCopyFromSub === 0 && i.wcSubs > TOL && near(i.wcRoot, i.sumAtRoot + i.wcSubs)) {
      out.mode = 'inclus_calcul'; out.confidence = 'élevée';
      out.text = 'Le work_cost du parent = ses lignes + le work_cost des sous-projets, sans copie de lignes : le cumul est calculé. Ne pas ajouter les sous-projets au total du parent.';
      return out;
    }
    if (i.nCopyFromSub === 0 && i.wcSubs > TOL && near(i.wcRoot, i.sumAtRoot)) {
      out.mode = 'separe'; out.confidence = 'élevée';
      out.text = 'Le work_cost du parent ne contient que ses propres lignes : les sous-projets ne sont pas inclus. Pour un total consolidé, il faut ajouter le work_cost des sous-projets.';
      return out;
    }
    out.text = 'Les chiffres ne correspondent à aucun des trois modèles connus (écart work_cost parent − lignes parent = ' + (i.wcRoot - i.sumAtRoot).toFixed(2) + '). Aucun verdict : voir le pont ci-dessous.';
    return out;
  }

  /* Cohérence entre le verdict et les propriétés lues (indice, jamais une preuve). */
  function propHint(props, mode) {
    if (!props) return 'Propriétés système illisibles avec ce compte (droits) : le verdict repose uniquement sur les chiffres.';
    var r = props['com.snc.project.rollup.cost'], t = props['glide.cost_mgmt.process_task_top_task'], m = [];
    if (r === undefined && t === undefined) return 'Propriétés système absentes ou non visibles pour ce compte : le verdict repose uniquement sur les chiffres.';
    if (r === 'false' && (mode === 'inclus_copie' || mode === 'inclus_calcul')) m.push('com.snc.project.rollup.cost = false alors que le cumul est observé : propriété peut-être modifiée après la création des données.');
    if (r === 'true' && mode === 'separe') m.push('com.snc.project.rollup.cost = true alors que le parent n\'inclut pas les sous-projets : à investiguer.');
    if (t === 'true' && mode === 'separe') m.push('glide.cost_mgmt.process_task_top_task = true : les copies vers la top task sont attendues.');
    return m.join(' ');
  }

  /* ---------- Breakdowns : regroupement brut par projet × période × type de dépense ---------- */
  function groupBreakdowns(rows, periods) {
    var map = {}, order = [];
    rows.forEach(function (r) {
      var proj = String(val(r.task)), per = String(dsp(r.fiscal_period) || val(r.fiscal_period)), pid = String(val(r.fiscal_period));
      var et = String(val(r.expense_type)).toLowerCase(), typ = String(val(r.breakdown_type)).toLowerCase();
      if (typ !== 'requirement' && typ !== 'task') return;
      var k = proj + '|' + pid + '|' + et;
      if (!map[k]) { map[k] = { proj: proj, period: per, periodId: pid, etype: et, reqCost: 0, reqActual: 0, nReq: 0, taskCost: 0, taskActual: 0, nTask: 0 }; order.push(k); }
      var g = map[k];
      if (typ === 'requirement') { g.reqCost += dec(r.cost_project_currency); g.reqActual += dec(r.actual_cost_project_currency); g.nReq++; }
      else { g.taskCost += dec(r.cost_project_currency); g.taskActual += dec(r.actual_cost_project_currency); g.nTask++; }
    });
    return order.map(function (k) {
      var g = map[k], p = periods && periods[g.periodId];
      g.start = p ? p.start : ''; g.end = p ? p.end : '';
      g.diffCost = g.taskCost - g.reqCost; g.diffActual = g.taskActual - g.reqActual;
      return g;
    }).sort(function (a, b) { return (a.proj === b.proj ? 0 : (a.proj < b.proj ? -1 : 1)) || (a.start || a.period).localeCompare(b.start || b.period) || a.etype.localeCompare(b.etype); });
  }

  /* Somme des dépenses comptées, hors copies, d'un projet (lignes propres + de ses tâches) dans une période. */
  function expenseInPeriod(lines, projId, start, end) {
    if (!start || !end) return null;
    var s = 0;
    lines.forEach(function (l) {
      if (!l.counted || l.isCopy || l.owner !== projId || !l.date) return;
      if (l.date >= start && l.date <= end) s += l.amt;
    });
    return s;
  }

  /* ---------- Analyse (io = { rows(url) -> {rows,total,partial}, status(msg) }) ---------- */
  var LINE_FIELDS = 'sys_id,number,source_id,task,state,amount_project_currency,base_expense,time_card,recalled,cost_plan,expense_type,date';

  async function readProps(io) {
    try {
      var r = await io.rows('/api/now/table/sys_properties?sysparm_query=' + enc('nameIN' + PROPS.join(',')) + '&sysparm_fields=name,value');
      if (!r.rows.length) return null;
      var o = {};
      r.rows.forEach(function (x) { o[String(val(x.name))] = String(val(x.value)).toLowerCase(); });
      return o;
    } catch (e) { return null; }
  }

  async function readWorkCosts(io, ids) {
    var out = {};
    for (var c of chunks(ids, CHUNK)) {
      var r = await io.rows('/api/now/table/pm_project?sysparm_query=' + enc('sys_idIN' + c.join(',') + '^ORDERBYsys_id') + '&sysparm_fields=sys_id,number,actual_cost_project_currency,project_currency&sysparm_display_value=all');
      r.rows.forEach(function (x) {
        var a = cur2(x.actual_cost_project_currency);
        out[String(val(x.sys_id))] = { number: String(val(x.number)), amt: a ? a.amt : null, cur: a ? a.cur : String(val(x.project_currency)) };
      });
    }
    return out;
  }

  async function readLines(io, scope) {
    var all = [], partial = false, k = 0, parts = chunks(scope.ids, CHUNK);
    for (var c of parts) {
      io.status('Lignes de dépense… lot ' + (++k) + '/' + parts.length);
      var r = await io.rows('/api/now/table/fm_expense_line?sysparm_query=' + enc('source_idIN' + c.join(',') + '^ORDERBYsys_id') + '&sysparm_fields=' + LINE_FIELDS + '&sysparm_display_value=all');
      if (r.partial) partial = true;
      all = all.concat(r.rows.map(normLine));
    }
    return { lines: all, partial: partial };
  }

  async function readPlans(io, scope) {
    var plans = [], bds = [], partial = false;
    for (var c of chunks(scope.projects, CHUNK)) {
      var q = enc('taskIN' + c.join(',') + '^ORDERBYsys_id');
      var a = await io.rows('/api/now/table/cost_plan?sysparm_query=' + q + '&sysparm_fields=sys_id,name,task,expense_type,actual_cost_project_currency,cost_project_currency&sysparm_display_value=all');
      var b = await io.rows('/api/now/table/cost_plan_breakdown?sysparm_query=' + q + '&sysparm_fields=sys_id,breakdown_type,cost_plan,task,fiscal_period,expense_type,cost_project_currency,actual_cost_project_currency&sysparm_display_value=all');
      if (a.partial || b.partial) partial = true;
      plans = plans.concat(a.rows); bds = bds.concat(b.rows);
    }
    return { plans: plans, bds: bds, partial: partial };
  }

  async function readPeriods(io, bds) {
    var ids = {};
    bds.forEach(function (r) { var p = String(val(r.fiscal_period)); if (p) ids[p] = 1; });
    var list = Object.keys(ids), out = {};
    if (!list.length) return out;
    try {
      for (var c of chunks(list, CHUNK)) {
        var r = await io.rows('/api/now/table/fiscal_period?sysparm_query=' + enc('sys_idIN' + c.join(',')) + '&sysparm_fields=sys_id,start_date,end_date');
        r.rows.forEach(function (x) { out[String(val(x.sys_id))] = { start: String(val(x.start_date)).slice(0, 10), end: String(val(x.end_date)).slice(0, 10) }; });
      }
    } catch (e) { return {}; }
    return out;
  }

  async function analyze(nodes, io) {
    var scope = buildScope(nodes);
    if (!scope) throw new Error('Chargez d\'abord la hiérarchie et ouvrez un projet.');
    io.status('Propriétés système…');
    var props = await readProps(io);
    io.status('work_cost des projets…');
    var wc = await readWorkCosts(io, scope.projects);
    var rl = await readLines(io, scope);
    classify(rl.lines, scope);
    var st = projectStats(rl.lines, scope);
    io.status('Cost plans et breakdowns…');
    var pl = await readPlans(io, scope);
    var periods = await readPeriods(io, pl.bds);

    var root = scope.root, w = wc[root] || {};
    var subs = scope.subs, wcSubs = 0, wcSubsOk = true, cur = {};
    if (w.cur) cur[w.cur] = 1;
    subs.forEach(function (s) { var x = wc[s]; if (!x || x.amt == null) { wcSubsOk = false; return; } wcSubs += x.amt; if (x.cur) cur[x.cur] = 1; });
    var mode = detectMode({
      subs: subs, wcRoot: w.amt == null ? null : w.amt, wcSubs: wcSubsOk ? wcSubs : null, sumAtRoot: st[root].sumAt,
      nCopyFromSub: st[root].nCopyFromSub, currencies: Object.keys(cur), partial: rl.partial
    });
    mode.propHint = propHint(props, mode.mode);

    var groups = groupBreakdowns(pl.bds, periods).map(function (g) {
      g.exp = expenseInPeriod(rl.lines, g.proj, g.start, g.end);
      return g;
    });
    var cpActual = {}, bdActual = {};
    pl.plans.forEach(function (p) { var t = String(val(p.task)); cpActual[t] = (cpActual[t] || 0) + dec(p.actual_cost_project_currency); });
    pl.bds.forEach(function (r) {
      if (String(val(r.breakdown_type)).toLowerCase() !== 'requirement') return;
      var t = String(val(r.task)); bdActual[t] = (bdActual[t] || 0) + dec(r.actual_cost_project_currency);
    });
    return {
      ver: VER, ts: new Date().toISOString(), scope: scope, props: props, wc: wc, stats: st, mode: mode, groups: groups,
      cpActual: cpActual, bdActual: bdActual, currency: w.cur || '', nLines: rl.lines.length,
      partial: rl.partial || pl.partial, hasPeriods: Object.keys(periods).length > 0
    };
  }

  var API = { buildScope: buildScope, normLine: normLine, classify: classify, projectStats: projectStats, detectMode: detectMode,
    propHint: propHint, groupBreakdowns: groupBreakdowns, expenseInPeriod: expenseInPeriod, analyze: analyze, cur2: cur2, VER: VER };
  if (typeof module !== 'undefined' && module.exports) { module.exports = API; return; }
  if (typeof document === 'undefined') return;

  /* ====================== Interface ====================== */
  var old = document.getElementById(ID);
  if (old) { old._close && old._close(); return; }

  var NF = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function fm(n) { return n == null ? '—' : NF.format(n); }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'cls') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function token() {
    try { return (window.top && window.top.g_ck) || window.g_ck || ''; } catch (e) { return window.g_ck || ''; }
  }
  function realIO(statusEl) {
    function get(u) {
      var hd = { Accept: 'application/json' }, t = token();
      if (t) hd['X-UserToken'] = t;
      return fetch(u, { headers: hd, credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + u.split('?')[0]);
        return r.json().then(function (j) { return { j: j, total: parseInt(r.headers.get('X-Total-Count') || '0', 10) || 0 }; });
      });
    }
    return {
      status: function (m) { statusEl.textContent = m; },
      rows: async function (u) {
        var all = [], off = 0, total = 0, partial = false;
        for (var p = 0; p < MAXPAGES; p++) {
          var r = await get(u + '&sysparm_limit=' + PAGE + '&sysparm_offset=' + off), x = r.j.result || [];
          total = r.total || total; all = all.concat(x); off += x.length;
          if (!x.length || (total ? off >= total : x.length < PAGE)) return { rows: all, total: total, partial: false };
        }
        partial = true;
        return { rows: all, total: total, partial: partial };
      }
    };
  }

  function csv(rows) {
    return '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
  }
  function download(name, text) {
    var a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })), download: name });
    document.body.appendChild(a); a.click(); a.remove();
  }
  function table(head, body, cls, strCols) {
    return h('table', { cls: 'snd-t ' + (cls || '') }, [
      h('thead', null, [h('tr', null, head.map(function (x) { return h('th', { text: x }); }))]),
      h('tbody', null, body.map(function (r) {
        return h('tr', r.cls ? { cls: r.cls } : null, r.cells.map(function (c, i) {
          var isNum = typeof c === 'number', td = h('td', { text: isNum ? fm(c) : (c == null ? '—' : String(c)) });
          if (isNum || (strCols && strCols.indexOf(i) >= 0)) td.className = 'n';
          return td;
        }));
      }))
    ]);
  }

  function render(body, res) {
    body.textContent = '';
    var sc = res.scope, st = res.stats, root = sc.root, s = st[root], cur = res.currency ? ' (' + res.currency + ')' : '';
    var lab = function (id) { return sc.label[id] || id.slice(0, 8); };
    var m = res.mode, tone = { inclus_copie: 'ok', inclus_calcul: 'ok', separe: 'ok', indetermine: 'warn', sans_sous_projet: 'info' }[m.mode] || 'warn';
    var names = { inclus_copie: 'Parent cumulatif (copies de lignes)', inclus_calcul: 'Parent cumulatif (calculé)', separe: 'Parent séparé : sous-projets non inclus', indetermine: 'Mode indéterminé', sans_sous_projet: 'Pas de sous-projet' };
    window.snfusSubMode = { mode: m.mode, confidence: m.confidence, root: root, at: res.ts };

    body.appendChild(h('div', { cls: 'snd-band ' + tone }, [
      h('b', { text: 'Sous-projets : ' + names[m.mode] + (m.mode === 'indetermine' || m.mode === 'sans_sous_projet' ? '' : ' — confiance ' + m.confidence) }),
      h('div', { text: m.text }),
      m.propHint ? h('div', { cls: 'sm', text: m.propHint }) : null,
      res.props ? h('div', { cls: 'sm', text: PROPS.map(function (p) { return p + ' = ' + (res.props[p] === undefined ? 'absente' : res.props[p]); }).join(' · ') }) : null,
      res.partial ? h('div', { cls: 'sm warn', text: '⚠ Lecture partielle (limite de ' + MAXPAGES * PAGE + ' lignes par requête atteinte) : totaux incomplets.' }) : null
    ]));

    body.appendChild(h('h3', { text: 'Pont de réconciliation — ' + lab(root) + cur }));
    var wcRoot = res.wc[root] ? res.wc[root].amt : null;
    var rows = [
      { cells: ['Lignes de dépense portées par le projet (hors Pending)', String(s.nAt), s.sumAt] },
      { cells: ['  dont lignes propres (non copiées)', String(s.nOwn), s.own] },
      { cells: ['  dont copies remontées depuis ses tâches', String(s.nCopyFromTasks), s.copyFromTasks] },
      { cells: ['  dont copies remontées depuis des sous-projets', String(s.nCopyFromSub), s.copyFromSub] },
      { cells: ['  dont copies d\'origine introuvable', String(s.nCopyUnknown), s.copyUnknown] },
      { cells: ['Lignes portées par ses tâches (hors Pending)', String(s.nTasks), s.tasksSum] },
      { cells: ['Lignes Pending (exclues des totaux)', String(s.nPending), s.pending] },
      { cells: ['Lignes négatives incluses (recall)', String(s.nNeg), s.neg] },
      { cells: ['Lignes marquées recalled', String(s.nRecalled), s.recalled] },
      { cells: ['Lignes sans cost plan', String(s.nNoPlan), s.noPlan] },
      { cls: 'tot', cells: ['work_cost du projet (champ en cache)', '', wcRoot] },
      { cls: 'tot', cells: ['Écart work_cost − lignes portées par le projet', '', wcRoot == null ? null : wcRoot - s.sumAt] },
      { cells: ['Σ cost plans : réel (actual_cost_project_currency)', '', res.cpActual[root] == null ? null : res.cpActual[root]] },
      { cells: ['Σ breakdowns requirement : réel', '', res.bdActual[root] == null ? null : res.bdActual[root]] }
    ];
    body.appendChild(table(['Poste', 'Lignes', 'Montant' + cur], rows, 'bridge', [1]));
    body.appendChild(h('p', { cls: 'sm', text: 'Les copies remontées dupliquent le montant d\'une ligne d\'origine : elles ne s\'additionnent jamais avec elle. Les lignes Pending sont exclues comme dans la réconciliation.' }));

    if (sc.subs.length) {
      body.appendChild(h('h3', { text: 'Par projet du périmètre' + cur }));
      var pr = sc.projects.map(function (p) {
        var x = st[p], w = res.wc[p];
        return { cells: [lab(p) + (p === root ? ' (ouvert)' : ''), w ? w.amt : null, x.sumAt, x.copies, x.tasksSum, x.pending, res.cpActual[p] == null ? null : res.cpActual[p], res.bdActual[p] == null ? null : res.bdActual[p]] };
      });
      body.appendChild(table(['Projet', 'work_cost', 'Lignes portées', 'dont copies', 'Lignes des tâches', 'Pending', 'CP réel', 'Breakdown réel'], pr));
    }

    var tit = h('h3', null, [document.createTextNode('Breakdowns par période et type de dépense '), h('span', { cls: 'beta', text: 'BÊTA' })]);
    body.appendChild(tit);
    body.appendChild(h('p', { cls: 'sm', text: 'Chiffres bruts, sans verdict. « Écart » = ligne de type task − Σ lignes de type requirement ; « Dépenses » = lignes comptées non copiées dont la date est dans la période' + (res.hasPeriods ? '.' : ' (dates de période illisibles : colonne vide).') }));
    if (!res.groups.length) body.appendChild(h('p', { text: 'Aucun breakdown de type requirement ou task trouvé pour ce périmètre.' }));
    else {
      var gr = res.groups.map(function (g) {
        return { cells: [lab(g.proj), g.period, g.etype || '—', g.reqCost, g.reqActual, g.taskCost, g.taskActual, String(g.nTask), g.diffCost, g.diffActual, g.exp] };
      });
      var head = ['Projet', 'Période', 'Type dépense', 'Req. prévu', 'Req. réel', 'Task prévu', 'Task réel', 'Lignes task', 'Écart prévu', 'Écart réel', 'Dépenses'];
      body.appendChild(table(head, gr, '', [7]));
      body.appendChild(h('button', { cls: 'btn', text: 'Exporter les breakdowns (CSV)', onclick: function () {
        download('breakdowns-' + lab(root) + '.csv', csv([head].concat(gr.map(function (r) { return r.cells; }))));
      } }));
    }
    body.appendChild(h('p', { cls: 'sm', text: 'Diagnostic ' + res.ver + ' · ' + res.nLines + ' lignes de dépense lues · ' + new Date(res.ts).toLocaleString('fr-FR') + ' · lecture seule.' }));
  }

  var CSS = '#' + ID + '{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:flex-start;justify-content:center;font:13px/1.4 system-ui,Segoe UI,Arial,sans-serif;color:#111827}' +
    '#' + ID + ' .snd-box{background:#fff;margin:24px;max-width:1180px;width:100%;max-height:calc(100vh - 48px);overflow:auto;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.35)}' +
    '#' + ID + ' .snd-hd{position:sticky;top:0;background:#fff;border-bottom:1px solid #E5E7EB;padding:10px 16px;display:flex;gap:10px;align-items:center;z-index:1}' +
    '#' + ID + ' .snd-hd b{font-size:15px;flex:1}#' + ID + ' .snd-bd{padding:8px 16px 16px}' +
    '#' + ID + ' h3{margin:16px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#374151}' +
    '#' + ID + ' .btn{border:1px solid #6366F1;color:#4338CA;background:#EEF2FF;border-radius:5px;padding:4px 10px;cursor:pointer;font-size:12px;margin-top:6px}' +
    '#' + ID + ' .snd-band{border-left:4px solid #9CA3AF;background:#F3F4F6;padding:8px 12px;border-radius:4px;margin-top:8px}' +
    '#' + ID + ' .snd-band.ok{border-color:#16A34A;background:#F0FDF4}#' + ID + ' .snd-band.warn{border-color:#D97706;background:#FFFBEB}#' + ID + ' .snd-band.info{border-color:#2563EB;background:#EFF6FF}' +
    '#' + ID + ' .sm{font-size:11px;color:#4B5563;margin:4px 0}#' + ID + ' .sm.warn{color:#B45309}' +
    '#' + ID + ' .snd-t{border-collapse:collapse;width:100%;margin-top:4px}#' + ID + ' .snd-t th,#' + ID + ' .snd-t td{border-bottom:1px solid #E5E7EB;padding:3px 8px;text-align:left;font-size:12px;white-space:pre}' +
    '#' + ID + ' .snd-t th{background:#F9FAFB;position:sticky;top:0}#' + ID + ' .snd-t td.n{text-align:right;font-variant-numeric:tabular-nums}#' + ID + ' .snd-t tr.tot td{font-weight:700;background:#F9FAFB}' +
    '#' + ID + ' .beta{background:#FEF3C7;color:#92400E;border-radius:4px;padding:1px 6px;font-size:10px;vertical-align:middle}';

  if (!document.getElementById(CSSID)) { var st0 = h('style', { id: CSSID, text: CSS }); document.head.appendChild(st0); }
  var statusEl = h('span', { cls: 'sm', text: '' });
  var bodyEl = h('div', { cls: 'snd-bd' });
  var ov = h('div', { id: ID });
  function close() { ov.remove(); var s0 = document.getElementById(CSSID); if (s0) s0.remove(); document.removeEventListener('keydown', onKey, true); }
  function onKey(e) { if (e.key === 'Escape') close(); }
  ov._close = close;
  document.addEventListener('keydown', onKey, true);
  ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });

  var cache = window._snfusDiagCache || (window._snfusDiagCache = {});
  async function run(force) {
    var nodes = window._snfusNodes;
    bodyEl.textContent = '';
    if (!nodes || !Object.keys(nodes).length) { bodyEl.appendChild(h('p', { text: 'Chargez d\'abord la hiérarchie du projet.' })); return; }
    var sc = buildScope(nodes);
    if (!sc) { bodyEl.appendChild(h('p', { text: 'Projet racine introuvable dans la hiérarchie chargée.' })); return; }
    if (!force && cache[sc.root]) { render(bodyEl, cache[sc.root]); statusEl.textContent = 'résultat en cache'; return; }
    bodyEl.appendChild(h('p', { text: 'Analyse en cours…' }));
    try {
      var res = await analyze(nodes, realIO(statusEl));
      cache[sc.root] = res; render(bodyEl, res); statusEl.textContent = '';
    } catch (e) {
      bodyEl.textContent = '';
      bodyEl.appendChild(h('p', { text: 'Erreur : ' + (e && e.message ? e.message : e) }));
      console.error('[snfus diag]', e);
    }
  }
  ov.appendChild(h('div', { cls: 'snd-box' }, [
    h('div', { cls: 'snd-hd' }, [h('b', { text: 'Diagnostic des coûts ' + VER }), statusEl,
      h('button', { cls: 'btn', text: 'Recalculer', onclick: function () { run(true); } }),
      h('button', { cls: 'btn', text: 'Fermer', onclick: close })]),
    bodyEl
  ]));
  document.body.appendChild(ov);
  run(false);
})();
