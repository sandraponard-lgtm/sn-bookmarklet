/* sn-user-resources — Utilisateur (refonte sur le modèle de Project Navigator)
 * Source lisible ; le fichier servi est sn-user-resources.js (minifié : npm run build ou voir CONTEXT.md). */
(function () {
  'use strict';
  var VER = 'v2026-11-27.2';
  var ID = 'snus-overlay', CSSID = 'snus-style', LS = 'snus.v1';
  var old = document.getElementById(ID);
  if (old) { old._close && old._close(); return; }

  /* ---------- Utilitaires ---------- */
  var NF = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var NF0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  var HEX32 = /^[0-9a-f]{32}$/i;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pd(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function addD(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function mondayOf(d) { return addD(d, -((d.getDay() + 6) % 7)); }
  function frDate(s) { return s ? s.split('-').reverse().join('-') : ''; }
  function num(v) { var x = parseFloat(v); return isNaN(x) ? 0 : x; }
  function enc(s) { return encodeURIComponent(s); }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'cls') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function sv(o) { return o && typeof o === 'object' ? (o.value == null ? '' : String(o.value)) : (o == null ? '' : String(o)); }
  function dv(o) { return o && typeof o === 'object' ? (o.display_value == null ? '' : String(o.display_value)) : (o == null ? '' : String(o)); }

  /* ---------- Préférences (localStorage, jamais bloquant) ---------- */
  var P = { tab: 'ov', preset: 'cur', from: '', to: '', unit: 'h', costs: true, force: false };
  try { var raw = localStorage.getItem(LS); if (raw) Object.assign(P, JSON.parse(raw)); } catch (e) {}
  function save() { try { localStorage.setItem(LS, JSON.stringify(P)); } catch (e) {} }

  /* ---------- Authentification et détection ---------- */
  function wins() {
    var w = [window];
    try {
      var f = (function find(root, sel) {
        var r = root.querySelector(sel); if (r) return r;
        var all = root.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) { var s = all[i].shadowRoot; if (s && (r = find(s, sel))) return r; }
        return null;
      })(document, 'iframe#gsft_main');
      if (f && f.contentWindow && f.contentWindow.location.href) w.unshift(f.contentWindow);
    } catch (e) {}
    try { w.push(window.top); } catch (e) {}
    return w;
  }
  var TOKEN = '';
  wins().forEach(function (w) { try { if (!TOKEN && w.g_ck) TOKEN = w.g_ck; } catch (e) {} });

  function detectUser() {
    var ws = wins();
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      try {
        var gf = w.g_form;
        if (gf && gf.getTableName && gf.getTableName() === 'sys_user') { var id = gf.getUniqueValue(); if (HEX32.test(id)) return id; }
      } catch (e) {}
      try {
        var u = w.location.href;
        for (var k = 0; k < 3; k++) {
          var m = u.match(/sys_user\.do\?(?:[^#]*&)?sys_id=([0-9a-f]{32})/i) || u.match(/sys_user\.do\/([0-9a-f]{32})/i) || u.match(/\/sys_user\/([0-9a-f]{32})/i);
          if (m) return m[1];
          try { u = decodeURIComponent(u); } catch (e) { break; }
        }
      } catch (e) {}
    }
    return '';
  }

  /* ---------- Accès API : T() renvoie une Response ---------- */
  var REQ = 0;
  function T(url) {
    REQ++;
    return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-UserToken': TOKEN } });
  }
  async function J(url) {
    var r = await T(url), tx = await r.text(), j = null;
    try { j = JSON.parse(tx); } catch (e) {}
    if (!r.ok) {
      var m = j && j.error && j.error.message, er = new Error('HTTP ' + r.status + (m ? ' – ' + m : ''));
      er.status = r.status; throw er;
    }
    return { j: j || {}, total: +r.headers.get('X-Total-Count') || 0 };
  }
  var TBL = '/api/now/table/', EXC = '&sysparm_exclude_reference_link=true';
  var modeUsed = 'agrégation serveur', fallbackWhy = '';

  /* Lecture paginée (500/page, ^ORDERBYsys_id, 40 pages max) */
  async function rows(table, q, fields, disp) {
    var out = [], off = 0, partial = false;
    for (var p = 0; p < 40; p++) {
      var u = TBL + table + '?sysparm_query=' + enc((q ? q + '^' : '') + 'ORDERBYsys_id') + '&sysparm_limit=500&sysparm_offset=' + off +
        '&sysparm_fields=' + enc(fields.join(',')) + (disp ? '&sysparm_display_value=all' : '') + EXC;
      var r = (await J(u)).j.result || [];
      out = out.concat(r);
      if (r.length < 500) return { rows: out, partial: false };
      off += 500;
      if (p === 39) partial = true;
    }
    return { rows: out, partial: partial };
  }

  /* Agrégation : serveur d'abord, repli ligne à ligne ; résultat normalisé [{g:{champ:valeur}, count, sum:{champ:nombre}}] */
  async function agg(table, q, o) {
    o = o || {};
    var sums = o.sum || [], grp = o.group || [];
    if (!P.force) {
      try {
        var u = '/api/now/stats/' + table + '?sysparm_query=' + enc(q || '') + '&sysparm_count=true' +
          (sums.length ? '&sysparm_sum_fields=' + enc(sums.join(',')) : '') + (grp.length ? '&sysparm_group_by=' + enc(grp.join(',')) : '');
        var res = (await J(u)).j.result;
        var arr = Array.isArray(res) ? res : (res ? [res] : []);
        return arr.map(function (x) {
          var g = {}; (x.groupby_fields || []).forEach(function (f) { g[f.field] = f.value; });
          var s = {}, xs = (x.stats && x.stats.sum) || {}; sums.forEach(function (f) { s[f] = num(xs[f]); });
          return { g: g, count: num(x.stats && x.stats.count), sum: s };
        });
      } catch (e) { modeUsed = 'lecture ligne à ligne'; fallbackWhy = e.message; }
    } else { modeUsed = 'lecture ligne à ligne'; fallbackWhy = 'forcé'; }
    var rr = await rows(table, q, sums.concat(grp), false), map = {}, list = [];
    if (rr.partial) modeUsed += ' (partiel)';
    rr.rows.forEach(function (r) {
      var key = grp.map(function (f) { return sv(r[f]); }).join('|'), it = map[key];
      if (!it) { it = map[key] = { g: {}, count: 0, sum: {} }; grp.forEach(function (f) { it.g[f] = sv(r[f]); }); sums.forEach(function (f) { it.sum[f] = 0; }); list.push(it); }
      it.count++; sums.forEach(function (f) { it.sum[f] += num(sv(r[f])); });
    });
    return list;
  }
  function tot(list, f) { return list.reduce(function (a, x) { return a + (f === 'count' ? x.count : (x.sum[f] || 0)); }, 0); }

  /* ---------- Période ---------- */
  function periodOf() {
    var t = new Date(), y = t.getFullYear(), m = t.getMonth(), a, b;
    if (P.preset === 'prev') { a = new Date(y, m - 1, 1); b = new Date(y, m, 0); }
    else if (P.preset === 'q') { var q0 = Math.floor(m / 3) * 3; a = new Date(y, q0, 1); b = new Date(y, q0 + 3, 0); }
    else if (P.preset === 'y') { a = new Date(y, 0, 1); b = new Date(y, 11, 31); }
    else if (P.preset === 'custom' && P.from && P.to && P.from <= P.to) { return { f: P.from, t: P.to }; }
    else { a = new Date(y, m, 1); b = new Date(y, m + 1, 0); }
    return { f: ymd(a), t: ymd(b) };
  }
  function monthsIn(f, t) {
    var out = [], d = pd(f); d = new Date(d.getFullYear(), d.getMonth(), 1);
    while (ymd(d) <= t) { out.push(ymd(d)); d = new Date(d.getFullYear(), d.getMonth() + 1, 1); }
    return out;
  }
  function monthAligned(f, t) {
    var a = pd(f), b = pd(t);
    return a.getDate() === 1 && new Date(b.getFullYear(), b.getMonth() + 1, 0).getDate() === b.getDate();
  }

  /* ---------- État ---------- */
  var S = { uid: '', user: null, data: null, cache: {}, tab: P.tab, rel: null };
  var CAT_ALLOC = ['non_project_time', 'project_allocated'];

  /* ---------- Chargement des données de la vue d'ensemble ---------- */
  async function loadOverview(uid, per) {
    var key = [uid, 'ov', per.f, per.t, P.force].join('|');
    if (S.cache[key]) return S.cache[key];
    var t0 = performance.now(), r0 = REQ, U = 'user=' + uid;
    var wkF = ymd(addD(pd(per.f), -6)), wkT = ymd(addD(pd(per.t), 6)), moF = per.f.slice(0, 7) + '-01';
    var res = await Promise.all([
      J(TBL + 'sys_user/' + uid + '?sysparm_fields=name,user_name,email,title,manager,department,active&sysparm_display_value=all' + EXC),
      J(TBL + 'sys_user_grmember?sysparm_query=' + enc(U) + '&sysparm_fields=group&sysparm_display_value=all&sysparm_limit=100' + EXC),
      rows('sn_plng_att_core_resource_assignment', 'user_resource=' + uid + '^assignment_type=user^start_date<=' + per.t + '^end_date>=' + per.f, ['role', 'sys_id'], true),
      agg('resource_allocation', 'resource_assignment.user_resource=' + uid + '^start_date<=' + per.t + '^end_date>=' + per.f, {}),
      agg('resource_allocation_daily', U + '^date>=' + per.f + '^date<=' + per.t, { sum: ['hours', 'actual_hours', 'allocated_cost', 'actual_cost'], group: ['date', 'type'] }),
      agg('resource_allocation_daily', U + '^date>=' + wkF + '^date<=' + wkT, { sum: ['actual_hours'] }),
      agg('time_card', U + '^week_starts_on>=' + wkF + '^week_starts_on<=' + per.t, { sum: ['total'], group: ['state'] }),
      agg('resource_aggregate_monthly', U + '^month_starts_on>=' + moF + '^month_starts_on<=' + per.t, { sum: ['hours'], group: ['month_starts_on', 'category'] }),
      agg('resource_aggregate_weekly', U + '^week_starts_on>=' + wkF + '^week_starts_on<=' + per.t, {})
    ]);
    var u = res[0].j.result || {};
    var groups = (res[1].j.result || []).map(function (x) { return dv(x.group); }).filter(Boolean);
    var roles = {}; res[2].rows.forEach(function (x) { var r = dv(x.role); if (r) roles[r] = 1; });
    var d = {
      uid: uid,
      user: { name: dv(u.name), login: sv(u.user_name), email: sv(u.email), title: sv(u.title), manager: dv(u.manager), dept: dv(u.department), active: sv(u.active) },
      groups: groups, roles: Object.keys(roles),
      cnt: { ra: res[2].rows.length, rl: tot(res[3], 'count'), rad: tot(res[4], 'count'), tc: tot(res[6], 'count'), ag: tot(res[7], 'count') + tot(res[8], 'count') },
      rad: res[4], radActWk: tot(res[5], 'actual_hours'), tc: res[6], aggM: res[7], per: per,
      ms: Math.round(performance.now() - t0), req: REQ - r0
    };
    console.debug('[snus] aperçu : ' + d.req + ' requêtes, ' + d.ms + ' ms, mode ' + modeUsed);
    S.cache[key] = d; return d;
  }

  /* ---------- Rendu : composants ---------- */
  function fH(hrs) { return P.unit === 'j' ? NF.format(hrs / 8) + ' j' : NF.format(hrs) + ' h'; }
  function tile(label, value, sub, cls) {
    return h('div', { cls: 'tile ' + (cls || '') }, [h('div', { cls: 'tl', text: label }), h('div', { cls: 'tv', text: value }), sub ? h('div', { cls: 'ts', text: sub }) : null]);
  }
  function listLink(tbl, q) { return '/' + tbl + '_list.do?sysparm_query=' + enc(q); }
  function link(text, href, cls) { return h('a', { cls: cls || 'ql', href: href, target: '_blank', rel: 'noopener', text: text }); }

  var TABS = [
    { k: 'ov', t: 'Vue d’ensemble', c: '#3758F9' },
    { k: 'ra', t: 'Assignations', c: '#8B5CF6', cnt: 'ra' },
    { k: 'rl', t: 'Allocations', c: '#8B5CF6', cnt: 'rl' },
    { k: 'tc', t: 'Time cards', c: '#0EA5E9', cnt: 'tc' },
    { k: 'ag', t: 'Agrégats', c: '#8B5CF6', cnt: 'ag' }
  ];
  function quickLinks(k, uid, per) {
    var L = [];
    if (k === 'ra') L = [['Resource Assignments', listLink('sn_plng_att_core_resource_assignment', 'user_resource=' + uid)], ['Resource Plans (groupe)', listLink('resource_plan', 'user_resource=' + uid)]];
    if (k === 'rl') L = [['Resource Allocation', listLink('resource_allocation', 'resource_assignment.user_resource=' + uid)], ['Resource Allocation Daily (période)', listLink('resource_allocation_daily', 'user=' + uid + '^date>=' + per.f + '^date<=' + per.t)]];
    if (k === 'tc') L = [['Time Card', listLink('time_card', 'user=' + uid)], ['Time Card Daily', listLink('time_card_daily', 'time_card.user=' + uid)]];
    if (k === 'ag') L = [['Aggregate Monthly', listLink('resource_aggregate_monthly', 'user=' + uid)], ['Aggregate Weekly', listLink('resource_aggregate_weekly', 'user=' + uid)]];
    return L.map(function (x) { return link(x[0] + ' ↗', x[1]); });
  }

  function heatmap(d) {
    var per = d.per, byDay = {}, a, b;
    d.rad.forEach(function (x) { var k = x.g.date; byDay[k] = byDay[k] || { h: 0, r: 0 }; byDay[k].h += x.sum.hours; byDay[k].r += x.sum.actual_hours; });
    var wrap = h('div', { cls: 'hm' });
    ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(function (x) { wrap.appendChild(h('div', { cls: 'hmh', text: x })); });
    var cur = mondayOf(pd(per.f)), end = addD(mondayOf(pd(per.t)), 6);
    for (; cur <= end; cur = addD(cur, 1)) {
      var k = ymd(cur), v = byDay[k], inP = k >= per.f && k <= per.t, hr = v ? v.h : 0;
      var cl = 'hc' + (inP ? '' : ' out') + (hr > 8 ? ' over' : hr > 4 ? ' l3' : hr > 0 ? (hr > 2 ? ' l2' : ' l1') : '') + ((cur.getDay() + 6) % 7 > 4 ? ' we' : '');
      wrap.appendChild(h('div', { cls: cl, title: frDate(k) + ' : ' + NF.format(hr) + ' h alloué' + (v && v.r ? ' · ' + NF.format(v.r) + ' h réel' : ''), text: String(cur.getDate()) }));
    }
    return wrap;
  }

  function monthRows(d) {
    var per = d.per, cap = {}, al = {}, radM = {}, radA = {}, radC = {}, radAC = {};
    d.aggM.forEach(function (x) { var m = x.g.month_starts_on, c = x.g.category; if (c === 'capacity') cap[m] = (cap[m] || 0) + x.sum.hours; if (CAT_ALLOC.indexOf(c) >= 0) al[m] = (al[m] || 0) + x.sum.hours; });
    d.rad.forEach(function (x) { var m = x.g.date.slice(0, 7) + '-01'; radM[m] = (radM[m] || 0) + x.sum.hours; radA[m] = (radA[m] || 0) + x.sum.actual_hours; radC[m] = (radC[m] || 0) + x.sum.allocated_cost; radAC[m] = (radAC[m] || 0) + x.sum.actual_cost; });
    return monthsIn(per.f, per.t).map(function (m) {
      var last = ymd(new Date(pd(m).getFullYear(), pd(m).getMonth() + 1, 0)), full = m >= per.f && last <= per.t;
      return { m: m, full: full, cap: cap[m] || 0, hasCap: cap[m] != null, al: radM[m] || 0, ac: radA[m] || 0, cAl: radC[m] || 0, cAc: radAC[m] || 0, aggAl: al[m], hasAgg: al[m] != null };
    });
  }

  function alerts(d, mrs) {
    var A = [];
    mrs.forEach(function (r) { if (r.full && r.hasCap && r.cap > 0 && r.al > r.cap + 0.005) A.push(['err', 'Surallocation ' + r.m.slice(0, 7).split('-').reverse().join('-') + ' : ' + fH(r.al) + ' alloués pour ' + fH(r.cap) + ' de capacité']); });
    var byDay = {}; d.rad.forEach(function (x) { byDay[x.g.date] = (byDay[x.g.date] || 0) + x.sum.hours; });
    var over = Object.keys(byDay).filter(function (k) { return byDay[k] > 8.005; }).length;
    if (over) A.push(['warn', over + ' jour(s) avec plus de 8 h allouées sur la période']);
    var st = {}; d.tc.forEach(function (x) { st[x.g.state] = x; });
    [['Rejected', 'rejetée(s)', 'err'], ['Pending', 'en attente de soumission (Pending)', 'warn'], ['Submitted', 'soumise(s), en attente d’approbation', 'warn'], ['Recalled', 'rappelée(s)', 'warn']].forEach(function (s) {
      if (st[s[0]] && st[s[0]].count) A.push([s[2], st[s[0]].count + ' time card(s) ' + s[1] + ' (' + fH(st[s[0]].sum.total) + ')']);
    });
    var appr = (st.Approved ? st.Approved.sum.total : 0) + (st.Processed ? st.Processed.sum.total : 0);
    if (Math.abs(appr - d.radActWk) > 0.005 && (appr || d.radActWk)) A.push(['warn', 'Écart time cards approuvées / heures réelles des allocations (semaines entières) : ' + fH(appr) + ' vs ' + fH(d.radActWk)]);
    return A;
  }

  /* Test de fiabilité des agrégats (historique complet) */
  async function reliability(uid) {
    var U = 'user=' + uid, r0 = REQ;
    var r = await Promise.all([
      agg('resource_allocation_daily', U, { sum: ['hours', 'actual_hours'], group: ['date', 'type'] }),
      agg('resource_aggregate_monthly', U, { sum: ['hours'], group: ['month_starts_on', 'category'] }),
      agg('resource_aggregate_weekly', U, { sum: ['hours'], group: ['category'] }),
      J(TBL + 'resource_aggregate_monthly?sysparm_query=' + enc(U + '^ORDERBYDESCsys_updated_on') + '&sysparm_limit=1&sysparm_fields=sys_updated_on' + EXC),
      J(TBL + 'resource_allocation_daily?sysparm_query=' + enc(U + '^ORDERBYDESCsys_updated_on') + '&sysparm_limit=1&sysparm_fields=sys_updated_on' + EXC)
    ]);
    var M = {}, i;
    function mo(m) { return M[m] || (M[m] = { m: m, pw: 0, ot: 0, ra: 0, aPa: 0, aNp: 0, aAct: 0 }); }
    r[0].forEach(function (x) { var m = mo(x.g.date.slice(0, 7) + '-01'); if (x.g.type === 'project_work') m.pw += x.sum.hours; else m.ot += x.sum.hours; m.ra += x.sum.actual_hours; });
    r[1].forEach(function (x) { var m = mo(x.g.month_starts_on); if (x.g.category === 'project_allocated') m.aPa += x.sum.hours; else if (x.g.category === 'non_project_time') m.aNp += x.sum.hours; else if (x.g.category === 'project_actual') m.aAct += x.sum.hours; });
    var list = Object.keys(M).sort().map(function (k) { return M[k]; });
    list.forEach(function (m) {
      m.dAl = (m.pw + m.ot) - (m.aPa + m.aNp); m.dAct = m.ra - m.aAct;
      m.ok = Math.abs(m.dAl) < 0.01 && Math.abs(m.dAct) < 0.01;
    });
    var wk = {}; r[2].forEach(function (x) { wk[x.g.category] = x.sum.hours; });
    var mAl = list.reduce(function (a, m) { return a + m.aPa + m.aNp; }, 0), wAl = (wk.project_allocated || 0) + (wk.non_project_time || 0);
    return {
      list: list, nok: list.filter(function (m) { return m.ok; }).length, wkDiff: wAl - mAl,
      aggUpd: ((r[3].j.result || [])[0] || {}).sys_updated_on || '', radUpd: ((r[4].j.result || [])[0] || {}).sys_updated_on || '', req: REQ - r0
    };
  }

  function renderOverview(box, d) {
    var per = d.per, mrs = monthRows(d), aligned = monthAligned(per.f, per.t);
    var cap = mrs.reduce(function (a, r) { return a + r.cap; }, 0), hasCap = mrs.some(function (r) { return r.hasCap; });
    var al = tot(d.rad, 'hours'), ac = tot(d.rad, 'actual_hours'), cAl = tot(d.rad, 'allocated_cost'), cAc = tot(d.rad, 'actual_cost');
    var occ = hasCap && cap > 0 && aligned ? al / cap * 100 : null;

    var u = d.user;
    box.appendChild(h('div', { cls: 'card id' }, [
      h('div', { cls: 'idn', text: u.name || d.uid }),
      h('div', { cls: 'ids', text: [u.title, u.dept, u.email].filter(Boolean).join(' · ') }),
      h('div', { cls: 'idm' }, [
        u.manager ? h('span', { cls: 'chip', text: 'Manager : ' + u.manager }) : null,
        h('span', { cls: 'chip', text: 'Groupes : ' + (d.groups.length ? d.groups.join(', ') : '—') }),
        h('span', { cls: 'chip', text: 'Rôle(s) ressource : ' + (d.roles.length ? d.roles.join(', ') : '—') }),
        link('Fiche ↗', '/sys_user.do?sys_id=' + d.uid, 'ql')
      ])
    ]));

    var cn = h('div', { cls: 'tiles' });
    TABS.filter(function (x) { return x.cnt; }).forEach(function (x) {
      var t = tile(x.t, NF0.format(d.cnt[x.cnt]), x.k === 'ag' ? 'lignes (mensuel + hebdo)' : 'sur la période', 'click');
      t.style.borderTopColor = x.c; t.addEventListener('click', function () { setTab(x.k); });
      cn.appendChild(t);
    });
    box.appendChild(cn);

    var ks = h('div', { cls: 'tiles' }, [
      tile('Capacité', hasCap ? fH(cap) : 'n/d', hasCap ? (aligned ? 'agrégats mensuels' : 'mois entiers (période partielle)') : 'aucun agrégat sur la période'),
      tile('Alloué', fH(al), 'allocations quotidiennes'),
      tile('Réel', fH(ac), 'heures réalisées'),
      tile('Taux d’occupation', occ == null ? 'n/d' : NF.format(occ) + ' %', 'alloué / capacité', occ == null ? '' : occ > 100 ? 'bad' : occ >= 80 ? 'good' : '')
    ]);
    if (P.costs) {
      ks.appendChild(tile('Coût alloué', NF.format(cAl), 'devise du rate model'));
      ks.appendChild(tile('Coût réel', NF.format(cAc), 'devise du rate model'));
    }
    box.appendChild(ks);

    var A = alerts(d, mrs), ab = h('div', { cls: 'card' }, [h('div', { cls: 'ct', text: 'Alertes' })]);
    if (!A.length) ab.appendChild(h('div', { cls: 'al ok', text: '✓ Aucune alerte sur la période' }));
    A.forEach(function (a) { ab.appendChild(h('div', { cls: 'al ' + a[0], text: (a[0] === 'err' ? '● ' : '▲ ') + a[1] })); });
    box.appendChild(ab);

    var days = (pd(per.t) - pd(per.f)) / 864e5 + 1;
    var ld = h('div', { cls: 'card' }, [h('div', { cls: 'ct', text: 'Charge sur la période (heures allouées par jour)' })]);
    if (days <= 92) { ld.appendChild(heatmap(d)); ld.appendChild(h('div', { cls: 'mt', text: 'Gris : rien · bleu : 0–2 h, 2–4 h, 4–8 h · rouge : plus de 8 h' })); }
    else ld.appendChild(h('div', { cls: 'mt', text: 'Période longue : voir le détail par mois ci-dessous.' }));
    var tb = h('table', { cls: 'tb' }, [h('thead', null, [h('tr', null, ['Mois', 'Capacité', 'Alloué', 'Réel', 'Occupation', 'Agrégat alloué', 'Écart'].concat(P.costs ? ['Coût alloué', 'Coût réel'] : []).map(function (x, i) { return h('th', { text: x, cls: i ? 'n' : '' }); }))])]);
    var bd = h('tbody');
    mrs.forEach(function (r) {
      var diff = r.hasAgg && r.full ? r.al - r.aggAl : null, o = r.full && r.hasCap && r.cap > 0 ? r.al / r.cap * 100 : null;
      var tr = h('tr', null, [
        h('td', { text: r.m.slice(0, 7).split('-').reverse().join('-') + (r.full ? '' : ' (partiel)') }),
        h('td', { cls: 'n', text: r.hasCap ? fH(r.cap) : '—' }), h('td', { cls: 'n', text: fH(r.al) }), h('td', { cls: 'n', text: fH(r.ac) }),
        h('td', { cls: 'n' + (o != null && o > 100 ? ' bad' : ''), text: o == null ? '—' : NF.format(o) + ' %' }),
        h('td', { cls: 'n', text: r.hasAgg ? fH(r.aggAl) : '—' }),
        h('td', { cls: 'n' + (diff != null && Math.abs(diff) >= 0.01 ? ' bad' : diff != null ? ' good' : ''), text: diff == null ? '—' : Math.abs(diff) < 0.01 ? '✓' : (diff > 0 ? '+' : '') + NF.format(diff / (P.unit === 'j' ? 8 : 1)) + (P.unit === 'j' ? ' j' : ' h') })
      ]);
      if (P.costs) { tr.appendChild(h('td', { cls: 'n', text: NF.format(r.cAl) })); tr.appendChild(h('td', { cls: 'n', text: NF.format(r.cAc) })); }
      bd.appendChild(tr);
    });
    tb.appendChild(bd); ld.appendChild(h('div', { cls: 'tw' }, [tb]));
    box.appendChild(ld);

    var rel = h('div', { cls: 'card' }, [h('div', { cls: 'ct', text: 'Fiabilité des agrégats' })]);
    var relOut = h('div', { cls: 'mt', text: 'Compare, sur tout l’historique de l’utilisateur, les allocations quotidiennes aux agrégats mensuels et hebdomadaires.' });
    var btn = h('button', { cls: 'btn', text: 'Tester la fiabilité', onclick: async function () {
      btn.disabled = true; relOut.textContent = 'Test en cours…';
      try { S.rel = await reliability(d.uid); drawRel(relOut, S.rel); } catch (e) { relOut.textContent = 'Échec du test : ' + e.message; relOut.className = 'mt bad'; }
      btn.disabled = false;
    } });
    rel.appendChild(btn); rel.appendChild(relOut); box.appendChild(rel);
    if (S.rel && S.rel.uid === d.uid) drawRel(relOut, S.rel);
  }

  function drawRel(out, r) {
    out.textContent = ''; out.className = '';
    var ok = r.nok === r.list.length && Math.abs(r.wkDiff) < 0.01;
    out.appendChild(h('div', { cls: 'al ' + (ok ? 'ok' : 'err'), text: (ok ? '✓ Agrégats concordants' : '● Écarts détectés') + ' : ' + r.nok + ' / ' + r.list.length + ' mois concordent' + (Math.abs(r.wkDiff) >= 0.01 ? ' · hebdo ≠ mensuel de ' + NF.format(r.wkDiff) + ' h' : ' · hebdo = mensuel') }));
    out.appendChild(h('div', { cls: 'mt', text: 'Dernière mise à jour : agrégats mensuels ' + (r.aggUpd || 'n/d') + ' · allocations quotidiennes ' + (r.radUpd || 'n/d') + ' · ' + r.req + ' requêtes (' + modeUsed + ')' }));
    var bad = r.list.filter(function (m) { return !m.ok; });
    if (bad.length) {
      var t = h('table', { cls: 'tb' }, [h('thead', null, [h('tr', null, ['Mois', 'Écart alloué', 'Écart réel'].map(function (x, i) { return h('th', { text: x, cls: i ? 'n' : '' }); }))])]), b = h('tbody');
      bad.forEach(function (m) { b.appendChild(h('tr', null, [h('td', { text: m.m.slice(0, 7).split('-').reverse().join('-') }), h('td', { cls: 'n bad', text: NF.format(m.dAl) + ' h' }), h('td', { cls: 'n bad', text: NF.format(m.dAct) + ' h' })])); });
      t.appendChild(b); out.appendChild(h('div', { cls: 'tw' }, [t]));
    }
  }

  /* ---------- Tableau générique : tri, filtre, totaux, export, en-têtes ↗ ---------- */
  function norm(x) { return String(x).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function fN(hrs) { return NF.format(P.unit === 'j' ? hrs / 8 : hrs); }
  function uS() { return P.unit === 'j' ? ' (j)' : ' (h)'; }
  function C(t, o) { var c = { t: t == null ? '' : String(t) }; if (o) for (var k in o) c[k] = o[k]; return c; }
  function empty(c) { return c.t === '' || c.t === '—'; }
  function dtable(o) {
    var stt = { sort: null, asc: true, q: '' }, wrap = h('div'), tw = h('div', { cls: 'tw' }), cnt = h('span', { cls: 'mt' });
    var fq = h('input', { cls: 'fld sm', type: 'search', placeholder: 'Filtrer…', oninput: function () { stt.q = fq.value; draw(); } });
    var vis = [];
    function lines() {
      var L = [o.cols.map(function (c) { return c.l; })];
      vis.forEach(function (r) { L.push(r.c.map(function (c) { return c.t.replace(/ /g, ' '); })); });
      if (o.totals) L.push(o.totals(vis).map(function (c) { return c.t.replace(/ /g, ' '); }));
      return L;
    }
    function copy(txt) {
      try { navigator.clipboard.writeText(txt); } catch (e) { var ta = h('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e2) {} ta.remove(); }
    }
    var tools = h('div', { cls: 'tools' }, [o.rows.length > 3 ? fq : null, cnt, h('span', { cls: 'sp' }),
      h('button', { cls: 'btn sec sm', text: 'Copier', title: 'TSV, collable dans Excel', onclick: function (e) { copy(lines().map(function (l) { return l.join('\t'); }).join('\n')); e.target.textContent = 'Copié ✓'; setTimeout(function () { e.target.textContent = 'Copier'; }, 1200); } }),
      h('button', { cls: 'btn sec sm', text: 'CSV', onclick: function () {
        var csv = '﻿' + lines().map(function (l) { return l.map(function (v) { return '"' + v.replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
        var a = h('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: (o.name || 'export') + '.csv' }); document.body.appendChild(a); a.click(); a.remove();
      } })]);
    function cmp(a, b) {
      var x = a.c[stt.sort], y = b.c[stt.sort];
      if (empty(x) !== empty(y)) return empty(x) ? 1 : -1;      // vides toujours en bas
      if (empty(x)) return 0;
      var r = x.n != null && y.n != null ? x.n - y.n : x.d && y.d ? (x.d < y.d ? -1 : x.d > y.d ? 1 : 0) : x.t.localeCompare(y.t, 'fr', { numeric: true });
      return stt.asc ? r : -r;
    }
    function draw() {
      var q = norm(stt.q);
      vis = o.rows.filter(function (r) { return !q || r.c.some(function (c) { return norm(c.t).indexOf(q) >= 0; }); });
      if (stt.sort != null) {
        var emp = [], ok = [];
        vis.forEach(function (r) { (empty(r.c[stt.sort]) ? emp : ok).push(r); });
        ok.sort(cmp); vis = ok.concat(emp);
      }
      var tr = h('tr');
      o.cols.forEach(function (c, i) {
        var th = h('th', { cls: c.num ? 'n' : '', text: c.l + (stt.sort === i ? (stt.asc ? ' ▲' : ' ▼') : ''), onclick: function () { if (stt.sort === i) stt.asc = !stt.asc; else { stt.sort = i; stt.asc = true; } draw(); } });
        if (c.href) th.appendChild(h('a', { cls: 'hl', href: c.href, target: '_blank', rel: 'noopener', title: 'Ouvrir la liste classique filtrée', text: '↗', onclick: function (e) { e.stopPropagation(); } }));
        tr.appendChild(th);
      });
      var tb = h('tbody');
      vis.forEach(function (r) {
        var row = h('tr');
        r.c.forEach(function (c, i) {
          var td = h('td', { cls: (o.cols[i].num ? 'n ' : '') + (c.cls || ''), title: c.t });
          td.appendChild(c.href ? h('a', { cls: 'cl', href: c.href, target: '_blank', rel: 'noopener', text: c.t }) : document.createTextNode(c.t));
          if (i === 0 && r.open) td.appendChild(h('a', { cls: 'ro', href: r.open, target: '_blank', rel: 'noopener', title: 'Ouvrir', text: '↗' }));
          row.appendChild(td);
        });
        tb.appendChild(row);
      });
      var tf = h('tfoot');
      if (o.totals) { var fr = h('tr'); o.totals(vis).forEach(function (c, i) { fr.appendChild(h('td', { cls: (o.cols[i].num ? 'n ' : '') + (c.cls || ''), text: c.t })); }); tf.appendChild(fr); }
      tw.textContent = ''; tw.appendChild(h('table', { cls: 'tb' }, [h('thead', null, [tr]), tb, tf]));
      cnt.textContent = vis.length + ' / ' + o.rows.length + ' ligne(s)' + (o.note ? ' · ' + o.note : '');
    }
    draw(); wrap.appendChild(tools); wrap.appendChild(tw); return wrap;
  }
  function phLine(t) { return h('div', { cls: 'ph', text: t }); }

  /* ---------- Onglet Assignations ---------- */
  async function loadRA(uid, per) {
    var r = await Promise.all([
      rows('sn_plng_att_core_resource_assignment', 'user_resource=' + uid + '^assignment_type=user^start_date<=' + per.t + '^end_date>=' + per.f,
        ['number', 'top_task', 'task', 'parent', 'group_resource', 'effort', 'effort_type', 'start_date', 'end_date', 'resource_status', 'resource_allocation', 'sys_id'], true),
      agg('resource_allocation_daily', 'user=' + uid + '^date>=' + per.f + '^date<=' + per.t, { sum: ['hours', 'actual_hours', 'allocated_cost', 'actual_cost'], group: ['allocation'] })
    ]);
    var byAl = {}; r[1].forEach(function (x) { byAl[x.g.allocation] = x.sum; });
    return { ra: r[0].rows, partial: r[0].partial, byAl: byAl, per: per, uid: uid };
  }
  function drawRA(box, d) {
    var rowsT = d.ra.map(function (x) {
      var al = d.byAl[sv(x.resource_allocation)] || { hours: 0, actual_hours: 0, allocated_cost: 0, actual_cost: 0 }, pj = sv(x.top_task), tk = sv(x.task), ef = num(sv(x.effort));
      var c = [C(sv(x.number)), C(dv(x.top_task) || '—', pj ? { href: '/pm_project.do?sys_id=' + pj } : null), C(dv(x.task) || '—', tk ? { href: '/pm_project_task.do?sys_id=' + tk } : null),
        C(dv(x.group_resource) || '—'), C(dv(x.parent) || '—'), C(NF.format(ef), { n: ef }), C(dv(x.effort_type) || '—'), C(frDate(sv(x.start_date)), { d: sv(x.start_date) }), C(frDate(sv(x.end_date)), { d: sv(x.end_date) }),
        C(dv(x.resource_status) || '—'), C(fN(al.hours), { n: al.hours }), C(fN(al.actual_hours), { n: al.actual_hours })];
      if (P.costs) c.push(C(NF.format(al.allocated_cost), { n: al.allocated_cost }), C(NF.format(al.actual_cost), { n: al.actual_cost }));
      return { c: c, open: '/sn_plng_att_core_resource_assignment.do?sys_id=' + sv(x.sys_id), al: al, ef: ef, et: dv(x.effort_type) };
    });
    var cols = [{ l: 'N°', href: listLink('sn_plng_att_core_resource_assignment', 'user_resource=' + d.uid + '^assignment_type=user') }, { l: 'Projet' }, { l: 'Tâche' }, { l: 'Groupe' }, { l: 'Parent' }, { l: 'Effort', num: 1 }, { l: 'Type d’effort' }, { l: 'Début' }, { l: 'Fin' }, { l: 'Statut' },
      { l: 'Alloué' + uS(), num: 1, href: listLink('resource_allocation_daily', 'user=' + d.uid + '^date>=' + d.per.f + '^date<=' + d.per.t) }, { l: 'Réel' + uS(), num: 1 }];
    if (P.costs) cols.push({ l: 'Coût alloué', num: 1 }, { l: 'Coût réel', num: 1 });
    box.appendChild(h('div', { cls: 'card' }, [h('div', { cls: 'ct', text: 'Assignations de niveau Utilisateur chevauchant la période' }), h('div', { cls: 'mt', text: 'Alloué / réel : allocations quotidiennes de la période, rattachées à chaque assignation. Les assignations de niveau Groupe sont exclues (double comptage).' }),
      dtable({ name: 'assignations', cols: cols, rows: rowsT, note: d.partial ? 'partiel (40 pages)' : '', totals: function (vis) {
        var t = [C('Σ'), C(''), C(''), C(''), C(''), C(''), C(''), C(''), C(''), C('')], types = {};
        vis.forEach(function (r) { types[r.et] = (types[r.et] || 0) + r.ef; });
        var ks = Object.keys(types); if (ks.length === 1) t[5] = C(NF.format(types[ks[0]]), { n: types[ks[0]] }); else if (ks.length > 1) t[5] = C(ks.length + ' types');
        var sh = 0, sa = 0, sc = 0, sr = 0; vis.forEach(function (r) { sh += r.al.hours; sa += r.al.actual_hours; sc += r.al.allocated_cost; sr += r.al.actual_cost; });
        t.push(C(fN(sh)), C(fN(sa))); if (P.costs) t.push(C(NF.format(sc)), C(NF.format(sr)));
        return t; } })]));
  }

  /* ---------- Onglet Time cards ---------- */
  var DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], DL = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  var STC = { Pending: 'pend', Submitted: 'subm', Approved: 'appr', Processed: 'proc', Rejected: 'rej', Recalled: 'rec' };
  async function loadTC(uid, per) {
    var lo = ymd(addD(pd(per.f), -6)), hi = ymd(addD(pd(per.t), 6));
    var r = await Promise.all([
      rows('time_card', 'user=' + uid + '^week_starts_on>=' + lo + '^week_starts_on<=' + per.t, ['sys_id', 'week_starts_on', 'task', 'top_task', 'state', 'total', 'time_sheet', 'approved_on'].concat(DAYS), true),
      agg('resource_allocation_daily', 'user=' + uid + '^actual_hours>0^date>=' + lo + '^date<=' + hi, { sum: ['actual_hours'], group: ['task', 'top_task', 'date'] })
    ]);
    return { tc: r[0].rows, partial: r[0].partial, rad: r[1], per: per, uid: uid };
  }
  function drawTC(box, d) {
    function radFor(key, byTop, w0) {
      var a = pd(w0), s = 0, lo = w0, hi = ymd(addD(a, 6));
      d.rad.forEach(function (x) { if (x.g.date >= lo && x.g.date <= hi && (byTop ? x.g.top_task : x.g.task) === key) s += x.sum.actual_hours; });
      return s;
    }
    var R = d.tc.map(function (x) {
      var w0 = sv(x.week_starts_on), st = sv(x.state), tot = num(sv(x.total)), tk = sv(x.task), tp = sv(x.top_task), approved = st === 'Approved' || st === 'Processed';
      var diff = approved ? tot - radFor(tk === tp ? tp : tk, tk === tp, w0) : null, ts = sv(x.time_sheet);
      var days = DAYS.map(function (k) { var v = num(sv(x[k])); return C(v ? fN(v) : '', { n: v ? v : null }); });
      var c = [C(frDate(w0), { d: w0 }), C(dv(x.top_task) || '—', tp ? { href: '/pm_project.do?sys_id=' + tp } : null), C(dv(x.task) || '—', tk && tk !== tp ? { href: '/pm_project_task.do?sys_id=' + tk } : null)].concat(days,
        [C(fN(tot), { n: tot }), C(st, { cls: 'st st-' + (STC[st] || 'pend') }), C(dv(x.time_sheet) || '—', ts ? { href: '/time_sheet.do?sys_id=' + ts } : null), C(sv(x.approved_on) ? frDate(sv(x.approved_on).slice(0, 10)) + sv(x.approved_on).slice(10, 16) : '—', { d: sv(x.approved_on) }),
          diff == null ? C('—') : Math.abs(diff) < 0.01 ? C('✓', { cls: 'good', n: 0 }) : C((diff > 0 ? '+' : '') + fN(diff), { cls: 'bad', n: diff })]);
      return { c: c, open: '/time_card.do?sys_id=' + sv(x.sys_id), days: DAYS.map(function (k) { return num(sv(x[k])); }), tot: tot, diff: diff };
    });
    var cols = [{ l: 'Semaine', href: listLink('time_card', 'user=' + d.uid + '^week_starts_on>=' + ymd(addD(pd(d.per.f), -6)) + '^week_starts_on<=' + d.per.t) }, { l: 'Projet' }, { l: 'Tâche' }]
      .concat(DL.map(function (x) { return { l: x, num: 1 }; }), [{ l: 'Total' + uS(), num: 1 }, { l: 'État' }, { l: 'Time sheet' }, { l: 'Approuvée le' }, { l: 'Écart' + uS(), num: 1 }]);
    box.appendChild(h('div', { cls: 'card' }, [h('div', { cls: 'ct', text: 'Time cards (semaines chevauchant la période)' }),
      h('div', { cls: 'mt', text: 'Écart : total d’une time card Approved / Processed moins les heures réelles des allocations quotidiennes de la même tâche et de la même semaine (7 jours à partir de « Semaine »). Les autres états ne sont pas comparés.' }),
      dtable({ name: 'time-cards', cols: cols, rows: R, note: d.partial ? 'partiel (40 pages)' : '', totals: function (vis) {
        var t = [C('Σ'), C(''), C('')], sd = [0, 0, 0, 0, 0, 0, 0], st = 0, sg = 0, any = false;
        vis.forEach(function (r) { r.days.forEach(function (v, i) { sd[i] += v; }); st += r.tot; if (r.diff != null) { sg += r.diff; any = true; } });
        sd.forEach(function (v) { t.push(C(v ? fN(v) : '')); });
        t.push(C(fN(st)), C(''), C(''), C(''), C(!any ? '—' : Math.abs(sg) < 0.01 ? '✓' : (sg > 0 ? '+' : '') + fN(sg), { cls: any ? (Math.abs(sg) < 0.01 ? 'good' : 'bad') : '' }));
        return t; } })]));
  }
  var LOADERS = { ra: loadRA, tc: loadTC }, DRAW = { ra: drawRA, tc: drawTC };
  async function renderTab(tab) {
    var per = S.data.per, key = [S.uid, tab.k, per.f, per.t, P.force].join('|'), ld = S.cache[key], t0 = performance.now(), r0 = REQ;
    if (!ld) {
      main.textContent = ''; main.appendChild(phLine('Chargement…'));
      try { ld = S.cache[key] = await LOADERS[tab.k](S.uid, per); console.debug('[snus] ' + tab.t + ' : ' + (REQ - r0) + ' requêtes, ' + Math.round(performance.now() - t0) + ' ms, mode ' + modeUsed); }
      catch (e) { if (S.tab === tab.k) errBox(e, function () { delete S.cache[key]; renderTab(tab); }); return; }
    }
    if (S.tab !== tab.k || !S.data || ld.uid !== S.uid) return;
    main.textContent = ''; DRAW[tab.k](main, ld); mode.textContent = 'Mode : ' + modeUsed + (fallbackWhy ? ' (' + fallbackWhy + ')' : '') + ' · ' + REQ + ' requêtes cumulées';
  }

  /* ---------- Coque : overlay, barre du haut, onglets ---------- */
  var CSS = [
    '#snus-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;background:rgba(9,14,52,.40);backdrop-filter:blur(4px);padding:16px}',
    '#snus-overlay *{box-sizing:border-box}',
    '#snus-win{margin:auto;width:90vw;height:90vh;display:flex;flex-direction:column;background:#fff;border:1px solid #E5E7EB;border-radius:12px;box-shadow:0 25px 50px -12px rgba(9,14,52,.25);overflow:hidden;color:#1F2937;font-size:13px}',
    '#snus-top{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid #E5E7EB;flex-wrap:wrap}',
    '#snus-top h2{margin:0;font-size:15px;font-weight:700;color:#090E34}',
    '.ver{font-size:11px;color:#6B7280;font-weight:400;margin-left:6px}',
    '.fld{padding:7px 10px;border:1px solid #D1D5DB;border-radius:8px;font:inherit;background:#fff;color:#374151;outline:none}',
    '.fld:focus{border-color:#3758F9;box-shadow:0 0 0 3px rgba(55,88,249,.12)}.fld.det{border-color:#22C55E;background:#F0FDF4}',
    '.btn{padding:7px 14px;border-radius:8px;border:1px solid #3758F9;background:#3758F9;color:#fff;font:inherit;font-weight:500;cursor:pointer}.btn:hover{background:#1B44C8}.btn:disabled{opacity:.5;cursor:default}',
    '.btn.sec{background:#fff;color:#374151;border-color:#D1D5DB}.btn.sec:hover{background:#F3F4F6}.btn.on{background:#EEF2FF;color:#3758F9;border-color:#3758F9}',
    '.sp{flex:1}',
    '#snus-close{width:32px;height:32px;border-radius:8px;border:1px solid #E5E7EB;background:#F3F4F6;color:#6B7280;cursor:pointer;font-size:16px}#snus-close:hover{background:#FEF2F2;color:#DC2626;border-color:#FECACA}',
    '#snus-mode{font-size:11px;color:#6B7280}',
    '#snus-tabs{display:flex;gap:4px;padding:8px 16px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;flex-wrap:wrap}',
    '.tab{padding:5px 12px;border-radius:9999px;border:1px solid #E5E7EB;background:#fff;font:inherit;font-size:12px;font-weight:600;cursor:pointer;color:#374151}.tab:hover{background:#F3F4F6}.tab.act{color:#fff;border-color:transparent}',
    '.tab .bg{margin-left:6px;font-weight:500;opacity:.85}',
    '#snus-main{flex:1;overflow:auto;padding:14px 18px;background:#F9FAFB}',
    '.card{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:12px 14px;margin-bottom:12px}',
    '.ct{font-weight:700;color:#090E34;margin-bottom:8px}.idn{font-size:17px;font-weight:700;color:#090E34}.ids{color:#6B7280;margin:2px 0 8px}',
    '.idm{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.chip{background:#F3F4F6;border-radius:9999px;padding:2px 10px;font-size:12px}',
    '.ql{color:#3758F9;text-decoration:none;font-size:12px;margin-right:10px}.ql:hover{text-decoration:underline}',
    '.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px}',
    '.tile{background:#fff;border:1px solid #E5E7EB;border-top:3px solid #D1D5DB;border-radius:10px;padding:10px 12px}.tile.click{cursor:pointer}.tile.click:hover{background:#F9FAFB}',
    '.tl{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6B7280;font-weight:600}.tv{font-size:20px;font-weight:700;color:#090E34;margin-top:2px}.ts{font-size:11px;color:#6B7280}',
    '.tile.bad .tv{color:#DC2626}.tile.good .tv{color:#16A34A}',
    '.al{padding:3px 0}.al.err{color:#B42318}.al.warn{color:#B45309}.al.ok{color:#16A34A}',
    '.mt{color:#6B7280;font-size:12px;margin:6px 0}.bad{color:#DC2626}.good{color:#16A34A}',
    '.hm{display:grid;grid-template-columns:repeat(7,44px);gap:3px;margin:4px 0}.hmh{font-size:10px;color:#6B7280;text-align:center}',
    '.hc{height:30px;border-radius:5px;background:#F3F4F6;font-size:10px;color:#6B7280;display:flex;align-items:flex-start;justify-content:flex-start;padding:2px 4px}',
    '.hc.l1{background:#DBEAFE}.hc.l2{background:#93C5FD}.hc.l3{background:#3B82F6;color:#fff}.hc.over{background:#DC2626;color:#fff}.hc.out{opacity:.35}.hc.we{outline:1px dashed #D1D5DB}',
    '.tw{overflow:auto;max-height:50vh;border:1px solid #E5E7EB;border-radius:6px;margin-top:8px}',
    '.tb{border-collapse:collapse;width:100%}.tb th{position:sticky;top:0;background:#F3F4F6;text-align:left;padding:6px 10px;border-bottom:1px solid #E5E7EB;font-size:12px;white-space:nowrap}',
    '.tb td{padding:5px 10px;border-bottom:1px solid #F3F4F6;white-space:nowrap}.n{text-align:right!important;font-variant-numeric:tabular-nums}',
    '.pick{padding:8px 12px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;margin-bottom:6px;cursor:pointer}.pick:hover{background:#EEF2FF;border-color:#3758F9}',
    '.err-box{background:#FEF2F2;border:1px solid #FECACA;color:#B42318;border-radius:8px;padding:10px 12px;margin-bottom:10px}',
    '.ph{color:#6B7280;margin-bottom:10px}',
    '.fld.sm,.btn.sm{padding:4px 8px;font-size:12px}',
    '.tools{display:flex;gap:8px;align-items:center;margin:6px 0 0}',
    '.tb tfoot td{position:sticky;bottom:0;background:#F3F4F6;font-weight:700;border-top:2px solid #D1D5DB}.tb th{cursor:pointer;user-select:none}',
    '.hl{margin-left:4px;color:#3758F9;text-decoration:none;font-weight:700}.cl{color:#3758F9;text-decoration:none}.cl:hover{text-decoration:underline}',
    '.ro{margin-left:6px;color:#3758F9;text-decoration:none;visibility:hidden;font-size:11px}.tb tr:hover .ro{visibility:visible}.tb tbody tr:hover td{background:#F7FAFC}',
    '.st{font-weight:600}.st-pend{color:#6B7280}.st-subm{color:#B45309}.st-appr{color:#16A34A}.st-proc{color:#0E7490}.st-rej{color:#DC2626}.st-rec{color:#C2410C}'
  ].join('');

  var st = h('style', { id: CSSID }); st.textContent = CSS;
  var ov = h('div', { id: ID }), win = h('div', { id: 'snus-win' });
  var inp = h('input', { cls: 'fld', placeholder: 'Nom, e-mail ou sys_id', style: 'min-width:240px' });
  var preset = h('select', { cls: 'fld', onchange: function () { P.preset = preset.value; save(); syncDates(); if (P.preset !== 'custom') refresh(false); } },
    [['cur', 'Mois courant'], ['prev', 'Mois précédent'], ['q', 'Trimestre'], ['y', 'Année civile'], ['custom', 'Personnalisé']].map(function (x) { return h('option', { value: x[0], text: x[1] }); }));
  var dFrom = h('input', { type: 'date', cls: 'fld', onchange: function () { P.from = dFrom.value; P.preset = 'custom'; preset.value = 'custom'; save(); refresh(false); } });
  var dTo = h('input', { type: 'date', cls: 'fld', onchange: function () { P.to = dTo.value; P.preset = 'custom'; preset.value = 'custom'; save(); refresh(false); } });
  var bUnit = h('button', { cls: 'btn sec', onclick: function () { P.unit = P.unit === 'h' ? 'j' : 'h'; save(); syncBtns(); render(); } });
  var bCost = h('button', { cls: 'btn sec', onclick: function () { P.costs = !P.costs; save(); syncBtns(); render(); } });
  var bForce = h('button', { cls: 'btn sec', title: 'Désactive l’agrégation serveur (test du repli)', onclick: function () { P.force = !P.force; save(); syncBtns(); refresh(true); } });
  var bRe = h('button', { cls: 'btn sec', text: 'Recalculer', onclick: function () { refresh(true); } });
  var mode = h('span', { id: 'snus-mode' }), main = h('div', { id: 'snus-main' }), tabs = h('div', { id: 'snus-tabs' });
  var bLoad = h('button', { cls: 'btn', text: 'Charger', onclick: function () { search(inp.value.trim()); } });
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') search(inp.value.trim()); });
  function syncDates() { var p = periodOf(); dFrom.value = p.f; dTo.value = p.t; preset.value = P.preset; }
  function syncBtns() {
    bUnit.textContent = 'Unité : ' + (P.unit === 'j' ? 'jours-homme' : 'heures');
    bCost.textContent = P.costs ? 'Coûts : oui' : 'Coûts : non'; bCost.className = 'btn sec' + (P.costs ? ' on' : '');
    bForce.textContent = P.force ? 'Ligne à ligne : forcé' : 'Forcer ligne à ligne'; bForce.className = 'btn sec' + (P.force ? ' on' : '');
  }
  win.appendChild(h('div', { id: 'snus-top' }, [h('h2', null, [h('span', { text: 'Utilisateur' }), h('span', { cls: 'ver', text: VER })]), inp, bLoad, preset, dFrom, dTo, bUnit, bCost, bRe, bForce, h('span', { cls: 'sp' }), mode,
    h('button', { id: 'snus-close', title: 'Fermer (Échap)', text: '✕', onclick: close })]));
  win.appendChild(tabs); win.appendChild(main); ov.appendChild(win);
  document.head.appendChild(st); document.body.appendChild(ov);
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { ov.remove(); st.remove(); document.removeEventListener('keydown', onKey, true); }
  ov._close = close; document.addEventListener('keydown', onKey, true);

  function setTab(k) { S.tab = k; P.tab = k; save(); render(); }
  function drawTabs() {
    tabs.textContent = '';
    TABS.forEach(function (x) {
      var b = h('button', { cls: 'tab' + (S.tab === x.k ? ' act' : ''), onclick: function () { setTab(x.k); } }, [h('span', { text: x.t }), S.data && x.cnt ? h('span', { cls: 'bg', text: NF0.format(S.data.cnt[x.cnt]) }) : null]);
      if (S.tab === x.k) b.style.background = x.c;
      tabs.appendChild(b);
    });
  }
  function errBox(e, retry) {
    main.textContent = '';
    main.appendChild(h('div', { cls: 'err-box' }, [h('div', { text: (e.status === 403 ? 'Accès refusé (ACL) ' : '') + e.message + (e.status ? ' [' + e.status + ']' : '') }), h('button', { cls: 'btn', style: 'margin-top:8px', text: 'Réessayer', onclick: retry })]));
  }
  function render() {
    drawTabs(); mode.textContent = S.data ? 'Mode : ' + modeUsed + (fallbackWhy ? ' (' + fallbackWhy + ')' : '') + ' · ' + S.data.req + ' requêtes · ' + S.data.ms + ' ms' : '';
    main.textContent = '';
    if (!S.data) return;
    var tab = TABS.filter(function (x) { return x.k === S.tab; })[0] || TABS[0];
    if (tab.k === 'ov') return renderOverview(main, S.data);
    if (LOADERS[tab.k]) return renderTab(tab);
    main.appendChild(h('div', { cls: 'ph', text: tab.t + ' : ' + NF0.format(S.data.cnt[tab.cnt]) + ' enregistrement(s) sur la période (' + frDate(S.data.per.f) + ' → ' + frDate(S.data.per.t) + '). Détail intégré au lot 3 ; en attendant, liens vers les listes classiques :' }));
    main.appendChild(h('div', { cls: 'card' }, quickLinks(tab.k, S.uid, S.data.per)));
  }
  async function refresh(clear) {
    if (!S.uid) return;
    if (clear) { S.cache = {}; S.rel = null; modeUsed = 'agrégation serveur'; fallbackWhy = ''; }
    main.textContent = ''; main.appendChild(h('div', { cls: 'ph', text: 'Chargement…' }));
    try {
      S.data = await loadOverview(S.uid, periodOf());
      if (S.rel) S.rel.uid = S.uid;
      render();
    } catch (e) { S.data = null; drawTabs(); errBox(e, function () { refresh(true); }); }
  }
  async function search(q) {
    if (!q) return;
    if (HEX32.test(q)) { S.uid = q; S.rel = null; inp.classList.remove('det'); return refresh(true); }
    main.textContent = ''; main.appendChild(h('div', { cls: 'ph', text: 'Recherche…' }));
    try {
      var r = (await J(TBL + 'sys_user?sysparm_query=' + enc('nameLIKE' + q + '^ORemailLIKE' + q + '^ORuser_nameLIKE' + q + '^ORDERBYname') + '&sysparm_limit=20&sysparm_fields=sys_id,name,email,title,active&sysparm_display_value=all' + EXC)).j.result || [];
      if (!r.length) { main.textContent = ''; main.appendChild(h('div', { cls: 'err-box', text: 'Aucun utilisateur trouvé pour « ' + q + ' ».' })); return; }
      if (r.length === 1) { S.uid = sv(r[0].sys_id); S.rel = null; return refresh(true); }
      main.textContent = ''; main.appendChild(h('div', { cls: 'ph', text: r.length + ' résultats, choisis un utilisateur :' }));
      r.forEach(function (x) { main.appendChild(h('div', { cls: 'pick', text: dv(x.name) + ' · ' + dv(x.email) + (dv(x.title) ? ' · ' + dv(x.title) : '') + (sv(x.active) === 'false' ? ' (inactif)' : ''), onclick: function () { S.uid = sv(x.sys_id); S.rel = null; inp.value = S.uid; refresh(true); } })); });
    } catch (e) { errBox(e, function () { search(q); }); }
  }

  /* ---------- Démarrage ---------- */
  syncDates(); syncBtns(); drawTabs();
  var det = detectUser();
  if (det) { inp.value = det; inp.classList.add('det'); S.uid = det; refresh(true); }
  else main.appendChild(h('div', { cls: 'ph', text: 'Aucune fiche utilisateur détectée : saisis un nom, un e-mail ou un sys_id, puis « Charger ».' }));
})();
