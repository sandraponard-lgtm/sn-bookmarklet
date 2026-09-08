javascript:(function(){

/* ============================================================
   CONFIGURATION — zone éditable V2.0
   ============================================================ */

const data = [

  { f: "Home, Portals & Workspaces", c: "#3758F9", i: "🏠", l: [
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

  { f: "Admin", c: "#DC2626", i: "🛠️", l: [
    { section: "Update Sets" },
      { t: "Créer un Update Set",     u: "/sys_update_set.do?sys_id=-1",        ic: "➕", tbl: "sys_update_set" },
      { t: "Update Sources",          u: "/sys_update_set_source_list.do",       ic: "💧", tbl: "sys_update_set_source" },
      { t: "Local Update Sets",       u: "/sys_update_set_list.do",              ic: "📤", tbl: "sys_update_set" },
      { t: "Retrieved Update Sets",   u: "/sys_remote_update_set_list.do",       ic: "📥", tbl: "sys_remote_update_set" },
      { t: "Customer Updates",        u: "/sys_update_xml_list.do",              ic: "👩‍💻", tbl: "sys_update_xml" },
    { section: "Scripting & Log" },
      { t: "Logs 5min SPO",           u: "/syslog_list.do?sysparm_query=sys_created_onRELATIVEGT@minute@ago@5^sourceLIKESPO", tbl: "syslog" },
      { t: "Scripts Background",      u: "/sys.scripts.do" },
      { t: "Active Transactions",     u: "/loading_transactions.do", raw: true },
      { t: "Debugger",                h: "debugger" },
    { section: "Quick Links" },
      { t: "Access Analyzer",         u: "/now/access-management/access-analyzer/params/selected-tab-index/1" },
      { t: "UI Builder",              u: "/now/builder/ui/home" },
      { t: "Plugins",                 u: "/now/app-manager/home" },
      { t: "Icons",                   u: "/styles/retina_icons/retina_icons.html" },
  ]},

  { f: "Development", c: "#7C3AED", i: "💻", l: [
    { section: "Scripts" },
      { t: "UI Actions",              u: "/sys_ui_action_list.do" },
      { t: "Client Scripts",          u: "/sys_script_client_list.do" },
      { t: "Fix Scripts",             u: "/sys_script_fix_list.do" },
      { t: "Business Rules",          u: "/sys_script_list.do" },
      { t: "Script Includes",         u: "/sys_script_include_list.do",          tbl: "sys_script_include" },
    { section: "Automation" },
      { t: "Scheduled Jobs",          u: "/sys_trigger_list.do",                 tbl: "sys_trigger" },
      { t: "Scheduled Script Exec.",  u: "/sysauto_script_list.do",              ic: "🏁", tbl: "sysauto_script" },
      { t: "Running Scheduled Jobs",  u: "/v_running_scheduled_job_list.do" },
      { t: "Job History By Nodes",    u: "/sys_scheduler_job_history_node_list.do" },
    { section: "Remote Table" },
      { t: "Tables (scriptable)",     u: "/sys_db_object_list.do?sysparm_query=scriptable_table%3Dtrue" },
      { t: "Définitions",             u: "/sys_script_vtable_list.do" },
    { section: "Translation" },
      { t: "Debug ON",                u: "/sys.scripts.do?action=run_module&sys_id=24218d20c3031100c409fd251eba8f52" },
      { t: "Debug OFF",               u: "/sys.scripts.do?action=run_module&sys_id=e4910160c3031100c409fd251eba8f53" },
      { t: "TRT | Translated Texts",  u: "/sys_translated_text_list.do" },
      { t: "TRL | Translated Names",  u: "/sys_translated_list.do" },
      { t: "MSG | Messages",          u: "/sys_ui_message_list.do" },
    { section: "Emails" },
      { t: "Emails TODAY",            u: "/sys_email_list.do?sysparm_query=sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()" },
      { t: "Notifications",           u: "/sysevent_email_action_list.do" },
      { t: "Events Log",              u: "/sysevent_list.do" },
    { section: "Data Import/Export" },
      { t: "Data Sources",            u: "/sys_data_source_list.do" },
      { t: "Transform Maps",          u: "/sys_transform_entry_list.do" },
    { section: "Others" },
      { t: "UI Views",                u: "/sys_ui_view_list.do" },
  ]},

  { f: "Data Foundations", c: "#D97706", i: "🗂️", l: [
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

  { f: "Plateforme", c: "#16A34A", i: "📊", l: [
    { section: "Platform Analytics" },
      { t: "Vue d'ensemble",          u: "/now/platform-analytics-workspace/pages/params/library/overview" },
      { t: "Tableau de bord",         u: "/now/platform-analytics-workspace/pages/params/library/dashboards" },
      { t: "Visualisation des données", u: "/now/platform-analytics-workspace/pages/params/library/data-visualizations" },
      { t: "Indicateurs",             u: "/now/platform-analytics-workspace/pages/params/library/indicators" },
      { t: "Filtres",                 u: "/now/platform-analytics-workspace/pages/params/library/filters" },
    { section: "Budget" },
      { t: "Project Funding (old)",   u: "/project_funding_list.do" },
      { t: "Project Budget",          u: "/sn_invst_pln_invst_budget_list.do" },
    { section: "Investment Funding" },
      { t: "Business Case",           u: "/business_case_list.do",                                           ic: "💰", tbl: "business_case" },
      { t: "Fund Request",            u: "/sn_invst_pln_invst_funding_base_request_list.do",                 ic: "💰", tbl: "sn_invst_pln_invst_funding_base_request" },
      { t: "Funding",                 u: "/sn_invst_pln_invst_funding_base_fund_list.do",                    ic: "💰", tbl: "sn_invst_pln_invst_funding_base_fund" },
      { t: "Funding Base",            u: "/sn_invst_pln_invst_funding_base_list.do",                         ic: "💰", tbl: "sn_invst_pln_invst_funding_base" },
      { t: "Funding Base Breakdown",  u: "/sn_invst_pln_invst_funding_base_breakdown_list.do",               ic: "💰", tbl: "sn_invst_pln_invst_funding_base_breakdown" },
      { t: "Funding Configuration",   u: "/sn_invst_pln_invst_funding_configuration_list.do",                ic: "💰", tbl: "sn_invst_pln_invst_funding_configuration" },
      { t: "Investment Entity",       u: "/sn_invst_pln_invst_funding_entity_list.do",                       ic: "💰", tbl: "sn_invst_pln_invst_funding_entity" },
      { t: "Funding State",           u: "/sn_invst_pln_invst_funding_state_list.do",                        ic: "💰", tbl: "sn_invst_pln_invst_funding_state" },
      { t: "Investment",              u: "/sn_invst_pln_invst_investment_list.do",                           ic: "💰", tbl: "sn_invst_pln_invst_investment" },
    { section: "Planned" },
      { t: "Cost Plans",              u: "/cost_plan_list.do" },
      { t: "Cost Plan Breakdowns",    u: "/cost_plan_breakdown_list.do" },
      { t: "Cost Type (definition)",  u: "/resource_type_definition_list.do" },
    { section: "Actuals" },
      { t: "Expense Lines",           u: "/fm_expense_line_list.do" },
  ]},

  { f: "CSDM", c: "#0891B2", i: "🧩", l: [
    { section: "Service Delivery" },
      { t: "Tech Mgmt Service",       u: "/cmdb_ci_service_technical_list.do",   ic: "🟠", tbl: "cmdb_ci_service_technical" },
      { t: "Tech Svc Offering",       u: "/service_offering_list.do?sysparm_query=service_classification%3DTechnical%20Service", ic: "🟠", tbl: "service_offering" },
      { t: "Service Instance",        u: "/cmdb_ci_service_auto_list.do",        ic: "🟠", tbl: "cmdb_ci_service_auto" },
      { t: "Service Instance CSDM",   u: "/csdm_app_services_list.do",           ic: "🟠", tbl: "csdm_app_services" },
      { t: "Dynamic CI Group",        u: "/cmdb_ci_query_based_service_list.do", ic: "🟠", tbl: "cmdb_ci_query_based_service" },
    { section: "Service Consumption" },
      { t: "Business Svc Offering",   u: "/service_offering_list.do?sysparm_query=service_classification%3DBusiness%20Service", ic: "🟢", tbl: "service_offering" },
      { t: "Business Service",        u: "/cmdb_ci_service_business_list.do",    ic: "🟢", tbl: "cmdb_ci_service_business" },
    { section: "Design & Planning" },
      { t: "Business Capability",     u: "/cmdb_ci_business_capability_list.do", ic: "🔵", tbl: "cmdb_ci_business_capability" },
      { t: "Business Application",    u: "/cmdb_ci_business_app_list.do",        ic: "🔵", tbl: "cmdb_ci_business_app" },
  ]},

  { f: "SPM", c: "#EA580C", i: "🎯", l: [
    { section: "Demands" },
      { t: "Demands",                 u: "/dmn_demand_list.do" },
      { t: "Demand Tasks",            u: "/dmn_demand_task_list.do" },
    { section: "Projects" },
      { t: "Projects",                u: "/pm_project_list.do" },
      { t: "Project Tasks",           u: "/pm_project_task_list.do" },
      { t: "Project Status",          u: "/project_status_list.do",              tbl: "project_status" },
    { section: "Documentation" },
      { t: "Doc Pages",               u: "/sn_doc_page_list.do",                 tbl: "sn_doc_page" },
      { t: "Doc Page Templates",      u: "/sn_doc_page_template_list.do",        tbl: "sn_doc_page_template" },
      { t: "Project Doc Pages",       u: "/sn_plng_att_core_doc_page_list.do",   tbl: "sn_plng_att_core_doc_page" },
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
    { section: "RIDAC" },
      { t: "Risk",                    u: "/risk_list.do" },
      { t: "Issue",                   u: "/issue_list.do" },
      { t: "Decision",                u: "/dmn_decision_list.do" },
      { t: "Action",                  u: "/project_action_list.do" },
      { t: "Request Change",          u: "/project_change_request_list.do" },
  ]},

];

/* ============================================================
   HANDLERS JS
   ============================================================ */
const HANDLERS = {
  debugger: () => window.top.launchScriptDebugger(),
};

/* ============================================================
   CONSTANTES
   ============================================================ */
const STORAGE_KEY = "sn_ql_pins_v2";
const HISTORY_KEY = "sn_ql_history_v1";
const MAX_PINS    = 50;
const MAX_HISTORY = 8;

// Index global stable
const ITEM_MAP = {};
let _idx = 0;
data.forEach(col => col.l.forEach(item => {
  if(item.t){
    item._id = "i"+(_idx++); item._col = col;
    if(!item.tbl && item.u){
      const m = item.u.match(/^\/([a-zA-Z0-9_]+)_list\.do/);
      if(m) item.tbl = m[1];
    }
    ITEM_MAP[item._id] = item;
  }
}));

function loadList(key){try{return JSON.parse(localStorage.getItem(key)||"[]");}catch(e){return[];}}
function saveList(key,p){try{localStorage.setItem(key,JSON.stringify(p));}catch(e){}}

const classicUrl = p => location.origin+"/now/nav/ui/classic/params/target/"+encodeURIComponent(p);
const rawUrl     = p => location.origin+p;

const rgba = (hex,a) => {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

/* ============================================================
   SVG ICONS
   ============================================================ */
const STAR_SVG = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path class="sf" d="M8 1.5l1.8 4.9H15l-4.3 3.2 1.6 4.9L8 11.8l-4.3 2.7 1.6-4.9L1 6.4h5.2z" stroke-linejoin="round" stroke-width="1.4"/></svg>`;
const SAME_ICON = `♻️`;
const RAW_ICON  = `📄`;
const RAW_BADGE_SVG = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3H3v10h10v-3"/><path d="M9 3h4v4"/><line x1="13" y1="3" x2="7" y2="9"/></svg>`;
const BOLT_SVG = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1L3 9h4l-1 6 6-8H8l1-6z"/></svg>`;
const ARROW_SVG = `<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/></svg>`;
const CLOCK_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><polyline points="8,4.5 8,8 10.5,9.5"/></svg>`;

/* ============================================================
   SETUP OVERLAY
   ============================================================ */
const id      = "snql-overlay";
const styleId = "snql-style";
document.getElementById(id)      && document.getElementById(id).remove();
document.getElementById(styleId) && document.getElementById(styleId).remove();

const styleEl = document.createElement("style");
styleEl.id = styleId;
document.head.appendChild(styleEl);

const overlay = document.createElement("div");
overlay.id = id;
overlay.onclick = e => { if(e.target===overlay) close(); };

let pins      = loadList(STORAGE_KEY);
let history   = loadList(HISTORY_KEY);
let activeTab = null;

function onKeydown(e){ if(e.key==="Escape") close(); }

function close(){
  overlay.remove();
  styleEl.remove();
  document.removeEventListener("keydown", onKeydown);
}

function pushHistory(itemId){
  history = history.filter(h => h!==itemId);
  history.unshift(itemId);
  if(history.length>MAX_HISTORY) history=history.slice(0,MAX_HISTORY);
  saveList(HISTORY_KEY, history);
}

function openItem(itemId, same){
  const item = ITEM_MAP[itemId]; if(!item) return;
  pushHistory(itemId);
  const url = item.raw ? rawUrl(item.u) : classicUrl(item.u);
  close();
  if(same) location.href=url; else window.open(url,"_blank");
}

function runHandler(key){ close(); if(HANDLERS[key]) HANDLERS[key](); }

function togglePin(name){
  const i=pins.indexOf(name);
  if(i>-1) pins.splice(i,1);
  else { pins.unshift(name); if(pins.length>MAX_PINS) pins=pins.slice(0,MAX_PINS); }
  saveList(STORAGE_KEY,pins);
  render();
}

function typeBadge(item){
  if(item.ic)  return `<span class="snql-badge snql-badge-custom">${item.ic}</span>`;
  if(item.h)   return `<span class="snql-badge snql-badge-action" title="Action">${BOLT_SVG}</span>`;
  if(item.raw) return `<span class="snql-badge snql-badge-raw" title="Lien direct (raw)">${RAW_BADGE_SVG}</span>`;
  return `<span class="snql-badge snql-badge-link" title="Lien classique">${ARROW_SVG}</span>`;
}

function buildRow(item){
  const pinned  = pins.includes(item.t);
  const safeId  = item._id;
  const safeName= item.t.replace(/'/g,"\\'");
  const titleAttr = item.tbl ? ` data-tbl="${item.tbl.replace(/"/g,"&quot;")}"` : "";
  let mainBtn, sameBtn="", rawBtn="";
  if(item.h){
    mainBtn = `<button class="snql-link" onclick="snqlRun('${item.h}')">${item.t}</button>`;
  } else {
    mainBtn = `<button class="snql-link"${titleAttr} onmouseenter="snqlShowTip(event)" onmouseleave="snqlHideTip()" onclick="snqlOpenItem('${safeId}',false)">${item.t}</button>`;
    sameBtn = `<button class="snql-action" title="Ouvrir dans cette page" onclick="snqlOpenItem('${safeId}',true)">${SAME_ICON}</button>`;
    rawBtn  = item.raw ? "" : `<button class="snql-action" title="Ouvrir (raw)" onclick="snqlOpenRaw('${item.u.replace(/'/g,"\\'")}')">${RAW_ICON}</button>`;
  }
  return `<div class="snql-row">
    ${typeBadge(item)}
    ${mainBtn}${sameBtn}${rawBtn}
    <button class="snql-star${pinned?" on":""}" title="${pinned?"Désépingler":"Épingler"}" onclick="snqlTogglePin('${safeName}')">${STAR_SVG}</button>
  </div>`;
}

function getSectionBlocks(sourceData, matchFn){
  const blocks=[];
  sourceData.forEach(col=>{
    let curSec=null, curItems=[], isFirstBlock=true;
    const flush=()=>{
      if(curItems.length){
        blocks.push({col,sec:curSec,items:curItems,isFirstBlock});
        isFirstBlock=false; curSec=null; curItems=[];
      }
    };
    col.l.forEach(item=>{
      if(item.section){ flush(); curSec=item.section; }
      else if(item.t && matchFn(item)){ curItems.push(item); }
    });
    flush();
  });
  return blocks;
}

function buildBlock(block, skipColHeader){
  const {col, sec, items, isFirstBlock}=block;
  let headerHtml="";
  if(!skipColHeader){
    if(isFirstBlock){
      headerHtml=`<div class="snql-col-title" style="background:${rgba(col.c,0.08)};border-color:${rgba(col.c,0.3)};color:${col.c}"><span class="snql-col-icon">${col.i||""}</span>${col.f}</div>`;
    } else {
      headerHtml=`<div class="snql-col-bar" style="border-color:${rgba(col.c,0.2)}"></div>`;
    }
  }
  const secHtml=sec?`<div class="snql-sec" style="background:${rgba(col.c,0.06)};color:${col.c};border-color:${rgba(col.c,0.2)}">${sec}</div>`:"";
  return `<div class="snql-block" style="--col-accent:${col.c};--col-glow:${rgba(col.c,0.05)}">${headerHtml}${secHtml}${items.map(buildRow).join("")}</div>`;
}

function renderBlocks(el, blocks, skipColHeader){
  el.innerHTML=blocks.length?blocks.map(b=>buildBlock(b,skipColHeader)).join(""):"";
  return blocks.length>0;
}

function buildQuickRow(itemId){
  const item=ITEM_MAP[itemId]; if(!item) return "";
  const col=item._col;
  const pinned=pins.includes(item.t);
  const titleAttr=item.tbl?` data-tbl="${item.tbl.replace(/"/g,"&quot;")}"` : "";
  return `<div class="snql-quick-row" style="--col-glow:${rgba(col.c,0.05)}">
    <span class="snql-quick-dot" style="background:${col.c}"></span>
    ${typeBadge(item)}
    ${item.h
      ?`<button class="snql-link" onclick="snqlRun('${item.h}')">${item.t}</button>`
      :`<button class="snql-link"${titleAttr} onmouseenter="snqlShowTip(event)" onmouseleave="snqlHideTip()" onclick="snqlOpenItem('${item._id}',false)">${item.t}</button>`}
    <span class="snql-quick-col" style="color:${col.c};background:${rgba(col.c,0.08)}">${col.f}</span>
    ${item.h?"":
      `<button class="snql-star${pinned?" on":""}" title="${pinned?"Désépingler":"Épingler"}" onclick="snqlTogglePin('${item.t.replace(/'/g,"\\'")}')">${STAR_SVG}</button>`}
  </div>`;
}

function renderHome(){
  const el=document.getElementById("snql-home");
  const pinSet=new Set(pins);
  const pinBlocks=getSectionBlocks(data,item=>pinSet.has(item.t));
  let html="";
  if(pinBlocks.length){
    html+=`<div class="snql-home-section-title"><span class="snql-home-section-icon">★</span>Favoris</div>`;
    html+=`<div class="snql-pin-grid">${pinBlocks.map(b=>buildBlock(b,false)).join("")}</div>`;
  } else {
    html+=`<div class="snql-home-empty"><span>★</span>Aucun favori pour l'instant.<br>Survolez un lien dans les onglets pour en épingler.</div>`;
  }
  const validHistory=history.filter(hid=>ITEM_MAP[hid]);
  if(validHistory.length){
    html+=`<div class="snql-home-section-title snql-history-title"><span class="snql-home-section-icon">${CLOCK_SVG}</span>Récemment ouverts</div>`;
    html+=`<div class="snql-quick-list">${validHistory.map(buildQuickRow).join("")}</div>`;
  }
  el.innerHTML=html;
}

function renderCols(q){
  const el     =document.getElementById("snql-grid");
  const nores  =document.getElementById("snql-nores");
  const banner =document.getElementById("snql-tab-banner");
  const search =q.toLowerCase().trim();
  const singleTab=!search&&activeTab!==null;
  const sourceData=singleTab?[data[activeTab]]:data;
  const matchFn=search?item=>item.t.toLowerCase().includes(search):()=>true;
  const blocks=getSectionBlocks(sourceData,matchFn);
  const ok=renderBlocks(el,blocks,singleTab);
  nores.style.display=ok?"none":"";
  el.style.display=ok?""  :"none";
  if(singleTab){
    const col=data[activeTab];
    banner.style.display="";
    banner.style.background=rgba(col.c,0.06);
    banner.style.borderColor=rgba(col.c,0.25);
    banner.style.color=col.c;
    banner.innerHTML=`<span class="snql-col-icon">${col.i||""}</span>${col.f}`;
  } else {
    banner.style.display="none";
  }
  const countEl=document.getElementById("snql-count");
  if(search){
    const n=blocks.reduce((s,b)=>s+b.items.length,0);
    countEl.textContent=n+(n===1?" résultat":" résultats");
    countEl.style.display="";
  } else {
    countEl.style.display="none";
  }
}

function renderTabs(){
  const el=document.getElementById("snql-tabs");
  el.innerHTML=`<button class="snql-tab${activeTab===null?" active":""}" onclick="snqlSetTab(null)"><span class="snql-tab-icon">★</span>Accueil</button>`;
  data.forEach((col,i)=>{
    const btn=document.createElement("button");
    btn.className="snql-tab"+(activeTab===i?" active":"");
    if(activeTab===i) btn.style.cssText=`background:${rgba(col.c,0.08)};border-color:${rgba(col.c,0.4)};color:${col.c}`;
    btn.innerHTML=`<span class="snql-tab-icon">${col.i||""}</span>${col.f}`;
    btn.onclick=()=>snqlSetTab(i);
    el.appendChild(btn);
  });
}

function render(){
  renderTabs();
  const q=document.getElementById("snql-search").value;
  const isHome=activeTab===null&&!q;
  document.getElementById("snql-home").style.display=isHome?""  :"none";
  document.getElementById("snql-grid").style.display=isHome?"none":"";
  document.getElementById("snql-nores").style.display="none";
  if(isHome){
    document.getElementById("snql-count").style.display="none";
    document.getElementById("snql-tab-banner").style.display="none";
    renderHome();
  } else renderCols(q);
}

window.snqlSetTab    = i  => { activeTab=i; document.getElementById("snql-search").value=""; render(); };
window.snqlTogglePin = name => togglePin(name);
window.snqlSearch    = ()  => render();
window.snqlClose     = close;
window.snqlRun       = key => runHandler(key);
window.snqlOpenRaw   = url => { close(); window.open(rawUrl(url),"_blank"); };
window.snqlOpenItem  = (id,same) => openItem(id,same);
window.snqlShowTip   = e  => {
  const tbl=e.currentTarget.getAttribute("data-tbl"); if(!tbl) return;
  const tip=document.getElementById("snql-tip");
  tip.textContent=tbl; tip.style.display="block";
  const r=e.currentTarget.getBoundingClientRect();
  const winRect=document.getElementById("snql-win").getBoundingClientRect();
  tip.style.left=(r.left-winRect.left)+"px";
  tip.style.top=(r.bottom-winRect.top+6)+"px";
};
window.snqlHideTip   = () => { document.getElementById("snql-tip").style.display="none"; };

/* ============================================================
   CSS — Tailgrids Light Theme
   ============================================================ */
styleEl.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@keyframes snql-fadein{from{opacity:0}to{opacity:1}}
@keyframes snql-slideup{from{opacity:0;transform:translateY(8px) scale(.988)}to{opacity:1;transform:none}}

/* OVERLAY */
#snql-overlay{
  position:fixed;inset:0;z-index:2147483647;
  display:flex;align-items:flex-start;justify-content:center;
  padding:32px 20px;overflow-y:auto;
  font-family:'Inter',ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  background:rgba(9,14,52,0.35);
  backdrop-filter:blur(4px);
  animation:snql-fadein .15s ease-out;
}

/* FENÊTRE */
#snql-win{
  position:relative;width:100%;max-width:1440px;
  color:#1F2937;
  background:#FFFFFF;
  border:1px solid #E5E7EB;
  border-radius:16px;
  padding:20px 24px 28px;
  box-shadow:0 25px 50px -12px rgba(9,14,52,0.2),0 0 0 1px rgba(255,255,255,0.8) inset;
  animation:snql-slideup .17s ease-out;
}

/* TOPBAR */
#snql-topbar{
  display:flex;align-items:center;gap:12px;
  margin-bottom:16px;padding-bottom:14px;
  border-bottom:1px solid #E5E7EB;
}
#snql-search-wrap{flex:1;position:relative}
#snql-search-wrap input{
  width:100%;padding:10px 14px 10px 38px;
  border:1px solid #D1D5DB;border-radius:10px;
  font-size:14px;font-family:inherit;
  background:#F9FAFB;color:#374151;
  outline:none;transition:border-color .15s,background .15s,box-shadow .15s;
  box-sizing:border-box;
}
#snql-search-wrap input::placeholder{color:#9CA3AF}
#snql-search-wrap input:focus{
  border-color:#3758F9;background:#FFFFFF;
  box-shadow:0 0 0 3px rgba(55,88,249,0.12);
}
#snql-search-icon{
  position:absolute;left:13px;top:50%;transform:translateY(-50%);
  font-size:14px;pointer-events:none;color:#9CA3AF;
}
#snql-count{font-size:12px;color:#6B7280;white-space:nowrap;padding:0 4px;font-weight:500}
#snql-close{
  cursor:pointer;font-size:18px;color:#6B7280;
  background:#F3F4F6;border:1px solid #E5E7EB;
  width:34px;height:34px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .15s;
}
#snql-close:hover{background:#FEF2F2;color:#DC2626;border-color:#FECACA}

/* ONGLETS */
#snql-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.snql-tab{
  display:inline-flex;align-items:center;gap:6px;
  font-size:12px;font-weight:500;padding:6px 14px;
  border-radius:9999px;cursor:pointer;
  border:1px solid #E5E7EB;color:#6B7280;background:#FFFFFF;
  transition:all .15s;font-family:inherit;
}
.snql-tab-icon{font-size:13px;line-height:1}
.snql-tab:hover{background:#F9FAFB;color:#374151;border-color:#D1D5DB}
.snql-tab.active{font-weight:600;background:#EEF2FF;color:#3758F9;border-color:#C7D7FD}

/* BANNER TAB ACTIF */
#snql-tab-banner{
  display:flex;align-items:center;gap:10px;
  font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
  padding:10px 16px;border-radius:10px;border:1px solid;
  margin-bottom:18px;box-sizing:border-box;
}
#snql-tab-banner .snql-col-icon{font-size:16px}

/* GRILLES */
#snql-grid,.snql-pin-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
  gap:16px 20px;align-items:start;
}
#snql-home{display:block}

/* BLOC */
.snql-block{
  break-inside:avoid;position:relative;
  padding:2px 6px 8px 8px;
  border-radius:10px;transition:background .15s;
}
.snql-block:hover{background:var(--col-glow,rgba(0,0,0,0.02))}

/* EN-TÊTE COLONNE */
.snql-col-title{
  display:flex;align-items:center;gap:7px;
  font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
  padding:7px 11px;border-radius:8px;border:1px solid;
  margin:-2px -6px 10px -8px;width:calc(100% + 14px);
  box-sizing:border-box;line-height:1.3;
}
.snql-col-icon{font-size:13px;flex-shrink:0}
.snql-col-bar{height:0;border-bottom:1.5px solid;margin-bottom:8px;opacity:0.4}

/* SECTION */
.snql-sec{
  font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;
  padding:4px 9px;border-radius:6px;border:1px solid;
  margin-top:10px;margin-bottom:5px;line-height:1.3;display:inline-block;
}

/* LIGNE */
.snql-row{
  display:flex;align-items:center;padding:5px 4px;
  border-radius:7px;gap:5px;transition:background .12s;
}
.snql-row:hover{background:#F9FAFB}
.snql-link{
  font-size:13px;color:#374151;text-decoration:none;
  flex:1;cursor:pointer;line-height:1.35;
  background:none;border:none;text-align:left;
  padding:0;font-family:inherit;transition:color .12s;
}
.snql-link:hover{color:#3758F9}

/* TOOLTIP TABLE */
#snql-tip{
  position:absolute;z-index:10;
  font-size:11px;color:#374151;
  padding:5px 10px;border-radius:7px;
  background:#FFFFFF;border:1px solid #E5E7EB;
  box-shadow:0 4px 12px rgba(0,0,0,0.1);
  font-family:'JetBrains Mono',Consolas,monospace;
  pointer-events:none;white-space:nowrap;
}

/* BADGES TYPE */
.snql-badge{width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:5px}
.snql-badge-link{color:#3758F9;background:#EEF2FF}
.snql-badge-raw{color:#0891B2;background:#E0F2FE}
.snql-badge-action{color:#D97706;background:#FFFBEB}
.snql-badge-custom{background:#F3F4F6;font-size:12px}

/* BOUTONS ACTION */
.snql-action{
  width:22px;height:22px;background:#F3F4F6;border:1px solid #E5E7EB;
  cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;opacity:0;border-radius:6px;
  color:#6B7280;font-size:11px;transition:all .12s;
}
.snql-row:hover .snql-action{opacity:1}
.snql-action:hover{color:#374151;background:#E5E7EB;border-color:#D1D5DB}

/* ÉTOILE FAVORIS */
.snql-star{
  width:22px;height:22px;background:none;border:none;
  cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;opacity:0;border-radius:6px;transition:opacity .12s;
}
.snql-row:hover .snql-star,.snql-star.on,.snql-quick-row:hover .snql-star{opacity:1}
.snql-star svg .sf{fill:none;stroke:#D1D5DB;stroke-width:1.4}
.snql-star.on svg .sf{fill:#F59E0B;stroke:#F59E0B}
.snql-star:hover:not(.on) svg .sf{stroke:#6B7280}
.snql-star svg{transition:transform .12s}
.snql-star:hover svg{transform:scale(1.15)}

/* ACCUEIL — vide */
.snql-home-empty{
  color:#9CA3AF;font-size:13px;text-align:center;padding:50px 20px;
}
.snql-home-empty span{display:block;font-size:26px;margin-bottom:10px;color:#FDE68A}

/* ACCUEIL — titres de section */
.snql-home-section-title{
  display:flex;align-items:center;gap:8px;
  font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;
  color:#6B7280;margin:4px 0 14px;
}
.snql-history-title{
  margin-top:24px;padding-top:16px;
  border-top:1px solid #E5E7EB;
}
.snql-home-section-icon{color:#F59E0B;display:flex;align-items:center}

/* HISTORIQUE */
.snql-quick-list{display:flex;flex-direction:column;gap:2px}
.snql-quick-row{
  display:flex;align-items:center;gap:8px;
  padding:7px 10px;border-radius:8px;transition:background .12s;
}
.snql-quick-row:hover{background:var(--col-glow,#F9FAFB)}
.snql-quick-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.snql-quick-col{
  font-size:10px;font-weight:500;flex-shrink:0;
  padding:2px 8px;border-radius:9999px;background:#F3F4F6;color:#6B7280;
}

/* NO RESULTS */
#snql-nores{display:none;text-align:center;padding:50px 20px;color:#9CA3AF;font-size:13px}

/* SCROLLBAR */
#snql-overlay::-webkit-scrollbar{width:8px}
#snql-overlay::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:6px}
#snql-overlay::-webkit-scrollbar-track{background:transparent}
`;

overlay.innerHTML=`<div id="snql-win">
  <div id="snql-topbar">
    <div id="snql-search-wrap">
      <span id="snql-search-icon">&#128269;</span>
      <input id="snql-search" type="text" placeholder="Rechercher dans tous les liens..." oninput="snqlSearch()" autocomplete="off">
    </div>
    <span id="snql-count" style="display:none"></span>
    <button id="snql-close" title="Fermer (Échap)" onclick="snqlClose()">&#215;</button>
  </div>
  <div id="snql-tabs"></div>
  <div id="snql-tab-banner" style="display:none"></div>
  <div id="snql-home"></div>
  <div id="snql-grid" style="display:none"></div>
  <div id="snql-nores">Aucun résultat pour cette recherche.</div>
  <div id="snql-tip" style="display:none;position:absolute"></div>
</div>`;

document.body.appendChild(overlay);
document.addEventListener("keydown", onKeydown);
render();
document.getElementById("snql-search").focus();

})();void(0);
