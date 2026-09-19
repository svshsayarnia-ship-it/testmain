(function(){
"use strict";

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function init(K){
 if(!K||K.version!==2){console.error("[Kernel Bridge] Management Kernel v2 unavailable");return}
 function toast(a,b){var box=document.getElementById("toasts");if(!box)return;var x=document.createElement("div");x.className="toast";x.innerHTML="<b>"+esc(a)+"</b>"+(b?"<small>"+esc(b)+"</small>":"");box.appendChild(x);setTimeout(function(){x.remove()},3300)}
 function closeModal(){var m=document.getElementById("modal");if(m)m.innerHTML=""}
 function val(id){var x=document.getElementById(id);return x?x.value:""}
 function allEntities(){var s=K.getStore();return Object.keys((s.master&&s.master.entities)||{}).map(function(k){return s.master.entities[k]}).filter(function(e){try{return K.can("read","entity",e)}catch(_){return true}})}
 function records(kind){try{return K.queryBusinessRecords(kind)}catch(_){return []}}
 function latest(list){return list.slice().sort(function(a,b){return (+b.updatedAt||+b.createdAt||0)-(+a.updatedAt||+a.createdAt||0)})[0]||null}
 function recordEntityId(r){
  if(!r)return null;
  return r.entityId||r.itemId||r.assetId||r.batchId||r.orderId||r.poId||r.positionId||r.id||null;
 }
 var moduleKinds={
  production:"productionShift",inventory:"inventoryStock",procurement:"procurementOrder",maintenance:"maintenanceWO",
  quality:"qualityBatch",finance:"financeCash",wheat:"wheatStock",sales:"salesOrder",security:"securityAccess",
  projects:"projectMilestone",hse:"hseIncident",hr:"hrPerformance"
 };
 function resolveEntity(key,eventType){
  var es=allEntities(),pick=null;
  if(key==="inventory"){
   pick=es.filter(function(e){return e.type==="item"}).sort(function(a,b){return (+a.coverageDays||0)-(+b.coverageDays||0)||(+a.stock||0)-(+b.stock||0)})[0];
  }else if(key==="maintenance"){
   pick=es.filter(function(e){return e.type==="asset"}).sort(function(a,b){return (b.critical===true)-(a.critical===true)})[0];
  }else if(key==="quality"){
   pick=es.find(function(e){return e.type==="batch"&&e.status==="Hold"})||es.find(function(e){return e.type==="batch"});
  }else if(key==="hr"){
   pick=es.find(function(e){return e.type==="position"&&e.critical})||es.find(function(e){return e.type==="position"});
  }else if(key==="production"){
   pick=latest(es.filter(function(e){return e.type==="production_shift"}));
  }else if(key==="procurement"){
   pick=latest(es.filter(function(e){return e.type==="po"&&e.status!=="Closed"}));
  }
  if(pick)return pick.id;
  var kind=moduleKinds[key],r=kind?latest(records(kind)):null;
  return recordEntityId(r);
 }
 var ruleMap={
  production:[["Production.TargetMissed","S3","I3"],["Production.DowntimeExceeded","S4","I4"],["Production.WasteHigh","S3","I2"]],
  inventory:[["Inventory.Stockout","S4","I4"],["Inventory.LowStock","S3","I3"],["Inventory.CountVariance","S3","I2"]],
  procurement:[["Procurement.ETAExceedsCoverage","S4","I4"],["Procurement.VendorPerformanceLow","S3","I3"],["Purchase.PolicyException","S4","I4"]],
  maintenance:[["Maintenance.AssetFailed","S4","I4"],["Maintenance.PMOverdue","S3","I3"],["Maintenance.RepeatedFailure","S4","I3"]],
  quality:[["Quality.BatchHold","S3","I3"],["Quality.NCRRepeated","S3","I3"],["Quality.SpecFail","S4","I4"]],
  hse:[["HSE.Incident","S5","I5"],["HSE.NearMissRepeated","S3","I3"],["HSE.CorrectiveOverdue","S3","I3"]],
  projects:[["Project.MilestoneDelayed","S3","I3"],["Project.BudgetOverrun","S4","I4"],["Project.BenefitAtRisk","S3","I3"]],
  finance:[["Finance.PaymentDue","S3","I3"],["Finance.CashRisk","S4","I4"],["Budget.Overrun","S4","I4"]],
  hr:[["HR.KeyPositionRisk","S3","I3"]],
  wheat:[["Wheat.AgingHigh","S3","I2"],["Wheat.CoverageLow","S3","I3"],["Wheat.IncomingQCFail","S4","I3"]],
  sales:[["Sales.ShipmentBlocked","S3","I3"],["AR.Overdue","S3","I3"],["Sales.OTDLow","S3","I2"]],
  security:[["Security.UnauthorizedAccess","S4","I3"],["Security.ContractorExpired","S3","I2"],["Security.IncidentMajor","S4","I4"]]
 };
 function inferPayload(type,key){
  var id=resolveEntity(key,type),e=allEntities().find(function(x){return x.id===id});
  if(/Inventory\.(Stockout|LowStock)/.test(type))return {stock:e?+e.stock||0:0,coverageDays:e?+e.coverageDays||0:0,emergencyPurchaseAmount:780000000};
  if(/Maintenance\.AssetFailed/.test(type)){
   var wo=latest(records("maintenanceWO").filter(function(r){return !id||r.assetId===id}));
   return {downtimeMin:wo?+wo.downtimeMin||0:0};
  }
  return {};
 }
 function injectEntityField(key){
  var modal=document.getElementById("modal");if(!modal)return;
  var done=false,observer=new MutationObserver(function(){
   if(done)return;
   var form=modal.querySelector(".form");if(!form||document.getElementById("mk-entity"))return;
   done=true;
   var t=val("od-ev")||key+".Exception",ent=resolveEntity(key,t)||"";
   var box=document.createElement("div");box.className="field";
   var label=document.createElement("label");label.textContent="Related Entity ID";
   var input=document.createElement("input");input.id="mk-entity";input.value=ent;input.placeholder="Entity ID";
   box.appendChild(label);box.appendChild(input);form.insertBefore(box,form.children[1]||null);observer.disconnect();
  });
  observer.observe(modal,{childList:true,subtree:true});
  observer.takeRecords();
  var form=modal.querySelector(".form");if(form){var ev=new MutationEvent();observer.disconnect();injectEntityFieldImmediate(key,form)}
  setTimeout(function(){observer.disconnect()},1500);
 }
 function injectEntityFieldImmediate(key,form){
  if(document.getElementById("mk-entity"))return;
  var t=val("od-ev")||key+".Exception",ent=resolveEntity(key,t)||"";
  var box=document.createElement("div");box.className="field";
  var label=document.createElement("label");label.textContent="Related Entity ID";
  var input=document.createElement("input");input.id="mk-entity";input.value=ent;input.placeholder="Entity ID";
  box.appendChild(label);box.appendChild(input);form.insertBefore(box,form.children[1]||null);
 }
 function addKernelButton(){
  var top=document.querySelector(".topacts");if(!top||document.getElementById("kernelBtn"))return;
  var b=document.createElement("button");b.className="ibtn";b.id="kernelBtn";b.title="هسته مدیریتی";b.textContent="⬡";b.setAttribute("data-mk","open");top.insertBefore(b,top.firstChild);
 }
 function fmtTime(ts){try{return new Date(ts).toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"})}catch(e){return "—"}}
 function status(t){var c=/Critical|Emergency|P0|P1/.test(t)?"critical":/High|P2|Overdue/.test(t)?"high":/Verified|Completed|Decided/.test(t)?"ok":"wait";return '<span class="st '+c+'">'+esc(t)+'</span>'}
 function row(title,desc,badge){return '<div class="att"><span class="dot '+(/Critical|Emergency|P0|P1/.test(badge)?"red":"amber")+'"></span><div style="flex:1"><h4>'+esc(title)+'</h4><p>'+esc(desc)+'</p></div>'+status(badge)+'</div>'}
 function showKernel(){
  var s=K.snapshot(),m=document.getElementById("modal");if(!m)return;
  var cases=K.query("cases").filter(function(x){return x.status!=="Closed"}).slice(-6).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner+" · "+x.module,x.status+" / "+x.priority)}).join("")||'<div class="option"><p>Case فعالی در Scope شما وجود ندارد.</p></div>';
  var decisions=K.query("decisions").filter(function(x){return x.status!=="Decided"}).slice(-5).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner+" · "+x.authority,x.status)}).join("")||'<div class="option"><p>Decision فعالی در Scope شما وجود ندارد.</p></div>';
  var raw=K.getStore(),audit=K.can("view_audit","audit",{})?raw.audit.slice(0,8).map(function(x){return '<div class="tl"><b>'+fmtTime(x.at)+' · '+esc(x.kind)+'</b><p>'+esc(x.message)+'</p></div>').join(""):'<div class="option"><p>Audit Trail برای این نقش قابل مشاهده نیست.</p></div>';
  m.innerHTML='<div class="modalbg"><div class="modal mk-modal"><div class="mh"><b>Management Kernel — وضعیت زنده</b><button class="close" data-mk="close">×</button></div><div class="mb">'+
  '<div class="grid rulegrid">'+[["Event",s.events],["Case",s.cases],["Action",s.actions],["Decision",s.decisions],["Approval",s.approvals],["Notification",s.notifications]].map(function(x){return '<div class="card rcode"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>').join("")+'</div>'+
  '<div class="grid two" style="margin-top:12px"><div class="card panel"><div class="pt">Caseهای مرکزی</div>'+cases+'</div><div class="card panel"><div class="pt">Decisionهای مرکزی</div>'+decisions+'</div></div>'+
  '<div class="card panel" style="margin-top:12px"><div class="pt">Audit Trail</div><div class="timeline">'+audit+'</div></div></div>'+
  '<div class="mf">'+(K.can("configure","kernel",{})?'<button class="btn primary" data-mk="scenario">اجرای سناریوی مرجع</button><button class="btn" data-mk="sla">شبیه‌سازی +۷ ساعت SLA</button><button class="btn" data-mk="reset">Reset Kernel</button>':'<span class="ps">کنترل‌های تست برای این نقش مجاز نیست.</span>')+'</div></div></div>';
 }
 function moduleLiveCard(){
  var root=document.querySelector("#od-root");if(!root)return;
  var key=root.getAttribute("data-key");if(!key||root.querySelector(".mk-live"))return;
  var cs=K.query("cases").filter(function(x){return x.module===key&&x.status!=="Closed"}),as=K.query("actions").filter(function(x){return x.module===key&&!/Completed|Verified|Cancelled/.test(x.status)});
  var card=document.createElement("div");card.className="card panel mk-live";card.style.marginTop="13px";
  card.innerHTML='<div class="ph"><div><div class="pt">⬡ وضعیت زنده از Management Kernel</div><div class="ps">این بخش از State مرکزی Event/Case/Action خوانده می‌شود.</div></div><button class="btn sm" data-mk="open">باز کردن Kernel</button></div>'+
  '<div class="grid two"><div><div class="label">Caseهای مرتبط</div>'+(cs.length?cs.slice(-4).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner,x.status)}).join(""):'<div class="option"><p>Case مرکزی فعالی برای این ماژول نیست.</p></div>')+'</div><div><div class="label">Actionهای مرتبط</div>'+(as.length?as.slice(-4).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner,x.status)}).join(""):'<div class="option"><p>Action مرکزی فعالی برای این ماژول نیست.</p></div>')+'</div></div>';
  root.appendChild(card);
 }
 function dashboardKernel(){
  var c=document.getElementById("content");if(!c||document.getElementById("mk-dashboard")||document.getElementById("kv2-dashboard"))return;
  var h=c.querySelector(".head h2");if(!h||h.textContent.trim()!=="مرکز فرمان مدیرعامل")return;
  var s=K.snapshot(),box=document.createElement("div");box.id="mk-dashboard";box.className="card panel";box.style.marginTop="13px";
  box.innerHTML='<div class="ph"><div><div class="pt">⬡ هسته یکپارچه مدیریت</div><div class="ps">Event → Rule → Correlation → Case → Decision/Action → Notification → SLA → Audit</div></div><button class="btn sm" data-mk="open">جزئیات</button></div><div class="grid rulegrid">'+[["Event فعال",s.events],["Case",s.cases],["Action",s.actions],["Decision",s.decisions],["Approval",s.approvals],["Notification",s.notifications]].map(function(x){return '<div class="card rcode"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>').join("")+'</div>';
  c.appendChild(box);
 }
 function refreshDecor(){setTimeout(function(){addKernelButton();moduleLiveCard();dashboardKernel()},20)}
 document.addEventListener("click",function(ev){
  var od=ev.target.closest("[data-od]"),mk=ev.target.closest("[data-mk]");
  if(mk){
   var a=mk.getAttribute("data-mk");
   if(a==="close")closeModal();
   if(a==="open")showKernel();
   if(a==="scenario"){K.runReferenceScenario();showKernel();toast("سناریوی مرجع اجرا شد","زنجیره انبار → تدارکات → تولید/تعمیرات → Decision ساخته شد")}
   if(a==="sla"){K.tick(7*60*60*1000);showKernel();toast("SLA شبیه‌سازی شد","موارد معوق وارد Escalation شدند")}
   if(a==="reset"){K.reset();showKernel();toast("Kernel Reset شد")}
   return;
  }
  if(!od)return;
  var act=od.getAttribute("data-od"),key=od.getAttribute("data-key");
  if(act==="new-event")injectEntityField(key);
  if(act==="run-rule"){
   var idx=+od.getAttribute("data-idx"),def=(ruleMap[key]||[])[idx];
   if(def){
    var ent=resolveEntity(key,def[0]);
    var r=K.emitEvent({type:def[0],module:key,entityId:ent||null,severity:def[1],impact:def[2],urgency:def[1]==="S4"||def[1]==="S5"?"U5":"U3",context:"Rule ماژول "+key+" از UI اجرا شد.",payload:inferPayload(def[0],key)});
    toast("Rule وارد Kernel شد",r.output||"Processed");refreshDecor();
   }
  }
  if(act==="save-event"){
   var type=val("od-ev")||key+".Exception",ent=val("mk-entity")||resolveEntity(key,type);
   var r2=K.emitEvent({type:type,module:key,entityId:ent||null,severity:val("od-sev"),impact:val("od-imp"),context:val("od-ctx"),payload:inferPayload(type,key)});
   toast("Event در هسته مرکزی پردازش شد",r2.output||"Processed");refreshDecor();
  }
 },true);
 var oldCommit=window.commitDecision;
 if(typeof oldCommit==="function"){
  window.commitDecision=function(id,type){
   var r=oldCommit.apply(this,arguments);
   setTimeout(function(){try{K.resolveDecision(id,type,{source:"Decision Center"});toast("Decision با Kernel همگام شد",id+" → "+type)}catch(e){toast("همگام‌سازی Decision ناموفق",e.message)}refreshDecor()},0);
   return r;
  };
 }
 window.addEventListener("management-kernel:update",refreshDecor);
 var mo=new MutationObserver(refreshDecor),content=document.getElementById("content");if(content)mo.observe(content,{childList:true,subtree:false});
 var style=document.createElement("style");style.textContent=".mk-live{border:1px solid #99f6e4!important;background:linear-gradient(180deg,#f0fdfa,#fff)!important}.mk-modal{max-width:1050px!important}#mk-dashboard{border:1px solid #bae6fd}.topacts #kernelBtn{font-size:15px}.mk-live .att{padding:9px 0}.mk-live .grid.two{align-items:start}";document.head.appendChild(style);
 addKernelButton();refreshDecor();
}
if(window.ManagementKernel&&window.ManagementKernel.version===2)init(window.ManagementKernel);
else window.addEventListener("management-kernel:ready",function(ev){init((ev.detail&&ev.detail.kernel)||window.ManagementKernel)},{once:true});
})();