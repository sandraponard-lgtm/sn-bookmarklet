javascript:(function(){

/* ============================================================
   ██████╗  ██████╗ ███╗   ██╗███████╗██╗ ██████╗
   ██╔════╝ ██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
   ██║      ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
   ██║      ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
   ╚██████╗ ╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
    ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
   ServiceNow Quick Links — Bookmarklet
   ============================================================

   CONFIGURATION
   =============
   Chaque entrée de `data` est une COLONNE du menu.
   Propriétés d'une colonne :
     f  → Titre de la colonne (affiché en haut et dans les onglets)
     c  → Couleur accent en hex  ex: "#2980b9"
     l  → Liste des éléments (sections + liens)

   Pour ajouter une SECTION (séparateur visuel) :
     { section: "Mon titre de section" }

   Pour ajouter un LIEN :
     { t: "Texte affiché", u: "/url/relatif" }

   Pour ajouter un LIEN avec ACTION JS (ex: ouvrir le debugger) :
     { t: "Debugger", h: "debugger" }
     (les handlers JS sont définis dans HANDLERS plus bas)

   ============================================================ */

const data = [

  { f: "Home, Portals & Workspaces", c: "#2980b9", l: [
    { section: "Home" },
      { t: "Home",                   u: "/home.do" },
    { section: "Portal" },
      { t: "Service Portal",         u: "/sp" },
      { t: "Employee Portal",        u: "/esc" },
      { t: "Time Sheet Portal",      u: "/tcp" },
    { section: "Workspaces" },
      { t: "SOW",                    u: "/now/sow/home" },
      { t: "CWM",                    u: "/now/cwm/home/" },
      { t: "Project WS",             u: "/now/workspace/project/home/" },
      { t: "Resource WS",            u: "/now/workspace/rm/home" },
      { t: "SPW",                    u: "/now/alignment-workspace/portfolio-plans" },
    { section: "Quick Links" },
      { t: "Agile Board Tracking",   u: "/$agile_board.do#/sprint_tracking" },
  ]},

  { f: "Admin", c: "#c0392b", l: [
    { section: "Update Sets" },
      { t: "➕ Créer un Update Set",  u: "/sys_update_set.do?sys_id=-1" },
      { t: "💧 Update Sources",       u: "/sys_update_set_source_list.do" },
      { t: "📤 Local Update Sets",    u: "/sys_update_set_list.do" },
      { t: "📥 Retrieved Update Sets",u: "/sys_remote_update_set_list.do" },
      { t: "👩‍💻 Customer Updates",     u: "/sys_update_xml_list.do" },
    { section: "Scripting & Log" },
      { t: "Logs 5min SPO",          u: "/syslog_list.do?sysparm_query=sys_created_onRELATIVEGT@minute@ago@5^sourceLIKESPO" },
      { t: "Scripts Background",     u: "/sys.scripts.do" },
      { t: "Debugger",               h: "debugger" },
    { section: "Quick Links" },
      { t: "Access Analyzer",        u: "/now/access-management/access-analyzer/params/selected-tab-index/1" },
      { t: "Plugins",                u: "/now/app-manager/home" },
      { t: "Icons",                  u: "/styles/retina_icons/retina_icons.html" },
  ]},

  { f: "Development", c: "#8e44ad", l: [
    { section: "Scripts" },
      { t: "UI Actions",             u: "/sys_ui_action_list.do" },
      { t: "Fix Scripts",            u: "/sys_script_fix_list.do" },
      { t: "Business Rules",         u: "/sys_script_list.do" },
    { section: "Automation" },
      { t: "Scheduled Jobs",         u: "/sys_trigger_list.do" },
      { t: "Scheduled Script Exec.", u: "/sysauto_script_list.do" },
      { t: "Running Scheduled Jobs", u: "/v_running_scheduled_job.do" },
      { t: "Job History By Nodes",   u: "/sys_scheduler_job_history_node_list.do" },
    { section: "Remote Table" },
      { t: "Tables (scriptable)",    u: "/sys_db_object_list.do?sysparm_query=scriptable_table%3Dtrue" },
      { t: "Définitions",            u: "/sys_script_vtable_list.do" },
    { section: "💬 Translation" },
      { t: "Debug ON",               u: "/sys.scripts.do?action=run_module&sys_id=24218d20c3031100c409fd251eba8f52" },
      { t: "Debug OFF",              u: "/sys.scripts.do?action=run_module&sys_id=e4910160c3031100c409fd251eba8f53" },
      { t: "TRT | Translated Texts", u: "/sys_translated_text_list.do" },
      { t: "TRL | Translated Names", u: "/sys_translated_list.do" },
      { t: "MSG | Messages",         u: "/sys_ui_message_list.do" },
    { section: "✉️ Emails" },
      { t: "Emails TODAY",           u: "/sys_email_list.do?sysparm_query=sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()" },
      { t: "Notifications",          u: "/sysevent_email_action_list.do" },
      { t: "Events Log",             u: "/sysevent_list.do" },
    { section: "Data Import/Export" },
      { t: "Data Sources",           u: "/sys_data_source_list.do" },
      { t: "Transform Maps",         u: "/sys_transform_entry_list.do" },
  ]},

  { f: "Data Foundations", c: "#d35400", l: [
    { section: "Users & Groups" },
      { t: "Employee Profiles",      u: "/sn_employee_profile_list.do" },
      { t: "Users",                  u: "/sys_user_list.do" },
      { t: "Groups",                 u: "/sys_user_group_list.do" },
      { t: "Roles",                  u: "/sys_user_role_list.do" },
    { section: "Organisation" },
      { t: "Locations",              u: "/cmn_location_list.do" },
      { t: "Companies",              u: "/core_company_list.do" },
      { t: "Business Unit",          u: "/business_unit_list.do" },
      { t: "Departments",            u: "/cmn_department_list.do" },
    { section: "Other" },
      { t: "Calendar",               u: "/cmn_calendar_list.do" },
      { t: "Attachments",            u: "/sys_attachment_list.do" },
  ]},

  { f: "Plateforme", c: "#27ae60", l: [
    { section: "Budget" },
      { t: "Project Funding (old)",  u: "/project_funding_list.do" },
      { t: "Project Budget",         u: "/sn_invst_pln_invst_budget_list.do" },
    { section: "Planned" },
      { t: "Cost Plans",             u: "/cost_plan_list.do" },
      { t: "Cost Plan Breakdowns",   u: "/cost_plan_breakdown_list.do" },
      { t: "Cost Type (definition)", u: "/resource_type_definition_list.do" },
    { section: "Actuals" },
      { t: "Expense Lines",          u: "/fm_expense_line_list.do" },
  ]},

  { f: "CSDM", c: "#16a085", l: [
    { section: "Service Delivery" },
      { t: "🟠 Tech Mgmt Service",   u: "/cmdb_ci_service_technical_list.do" },
      { t: "🟠 Tech Service Offering",u: "/service_offering_list.do?sysparm_query=service_classification%3DTechnical%20Service" },
      { t: "🟠 Service Instance",    u: "/cmdb_ci_service_auto_list.do" },
      { t: "🟠 Service Instance CSDM",u: "/csdm_app_services_list.do" },
      { t: "🟠 Dynamic CI Group",    u: "/cmdb_ci_query_based_service_list.do" },
    { section: "Service Consumption" },
      { t: "🟢 Business Svc Offering",u: "/service_offering_list.do?sysparm_query=service_classification%3DBusiness%20Service" },
      { t: "🟢 Business Service",    u: "/cmdb_ci_service_business_list.do" },
    { section: "Design & Planning" },
      { t: "🔵 Business Capability", u: "/cmdb_ci_business_capability_list.do" },
      { t: "🔵 Business Application",u: "/cmdb_ci_business_app_list.do" },
  ]},

  { f: "SPM — PPM", c: "#f39c12", l: [
    { section: "Demands" },
      { t: "Demands",                u: "/dmn_demand_list.do" },
      { t: "Demand Tasks",           u: "/dmn_demand_task_list.do" },
    { section: "Projects" },
      { t: "Projects",               u: "/pm_project_list.do" },
      { t: "Project Tasks",          u: "/pm_project_task_list.do" },
    { section: "Time Tracking" },
      { t: "Time Sheet",             u: "/time_sheet_list.do" },
      { t: "Time Cards",             u: "/time_card_list.do" },
      { t: "Time Card Daily",        u: "/time_card_daily_list.do" },
  ]},

  { f: "SPM — Resources", c: "#e67e22", l: [
    { section: "Resource Data" },
      { t: "Resource Users",         u: "/sys_user_list.do?sysparm_query=roles%3Dpps_resource%5E&sysparm_view=resource_manager" },
      { t: "Resource Groups",        u: "/sys_user_group_list.do?sysparm_query=roles%3Dpps_resource%5E&sysparm_view=resource_manager" },
      { t: "Resource Plans",         u: "/resource_plan_list.do" },
    { section: "Assignment" },
      { t: "Resource Assignment",    u: "/sn_plng_att_core_resource_assignment_list.do" },
      { t: "Resource Allocation",    u: "/resource_allocation_list.do" },
      { t: "Resource Alloc. Daily",  u: "/resource_allocation_daily_list.do" },
    { section: "Aggregates" },
      { t: "Aggregate Monthly",      u: "/resource_aggregate_monthly_list.do" },
      { t: "Aggregate Weekly",       u: "/resource_aggregate_monthly_list.do" },
      { t: "DBV profile + aggregate",u: "/sn_plng_att_core_attribute_based_resource_aggregates_list.do" },
  ]},

  { f: "SPM — SPW", c: "#d68910", l: [
    { section: "Goals Framework" },
      { t: "Strategic Value",        u: "/sn_gf_strategy_value_list.do" },
      { t: "Strategic Plan",         u: "/sn_gf_strategic_plan_list.do" },
      { t: "Strategic Priority",     u: "/sn_gf_strategy_list.do" },
      { t: "Goals",                  u: "/sn_gf_core_goal_list.do" },
      { t: "Targets",                u: "/sn_gf_goal_target_list.do" },
    { section: "Strategic Planning" },
      { t: "Portfolio Plan Config",  u: "/sn_align_ws_roadmap_configuration_list.do" },
      { t: "Integrations",           u: "/sn_align_cmn_int_integrations_setup_list.do" },
      { t: "Lens",                   u: "/sn_align_core_lens_list.do" },
      { t: "Planning Attributes",    u: "/sn_plng_att_core_planning_attribute_list.do" },
    { section: "Strategic Planning Data" },
      { t: "Planning Items",         u: "/sn_align_core_planning_item_list.do" },
      { t: "Portfolio Plan",         u: "/sn_align_ws_portfolio_plan_list.do" },
      { t: "Portfolio Plan View",    u: "/sn_align_ws_portfolio_plan_view_list.do" },
  ]},

];

/* ============================================================
   HANDLERS JS
   ===========
   Associez un nom (clé) à une fonction pour les liens { h: "nom" }.
   Exemple : { t: "Debugger", h: "debugger" }
   ============================================================ */

const HANDLERS = {
  debugger: () => window.top.launchScriptDebugger(),
};

/* ============================================================
   FIN DE CONFIGURATION — ne pas modifier en dessous
   ============================================================ */

const STORAGE_KEY = "sn_ql_pins_v1";
const MAX_PINS = 10;

function loadPins() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch(e) { return []; }
}
function savePins(pins) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pins)); } catch(e) {}
}

const classicUrl = p => location.origin + "/now/nav/ui/classic/params/target/" + encodeURIComponent(p);
const rawUrl     = p => location.origin + p;
const rgba       = (hex, a) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

const STAR_SVG = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="sf" d="M8 1.5l1.8 4.9H15l-4.3 3.2 1.6 4.9L8 11.8l-4.3 2.7 1.6-4.9L1 6.4h5.2z" stroke-linejoin="round" stroke-width="1.4"/></svg>`;

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
#snql-pinbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:12px;padding:8px 10px;background:#f8f8f8;border-radius:8px;min-height:34px}
.snql-pinlabel{font-size:10px;color:#999;display:flex;align-items:center;gap:4px;margin-right:2px;flex-shrink:0}
.snql-pinlabel svg .sf{fill:#f59e0b;stroke:#f59e0b}
.snql-pill{font-size:11px;padding:2px 8px;border-radius:20px;background:#fff;border:1px solid #ddd;color:#333;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap}
.snql-pill:hover{border-color:#999}
.snql-pill-x{font-size:10px;color:#bbb;line-height:1}
.snql-pill:hover .snql-pill-x{color:#666}
.snql-hint{font-size:11px;color:#bbb}
#snql-tabs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px}
.snql-tab{font-size:11px;font-weight:500;padding:4px 11px;border-radius:20px;cursor:pointer;border:1px solid transparent;color:#666;background:none}
.snql-tab:hover{background:#f0f0f0;color:#333}
.snql-tab.active{border-color:#ccc;background:#f0f0f0;color:#111}
#snql-cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px}
.snql-col-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;border-bottom:2px solid;margin-bottom:8px}
.snql-sec{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;padding:5px 5px 3px;border-radius:4px;margin-top:8px;line-height:1.3}
.snql-row{display:flex;align-items:center;padding:4px 3px;border-bottom:1px solid #f2f2f2;gap:3px;border-radius:5px}
.snql-row:hover{background:#f7f7f7}
.snql-row:last-child{border-bottom:none}
.snql-link{font-size:12px;color:#333;text-decoration:none;flex:1;cursor:pointer}
.snql-link:hover{color:#111}
.snql-raw{font-size:10px;color:#ccc;text-decoration:none;padding:2px 4px;border-radius:4px;opacity:0;flex-shrink:0}
.snql-row:hover .snql-raw{opacity:1}
.snql-raw:hover{color:#666;background:#eee}
.snql-star{width:20px;height:20px;background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;border-radius:4px;transition:opacity 0.1s}
.snql-row:hover .snql-star{opacity:1}
.snql-star.on{opacity:1}
.snql-star svg .sf{fill:none;stroke:#ccc;stroke-width:1.4}
.snql-star.on svg .sf{fill:#f59e0b;stroke:#f59e0b}
.snql-star:hover:not(.on) svg .sf{stroke:#999}
.snql-star:hover svg{transform:scale(1.15)}
.snql-star svg{transition:transform 0.12s}
#snql-nores{display:none;text-align:center;padding:30px;color:#999;font-size:13px}
`;

const id = "snql-overlay";
document.getElementById(id) && document.getElementById(id).remove();

const styleEl = document.createElement("style");
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

const overlay = document.createElement("div");
overlay.id = id;
overlay.onclick = e => { if(e.target === overlay) close(); };

let pins = loadPins();
let activeTab = null;

function close() {
  overlay.remove();
  styleEl.remove();
}

function open(url, raw) {
  close();
  window.open(raw ? rawUrl(url) : classicUrl(url), "_blank");
}

function runHandler(key) {
  close();
  if (HANDLERS[key]) HANDLERS[key]();
}

function togglePin(name) {
  const i = pins.indexOf(name);
  if (i > -1) pins.splice(i, 1);
  else { pins.unshift(name); if (pins.length > MAX_PINS) pins = pins.slice(0, MAX_PINS); }
  savePins(pins);
  renderPinBar();
  renderCols(document.getElementById("snql-search").value);
}

function renderPinBar() {
  const bar = document.getElementById("snql-pinbar");
  if (pins.length === 0) {
    bar.innerHTML = `<span class="snql-pinlabel">${STAR_SVG} Favoris</span><span class="snql-hint">Survolez un lien pour l'épingler</span>`;
    return;
  }
  const pills = pins.map(p => {
    const safe = p.replace(/'/g, "\\'");
    return `<span class="snql-pill" onclick="snqlUnpin('${safe}')"><span>${p}</span><span class="snql-pill-x">&#215;</span></span>`;
  }).join("");
  bar.innerHTML = `<span class="snql-pinlabel">${STAR_SVG} Favoris</span>${pills}`;
}

window.snqlUnpin = name => { pins = pins.filter(p => p !== name); savePins(pins); renderPinBar(); renderCols(document.getElementById("snql-search").value); };
window.snqlTogglePin = name => togglePin(name);
window.snqlOpen = (url, raw) => open(url, raw);
window.snqlRun = key => runHandler(key);

function renderTabs() {
  const el = document.getElementById("snql-tabs");
  el.innerHTML = `<button class="snql-tab${activeTab === null ? " active" : ""}" onclick="snqlSetTab(null)">Tout</button>`;
  data.forEach((col, i) => {
    const btn = document.createElement("button");
    btn.className = "snql-tab" + (activeTab === i ? " active" : "");
    if (activeTab === i) btn.style.cssText = `background:${rgba(col.c,0.12)};border-color:${col.c};color:${col.c}`;
    btn.textContent = col.f;
    btn.onclick = () => snqlSetTab(i);
    el.appendChild(btn);
  });
}
window.snqlSetTab = i => { activeTab = i; renderTabs(); renderCols(""); document.getElementById("snql-search").value = ""; };

function renderCols(q) {
  const cols = document.getElementById("snql-cols");
  const nores = document.getElementById("snql-nores");
  const search = q.toLowerCase().trim();
  let html = "", count = 0;
  const filtered = activeTab !== null ? [data[activeTab]] : data;

  filtered.forEach(col => {
    let colHtml = "", hasItem = false;
    col.l.forEach(item => {
      if (item.section) {
        colHtml += `<div class="snql-sec" style="background:${rgba(col.c,0.08)};color:${col.c}">${item.section}</div>`;
        return;
      }
      if (search && !item.t.toLowerCase().includes(search)) return;
      hasItem = true; count++;
      const pinned = pins.includes(item.t);
      const safe = item.t.replace(/'/g, "\\'").replace(/"/g, "&quot;");

      let clickMain, clickRaw = "";
      if (item.h) {
        clickMain = `onclick="snqlRun('${item.h}')"`;
      } else {
        clickMain = `onclick="snqlOpen('${item.u.replace(/'/g,"\\'")}')"`;
        clickRaw = `<a class="snql-raw" href="#" title="Ouvrir (raw)" onclick="event.preventDefault();snqlOpen('${item.u.replace(/'/g,"\\'")}',true)">&#8599;</a>`;
      }

      colHtml += `<div class="snql-row">
        <a class="snql-link" href="#" ${clickMain}>${item.t}</a>
        ${clickRaw}
        <button class="snql-star${pinned?" on":""}" title="${pinned?"Désépingler":"Épingler"}" onclick="snqlTogglePin('${safe}')">${STAR_SVG}</button>
      </div>`;
    });
    if (hasItem) {
      html += `<div><div class="snql-col-title" style="color:${col.c};border-color:${col.c}">${col.f}</div>${colHtml}</div>`;
    }
  });

  cols.innerHTML = html;
  nores.style.display = count === 0 ? "" : "none";
  cols.style.display = count === 0 ? "none" : "";
}

overlay.innerHTML = `<div id="snql-win">
  <div id="snql-topbar">
    <div id="snql-search-wrap">
      <span id="snql-search-icon">&#128269;</span>
      <input id="snql-search" type="text" placeholder="Rechercher un lien..." oninput="snqlSearch(this.value)" autocomplete="off">
    </div>
    <button id="snql-close" title="Fermer" onclick="snqlClose()">&#215;</button>
  </div>
  <div id="snql-pinbar"></div>
  <div id="snql-tabs"></div>
  <div id="snql-cols"></div>
  <div id="snql-nores">Aucun résultat pour cette recherche.</div>
</div>`;

window.snqlSearch = v => renderCols(v);
window.snqlClose = close;

document.body.appendChild(overlay);
renderPinBar();
renderTabs();
renderCols("");

document.getElementById("snql-search").focus();

})();void(0);
