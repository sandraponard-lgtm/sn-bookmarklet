javascript:(function(){

/* ============================================================
   SN PROJECT NAVIGATOR — V3.0
   Nouveau layout : topbar | nav horizontale | onglets | hiérarchie + data
   ============================================================ */

const STYLE_ID   = "snfus-style";
const OVERLAY_ID = "snfus-overlay";
document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).remove();
document.getElementById(STYLE_ID)   && document.getElementById(STYLE_ID).remove();

/* ---- COULEURS ---- */
const C_IN="#2dd9a3",C_SEL="#ffd23a",C_PRJ="#3aa0ff";
const C_T1="#b06bff",C_T2="#ff9f3a",C_T3="#ff4d6d";
const C_CL="#ff4d6d",C_RA="#b06bff",C_TC="#2dd9a3",C_CP="#ff9f3a",C_EX="#ff4d6d";
const C_WS="#3aa0ff",C_ORDY="#e040fb";

function rgba(h,a){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return `rgba(${r},${g},${b},${a})`;}
function dc(d){return[C_PRJ,C_T1,C_T2,C_T3][Math.min(d,3)];}

/* ---- BOUTONS WORKSPACE ---- */
const WS_BUTTONS=[
  {t:"Project Workspace",
   url:(id,ts)=>`/now/workspace/project/home/sub/record/pm_project/${id}/params/page-name/details/time-stamp/${ts}/project-table/pm_project/project-id/${id}/record-status/1`},
  {t:"Planning",   url:(id,ts)=>`/now/workspace/project/home/sub/planning/pm_project/${id}/${ts}/params/page-name/planning`},
  {t:"Resources",  url:(id,ts)=>`/now/workspace/project/home/sub/resource_board/project_resource-${id}-pm_project-${ts}/params/timestamp/${ts}`},
  {t:"Details",    url:(id,ts)=>`/now/workspace/project/home/sub/record/pm_project/${id}/params/page-name/details/time-stamp/${ts}/project-table/pm_project/project-id/${id}/record-status/1`},
  {t:"Financials", url:(id,ts)=>`/now/workspace/project/home/sub/pw-financials/pm_project/${id}/${ts}/params/page-name/financials`},
  {t:"RIDAC",      url:(id,ts)=>`/now/workspace/project/home/sub/ridac-monitor/pm_project/${id}/${ts}/params/page-name/ridac-monitor`},
  {t:"Analytics",  url:(id,ts)=>`/now/workspace/project/home/sub/analytics/${id}/pm_project/${ts}/params/page-name/analytics`},
  {t:"Docs",       url:(id)   =>`/now/workspace/project/home/sub/docs/pm_project/${id}/params/page-name/docs`},
  {t:"Status Reports",url:(id,ts)=>`/now/workspace/project/home/sub/status-report/pm_project/${id}/${ts}/params/page-name/status-report`},
];

/* ---- BOUTONS LIENS CLASSIQUE ---- */
const CL_BUTTONS=[
  {t:"Classique UI",         grp:"cl",
   urlP:(id)=>`/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}`,
   urlT:(id)=>`/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}`},
  {t:"Cost Plan",            grp:"cp",
   urlP:(id)=>`/cost_plan_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/cost_plan_list.do?sysparm_query=task%3D${id}`},
  {t:"CP Breakdown (Task)",  grp:"cp",
   urlP:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}`,
   urlT:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}`},
  {t:"CP Breakdown (CP.Task)",grp:"cp",
   urlP:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=cost_plan.top_task%3D${id}`,
   urlT:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=cost_plan.task%3D${id}`},
  {t:"Expense Lines",        grp:"ex",
   urlP:(id)=>`/fm_expense_line_list.do?sysparm_query=source_id%3D${id}`,
   urlT:(id)=>`/fm_expense_line_list.do?sysparm_query=source_id%3D${id}`},
  {t:"Resource Assignments", grp:"ra",
   urlP:(id)=>`/sn_plng_att_core_resource_assignment_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/sn_plng_att_core_resource_assignment_list.do?sysparm_query=task%3D${id}`},
  {t:"Resource Plan",        grp:"ra",
   urlP:(id)=>`/resource_plan_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/resource_plan_list.do?sysparm_query=task%3D${id}`},
  {t:"Resource Allocation",  grp:"ra",
   urlP:(id)=>`/resource_allocation_list.do?sysparm_query=resource_plan.top_task%3D${id}`,
   urlT:(id)=>`/resource_allocation_list.do?sysparm_query=resource_plan.task%3D${id}`},
  {t:"Time Card",            grp:"tc",
   urlP:(id)=>`/time_card_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/time_card_list.do?sysparm_query=task%3D${id}`},
  {t:"Time Card Dailies",    grp:"tc",
   urlP:(id)=>`/time_card_daily_list.do?sysparm_query=time_card.top_task%3D${id}`,
   urlT:(id)=>`/time_card_daily_list.do?sysparm_query=time_card.task%3D${id}`},
];

/* ---- LISTES CONNEXES ---- */
const CONN_LISTS=[
  { id:"ra", label:"Resource Assignments", color:C_RA,
    table:"sn_plng_att_core_resource_assignment",
    qP:(id)=>`top_task=${id}`, qT:(id)=>`task=${id}`,
    clickable:true, // cliquable → onglet ORDY
    cols:[
      {f:"number",label:"N°"},
      {f:"user_resource",label:"Resource",ref:true},
      {f:"role",label:"Role",ref:true},
      {f:"effort_type",label:"Type",ref:true},
      {f:"effort",label:"Effort"},
      {f:"start_date",label:"Début"},
      {f:"end_date",label:"Fin"},
    ]
  },
  { id:"tc", label:"Time Cards", color:C_TC,
    table:"time_card",
    qP:(id)=>`top_task=${id}`, qT:(id)=>`task=${id}`,
    hasHJH:true, // bouton toggle H/JH
    numericCols:["sunday","monday","tuesday","wednesday","thursday","friday","saturday","total"],
    cols:[
      {f:"week_starts_on",label:"Week starts on"},
      {f:"category",label:"Category",ref:true},
      {f:"user",label:"User",ref:true},
      {f:"task",label:"Task",ref:true},
      {f:"resource_assignment",label:"RA",ref:true},
      {f:"state",label:"State"},
      {f:"sunday",label:"Sun",num:true},{f:"monday",label:"Mon",num:true},{f:"tuesday",label:"Tue",num:true},
      {f:"wednesday",label:"Wed",num:true},{f:"thursday",label:"Thu",num:true},{f:"friday",label:"Fri",num:true},
      {f:"saturday",label:"Sat",num:true},{f:"total",label:"Total",num:true},
    ]
  },
  { id:"cp", label:"Cost Plans", color:C_CP,
    table:"cost_plan",
    qP:(id)=>`top_task=${id}`, qT:(id)=>`task=${id}`,
    hasBreakdown:true,
    cols:[
      {f:"short_description",label:"Name"},
      {f:"task",label:"Task",ref:true},
      {f:"resource_type",label:"Resource type",ref:true},
      {f:"start_fiscal_period",label:"Start period",ref:true},
      {f:"end_fiscal_period",label:"End period",ref:true},
      {f:"cost_default_currency",label:"Planned cost"},
      {f:"actual_cost_default_currency",label:"Actual cost"},
      {f:"currency",label:"Currency"},
      {f:"expense_type",label:"Expense type",ref:true},
    ]
  },
  { id:"ex", label:"Expense Lines", color:C_EX,
    table:"fm_expense_line",
    qP:(id)=>`source_id=${id}`, qT:(id)=>`source_id=${id}`,
    cols:[
      {f:"number",label:"N°"},
      {f:"date",label:"Date"},
      {f:"short_description",label:"Description"},
      {f:"source_id",label:"Source ID",ref:true},
      {f:"amount",label:"Amount"},
      {f:"time_card",label:"Time card",ref:true},
      {f:"time_card.total",label:"TC Total"},
      {f:"base_expense",label:"Base expense",ref:true},
      {f:"base_expense.time_card",label:"Base TC",ref:true},
      {f:"base_expense.time_card.total",label:"Base TC Total"},
    ]
  },
];

const CP_BREAKDOWN_COLS=[
  {f:"breakdown_type",label:"Type"},
  {f:"expense_type",label:"Expense type",ref:true},
  {f:"fiscal_period",label:"Fiscal period",ref:true},
  {f:"task",label:"Task",ref:true},
  {f:"portfolio",label:"Portfolio",ref:true},
  {f:"program",label:"Program",ref:true},
  {f:"cost_default_currency",label:"Planned cost"},
];

/* ---- CHAMPS INFO RECORD ---- */
const DATE_LEFT=[
  {f:"approved_start_date",label:"Approved start date"},
  {f:"start_date",label:"Planned start date"},
  {f:"work_start",label:"Actual start date"},
  {f:"duration",label:"Planned duration"},
  {f:"effort",label:"Planned effort"},
];
const DATE_RIGHT=[
  {f:"approved_end_date",label:"Approved end date"},
  {f:"end_date",label:"Planned end date"},
  {f:"work_end",label:"Actual end date"},
  {f:"work_duration",label:"Actual duration"},
  {f:"work_effort",label:"Actual effort"},
];
const DATE_FIELDS=[...DATE_LEFT,...DATE_RIGHT];
const COST_FIELDS=[
  {f:"cost",label:"Total planned cost"},
  {f:"capex_cost",label:"Planned capital"},
  {f:"opex_cost",label:"Planned operating"},
  {f:"budget_cost",label:"Budget cost"},
  {f:"work_cost",label:"Actual cost"},
];

/* ---- ONGLET ORDY : colonnes des sous-listes ---- */
const ORDY_ALLOC_COLS=[
  {f:"number",label:"N°"},
  {f:"resource_plan",label:"Resource Plan",ref:true},
  {f:"resource",label:"Resource",ref:true},
  {f:"start_date",label:"Début"},
  {f:"end_date",label:"Fin"},
  {f:"allocation_percent",label:"Alloc %"},
  {f:"state",label:"State"},
];
const ORDY_ALLOC_DAILY_COLS=[
  {f:"date",label:"Date"},
  {f:"allocation",label:"Allocation",ref:true},
  {f:"resource",label:"Resource",ref:true},
  {f:"hours",label:"Heures"},
  {f:"state",label:"State"},
];
const ORDY_RPLAN_COLS=[
  {f:"number",label:"N°"},
  {f:"task",label:"Task",ref:true},
  {f:"resource",label:"Resource",ref:true},
  {f:"start_date",label:"Début"},
  {f:"end_date",label:"Fin"},
  {f:"state",label:"State"},
];
const ORDY_TC_COLS=[
  {f:"week_starts_on",label:"Week starts on"},
  {f:"user",label:"User",ref:true},
  {f:"task",label:"Task",ref:true},
  {f:"resource_assignment",label:"RA",ref:true},
  {f:"state",label:"State"},
  {f:"sunday",label:"Sun",num:true},{f:"monday",label:"Mon",num:true},{f:"tuesday",label:"Tue",num:true},
  {f:"wednesday",label:"Wed",num:true},{f:"thursday",label:"Thu",num:true},{f:"friday",label:"Fri",num:true},
  {f:"saturday",label:"Sat",num:true},{f:"total",label:"Total",num:true},
];
const ORDY_TC_DAILY_COLS=[
  {f:"date",label:"Date"},
  {f:"time_card",label:"Time Card",ref:true},
  {f:"hours",label:"Heures"},
  {f:"state",label:"State"},
  {f:"task",label:"Task",ref:true},
];

/* ============================================================
   STYLE
   ============================================================ */
const styleEl=document.createElement("style");
styleEl.id=STYLE_ID;
styleEl.textContent=`
@keyframes snfus-fadein{from{opacity:0}to{opacity:1}}
@keyframes snfus-slideup{from{opacity:0;transform:translateY(8px) scale(.988)}to{opacity:1;transform:none}}

/* ===== OVERLAY ===== */
#snfus-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;
  font-family:"Segoe UI",Arial,sans-serif;
  background:radial-gradient(circle at 20% -10%,rgba(80,60,160,.35),transparent 55%),
             radial-gradient(circle at 90% 0%,rgba(20,140,160,.25),transparent 50%),rgba(6,8,18,.96);
  backdrop-filter:blur(6px);animation:snfus-fadein .14s ease-out;padding:10px;gap:8px}

/* ===== TOPBAR ===== */
#snfus-topbar{display:flex;align-items:center;gap:12px;flex-shrink:0}
#snfus-title{display:flex;align-items:center;gap:8px;flex-shrink:0}
#snfus-title h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;
  color:${C_IN};text-shadow:0 0 12px ${rgba(C_IN,.55)};margin:0}
#snfus-autodetect{font-size:10px;color:${rgba(C_IN,.6)};font-style:italic}
#snfus-status{font-size:11px;color:rgba(238,240,251,.5)}
#snfus-status.ok{color:${C_IN}} #snfus-status.err{color:#ff6b7a}
#snfus-topbar-right{display:flex;align-items:center;gap:8px;margin-left:auto}
#snfus-close{cursor:pointer;font-size:18px;color:rgba(238,240,251,.5);background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);width:28px;height:28px;border-radius:7px;
  display:flex;align-items:center;justify-content:center;transition:all .14s;flex-shrink:0}
#snfus-close:hover{background:rgba(255,80,90,.18);color:#ff9aa3}

/* inputs dans topbar */
.snfus-top-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
  color:rgba(238,240,251,.4);margin-bottom:2px}
.snfus-top-input-wrap{display:flex;flex-direction:column}
.snfus-field{padding:6px 10px;border:1px solid ${rgba(C_IN,.3)};border-radius:8px;font-size:12px;
  background:rgba(255,255,255,.06);color:#f4f5ff;outline:none;font-family:inherit;
  transition:border-color .14s,box-shadow .14s;min-width:160px}
.snfus-field::placeholder{color:rgba(238,240,251,.3)}
.snfus-field:focus{border-color:${rgba(C_IN,.6)};box-shadow:0 0 0 3px ${rgba(C_IN,.14)}}
.snfus-field.detected{border-color:${rgba(C_IN,.5)};background:${rgba(C_IN,.07)}}
#snfus-load-btn{padding:7px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;
  background:${rgba(C_IN,.2)};border:1px solid ${rgba(C_IN,.5)};color:${C_IN};font-family:inherit;
  transition:all .14s;white-space:nowrap}
#snfus-load-btn:hover{background:${rgba(C_IN,.32)};box-shadow:0 0 12px ${rgba(C_IN,.4)}}
#snfus-load-btn:disabled{opacity:.45;cursor:default}

/* ===== NAVIGATION HORIZONTALE compacte ===== */
#snfus-nav{display:flex;align-items:center;gap:6px;flex-shrink:0;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
  border-radius:10px;padding:6px 10px;flex-wrap:nowrap;overflow-x:auto}

/* Section workspace en ligne */
#snfus-nav-ws{display:flex;align-items:center;gap:4px;flex-shrink:0}
.snfus-nav-section-title{display:none}
#snfus-ws-grid-main{display:flex;gap:3px;flex-wrap:nowrap}
.snfus-wbtn{padding:4px 8px;border-radius:6px;font-size:9.5px;font-weight:500;cursor:pointer;
  text-align:center;border:1px solid ${rgba(C_WS,.35)};background:${rgba(C_WS,.1)};
  color:${C_WS};transition:all .13s;font-family:inherit;white-space:nowrap}
.snfus-wbtn:disabled{opacity:.28;cursor:default}
.snfus-wbtn:hover:not(:disabled){background:${rgba(C_WS,.22)};box-shadow:0 0 8px ${rgba(C_WS,.3)}}
.snfus-wbtn.ws-full{font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.5px;
  background:${rgba(C_WS,.18)}}

/* séparateur vertical */
.snfus-nav-sep{width:1px;height:24px;background:rgba(255,255,255,.12);margin:0 4px;flex-shrink:0}

/* Section classique UI — groupes sur une ligne */
#snfus-nav-cl{display:flex;align-items:center;gap:6px;flex:1;flex-wrap:nowrap}
.snfus-cl-group{display:flex;align-items:center;gap:2px;flex-shrink:0}
.snfus-cl-group-title{display:none}
.snfus-cl-group-btns{display:flex;gap:2px;flex-wrap:nowrap}
.snfus-lbtn{padding:4px 8px;border-radius:6px;font-size:9.5px;font-weight:500;cursor:pointer;
  border:1px solid ${rgba(C_CL,.35)};background:${rgba(C_CL,.1)};color:${C_CL};
  transition:all .13s;font-family:inherit;white-space:nowrap;text-align:left}
.snfus-lbtn:disabled{opacity:.28;cursor:default}
.snfus-lbtn:hover:not(:disabled){background:${rgba(C_CL,.22)};box-shadow:0 0 8px ${rgba(C_CL,.28)}}

/* ===== ONGLETS ===== */
#snfus-tabs-bar{display:flex;gap:6px;flex-shrink:0}
.snfus-tab{padding:6px 18px;border-radius:8px 8px 0 0;font-size:11.5px;font-weight:600;cursor:pointer;
  border:1px solid rgba(255,255,255,.1);border-bottom:none;
  background:rgba(255,255,255,.04);color:rgba(238,240,251,.55);
  transition:all .14s;font-family:inherit}
.snfus-tab.active{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.18)}
.snfus-tab-content{display:none;overflow:hidden}
.snfus-tab-content.active{display:flex;flex:1;flex-direction:column;min-height:0}

/* ===== LAYOUT PRINCIPAL ===== */
#snfus-main{flex:1;min-height:0;display:flex;flex-direction:column;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:0 10px 10px 10px;overflow:hidden}

/* Tab informations : hiérarchie | données côte à côte */
#snfus-tab-info{flex-direction:row !important;align-items:stretch;overflow:hidden}
#snfus-body{display:grid;grid-template-columns:var(--tree-w,30%) 1fr;gap:0;flex:1;align-self:stretch;overflow:hidden;min-height:0}
#snfus-body.tree-narrow{--tree-w:200px}
#snfus-body.tree-normal{--tree-w:30%}
#snfus-body.tree-full  {grid-template-columns:1fr}
#snfus-body.tree-full #snfus-data-col{display:none}

/* col hiérarchie */
#snfus-tree-col{display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.07);min-height:0;overflow:hidden}
#snfus-tree-header{display:flex;align-items:center;justify-content:space-between;
  padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
.snfus-tree-title{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:rgba(238,240,251,.4)}
#snfus-tree-toggle{display:inline-flex;gap:3px}
.snfus-ttbtn{font-size:9.5px;padding:2px 7px;border-radius:5px;border:1px solid rgba(255,255,255,.15);
  background:rgba(255,255,255,.05);color:rgba(238,240,251,.55);cursor:pointer;font-family:inherit;transition:all .13s}
.snfus-ttbtn:hover{background:rgba(255,255,255,.12);color:#fff}
.snfus-ttbtn.active{background:${rgba(C_SEL,.2)};border-color:${rgba(C_SEL,.45)};color:${C_SEL}}
#snfus-tree-box{overflow:auto;flex:1;font-size:11.5px;min-height:0}
.snfus-tree-hint{color:rgba(238,240,251,.3);font-size:11px;font-style:italic;padding:10px}

/* table hiérarchie */
#snfus-tree-table{width:100%;border-collapse:collapse;table-layout:fixed}
#snfus-tree-table colgroup col.col-num{width:130px}
#snfus-tree-table colgroup col.col-name{min-width:200px;width:200px}
#snfus-tree-table colgroup col.col-cnt{width:38px}
#snfus-tree-table thead th{position:sticky;top:0;z-index:1;background:rgba(18,20,38,.97);padding:6px 8px;
  text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;
  color:rgba(238,240,251,.45);border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap}
#snfus-tree-table thead th.cnt-col{text-align:center}
#snfus-tree-table tbody tr{cursor:pointer;transition:background .1s;border-bottom:1px solid rgba(255,255,255,.04)}
#snfus-tree-table tbody tr:hover{background:rgba(255,255,255,.05)}
#snfus-tree-table tbody tr.sel{background:rgba(255,210,58,.07)}
#snfus-tree-table tbody tr.sel td{color:#fff}
#snfus-tree-table td{padding:5px 8px;vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#snfus-tree-table td.num-cell{white-space:nowrap;overflow:visible}
/* col nom : ellipsis à 350px, tooltip au survol */
#snfus-tree-table td.name-cell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}
/* en narrow : masquer complètement la colonne nom */
#snfus-body.tree-narrow .col-name-hide{display:none}
#snfus-tree-table td.cnt-col{text-align:center;padding:4px 2px}
.snfus-tnode-num{font-size:10px;font-family:"Consolas","Courier New",monospace;white-space:nowrap}
.snfus-tnode-name{font-size:11px;color:#dde1f7;opacity:.85}
.snfus-sel-badge{display:none;font-size:8px;font-weight:700;padding:1px 3px;border-radius:3px;margin-left:4px;
  background:${rgba(C_SEL,.2)};color:${C_SEL};border:1px solid ${rgba(C_SEL,.4)}}
#snfus-tree-table tbody tr.sel .snfus-sel-badge{display:inline}
.snfus-cnt{font-size:9px;font-weight:600;padding:1px 5px;border-radius:9px;display:inline-block}
.snfus-cnt.ra{background:${rgba(C_RA,.18)};color:${C_RA};border:1px solid ${rgba(C_RA,.3)}}
.snfus-cnt.tc{background:${rgba(C_TC,.15)};color:${C_TC};border:1px solid ${rgba(C_TC,.28)}}
.snfus-cnt.cp{background:${rgba(C_CP,.15)};color:${C_CP};border:1px solid ${rgba(C_CP,.28)}}
.snfus-cnt.ex{background:${rgba(C_EX,.15)};color:${C_EX};border:1px solid ${rgba(C_EX,.28)}}
.snfus-cnt.empty{color:rgba(238,240,251,.2);background:none;border:none;font-weight:400}
.snfus-node-dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:middle}

#snfus-data-col{overflow-y:auto;overflow-x:hidden;flex:1;min-height:0;display:flex;flex-direction:column;gap:0}

/* info record */
#snfus-info{padding:12px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,.06)}
#snfus-info-title{font-size:12.5px;font-weight:600;color:${C_SEL};margin-bottom:10px}
#snfus-info-title span{font-size:10.5px;color:rgba(238,240,251,.45);font-weight:400;margin-left:8px}
#snfus-info-body{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start}
#snfus-dates-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px}
.snfus-dates-col-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;
  color:rgba(238,240,251,.3);margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid rgba(255,255,255,.05)}
#snfus-costs-col{display:flex;flex-direction:column;gap:6px;min-width:180px}
.snfus-costs-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;
  color:rgba(238,240,251,.3);margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid rgba(255,255,255,.05)}
.snfus-ifield{display:flex;flex-direction:column;gap:2px}
.snfus-ifield-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:rgba(238,240,251,.4)}
.snfus-ifield-val{font-size:11.5px;color:#eef0fb;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);border-radius:6px;padding:4px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.snfus-ifield-val.empty{color:rgba(238,240,251,.25);font-style:italic}
.snfus-ifield-val.overdue{background:${rgba(C_CL,.14)};border-color:${rgba(C_CL,.35)};color:#ff9aa3}
#snfus-info-empty{color:rgba(238,240,251,.3);font-size:11px;font-style:italic;padding:8px 0}

/* mini-listes */
.snfus-minilist{border-top:1px solid rgba(255,255,255,.05);flex-shrink:0}
.snfus-minilist-hdr{display:flex;align-items:center;justify-content:space-between;padding:8px 12px}
.snfus-minilist-title{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px}
.snfus-minilist-meta{display:flex;align-items:center;gap:8px}
.snfus-minilist-count{font-size:10px;color:rgba(238,240,251,.45)}
.snfus-minilist-open{font-size:10px;cursor:pointer;padding:2px 8px;border-radius:6px;border:1px solid;
  background:transparent;font-family:inherit;transition:all .13s}
.snfus-minilist-open:disabled{opacity:.3;cursor:default}
.snfus-minilist-body{overflow-x:auto}
.snfus-ml-table{width:100%;border-collapse:collapse;font-size:11px}
.snfus-ml-table th{padding:5px 8px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;
  letter-spacing:.6px;color:rgba(238,240,251,.4);white-space:nowrap;border-bottom:1px solid rgba(255,255,255,.06)}
.snfus-ml-table td{padding:5px 8px;color:#dde1f7;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,.04)}
.snfus-ml-table tr:hover td{background:rgba(255,255,255,.04)}
.snfus-ml-table td.empty{color:rgba(238,240,251,.3);font-style:italic}
.snfus-ml-table td.ref-link{color:${C_PRJ};cursor:pointer;text-decoration:underline}
.snfus-ml-table td.ref-link:hover{color:#90c8ff}
.snfus-ml-table tr.ra-clickable:hover td{background:${rgba(C_RA,.1)};cursor:pointer}
.snfus-ml-table tr.ra-clickable.ra-sel td{background:${rgba(C_RA,.18)};color:#fff}
/* ligne de somme */
.snfus-ml-table tfoot tr td{padding:5px 8px;border-top:1px solid rgba(255,255,255,.12);
  font-weight:700;color:#eef0fb;background:rgba(255,255,255,.04);font-size:11px}
.snfus-ml-table tfoot tr td.sum-label{color:${C_IN};font-size:10px;text-transform:uppercase;letter-spacing:.6px}
/* bouton toggle H/JH */
.snfus-hjh-btn{font-size:9px;padding:2px 7px;border-radius:5px;border:1px solid ${rgba(C_TC,.4)};
  background:${rgba(C_TC,.12)};color:${C_TC};cursor:pointer;font-family:inherit;transition:all .13s;white-space:nowrap}
.snfus-hjh-btn:hover{background:${rgba(C_TC,.25)}}
.snfus-ml-empty{padding:10px 12px;font-size:11px;color:rgba(238,240,251,.3);font-style:italic}
.snfus-ml-loading{padding:8px 12px;font-size:11px;color:${rgba(C_IN,.6)};font-style:italic}
/* breakdown */
.snfus-breakdown-wrap{background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06);overflow-x:auto}
.snfus-breakdown-hdr{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;
  color:${C_CP};padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.05)}
.snfus-breakdown-loading{padding:8px 10px;font-size:11px;color:${rgba(C_IN,.6)};font-style:italic}
.snfus-bkd-btn{font-size:9px;padding:2px 7px;border-radius:4px;border:1px solid ${rgba(C_CP,.4)};
  background:${rgba(C_CP,.1)};color:${C_CP};cursor:pointer;font-family:inherit;transition:all .12s;white-space:nowrap}
.snfus-bkd-btn:hover{background:${rgba(C_CP,.22)}}

/* ===== ONGLET ORDY ===== */
#snfus-tab-ordy{overflow-y:auto;overflow-x:hidden;gap:0}
#snfus-ordy-empty{color:rgba(238,240,251,.35);font-size:12px;font-style:italic;
  padding:40px;text-align:center;flex:1}
.snfus-ordy-section{border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}
.snfus-ordy-section-hdr{display:flex;align-items:center;justify-content:space-between;
  padding:8px 12px;cursor:pointer;user-select:none;transition:background .12s}
.snfus-ordy-section-hdr:hover{background:rgba(255,255,255,.04)}
.snfus-ordy-section-title{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${C_ORDY}}
.snfus-ordy-section-meta{display:flex;align-items:center;gap:8px;font-size:10px;color:rgba(238,240,251,.45)}
.snfus-ordy-chevron{transition:transform .15s;font-size:10px}
.snfus-ordy-section.collapsed .snfus-ordy-chevron{transform:rotate(-90deg)}
.snfus-ordy-section-body{overflow-x:auto}
.snfus-ordy-section.collapsed .snfus-ordy-section-body{display:none}
/* ligne cliquable dans alloc/tc pour afficher daily */
.snfus-ordy-row-click:hover td{background:${rgba(C_ORDY,.08)};cursor:pointer}
.snfus-ordy-row-click.expanded td{background:${rgba(C_ORDY,.14)}}
.snfus-ordy-daily-row{background:rgba(255,255,255,.02)}
.snfus-ordy-daily-row td{font-size:10.5px;color:rgba(238,240,251,.7);padding:4px 8px 4px 24px}
`;
document.head.appendChild(styleEl);

/* ============================================================
   STATE
   ============================================================ */
let projId=null, selNode=null, activeTab="info", selRaSysId=null;
const _cnt={}, _info={}, _lists={}, _ordy={};

/* ============================================================
   HELPERS
   ============================================================ */
function apiH(){
  const tk=(window.top&&window.top.g_ck)||window.g_ck||"";
  const h={Accept:"application/json"};if(tk)h["X-UserToken"]=tk;return h;
}
async function apiFetch(u){return fetch(u,{headers:apiH()});}

function fmtVal(raw){
  if(raw===null||raw===undefined||raw==="") return "";
  if(typeof raw==="object"){
    const dv=raw.display_value;
    if(dv!==null&&dv!==undefined&&dv!=="") return fmtDate(String(dv));
    const v=raw.value;
    return (v!==null&&v!==undefined&&v!=="")?fmtDate(String(v)):"";
  }
  return fmtDate(String(raw));
}

function fmtDate(s){
  if(!s) return s;
  const isoFull=/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if(isoFull){
    const[,Y,M,D,h,m,sec]=isoFull;
    if(h!==undefined) return `${D}-${M}-${Y} ${h}:${m}:${sec||"00"}`;
    return `${D}-${M}-${Y}`;
  }
  const us=/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if(us){const[,M,D,Y,h,m,sec]=us;if(h!==undefined)return `${D}-${M}-${Y} ${h}:${m}:${sec||"00"}`;return `${D}-${M}-${Y}`;}
  return s;
}

function getSysId(rawId){
  if(!rawId) return "";
  if(typeof rawId==="object"){
    // Avec sysparm_display_value=all : {value, display_value}
    const v=rawId.value||rawId.display_value||"";
    return String(v).trim();
  }
  return String(rawId).trim();
}

function refCell(raw){
  if(!raw||typeof raw!=="object") return `<td class="empty">(empty)</td>`;
  const label=raw.display_value||raw.value||"";
  if(!label) return `<td class="empty">(empty)</td>`;
  if(raw.link){
    const refUrl=`${location.origin}/now/nav/ui/classic/params/target/${raw.link.split("/api/now/table/")[1]||""}`;
    return `<td class="ref-link" onclick="event.stopPropagation();window.open('${refUrl}','_blank')">${label}</td>`;
  }
  return `<td>${label}</td>`;
}

function cellHtml(raw){
  if(!raw&&raw!==0) return `<td class="empty">(empty)</td>`;
  if(typeof raw==="object"){
    const label=raw.display_value||raw.value||"";
    if(!label) return `<td class="empty">(empty)</td>`;
    if(raw.link){
      const refUrl=`${location.origin}/now/nav/ui/classic/params/target/${raw.link.split("/api/now/table/")[1]||""}`;
      return `<td class="ref-link" onclick="event.stopPropagation();window.open('${refUrl}','_blank')">${label}</td>`;
    }
    return `<td>${label}</td>`;
  }
  const val=fmtVal(raw);
  return `<td class="${val?"":"empty"}">${val||"(empty)"}</td>`;
}

/* ============================================================
   HTML SKELETON
   ============================================================ */
const overlay=document.createElement("div");
overlay.id=OVERLAY_ID;
overlay.onclick=e=>{if(e.target===overlay)close();};

// groupes de boutons CL par grp
const CL_GROUPS={
  cp:{title:"Cost Plans",btns:[]},
  ex:{title:"Expense Lines",btns:[]},
  ra:{title:"Resource",btns:[]},
  tc:{title:"Time Cards",btns:[]},
  cl:{title:"Classique",btns:[]},
};
CL_BUTTONS.forEach(b=>CL_GROUPS[b.grp].btns.push(b));

function navWsHtml(){
  const grid=WS_BUTTONS.filter(b=>b.t!=="Project Workspace")
    .map(b=>`<button class="snfus-wbtn" disabled onclick="snfusOpenWs('${b.t.replace(/'/g,"\\'")}')">${b.t}</button>`).join("");
  return `<div id="snfus-nav-ws">
    <div class="snfus-nav-section-title">Workspace</div>
    <button class="snfus-wbtn ws-full" disabled onclick="snfusOpenWs('Project Workspace')">Project Workspace</button>
    <div id="snfus-ws-grid-main">${grid}</div>
  </div>`;
}

function navClHtml(){
  const groups=Object.entries(CL_GROUPS).map(([,g])=>{
    const btns=g.btns.map(b=>`<button class="snfus-lbtn" disabled onclick="snfusOpenLink('${b.t.replace(/'/g,"\\'")}')">${b.t}</button>`).join("");
    return `<div class="snfus-cl-group">
      <div class="snfus-cl-group-title">${g.title}</div>
      <div class="snfus-cl-group-btns">${btns}</div>
    </div>`;
  }).join("");
  return `<div id="snfus-nav-cl">${groups}</div>`;
}

overlay.innerHTML=`
<div id="snfus-overlay" style="position:static;padding:0;background:none;backdrop-filter:none;animation:none">
<div id="snfus-overlay" style="display:contents">
</div>`;

// On repart proprement
overlay.innerHTML="";

// Topbar
const topbar=document.createElement("div");topbar.id="snfus-topbar";
topbar.innerHTML=`
  <div id="snfus-title">
    <h2>🗂️ Project Navigator</h2>
    <span id="snfus-autodetect"></span>
    <span id="snfus-status"></span>
  </div>
  <div id="snfus-topbar-right">
    <div class="snfus-top-input-wrap">
      <div class="snfus-top-label">Numéro</div>
      <input class="snfus-field" id="snfus-number" placeholder="PRJ0001234"
        oninput="snfusOnInput('number')" onkeydown="if(event.key==='Enter')snfusLoad()" style="min-width:130px">
    </div>
    <div class="snfus-top-input-wrap">
      <div class="snfus-top-label">SYS_ID</div>
      <input class="snfus-field" id="snfus-sysid" placeholder="f041cb6a..."
        oninput="snfusOnInput('sysid')" onkeydown="if(event.key==='Enter')snfusLoad()" style="min-width:220px">
    </div>
    <button id="snfus-load-btn" onclick="snfusLoad()" style="align-self:flex-end">Charger la hiérarchie</button>
    <button id="snfus-close" onclick="snfusClose()">&#215;</button>
  </div>`;
overlay.appendChild(topbar);

// Nav
const nav=document.createElement("div");nav.id="snfus-nav";
nav.innerHTML=navWsHtml()+`<div class="snfus-nav-sep"></div>`+navClHtml();
overlay.appendChild(nav);

// Onglets
const tabsBar=document.createElement("div");tabsBar.id="snfus-tabs-bar";
tabsBar.innerHTML=`
  <button class="snfus-tab active" onclick="snfusSetTab('info')">Informations</button>
  <button class="snfus-tab" onclick="snfusSetTab('ordy')">🤖 ORDY</button>`;
overlay.appendChild(tabsBar);

// Zone principale
const main=document.createElement("div");main.id="snfus-main";

// Tab info
const tabInfo=document.createElement("div");tabInfo.id="snfus-tab-info";tabInfo.className="snfus-tab-content active";
const split=document.createElement("div");split.id="snfus-split";split.setAttribute("id","snfus-body");

// Colonne hiérarchie
const treeCol=document.createElement("div");treeCol.id="snfus-tree-col";
treeCol.innerHTML=`
  <div id="snfus-tree-header">
    <span class="snfus-tree-title">Hiérarchie du projet</span>
    <div id="snfus-tree-toggle">
      <button class="snfus-ttbtn" onclick="snfusTreeSize('narrow')" title="Compact">⊟</button>
      <button class="snfus-ttbtn active" onclick="snfusTreeSize('normal')" title="Normal">⊡</button>
      <button class="snfus-ttbtn" onclick="snfusTreeSize('full')" title="Plein écran">⊞</button>
    </div>
  </div>
  <div id="snfus-tree-box">
    <div class="snfus-tree-hint" id="snfus-tree-hint">Entrez un numéro ou sys_id.</div>
    <table id="snfus-tree-table" style="display:none">
      <colgroup><col class="col-num"><col class="col-name"><col class="col-cnt"><col class="col-cnt"><col class="col-cnt"><col class="col-cnt"></colgroup>
      <thead><tr>
        <th>Numéro</th>
        <th class="col-name-hide">Nom</th>
        <th class="cnt-col" style="color:${C_RA}" title="Resource Assignments">RA</th>
        <th class="cnt-col" style="color:${C_TC}" title="Time Cards">TC</th>
        <th class="cnt-col" style="color:${C_CP}" title="Cost Plans">CP</th>
        <th class="cnt-col" style="color:${C_EX}" title="Expense Lines">EX</th>
      </tr></thead>
      <tbody id="snfus-tree"></tbody>
    </table>
  </div>`;

// Colonne données
const dataCol=document.createElement("div");dataCol.id="snfus-data-col";
dataCol.innerHTML=`
  <div id="snfus-info">
    <div id="snfus-info-title">Sélectionnez un nœud</div>
    <div id="snfus-info-content"><div id="snfus-info-empty">—</div></div>
  </div>
  ${CONN_LISTS.map(cl=>`
  <div class="snfus-minilist" id="snfus-ml-${cl.id}">
    <div class="snfus-minilist-hdr">
      <span class="snfus-minilist-title" style="color:${cl.color}">${cl.label}</span>
      <div class="snfus-minilist-meta">
        <span class="snfus-minilist-count" id="snfus-ml-${cl.id}-count">—</span>
        <button class="snfus-minilist-open" disabled style="color:${cl.color};border-color:${rgba(cl.color,.4)}"
          onclick="snfusOpenList('${cl.id}')">↗ Liste complète</button>
      </div>
    </div>
    <div class="snfus-minilist-body" id="snfus-ml-${cl.id}-body">
      <div class="snfus-ml-empty">Sélectionnez un nœud.</div>
    </div>
  </div>`).join("")}`;

split.appendChild(treeCol);
split.appendChild(dataCol);
tabInfo.appendChild(split);

// Tab ORDY
const tabOrdy=document.createElement("div");tabOrdy.id="snfus-tab-ordy";tabOrdy.className="snfus-tab-content";
tabOrdy.innerHTML=`<div id="snfus-ordy-empty">Cliquez sur une ligne de Resource Assignment pour afficher les données ORDY.</div>`;

main.appendChild(tabInfo);
main.appendChild(tabOrdy);
overlay.appendChild(main);
document.body.appendChild(overlay);

/* ============================================================
   FERMETURE
   ============================================================ */
function close(){
  document.getElementById(OVERLAY_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();
  document.removeEventListener("keydown",onKey);
}
function onKey(e){if(e.key==="Escape")close();}
document.addEventListener("keydown",onKey);
function setSt(msg,type){const el=document.getElementById("snfus-status");el.textContent=msg;el.className=type||"";}

/* ============================================================
   ONGLETS
   ============================================================ */
window.snfusSetTab=(tab)=>{
  activeTab=tab;
  document.querySelectorAll(".snfus-tab").forEach((b,i)=>b.classList.toggle("active",["info","ordy"][i]===tab));
  document.querySelectorAll(".snfus-tab-content").forEach(p=>p.classList.remove("active"));
  document.getElementById(`snfus-tab-${tab}`)?.classList.add("active");
};

/* ============================================================
   TOGGLE TAILLE ARBRE
   ============================================================ */
window.snfusTreeSize=(size)=>{
  const body=document.getElementById("snfus-body");
  body.className=`tree-${size}`;
  document.querySelectorAll(".snfus-ttbtn").forEach((b,i)=>{
    b.classList.toggle("active",["narrow","normal","full"][i]===size);
  });
};

/* ============================================================
   BOUTONS NAVIGATION
   ============================================================ */
function allWsBtns(){return document.querySelectorAll("#snfus-nav-ws .snfus-wbtn");}
function allLinkBtns(){return document.querySelectorAll("#snfus-nav-cl .snfus-lbtn");}
function allListOpenBtns(){return document.querySelectorAll(".snfus-minilist-open");}

window.snfusOpenWs=(label)=>{
  const pid=projId||(selNode&&selNode.sys_id);if(!pid)return;
  const b=WS_BUTTONS.find(x=>x.t===label);if(!b)return;
  window.open(location.origin+b.url(pid,Date.now()),"_blank");
};

window.snfusOpenLink=(label)=>{
  if(!selNode)return;
  const b=CL_BUTTONS.find(x=>x.t===label);if(!b)return;
  const fn=selNode.depth===0?b.urlP:b.urlT;
  window.open(location.origin+fn(selNode.sys_id),"_blank");
};

window.snfusOpenList=(listId)=>{
  if(!selNode)return;
  const cl=CONN_LISTS.find(x=>x.id===listId);if(!cl)return;
  const fn=selNode.depth===0?cl.qP:cl.qT;
  window.open(`${location.origin}/${cl.table}_list.do?sysparm_query=${fn(selNode.sys_id)}`,"_blank");
};

/* ============================================================
   SÉLECTION NŒUD
   ============================================================ */
function selectNode(node){
  selNode=node;
  document.querySelectorAll("#snfus-tree tr").forEach(e=>e.classList.remove("sel"));
  document.querySelector(`#snfus-tree tr[data-id="${node.sys_id}"]`)?.classList.add("sel");
  allWsBtns().forEach(b=>b.disabled=false);
  allLinkBtns().forEach(b=>b.disabled=false);
  allListOpenBtns().forEach(b=>b.disabled=false);
  loadInfo(node);
  CONN_LISTS.forEach(cl=>loadMiniList(cl,node));
}

function deselectAll(){
  selNode=null;
  document.querySelectorAll("#snfus-tree tr").forEach(e=>e.classList.remove("sel"));
  allWsBtns().forEach(b=>b.disabled=true);
  allLinkBtns().forEach(b=>b.disabled=true);
  allListOpenBtns().forEach(b=>b.disabled=true);
  CONN_LISTS.forEach(cl=>{
    document.getElementById(`snfus-ml-${cl.id}-body`).innerHTML=`<div class="snfus-ml-empty">Sélectionnez un nœud.</div>`;
    document.getElementById(`snfus-ml-${cl.id}-count`).textContent="—";
  });
  document.getElementById("snfus-info-title").textContent="Sélectionnez un nœud";
  document.getElementById("snfus-info-content").innerHTML=`<div id="snfus-info-empty">—</div>`;
}

window.snfusSelectNode=(sysId)=>{
  const n=window._snfusNodes&&window._snfusNodes[sysId];if(n)selectNode(n);
};

/* ============================================================
   INFO RECORD
   ============================================================ */
async function loadInfo(node){
  if(_info[node.sys_id]){renderInfo(node,_info[node.sys_id]);return;}
  document.getElementById("snfus-info-title").textContent=`${node.number} — ${node.name}`;
  document.getElementById("snfus-info-content").innerHTML=`<div class="snfus-ml-loading">Chargement…</div>`;
  const isP=node.depth===0||node.isProject;
  const tbl=isP?"pm_project":"pm_project_task";
  const allFlds=[...DATE_FIELDS,...COST_FIELDS].map(f=>f.f).join(",");
  try{
    const res=await apiFetch(`/api/now/table/${tbl}?sysparm_query=sys_id=${node.sys_id}&sysparm_fields=${allFlds}&sysparm_limit=1&sysparm_display_value=all`);
    const data=await res.json();
    const rec=data.result&&data.result[0]?data.result[0]:{};
    _info[node.sys_id]={rec,isP};
    renderInfo(node,_info[node.sys_id]);
  }catch(e){
    document.getElementById("snfus-info-content").innerHTML=`<div class="snfus-ml-empty">Erreur.</div>`;
  }
}

function renderInfo(node,{rec,isP}){
  document.getElementById("snfus-info-title").innerHTML=`${node.number} <span>— ${node.name}</span>`;
  const now=new Date();
  function fieldHtml(f){
    const raw=rec[f.f]||null; const val=fmtVal(raw);
    let cls=val?"":"empty";
    if(val&&(f.f==="end_date"||f.f==="approved_end_date")){
      const rawStr=raw&&typeof raw==="object"?(raw.value||""):String(raw||"");
      const d=new Date(rawStr);if(!isNaN(d)&&d<now)cls="overdue";
    }
    return `<div class="snfus-ifield"><span class="snfus-ifield-lbl">${f.label}</span>
      <div class="snfus-ifield-val ${cls}">${val||"—"}</div></div>`;
  }
  const leftHtml=DATE_LEFT.map(fieldHtml).join("");
  const rightHtml=DATE_RIGHT.map(fieldHtml).join("");
  const costHtml=COST_FIELDS.map(fieldHtml).join("");
  document.getElementById("snfus-info-content").innerHTML=`
    <div id="snfus-info-body">
      <div id="snfus-dates-grid">
        <div><div class="snfus-dates-col-title">Start</div><div style="display:flex;flex-direction:column;gap:6px">${leftHtml}</div></div>
        <div><div class="snfus-dates-col-title">End</div><div style="display:flex;flex-direction:column;gap:6px">${rightHtml}</div></div>
      </div>
      <div id="snfus-costs-col"><div class="snfus-costs-title">Coûts</div>${costHtml}</div>
    </div>`;
}

/* ============================================================
   MINI-LISTES
   ============================================================ */
async function loadMiniList(cl,node){
  const bodyEl=document.getElementById(`snfus-ml-${cl.id}-body`);
  const cntEl=document.getElementById(`snfus-ml-${cl.id}-count`);
  if(_lists[cl.id]&&_lists[cl.id][node.sys_id]){renderMiniList(cl,_lists[cl.id][node.sys_id],bodyEl,cntEl);return;}
  bodyEl.innerHTML=`<div class="snfus-ml-loading">Chargement…</div>`;cntEl.textContent="…";
  const isP=node.depth===0||node.isProject;
  const q=(isP?cl.qP:cl.qT)(node.sys_id);
  const fields=cl.cols.map(c=>c.f).join(",")+",sys_id";
  try{
    const res=await apiFetch(`/api/now/table/${cl.table}?sysparm_query=${q}&sysparm_fields=${fields}&sysparm_limit=10&sysparm_display_value=all`);
    const data=await res.json();
    const rows=data.result||[];
    const total=res.headers.get("X-Total-Count");
    if(!_lists[cl.id])_lists[cl.id]={};
    _lists[cl.id][node.sys_id]={rows,total};
    renderMiniList(cl,{rows,total},bodyEl,cntEl);
  }catch(e){bodyEl.innerHTML=`<div class="snfus-ml-empty">Erreur.</div>`;cntEl.textContent="err";}
}

// État du toggle H/JH par liste
const _hjhMode={};

function numVal(raw){
  const s=typeof raw==="object"?(raw.display_value||raw.value||"0"):String(raw||"0");
  return parseFloat(s.replace(/[^\d.\-]/g,""))||0;
}

function renderMiniList(cl,{rows,total},bodyEl,cntEl){
  const shown=rows.length,tot=total?parseInt(total):shown;
  cntEl.textContent=tot>shown?`${shown}/${tot} (limité à 10)`:tot===1?"1 enregistrement":`${tot} enregistrements`;
  if(!rows.length){bodyEl.innerHTML=`<div class="snfus-ml-empty">Aucun enregistrement.</div>`;return;}
  const isJH=cl.hasHJH&&_hjhMode[cl.id]===true;
  const toggleBtn=cl.hasHJH
    ?`<button class="snfus-hjh-btn" onclick="snfusToggleHJH('${cl.id}')">${isJH?"→ H":"→ JH"}</button>`:"";
  const thCells=cl.cols.map(c=>`<th>${c.num?(c.label+(isJH?" (JH)":" (H)")):c.label}</th>`).join("")
    +(cl.id==="ra"?`<th style="width:30px"></th>`:"")
    +(cl.hasBreakdown?`<th style="width:80px"></th>`:"");
  // Sommes
  const sums={};
  if(cl.hasHJH) cl.cols.filter(c=>c.num).forEach(c=>{sums[c.f]=0;});
  const tdRows=rows.map(row=>{
    const sysId=getSysId(row.sys_id);
    const cells=cl.cols.map(c=>{
      if(c.num){
        const v=numVal(row[c.f]);
        if(cl.hasHJH) sums[c.f]+=v;
        const disp=isJH?(v/8).toFixed(2):v%1===0?String(v):v.toFixed(2);
        return `<td style="text-align:right">${disp}</td>`;
      }
      return cellHtml(row[c.f]);
    }).join("");
    const bkdCell=cl.hasBreakdown?`<td onclick="event.stopPropagation()"><button class="snfus-bkd-btn" onclick="snfusToggleBreakdown(this,'${sysId}')">▶ Breakdown</button></td>`:"";
    const raBtn=cl.id==="ra"
      ?`<td onclick="event.stopPropagation()"><button style="background:none;border:none;cursor:pointer;font-size:14px;padding:0 4px;opacity:.8" title="ORDY" onclick="snfusSelectRA('${sysId}',this.closest('tr'))">🤖</button></td>`:"";
    const rowUrl=sysId?`${location.origin}/now/nav/ui/classic/params/target/${cl.table}.do?sys_id=${sysId}`:"#";
    const colspan=cl.hasBreakdown?cl.cols.length+1:cl.cols.length;
    return `<tr onclick="window.open('${rowUrl}','_blank')">${cells}${raBtn}${cl.hasBreakdown?bkdCell:""}</tr>`
      +(cl.hasBreakdown?`<tr class="snfus-breakdown-row" id="snfus-bkd-${sysId}" style="display:none"><td colspan="${colspan}" style="padding:0"><div class="snfus-breakdown-wrap"><div class="snfus-breakdown-hdr">Cost Plan Breakdowns</div><div id="snfus-bkd-body-${sysId}" class="snfus-breakdown-loading">Cliquez sur ▶ pour charger.</div></div></td></tr>`:"");
  }).join("");
  // Ligne de somme
  let tfootHtml="";
  if(cl.hasHJH&&Object.keys(sums).length){
    const sumCells=cl.cols.map((c,i)=>{
      if(c.num){const v=sums[c.f];const disp=isJH?(v/8).toFixed(2):v%1===0?String(v):v.toFixed(2);return `<td style="text-align:right;font-weight:700">${disp}</td>`;}
      return i===0?`<td class="sum-label" style="color:${C_IN};font-size:10px;font-weight:700">Σ</td>`:`<td></td>`;
    }).join("")+(cl.id==="ra"?`<td></td>`:"");
    tfootHtml=`<tfoot><tr>${sumCells}</tr></tfoot>`;
  }
  bodyEl.innerHTML=
    (cl.hasHJH?`<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid rgba(255,255,255,.05)"><span style="font-size:10px;color:rgba(238,240,251,.4)">Unité :</span>${toggleBtn}</div>`:"")
    +`<table class="snfus-ml-table"><thead><tr>${thCells}</tr></thead><tbody>${tdRows}</tbody>${tfootHtml}</table>`;
}

window.snfusToggleHJH=(listId)=>{
  _hjhMode[listId]=!_hjhMode[listId];
  const node=selNode;if(!node||!_lists[listId]||!_lists[listId][node.sys_id])return;
  const cl=CONN_LISTS.find(x=>x.id===listId);if(!cl)return;
  renderMiniList(cl,_lists[listId][node.sys_id],
    document.getElementById(`snfus-ml-${listId}-body`),
    document.getElementById(`snfus-ml-${listId}-count`));
};

/* Breakdown cost plan */
window.snfusToggleBreakdown=async(btn,cpSysId)=>{
  const row=document.getElementById(`snfus-bkd-${cpSysId}`);
  const bodyDiv=document.getElementById(`snfus-bkd-body-${cpSysId}`);
  if(!row)return;
  const isOpen=row.style.display!=="none";
  if(isOpen){row.style.display="none";btn.textContent="▶ Breakdown";return;}
  row.style.display="";btn.textContent="▼ Breakdown";
  if(bodyDiv.dataset.loaded==="1")return;
  bodyDiv.className="snfus-breakdown-loading";bodyDiv.textContent="Chargement…";
  const fields=CP_BREAKDOWN_COLS.map(c=>c.f).join(",");
  try{
    const res=await apiFetch(`/api/now/table/cost_plan_breakdown?sysparm_query=cost_plan=${cpSysId}&sysparm_fields=${fields},sys_id&sysparm_limit=50&sysparm_display_value=all`);
    const data=await res.json();const rows=data.result||[];
    if(!rows.length){bodyDiv.textContent="Aucun breakdown.";bodyDiv.className="snfus-breakdown-loading";bodyDiv.dataset.loaded="1";return;}
    const thCells=CP_BREAKDOWN_COLS.map(c=>`<th>${c.label}</th>`).join("");
    const tdRows=rows.map(row=>{
      const sysId=getSysId(row.sys_id);
      const cells=CP_BREAKDOWN_COLS.map(c=>cellHtml(row[c.f])).join("");
      return `<tr style="cursor:pointer" onclick="window.open('${location.origin}/now/nav/ui/classic/params/target/cost_plan_breakdown.do?sys_id=${sysId}','_blank')">${cells}</tr>`;
    }).join("");
    bodyDiv.className="";bodyDiv.innerHTML=`<table class="snfus-ml-table"><thead><tr>${thCells}</tr></thead><tbody>${tdRows}</tbody></table>`;
    bodyDiv.dataset.loaded="1";
  }catch(e){bodyDiv.textContent="Erreur.";bodyDiv.className="snfus-breakdown-loading";}
};

/* ============================================================
   ONGLET ORDY
   ============================================================ */
window.snfusSelectRA=async(raSysId, trEl)=>{
  raSysId=String(raSysId).trim();
  if(!raSysId||!/^[0-9a-f]{32}$/i.test(raSysId)){
    console.warn("ORDY: raSysId invalide:", raSysId);return;
  }
  document.querySelectorAll(".ra-sel").forEach(r=>r.classList.remove("ra-sel"));
  trEl.classList.add("ra-sel");
  selRaSysId=raSysId;
  snfusSetTab("ordy");
  renderOrdyLoading();

  const fields_alloc=ORDY_ALLOC_COLS.map(c=>c.f).join(",")+",sys_id";
  const fields_tc=ORDY_TC_COLS.map(c=>c.f).join(",")+",sys_id";
  // Pour resource_plan : récupérer le champ resource_plan sur le RA lui-même
  const fields_ra="resource_plan,sys_id";

  try{
    // 1. Récupérer le RA pour avoir le resource_plan lié
    const [raRes, allocRes, tcRes]=await Promise.all([
      apiFetch(`/api/now/table/sn_plng_att_core_resource_assignment?sysparm_query=sys_id=${raSysId}&sysparm_fields=${fields_ra}&sysparm_limit=1&sysparm_display_value=all`),
      apiFetch(`/api/now/table/resource_allocation?sysparm_query=resource_assignment=${raSysId}&sysparm_fields=${fields_alloc}&sysparm_limit=50&sysparm_display_value=all`),
      apiFetch(`/api/now/table/time_card?sysparm_query=resource_assignment=${raSysId}&sysparm_fields=${fields_tc}&sysparm_limit=50&sysparm_display_value=all`),
    ]);
    const raData=(await raRes.json()).result||[];
    const allocs=(await allocRes.json()).result||[];
    const tcs=(await tcRes.json()).result||[];

    // 2. Récupérer le resource_plan via le sys_id trouvé dans le RA
    let rplans=[];
    if(raData.length&&raData[0].resource_plan){
      const rpRef=raData[0].resource_plan;
      const rpId=typeof rpRef==="object"?(rpRef.value||rpRef.display_value||""):String(rpRef||"");
      if(rpId&&/^[0-9a-f]{32}$/i.test(rpId)){
        const fields_rplan=ORDY_RPLAN_COLS.map(c=>c.f).join(",")+",sys_id";
        const rpRes=await apiFetch(`/api/now/table/resource_plan?sysparm_query=sys_id=${rpId}&sysparm_fields=${fields_rplan}&sysparm_limit=1&sysparm_display_value=all`);
        rplans=(await rpRes.json()).result||[];
      }
    }
    renderOrdy(raSysId, allocs, rplans, tcs);
  }catch(e){
    document.getElementById("snfus-tab-ordy").innerHTML=`<div class="snfus-ordy-empty">Erreur de chargement.</div>`;
  }
};

function renderOrdyLoading(){
  document.getElementById("snfus-tab-ordy").innerHTML=`<div class="snfus-ordy-empty snfus-ml-loading">Chargement des données ORDY…</div>`;
}

function ordyTableHtml(cols, rows, table, expandFn, hasHJH){
  if(!rows.length) return `<div class="snfus-ml-empty">Aucun enregistrement.</div>`;
  const isJH=hasHJH&&_hjhMode["ordy-tc"]===true;
  const toggleBtn=hasHJH?`<button class="snfus-hjh-btn" onclick="snfusOrdyToggleHJH()">${isJH?"→ H":"→ JH"}</button>`:"";
  const thCells=cols.map(c=>`<th>${c.num?(c.label+(isJH?" (JH)":" (H)")):c.label}</th>`).join("")+(expandFn?`<th style="width:30px"></th>`:"");
  const sums={};
  if(hasHJH) cols.filter(c=>c.num).forEach(c=>{sums[c.f]=0;});
  const tdRows=rows.map(row=>{
    const sysId=getSysId(row.sys_id);
    const cells=cols.map(c=>{
      if(c.num){
        const v=numVal(row[c.f]);
        if(hasHJH) sums[c.f]+=v;
        const disp=isJH?(v/8).toFixed(2):v%1===0?String(v):v.toFixed(2);
        return `<td style="text-align:right">${disp}</td>`;
      }
      return cellHtml(row[c.f]);
    }).join("");
    const expandCell=expandFn?`<td onclick="event.stopPropagation();${expandFn}('${sysId}',this)" style="cursor:pointer;text-align:center;color:${C_ORDY}">▶</td>`:"";
    const url=`${location.origin}/now/nav/ui/classic/params/target/${table}.do?sys_id=${sysId}`;
    return `<tr class="${expandFn?"snfus-ordy-row-click":""}" onclick="window.open('${url}','_blank')">${cells}${expandCell}</tr>`;
  }).join("");
  let tfootHtml="";
  if(hasHJH&&Object.keys(sums).length){
    const sumCells=cols.map((c,i)=>{
      if(c.num){const v=sums[c.f];const disp=isJH?(v/8).toFixed(2):v%1===0?String(v):v.toFixed(2);return `<td style="text-align:right;font-weight:700">${disp}</td>`;}
      return i===0?`<td class="sum-label" style="color:${C_IN};font-size:10px;font-weight:700">Σ</td>`:`<td></td>`;
    }).join("")+(expandFn?`<td></td>`:"");
    tfootHtml=`<tfoot><tr>${sumCells}</tr></tfoot>`;
  }
  return (hasHJH?`<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid rgba(255,255,255,.05)"><span style="font-size:10px;color:rgba(238,240,251,.4)">Unité :</span>${toggleBtn}</div>`:"")
    +`<table class="snfus-ml-table"><thead><tr>${thCells}</tr></thead><tbody>${tdRows}</tbody>${tfootHtml}</table>`;
}

window.snfusOrdyToggleHJH=()=>{
  _hjhMode["ordy-tc"]=!_hjhMode["ordy-tc"];
  // Re-rendre la section TC ORDY
  if(!window._ordyTCs||!window._ordyRaSysId) return;
  const tcHtml=ordyTableHtml(ORDY_TC_COLS,window._ordyTCs,"time_card","snfusOrdyExpandTC",true);
  const body=document.querySelector("#snfus-ordy-tc .snfus-ordy-section-body");
  if(body){body.innerHTML=tcHtml;}
  const meta=document.querySelector("#snfus-ordy-tc .snfus-ordy-section-meta span:first-child");
  if(meta) meta.textContent=`${window._ordyTCs.length} enregistrement${window._ordyTCs.length!==1?"s":""}`;
};

function ordySection(id, title, count, bodyHtml){
  return `<div class="snfus-ordy-section" id="snfus-ordy-${id}">
    <div class="snfus-ordy-section-hdr" onclick="snfusOrdyToggle('${id}')">
      <span class="snfus-ordy-section-title">${title}</span>
      <div class="snfus-ordy-section-meta">
        <span>${count} enregistrement${count!==1?"s":""}</span>
        <span class="snfus-ordy-chevron">▾</span>
      </div>
    </div>
    <div class="snfus-ordy-section-body">${bodyHtml}</div>
  </div>`;
}

function renderOrdy(raSysId, allocs, rplans, tcs){
  const tab=document.getElementById("snfus-tab-ordy");
  // Resource Plan (premier trouvé)
  const rplanHtml=ordyTableHtml(ORDY_RPLAN_COLS, rplans, "resource_plan", null, false);
  const allocHtml=ordyTableHtml(ORDY_ALLOC_COLS, allocs, "resource_allocation","snfusOrdyExpandAlloc", false);
  const tcHtml=ordyTableHtml(ORDY_TC_COLS, tcs, "time_card","snfusOrdyExpandTC", true);

  tab.innerHTML=
    ordySection("rplan","Resource Plan",rplans.length,rplanHtml)+
    ordySection("alloc","Resource Allocations",allocs.length,allocHtml)+
    ordySection("tc","Time Cards",tcs.length,tcHtml);

  // Stocker pour daily expansion
  window._ordyAllocs=allocs;
  window._ordyTCs=tcs;
  window._ordyRaSysId=raSysId;
}

window.snfusOrdyToggle=(id)=>{
  document.getElementById(`snfus-ordy-${id}`)?.classList.toggle("collapsed");
};

/* Charger les daily d'une allocation */
window.snfusOrdyExpandAlloc=async(allocSysId, btn)=>{
  const tr=btn.closest("tr");
  // Toggle si déjà ouvert
  const nextRows=[...tr.parentElement.children];
  const idx=nextRows.indexOf(tr);
  const existing=nextRows[idx+1];
  if(existing&&existing.dataset.dailyFor===allocSysId){
    existing.remove();btn.textContent="▶";tr.classList.remove("expanded");return;
  }
  tr.classList.add("expanded");btn.textContent="▼";
  const dailyTr=document.createElement("tr");
  dailyTr.dataset.dailyFor=allocSysId;
  dailyTr.className="snfus-ordy-daily-row";
  dailyTr.innerHTML=`<td colspan="${ORDY_ALLOC_COLS.length+1}" style="padding:0"><div class="snfus-ml-loading" style="padding:6px 10px">Chargement daily…</div></td>`;
  tr.insertAdjacentElement("afterend",dailyTr);
  const raSysId=window._ordyRaSysId;
  const fields=ORDY_ALLOC_DAILY_COLS.map(c=>c.f).join(",")+",sys_id";
  try{
    const res=await apiFetch(`/api/now/table/resource_allocation_daily?sysparm_query=allocation.resource_assignment=${raSysId}&sysparm_fields=${fields}&sysparm_limit=100&sysparm_display_value=all`);
    const rows=(await res.json()).result||[];
    if(!rows.length){dailyTr.querySelector("td").innerHTML=`<div class="snfus-ml-empty" style="padding:6px 10px">Aucun daily.</div>`;return;}
    const thCells=ORDY_ALLOC_DAILY_COLS.map(c=>`<th>${c.label}</th>`).join("");
    const tdRows=rows.map(row=>{
      const sysId=getSysId(row.sys_id);
      const cells=ORDY_ALLOC_DAILY_COLS.map(c=>cellHtml(row[c.f])).join("");
      return `<tr onclick="window.open('${location.origin}/now/nav/ui/classic/params/target/resource_allocation_daily.do?sys_id=${sysId}','_blank')">${cells}</tr>`;
    }).join("");
    dailyTr.querySelector("td").innerHTML=`<table class="snfus-ml-table"><thead><tr>${thCells}</tr></thead><tbody>${tdRows}</tbody></table>`;
  }catch(e){dailyTr.querySelector("td").innerHTML=`<div class="snfus-ml-empty" style="padding:6px 10px">Erreur.</div>`;}
};

/* Charger les daily d'une time card */
window.snfusOrdyExpandTC=async(tcSysId, btn)=>{
  const tr=btn.closest("tr");
  const nextRows=[...tr.parentElement.children];
  const idx=nextRows.indexOf(tr);
  const existing=nextRows[idx+1];
  if(existing&&existing.dataset.dailyFor===tcSysId){
    existing.remove();btn.textContent="▶";tr.classList.remove("expanded");return;
  }
  tr.classList.add("expanded");btn.textContent="▼";
  const dailyTr=document.createElement("tr");
  dailyTr.dataset.dailyFor=tcSysId;
  dailyTr.className="snfus-ordy-daily-row";
  dailyTr.innerHTML=`<td colspan="${ORDY_TC_COLS.length+1}" style="padding:0"><div class="snfus-ml-loading" style="padding:6px 10px">Chargement daily…</div></td>`;
  tr.insertAdjacentElement("afterend",dailyTr);
  const raSysId=window._ordyRaSysId;
  const fields=ORDY_TC_DAILY_COLS.map(c=>c.f).join(",")+",sys_id";
  try{
    const res=await apiFetch(`/api/now/table/time_card_daily?sysparm_query=time_card.resource_assignment=${raSysId}&sysparm_fields=${fields}&sysparm_limit=100&sysparm_display_value=all`);
    const rows=(await res.json()).result||[];
    if(!rows.length){dailyTr.querySelector("td").innerHTML=`<div class="snfus-ml-empty" style="padding:6px 10px">Aucun daily.</div>`;return;}
    const thCells=ORDY_TC_DAILY_COLS.map(c=>`<th>${c.label}</th>`).join("");
    const tdRows=rows.map(row=>{
      const sysId=getSysId(row.sys_id);
      const cells=ORDY_TC_DAILY_COLS.map(c=>cellHtml(row[c.f])).join("");
      return `<tr onclick="window.open('${location.origin}/now/nav/ui/classic/params/target/time_card_daily.do?sys_id=${sysId}','_blank')">${cells}</tr>`;
    }).join("");
    dailyTr.querySelector("td").innerHTML=`<table class="snfus-ml-table"><thead><tr>${thCells}</tr></thead><tbody>${tdRows}</tbody></table>`;
  }catch(e){dailyTr.querySelector("td").innerHTML=`<div class="snfus-ml-empty" style="padding:6px 10px">Erreur.</div>`;}
};

/* ============================================================
   COMPTEURS AU SURVOL
   ============================================================ */
window.snfusHover=async(sysId)=>{
  if(_cnt[sysId]!==undefined)return;
  _cnt[sysId]="loading";
  ["ra","tc","cp","ex"].forEach(k=>{
    const el=document.getElementById(`snfus-cnt-${k}-${sysId}`);
    if(el)el.innerHTML=`<span class="snfus-cnt ${k}" style="opacity:.5">…</span>`;
  });
  const node=window._snfusNodes&&window._snfusNodes[sysId];
  const isP=node&&(node.depth===0||node.isProject);
  const f=isP?"top_task":"task";
  try{
    const [raR,tcR,cpR,exR]=await Promise.all([
      apiFetch(`/api/now/table/sn_plng_att_core_resource_assignment?sysparm_query=${f}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
      apiFetch(`/api/now/table/time_card?sysparm_query=${f}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
      apiFetch(`/api/now/table/cost_plan?sysparm_query=${f}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
      apiFetch(`/api/now/table/fm_expense_line?sysparm_query=source_id=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
    ]);
    const [raD,tcD,cpD,exD]=await Promise.all([raR.json(),tcR.json(),cpR.json(),exR.json()]);
    const ra=parseInt(raR.headers.get("X-Total-Count")||(raD.result?raD.result.length:0));
    const tc=parseInt(tcR.headers.get("X-Total-Count")||(tcD.result?tcD.result.length:0));
    const cp=parseInt(cpR.headers.get("X-Total-Count")||(cpD.result?cpD.result.length:0));
    const ex=parseInt(exR.headers.get("X-Total-Count")||(exD.result?exD.result.length:0));
    _cnt[sysId]={ra,tc,cp,ex};
    const fill=(k,v,cls)=>{
      const el=document.getElementById(`snfus-cnt-${k}-${sysId}`);
      if(el)el.innerHTML=v>0?`<span class="snfus-cnt ${cls}">${v}</span>`:`<span class="snfus-cnt empty">—</span>`;
    };
    fill("ra",ra,"ra");fill("tc",tc,"tc");fill("cp",cp,"cp");fill("ex",ex,"ex");
  }catch(e){delete _cnt[sysId];}
};

/* ============================================================
   ARBRE
   ============================================================ */
function flatTree(all,pid,d){
  return all.filter(t=>t.parent===pid).flatMap(t=>[{...t,depth:d},...flatTree(all,t.sys_id,d+1)]);
}

function renderNode(n){
  const c=dc(n.depth),ind=n.depth*14,id=n.sys_id;
  const dotHtml=`<span class="snfus-node-dot" style="background:${c};box-shadow:0 0 4px ${rgba(c,.6)};margin-left:${ind}px"></span>`;
  return `<tr data-id="${id}" onclick="snfusSelectNode('${id}')" onmouseenter="snfusHover('${id}')">
    <td class="num-cell" style="white-space:nowrap">${dotHtml}<span class="snfus-tnode-num" style="color:${c}">${n.number}</span><span class="snfus-sel-badge">✓</span></td>
    <td class="name-cell col-name-hide" title="${n.name}"><span class="snfus-tnode-name">${n.name}</span></td>
    <td class="cnt-col" id="snfus-cnt-ra-${id}"><span class="snfus-cnt empty">—</span></td>
    <td class="cnt-col" id="snfus-cnt-tc-${id}"><span class="snfus-cnt empty">—</span></td>
    <td class="cnt-col" id="snfus-cnt-cp-${id}"><span class="snfus-cnt empty">—</span></td>
    <td class="cnt-col" id="snfus-cnt-ex-${id}"><span class="snfus-cnt empty">—</span></td>
  </tr>`;
}

function renderTree(nodes){
  const tEl=document.getElementById("snfus-tree");
  const hEl=document.getElementById("snfus-tree-hint");
  const tableEl=document.getElementById("snfus-tree-table");
  if(!nodes||!nodes.length){hEl.textContent="Aucune tâche trouvée.";hEl.style.display="";tableEl.style.display="none";return;}
  hEl.style.display="none";tableEl.style.display="";
  tEl.innerHTML=nodes.map(renderNode).join("");
}

/* ============================================================
   CHARGEMENT HIÉRARCHIE
   ============================================================ */
async function fetchParentChain(pid){
  const chain=[];let current=pid,safety=0;
  while(current&&safety++<10){
    try{
      const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=sys_id=${current}&sysparm_fields=number,short_description,parent&sysparm_limit=1`);
      const data=await res.json();const rec=data.result&&data.result[0];if(!rec)break;
      const parentRef=rec.parent;const parentId=parentRef?(parentRef.value||null):null;
      if(parentId&&/^[0-9a-f]{32}$/i.test(parentId)){chain.push({sys_id:current,number:rec.number,name:rec.short_description||""});current=parentId;}
      else break;
    }catch(e){break;}
  }
  return chain;
}

async function loadHierarchy(pid, autoSelectId){
  const tEl=document.getElementById("snfus-tree");
  const hEl=document.getElementById("snfus-tree-hint");
  const tableEl=document.getElementById("snfus-tree-table");
  tEl.innerHTML="";hEl.style.display="";hEl.textContent="Chargement…";tableEl.style.display="none";
  deselectAll();
  [_cnt,_info,...CONN_LISTS.map(x=>_lists[x.id]||{})].forEach(o=>{if(o)Object.keys(o).forEach(k=>delete o[k]);});

  async function fetchProject(id){
    const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=sys_id=${id}&sysparm_fields=number,short_description,parent&sysparm_limit=1`);
    const data=await res.json();return data.result&&data.result[0]?data.result[0]:null;
  }
  async function fetchTasks(id){
    const res=await apiFetch(`/api/now/table/pm_project_task?sysparm_query=top_task=${id}&sysparm_fields=sys_id,number,short_description,parent&sysparm_limit=2000`);
    const data=await res.json();
    return (data.result||[]).map(t=>({sys_id:t.sys_id,number:t.number,name:t.short_description||"",parent:t.parent?(t.parent.value||t.parent):id}));
  }
  // Récupérer les sous-projets enfants d'un projet (pm_project.parent = id)
  async function fetchChildProjects(id){
    const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=parent=${id}&sysparm_fields=sys_id,number,short_description&sysparm_limit=100`);
    const data=await res.json();return data.result||[];
  }

  try{
    const [prjRec,tasks,parentChain]=await Promise.all([fetchProject(pid),fetchTasks(pid),fetchParentChain(pid)]);
    const pNum=prjRec?prjRec.number:"PRJ";const pName=prjRec?prjRec.short_description||"":"";
    const ancestors=[...parentChain].reverse();
    const flat=[];
    ancestors.forEach((anc,i)=>flat.push({sys_id:anc.sys_id,number:anc.number,name:anc.name,depth:i,isProject:true}));
    const rootDepth=ancestors.length;
    flat.push({sys_id:pid,number:pNum,name:pName,depth:rootDepth,isProject:true});

    // Construire l'arbre des tâches récursivement
    // Pour chaque tâche qui est aussi un sous-projet, charger ses propres tâches
    async function addTasksWithSubProjects(parentId, d, allTasks){
      const children=allTasks.filter(t=>t.parent===parentId);
      for(const t of children){
        flat.push({...t,depth:d});
        // Vérifier si cette tâche est aussi un sous-projet (pm_project avec parent=pid)
        // Les sous-projets ont leur propre set de tâches via top_task = sous-projet.sys_id
        const subTasks=await fetchTasks(t.sys_id);
        if(subTasks.length>0){
          // C'est un sous-projet : charger ses enfants récursivement
          await addTasksWithSubProjects(t.sys_id,d+1,subTasks);
        } else {
          // Tâche normale : continuer dans le même allTasks
          await addTasksWithSubProjects(t.sys_id,d+1,allTasks);
        }
      }
    }

    // Chercher aussi les sous-projets directs (pm_project.parent = pid)
    const childProjects=await fetchChildProjects(pid);
    // Fusionner : les tâches du projet racine + les sous-projets comme nœuds dans l'arbre
    // Les sous-projets s'insèrent en fonction de leur position (ils ont un sys_id dans tasks via parent)
    const allNodes=[...tasks,...childProjects.map(cp=>({
      sys_id:cp.sys_id,
      number:cp.number,
      name:cp.short_description||"",
      parent:pid, // rattaché au projet racine
      isProject:true
    }))];

    await addTasksWithSubProjects(pid,rootDepth+1,allNodes);

    renderTree(flat);
    window._snfusNodes={};flat.forEach(n=>{window._snfusNodes[n.sys_id]=n;});

    // Fix 2 : auto-sélectionner le nœud correspondant au sys_id de la page
    if(autoSelectId&&window._snfusNodes[autoSelectId]){
      selectNode(window._snfusNodes[autoSelectId]);
    }
    return;
  }catch(e){console.error(e);}
  hEl.textContent="Erreur de chargement.";
}

/* ============================================================
   RÉSOLUTION
   ============================================================ */
async function resolveProj(sysId){
  try{
    const res=await apiFetch(`/api/now/table/pm_project_task?sysparm_query=sys_id=${sysId}&sysparm_fields=sub_tree_root&sysparm_limit=1`);
    const data=await res.json();
    if(data.result&&data.result[0]){const v=data.result[0].sub_tree_root;const id=v?(v.value||v):null;if(id&&/^[0-9a-f]{32}$/i.test(id))return id;}
  }catch(e){}
  return null;
}

window.snfusClose=close;
window.snfusOnInput=(src)=>{
  if(src==="number"&&document.getElementById("snfus-number").value.trim())document.getElementById("snfus-sysid").value="";
  if(src==="sysid"&&document.getElementById("snfus-sysid").value.trim())document.getElementById("snfus-number").value="";
};

window.snfusLoad=async()=>{
  const num=document.getElementById("snfus-number").value.trim();
  const sid=document.getElementById("snfus-sysid").value.trim();
  const btn=document.getElementById("snfus-load-btn");
  const hexRe=/^[0-9a-f]{32}$/i;
  if(!num&&!sid){setSt("Remplis un champ","err");return;}
  if(sid&&hexRe.test(sid)){
    btn.disabled=true;setSt("Chargement…","");
    const pid=await resolveProj(sid);const id=pid||sid;
    if(pid){document.getElementById("snfus-sysid").value=pid;setSt("↑ Projet via sub_tree_root","ok");}
    projId=id;await loadHierarchy(id, sid);setSt("✓ Chargé","ok");btn.disabled=false;return;
  }
  if(sid&&!hexRe.test(sid)){setSt("Format invalide","err");return;}
  if(num){
    btn.disabled=true;setSt("Résolution…","");
    try{
      const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=number=${encodeURIComponent(num)}&sysparm_fields=sys_id&sysparm_limit=1`);
      if(res.ok){
        const data=await res.json();
        if(data.result&&data.result.length){
          const id=data.result[0].sys_id;
          document.getElementById("snfus-sysid").value=id;
          projId=id;await loadHierarchy(id, id);setSt("✓ Chargé","ok");btn.disabled=false;return;
        }
      }
    }catch(e){}
    try{
      const GR=(window.top&&window.top.GlideRecord)||window.GlideRecord;
      if(GR){const gr=new GR("pm_project");gr.addQuery("number",num.toUpperCase());gr.setLimit(1);
        gr.query(async()=>{
          if(gr.next()){const id=gr.getUniqueValue();document.getElementById("snfus-sysid").value=id;projId=id;await loadHierarchy(id, id);setSt("✓ Chargé","ok");}
          else setSt("Introuvable","err");btn.disabled=false;});return;}
    }catch(e){}
    setSt("Erreur","err");btn.disabled=false;
  }
};

/* ============================================================
   DÉTECTION AUTO
   ============================================================ */
function detectSysId(){
  const url=decodeURIComponent(location.href);
  const m=url.match(/\/pm_project\/([0-9a-f]{32})/i)||url.match(/project-id\/([0-9a-f]{32})/i)
         ||url.match(/project_resource-([0-9a-f]{32})-pm_project/i)
         ||url.match(/[?&]sys_id=([0-9a-f]{32})/i)||url.match(/[?&]sysparm_sys_id=([0-9a-f]{32})/i);
  if(m)return m[1];
  try{const gf=(window.top&&window.top.g_form)||window.g_form;
    if(gf&&typeof gf.getUniqueValue==="function"){const v=gf.getUniqueValue();if(v&&/^[0-9a-f]{32}$/i.test(v))return v;}}catch(e){}
  const inp=document.querySelector('input[name="sys_id"],input[name="sysparm_sys_id"]');
  if(inp&&/^[0-9a-f]{32}$/i.test(inp.value))return inp.value;
  return null;
}

(async()=>{
  const autoId=detectSysId();
  if(autoId){
    const f=document.getElementById("snfus-sysid");
    f.value=autoId;f.classList.add("detected");setSt("Résolution…","");
    const pid=await resolveProj(autoId);const id=pid||autoId;
    if(pid){f.value=pid;document.getElementById("snfus-autodetect").textContent="⚡ Projet via tâche";}
    else document.getElementById("snfus-autodetect").textContent="⚡ sys_id détecté";
    projId=id;await loadHierarchy(id, autoId);setSt("✓ Chargé","ok");
  }else{setTimeout(()=>document.getElementById("snfus-number").focus(),100);}
})();

})();void(0);
