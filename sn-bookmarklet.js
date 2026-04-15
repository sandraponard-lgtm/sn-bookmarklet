javascript:(function(){

/* ============================================================
   CONFIGURATION — zone éditable
   ============================================================

   Chaque entrée de `data` est une COLONNE du menu.
     f  → Titre de la colonne
     c  → Couleur accent hex  ex: "#2980b9"
     l  → Liste des éléments

   SECTION  : { section: "Titre" }
   LIEN     : { t: "Texte", u: "/url" }
   LIEN RAW : { t: "Texte", u: "/url", raw: true }   ← ouvre sans /now/nav/ui/classic
   ACTION JS: { t: "Texte", h: "handler_key" }

   ============================================================ */

const data = [

  { f: "Home, Portals & Workspaces", c: "#2980b9", l: [
    { section: "Home" },
      { t: "Home",                    u: "/home.do" },
    { section: "Portal" },
      { t: "Service Portal",          u: "/sp",   raw: true },
      { t: "Employee Portal",         u: "/esc",  raw: true },
      { t: "Time Sheet Portal",       u: "/tcp",  raw: true },
    { section: "Workspaces" },
      { t: "SOW",                     u: "/now/sow/home" },
      { t: "CWM",                     u: "/now/cwm/home/" },
      { t: "Project WS",              u: "/now/workspace/project/home/" },
      { t: "Resource WS",             u: "/now/workspace/rm/home" },
      { t: "SPW",                     u: "/now/alignment-workspace/portfolio-plans" },
    { section: "Quick Links" },
      { t: "Agile Board Tracking",    u: "/$agile_board.do#/sprint_tracking" },
  ]},

  { f: "Admin", c: "#c0392b", l: [
    { section: "Update Sets" },
      { t: "➕ Créer un Update Set",   u: "/sys_update_set.do?sys_id=-1" },
      { t: "💧 Update Sources",        u: "/sys_update_set_source_list.do" },
      { t: "📤 Local Update Sets",     u: "/sys_update_set_list.do" },
      { t: "📥 Retrieved Update Sets", u: "/sys_remote_update_set_list.do" },
      { t: "👩‍💻 Customer Updates",      u: "/sys_update_xml_list.do" },
    { section: "Scripting & Log" },
      { t: "Logs 5min SPO",           u: "/syslog_list.do?sysparm_query=sys_created_onRELATIVEGT@minute@ago@5^sourceLIKESPO" },
      { t: "Scripts Background",      u: "/sys.scripts.do" },
      { t: "Debugger",                h: "debugger" },
    { section: "Quick Links" },
      { t: "Access Analyzer",         u: "/now/access-management/access-analyzer/params/selected-tab-index/1" },
      { t: "UI Builder",              u: "/now/builder/ui/home" },
      { t: "Plugins",                 u: "/now/app-manager/home" },
      { t: "Icons",                   u: "/styles/retina_icons/retina_icons.html" },
  ]},

  { f: "Development", c: "#8e44ad", l: [
    { section: "Scripts" },
      { t: "UI Actions",              u: "/sys_ui_action_list.do" },
      { t: "Client Scripts",          u: "/ssys_script_client_list.do" },
      { t: "Fix Scripts",             u: "/sys_script_fix_list.do" },
      { t: "Business Rules",          u: "/sys_script_list.do" },
    { section: "Automation" },
      { t: "Scheduled Jobs",          u: "/sys_trigger_list.do" },
      { t: "Scheduled Script Exec.",  u: "/sysauto_script_list.do" },
      { t: "Running Scheduled Jobs",  u: "/v_running_scheduled_job.do" },
      { t: "Job History By Nodes",    u: "/sys_scheduler_job_history_node_list.do" },
    { section: "Remote Table" },
      { t: "Tables (scriptable)",     u: "/sys_db_object_list.do?sysparm_query=scriptable_table%3Dtrue" },
      { t: "Définitions",             u: "/sys_script_vtable_list.do" },
    { section: "💬 Translation" },
      { t: "Debug ON",                u: "/sys.scripts.do?action=run_module&sys_id=24218d20c3031100c409fd251eba8f52" },
      { t: "Debug OFF",               u: "/sys.scripts.do?action=run_module&sys_id=e4910160c3031100c409fd251eba8f53" },
      { t: "TRT | Translated Texts",  u: "/sys_translated_text_list.do" },
      { t: "TRL | Translated Names",  u: "/sys_translated_list.do" },
      { t: "MSG | Messages",          u: "/sys_ui_message_list.do" },
    { section: "✉️ Emails" },
      { t: "Emails TODAY",            u: "/sys_email_list.do?sysparm_query=sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()" },
      { t: "Notifications",           u: "/sysevent_email_action_list.do" },
      { t: "Events Log",              u: "/sysevent_list.do" },
    { section: "Data Import/Export" },
      { t: "Data Sources",            u: "/sys_data_source_list.do" },
      { t: "Transform Maps",          u: "/sys_transform_entry_list.do" },
    { section: "Others" },
      { t: "UI Views",                u: "/sys_ui_view_list.do" },
  ]},

  { f: "Data Foundations", c: "#d35400", l: [
    { section: "Users & Groups" },
      { t: "Employee Profiles",       u: "/sn_employee_profile_list.do" },
      { t: "Users",                   u: "/sys_user_list.do" },
      { t: "Groups",                  u: "/sys_user_group_list.do" },
      { t: "Roles",                   u: "/sys_user_role_list.do" },
    { section: "Organisation" },
      { t: "Locations",               u: "/cmn_location_list.do" },
      { t: "Companies",               u: "/core_company_list.do" },
      { t: "Business Unit",           u: "/business_unit_list.do" },
      { t: "Departments",             u: "/cmn_department_list.do" },
    { section: "Other" },
      { t: "Schedule",                u: "/cmn_schedule_list.do" },
      { t: "Schedule Entries",        u: "/cmn_schedule_span_list.do" },
      { t: "Attachments",             u: "/sys_attachment_list.do" },
  ]},

  { f: "Plateforme", c: "#27ae60", l: [
    { section: "Budget" },
      { t: "Project Funding (old)",   u: "/project_funding_list.do" },
      { t: "Project Budget",          u: "/sn_invst_pln_invst_budget_list.do" },
    { section: "Planned" },
      { t: "Cost Plans",              u: "/cost_plan_list.do" },
      { t: "Cost Plan Breakdowns",    u: "/cost_plan_breakdown_list.do" },
      { t: "Cost Type (definition)",  u: "/resource_type_definition_list.do" },
    { section: "Actuals" },
      { t: "Expense Lines",           u: "/fm_expense_line_list.do" },
  ]},

  { f: "CSDM", c: "#16a085", l: [
    { section: "Service Delivery" },
      { t: "🟠 Tech Mgmt Service",    u: "/cmdb_ci_service_technical_list.do" },
      { t: "🟠 Tech Svc Offering",    u: "/service_offering_list.do?sysparm_query=service_classification%3DTechnical%20Service" },
      { t: "🟠 Service Instance",     u: "/cmdb_ci_service_auto_list.do" },
      { t: "🟠 Service Instance CSDM",u: "/csdm_app_services_list.do" },
      { t: "🟠 Dynamic CI Group",     u: "/cmdb_ci_query_based_service_list.do" },
    { section: "Service Consumption" },
      { t: "🟢 Business Svc Offering",u: "/service_offering_list.do?sysparm_query=service_classification%3DBusiness%20Service" },
      { t: "🟢 Business Service",     u: "/cmdb_ci_service_business_list.do" },
    { section: "Design & Planning" },
      { t: "🔵 Business Capability",  u: "/cmdb_ci_business_capability_list.do" },
      { t: "🔵 Business Application", u: "/cmdb_ci_business_app_list.do" },
  ]},

  { f: "SPM", c: "#f39c12", l: [
    { section: "Demands" },
      { t: "Demands",                 u: "/dmn_demand_list.do" },
      { t: "Demand Tasks",            u: "/dmn_demand_task_list.do" },
    { section: "Projects" },
      { t: "Projects",                u: "/pm_project_list.do" },
      { t: "Project Tasks",           u: "/pm_project_task_list.do" },
    { section: "Time Tracking" },
      { t: "Time Sheet",              u: "/time_sheet_list.do" },
      { t: "Time Cards",              u: "/time_card_list.do" },
      { t: "Time Card Daily",         u: "/time_card_daily_list.do" },
    { section: "Resource Data" },
      { t: "Resource Users",          u: "/sys_user_list.do?sysparm_query=roles%3Dpps_resource%5E&sysparm_view=resource_manager" },
      { t: "Resource Groups",         u: "/sys_user_group_list.do?sysparm_query=roles%3Dpps_resource%5E&sysparm_view=resource_manager" },
      { t: "Resource Plans",          u: "/resource_plan_list.do" },
    { section: "Assignment" },
      { t: "Resource Assignment",     u: "/sn_plng_att_core_resource_assignment_list.do" },
      { t: "Resource Allocation",     u: "/resource_allocation_list.do" },
      { t: "Resource Alloc. Daily",   u: "/resource_allocation_daily_list.do" },
    { section: "Aggregates" },
      { t: "Aggregate Monthly",       u: "/resource_aggregate_monthly_list.do" },
      { t: "Aggregate Weekly",        u: "/resource_aggregate_monthly_list.do" },
      { t: "DBV profile + aggregate", u: "/sn_plng_att_core_attribute_based_resource_aggregates_list.do" },
    { section: "Goals Framework" },
      { t: "Strategic Value",         u: "/sn_gf_strategy_value_list.do" },
      { t: "Strategic Plan",          u: "/sn_gf_strategic_plan_list.do" },
      { t: "Strategic Priority",      u: "/sn_gf_strategy_list.do" },
      { t: "Goals",                   u: "/sn_gf_core_goal_list.do" },
      { t: "Targets",                 u: "/sn_gf_goal_target_list.do" },
    { section: "Strategic Planning" },
      { t: "Portfolio Plan Config",   u: "/sn_align_ws_roadmap_configuration_list.do" },
      { t: "Integrations",            u: "/sn_align_cmn_int_integrations_setup_list.do" },
      { t: "Lens",                    u: "/sn_align_core_lens_list.do" },
      { t: "Planning Attributes",     u: "/sn_plng_att_core_planning_attribute_list.do" },
    { section: "Strategic Planning Data" },
      { t: "Planning Items",          u: "/sn_align_core_planning_item_list.do" },
      { t: "Portfolio Plan",          u: "/sn_align_ws_portfolio_plan_list.do" },
      { t: "Portfolio Plan View",     u: "/sn_align_ws_portfolio_plan_view_list.do" },
  ]},

];

/* ============================================================
   HANDLERS JS
   ============================================================ */

const HANDLERS = {
  debugger: () => window.top.launchScriptDebugger(),
};

/* ============================================================
   FIN DE CONFIGURATION
   ============================================================ */

const STORAGE_KEY = "sn_ql_pins_v2";
const MAX_PINS    = 50;

// Pré-calcul d'un index global stable : chaque item reçoit un id unique
const ITEM_MAP = {};
let _idx = 0;
data.forEach(col => col.l.forEach(item => {
  if(item.t){ item._id = "i"+(_idx++); ITEM_MAP[item._id] = item; }
}));

function loadPins(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch(e){return[];}}
function savePins(p){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(p));}catch(e){}}

const classicUrl = p => location.origin+"/now/nav/ui/classic/params/target/"+encodeURIComponent(p);
const rawUrl     = p => location.origin+p;
const rgba       = (hex,a) => {const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};

const STAR_SVG = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path class="sf" d="M8 1.5l1.8 4.9H15l-4.3 3.2 1.6 4.9L8 11.8l-4.3 2.7 1.6-4.9L1 6.4h5.2z" stroke-linejoin="round" stroke-width="1.4"/></svg>`;
const SAME_SVG = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,3 13,3 13,7"/><line x1="13" y1="3" x2="7" y2="9"/><polyline points="6,4 3,4 3,13 12,13 12,10"/></svg>`;

const CSS = `
#snql-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:2147483647;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;font-family:"Segoe UI",Arial,sans-serif}
#snql-win{background:#fff;border-radius:12px;padding:20px;width:100%;max-width:1400px;position:relative;color:#111}
#snql-topbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;border-bottom:1px solid #eee;padding-bottom:12px}
#snql-search-wrap{flex:1;position:relative}
#snql-search-wrap input{width:100%;padding:7px 10px 7px 32px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#f8f8f8;color:#111;outline:none}
#snql-search-wrap input:focus{border-color:#999;background:#fff}
#snql-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none;color:#999}
#snql-close{cursor:pointer;font-size:22px;color:#999;background:none;border:none;padding:4px 8px;border-radius:6px;line-height:1}
#snql-close:hover{background:#f0f0f0;color:#333}
#snql-tabs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px}
.snql-tab{font-size:11px;font-weight:500;padding:4px 11px;border-radius:20px;cursor:pointer;border:1px solid transparent;color:#666;background:none}
.snql-tab:hover{background:#f0f0f0;color:#333}
.snql-tab.active{border-color:#ccc;background:#f0f0f0;color:#111}
#snql-grid,#snql-home{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;align-items:start}
.snql-block{break-inside:avoid}
.snql-col-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;border-bottom:2px solid;margin-bottom:6px}
.snql-col-bar{height:0;border-bottom:2px solid;margin-bottom:6px}
.snql-sec{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;padding:4px 5px 3px;border-radius:4px;margin-top:4px;margin-bottom:2px;line-height:1.3}
.snql-row{display:flex;align-items:center;padding:3px 3px;border-bottom:1px solid #f2f2f2;gap:2px;border-radius:4px}
.snql-row:hover{background:#f7f7f7}
.snql-row:last-child{border-bottom:none}
.snql-link{font-size:12px;color:#333;text-decoration:none;flex:1;cursor:pointer;line-height:1.3;background:none;border:none;text-align:left;padding:0;font-family:inherit}
.snql-link:hover{color:#111}
.snql-action{width:18px;height:18px;background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;border-radius:3px;color:#bbb;font-size:11px}
.snql-row:hover .snql-action{opacity:1}
.snql-action:hover{color:#555;background:#eee}
.snql-star{width:18px;height:18px;background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;border-radius:3px;transition:opacity 0.1s}
.snql-row:hover .snql-star,.snql-star.on{opacity:1}
.snql-star svg .sf{fill:none;stroke:#ccc;stroke-width:1.4}
.snql-star.on svg .sf{fill:#f59e0b;stroke:#f59e0b}
.snql-star:hover:not(.on) svg .sf{stroke:#999}
.snql-star svg{transition:transform 0.12s}
.snql-star:hover svg{transform:scale(1.15)}
.snql-home-empty{color:#bbb;font-size:13px;text-align:center;padding:40px 20px;grid-column:1/-1}
.snql-home-empty span{display:block;font-size:24px;margin-bottom:8px}
#snql-nores{display:none;text-align:center;padding:30px;color:#999;font-size:13px}
`;

const id = "snql-overlay";
document.getElementById(id) && document.getElementById(id).remove();
const styleEl = document.createElement("style");
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

const overlay = document.createElement("div");
overlay.id = id;
overlay.onclick = e => { if(e.target===overlay) close(); };

let pins = loadPins();
let activeTab = null;

function close(){ overlay.remove(); styleEl.remove(); }

function openItem(itemId, same){
  const item = ITEM_MAP[itemId];
  if(!item) return;
  const url = item.raw ? rawUrl(item.u) : classicUrl(item.u);
  close();
  if(same) location.href = url;
  else window.open(url, "_blank");
}

function runHandler(key){ close(); if(HANDLERS[key]) HANDLERS[key](); }

function togglePin(name){
  const i = pins.indexOf(name);
  if(i > -1) pins.splice(i,1);
  else { pins.unshift(name); if(pins.length > MAX_PINS) pins = pins.slice(0, MAX_PINS); }
  savePins(pins);
  render();
}

function buildRow(item){
  const pinned = pins.includes(item.t);
  const safeId = item._id;
  const safeName = item.t.replace(/'/g,"\\'");
  let mainBtn, sameBtn="", rawBtn="";
  if(item.h){
    mainBtn = `<button class="snql-link" onclick="snqlRun('${item.h}')">${item.t}</button>`;
  } else {
    mainBtn  = `<button class="snql-link" onclick="snqlOpenItem('${safeId}',false)">${item.t}</button>`;
    sameBtn  = `<button class="snql-action" title="Ouvrir dans cette page" onclick="snqlOpenItem('${safeId}',true)">${SAME_SVG}</button>`;
    rawBtn   = `<button class="snql-action" title="Ouvrir (raw)" onclick="snqlOpenRaw('${item.u.replace(/'/g,"\\'")}')">&#8599;</button>`;
  }
  return `<div class="snql-row">
    ${mainBtn}${sameBtn}${rawBtn}
    <button class="snql-star${pinned?" on":""}" title="${pinned?"Désépingler":"Épingler"}" onclick="snqlTogglePin('${safeName}')">${STAR_SVG}</button>
  </div>`;
}

// Découpe les colonnes en blocs par section, avec suivi du premier bloc par colonne
function getSectionBlocks(sourceData, matchFn){
  const blocks = [];
  sourceData.forEach(col => {
    let curSec = null, curItems = [], isFirstBlock = true;
    const flush = () => {
      if(curItems.length){
        blocks.push({ col, sec: curSec, items: curItems, isFirstBlock });
        isFirstBlock = false;
        curSec = null; curItems = [];
      }
    };
    col.l.forEach(item => {
      if(item.section){ flush(); curSec = item.section; }
      else if(item.t && matchFn(item)){ curItems.push(item); }
    });
    flush();
  });
  return blocks;
}

function buildBlock(block){
  const { col, sec, items, isFirstBlock } = block;
  const headerHtml = isFirstBlock
    ? `<div class="snql-col-title" style="color:${col.c};border-color:${col.c}">${col.f}</div>`
    : `<div class="snql-col-bar" style="border-color:${col.c}"></div>`;
  const secHtml = sec ? `<div class="snql-sec" style="background:${rgba(col.c,0.08)};color:${col.c}">${sec}</div>` : "";
  return `<div class="snql-block">${headerHtml}${secHtml}${items.map(buildRow).join("")}</div>`;
}

function renderBlocks(el, blocks){
  el.innerHTML = blocks.length ? blocks.map(buildBlock).join("") : "";
  return blocks.length > 0;
}

function renderHome(){
  const el = document.getElementById("snql-home");
  if(!pins.length){
    el.innerHTML = `<div class="snql-home-empty"><span>★</span>Aucun favori pour l'instant.<br>Survolez un lien dans les onglets pour en épingler.</div>`;
    return;
  }
  const pinSet = new Set(pins);
  const blocks = getSectionBlocks(data, item => pinSet.has(item.t));
  renderBlocks(el, blocks);
}

function renderCols(q){
  const el    = document.getElementById("snql-grid");
  const nores = document.getElementById("snql-nores");
  const search = q.toLowerCase().trim();
  const sourceData = (!search && activeTab !== null) ? [data[activeTab]] : data;
  const matchFn = search ? item => item.t.toLowerCase().includes(search) : () => true;
  const blocks = getSectionBlocks(sourceData, matchFn);
  const ok = renderBlocks(el, blocks);
  nores.style.display = ok ? "none" : "";
  el.style.display    = ok ? ""     : "none";
}

function renderTabs(){
  const el = document.getElementById("snql-tabs");
  el.innerHTML = `<button class="snql-tab${activeTab===null?" active":""}" onclick="snqlSetTab(null)">★ Accueil</button>`;
  data.forEach((col,i) => {
    const btn = document.createElement("button");
    btn.className = "snql-tab" + (activeTab===i?" active":"");
    if(activeTab===i) btn.style.cssText = `background:${rgba(col.c,0.12)};border-color:${col.c};color:${col.c}`;
    btn.textContent = col.f;
    btn.onclick = () => snqlSetTab(i);
    el.appendChild(btn);
  });
}

function render(){
  renderTabs();
  const q = document.getElementById("snql-search").value;
  const isHome = activeTab===null && !q;
  document.getElementById("snql-home").style.display = isHome ? "" : "none";
  document.getElementById("snql-grid").style.display = isHome ? "none" : "";
  document.getElementById("snql-nores").style.display = "none";
  if(isHome) renderHome(); else renderCols(q);
}

window.snqlSetTab    = i => { activeTab=i; document.getElementById("snql-search").value=""; render(); };
window.snqlTogglePin = name => togglePin(name);
window.snqlSearch    = () => render();
window.snqlClose     = close;
window.snqlRun       = key => runHandler(key);
window.snqlOpenRaw   = url => { close(); window.open(rawUrl(url),"_blank"); };
window.snqlOpenItem  = (id, same) => openItem(id, same);

overlay.innerHTML = `<div id="snql-win">
  <div id="snql-topbar">
    <div id="snql-search-wrap">
      <span id="snql-search-icon">&#128269;</span>
      <input id="snql-search" type="text" placeholder="Rechercher dans tous les liens..." oninput="snqlSearch()" autocomplete="off">
    </div>
    <button id="snql-close" title="Fermer" onclick="snqlClose()">&#215;</button>
  </div>
  <div id="snql-tabs"></div>
  <div id="snql-home"></div>
  <div id="snql-grid" style="display:none"></div>
  <div id="snql-nores">Aucun résultat pour cette recherche.</div>
</div>`;

document.body.appendChild(overlay);
render();
document.getElementById("snql-search").focus();

})();void(0);
