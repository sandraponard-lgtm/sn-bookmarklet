javascript:(function(){

/* ============================================================
   SN PROJECT HIERARCHY — V1.0
   Bookmarklet de navigation par hiérarchie de projet
   ============================================================ */

const STYLE_ID   = "snphier-style";
const OVERLAY_ID = "snphier-overlay";

document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).remove();
document.getElementById(STYLE_ID)   && document.getElementById(STYLE_ID).remove();

/* ---------- COULEURS ---------- */
const C_IN  = "#2dd9a3";
const C_SEL = "#ffd23a";
const C_PRJ = "#3aa0ff";
const C_T1  = "#b06bff";
const C_T2  = "#ff9f3a";
const C_T3  = "#ff4d6d";
const C_CL  = "#ff4d6d";

function rgba(hex, a){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- COULEUR PAR PROFONDEUR ---------- */
function depthColor(d){
  return [C_PRJ, C_T1, C_T2, C_T3][Math.min(d, 3)];
}

/* ---------- LIENS CLASSIQUE ----------
   urlP = URL quand le nœud sélectionné est le projet (depth=0)
   urlT = URL quand le nœud sélectionné est une tâche  (depth>0)
   Si urlT absent → même URL que urlP
------------------------------------------------------------ */
const CL_BUTTONS = [
  { t: "Classique UI",                  wide: true,
    urlP: (id) => `/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}`,
    urlT: (id) => `/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}` },
  { t: "Cost Plan",
    urlP: (id) => `/cost_plan_list.do?sysparm_query=top_task%3D${id}`,
    urlT: (id) => `/cost_plan_list.do?sysparm_query=task%3D${id}` },
  { t: "Cost Plan Breakdown (Task)",
    urlP: (id) => `/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}`,
    urlT: (id) => `/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}` },
  { t: "Cost Plan Breakdown (CP.Task)",
    urlP: (id) => `/cost_plan_breakdown_list.do?sysparm_query=cost_plan.top_task%3D${id}`,
    urlT: (id) => `/cost_plan_breakdown_list.do?sysparm_query=cost_plan.task%3D${id}` },
  { t: "Time Card",
    urlP: (id) => `/time_card_list.do?sysparm_query=top_task%3D${id}`,
    urlT: (id) => `/time_card_list.do?sysparm_query=task%3D${id}` },
  { t: "Time Card Dailies",
    urlP: (id) => `/time_card_daily_list.do?sysparm_query=time_card.top_task%3D${id}`,
    urlT: (id) => `/time_card_daily_list.do?sysparm_query=time_card.task%3D${id}` },
  { t: "Expense Lines",                 wide: true,
    urlP: (id) => `/fm_expense_line_list.do?sysparm_query=source_id%3D${id}`,
    urlT: (id) => `/fm_expense_line_list.do?sysparm_query=source_id%3D${id}` },
  { t: "Resource Assignments",
    urlP: (id) => `/sn_plng_att_core_resource_assignment_list.do?sysparm_query=top_task%3D${id}`,
    urlT: (id) => `/sn_plng_att_core_resource_assignment_list.do?sysparm_query=task%3D${id}` },
  { t: "Resource Plan",
    urlP: (id) => `/resource_plan_list.do?sysparm_query=top_task%3D${id}`,
    urlT: (id) => `/resource_plan_list.do?sysparm_query=task%3D${id}` },
  { t: "Resource Allocation",
    urlP: (id) => `/resource_allocation_list.do?sysparm_query=resource_plan.top_task%3D${id}`,
    urlT: (id) => `/resource_allocation_list.do?sysparm_query=resource_plan.task%3D${id}` },
];

/* ---------- STYLE ---------- */
const styleEl = document.createElement("style");
styleEl.id = STYLE_ID;
styleEl.textContent = `
@keyframes snphier-fadein{from{opacity:0}to{opacity:1}}
@keyframes snphier-slideup{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
#snphier-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px 20px;font-family:"Segoe UI",Arial,sans-serif;
  background:radial-gradient(circle at 20% -10%,rgba(80,60,160,.35),transparent 55%),
             radial-gradient(circle at 90% 0%,rgba(20,140,160,.25),transparent 50%),
             rgba(6,8,18,.9);
  backdrop-filter:blur(6px);animation:snphier-fadein .15s ease-out}
#snphier-win{position:relative;width:100%;max-width:1100px;color:#eef0fb;
  background:linear-gradient(165deg,rgba(36,38,64,.78),rgba(18,19,36,.85));
  border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:22px 24px 24px;
  box-shadow:0 25px 70px -15px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.03) inset;
  animation:snphier-slideup .18s ease-out}

/* titre */
#snphier-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
#snphier-title h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px;color:${C_IN};text-shadow:0 0 12px ${rgba(C_IN,.55)};margin:0}
#snphier-close{cursor:pointer;font-size:20px;color:rgba(238,240,251,.55);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s}
#snphier-close:hover{background:rgba(255,80,90,.18);color:#ff9aa3}

/* inputs */
#snphier-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.snphier-input-wrap{display:flex;flex-direction:column;gap:4px}
.snphier-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:${rgba(C_IN,.7)}}
.snphier-field{padding:9px 12px;border:1px solid ${rgba(C_IN,.3)};border-radius:10px;font-size:12.5px;
  background:rgba(255,255,255,.06);color:#f4f5ff;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
.snphier-field::placeholder{color:rgba(238,240,251,.35)}
.snphier-field:focus{border-color:${rgba(C_IN,.6)};box-shadow:0 0 0 3px ${rgba(C_IN,.15)}}
.snphier-field.detected{border-color:${rgba(C_IN,.5)};background:${rgba(C_IN,.07)}}
#snphier-autodetect{font-size:11px;color:${rgba(C_IN,.65)};margin-bottom:10px;min-height:15px;font-style:italic}

/* bouton résoudre */
#snphier-resolve-wrap{display:flex;align-items:center;gap:10px;margin-bottom:18px}
#snphier-resolve{flex:1;padding:9px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;
  background:${rgba(C_IN,.18)};border:1px solid ${rgba(C_IN,.4)};color:${C_IN};
  transition:background .15s,box-shadow .15s;font-family:inherit}
#snphier-resolve:hover{background:${rgba(C_IN,.28)};box-shadow:0 0 14px ${rgba(C_IN,.35)}}
#snphier-resolve:disabled{opacity:.45;cursor:default}
#snphier-status{font-size:12px;color:rgba(238,240,251,.55);flex-shrink:0}
#snphier-status.ok{color:${C_IN}}
#snphier-status.err{color:#ff6b7a}

/* layout principal */
#snphier-body{display:grid;grid-template-columns:1fr 1fr;gap:16px}

/* bloc hiérarchie */
#snphier-tree-wrap{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px;min-height:280px;overflow-y:auto;max-height:420px}
#snphier-tree-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:rgba(238,240,251,.4);margin-bottom:12px}
#snphier-tree{font-size:12.5px}
#snphier-tree-empty{color:rgba(238,240,251,.3);font-size:12px;font-style:italic}
.snphier-loading{color:${rgba(C_IN,.6)};font-size:12px;font-style:italic;animation:snphier-fadein .2s}

/* nœuds de l'arbre */
.snphier-node{display:flex;align-items:center;gap:0;padding:2px 0;cursor:pointer;border-radius:6px;transition:background .1s;user-select:none}
.snphier-node:hover .snphier-node-label{opacity:1}
.snphier-node.selected .snphier-node-label{font-weight:600;opacity:1}
.snphier-node.selected .snphier-node-dot{box-shadow:0 0 8px currentColor}
.snphier-node-indent{display:inline-block;flex-shrink:0}
.snphier-node-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-right:8px;transition:box-shadow .15s}
.snphier-node-label{color:#dfe2f5;opacity:.85;transition:opacity .12s,color .12s;line-height:1.4}
.snphier-node-number{font-size:11px;margin-right:5px;font-family:"Consolas","Courier New",monospace}
.snphier-node-name{font-size:12px}
.snphier-node.selected .snphier-node-label{color:#fff}
.snphier-sel-badge{display:none;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;margin-left:7px;background:${rgba(C_SEL,.2)};color:${C_SEL};border:1px solid ${rgba(C_SEL,.4)}}
.snphier-node.selected .snphier-sel-badge{display:inline}
/* compteurs */
.snphier-counts{display:inline-flex;gap:4px;margin-left:8px;vertical-align:middle}
.snphier-count{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;
  padding:1px 6px;border-radius:10px;white-space:nowrap;transition:opacity .2s}
.snphier-count.ra{background:${rgba(C_T1,.18)};color:${C_T1};border:1px solid ${rgba(C_T1,.3)}}
.snphier-count.tc{background:${rgba(C_IN,.15)};color:${C_IN};border:1px solid ${rgba(C_IN,.28)}}
.snphier-count.loading{opacity:.45;font-style:italic}

/* bloc liens */
#snphier-links-wrap{display:flex;flex-direction:column;gap:8px}
#snphier-links-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:rgba(238,240,251,.4);margin-bottom:4px}
#snphier-selected-info{font-size:11.5px;color:${C_SEL};margin-bottom:8px;min-height:16px;font-style:italic}
.snphier-btn{padding:9px 14px;border-radius:9px;font-size:12px;font-weight:500;cursor:pointer;
  text-align:center;border:1px solid;transition:all .15s;font-family:inherit;line-height:1.2}
.snphier-btn:disabled{opacity:.3;cursor:default}
.snphier-btn.wide{width:100%;box-sizing:border-box}
.snphier-btn.cl{background:${rgba(C_CL,.12)};border-color:${rgba(C_CL,.35)};color:${C_CL}}
.snphier-btn.cl:hover:not(:disabled){background:${rgba(C_CL,.22)};box-shadow:0 0 12px ${rgba(C_CL,.3)}}
.snphier-btn.cl.header{background:${rgba(C_CL,.18)};font-weight:700;text-transform:uppercase;letter-spacing:.7px;font-size:11px}
.snphier-btn-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.snphier-sep{height:1px;background:rgba(255,255,255,.07);margin:4px 0}
`;
document.head.appendChild(styleEl);

/* ---------- STATE ---------- */
let resolvedProjectId = null;
let selectedNode = null;
const _countsCache = {}; // { [sys_id]: { ra: n, tc: n, loading: bool } }

/* ---------- HTML ---------- */
const overlay = document.createElement("div");
overlay.id = OVERLAY_ID;
overlay.onclick = e => { if(e.target === overlay) close(); };

function clBtnHtml(b){
  const cls = "snphier-btn cl" + (b.wide ? " wide header" : "");
  return `<button class="${cls}" disabled onclick="snphierOpenCl('${b.t.replace(/'/g,"\\'")}')">
    ${b.t}
  </button>`;
}

function clBtnsHtml(){
  let html = "";
  let gridOpen = false;
  CL_BUTTONS.forEach(b => {
    if(b.wide){
      if(gridOpen){ html += `</div>`; gridOpen = false; }
      html += clBtnHtml(b);
    } else {
      if(!gridOpen){ html += `<div class="snphier-btn-grid">`; gridOpen = true; }
      html += clBtnHtml(b);
    }
  });
  if(gridOpen) html += `</div>`;
  return html;
}

overlay.innerHTML = `
<div id="snphier-win">
  <div id="snphier-title">
    <h2>🗂️ Project Hierarchy</h2>
    <button id="snphier-close" onclick="snphierClose()">&#215;</button>
  </div>

  <div id="snphier-inputs">
    <div class="snphier-input-wrap">
      <span class="snphier-label">Numéro</span>
      <input class="snphier-field" id="snphier-number" placeholder="PRJ0001234"
        oninput="snphierOnInput('number')" onkeydown="if(event.key==='Enter')snphierLoad()">
    </div>
    <div class="snphier-input-wrap">
      <span class="snphier-label">sys_id</span>
      <input class="snphier-field" id="snphier-sysid" placeholder="f041cb6a47653610a1499b83..."
        oninput="snphierOnInput('sysid')" onkeydown="if(event.key==='Enter')snphierLoad()">
    </div>
  </div>
  <div id="snphier-autodetect"></div>

  <div id="snphier-resolve-wrap">
    <button id="snphier-resolve" onclick="snphierLoad()">Charger la hiérarchie</button>
    <span id="snphier-status"></span>
  </div>

  <div id="snphier-body">
    <div>
      <div id="snphier-tree-label">Hiérarchie du projet</div>
      <div id="snphier-tree-wrap">
        <div id="snphier-tree-empty">Entrez un numéro ou sys_id pour charger la hiérarchie.</div>
        <div id="snphier-tree"></div>
      </div>
    </div>
    <div id="snphier-links-wrap">
      <div id="snphier-links-label">Liens</div>
      <div id="snphier-selected-info">Sélectionnez un nœud dans la hiérarchie</div>
      ${clBtnsHtml()}
    </div>
  </div>
</div>`;

document.body.appendChild(overlay);

/* ---------- HELPERS ---------- */
function close(){
  document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).remove();
  document.getElementById(STYLE_ID)   && document.getElementById(STYLE_ID).remove();
  document.removeEventListener("keydown", onKeydown);
}
function onKeydown(e){ if(e.key==="Escape") close(); }
document.addEventListener("keydown", onKeydown);

function setStatus(msg, type){
  const el = document.getElementById("snphier-status");
  el.textContent = msg;
  el.className = type || "";
}

function allLinkBtns(){ return document.querySelectorAll("#snphier-links-wrap .snphier-btn"); }

function selectNode(node){
  selectedNode = node;
  // Mise à jour visuelle des nœuds
  document.querySelectorAll(".snphier-node").forEach(el => el.classList.remove("selected"));
  const nodeEl = document.querySelector(`.snphier-node[data-id="${node.sys_id}"]`);
  if(nodeEl) nodeEl.classList.add("selected");
  // Info sélection
  document.getElementById("snphier-selected-info").textContent =
    `${node.number} — ${node.name}`;
  // Activer les boutons
  allLinkBtns().forEach(b => {
    if(!b.classList.contains("header")) b.disabled = false;
  });
}

function deselectAll(){
  selectedNode = null;
  document.querySelectorAll(".snphier-node").forEach(el => el.classList.remove("selected"));
  document.getElementById("snphier-selected-info").textContent = "Sélectionnez un nœud dans la hiérarchie";
  allLinkBtns().forEach(b => { if(!b.classList.contains("header")) b.disabled = true; });
}

/* ---------- RENDU ARBRE ---------- */
function renderTree(nodes){
  const treeEl = document.getElementById("snphier-tree");
  const emptyEl = document.getElementById("snphier-tree-empty");
  if(!nodes || !nodes.length){
    emptyEl.textContent = "Aucune tâche trouvée.";
    treeEl.innerHTML = "";
    return;
  }
  emptyEl.style.display = "none";
  treeEl.innerHTML = nodes.map(n => renderNode(n)).join("");
}

function renderNode(node){
  const color = depthColor(node.depth);
  const indent = node.depth * 18;
  const safeId = node.sys_id;
  return `<div class="snphier-node" data-id="${safeId}"
    onclick="snphierSelectNode('${safeId}')"
    onmouseenter="snphierHoverNode('${safeId}')"
    style="padding-left:${indent}px">
    <span class="snphier-node-dot" style="color:${color};background:${color}"></span>
    <span class="snphier-node-label">
      <span class="snphier-node-number" style="color:${color}">${node.number}</span>
      <span class="snphier-node-name">${node.name}</span>
      <span class="snphier-sel-badge">sélectionné</span>
    </span>
    <span class="snphier-counts" id="snphier-counts-${safeId}"></span>
  </div>`;
}

/* ---------- CHARGEMENT HIÉRARCHIE ---------- */
// Aplatit l'arbre récursivement avec profondeur
function flattenTree(tasks, parentId, depth, allTasks){
  const children = allTasks.filter(t => t.parent === parentId);
  let result = [];
  children.forEach(t => {
    result.push({ ...t, depth });
    result = result.concat(flattenTree(tasks, t.sys_id, depth + 1, allTasks));
  });
  return result;
}

async function loadHierarchy(projectSysId){
  const treeEl  = document.getElementById("snphier-tree");
  const emptyEl = document.getElementById("snphier-tree-empty");
  treeEl.innerHTML = "";
  emptyEl.style.display = "";
  emptyEl.className = "snphier-loading";
  emptyEl.textContent = "Chargement…";
  deselectAll();

  // Nœud racine (le projet lui-même)
  const rootNumber = document.getElementById("snphier-number").value.trim()
                  || document.getElementById("snphier-sysid").value.trim().slice(0,8)+"…";

  function buildTree(rawTasks, projectNum, projectName){
    const root = {
      sys_id: projectSysId,
      number: projectNum,
      name:   projectName,
      parent: null,
      depth:  0
    };
    const flat = [root, ...flattenTree(rawTasks, projectSysId, 1, rawTasks)];
    renderTree(flat);
    // Mémoriser la map pour la sélection
    window._snphierNodes = {};
    flat.forEach(n => { window._snphierNodes[n.sys_id] = n; });
  }

  // Tentative REST
  try {
    const token = (window.top && window.top.g_ck) || window.g_ck || "";
    const headers = { Accept: "application/json" };
    if(token) headers["X-UserToken"] = token;

    // Infos projet
    const prjRes  = await fetch(`/api/now/table/pm_project?sysparm_query=sys_id=${projectSysId}&sysparm_fields=number,short_description&sysparm_limit=1`, { headers });
    const prjData = await prjRes.json();
    const prjNum  = prjData.result && prjData.result[0] ? prjData.result[0].number : "PRJ";
    const prjName = prjData.result && prjData.result[0] ? prjData.result[0].short_description : "";

    // Toutes les tâches du projet (on filtre par top_task = projectSysId)
    const tskRes  = await fetch(
      `/api/now/table/pm_project_task?sysparm_query=top_task=${projectSysId}&sysparm_fields=sys_id,number,short_description,parent&sysparm_limit=2000`,
      { headers }
    );
    const tskData = await tskRes.json();
    const tasks   = (tskData.result || []).map(t => ({
      sys_id: t.sys_id,
      number: t.number,
      name:   t.short_description || "",
      parent: t.parent ? (t.parent.value || t.parent) : projectSysId
    }));

    buildTree(tasks, prjNum, prjName);
    return;
  } catch(e){}

  // Fallback GlideRecord
  try {
    const GR = (window.top && window.top.GlideRecord) || window.GlideRecord;
    if(!GR) throw new Error("GlideRecord unavailable");

    // Infos projet
    const grPrj = new GR("pm_project");
    grPrj.get(projectSysId, () => {
      const prjNum  = grPrj.getValue("number") || "PRJ";
      const prjName = grPrj.getValue("short_description") || "";

      // Tâches
      const grTsk = new GR("pm_project_task");
      grTsk.addQuery("top_task", projectSysId);
      grTsk.query(() => {
        const tasks = [];
        while(grTsk.next()){
          tasks.push({
            sys_id: grTsk.getUniqueValue(),
            number: grTsk.getValue("number"),
            name:   grTsk.getValue("short_description") || "",
            parent: grTsk.getValue("parent") || projectSysId
          });
        }
        buildTree(tasks, prjNum, prjName);
      });
    });
    return;
  } catch(e){
    emptyEl.className = "";
    emptyEl.textContent = "Erreur de chargement.";
  }
}

/* ---------- HANDLERS GLOBAUX ---------- */
window.snphierClose = close;

window.snphierOnInput = (src) => {
  if(src==="number" && document.getElementById("snphier-number").value.trim())
    document.getElementById("snphier-sysid").value = "";
  if(src==="sysid" && document.getElementById("snphier-sysid").value.trim())
    document.getElementById("snphier-number").value = "";
};

window.snphierSelectNode = (sysId) => {
  const node = window._snphierNodes && window._snphierNodes[sysId];
  if(node) selectNode(node);
};

/* Lazy loading des compteurs au survol */
window.snphierHoverNode = async (sysId) => {
  if(_countsCache[sysId] !== undefined) return; // déjà chargé ou en cours
  _countsCache[sysId] = "loading";

  const el = document.getElementById(`snphier-counts-${sysId}`);
  if(!el) return;
  el.innerHTML = `<span class="snphier-count ra loading">…</span>`;

  const node = window._snphierNodes && window._snphierNodes[sysId];
  const isProject = node && node.depth === 0;

  // Requêtes : RA et TC en parallèle
  const raField = isProject ? `top_task` : `task`;
  const tcField = isProject ? `top_task` : `task`;

  const raUrl = `/api/now/table/sn_plng_att_core_resource_assignment?sysparm_query=${raField}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`;
  const tcUrl = `/api/now/table/time_card?sysparm_query=${tcField}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`;

  const token = (window.top && window.top.g_ck) || window.g_ck || "";
  const headers = { Accept: "application/json" };
  if(token) headers["X-UserToken"] = token;

  try {
    const [raRes, tcRes] = await Promise.all([
      fetch(raUrl, { headers }),
      fetch(tcUrl, { headers })
    ]);
    const raData = await raRes.json();
    const tcData = await tcRes.json();
    const ra = parseInt(raRes.headers.get("X-Total-Count") || (raData.result ? raData.result.length : 0));
    const tc = parseInt(tcRes.headers.get("X-Total-Count") || (tcData.result ? tcData.result.length : 0));
    _countsCache[sysId] = { ra, tc };
    renderCounts(sysId, ra, tc);
  } catch(e){
    // Fallback : compter via GlideRecord
    try {
      const GR = (window.top && window.top.GlideRecord) || window.GlideRecord;
      if(!GR) throw new Error();
      let ra = 0, tc = 0, done = 0;
      const check = () => { if(++done === 2){ _countsCache[sysId]={ra,tc}; renderCounts(sysId,ra,tc); } };
      const grRa = new GR("sn_plng_att_core_resource_assignment");
      grRa.addQuery(raField, sysId);
      grRa.query(() => { while(grRa.next()) ra++; check(); });
      const grTc = new GR("time_card");
      grTc.addQuery(tcField, sysId);
      grTc.query(() => { while(grTc.next()) tc++; check(); });
    } catch(e2){
      delete _countsCache[sysId];
      if(el) el.innerHTML = "";
    }
  }
};

function renderCounts(sysId, ra, tc){
  const el = document.getElementById(`snphier-counts-${sysId}`);
  if(!el) return;
  const raHtml = ra > 0 ? `<span class="snphier-count ra" title="Resource Assignments">👤 ${ra}</span>` : "";
  const tcHtml = tc > 0 ? `<span class="snphier-count tc" title="Time Cards">⏱️ ${tc}</span>` : "";
  el.innerHTML = raHtml + tcHtml;
}

window.snphierOpenCl = (label) => {
  if(!selectedNode) return;
  const btn = CL_BUTTONS.find(b => b.t === label);
  if(!btn) return;
  const urlFn = (selectedNode.depth === 0) ? btn.urlP : btn.urlT;
  window.open(location.origin + urlFn(selectedNode.sys_id), "_blank");
};

window.snphierLoad = async () => {
  const num   = document.getElementById("snphier-number").value.trim();
  const sysid = document.getElementById("snphier-sysid").value.trim();
  const btn   = document.getElementById("snphier-resolve");
  const hexRe = /^[0-9a-f]{32}$/i;

  if(!num && !sysid){ setStatus("Remplis un champ","err"); return; }

  if(sysid && hexRe.test(sysid)){
    resolvedProjectId = sysid;
    setStatus("Chargement…","");
    await loadHierarchy(sysid);
    setStatus("✓ Chargé","ok");
    return;
  }
  if(sysid && !hexRe.test(sysid)){ setStatus("Format invalide (32 hex)","err"); return; }

  if(num){
    btn.disabled = true;
    setStatus("Résolution…","");
    try {
      const token = (window.top && window.top.g_ck) || window.g_ck || "";
      const headers = { Accept:"application/json" };
      if(token) headers["X-UserToken"] = token;
      const res  = await fetch(`/api/now/table/pm_project?sysparm_query=number=${encodeURIComponent(num)}&sysparm_fields=sys_id&sysparm_limit=1`, { headers });
      if(res.ok){
        const data = await res.json();
        if(data.result && data.result.length){
          const id = data.result[0].sys_id;
          document.getElementById("snphier-sysid").value = id;
          resolvedProjectId = id;
          await loadHierarchy(id);
          setStatus("✓ Chargé","ok");
          btn.disabled = false;
          return;
        }
      }
    } catch(e){}
    // Fallback GlideRecord
    try {
      const GR = (window.top && window.top.GlideRecord) || window.GlideRecord;
      if(GR){
        const gr = new GR("pm_project");
        gr.addQuery("number", num.toUpperCase());
        gr.setLimit(1);
        gr.query(async () => {
          if(gr.next()){
            const id = gr.getUniqueValue();
            document.getElementById("snphier-sysid").value = id;
            resolvedProjectId = id;
            await loadHierarchy(id);
            setStatus("✓ Chargé","ok");
          } else {
            setStatus("Projet introuvable","err");
          }
          btn.disabled = false;
        });
        return;
      }
    } catch(e){}
    setStatus("Erreur de résolution","err");
    btn.disabled = false;
  }
};

/* ---------- DÉTECTION AUTO ---------- */
function detectSysId(){
  const url = decodeURIComponent(location.href);
  const m = url.match(/\/pm_project\/([0-9a-f]{32})/i)
          || url.match(/project-id\/([0-9a-f]{32})/i)
          || url.match(/project_resource-([0-9a-f]{32})-pm_project/i)
          || url.match(/[?&]sys_id=([0-9a-f]{32})/i)
          || url.match(/[?&]sysparm_sys_id=([0-9a-f]{32})/i);
  if(m) return m[1];
  try {
    const gf = (window.top && window.top.g_form) || window.g_form;
    if(gf && typeof gf.getUniqueValue==="function"){
      const v = gf.getUniqueValue();
      if(v && /^[0-9a-f]{32}$/i.test(v)) return v;
    }
  } catch(e){}
  const inp = document.querySelector('input[name="sys_id"],input[name="sysparm_sys_id"]');
  if(inp && /^[0-9a-f]{32}$/i.test(inp.value)) return inp.value;
  return null;
}

const autoId = detectSysId();
if(autoId){
  const field = document.getElementById("snphier-sysid");
  field.value = autoId;
  field.classList.add("detected");
  document.getElementById("snphier-autodetect").textContent = "⚡ sys_id détecté depuis la page courante";
  resolvedProjectId = autoId;
  loadHierarchy(autoId).then(() => setStatus("✓ Chargé","ok"));
} else {
  setTimeout(() => { document.getElementById("snphier-number").focus(); }, 100);
}

})();void(0);
