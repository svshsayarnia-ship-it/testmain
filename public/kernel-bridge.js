(function(){
"use strict";
var K=window.ManagementKernel;if(!K)return;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function toast(a,b){var box=document.getElementById("toasts");if(!box)return;var x=document.createElement("div");x.className="toast";x.innerHTML="<b>"+esc(a)+"</b>"+(b?"<small>"+esc(b)+"</small>":"");box.appendChild(x);setTimeout(function(){x.remove()},3300)}
function closeModal(){var m=document.getElementById("modal");if(m)m.innerHTML=""}
function val(id){var x=document.getElementById(id);return x?x.value:""}
function moduleEntity(key,eventType){
 if(key==="inventory")return /Stockout|LowStock/i.test(eventType)?"ITEM-6205":null;
 if(key==="maintenance")return "AST-ELV2";
 if(key==="quality")return "B-2405";
 if(key==="hr")return "POS-14";
 if(key==="production")return "PROD-SHIFT-829";
 return null
}
var ruleMap={
 production:[["Production.TargetMissed","PROD-SHIFT-829","S3","I3"],["Production.DowntimeExceeded","AST-ELV2","S4","I4"],["Production.WasteHigh","PROD-SHIFT-829","S3","I2"]],
 inventory:[["Inventory.Stockout","ITEM-6205","S4","I4"],["Inventory.LowStock","ITEM-B90","S3","I3"],["Inventory.CountVariance","ITEM-F11","S3","I2"]],
 procurement:[["Procurement.ETAExceedsCoverage","ITEM-6205","S4","I4"],["Vendor.PerformanceLow","PO-881","S3","I3"],["Purchase.PolicyException","PO-881","S4","I4"]],
 maintenance:[["Maintenance.AssetFailed","AST-ELV2","S4","I4"],["Maintenance.PMOverdue","AST-ELV2","S3","I3"],["Maintenance.RepeatedFailure","AST-ELV2","S4","I3"]],
 quality:[["Quality.BatchHold","B-2405","S3","I3"],["Quality.NCRRepeated","B-2405","S3","I3"],["Quality.SpecFail","B-2405","S4","I4"]],
 hse:[["HSE.Incident","HSE-01","S5","I5"],["HSE.NearMissRepeated","HSE-NM","S3","I3"],["HSE.CorrectiveOverdue","HSE-ACT","S3","I3"]],
 projects:[["Project.MilestoneDelayed","PRJ-11","S3","I3"],["Project.BudgetOverrun","PRJ-11","S4","I4"],["Project.BenefitAtRisk","PRJ-11","S3","I3"]],
 finance:[["Finance.PaymentDue","PAY-440","S3","I3"],["Finance.CashRisk","CASH-30D","S4","I4"],["Budget.Overrun","BUDGET-01","S4","I4"]],
 hr:[["HR.KeyPositionRisk","POS-14","S3","I3"]],
 wheat:[["Wheat.AgingHigh","S-02","S3","I2"],["Wheat.CoverageLow","WHEAT-STOCK","S3","I3"],["Wheat.IncomingQCFail","LOT-W1","S4","I3"]],
 sales:[["Sales.ShipmentBlocked","ORD-91","S3","I3"],["AR.Overdue","REC-112","S3","I3"],["Sales.OTDLow","SALES-OTD","S3","I2"]],
 security:[["Security.UnauthorizedAccess","ACC-X","S4","I3"],["Security.ContractorExpired","CON-31","S3","I2"],["Security.IncidentMajor","SEC-INC","S4","I4"]]
};
function inferPayload(type){
 if(/Inventory\.(Stockout|LowStock)/.test(type))return {stock:0,coverageDays:0,emergencyPurchaseAmount:780000000};
 if(/Maintenance\.AssetFailed/.test(type))return {downtimeMin:32};
 return {}
}
function injectEntityField(key){
 setTimeout(function(){
  var form=document.querySelector("#modal .form");if(!form||document.getElementById("mk-entity"))return;
  var t=val("od-ev")||key+".Exception",ent=moduleEntity(key,t)||"";
  var box=document.createElement("div");box.className="field";box.innerHTML='<label>Related Entity ID</label><input id="mk-entity" value="'+esc(ent)+'" placeholder="مثلاً ITEM-6205">';
  form.insertBefore(box,form.children[1]||null);
 },0)
}
function currentModule(){var r=document.querySelector("#od-root");return r?r.getAttribute("data-key"):null}
function addKernelButton(){
 var top=document.querySelector(".topacts");if(!top||document.getElementById("kernelBtn"))return;
 var b=document.createElement("button");b.className="ibtn";b.id="kernelBtn";b.title="هسته مدیریتی";b.textContent="⬡";b.onclick=showKernel;top.insertBefore(b,top.firstChild)
}
function fmtTime(ts){try{return new Date(ts).toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"})}catch(e){return "—"}}
function status(t){var c=/Critical|Emergency|P0|P1/.test(t)?"critical":/High|P2|Overdue/.test(t)?"high":/Verified|Completed|Decided/.test(t)?"ok":"wait";return '<span class="st '+c+'">'+esc(t)+'</span>'}
function row(title,desc,badge){return '<div class="att"><span class="dot '+(/Critical|Emergency|P0|P1/.test(badge)?"red":"amber")+'"></span><div style="flex:1"><h4>'+esc(title)+'</h4><p>'+esc(desc)+'</p></div>'+status(badge)+'</div>'}
function showKernel(){
 var s=K.snapshot(),d=K.getStore(),m=document.getElementById("modal");if(!m)return;
 var cases=d.cases.filter(function(x){return x.status!=="Closed"}).slice(-6).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner+" · "+x.module,x.status+" / "+x.priority)}).join("")||'<div class="option"><p>Case فعالی وجود ندارد.</p></div>';
 var decisions=d.decisions.filter(function(x){return x.status!=="Decided"}).slice(-5).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner+" · "+x.authority,x.status)}).join("")||'<div class="option"><p>Decision فعالی وجود ندارد.</p></div>';
 var audit=d.audit.slice(0,8).map(function(x){return '<div class="tl"><b>'+fmtTime(x.at)+' · '+esc(x.kind)+'</b><p>'+esc(x.message)+'</p></div>'}).join("");
 m.innerHTML='<div class="modalbg"><div class="modal mk-modal"><div class="mh"><b>Management Kernel — وضعیت زنده</b><button class="close" data-mk="close">×</button></div><div class="mb">'+
 '<div class="grid rulegrid">'+[["Event",s.activeEvents],["Case",s.cases],["Action",s.actions],["Decision",s.decisions],["Notification",s.notifications],["Links",s.links]].map(function(x){return '<div class="card rcode"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>'}).join("")+'</div>'+
 '<div class="grid two" style="margin-top:12px"><div class="card panel"><div class="pt">Caseهای مرکزی</div>'+cases+'</div><div class="card panel"><div class="pt">Decisionهای مرکزی</div>'+decisions+'</div></div>'+
 '<div class="card panel" style="margin-top:12px"><div class="pt">Audit Trail</div><div class="timeline">'+audit+'</div></div></div>'+
 '<div class="mf">'+(K.can("configure","kernel",{})?'<button class="btn primary" data-mk="scenario">اجرای سناریوی مرجع</button><button class="btn" data-mk="sla">شبیه‌سازی +۷ ساعت SLA</button><button class="btn" data-mk="reset">Reset Kernel</button>':'<span class="ps">کنترل‌های تست برای این نقش مجاز نیست.</span>')+'</div></div></div>'
}
function moduleLiveCard(){
 var root=document.querySelector("#od-root");if(!root)return;
 var key=root.getAttribute("data-key");if(!key||root.querySelector(".mk-live"))return;
 var cs=K.query("cases").filter(function(x){return x.module===key&&x.status!=="Closed"}),as=K.query("actions").filter(function(x){return x.module===key&&!/Completed|Verified|Cancelled/.test(x.status)});
 var card=document.createElement("div");card.className="card panel mk-live";card.style.marginTop="13px";
 card.innerHTML='<div class="ph"><div><div class="pt">⬡ وضعیت زنده از Management Kernel</div><div class="ps">این بخش از State مرکزی Event/Case/Action خوانده می‌شود، نه از Mock مستقل ماژول.</div></div><button class="btn sm" data-mk="open">باز کردن Kernel</button></div>'+
 '<div class="grid two"><div><div class="label">Caseهای مرتبط</div>'+(cs.length?cs.slice(-4).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner,x.status)}).join(""):'<div class="option"><p>Case مرکزی فعالی برای این ماژول نیست.</p></div>')+'</div><div><div class="label">Actionهای مرتبط</div>'+(as.length?as.slice(-4).reverse().map(function(x){return row(x.id+" — "+x.title,x.owner,x.status)}).join(""):'<div class="option"><p>Action مرکزی فعالی برای این ماژول نیست.</p></div>')+'</div></div>';
 root.appendChild(card)
}
function dashboardKernel(){
 var c=document.getElementById("content");if(!c||document.getElementById("mk-dashboard")||document.getElementById("kv2-dashboard"))return;
 var h=c.querySelector(".head h2");if(!h||h.textContent.trim()!=="مرکز فرمان مدیرعامل")return;
 var s=K.snapshot(),box=document.createElement("div");box.id="mk-dashboard";box.className="card panel";box.style.marginTop="13px";
 box.innerHTML='<div class="ph"><div><div class="pt">⬡ هسته یکپارچه مدیریت</div><div class="ps">Event → Rule → Correlation → Case → Decision/Action → Notification → SLA → Audit</div></div><button class="btn sm" data-mk="open">جزئیات</button></div><div class="grid rulegrid">'+[["Event فعال",s.events],["Case",s.cases],["Action",s.actions],["Decision",s.decisions],["Approval",s.approvals],["Notification",s.notifications]].map(function(x){return '<div class="card rcode"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>'}).join("")+'</div>';
 c.appendChild(box)
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
  return
 }
 if(!od)return;
 var act=od.getAttribute("data-od"),key=od.getAttribute("data-key");
 if(act==="new-event")injectEntityField(key);
 if(act==="run-rule"){
  var idx=+od.getAttribute("data-idx"),def=(ruleMap[key]||[])[idx];
  if(def){var r=K.emitEvent({type:def[0],module:key,entityId:def[1],severity:def[2],impact:def[3],urgency:def[2]==="S4"?"U5":"U3",context:"Rule ماژول "+key+" از UI اجرا شد.",payload:inferPayload(def[0])});toast("Rule وارد Kernel شد",r.output||"Processed");refreshDecor()}
 }
 if(act==="save-event"){
  var type=val("od-ev")||key+".Exception",ent=val("mk-entity")||moduleEntity(key,type);
  var r=K.emitEvent({type:type,module:key,entityId:ent||null,severity:val("od-sev"),impact:val("od-imp"),context:val("od-ctx"),payload:inferPayload(type)});
  toast("Event در هسته مرکزی پردازش شد",r.output||"Processed");refreshDecor()
 }
},true);
var oldCommit=window.commitDecision;
if(typeof oldCommit==="function"){
 window.commitDecision=function(id,type){
  var r=oldCommit.apply(this,arguments);
  setTimeout(function(){K.resolveDecision(id,type,{source:"Decision Center"});toast("Decision با Kernel همگام شد",id+" → "+type);refreshDecor()},0);
  return r
 }
}
window.addEventListener("management-kernel:update",refreshDecor);
var mo=new MutationObserver(refreshDecor);var c=document.getElementById("content");if(c)mo.observe(c,{childList:true,subtree:false});
var style=document.createElement("style");style.textContent=".mk-live{border:1px solid #99f6e4!important;background:linear-gradient(180deg,#f0fdfa,#fff)!important}.mk-modal{max-width:1050px!important}#mk-dashboard{border:1px solid #bae6fd}.topacts #kernelBtn{font-size:15px}.mk-live .att{padding:9px 0}.mk-live .grid.two{align-items:start}";document.head.appendChild(style);
addKernelButton();refreshDecor();
})();