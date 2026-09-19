(function(){
"use strict";
var K=window.ManagementKernel;if(!K||K.version!==2)return;
var ui={centerTab:"decisions",caseFilter:"all",selectedCase:null};

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fa(n){try{return new Intl.NumberFormat("fa-IR").format(n)}catch(e){return n}}
function fmt(ts){if(!ts)return "—";try{return new Date(ts).toLocaleString("fa-IR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return "—"}}
function st(t){var c=/P0|P1|Critical|Emergency|Overdue|Rejected/.test(t)?"critical":/P2|High|Waiting|Requested|Returned|Actioning|Assigned/.test(t)?"high":/Verified|Approved|Decided|Completed|Resolved|Closed/.test(t)?"ok":"wait";return '<span class="st '+c+'">'+esc(t)+'</span>'}
function chip(t){return '<span class="chip">'+esc(t)+'</span>'}
function head(t,d,a){return '<div class="head"><div><h2>'+esc(t)+'</h2><p>'+esc(d)+'</p></div><div class="acts">'+(a||"")+'</div></div>'}
function kpis(items){return '<div class="grid kpis kv2-kpis">'+items.map(function(x,i){return '<div class="card kpi '+(x[3]||"")+'"><div class="kico">'+(["◆","✓","⚠","◎"][i%4])+'</div><div><div class="kl">'+esc(x[0])+'</div><div class="kv">'+esc(x[1])+'</div><div class="kf">'+esc(x[2]||"")+'</div></div></div>'}).join("")+'</div>'}
function table(h,rows){return '<div class="tablewrap"><table class="tbl"><thead><tr>'+h.map(function(x){return '<th>'+esc(x)+'</th>'}).join("")+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>'}
function content(){return document.getElementById("content")}
function toast(a,b){var box=document.getElementById("toasts");if(!box)return;var x=document.createElement("div");x.className="toast";x.innerHTML="<b>"+esc(a)+"</b>"+(b?"<small>"+esc(b)+"</small>":"");box.appendChild(x);setTimeout(function(){x.remove()},3200)}
function modal(title,body,foot){var m=document.getElementById("modal");if(!m)return;m.innerHTML='<div class="modalbg"><div class="modal kv2-modal"><div class="mh"><b>'+esc(title)+'</b><button class="close" data-kv2="close">×</button></div><div class="mb">'+body+'</div>'+(foot?'<div class="mf">'+foot+'</div>':'')+'</div></div>'}
function close(){var m=document.getElementById("modal");if(m)m.innerHTML=""}
function user(){return K.currentUser()}
function ensureRoleSwitcher(){
 var p=document.querySelector(".profile");if(!p||document.getElementById("kv2-role"))return;
 var s=document.createElement("select");s.id="kv2-role";s.className="kv2-role";s.innerHTML=[
  ["USR-CEO","مدیرعامل"],["USR-OPS","معاون عملیات"],["USR-PROC","مدیر تدارکات"],["USR-PROC-EX","کارشناس خرید"],["USR-HR","مدیر منابع انسانی"],["USR-HSE","مدیر HSE"],["USR-FIN","مدیر مالی"],["USR-AUD","حسابرس"]
 ].map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join("");
 s.value=user().id;s.onchange=function(){K.setSession(s.value);toast("نقش فعال تغییر کرد",K.currentUser().name);rerenderCurrent()};p.parentNode.insertBefore(s,p)
}
function permissionBadge(){var u=user();return '<div class="option kv2-perm"><p><b>نقش فعال:</b> '+esc(u.name)+' · '+esc(u.role)+' · Scope: '+esc(u.scope)+'</p></div>'}
function decisionsView(){
 var ds=K.query("decisions").filter(function(x){return x.status!=="Decided"}),aps=K.query("approvals").filter(function(x){return !/Approved|Rejected|Cancelled|Expired/.test(x.status)});
 var tabs='<div class="tabs"><button class="tab '+(ui.centerTab==="decisions"?"active":"")+'" data-kv2="center-tab" data-tab="decisions">تصمیم‌ها ('+ds.length+')</button><button class="tab '+(ui.centerTab==="approvals"?"active":"")+'" data-kv2="center-tab" data-tab="approvals">Approvalها ('+aps.length+')</button></div>';
 var body;
 if(ui.centerTab==="approvals"){
  body=aps.length?aps.map(function(a){return '<div class="att"><span class="dot amber"></span><div style="flex:1"><h4>'+esc(a.title)+'</h4><p>'+esc(a.requester)+' → '+esc(a.approver)+' · '+(a.amount?fa(a.amount)+" تومان":"")+'</p><div class="meta">'+chip(a.id)+chip(a.policy||"Policy")+st(a.status)+'</div></div><div class="acts">'+(K.can("approve","approval",a)?'<button class="btn sm green" data-kv2="approval" data-id="'+a.id+'" data-status="Approved">تأیید</button><button class="btn sm red" data-kv2="approval" data-id="'+a.id+'" data-status="Rejected">رد</button><button class="btn sm" data-kv2="approval" data-id="'+a.id+'" data-status="Returned">برگشت</button>':'<span class="ps">فقط مشاهده</span>')+'</div></div>'}).join(""):'<div class="option"><p>Approval فعالی برای این Scope وجود ندارد.</p></div>';
 }else{
  body=ds.length?ds.map(function(d){return '<div class="att"><span class="dot '+(d.priority==="P1"?"red":"amber")+'"></span><div style="flex:1"><h4>'+esc(d.title)+'</h4><p>'+esc(d.reason)+'</p><div class="meta">'+chip(d.id)+chip(d.authority)+st(d.status)+chip("مهلت "+fmt(d.dueAt))+'</div></div><div class="acts"><button class="btn sm" data-kv2="decision-detail" data-id="'+d.id+'">Context Pack</button>'+(K.can("decide","decision",d)?'<button class="btn sm green" data-kv2="decision" data-id="'+d.id+'" data-outcome="Approved">تأیید</button><button class="btn sm" data-kv2="decision" data-id="'+d.id+'" data-outcome="Need More Info">اطلاعات بیشتر</button><button class="btn sm red" data-kv2="decision" data-id="'+d.id+'" data-outcome="Rejected">رد</button>':'<span class="ps">سطح اختیار کافی نیست</span>')+'</div></div>'}).join(""):'<div class="option"><p>Decision فعالی برای این Scope وجود ندارد.</p></div>';
 }
 return head("مرکز تصمیم و تأیید","Approval برای انطباق با Policy است؛ Decision برای Choice / Authority Gap / Policy Exception.",'<button class="btn" data-kv2="tests">اجرای تست معماری</button>')+permissionBadge()+kpis([["Decision باز",ds.length,"مستقل از Approval",ds.some(function(x){return x.priority==="P1"})?"red":""],["Approval باز",aps.length,"Policy Flow",""],["Authority",user().role,"سطح نقش فعال",""],["Kernel","v2","Single Source of Truth","green"]])+tabs+'<div class="card panel">'+body+'</div>';
}
function decisionDetail(id){
 var d=K.query("decisions").find(function(x){return x.id===id});if(!d)return;
 var related=K.query("cases").find(function(x){return x.id===d.caseId});
 var opts=(d.options||[]).map(function(o){return '<div class="option"><p><b>'+esc(o.label||"Option")+'</b>'+(o.cost?'<br>هزینه: '+fa(o.cost):'')+(o.risk?'<br>ریسک: '+esc(o.risk):'')+'</p></div>'}).join("");
 modal(d.id+" — "+d.title,'<div class="infogrid"><div class="info"><small>Authority</small><b>'+esc(d.authority)+'</b></div><div class="info"><small>مالک تصمیم</small><b>'+esc(d.owner)+'</b></div><div class="info"><small>اولویت</small><b>'+esc(d.priority)+'</b></div><div class="info"><small>مهلت</small><b>'+fmt(d.dueAt)+'</b></div></div><div class="label">Why Now</div><p class="ps">'+esc(d.reason)+'</p><div class="label">Options</div>'+opts+'<div class="label">Recommendation</div><div class="option rec"><p>'+esc(d.recommendation||"—")+'</p></div><div class="label">Related Case</div><div class="option"><p>'+(related?esc(related.id+" — "+related.title):"—")+'</p></div>','<button class="btn" data-kv2="close">بستن</button>')
}
function casesView(){
 var cs=K.query("cases").filter(function(x){return x.status!=="Closed"}),filtered=cs;
 if(ui.caseFilter==="critical")filtered=cs.filter(function(x){return /Critical|Emergency/.test(x.severity)});
 if(ui.caseFilter==="decision")filtered=cs.filter(function(x){return (x.decisionIds||[]).some(function(id){return K.query("decisions").some(function(d){return d.id===id&&d.status!=="Decided"})})});
 if(ui.caseFilter==="blocked")filtered=cs.filter(function(x){return (x.blockers||[]).length});
 var tabs='<div class="tabs">'+[["all","همه"],["critical","بحرانی"],["decision","منتظر تصمیم"],["blocked","Blocked"]].map(function(x){return '<button class="tab '+(ui.caseFilter===x[0]?"active":"")+'" data-kv2="case-filter" data-filter="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</div>';
 return head("موضوعات مدیریتی","Case هسته پیگیری مسئله است و Event، Risk، Action، Approval و Decision را در یک Thread نگه می‌دارد.")+permissionBadge()+tabs+
 '<div class="card panel">'+table(["شناسه","موضوع","ماژول","شدت","مالک","وضعیت","وابستگی",""],filtered.map(function(c){return [esc(c.id),esc(c.title),esc(c.module),st(c.severity),esc(c.owner),st(c.status),esc((c.blockers||[]).join("، ")||"—"),'<button class="btn sm" data-kv2="case-detail" data-id="'+c.id+'">باز کردن</button>']}))+'</div>';
}
function caseDetail(id){
 var c=K.query("cases").find(function(x){return x.id===id});if(!c)return;
 var acts=K.query("actions").filter(function(x){return x.caseId===id});
 var ds=K.query("decisions").filter(function(x){return x.caseId===id});
 var aps=K.query("approvals").filter(function(x){return x.caseId===id});
 var risks=K.query("risks").filter(function(x){return x.caseId===id});
 var links=K.getStore().links.filter(function(x){return [c.id].indexOf(x.from)>=0||[c.id].indexOf(x.to)>=0});
 var tl=(c.timeline||[]).slice().reverse().map(function(x){return '<div class="tl"><b>'+fmt(x.at)+'</b><p>'+esc(x.text)+'</p></div>'}).join("");
 var body='<div class="infogrid"><div class="info"><small>Owner</small><b>'+esc(c.owner)+'</b></div><div class="info"><small>Accountable</small><b>'+esc(c.accountable)+'</b></div><div class="info"><small>Severity</small><b>'+esc(c.severity)+'</b></div><div class="info"><small>Priority</small><b>'+esc(c.priority)+'</b></div><div class="info"><small>Status</small><b>'+esc(c.status)+'</b></div><div class="info"><small>Sensitivity</small><b>'+esc(c.sensitivity)+'</b></div></div>'+
 '<div class="grid two"><div><div class="label">Actions</div>'+(acts.length?acts.map(function(a){return '<div class="att"><div style="flex:1"><h4>'+esc(a.title)+'</h4><p>'+esc(a.owner)+' · '+fmt(a.dueAt)+'</p></div>'+st(a.status)+(K.can("transition","action",a)&&!/Completed|Verified/.test(a.status)?'<button class="btn sm" data-kv2="action-complete" data-id="'+a.id+'">Complete</button>':'')+'</div>'}).join(""):'<div class="option"><p>Action ندارد.</p></div>')+'</div>'+
 '<div><div class="label">Decision / Approval / Risk</div>'+ds.map(function(d){return '<div class="att"><div style="flex:1"><h4>'+esc(d.id+" — "+d.title)+'</h4></div>'+st(d.status)+'</div>'}).join("")+aps.map(function(a){return '<div class="att"><div style="flex:1"><h4>'+esc(a.id+" — "+a.title)+'</h4></div>'+st(a.status)+'</div>'}).join("")+risks.map(function(r){return '<div class="att"><div style="flex:1"><h4>'+esc(r.title)+'</h4></div>'+st(r.level)+'</div>'}).join("")+'</div></div>'+
 '<div class="label">Dependency Graph</div><div class="flow">'+(links.length?links.slice(0,8).map(function(l){return '<span class="step '+(l.root?"done":"")+'">'+esc(l.from+" → "+l.type+" → "+l.to)+'</span>'}).join(""):'<span class="step">No links</span>')+'</div><div class="label">Timeline</div><div class="timeline">'+tl+'</div>';
 var foot='<button class="btn" data-kv2="close">بستن</button>';
 if(K.can("transition","case",c)){
  if(c.status==="Resolved")foot='<button class="btn primary" data-kv2="case-verify" data-id="'+c.id+'">Verify</button>'+foot;
  if(c.status==="Verified"||(/Medium|Low/.test(c.severity)&&c.status==="Resolved"))foot='<button class="btn green" data-kv2="case-close" data-id="'+c.id+'">Close Case</button>'+foot;
 }
 modal(c.id+" — "+c.title,body,foot)
}
function inboxView(){
 var ns=K.query("notifications").filter(function(x){return !/Resolved|Expired|Suppressed/.test(x.status)});
 var counts={Decide:0,Escalate:0,Act:0,Know:0};ns.forEach(function(n){counts[n.purpose]=(counts[n.purpose]||0)+1});
 return head("صندوق توجه مدیریتی","هر اعلان باید دقیقاً یکی از اهداف Know / Act / Decide / Escalate را داشته باشد.")+permissionBadge()+kpis([["Decide",counts.Decide,"نیازمند تصمیم","red"],["Escalate",counts.Escalate,"استثناء/SLA","amber"],["Act",counts.Act,"نیازمند اقدام",""],["Know",counts.Know,"برای اطلاع","green"]])+
 '<div class="card panel">'+(ns.length?ns.slice().sort(function(a,b){return a.priority.localeCompare(b.priority)}).map(function(n){return '<div class="att"><span class="dot '+(n.priority==="P0"||n.priority==="P1"?"red":"amber")+'"></span><div style="flex:1"><h4>'+esc(n.title)+'</h4><p>'+esc(n.recipient)+' · '+esc(n.reason||"")+' · '+fmt(n.createdAt)+'</p><div class="meta">'+chip(n.purpose)+st(n.priority)+st(n.status)+'</div></div>'+(n.status!=="Acknowledged"?'<button class="btn sm" data-kv2="ack" data-id="'+n.id+'">Acknowledge</button>':'')+'</div>'}).join(""):'<div class="option"><p>اعلان فعالی برای Scope فعلی وجود ندارد.</p></div>')+'</div>';
}
function myWorkView(){
 var u=user(),as=K.query("actions").filter(function(x){return !/Completed|Verified|Cancelled/.test(x.status)&&(x.ownerUserId===u.id||x.owner===u.name||u.role==="CEO")});
 var ds=K.query("decisions").filter(function(x){return x.status!=="Decided"&&(x.ownerUserId===u.id||x.owner===u.name||u.role==="CEO")});
 var aps=K.query("approvals").filter(function(x){return !/Approved|Rejected|Cancelled|Expired/.test(x.status)&&(x.approverUserId===u.id||x.approver===u.name||u.role==="CEO")});
 return head("کارهای من","Action، Decision و Approval بر اساس نقش و Scope فعال.")+permissionBadge()+kpis([["Action",as.length,"باز",""],["Decision",ds.length,"منتظر","red"],["Approval",aps.length,"منتظر","amber"],["Role",u.role,u.department,""]])+
 '<div class="grid two"><div class="card panel"><div class="pt">Actionهای من</div>'+(as.length?as.map(function(a){return '<div class="att"><div style="flex:1"><h4>'+esc(a.title)+'</h4><p>'+fmt(a.dueAt)+' · '+esc(a.module)+'</p></div>'+st(a.slaState||a.status)+(K.can("transition","action",a)?'<button class="btn sm" data-kv2="action-complete" data-id="'+a.id+'">Complete</button>':'')+'</div>'}).join(""):'<div class="option"><p>Action فعالی ندارید.</p></div>')+'</div><div class="card panel"><div class="pt">تصمیم‌ها و Approvalها</div>'+ds.map(function(d){return '<div class="att"><div style="flex:1"><h4>'+esc(d.title)+'</h4><p>'+esc(d.id)+'</p></div>'+st(d.status)+'</div>'}).join("")+aps.map(function(a){return '<div class="att"><div style="flex:1"><h4>'+esc(a.title)+'</h4><p>'+esc(a.id)+'</p></div>'+st(a.status)+'</div>')+(ds.length||aps.length?"":'<div class="option"><p>مورد فعالی نیست.</p></div>')+'</div></div>';
}
function riskView(){
 var rs=K.query("risks").filter(function(x){return x.status!=="Closed"}),ns=K.query("notifications").filter(function(x){return !/Resolved|Expired|Suppressed/.test(x.status)});
 return head("مرکز هشدار و ریسک","Risk آینده‌نگر است؛ Notification فقط Projection توجه است و Source of Truth نیست.")+permissionBadge()+kpis([["Risk فعال",rs.length,"Initial/Residual","red"],["اعلان",ns.length,"Grouped","amber"],["P0/P1",ns.filter(function(n){return /P0|P1/.test(n.priority)}).length,"بحرانی","red"],["Audit",K.snapshot().audit,"Immutable-like log",""]])+
 '<div class="grid two"><div class="card panel"><div class="pt">Risk Register</div>'+table(["ریسک","احتمال","اثر","Level","Residual","مالک"],rs.map(function(r){return [esc(r.title),esc(r.probability),esc(r.impact),st(r.level),st(r.residual),esc(r.owner)]}))+'</div><div class="card panel"><div class="pt">Exception Notifications</div>'+ns.slice(0,10).map(function(n){return '<div class="att"><div style="flex:1"><h4>'+esc(n.title)+'</h4><p>'+esc(n.purpose)+' · '+esc(n.reason)+'</p></div>'+st(n.priority)+'</div>'}).join("")+'</div></div>';
}
function testsModal(){
 var rs=K.runAcceptanceSuite(),ok=rs.filter(function(x){return x.ok}).length;
 modal("Acceptance Suite — "+ok+"/"+rs.length,rs.map(function(r){return '<div class="att"><span class="dot '+(r.ok?"":"red")+'"></span><div style="flex:1"><h4>'+esc(r.name)+'</h4><p>'+(r.ok?"PASS":esc(r.error||"FAIL"))+'</p></div>'+st(r.ok?"Completed":"Critical")+'</div>'}).join(""),'<button class="btn" data-kv2="close">بستن</button>')
}
function rerenderCurrent(){
 var c=content(),h=c&&c.querySelector(".head h2"),t=h?h.textContent.trim():"";
 if(t==="مرکز تصمیم"||t==="مرکز تصمیم و تأیید")renderCenter("decisions");
 else if(t==="موضوعات مدیریتی")renderCenter("cases");
 else if(t==="صندوق مدیرعامل"||t==="صندوق توجه مدیریتی")renderCenter("inbox");
 else if(t==="کارهای من")renderCenter("mywork");
 else if(t==="مرکز هشدار و ریسک")renderCenter("risks");
 else if(window.render)try{window.render()}catch(e){}
}
function renderCenter(type){
 var c=content();if(!c)return;c.dataset.kv2=type;
 if(type==="decisions")c.innerHTML=decisionsView();
 if(type==="cases")c.innerHTML=casesView();
 if(type==="inbox")c.innerHTML=inboxView();
 if(type==="mywork")c.innerHTML=myWorkView();
 if(type==="risks")c.innerHTML=riskView();
 ensureRoleSwitcher()
}
function intercept(){
 var c=content();if(!c)return;
 var h=c.querySelector(".head h2");if(!h)return;var t=h.textContent.trim();
 if(t==="مرکز تصمیم")renderCenter("decisions");
 else if(t==="موضوعات مدیریتی")renderCenter("cases");
 else if(t==="صندوق مدیرعامل")renderCenter("inbox");
 else if(t==="کارهای من")renderCenter("mywork");
 else if(t==="مرکز هشدار و ریسک")renderCenter("risks");
}
document.addEventListener("click",function(ev){
 var x=ev.target.closest("[data-kv2]");if(!x)return;
 var a=x.getAttribute("data-kv2"),id=x.getAttribute("data-id");
 try{
  if(a==="close")close();
  if(a==="center-tab"){ui.centerTab=x.getAttribute("data-tab");renderCenter("decisions")}
  if(a==="case-filter"){ui.caseFilter=x.getAttribute("data-filter");renderCenter("cases")}
  if(a==="decision-detail")decisionDetail(id);
  if(a==="decision"){K.resolveDecision(id,x.getAttribute("data-outcome"),{source:"Kernel Decision Center"});toast("تصمیم ثبت شد",id);renderCenter("decisions")}
  if(a==="approval"){K.transitionApproval(id,x.getAttribute("data-status"),"ثبت از Approval Center");toast("Approval بروزرسانی شد",id);renderCenter("decisions")}
  if(a==="case-detail")caseDetail(id);
  if(a==="case-verify"){K.verifyCase(id);close();toast("Case تأیید شد",id);renderCenter("cases")}
  if(a==="case-close"){K.closeCase(id);close();toast("Case بسته شد",id);renderCenter("cases")}
  if(a==="action-complete"){K.completeAction(id,false);toast("Action تکمیل شد",id);rerenderCurrent()}
  if(a==="ack"){K.acknowledge(id);toast("اعلان Acknowledge شد",id);renderCenter("inbox")}
  if(a==="tests")testsModal();
 }catch(e){
  if(e.message==="ACCESS_DENIED")toast("دسترسی مجاز نیست","Role/Scope اجازه این عملیات را نمی‌دهد");
  else toast("عملیات انجام نشد",e.message);
 }
});
var obs=new MutationObserver(function(){var c=content();if(c&&c.dataset.kv2)return;setTimeout(intercept,0)});
var c=content();if(c)obs.observe(c,{childList:true,subtree:false});
window.addEventListener("management-kernel:update",function(){setTimeout(function(){var c=content();if(c&&c.dataset.kv2){var type=c.dataset.kv2;c.removeAttribute("data-kv2");renderCenter(type)}ensureRoleSwitcher()},20)});
var style=document.createElement("style");
style.textContent=".kv2-role{border:1px solid #cbd5e1;background:white;border-radius:10px;padding:7px 8px;font-size:11px;max-width:140px}.kv2-kpis{margin-bottom:13px}.kv2-perm{margin-bottom:12px;border-inline-start:3px solid #0f766e}.kv2-modal{max-width:1000px!important}@media(max-width:720px){.kv2-role{max-width:96px;padding:6px 4px}.kv2-kpis{grid-template-columns:1fr 1fr!important}}";
document.head.appendChild(style);
ensureRoleSwitcher();setTimeout(intercept,40);
})();