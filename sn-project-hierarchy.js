javascript:(function(){

/* ============================================================
   SN PROJECT HIERARCHY — V2.0
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

function rgba(hex,a){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function depthColor(d){ return [C_PRJ,C_T1,C_T2,C_T3][Math.min(d,3)]; }

/* ---------- LIENS ---------- */
const CL_BUTTONS = [
  { t:"Classique UI", wide:true,
    urlP:(id)=>`/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}`,
    urlT:(id)=>`/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}` },
  { t:"Cost Plan",
    urlP:(id)=>`/cost_plan_list.do?sysparm_query=top_task%3D${id}`,
    urlT:(id)=>`/cost_plan_list.do?sysparm_query=task%3D${id}` },
  { t:"Cost Plan Breakdown (Task)",
    urlP:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}`,
    urlT:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}` },
  { t:"Cost Plan Breakdown (CP.Task)",
    urlP:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=cost_plan.top_task%3D${id}`,
    urlT:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=cost_plan.task%3D${id}` },
  { t:"Time Card",
    urlP:(id)=>`/time_card_list.do?sysparm_query=top_task%3D${id}`,
    urlT:(id)=>`/time_card_list.do?sysparm_query=task%3D${id}` },
  { t:"Time Card Dailies",
    urlP:(id)=>`/time_card_daily_list.do?sysparm_query=time_card.top_task%3D${id}`,
    urlT:(id)=>`/time_card_daily_list.do?sysparm_query=time_card.task%3D${id}` },
  { t:"Expense Lines", wide:true,
    urlP:(id)=>`/fm_expense_line_list.do?sysparm_query=source_id%3D${id}`,
    urlT:(id)=>`/fm_expense_line_list.do?sysparm_query=source_id%3D${id}` },
  { t:"Resource Assignments",
    urlP:(id)=>`/sn_plng_att_core_resource_assignment_list.do?sysparm_query=top_task%3D${id}`,
    urlT:(id)=>`/sn_plng_att_core_resource_assignment_list.do?sysparm_query=task%3D${id}` },
  { t:"Resource Plan",
    urlP:(id)=>`/resource_plan_list.do?sysparm_query=top_task%3D${id}`,
    urlT:(id)=>`/resource_plan_list.do?sysparm_query=task%3D${id}` },
  { t:"Resource Allocation",
    urlP:(id)=>`/resource_allocation_list.do?sysparm_query=resource_plan.top_task%3D${id}`,
    urlT:(id)=>`/resource_allocation_list.do?sysparm_query=resource_plan.task%3D${id}` },
];

/* ---------- TABS DU PANNEAU DROIT ---------- */
const TABS = [
  { id:"links",  label:"🔗 Liens" },
  { id:"ra",     label:"👤 Assignments" },
  { id:"dates",  label:"📅 Dates" },
];

/* ---------- COLONNES RESOURCE ASSIGNMENTS ---------- */
const RA_COLS = [
  { f:"number",          label:"Numéro" },
  { f:"user_resource",   label:"Resource",    type:"ref" },
  { f:"group_resource",  label:"Group",       type:"ref" },
  { f:"role",            label:"Role",        type:"ref" },
  { f:"skill",           label:"Skill",       type:"ref" },
  { f:"effort_type",     label:"Effort type", type:"ref" },
  { f:"effort",          label:"Effort",      type:"num" },
  { f:"start_date",      label:"Start date",  type:"date" },
  { f:"end_date",        label:"End date",    type:"date" },
];

/* ---------- CHAMPS DATES ---------- */
const DATE_FIELDS_TASK = [
  { f:"approved_start_date", label:"Approved start date" },
  { f:"start_date",          label:"Planned start date" },
  { f:"work_start",          label:"Actual start date" },
  { f:"duration",            label:"Planned duration" },
  { f:"effort",              label:"Planned effort",   type:"effort" },
  { f:"approved_end_date",   label:"Approved end date" },
  { f:"end_date",            label:"Planned end date" },
  { f:"work_end",            label:"Actual end date" },
  { f:"work_duration",       label:"Actual duration",  type:"duration" },
  { f:"work_effort",         label:"Actual effort",    type:"effort" },
];
const DATE_FIELDS_PRJ = [
  { f:"approved_start_date", label:"Approved start date" },
  { f:"start_date",          label:"Planned start date" },
  { f:"work_start",          label:"Actual start date" },
  { f:"duration",            label:"Planned duration" },
  { f:"effort",              label:"Planned effort",   type:"effort" },
  { f:"approved_end_date",   label:"Approved end date" },
  { f:"end_date",            label:"Planned end date" },
  { f:"work_end",            label:"Actual end date" },
  { f:"work_duration",       label:"Actual duration",  type:"duration" },
  { f:"work_effort",         label:"Actual effort",    type:"effort" },
];

/* ---------- STYLE ---------- */
const styleEl = document.createElement("style");
styleEl.id = STYLE_ID;
styleEl.textContent = `
@keyframes snphier-fadein{from{opacity:0}to{opacity:1}}
@keyframes snphier-slideup{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
#snphier-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Segoe UI",Arial,sans-serif;
  background:radial-gradient(circle at 20% -10%,rgba(80,60,160,.35),transparent 55%),radial-gradient(circle at 90% 0%,rgba(20,140,160,.25),transparent 50%),rgba(6,8,18,.9);
  backdrop-filter:blur(6px);animation:snphier-fadein .15s ease-out}
#snphier-win{position:relative;width:100%;max-width:1300px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;color:#eef0fb;
  background:linear-gradient(165deg,rgba(36,38,64,.78),rgba(18,19,36,.85));
  border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:20px 22px 22px;
  box-shadow:0 25px 70px -15px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.03) inset;
  animation:snphier-slideup .18s ease-out;overflow:hidden}
/* titre */
#snphier-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-shrink:0}
#snphier-title h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px;color:${C_IN};text-shadow:0 0 12px ${rgba(C_IN,.55)};margin:0}
#snphier-close{cursor:pointer;font-size:20px;color:rgba(238,240,251,.55);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;flex-shrink:0}
#snphier-close:hover{background:rgba(255,80,90,.18);color:#ff9aa3}
/* inputs */
#snphier-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;flex-shrink:0}
.snphier-input-wrap{display:flex;flex-direction:column;gap:4px}
.snphier-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:${rgba(C_IN,.7)}}
.snphier-field{padding:8px 12px;border:1px solid ${rgba(C_IN,.3)};border-radius:10px;font-size:12.5px;
  background:rgba(255,255,255,.06);color:#f4f5ff;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
.snphier-field::placeholder{color:rgba(238,240,251,.35)}
.snphier-field:focus{border-color:${rgba(C_IN,.6)};box-shadow:0 0 0 3px ${rgba(C_IN,.15)}}
.snphier-field.detected{border-color:${rgba(C_IN,.5)};background:${rgba(C_IN,.07)}}
#snphier-autodetect{font-size:11px;color:${rgba(C_IN,.65)};min-height:14px;font-style:italic;margin-bottom:8px;flex-shrink:0}
#snphier-resolve-wrap{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-shrink:0}
#snphier-resolve{flex:1;padding:8px 16px;border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer;
  background:${rgba(C_IN,.18)};border:1px solid ${rgba(C_IN,.4)};color:${C_IN};transition:background .15s;font-family:inherit}
#snphier-resolve:hover{background:${rgba(C_IN,.28)};box-shadow:0 0 14px ${rgba(C_IN,.35)}}
#snphier-resolve:disabled{opacity:.45;cursor:default}
#snphier-status{font-size:11.5px;color:rgba(238,240,251,.55);flex-shrink:0}
#snphier-status.ok{color:${C_IN}}
#snphier-status.err{color:#ff6b7a}
/* layout */
#snphier-body{display:grid;grid-template-columns:340px 1fr;gap:14px;flex:1;min-height:0}
/* arbre */
#snphier-tree-col{display:flex;flex-direction:column;min-height:0}
#snphier-tree-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:rgba(238,240,251,.4);margin-bottom:8px;flex-shrink:0}
#snphier-tree-wrap{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;overflow-y:auto;flex:1}
#snphier-tree{font-size:12px}
#snphier-tree-empty{color:rgba(238,240,251,.3);font-size:12px;font-style:italic}
.snphier-loading{color:${rgba(C_IN,.6)};font-size:12px;font-style:italic}
/* nœuds */
.snphier-node{display:flex;align-items:center;padding:3px 0;cursor:pointer;border-radius:6px;user-select:none}
.snphier-node:hover .snphier-node-label{opacity:1}
.snphier-node.selected .snphier-node-label{font-weight:600;opacity:1;color:#fff}
.snphier-node.selected .snphier-node-dot{box-shadow:0 0 8px currentColor}
.snphier-node-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-right:7px}
.snphier-node-label{color:#dfe2f5;opacity:.8;line-height:1.35}
.snphier-node-number{font-size:10.5px;margin-right:5px;font-family:"Consolas","Courier New",monospace}
.snphier-node-name{font-size:11.5px}
.snphier-sel-badge{display:none;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;margin-left:6px;background:${rgba(C_SEL,.2)};color:${C_SEL};border:1px solid ${rgba(C_SEL,.4)}}
.snphier-node.selected .snphier-sel-badge{display:inline}
.snphier-counts{display:inline-flex;gap:4px;margin-left:6px;vertical-align:middle}
.snphier-count{display:inline-flex;align-items:center;gap:2px;font-size:9.5px;font-weight:600;padding:1px 5px;border-radius:10px;white-space:nowrap}
.snphier-count.ra{background:${rgba(C_T1,.18)};color:${C_T1};border:1px solid ${rgba(C_T1,.3)}}
.snphier-count.tc{background:${rgba(C_IN,.15)};color:${C_IN};border:1px solid ${rgba(C_IN,.28)}}
.snphier-count.loading{opacity:.4;font-style:italic}
/* panneau droit */
#snphier-right-col{display:flex;flex-direction:column;min-height:0}
/* tabs */
#snphier-tabs{display:flex;gap:6px;margin-bottom:10px;flex-shrink:0}
.snphier-tab{padding:6px 14px;border-radius:20px;font-size:11.5px;font-weight:500;cursor:pointer;border:1px solid rgba(255,255,255,.1);
  color:rgba(238,240,251,.55);background:rgba(255,255,255,.04);transition:all .15s;font-family:inherit}
.snphier-tab:hover{background:rgba(255,255,255,.09);color:#fff}
.snphier-tab.active{background:${rgba(C_SEL,.15)};border-color:${rgba(C_SEL,.45)};color:${C_SEL};font-weight:600}
/* panels */
.snphier-panel{display:none;flex:1;flex-direction:column;min-height:0}
.snphier-panel.active{display:flex}
#snphier-selected-info{font-size:11px;color:${C_SEL};margin-bottom:8px;min-height:14px;font-style:italic;flex-shrink:0}
/* liens */
#snphier-links-inner{overflow-y:auto;flex:1}
.snphier-btn{padding:8px 12px;border-radius:9px;font-size:11.5px;font-weight:500;cursor:pointer;
  text-align:center;border:1px solid;transition:all .15s;font-family:inherit;line-height:1.2}
.snphier-btn:disabled{opacity:.3;cursor:default}
.snphier-btn.wide{width:100%;box-sizing:border-box;margin-bottom:5px}
.snphier-btn.cl{background:${rgba(C_CL,.12)};border-color:${rgba(C_CL,.35)};color:${C_CL}}
.snphier-btn.cl:hover:not(:disabled){background:${rgba(C_CL,.22)};box-shadow:0 0 12px ${rgba(C_CL,.3)}}
.snphier-btn.cl.header{background:${rgba(C_CL,.18)};font-weight:700;text-transform:uppercase;letter-spacing:.7px;font-size:10.5px}
.snphier-btn-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px}
/* table RA */
#snphier-ra-panel{overflow:hidden}
#snphier-ra-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-shrink:0}
#snphier-ra-count{font-size:11px;color:rgba(238,240,251,.5)}
#snphier-ra-openall{padding:5px 12px;border-radius:8px;font-size:11px;cursor:pointer;border:1px solid ${rgba(C_CL,.4)};
  background:${rgba(C_CL,.12)};color:${C_CL};font-family:inherit;transition:all .15s}
#snphier-ra-openall:hover{background:${rgba(C_CL,.22)}}
#snphier-ra-openall:disabled{opacity:.35;cursor:default}
#snphier-ra-wrap{overflow-x:auto;overflow-y:auto;flex:1;border-radius:10px;border:1px solid rgba(255,255,255,.07)}
#snphier-ra-empty{color:rgba(238,240,251,.35);font-size:12px;font-style:italic;padding:20px;text-align:center}
#snphier-ra-table{width:100%;border-collapse:collapse;font-size:11.5px}
#snphier-ra-table thead th{position:sticky;top:0;background:rgba(22,24,44,.95);padding:8px 10px;text-align:left;font-size:10px;
  font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:rgba(238,240,251,.5);border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap}
#snphier-ra-table tbody tr{border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;transition:background .1s}
#snphier-ra-table tbody tr:hover{background:rgba(255,255,255,.05)}
#snphier-ra-table tbody td{padding:7px 10px;color:#dde1f7;white-space:nowrap}
#snphier-ra-table tbody td.num{text-align:right}
#snphier-ra-table tbody td.empty{color:rgba(238,240,251,.3);font-style:italic}
#snphier-ra-table tbody td.link{color:${C_PRJ};text-decoration:underline}
/* dates */
#snphier-dates-panel{overflow-y:auto}
.snphier-dates-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px}
.snphier-date-row{display:flex;flex-direction:column;gap:3px}
.snphier-date-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:rgba(238,240,251,.45)}
.snphier-date-val{font-size:12.5px;color:#eef0fb;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:6px 10px;min-height:32px}
.snphier-date-val.empty{color:rgba(238,240,251,.25);font-style:italic}
.snphier-date-val.overdue{background:rgba(255,77,109,.15);border-color:${rgba(C_CL,.4)};color:#ff9aa3}
.snphier-dates-loading{color:${rgba(C_IN,.6)};font-size:12px;font-style:italic;padding:20px 0}
`;
document.head.appendChild(styleEl);

/* ---------- STATE ---------- */
let resolvedProjectId = null;
let selectedNode      = null;
let activeTab         = "links";
const _countsCache    = {};
const _datesCache     = {};
const _raCache        = {};

/* ---------- HELPERS API ---------- */
function apiHeaders(){
  const token = (window.top && window.top.g_ck) || window.g_ck || "";
  const h = { Accept:"application/json" };
  if(token) h["X-UserToken"] = token;
  return h;
}
async function apiFetch(url){ return fetch(url, { headers:apiHeaders() }); }

/* ---------- HTML ---------- */
const overlay = document.createElement("div");
overlay.id = OVERLAY_ID;
overlay.onclick = e => { if(e.target === overlay) close(); };

function clBtnsHtml(){
  let html = ""; let gridOpen = false;
  CL_BUTTONS.forEach(b => {
    if(b.wide){
      if(gridOpen){ html += `</div>`; gridOpen = false; }
      html += `<button class="snphier-btn cl wide header" disabled onclick="snphierOpenCl('${b.t.replace(/'/g,"\\'")}')"> ${b.t}</button>`;
    } else {
      if(!gridOpen){ html += `<div class="snphier-btn-grid">`; gridOpen = true; }
      html += `<button class="snphier-btn cl" disabled onclick="snphierOpenCl('${b.t.replace(/'/g,"\\'")}')"> ${b.t}</button>`;
    }
  });
  if(gridOpen) html += `</div>`;
  return html;
}

const tabsHtml = TABS.map(t =>
  `<button class="snphier-tab${t.id==="links"?" active":""}" onclick="snphierTab('${t.id}')">${t.label}</button>`
).join("");

const raColsHtml = RA_COLS.map(c => `<th>${c.label}</th>`).join("");

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
      <input class="snphier-field" id="snphier-sysid" placeholder="f041cb6a47653610..."
        oninput="snphierOnInput('sysid')" onkeydown="if(event.key==='Enter')snphierLoad()">
    </div>
  </div>
  <div id="snphier-autodetect"></div>
  <div id="snphier-resolve-wrap">
    <button id="snphier-resolve" onclick="snphierLoad()">Charger la hiérarchie</button>
    <span id="snphier-status"></span>
  </div>

  <div id="snphier-body">
    <!-- COL GAUCHE : arbre -->
    <div id="snphier-tree-col">
      <div id="snphier-tree-label">Hiérarchie du projet</div>
      <div id="snphier-tree-wrap">
        <div id="snphier-tree-empty">Entrez un numéro ou sys_id pour charger.</div>
        <div id="snphier-tree"></div>
      </div>
    </div>

    <!-- COL DROITE : tabs + panels -->
    <div id="snphier-right-col">
      <div id="snphier-tabs">${tabsHtml}</div>
      <div id="snphier-selected-info">Sélectionnez un nœud</div>

      <!-- Panel Liens -->
      <div class="snphier-panel active" id="snphier-panel-links">
        <div id="snphier-links-inner">${clBtnsHtml()}</div>
      </div>

      <!-- Panel Resource Assignments -->
      <div class="snphier-panel" id="snphier-panel-ra">
        <div id="snphier-ra-toolbar">
          <span id="snphier-ra-count">—</span>
          <button id="snphier-ra-openall" disabled onclick="snphierRaOpenAll()">↗ Ouvrir la liste</button>
        </div>
        <div id="snphier-ra-wrap">
          <div id="snphier-ra-empty">Sélectionnez un nœud pour charger les assignments.</div>
          <table id="snphier-ra-table" style="display:none">
            <thead><tr>${raColsHtml}</tr></thead>
            <tbody id="snphier-ra-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Panel Dates -->
      <div class="snphier-panel" id="snphier-panel-dates">
        <div id="snphier-dates-content"><div class="snphier-dates-loading">Sélectionnez un nœud.</div></div>
      </div>
    </div>
  </div>
</div>`;

document.body.appendChild(overlay);

/* ---------- FERMETURE / CLAVIER ---------- */
function close(){
  document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).remove();
  document.getElementById(STYLE_ID)   && document.getElementById(STYLE_ID).remove();
  document.removeEventListener("keydown", onKeydown);
}
function onKeydown(e){ if(e.key==="Escape") close(); }
document.addEventListener("keydown", onKeydown);

function setStatus(msg,type){
  const el = document.getElementById("snphier-status");
  el.textContent = msg; el.className = type||"";
}

/* ---------- TABS ---------- */
window.snphierTab = (tabId) => {
  activeTab = tabId;
  document.querySelectorAll(".snphier-tab").forEach(t => t.classList.toggle("active", t.textContent.includes(TABS.find(x=>x.id===tabId).label.split(" ").pop())));
  // forcer la correspondance par onclick
  document.querySelectorAll(".snphier-tab").forEach(t => {
    const m = t.getAttribute("onclick").match(/'(\w+)'/);
    if(m) t.classList.toggle("active", m[1]===tabId);
  });
  document.querySelectorAll(".snphier-panel").forEach(p => p.classList.remove("active"));
  const panel = document.getElementById(`snphier-panel-${tabId}`);
  if(panel) panel.classList.add("active");
  if(selectedNode){
    if(tabId==="ra")    loadRA(selectedNode);
    if(tabId==="dates") loadDates(selectedNode);
  }
};

/* ---------- SÉLECTION NŒUD ---------- */
function allLinkBtns(){ return document.querySelectorAll("#snphier-links-inner .snphier-btn:not(.header)"); }

function selectNode(node){
  selectedNode = node;
  document.querySelectorAll(".snphier-node").forEach(el => el.classList.remove("selected"));
  const nodeEl = document.querySelector(`.snphier-node[data-id="${node.sys_id}"]`);
  if(nodeEl) nodeEl.classList.add("selected");
  document.getElementById("snphier-selected-info").textContent = `${node.number} — ${node.name}`;
  allLinkBtns().forEach(b => b.disabled=false);
  document.getElementById("snphier-ra-openall").disabled = false;
  if(activeTab==="ra")    loadRA(node);
  if(activeTab==="dates") loadDates(node);
}

function deselectAll(){
  selectedNode = null;
  document.querySelectorAll(".snphier-node").forEach(el=>el.classList.remove("selected"));
  document.getElementById("snphier-selected-info").textContent = "Sélectionnez un nœud";
  allLinkBtns().forEach(b=>b.disabled=true);
  document.getElementById("snphier-ra-openall").disabled = true;
}

window.snphierSelectNode = (sysId) => {
  const node = window._snphierNodes && window._snphierNodes[sysId];
  if(node) selectNode(node);
};

window.snphierOpenCl = (label) => {
  if(!selectedNode) return;
  const btn = CL_BUTTONS.find(b=>b.t===label);
  if(!btn) return;
  const urlFn = selectedNode.depth===0 ? btn.urlP : btn.urlT;
  window.open(location.origin + urlFn(selectedNode.sys_id), "_blank");
};

window.snphierRaOpenAll = () => {
  if(!selectedNode) return;
  const btn = CL_BUTTONS.find(b=>b.t==="Resource Assignments");
  if(!btn) return;
  const urlFn = selectedNode.depth===0 ? btn.urlP : btn.urlT;
  window.open(location.origin + urlFn(selectedNode.sys_id), "_blank");
};

/* ---------- LOAD RESOURCE ASSIGNMENTS ---------- */
async function loadRA(node){
  if(_raCache[node.sys_id]){ renderRA(node, _raCache[node.sys_id]); return; }
  const emptyEl = document.getElementById("snphier-ra-empty");
  const tableEl = document.getElementById("snphier-ra-table");
  emptyEl.textContent = "Chargement…"; emptyEl.style.display=""; tableEl.style.display="none";
  document.getElementById("snphier-ra-count").textContent = "…";
  const isProj = node.depth===0;
  const qField = isProj ? "top_task" : "task";
  const fields = RA_COLS.map(c=>c.f).join(",");
  try {
    const res  = await apiFetch(`/api/now/table/sn_plng_att_core_resource_assignment?sysparm_query=${qField}=${node.sys_id}&sysparm_fields=${fields},sys_id&sysparm_limit=200`);
    const data = await res.json();
    const rows = data.result || [];
    _raCache[node.sys_id] = rows;
    renderRA(node, rows);
  } catch(e){
    emptyEl.textContent = "Erreur de chargement.";
  }
}

function fmtCell(row, col){
  const raw = row[col.f];
  if(!raw && raw!==0) return `<td class="empty">(empty)</td>`;
  if(col.type==="ref"){
    const v = raw.display_value || raw.value || raw;
    return v ? `<td>${v}</td>` : `<td class="empty">(empty)</td>`;
  }
  if(col.type==="date"){
    const v = raw.display_value || raw.value || raw;
    return `<td>${v}</td>`;
  }
  if(col.type==="num")  return `<td class="num">${raw.display_value||raw.value||raw}</td>`;
  return `<td>${raw.display_value||raw.value||raw||""}</td>`;
}

function renderRA(node, rows){
  const emptyEl = document.getElementById("snphier-ra-empty");
  const tableEl = document.getElementById("snphier-ra-table");
  const tbodyEl = document.getElementById("snphier-ra-tbody");
  document.getElementById("snphier-ra-count").textContent = `${rows.length} enregistrement${rows.length!==1?"s":""}`;
  if(!rows.length){
    emptyEl.textContent = "Aucun assignment trouvé."; emptyEl.style.display=""; tableEl.style.display="none"; return;
  }
  emptyEl.style.display="none"; tableEl.style.display="";
  tbodyEl.innerHTML = rows.map(row => {
    const sysId = row.sys_id;
    const cells = RA_COLS.map(col => fmtCell(row, col)).join("");
    return `<tr onclick="window.open('${location.origin}/now/nav/ui/classic/params/target/sn_plng_att_core_resource_assignment.do?sys_id=${sysId}','_blank')">${cells}</tr>`;
  }).join("");
}

/* ---------- LOAD DATES ---------- */
async function loadDates(node){
  const contentEl = document.getElementById("snphier-dates-content");
  if(_datesCache[node.sys_id]){ renderDates(node, _datesCache[node.sys_id]); return; }
  contentEl.innerHTML = `<div class="snphier-dates-loading">Chargement…</div>`;
  const isProj = node.depth===0;
  const table  = isProj ? "pm_project" : "pm_project_task";
  const fields = (isProj ? DATE_FIELDS_PRJ : DATE_FIELDS_TASK).map(f=>f.f).join(",");
  try {
    const res  = await apiFetch(`/api/now/table/${table}?sysparm_query=sys_id=${node.sys_id}&sysparm_fields=${fields}&sysparm_limit=1`);
    const data = await res.json();
    const rec  = data.result && data.result[0] ? data.result[0] : {};
    _datesCache[node.sys_id] = rec;
    renderDates(node, rec);
  } catch(e){
    contentEl.innerHTML = `<div class="snphier-dates-loading">Erreur de chargement.</div>`;
  }
}

function renderDates(node, rec){
  const contentEl = document.getElementById("snphier-dates-content");
  const fields    = node.depth===0 ? DATE_FIELDS_PRJ : DATE_FIELDS_TASK;
  const now       = new Date();
  const rows = fields.map(f => {
    const raw = rec[f.f];
    let val   = raw ? (raw.display_value || raw.value || raw) : "";
    let cls   = val ? "" : "empty";
    // Détecter dépassement sur les dates de fin planifiées
    if(val && (f.f==="end_date" || f.f==="approved_end_date")){
      const d = new Date(val);
      if(!isNaN(d) && d < now) cls = "overdue";
    }
    return `<div class="snphier-date-row">
      <span class="snphier-date-label">${f.label}</span>
      <div class="snphier-date-val ${cls}">${val || "—"}</div>
    </div>`;
  }).join("");
  contentEl.innerHTML = `<div class="snphier-dates-grid">${rows}</div>`;
}

/* ---------- COMPTEURS AU SURVOL ---------- */
window.snphierHoverNode = async (sysId) => {
  if(_countsCache[sysId] !== undefined) return;
  _countsCache[sysId] = "loading";
  const el = document.getElementById(`snphier-counts-${sysId}`);
  if(!el) return;
  el.innerHTML = `<span class="snphier-count ra loading">…</span>`;
  const node = window._snphierNodes && window._snphierNodes[sysId];
  const isProject = node && node.depth===0;
  const field = isProject ? "top_task" : "task";
  try {
    const [raRes,tcRes] = await Promise.all([
      apiFetch(`/api/now/table/sn_plng_att_core_resource_assignment?sysparm_query=${field}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
      apiFetch(`/api/now/table/time_card?sysparm_query=${field}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`)
    ]);
    const raData = await raRes.json(); const tcData = await tcRes.json();
    const ra = parseInt(raRes.headers.get("X-Total-Count")||(raData.result?raData.result.length:0));
    const tc = parseInt(tcRes.headers.get("X-Total-Count")||(tcData.result?tcData.result.length:0));
    _countsCache[sysId] = {ra,tc};
    if(el){
      el.innerHTML = (ra>0?`<span class="snphier-count ra" title="Resource Assignments">👤 ${ra}</span>`:"")
                   + (tc>0?`<span class="snphier-count tc" title="Time Cards">⏱️ ${tc}</span>`:"");
    }
  } catch(e){ delete _countsCache[sysId]; if(el) el.innerHTML=""; }
};

/* ---------- ARBRE ---------- */
function flattenTree(tasks,parentId,depth,all){
  return all.filter(t=>t.parent===parentId).flatMap(t=>[{...t,depth},...flattenTree(tasks,t.sys_id,depth+1,all)]);
}

function renderNode(node){
  const color=depthColor(node.depth), indent=node.depth*16, id=node.sys_id;
  return `<div class="snphier-node" data-id="${id}"
    onclick="snphierSelectNode('${id}')" onmouseenter="snphierHoverNode('${id}')"
    style="padding-left:${indent}px">
    <span class="snphier-node-dot" style="background:${color}"></span>
    <span class="snphier-node-label">
      <span class="snphier-node-number" style="color:${color}">${node.number}</span>
      <span class="snphier-node-name">${node.name}</span>
      <span class="snphier-sel-badge">sélectionné</span>
    </span>
    <span class="snphier-counts" id="snphier-counts-${id}"></span>
  </div>`;
}

function renderTree(nodes){
  const treeEl=document.getElementById("snphier-tree");
  const emptyEl=document.getElementById("snphier-tree-empty");
  if(!nodes||!nodes.length){ emptyEl.textContent="Aucune tâche trouvée."; treeEl.innerHTML=""; return; }
  emptyEl.style.display="none";
  treeEl.innerHTML=nodes.map(renderNode).join("");
}

/* ---------- CHARGEMENT HIÉRARCHIE ---------- */
async function loadHierarchy(projectSysId){
  const treeEl=document.getElementById("snphier-tree");
  const emptyEl=document.getElementById("snphier-tree-empty");
  treeEl.innerHTML=""; emptyEl.style.display=""; emptyEl.className="snphier-loading"; emptyEl.textContent="Chargement…";
  deselectAll();
  Object.keys(_raCache).forEach(k=>delete _raCache[k]);
  Object.keys(_datesCache).forEach(k=>delete _datesCache[k]);
  Object.keys(_countsCache).forEach(k=>delete _countsCache[k]);

  function buildTree(rawTasks,prjNum,prjName){
    const root={sys_id:projectSysId,number:prjNum,name:prjName,parent:null,depth:0};
    const flat=[root,...flattenTree(rawTasks,projectSysId,1,rawTasks)];
    renderTree(flat);
    window._snphierNodes={};
    flat.forEach(n=>{window._snphierNodes[n.sys_id]=n;});
  }

  try {
    const [prjRes,tskRes] = await Promise.all([
      apiFetch(`/api/now/table/pm_project?sysparm_query=sys_id=${projectSysId}&sysparm_fields=number,short_description&sysparm_limit=1`),
      apiFetch(`/api/now/table/pm_project_task?sysparm_query=top_task=${projectSysId}&sysparm_fields=sys_id,number,short_description,parent&sysparm_limit=2000`)
    ]);
    const prjData=await prjRes.json(); const tskData=await tskRes.json();
    const prjNum=prjData.result&&prjData.result[0]?prjData.result[0].number:"PRJ";
    const prjName=prjData.result&&prjData.result[0]?prjData.result[0].short_description:"";
    const tasks=(tskData.result||[]).map(t=>({
      sys_id:t.sys_id, number:t.number, name:t.short_description||"",
      parent:t.parent?(t.parent.value||t.parent):projectSysId
    }));
    buildTree(tasks,prjNum,prjName); return;
  } catch(e){}

  // Fallback GlideRecord
  try {
    const GR=(window.top&&window.top.GlideRecord)||window.GlideRecord;
    if(!GR) throw new Error();
    const grPrj=new GR("pm_project");
    grPrj.get(projectSysId,()=>{
      const prjNum=grPrj.getValue("number")||"PRJ";
      const prjName=grPrj.getValue("short_description")||"";
      const grTsk=new GR("pm_project_task");
      grTsk.addQuery("top_task",projectSysId);
      grTsk.query(()=>{
        const tasks=[];
        while(grTsk.next()) tasks.push({sys_id:grTsk.getUniqueValue(),number:grTsk.getValue("number"),
          name:grTsk.getValue("short_description")||"",parent:grTsk.getValue("parent")||projectSysId});
        buildTree(tasks,prjNum,prjName);
      });
    }); return;
  } catch(e){ emptyEl.className=""; emptyEl.textContent="Erreur de chargement."; }
}

/* ---------- RÉSOUDRE SUB_TREE_ROOT ----------
   Si l'URL/page correspond à une tâche et non un projet,
   on récupère sub_tree_root pour remonter au projet
------------------------------------------------------------ */
async function resolveToProject(sysId){
  try {
    const res  = await apiFetch(`/api/now/table/pm_project_task?sysparm_query=sys_id=${sysId}&sysparm_fields=sub_tree_root,number&sysparm_limit=1`);
    const data = await res.json();
    if(data.result && data.result[0]){
      const subRoot = data.result[0].sub_tree_root;
      const prjId   = subRoot ? (subRoot.value||subRoot) : null;
      if(prjId && /^[0-9a-f]{32}$/i.test(prjId)) return prjId;
    }
  } catch(e){}
  return null; // pas une tâche, ou erreur
}

/* ---------- HANDLERS PRINCIPAUX ---------- */
window.snphierClose = close;

window.snphierOnInput = (src) => {
  if(src==="number"&&document.getElementById("snphier-number").value.trim())
    document.getElementById("snphier-sysid").value="";
  if(src==="sysid"&&document.getElementById("snphier-sysid").value.trim())
    document.getElementById("snphier-number").value="";
};

window.snphierLoad = async () => {
  const num   = document.getElementById("snphier-number").value.trim();
  const sysid = document.getElementById("snphier-sysid").value.trim();
  const btn   = document.getElementById("snphier-resolve");
  const hexRe = /^[0-9a-f]{32}$/i;
  if(!num&&!sysid){ setStatus("Remplis un champ","err"); return; }
  if(sysid&&hexRe.test(sysid)){
    btn.disabled=true; setStatus("Chargement…","");
    // Tenter de résoudre comme tâche → projet
    const prjId = await resolveToProject(sysid);
    const id = prjId || sysid;
    if(prjId){ document.getElementById("snphier-sysid").value=prjId; setStatus("↑ Projet trouvé via sub_tree_root","ok"); }
    resolvedProjectId=id;
    await loadHierarchy(id);
    setStatus("✓ Chargé","ok");
    btn.disabled=false; return;
  }
  if(sysid&&!hexRe.test(sysid)){ setStatus("Format invalide (32 hex)","err"); return; }
  if(num){
    btn.disabled=true; setStatus("Résolution…","");
    try {
      const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=number=${encodeURIComponent(num)}&sysparm_fields=sys_id&sysparm_limit=1`);
      if(res.ok){
        const data=await res.json();
        if(data.result&&data.result.length){
          const id=data.result[0].sys_id;
          document.getElementById("snphier-sysid").value=id;
          resolvedProjectId=id; await loadHierarchy(id); setStatus("✓ Chargé","ok"); btn.disabled=false; return;
        }
      }
    } catch(e){}
    try {
      const GR=(window.top&&window.top.GlideRecord)||window.GlideRecord;
      if(GR){
        const gr=new GR("pm_project");
        gr.addQuery("number",num.toUpperCase()); gr.setLimit(1);
        gr.query(async()=>{
          if(gr.next()){
            const id=gr.getUniqueValue();
            document.getElementById("snphier-sysid").value=id;
            resolvedProjectId=id; await loadHierarchy(id); setStatus("✓ Chargé","ok");
          } else setStatus("Introuvable","err");
          btn.disabled=false;
        }); return;
      }
    } catch(e){}
    setStatus("Erreur","err"); btn.disabled=false;
  }
};

/* ---------- DÉTECTION AUTO ---------- */
function detectSysId(){
  const url=decodeURIComponent(location.href);
  const m=url.match(/\/pm_project\/([0-9a-f]{32})/i)||url.match(/project-id\/([0-9a-f]{32})/i)
         ||url.match(/project_resource-([0-9a-f]{32})-pm_project/i)
         ||url.match(/[?&]sys_id=([0-9a-f]{32})/i)||url.match(/[?&]sysparm_sys_id=([0-9a-f]{32})/i);
  if(m) return m[1];
  try {
    const gf=(window.top&&window.top.g_form)||window.g_form;
    if(gf&&typeof gf.getUniqueValue==="function"){ const v=gf.getUniqueValue(); if(v&&/^[0-9a-f]{32}$/i.test(v)) return v; }
  } catch(e){}
  const inp=document.querySelector('input[name="sys_id"],input[name="sysparm_sys_id"]');
  if(inp&&/^[0-9a-f]{32}$/i.test(inp.value)) return inp.value;
  return null;
}

(async()=>{
  const autoId=detectSysId();
  if(autoId){
    const field=document.getElementById("snphier-sysid");
    field.value=autoId; field.classList.add("detected");
    setStatus("Résolution…","");
    // Tenter de remonter au projet si c'est une tâche
    const prjId=await resolveToProject(autoId);
    const id=prjId||autoId;
    if(prjId){
      field.value=prjId;
      document.getElementById("snphier-autodetect").textContent="⚡ Projet détecté via la tâche courante (sub_tree_root)";
    } else {
      document.getElementById("snphier-autodetect").textContent="⚡ sys_id détecté depuis la page courante";
    }
    resolvedProjectId=id;
    await loadHierarchy(id);
    setStatus("✓ Chargé","ok");
  } else {
    setTimeout(()=>{ document.getElementById("snphier-number").focus(); },100);
  }
})();

})();void(0);
