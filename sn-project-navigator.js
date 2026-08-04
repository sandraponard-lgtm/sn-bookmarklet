javascript:(function(){

/* ============================================================
   SN PROJECT NAVIGATOR — V1.1
   ============================================================ */

const STYLE_ID   = "snpnav-style";
const OVERLAY_ID = "snpnav-overlay";

document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).remove();
document.getElementById(STYLE_ID)   && document.getElementById(STYLE_ID).remove();

/* ---------- CONFIG DES BOUTONS ----------
   Fonctions de construction d'URL par bouton.
   Chaque fn reçoit (id, ts) et retourne un chemin relatif.
------------------------------------------------------------ */
const WS_BUTTONS = [
  {
    t: "Project Workspace", wide: true,
    url: (id, ts) => `/now/workspace/project/home/sub/record/pm_project/${id}/params/page-name/details/time-stamp/${ts}/project-table/pm_project/project-id/${id}/record-status/1`
  },
  {
    t: "Planning",
    url: (id, ts) => `/now/workspace/project/home/sub/planning/pm_project/${id}/${ts}/params/page-name/planning`
  },
  {
    t: "Resources",
    url: (id, ts) => `/now/workspace/project/home/sub/resource_board/project_resource-${id}-pm_project-${ts}/params/timestamp/${ts}`
  },
  {
    t: "Details",
    url: (id, ts) => `/now/workspace/project/home/sub/record/pm_project/${id}/params/page-name/details/time-stamp/${ts}/project-table/pm_project/project-id/${id}/record-status/1`
  },
  {
    t: "Financials",
    url: (id, ts) => `/now/workspace/project/home/sub/pw-financials/pm_project/${id}/${ts}/params/page-name/financials`
  },
  {
    t: "RIDAC",
    url: (id, ts) => `/now/workspace/project/home/sub/ridac-monitor/pm_project/${id}/${ts}/params/page-name/ridac-monitor`
  },
  {
    t: "Analytics",
    url: (id, ts) => `/now/workspace/project/home/sub/analytics/${id}/pm_project/${ts}/params/page-name/analytics`
  },
  {
    t: "Docs",
    url: (id)     => `/now/workspace/project/home/sub/docs/pm_project/${id}/params/page-name/docs`
  },
  {
    t: "Status Reports",
    url: (id, ts) => `/now/workspace/project/home/sub/status-report/pm_project/${id}/${ts}/params/page-name/status-report`
  },
];

const CL_BUTTONS = [
  { t: "Classique UI",        wide: true, url: (id) => `/now/nav/ui/classic/params/target/pm_project.do?sys_id=${id}` },
  { t: "Cost Plan",           url: (id) => `/cost_plan_list.do?sysparm_query=top_task%3D${id}` },
  { t: "Cost Plan Breakdown", url: (id) => `/cost_plan_breakdown_list.do?sysparm_query=cost_plan.top_task%3D${id}` },
  { t: "Time Card",           url: (id) => `/time_card_list.do?sysparm_query=task%3D${id}` },
  { t: "Time Card Dailies",   url: (id) => `/time_card_daily_list.do?sysparm_query=time_card.task%3D${id}` },
  { t: "Expense Lines", wide: true, url: (id) => `/fm_expense_line_list.do?sysparm_query=source_task%3D${id}` },
  { t: "Resource Assignments",url: (id) => `/sn_plng_att_core_resource_assignment_list.do?sysparm_query=top_task%3D${id}` },
  { t: "Resource Plan",       url: (id) => `/resource_plan_list.do?sysparm_query=top_task%3D${id}` },
  { t: "Resource Allocation", url: (id) => `/resource_allocation_list.do?sysparm_query=resource_plan.top_task%3D${id}` },
];

/* ---------- COULEURS ---------- */
const C_WS = "#3aa0ff";
const C_CL = "#ff4d6d";
const C_IN = "#2dd9a3";

function rgba(hex, a){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- DÉTECTION AUTO DU SYS_ID ----------
   Cherche dans : URL courante, attributs DOM ServiceNow, sysparm_sys_id
------------------------------------------------------------ */
function detectSysId(){
  const hexRe = /[0-9a-f]{32}/i;
  const url = decodeURIComponent(location.href);

  // 1. URL workspace project → /pm_project/{sys_id}/ ou /project-id/{sys_id}
  const wsMatch = url.match(/\/pm_project\/([0-9a-f]{32})/i)
                || url.match(/project-id\/([0-9a-f]{32})/i);
  if(wsMatch) return wsMatch[1];

  // 2. URL classique → sys_id= ou sysparm_sys_id=
  const clMatch = url.match(/[?&]sys_id=([0-9a-f]{32})/i)
                || url.match(/[?&]sysparm_sys_id=([0-9a-f]{32})/i);
  if(clMatch) return clMatch[1];

  // 3. DOM ServiceNow : g_form.getUniqueValue() si disponible
  try {
    const gf = window.top && window.top.g_form ? window.top.g_form : window.g_form;
    if(gf && typeof gf.getUniqueValue === "function"){
      const val = gf.getUniqueValue();
      if(val && hexRe.test(val)) return val;
    }
  } catch(e){}

  // 4. Meta tag ou input hidden SN classique
  const inp = document.querySelector('input[name="sys_id"]') ||
              document.querySelector('input[name="sysparm_sys_id"]');
  if(inp && hexRe.test(inp.value)) return inp.value;

  return null;
}

/* ---------- STYLE ---------- */
const styleEl = document.createElement("style");
styleEl.id = STYLE_ID;
styleEl.textContent = `
@keyframes snpnav-fadein{from{opacity:0}to{opacity:1}}
@keyframes snpnav-slideup{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
#snpnav-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:32px 20px;font-family:"Segoe UI",Arial,sans-serif;
  background:radial-gradient(circle at 20% -10%,rgba(80,60,160,.35),transparent 55%),
             radial-gradient(circle at 90% 0%,rgba(20,140,160,.25),transparent 50%),
             rgba(6,8,18,.88);
  backdrop-filter:blur(6px);animation:snpnav-fadein .15s ease-out}
#snpnav-win{position:relative;width:100%;max-width:820px;color:#eef0fb;
  background:linear-gradient(165deg,rgba(36,38,64,.75),rgba(18,19,36,.82));
  border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:24px 26px 28px;
  box-shadow:0 25px 70px -15px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.03) inset;
  animation:snpnav-slideup .18s ease-out}
#snpnav-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
#snpnav-title h2{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px;color:${C_IN};text-shadow:0 0 12px ${rgba(C_IN,.55)};margin:0}
#snpnav-close{cursor:pointer;font-size:20px;color:rgba(238,240,251,.55);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s}
#snpnav-close:hover{background:rgba(255,80,90,.18);color:#ff9aa3;border-color:rgba(255,80,90,.35)}
#snpnav-inputs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.snpnav-input-wrap{display:flex;flex-direction:column;gap:5px}
.snpnav-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:${rgba(C_IN,.7)}}
.snpnav-field{padding:10px 14px;border:1px solid ${rgba(C_IN,.3)};border-radius:10px;font-size:13px;
  background:rgba(255,255,255,.06);color:#f4f5ff;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
.snpnav-field::placeholder{color:rgba(238,240,251,.35)}
.snpnav-field:focus{border-color:${rgba(C_IN,.6)};box-shadow:0 0 0 3px ${rgba(C_IN,.15)}}
.snpnav-field.detected{border-color:${rgba(C_IN,.5)};background:${rgba(C_IN,.07)}}
#snpnav-autodetect{font-size:11px;color:${rgba(C_IN,.65)};margin-bottom:12px;min-height:16px;font-style:italic}
#snpnav-resolve-wrap{display:flex;align-items:center;gap:10px;margin-bottom:22px}
#snpnav-resolve{flex:1;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;
  background:${rgba(C_IN,.18)};border:1px solid ${rgba(C_IN,.4)};color:${C_IN};
  transition:background .15s,box-shadow .15s;font-family:inherit}
#snpnav-resolve:hover{background:${rgba(C_IN,.28)};box-shadow:0 0 14px ${rgba(C_IN,.35)}}
#snpnav-resolve:disabled{opacity:.45;cursor:default}
#snpnav-status{font-size:12px;color:rgba(238,240,251,.55);flex-shrink:0}
#snpnav-status.ok{color:${C_IN}}
#snpnav-status.err{color:#ff6b7a}
.snpnav-sep{height:1px;background:rgba(255,255,255,.08);margin-bottom:20px}
.snpnav-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.snpnav-btn{padding:9px 14px;border-radius:9px;font-size:12.5px;font-weight:500;cursor:pointer;
  text-align:center;border:1px solid;transition:all .15s;font-family:inherit;line-height:1.2}
.snpnav-btn:disabled{opacity:.35;cursor:default}
.snpnav-btn.wide{grid-column:1/-1}
.snpnav-btn.ws{background:${rgba(C_WS,.12)};border-color:${rgba(C_WS,.35)};color:${C_WS}}
.snpnav-btn.ws:hover:not(:disabled){background:${rgba(C_WS,.22)};box-shadow:0 0 12px ${rgba(C_WS,.3)}}
.snpnav-btn.ws.wide{background:${rgba(C_WS,.18)};font-weight:700;text-transform:uppercase;letter-spacing:.7px;font-size:11.5px}
.snpnav-btn.cl{background:${rgba(C_CL,.12)};border-color:${rgba(C_CL,.35)};color:${C_CL}}
.snpnav-btn.cl:hover:not(:disabled){background:${rgba(C_CL,.22)};box-shadow:0 0 12px ${rgba(C_CL,.3)}}
.snpnav-btn.cl.wide{background:${rgba(C_CL,.18)};font-weight:700;text-transform:uppercase;letter-spacing:.7px;font-size:11.5px}
.snpnav-gap{margin-bottom:20px}
`;
document.head.appendChild(styleEl);

/* ---------- STATE ---------- */
let resolvedSysId = null;
let WS_BTN_FNS = WS_BUTTONS;
let CL_BTN_FNS = CL_BUTTONS;

/* ---------- HTML ---------- */
const overlay = document.createElement("div");
overlay.id = OVERLAY_ID;
overlay.onclick = e => { if(e.target === overlay) close(); };

function btnHtml(b, cls){
  const wide = b.wide ? " wide" : "";
  return `<button class="snpnav-btn ${cls}${wide}" disabled data-idx="${cls}_${b.t.replace(/\s/g,'_')}"
    onclick="snpnavOpen('${cls}','${b.t.replace(/'/g,"\\'")}')">
    ${b.t}
  </button>`;
}

overlay.innerHTML = `
<div id="snpnav-win">
  <div id="snpnav-title">
    <h2>🎯 Project Navigator</h2>
    <button id="snpnav-close" onclick="snpnavClose()">&#215;</button>
  </div>

  <div id="snpnav-inputs">
    <div class="snpnav-input-wrap">
      <span class="snpnav-label">Numéro</span>
      <input class="snpnav-field" id="snpnav-number" placeholder="PRJ0001234"
        oninput="snpnavOnInput('number')" onkeydown="if(event.key==='Enter')snpnavResolve()">
    </div>
    <div class="snpnav-input-wrap">
      <span class="snpnav-label">sys_id</span>
      <input class="snpnav-field" id="snpnav-sysid" placeholder="f041cb6a47653610a1499b83..."
        oninput="snpnavOnInput('sysid')" onkeydown="if(event.key==='Enter')snpnavResolve()">
    </div>
  </div>
  <div id="snpnav-autodetect"></div>

  <div id="snpnav-resolve-wrap">
    <button id="snpnav-resolve" onclick="snpnavResolve()">Valider &amp; activer les liens</button>
    <span id="snpnav-status"></span>
  </div>

  <div class="snpnav-sep"></div>

  <div class="snpnav-grid snpnav-gap">
    ${WS_BUTTONS.map(b => btnHtml(b,'ws')).join("")}
  </div>

  <div class="snpnav-sep"></div>

  <div class="snpnav-grid">
    ${CL_BUTTONS.map(b => btnHtml(b,'cl')).join("")}
  </div>
</div>`;

document.body.appendChild(overlay);

/* ---------- HANDLERS ---------- */
function close(){
  document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).remove();
  document.getElementById(STYLE_ID)   && document.getElementById(STYLE_ID).remove();
  document.removeEventListener("keydown", onKeydown);
}
function onKeydown(e){ if(e.key === "Escape") close(); }
document.addEventListener("keydown", onKeydown);

function setStatus(msg, type){
  const el = document.getElementById("snpnav-status");
  el.textContent = msg;
  el.className = type || "";
}

function allBtns(){ return document.querySelectorAll("#snpnav-win .snpnav-btn"); }

function enableButtons(sysId){
  resolvedSysId = sysId;
  allBtns().forEach(b => b.disabled = false);
}

function resetButtons(){
  resolvedSysId = null;
  allBtns().forEach(b => b.disabled = true);
  setStatus("","");
}

window.snpnavClose = close;

window.snpnavOnInput = (src) => {
  if(src === "number" && document.getElementById("snpnav-number").value.trim())
    document.getElementById("snpnav-sysid").value = "";
  if(src === "sysid" && document.getElementById("snpnav-sysid").value.trim())
    document.getElementById("snpnav-number").value = "";
  if(resolvedSysId) resetButtons();
};

window.snpnavOpen = (cls, label) => {
  if(!resolvedSysId) return;
  const ts = Date.now();
  const id = resolvedSysId;
  const list = cls === "ws" ? WS_BUTTONS : CL_BUTTONS;
  const btn  = list.find(b => b.t === label);
  if(!btn) return;
  const path = btn.url(id, ts);
  window.open(location.origin + path, "_blank");
};

window.snpnavResolve = async () => {
  const num   = document.getElementById("snpnav-number").value.trim();
  const sysid = document.getElementById("snpnav-sysid").value.trim();
  const btn   = document.getElementById("snpnav-resolve");
  const hexRe = /^[0-9a-f]{32}$/i;

  if(!num && !sysid){ setStatus("Remplis un champ","err"); return; }

  if(sysid && hexRe.test(sysid)){
    enableButtons(sysid);
    setStatus("✓ sys_id valide","ok");
    return;
  }
  if(sysid && !hexRe.test(sysid)){ setStatus("Format invalide (32 hex)","err"); return; }

  if(num){
    btn.disabled = true;
    setStatus("Résolution…","");
    try {
      // Tentative 1 : API REST (fonctionne si le token CSRF est disponible)
      const res = await fetch(
        `/api/now/table/pm_project?sysparm_query=number=${encodeURIComponent(num)}&sysparm_fields=sys_id,number&sysparm_limit=1`,
        { headers:{ Accept:"application/json", "X-UserToken": window.top && window.top.g_ck ? window.top.g_ck : "" } }
      );
      if(res.ok){
        const data = await res.json();
        if(data.result && data.result.length){
          const id = data.result[0].sys_id;
          document.getElementById("snpnav-sysid").value = id;
          enableButtons(id);
          setStatus("✓ "+id.slice(0,8)+"…","ok");
          btn.disabled = false;
          return;
        } else {
          setStatus("Projet introuvable","err");
          btn.disabled = false;
          return;
        }
      }
    } catch(e){}

    // Tentative 2 : XMLHttpRequest avec token CSRF ServiceNow
    try {
      const token = (window.top && window.top.g_ck) || window.g_ck || "";
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `/api/now/table/pm_project?sysparm_query=number=${encodeURIComponent(num)}&sysparm_fields=sys_id&sysparm_limit=1`);
        xhr.setRequestHeader("Accept","application/json");
        if(token) xhr.setRequestHeader("X-UserToken", token);
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if(data.result && data.result.length){
              const id = data.result[0].sys_id;
              document.getElementById("snpnav-sysid").value = id;
              enableButtons(id);
              setStatus("✓ "+id.slice(0,8)+"…","ok");
            } else {
              setStatus("Projet introuvable","err");
            }
          } catch(e){ reject(e); }
          resolve();
        };
        xhr.onerror = reject;
        xhr.send();
      });
    } catch(e){
      // Tentative 3 : GlideRecord JS côté client (disponible dans les iframes SN)
      try {
        const GR = (window.top && window.top.GlideRecord) || window.GlideRecord;
        if(GR){
          const gr = new GR("pm_project");
          gr.addQuery("number", num.toUpperCase());
          gr.setLimit(1);
          gr.query(() => {
            if(gr.next()){
              const id = gr.getUniqueValue();
              document.getElementById("snpnav-sysid").value = id;
              enableButtons(id);
              setStatus("✓ "+id.slice(0,8)+"…","ok");
            } else {
              setStatus("Projet introuvable","err");
            }
            btn.disabled = false;
          });
          return; // callback asynchrone gère la suite
        } else {
          setStatus("Erreur : API indisponible","err");
        }
      } catch(e2){
        setStatus("Erreur de résolution","err");
      }
    }
    btn.disabled = false;
  }
};

/* ---------- DÉTECTION AUTO ---------- */
function detectSysId(){
  const hexRe = /[0-9a-f]{32}/i;
  const url = decodeURIComponent(location.href);
  const m = url.match(/\/pm_project\/([0-9a-f]{32})/i)
          || url.match(/project-id\/([0-9a-f]{32})/i)
          || url.match(/project_resource-([0-9a-f]{32})-pm_project/i)
          || url.match(/[?&]sys_id=([0-9a-f]{32})/i)
          || url.match(/[?&]sysparm_sys_id=([0-9a-f]{32})/i);
  if(m) return m[1];
  try {
    const gf = (window.top && window.top.g_form) || window.g_form;
    if(gf && typeof gf.getUniqueValue === "function"){
      const v = gf.getUniqueValue();
      if(v && hexRe.test(v)) return v;
    }
  } catch(e){}
  const inp = document.querySelector('input[name="sys_id"],input[name="sysparm_sys_id"]');
  if(inp && hexRe.test(inp.value)) return inp.value;
  return null;
}

const autoId = detectSysId();
if(autoId){
  const field = document.getElementById("snpnav-sysid");
  field.value = autoId;
  field.classList.add("detected");
  document.getElementById("snpnav-autodetect").textContent = "⚡ sys_id détecté depuis la page courante";
  enableButtons(autoId);
  setStatus("✓ Auto-détecté","ok");
} else {
  setTimeout(() => { document.getElementById("snpnav-number").focus(); }, 100);
}

})();void(0);
