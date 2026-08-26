javascript:(function(){

/* ============================================================
   SN PROJECT NAVIGATOR — FUSION V1.0
   Hiérarchie + Liens + Info record + Listes connexes
   ============================================================ */

const STYLE_ID   = "snfus-style";
const OVERLAY_ID = "snfus-overlay";
document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).remove();
document.getElementById(STYLE_ID)   && document.getElementById(STYLE_ID).remove();

/* ---- COULEURS ---- */
const C_IN="#2dd9a3", C_SEL="#ffd23a", C_PRJ="#3aa0ff";
const C_T1="#b06bff", C_T2="#ff9f3a", C_T3="#ff4d6d";
const C_CL="#ff4d6d", C_RA="#b06bff", C_TC="#2dd9a3", C_CP="#ff9f3a", C_EX="#ff4d6d";

function rgba(h,a){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return `rgba(${r},${g},${b},${a})`;}
function dc(d){return[C_PRJ,C_T1,C_T2,C_T3][Math.min(d,3)];}

/* ---- BOUTONS WORKSPACE ---- */
const WS_BUTTONS=[
  {t:"Project Workspace", wide:true,
   url:(id,ts)=>`/now/workspace/project/home/sub/record/pm_project/${id}/params/page-name/details/time-stamp/${ts}/project-table/pm_project/project-id/${id}/record-status/1`},
  {t:"Planning",   url:(id,ts)=>`/now/workspace/project/home/sub/planning/pm_project/${id}/${ts}/params/page-name/planning`},
  {t:"Resources",  url:(id,ts)=>`/now/workspace/project/home/sub/resource_board/project_resource-${id}-pm_project-${ts}/params/timestamp/${ts}`},
  {t:"Details",    url:(id,ts)=>`/now/workspace/project/home/sub/record/pm_project/${id}/params/page-name/details/time-stamp/${ts}/project-table/pm_project/project-id/${id}/record-status/1`},
  {t:"Financials", url:(id,ts)=>`/now/workspace/project/home/sub/pw-financials/pm_project/${id}/${ts}/params/page-name/financials`},
  {t:"RIDAC",      url:(id,ts)=>`/now/workspace/project/home/sub/ridac-monitor/pm_project/${id}/${ts}/params/page-name/ridac-monitor`},
  {t:"Analytics",  url:(id,ts)=>`/now/workspace/project/home/sub/analytics/${id}/pm_project/${ts}/params/page-name/analytics`},
  {t:"Docs",       url:(id)   =>`/now/workspace/project/home/sub/docs/pm_project/${id}/params/page-name/docs`},
  {t:"Status Reports", url:(id,ts)=>`/now/workspace/project/home/sub/status-report/pm_project/${id}/${ts}/params/page-name/status-report`},
];

/* ---- BOUTONS LIENS CLASSIQUE ---- */
const CL_BUTTONS=[
  {t:"Classique UI", wide:true,
   urlP:(id)=>`/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}`,
   urlT:(id)=>`/now/nav/ui/classic/params/target/pm_project_task.do?sys_id=${id}`},
  {t:"Cost Plan",
   urlP:(id)=>`/cost_plan_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/cost_plan_list.do?sysparm_query=task%3D${id}`},
  {t:"CP Breakdown (Task)",
   urlP:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}`,
   urlT:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=task%3D${id}`},
  {t:"CP Breakdown (CP.Task)",
   urlP:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=cost_plan.top_task%3D${id}`,
   urlT:(id)=>`/cost_plan_breakdown_list.do?sysparm_query=cost_plan.task%3D${id}`},
  {t:"Time Card",
   urlP:(id)=>`/time_card_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/time_card_list.do?sysparm_query=task%3D${id}`},
  {t:"Time Card Dailies",
   urlP:(id)=>`/time_card_daily_list.do?sysparm_query=time_card.top_task%3D${id}`,
   urlT:(id)=>`/time_card_daily_list.do?sysparm_query=time_card.task%3D${id}`},
  {t:"Expense Lines", wide:true,
   urlP:(id)=>`/fm_expense_line_list.do?sysparm_query=source_id%3D${id}`,
   urlT:(id)=>`/fm_expense_line_list.do?sysparm_query=source_id%3D${id}`},
  {t:"Resource Assignments",
   urlP:(id)=>`/sn_plng_att_core_resource_assignment_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/sn_plng_att_core_resource_assignment_list.do?sysparm_query=task%3D${id}`},
  {t:"Resource Plan",
   urlP:(id)=>`/resource_plan_list.do?sysparm_query=top_task%3D${id}`,
   urlT:(id)=>`/resource_plan_list.do?sysparm_query=task%3D${id}`},
  {t:"Resource Allocation",
   urlP:(id)=>`/resource_allocation_list.do?sysparm_query=resource_plan.top_task%3D${id}`,
   urlT:(id)=>`/resource_allocation_list.do?sysparm_query=resource_plan.task%3D${id}`},
];

/* ---- LISTES CONNEXES (max 10) ---- */
const CONN_LISTS=[
  { id:"ra",  label:"Resource Assignments", color:C_RA,
    table:"sn_plng_att_core_resource_assignment",
    qP:(id)=>`top_task=${id}`, qT:(id)=>`task=${id}`,
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
  { id:"tc",  label:"Time Cards", color:C_TC,
    table:"time_card",
    qP:(id)=>`top_task=${id}`, qT:(id)=>`task=${id}`,
    cols:[
      {f:"week_starts_on", label:"Week starts on"},
      {f:"category",       label:"Category",  ref:true},
      {f:"user",           label:"User",       ref:true},
      {f:"task",           label:"Task",       ref:true},
      {f:"state",          label:"State"},
      {f:"sunday",         label:"Sun"},
      {f:"monday",         label:"Mon"},
      {f:"tuesday",        label:"Tue"},
      {f:"wednesday",      label:"Wed"},
      {f:"thursday",       label:"Thu"},
      {f:"friday",         label:"Fri"},
      {f:"saturday",       label:"Sat"},
      {f:"total",          label:"Total"},
    ]
  },
  { id:"cp",  label:"Cost Plans", color:C_CP,
    table:"cost_plan",
    qP:(id)=>`top_task=${id}`, qT:(id)=>`task=${id}`,
    cols:[
      {f:"number",label:"N°"},
      {f:"short_description",label:"Description"},
      {f:"cost_type",label:"Type",ref:true},
      {f:"planned_cost",label:"Planifié"},
      {f:"actual_cost",label:"Réel"},
      {f:"start_date",label:"Début"},
      {f:"end_date",label:"Fin"},
    ]
  },
  { id:"ex",  label:"Expense Lines", color:C_EX,
    table:"fm_expense_line",
    qP:(id)=>`source_id=${id}`, qT:(id)=>`source_id=${id}`,
    cols:[
      {f:"number",label:"N°"},
      {f:"short_description",label:"Description"},
      {f:"amount",label:"Montant"},
      {f:"currency",label:"Devise"},
      {f:"expense_date",label:"Date"},
    ]
  },
];

/* ---- CHAMPS INFO RECORD — grille 3 colonnes : Approved | Planned | Actual ----
   null = cellule vide pour conserver l'alignement
   ---- */
const DATE_FIELDS=[
  /* en-têtes implicites : Approved | Planned | Actual */
  /* ligne start */
  {f:"approved_start_date", label:"Approved start"},
  {f:"start_date",          label:"Planned start"},
  {f:"work_start",          label:"Actual start"},
  /* ligne end */
  {f:"approved_end_date",   label:"Approved end"},
  {f:"end_date",            label:"Planned end"},
  {f:"work_end",            label:"Actual end"},
  /* ligne duration — pas d'Approved, donc cellule vide à gauche */
  null,
  {f:"duration",            label:"Planned duration"},
  {f:"work_duration",       label:"Actual duration"},
  /* ligne effort — idem */
  null,
  {f:"effort",              label:"Planned effort"},
  {f:"work_effort",         label:"Actual effort"},
];
const COST_FIELDS_PRJ=[
  {f:"estimated_cost",   label:"Estimated cost"},
  {f:"actual_cost",      label:"Actual cost"},
  {f:"budget_cost",      label:"Budget cost"},
  {f:"planned_cost",     label:"Planned cost"},
  {f:"remaining_budget", label:"Remaining budget"},
  {f:"cost_variance",    label:"Cost variance"},
];
const COST_FIELDS_TSK=[
  {f:"estimated_cost",   label:"Estimated cost"},
  {f:"actual_cost",      label:"Actual cost"},
  {f:"planned_cost",     label:"Planned cost"},
  {f:"remaining_budget", label:"Remaining budget"},
];

/* ============================================================
   STYLE
   ============================================================ */
const styleEl=document.createElement("style");
styleEl.id=STYLE_ID;
styleEl.textContent=`
@keyframes snfus-fadein{from{opacity:0}to{opacity:1}}
@keyframes snfus-slideup{from{opacity:0;transform:translateY(8px) scale(.988)}to{opacity:1;transform:none}}
#snfus-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;
  padding:16px;font-family:"Segoe UI",Arial,sans-serif;
  background:radial-gradient(circle at 20% -10%,rgba(80,60,160,.35),transparent 55%),
             radial-gradient(circle at 90% 0%,rgba(20,140,160,.25),transparent 50%),rgba(6,8,18,.91);
  backdrop-filter:blur(6px);animation:snfus-fadein .14s ease-out}
#snfus-win{position:relative;width:90vw;max-width:none;height:90vh;display:flex;flex-direction:column;
  color:#eef0fb;background:linear-gradient(165deg,rgba(36,38,64,.8),rgba(18,19,36,.88));
  border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:16px 18px 18px;
  box-shadow:0 25px 70px -15px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.03) inset;
  animation:snfus-slideup .17s ease-out;overflow:hidden}

/* barre titre */
#snfus-topbar{display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-shrink:0}
#snfus-topbar h2{font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px;
  color:${C_IN};text-shadow:0 0 12px ${rgba(C_IN,.55)};margin:0;flex-shrink:0}
#snfus-close{cursor:pointer;font-size:18px;color:rgba(238,240,251,.5);background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);width:30px;height:30px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;transition:all .14s;flex-shrink:0;margin-left:auto}
#snfus-close:hover{background:rgba(255,80,90,.18);color:#ff9aa3}
#snfus-status{font-size:11px;color:rgba(238,240,251,.5);flex-shrink:0}
#snfus-status.ok{color:${C_IN}} #snfus-status.err{color:#ff6b7a}
#snfus-autodetect{font-size:10.5px;color:${rgba(C_IN,.6)};font-style:italic;flex-shrink:0}

/* layout 3 colonnes — col centre pilotée par CSS var */
#snfus-body{display:grid;grid-template-columns:240px var(--tree-w,320px) 1fr;gap:12px;flex:1;min-height:0;transition:grid-template-columns .2s ease}
/* états : narrow(Num+badges) | normal(+Nom tronqué) | full(hiérachie plein écran) */
#snfus-body.tree-narrow{grid-template-columns:240px 160px 1fr}
#snfus-body.tree-normal{grid-template-columns:240px 320px 1fr}
#snfus-body.tree-full  {grid-template-columns:240px 1fr 0px;pointer-events:auto}
/* en mode full : masquer la col droite */
#snfus-body.tree-full #snfus-right{display:none}
/* en mode narrow : masquer la colonne Nom */
#snfus-body.tree-narrow .col-name-hide{display:none}

/* ===== COL CENTRE : hiérarchie en table ===== */
#snfus-mid{display:flex;flex-direction:column;min-height:0}
.snfus-col-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
  color:rgba(238,240,251,.4);margin-bottom:6px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between}
/* boutons toggle */
#snfus-tree-toggle{display:inline-flex;gap:3px}
.snfus-ttbtn{font-size:9.5px;padding:2px 7px;border-radius:5px;border:1px solid rgba(255,255,255,.15);
  background:rgba(255,255,255,.05);color:rgba(238,240,251,.55);cursor:pointer;font-family:inherit;transition:all .13s}
.snfus-ttbtn:hover{background:rgba(255,255,255,.12);color:#fff}
.snfus-ttbtn.active{background:${rgba(C_SEL,.2)};border-color:${rgba(C_SEL,.45)};color:${C_SEL}}
#snfus-tree-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
  border-radius:10px;overflow:auto;flex:1;font-size:11.5px}
.snfus-tree-hint{color:rgba(238,240,251,.3);font-size:11px;font-style:italic;padding:10px}

#snfus-left{display:flex;flex-direction:column;gap:8px;min-height:0;overflow-y:auto}
.snfus-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${rgba(C_IN,.65)};margin-bottom:3px}
.snfus-field{padding:7px 10px;border:1px solid ${rgba(C_IN,.3)};border-radius:9px;font-size:12px;
  background:rgba(255,255,255,.06);color:#f4f5ff;outline:none;font-family:inherit;transition:border-color .14s,box-shadow .14s;width:100%;box-sizing:border-box}
.snfus-field::placeholder{color:rgba(238,240,251,.3)}
.snfus-field:focus{border-color:${rgba(C_IN,.6)};box-shadow:0 0 0 3px ${rgba(C_IN,.14)}}
.snfus-field.detected{border-color:${rgba(C_IN,.5)};background:${rgba(C_IN,.07)}}
#snfus-load-btn{width:100%;padding:8px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;
  background:${rgba(C_IN,.18)};border:1px solid ${rgba(C_IN,.4)};color:${C_IN};font-family:inherit;transition:all .14s}
#snfus-load-btn:hover{background:${rgba(C_IN,.28)};box-shadow:0 0 12px ${rgba(C_IN,.35)}}
#snfus-load-btn:disabled{opacity:.45;cursor:default}

/* boutons workspace */
#snfus-ws-box{display:flex;flex-direction:column;gap:3px;flex-shrink:0}
.snfus-ws-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px}
.snfus-wbtn{padding:6px 8px;border-radius:7px;font-size:10.5px;font-weight:500;cursor:pointer;
  text-align:center;border:1px solid;transition:all .13s;font-family:inherit}
.snfus-wbtn:disabled{opacity:.28;cursor:default}
.snfus-wbtn.ws{background:${rgba(C_PRJ,.1)};border-color:${rgba(C_PRJ,.35)};color:${C_PRJ}}
.snfus-wbtn.ws:hover:not(:disabled){background:${rgba(C_PRJ,.22)};box-shadow:0 0 10px ${rgba(C_PRJ,.3)}}
.snfus-wbtn.ws.hdr{background:${rgba(C_PRJ,.18)};font-weight:700;text-transform:uppercase;font-size:9.5px;letter-spacing:.6px;grid-column:1/-1}

/* boutons liens classique */
#snfus-links-box{display:flex;flex-direction:column;gap:3px;flex-shrink:0}
.snfus-lbtn{padding:6px 10px;border-radius:8px;font-size:11px;font-weight:500;cursor:pointer;
  text-align:left;border:1px solid;transition:all .13s;font-family:inherit;width:100%}
.snfus-lbtn:disabled{opacity:.28;cursor:default}
.snfus-lbtn.cl{background:${rgba(C_CL,.1)};border-color:${rgba(C_CL,.3)};color:${C_CL}}
.snfus-lbtn.cl:hover:not(:disabled){background:${rgba(C_CL,.2)};box-shadow:0 0 10px ${rgba(C_CL,.28)}}
.snfus-lbtn.cl.hdr{background:${rgba(C_CL,.16)};font-weight:700;text-transform:uppercase;font-size:9.5px;letter-spacing:.6px;text-align:center}

/* ===== COL GAUCHE : inputs + liens ===== */
#snfus-tree-table{width:100%;border-collapse:collapse;table-layout:fixed}
#snfus-tree-table colgroup col.col-num{width:130px}
#snfus-tree-table colgroup col.col-name{width:auto}
#snfus-tree-table colgroup col.col-cnt{width:40px}
#snfus-tree-table thead th{position:sticky;top:0;z-index:1;background:rgba(20,22,40,.97);padding:6px 8px;
  text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;
  color:rgba(238,240,251,.45);border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap;overflow:hidden}
#snfus-tree-table thead th.cnt-col{text-align:center}
#snfus-tree-table tbody tr{cursor:pointer;transition:background .1s;border-bottom:1px solid rgba(255,255,255,.04)}
#snfus-tree-table tbody tr:hover{background:rgba(255,255,255,.05)}
#snfus-tree-table tbody tr.sel{background:rgba(255,210,58,.07)}
#snfus-tree-table tbody tr.sel td{color:#fff}
#snfus-tree-table td{padding:5px 8px;vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
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
.snfus-cnt.empty{color:rgba(238,240,251,.2);background:none;border:none;font-weight:400}
.snfus-node-dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px;flex-shrink:0;vertical-align:middle}

/* ===== COL DROITE : info + listes ===== */
#snfus-right{display:flex;flex-direction:column;gap:10px;min-height:0;overflow-y:auto}

/* bloc info record */
#snfus-info{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;flex-shrink:0}
#snfus-info-title{font-size:12.5px;font-weight:600;color:${C_SEL};margin-bottom:10px}
#snfus-info-title span{font-size:10.5px;color:rgba(238,240,251,.45);font-weight:400;margin-left:8px}
.snfus-info-section{margin-bottom:10px}
.snfus-info-section-title{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
  color:rgba(238,240,251,.4);margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.06)}
.snfus-info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 10px}
.snfus-info-grid.cost{grid-template-columns:repeat(3,1fr)}
/* en-têtes des colonnes Approved | Planned | Actual */
.snfus-info-col-hdrs{display:grid;grid-template-columns:repeat(3,1fr);gap:0 10px;margin-bottom:4px}
.snfus-info-col-hdr{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;
  color:rgba(238,240,251,.3);text-align:center;padding:0 4px}
.snfus-ifield-empty{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.03);
  border-radius:6px;padding:4px 8px;min-height:28px}
.snfus-ifield{display:flex;flex-direction:column;gap:2px}
.snfus-ifield-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:rgba(238,240,251,.4)}
.snfus-ifield-val{font-size:11.5px;color:#eef0fb;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);border-radius:6px;padding:4px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.snfus-ifield-val.empty{color:rgba(238,240,251,.25);font-style:italic}
.snfus-ifield-val.overdue{background:${rgba(C_CL,.14)};border-color:${rgba(C_CL,.35)};color:#ff9aa3}
#snfus-info-empty{color:rgba(238,240,251,.3);font-size:11px;font-style:italic;padding:8px 0}

/* mini-listes connexes */
.snfus-minilist{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;flex-shrink:0}
.snfus-minilist-hdr{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.06)}
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
.snfus-ml-table td.row-open{cursor:pointer}
.snfus-ml-empty{padding:10px 12px;font-size:11px;color:rgba(238,240,251,.3);font-style:italic}
.snfus-ml-loading{padding:8px 12px;font-size:11px;color:${rgba(C_IN,.6)};font-style:italic}
`;
document.head.appendChild(styleEl);

/* ============================================================
   STATE
   ============================================================ */
let projId=null, selNode=null;
const _cnt={}, _info={}, _lists={};

/* ============================================================
   HELPERS
   ============================================================ */
function apiH(){
  const tk=(window.top&&window.top.g_ck)||window.g_ck||"";
  const h={Accept:"application/json"};
  if(tk) h["X-UserToken"]=tk;
  return h;
}
async function apiFetch(u){ return fetch(u,{headers:apiH()}); }

function fmtVal(raw){
  if(raw===null||raw===undefined||raw==="") return "";
  // Avec sysparm_display_value=all, les champs sont { value, display_value }
  if(typeof raw==="object"){
    const dv=raw.display_value;
    if(dv!==null&&dv!==undefined&&dv!=="") return fmtDate(String(dv));
    const v=raw.value;
    return (v!==null&&v!==undefined&&v!=="")?fmtDate(String(v)):"";
  }
  return fmtDate(String(raw));
}

/* Reformate une date/datetime en JJ-MM-AAAA HH:mm:ss si le format est reconnu
   Entrées acceptées : AAAA-MM-JJ, AAAA-MM-JJ HH:mm:ss, MM-JJ-AAAA, etc. */
function fmtDate(s){
  if(!s) return s;
  // Tenter de détecter et reformater un datetime ISO (AAAA-MM-JJ...)
  const isoFull=/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if(isoFull){
    const[,Y,M,D,h,m,sec]=isoFull;
    if(h!==undefined) return `${D}-${M}-${Y} ${h}:${m}:${sec||"00"}`;
    return `${D}-${M}-${Y}`;
  }
  // Format MM-JJ-AAAA (américain) → JJ-MM-AAAA
  const us=/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if(us){
    const[,M,D,Y,h,m,sec]=us;
    if(h!==undefined) return `${D}-${M}-${Y} ${h}:${m}:${sec||"00"}`;
    return `${D}-${M}-${Y}`;
  }
  return s; // retourner tel quel si format inconnu
}

/* ============================================================
   HTML SKELETON
   ============================================================ */
const overlay=document.createElement("div");
overlay.id=OVERLAY_ID;
overlay.onclick=e=>{if(e.target===overlay)close();};

function wsBtnHtml(){
  let html=`<button class="snfus-wbtn ws hdr" disabled onclick="snfusOpenWs('Project Workspace')">Project Workspace</button>`;
  html+=`<div class="snfus-ws-grid">`;
  WS_BUTTONS.filter(b=>!b.wide).forEach(b=>{
    html+=`<button class="snfus-wbtn ws" disabled onclick="snfusOpenWs('${b.t.replace(/'/g,"\\'")}')"> ${b.t}</button>`;
  });
  html+=`</div>`;
  return html;
}

function lbtnHtml(b){
  const cls="snfus-lbtn cl"+(b.wide?" hdr":"");
  return `<button class="${cls}" disabled onclick="snfusOpenLink('${b.t.replace(/'/g,"\\'")}')"> ${b.t}</button>`;
}

overlay.innerHTML=`
<div id="snfus-win">
  <!-- TOP BAR -->
  <div id="snfus-topbar">
    <h2>🗂️ Project Navigator</h2>
    <span id="snfus-autodetect"></span>
    <span id="snfus-status"></span>
    <button id="snfus-close" onclick="snfusClose()">&#215;</button>
  </div>

  <div id="snfus-body">
    <!-- ===== COL GAUCHE : inputs + liens ===== -->
    <div id="snfus-left">
      <div>
        <div class="snfus-label">Numéro</div>
        <input class="snfus-field" id="snfus-number" placeholder="PRJ0001234"
          oninput="snfusOnInput('number')" onkeydown="if(event.key==='Enter')snfusLoad()">
      </div>
      <div>
        <div class="snfus-label">sys_id</div>
        <input class="snfus-field" id="snfus-sysid" placeholder="f041cb6a..."
          oninput="snfusOnInput('sysid')" onkeydown="if(event.key==='Enter')snfusLoad()">
      </div>
      <button id="snfus-load-btn" onclick="snfusLoad()">Charger la hiérarchie</button>

      <div class="snfus-label" style="margin-top:4px">Workspace</div>
      <div id="snfus-ws-box">${wsBtnHtml()}</div>

      <div class="snfus-label" style="margin-top:4px">Classique UI</div>
      <div id="snfus-links-box">
        ${CL_BUTTONS.map(lbtnHtml).join("")}
      </div>
    </div>

    <!-- ===== COL CENTRE : hiérarchie ===== -->
    <div id="snfus-mid">
      <div class="snfus-col-label">
        Hiérarchie du projet
        <div id="snfus-tree-toggle">
          <button class="snfus-ttbtn" onclick="snfusTreeSize('narrow')" title="Vue compacte (N° + badges)">⊟</button>
          <button class="snfus-ttbtn active" onclick="snfusTreeSize('normal')" title="Vue normale">⊡</button>
          <button class="snfus-ttbtn" onclick="snfusTreeSize('full')" title="Vue plein écran">⊞</button>
        </div>
      </div>
      <div id="snfus-tree-box">
        <div class="snfus-tree-hint" id="snfus-tree-hint">Entrez un numéro ou sys_id.</div>
        <table id="snfus-tree-table" style="display:none">
          <colgroup>
            <col class="col-num">
            <col class="col-name">
            <col class="col-cnt">
            <col class="col-cnt">
            <col class="col-cnt">
          </colgroup>
          <thead>
            <tr>
              <th>Numéro</th>
              <th class="col-name-hide">Nom</th>
              <th class="cnt-col" style="color:${C_RA}" title="Resource Assignments">RA</th>
              <th class="cnt-col" style="color:${C_TC}" title="Time Cards">TC</th>
              <th class="cnt-col" style="color:${C_CP}" title="Cost Plans">CP</th>
            </tr>
          </thead>
          <tbody id="snfus-tree"></tbody>
        </table>
      </div>
    </div>

    <!-- ===== COL DROITE : info record + listes ===== -->
    <div id="snfus-right">
      <!-- INFO RECORD -->
      <div id="snfus-info">
        <div id="snfus-info-title">Sélectionnez un nœud</div>
        <div id="snfus-info-content"><div id="snfus-info-empty">—</div></div>
      </div>

      <!-- MINI-LISTES -->
      ${CONN_LISTS.map(cl=>`
      <div class="snfus-minilist" id="snfus-ml-${cl.id}">
        <div class="snfus-minilist-hdr">
          <span class="snfus-minilist-title" style="color:${cl.color}">${cl.label}</span>
          <div class="snfus-minilist-meta">
            <span class="snfus-minilist-count" id="snfus-ml-${cl.id}-count">—</span>
            <button class="snfus-minilist-open" disabled
              style="color:${cl.color};border-color:${rgba(cl.color,.4)}"
              onclick="snfusOpenList('${cl.id}')">↗ Liste complète</button>
          </div>
        </div>
        <div class="snfus-minilist-body" id="snfus-ml-${cl.id}-body">
          <div class="snfus-ml-empty">Sélectionnez un nœud.</div>
        </div>
      </div>`).join("")}
    </div>
  </div>
</div>`;

document.body.appendChild(overlay);

/* ============================================================
   CLOSE / KEYBOARD
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
   LIENS
   ============================================================ */
function allWsBtns(){return document.querySelectorAll("#snfus-ws-box .snfus-wbtn");}
function allLinkBtns(){return document.querySelectorAll("#snfus-links-box .snfus-lbtn:not(.hdr)");}

window.snfusOpenLink=(label)=>{
  if(!selNode) return;
  const b=CL_BUTTONS.find(x=>x.t===label); if(!b) return;
  const fn=selNode.depth===0?b.urlP:b.urlT;
  window.open(location.origin+fn(selNode.sys_id),"_blank");
};

window.snfusOpenWs=(label)=>{
  const pid=projId||(selNode&&selNode.sys_id); if(!pid) return;
  const b=WS_BUTTONS.find(x=>x.t===label); if(!b) return;
  const ts=Date.now();
  window.open(location.origin+b.url(pid,ts),"_blank");
};

window.snfusOpenList=(listId)=>{
  if(!selNode) return;
  const cl=CONN_LISTS.find(x=>x.id===listId); if(!cl) return;
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
  CONN_LISTS.forEach(cl=>{
    const btn=document.querySelector(`#snfus-ml-${cl.id} .snfus-minilist-open`);
    if(btn) btn.disabled=false;
  });
  loadInfo(node);
  CONN_LISTS.forEach(cl=>loadMiniList(cl,node));
}

function deselectAll(){
  selNode=null;
  document.querySelectorAll("#snfus-tree tr").forEach(e=>e.classList.remove("sel"));
  allWsBtns().forEach(b=>b.disabled=true);
  allLinkBtns().forEach(b=>b.disabled=true);
  CONN_LISTS.forEach(cl=>{
    const btn=document.querySelector(`#snfus-ml-${cl.id} .snfus-minilist-open`);
    if(btn) btn.disabled=true;
    document.getElementById(`snfus-ml-${cl.id}-body`).innerHTML=`<div class="snfus-ml-empty">Sélectionnez un nœud.</div>`;
    document.getElementById(`snfus-ml-${cl.id}-count`).textContent="—";
  });
  document.getElementById("snfus-info-title").textContent="Sélectionnez un nœud";
  document.getElementById("snfus-info-content").innerHTML=`<div id="snfus-info-empty">—</div>`;
}

window.snfusSelectNode=(sysId)=>{
  const n=window._snfusNodes&&window._snfusNodes[sysId];
  if(n) selectNode(n);
};

/* ============================================================
   INFO RECORD (dates + coûts)
   ============================================================ */
async function loadInfo(node){
  if(_info[node.sys_id]){renderInfo(node,_info[node.sys_id]);return;}
  document.getElementById("snfus-info-title").textContent=`${node.number} — ${node.name}`;
  document.getElementById("snfus-info-content").innerHTML=`<div class="snfus-ml-loading">Chargement…</div>`;
  const isP=node.depth===0;
  const tbl=isP?"pm_project":"pm_project_task";
  const costFlds=isP?COST_FIELDS_PRJ:COST_FIELDS_TSK;
  const allFlds=[...DATE_FIELDS,...costFlds].filter(f=>f!==null).map(f=>f.f).join(",");
  try{
    const res=await apiFetch(`/api/now/table/${tbl}?sysparm_query=sys_id=${node.sys_id}&sysparm_fields=${allFlds}&sysparm_limit=1&sysparm_display_value=all`);
    const data=await res.json();
    const rec=data.result&&data.result[0]?data.result[0]:{};
    _info[node.sys_id]={rec,isP,costFlds};
    renderInfo(node,_info[node.sys_id]);
  }catch(e){
    document.getElementById("snfus-info-content").innerHTML=`<div class="snfus-ml-empty">Erreur de chargement.</div>`;
  }
}

function renderInfo(node,{rec,isP,costFlds}){
  document.getElementById("snfus-info-title").innerHTML=
    `${node.number} <span>— ${node.name}</span>`;
  const now=new Date();

  function fieldHtml(f){
    if(f===null) return `<div class="snfus-ifield"><div class="snfus-ifield-empty"></div></div>`;
    const raw=rec[f.f]; const val=fmtVal(raw);
    let cls=val?"":"empty";
    if(val&&(f.f==="end_date"||f.f==="approved_end_date")){
      // Comparer depuis la valeur brute (format ISO) pour la détection d'overdue
      const rawStr=raw&&typeof raw==="object"?(raw.value||raw.display_value||""):String(raw||"");
      const d=new Date(rawStr); if(!isNaN(d)&&d<now) cls="overdue";
    }
    return `<div class="snfus-ifield">
      <span class="snfus-ifield-lbl">${f.label}</span>
      <div class="snfus-ifield-val ${cls}">${val||"—"}</div>
    </div>`;
  }

  // DATE_FIELDS contient des null pour les cellules vides
  const dateHtml=DATE_FIELDS.map(fieldHtml).join("");
  const costHtml=costFlds.map(fieldHtml).join("");

  document.getElementById("snfus-info-content").innerHTML=`
    <div class="snfus-info-section">
      <div class="snfus-info-section-title">Dates</div>
      <div class="snfus-info-col-hdrs">
        <div class="snfus-info-col-hdr">Approved</div>
        <div class="snfus-info-col-hdr">Planned</div>
        <div class="snfus-info-col-hdr">Actual</div>
      </div>
      <div class="snfus-info-grid">${dateHtml}</div>
    </div>
    <div class="snfus-info-section">
      <div class="snfus-info-section-title">Coûts</div>
      <div class="snfus-info-grid cost">${costHtml}</div>
    </div>`;
}

/* ============================================================
   MINI-LISTES
   ============================================================ */
async function loadMiniList(cl,node){
  const bodyEl=document.getElementById(`snfus-ml-${cl.id}-body`);
  const cntEl =document.getElementById(`snfus-ml-${cl.id}-count`);
  if(_lists[cl.id]&&_lists[cl.id][node.sys_id]){
    renderMiniList(cl,_lists[cl.id][node.sys_id],bodyEl,cntEl); return;
  }
  bodyEl.innerHTML=`<div class="snfus-ml-loading">Chargement…</div>`;
  cntEl.textContent="…";
  const isP=node.depth===0;
  const q=(isP?cl.qP:cl.qT)(node.sys_id);
  const fields=cl.cols.map(c=>c.f).join(",")+",sys_id";
  try{
    const res=await apiFetch(`/api/now/table/${cl.table}?sysparm_query=${q}&sysparm_fields=${fields}&sysparm_limit=10&sysparm_display_value=all`);
    const data=await res.json();
    const rows=data.result||[];
    const total=res.headers.get("X-Total-Count");
    if(!_lists[cl.id]) _lists[cl.id]={};
    _lists[cl.id][node.sys_id]={rows,total};
    renderMiniList(cl,{rows,total},bodyEl,cntEl);
  }catch(e){
    bodyEl.innerHTML=`<div class="snfus-ml-empty">Erreur de chargement.</div>`;
    cntEl.textContent="err";
  }
}

function renderMiniList(cl,{rows,total},bodyEl,cntEl){
  const shown=rows.length;
  const tot=total?parseInt(total):shown;
  cntEl.textContent=tot>shown?`${shown} / ${tot} (limité à 10)`:
                    tot===1?"1 enregistrement":`${tot} enregistrements`;
  if(!rows.length){bodyEl.innerHTML=`<div class="snfus-ml-empty">Aucun enregistrement.</div>`;return;}
  const thCells=cl.cols.map(c=>`<th>${c.label}</th>`).join("");
  const tdRows=rows.map(row=>{
    // sys_id peut être {value,display_value} avec sysparm_display_value=all
    const rawId=row.sys_id;
    const sysId=typeof rawId==="object"?(rawId.value||rawId.display_value||""):rawId;
    const cells=cl.cols.map(c=>{
      const raw=row[c.f];
      if(!raw&&raw!==0) return `<td class="empty">(empty)</td>`;
      // Avec display_value=all, les refs ont un champ link ; les champs simples ont display_value
      if(typeof raw==="object"){
        const label=raw.display_value||raw.value||"";
        if(!label) return `<td class="empty">(empty)</td>`;
        // Si lien de référence disponible → cellule cliquable vers l'enregistrement lié
        if(raw.link){
          const refUrl=`${location.origin}/now/nav/ui/classic/params/target/${raw.link.split("/api/now/table/")[1]||""}`;
          return `<td class="ref-link" onclick="event.stopPropagation();window.open('${refUrl}','_blank')">${label}</td>`;
        }
        return `<td>${label}</td>`;
      }
      const val=fmtVal(raw);
      return `<td class="${val?"":"empty"}">${val||"(empty)"}</td>`;
    }).join("");
    const rowUrl=sysId?`${location.origin}/now/nav/ui/classic/params/target/${cl.table}.do?sys_id=${sysId}`:"#";
    return `<tr class="row-open" onclick="window.open('${rowUrl}','_blank')">${cells}</tr>`;
  }).join("");
  bodyEl.innerHTML=`<table class="snfus-ml-table"><thead><tr>${thCells}</tr></thead><tbody>${tdRows}</tbody></table>`;
}

/* ============================================================
   COMPTEURS AU SURVOL
   ============================================================ */
window.snfusHover=async(sysId)=>{
  if(_cnt[sysId]!==undefined) return;
  _cnt[sysId]="loading";
  // Afficher "…" dans les 3 cellules
  ["ra","tc","cp"].forEach(k=>{
    const el=document.getElementById(`snfus-cnt-${k}-${sysId}`);
    if(el) el.innerHTML=`<span class="snfus-cnt ${k}" style="opacity:.5">…</span>`;
  });
  const node=window._snfusNodes&&window._snfusNodes[sysId];
  const isP=node&&node.depth===0;
  const f=isP?"top_task":"task";
  try{
    const [raR,tcR,cpR]=await Promise.all([
      apiFetch(`/api/now/table/sn_plng_att_core_resource_assignment?sysparm_query=${f}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
      apiFetch(`/api/now/table/time_card?sysparm_query=${f}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
      apiFetch(`/api/now/table/cost_plan?sysparm_query=${f}=${sysId}&sysparm_fields=sys_id&sysparm_limit=1&sysparm_count=true`),
    ]);
    const [raD,tcD,cpD]=await Promise.all([raR.json(),tcR.json(),cpR.json()]);
    const ra=parseInt(raR.headers.get("X-Total-Count")||(raD.result?raD.result.length:0));
    const tc=parseInt(tcR.headers.get("X-Total-Count")||(tcD.result?tcD.result.length:0));
    const cp=parseInt(cpR.headers.get("X-Total-Count")||(cpD.result?cpD.result.length:0));
    _cnt[sysId]={ra,tc,cp};
    const fill=(k,v,cls)=>{
      const el=document.getElementById(`snfus-cnt-${k}-${sysId}`);
      if(el) el.innerHTML=v>0?`<span class="snfus-cnt ${cls}">${v}</span>`:`<span class="snfus-cnt empty">—</span>`;
    };
    fill("ra",ra,"ra"); fill("tc",tc,"tc"); fill("cp",cp,"cp");
  }catch(e){
    delete _cnt[sysId];
    ["ra","tc","cp"].forEach(k=>{
      const el=document.getElementById(`snfus-cnt-${k}-${sysId}`);
      if(el) el.innerHTML=`<span class="snfus-cnt empty">—</span>`;
    });
  }
};

/* ============================================================
   ARBRE
   ============================================================ */
function flatTree(all,pid,d){
  return all.filter(t=>t.parent===pid).flatMap(t=>[{...t,depth:d},...flatTree(all,t.sys_id,d+1)]);
}

function renderNode(n){
  const c=dc(n.depth), id=n.sys_id;
  const indent=n.depth*14;
  const dotHtml=`<span class="snfus-node-dot" style="background:${c};box-shadow:0 0 4px ${rgba(c,.6)};margin-left:${indent}px"></span>`;
  return `<tr data-id="${id}" onclick="snfusSelectNode('${id}')" onmouseenter="snfusHover('${id}')">
    <td style="white-space:nowrap">
      ${dotHtml}<span class="snfus-tnode-num" style="color:${c}">${n.number}</span>
      <span class="snfus-sel-badge">✓</span>
    </td>
    <td class="name-cell col-name-hide"><span class="snfus-tnode-name">${n.name}</span></td>
    <td class="cnt-col" id="snfus-cnt-ra-${id}"><span class="snfus-cnt empty">—</span></td>
    <td class="cnt-col" id="snfus-cnt-tc-${id}"><span class="snfus-cnt empty">—</span></td>
    <td class="cnt-col" id="snfus-cnt-cp-${id}"><span class="snfus-cnt empty">—</span></td>
  </tr>`;
}

function renderTree(nodes){
  const tEl=document.getElementById("snfus-tree");
  const hEl=document.getElementById("snfus-tree-hint");
  const tableEl=document.getElementById("snfus-tree-table");
  if(!nodes||!nodes.length){
    hEl.textContent="Aucune tâche trouvée."; hEl.style.display=""; tableEl.style.display="none"; return;
  }
  hEl.style.display="none"; tableEl.style.display="";
  tEl.innerHTML=nodes.map(renderNode).join("");
}

/* ============================================================
   CHARGEMENT
   ============================================================ */
async function loadHierarchy(pid){
  const tEl=document.getElementById("snfus-tree");
  const hEl=document.getElementById("snfus-tree-hint");
  const tableEl=document.getElementById("snfus-tree-table");
  tEl.innerHTML=""; hEl.style.display=""; hEl.textContent="Chargement…";
  tableEl.style.display="none";
  deselectAll();
  [_cnt,_info,...CONN_LISTS.map(x=>_lists[x.id]||{})].forEach(o=>{if(o)Object.keys(o).forEach(k=>delete o[k]);});

  // Récupérer les infos du projet racine ET vérifier s'il a des parents (sous-projets)
  async function fetchProject(id){
    const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=sys_id=${id}&sysparm_fields=number,short_description,parent&sysparm_limit=1`);
    const data=await res.json();
    return data.result&&data.result[0]?data.result[0]:null;
  }

  async function fetchTasks(id){
    const res=await apiFetch(`/api/now/table/pm_project_task?sysparm_query=top_task=${id}&sysparm_fields=sys_id,number,short_description,parent&sysparm_limit=2000`);
    const data=await res.json();
    return (data.result||[]).map(t=>({
      sys_id:t.sys_id, number:t.number, name:t.short_description||"",
      parent:t.parent?(t.parent.value||t.parent):id
    }));
  }

  try{
    const [prjRec, tasks, parentChain] = await Promise.all([
      fetchProject(pid),
      fetchTasks(pid),
      fetchParentChain(pid),  // [] si pas de parents
    ]);

    const pNum  = prjRec?prjRec.number:"PRJ";
    const pName = prjRec?prjRec.short_description||"":"";

    // Construire la liste à plat :
    // parentChain est [proche→lointain], on inverse pour avoir [racine→...→sous-projet cible]
    const ancestors = [...parentChain].reverse();

    const flat=[];
    // Projets ancêtres (nœuds parents — depth 0,1,2... mais visuellement décalés)
    ancestors.forEach((anc,i)=>{
      flat.push({sys_id:anc.sys_id, number:anc.number, name:anc.name, depth:i, isProject:true});
    });
    // Projet courant (racine si pas de parents, sinon enfant des ancêtres)
    const rootDepth = ancestors.length;
    flat.push({sys_id:pid, number:pNum, name:pName, depth:rootDepth, isProject:true});

    // Tâches du projet courant
    function addTasks(parentId, d, all){
      all.filter(t=>t.parent===parentId).forEach(t=>{
        flat.push({...t, depth:d});
        addTasks(t.sys_id, d+1, all);
      });
    }
    addTasks(pid, rootDepth+1, tasks);

    renderTree(flat);
    window._snfusNodes={};
    flat.forEach(n=>{window._snfusNodes[n.sys_id]=n;});
    return;
  }catch(e){}

  // Fallback GlideRecord
  try{
    const GR=(window.top&&window.top.GlideRecord)||window.GlideRecord;
    if(!GR) throw new Error();
    const gP=new GR("pm_project");
    gP.get(pid,()=>{
      const pNum=gP.getValue("number")||"PRJ";
      const pName=gP.getValue("short_description")||"";
      const gT=new GR("pm_project_task");
      gT.addQuery("top_task",pid);
      gT.query(()=>{
        const tasks=[];
        while(gT.next()) tasks.push({sys_id:gT.getUniqueValue(),number:gT.getValue("number"),
          name:gT.getValue("short_description")||"",parent:gT.getValue("parent")||pid, depth:1});
        const flat=[{sys_id:pid,number:pNum,name:pName,depth:0,isProject:true},...tasks];
        renderTree(flat);
        window._snfusNodes={};
        flat.forEach(n=>{window._snfusNodes[n.sys_id]=n;});
      });
    });
  }catch(e){hEl.textContent="Erreur de chargement.";}
}

/* ============================================================
   RÉSOLUTION SUB_TREE_ROOT + CHAÎNE DE PARENTS
   ============================================================ */
async function resolveProj(sysId){
  // Cherche d'abord si c'est une tâche avec sub_tree_root
  try{
    const res=await apiFetch(`/api/now/table/pm_project_task?sysparm_query=sys_id=${sysId}&sysparm_fields=sub_tree_root&sysparm_limit=1`);
    const data=await res.json();
    if(data.result&&data.result[0]){
      const v=data.result[0].sub_tree_root;
      const id=v?(v.value||v):null;
      if(id&&/^[0-9a-f]{32}$/i.test(id)) return id;
    }
  }catch(e){}
  return null;
}

// Récupère la chaîne complète des projets parents d'un sous-projet
// en interrogeant pm_project sur le champ parent jusqu'à remonter à la racine
async function fetchParentChain(pid){
  const chain=[]; // [{sys_id,number,name}] du plus proche au plus lointain
  let current=pid;
  let safety=0;
  while(current && safety++<10){
    try{
      const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=sys_id=${current}&sysparm_fields=number,short_description,parent&sysparm_limit=1`);
      const data=await res.json();
      const rec=data.result&&data.result[0];
      if(!rec) break;
      const parentRef=rec.parent;
      const parentId=parentRef?(parentRef.value||null):null;
      if(parentId&&/^[0-9a-f]{32}$/i.test(parentId)){
        // ce projet a un parent → l'ajouter à la chaîne et continuer
        chain.push({sys_id:current, number:rec.number, name:rec.short_description||""});
        current=parentId;
      } else {
        break; // pas de parent → on est au projet racine, on ne l'ajoute pas ici
      }
    }catch(e){break;}
  }
  return chain; // sous-projets dans l'ordre proche→lointain (excluant la racine)
}

/* ============================================================
   HANDLERS PRINCIPAUX
   ============================================================ */
window.snfusClose=close;

/* Toggle taille de la hiérarchie : narrow | normal | full */
window.snfusTreeSize=(size)=>{
  const body=document.getElementById("snfus-body");
  body.className=`tree-${size}`;
  document.querySelectorAll(".snfus-ttbtn").forEach((b,i)=>{
    b.classList.toggle("active",["narrow","normal","full"][i]===size);
  });
};

window.snfusOnInput=(src)=>{
  if(src==="number"&&document.getElementById("snfus-number").value.trim())
    document.getElementById("snfus-sysid").value="";
  if(src==="sysid"&&document.getElementById("snfus-sysid").value.trim())
    document.getElementById("snfus-number").value="";
};

window.snfusLoad=async()=>{
  const num=document.getElementById("snfus-number").value.trim();
  const sid=document.getElementById("snfus-sysid").value.trim();
  const btn=document.getElementById("snfus-load-btn");
  const hexRe=/^[0-9a-f]{32}$/i;
  if(!num&&!sid){setSt("Remplis un champ","err");return;}

  if(sid&&hexRe.test(sid)){
    btn.disabled=true; setSt("Chargement…","");
    const pid=await resolveProj(sid);
    const id=pid||sid;
    if(pid){document.getElementById("snfus-sysid").value=pid; setSt("↑ Projet via sub_tree_root","ok");}
    projId=id; await loadHierarchy(id); setSt("✓ Chargé","ok"); btn.disabled=false; return;
  }
  if(sid&&!hexRe.test(sid)){setSt("Format invalide","err");return;}

  if(num){
    btn.disabled=true; setSt("Résolution…","");
    try{
      const res=await apiFetch(`/api/now/table/pm_project?sysparm_query=number=${encodeURIComponent(num)}&sysparm_fields=sys_id&sysparm_limit=1`);
      if(res.ok){
        const data=await res.json();
        if(data.result&&data.result.length){
          const id=data.result[0].sys_id;
          document.getElementById("snfus-sysid").value=id;
          projId=id; await loadHierarchy(id); setSt("✓ Chargé","ok"); btn.disabled=false; return;
        }
      }
    }catch(e){}
    try{
      const GR=(window.top&&window.top.GlideRecord)||window.GlideRecord;
      if(GR){
        const gr=new GR("pm_project");
        gr.addQuery("number",num.toUpperCase()); gr.setLimit(1);
        gr.query(async()=>{
          if(gr.next()){
            const id=gr.getUniqueValue();
            document.getElementById("snfus-sysid").value=id;
            projId=id; await loadHierarchy(id); setSt("✓ Chargé","ok");
          }else setSt("Introuvable","err");
          btn.disabled=false;
        }); return;
      }
    }catch(e){}
    setSt("Erreur","err"); btn.disabled=false;
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
  if(m) return m[1];
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
    f.value=autoId; f.classList.add("detected"); setSt("Résolution…","");
    const pid=await resolveProj(autoId);
    const id=pid||autoId;
    if(pid){f.value=pid; document.getElementById("snfus-autodetect").textContent="⚡ Projet via tâche (sub_tree_root)";}
    else document.getElementById("snfus-autodetect").textContent="⚡ sys_id détecté";
    projId=id; await loadHierarchy(id); setSt("✓ Chargé","ok");
  }else{
    setTimeout(()=>document.getElementById("snfus-number").focus(),100);
  }
})();

})();void(0);
