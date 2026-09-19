(function(){
"use strict";
var K=window.ManagementKernel;if(!K||K.version!==2)return;

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(ts){try{return new Date(ts).toLocaleString("fa-IR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return "—"}}
function visible(kind){try{return K.query(kind)}catch(e){return []}}
function store(){return K.getStore()}
function entity(id){return (store().master.entities||{})[id]||null}
function linksOf(id){return store().links.filter(function(l){return l.from===id||l.to===id})}
function relatedIds(seedIds,depth){
 var seen={},front=(seedIds||[]).slice(),d=0;front.forEach(function(x){seen[x]=true});
 while(front.length&&d<(depth||2)){
  var next=[];front.forEach(function(id){linksOf(id).forEach(function(l){var other=l.from===id?l.to:l.from;if(!seen[other]){seen[other]=true;next.push(other)}})});front=next;d++;
 }
 return Object.keys(seen);
}
function describeId(id){
 var s=store(),e=s.master.entities[id];if(e)return e.name||e.id;
 var buckets=["cases","actions","decisions","approvals","risks","events","notifications"];
 for(var i=0;i<buckets.length;i++){var x=(s[buckets[i]]||[]).find(function(r){return r.id===id});if(x)return x.title||x.type||x.id}
 return id;
}
function evidenceList(ids){
 return ids.filter(Boolean).filter(function(id,i,a){return a.indexOf(id)===i}).slice(0,12).map(function(id){return '<button class="chip kai-evidence" data-kai-id="'+esc(id)+'">'+esc(id)+'</button>'}).join("");
}
function currentActions(caseIds){
 return visible("actions").filter(function(a){return caseIds.indexOf(a.caseId)>=0&&!/Completed|Verified|Cancelled/.test(a.status)});
}
function currentDecisions(caseIds){
 return visible("decisions").filter(function(d){return caseIds.indexOf(d.caseId)>=0&&d.status!=="Decided"});
}
function productionAnswer(){
 var s=store(),prodEvents=visible("events").filter(function(e){return e.module==="production"&&e.status==="Active"}),prodCases=visible("cases").filter(function(c){return c.module==="production"&&c.status!=="Closed"});
 var rootIds=[];
 prodEvents.forEach(function(e){if(e.rootEventId)rootIds.push(e.rootEventId)});
 var related=relatedIds(prodEvents.map(function(e){return e.id}).concat(rootIds),3);
 var wo=entity("WO-529"),shift=entity("PROD-SHIFT-829"),asset=entity("AST-ELV2");
 var actions=currentActions(prodCases.map(function(c){return c.id}));
 var impact=shift&&shift.plan?Math.round((shift.plan-shift.actual)/shift.plan*100):null;
 var answer=prodCases.length||prodEvents.length?
  "تولید از برنامه عقب است و Kernel علت‌های متصل را به‌جای حدس از Graph می‌خواند.":
  "در Kernel فعلی Event فعال تولیدی کافی برای نتیجه‌گیری قطعی وجود ندارد.";
 var why=[];
 if(shift)why.push("شیفت ثبت‌شده "+shift.actual+" از "+shift.plan+" تن تولید کرده است"+(impact!=null?" ("+impact+"٪ انحراف)":"")+".");
 if(wo)why.push(wo.id+" در وضعیت "+wo.status+" ثبت شده است.");
 if(asset)why.push("تجهیز مرتبط "+asset.name+" است.");
 return pack(answer,why.join(" "),related.concat(["PROD-SHIFT-829","WO-529","AST-ELV2"]),impact!=null?impact+"٪ انحراف تولید":"نامشخص",actions,prodCases,"علت‌ها از Root/Impact Linkها استخراج شده‌اند.");
}
function procurementAnswer(){
 var s=store(),pos=Object.keys(s.master.entities).map(function(k){return s.master.entities[k]}).filter(function(e){return e.type==="po"&&e.status!=="Closed"});
 var cases=visible("cases").filter(function(c){return /procurement|inventory/.test(c.module)&&c.status!=="Closed"});
 var actions=currentActions(cases.map(function(c){return c.id})),decisions=currentDecisions(cases.map(function(c){return c.id}));
 var risky=pos.filter(function(p){var item=entity(p.itemId);return item&&+p.etaDays>(+item.coverageDays||0)});
 var answer=risky.length?risky.length+" سفارش خرید نسبت به پوشش موجودی ریسک زمانی دارند.":"بر اساس داده فعلی Kernel سفارش خریدی با ETA بالاتر از Coverage پیدا نشد.";
 var why=risky.map(function(p){var item=entity(p.itemId);return p.id+": ETA "+p.etaDays+" روز در برابر Coverage "+(+item.coverageDays||0)+" روز برای "+(item.name||item.id)}).join("؛ ");
 return pack(answer,why,risky.reduce(function(a,p){return a.concat([p.id,p.itemId])},[]).concat(cases.map(function(c){return c.id})).concat(decisions.map(function(d){return d.id})),"ریسک تأمین/توقف",actions,cases,decisions.length?"Decision فعال: "+decisions.map(function(d){return d.id}).join("، "):"Decision فعالی نیست.");
}
function successionAnswer(){
 var pos=entity("POS-14"),cases=visible("cases").filter(function(c){return c.module==="hr"&&c.status!=="Closed"}),acts=currentActions(cases.map(function(c){return c.id})),ds=currentDecisions(cases.map(function(c){return c.id}));
 var answer=pos?(pos.readyNow||0)===0?"برای "+(pos.name||pos.id)+" جانشین Ready Now ثبت نشده است.":"برای این پست جانشین آماده ثبت شده است.":"داده پست کلیدی در Scope فعلی قابل مشاهده نیست.";
 var why=pos?"Critical Position="+(pos.critical?"Yes":"No")+" و Ready Now="+(pos.readyNow||0)+".":"";
 return pack(answer,why,["POS-14"].concat(cases.map(function(c){return c.id})).concat(ds.map(function(d){return d.id})),"تداوم عملیات / People Risk",acts,cases,ds.length?"تصمیم فعال: "+ds.map(function(d){return d.id}).join("، "):"برنامه توسعه باید در HR پیگیری شود.");
}
function riskAnswer(){
 var risks=visible("risks").filter(function(r){return r.status!=="Closed"}).sort(function(a,b){var rank={Critical:4,High:3,Medium:2,Low:1};return (rank[b.level]||0)-(rank[a.level]||0)});
 var top=risks.slice(0,5),cases=visible("cases").filter(function(c){return top.some(function(r){return r.caseId===c.id})});
 var acts=currentActions(cases.map(function(c){return c.id}));
 var answer=top.length?"بالاترین ریسک‌های فعال از Risk Register مرکزی استخراج شدند.":"ریسک فعالی در Scope فعلی وجود ندارد.";
 var why=top.map(function(r){return r.title+" ("+r.level+"، Residual "+r.residual+")"}).join("؛ ");
 return pack(answer,why,top.map(function(r){return r.id}).concat(cases.map(function(c){return c.id})),"مطابق سطح Risk Register",acts,cases,"اولویت بر اساس Level و Residual Risk است.");
}
function genericAnswer(q){
 var s=store(),q2=String(q).toLowerCase();
 var hits=[];
 ["cases","actions","decisions","approvals","risks","events"].forEach(function(kind){
  visible(kind).forEach(function(x){var hay=(x.id+" "+(x.title||"")+" "+(x.type||"")+" "+(x.context||"")+" "+(x.owner||"")).toLowerCase();if(hay.indexOf(q2)>=0)hits.push({kind:kind,x:x})});
 });
 Object.keys(s.master.entities||{}).forEach(function(k){var e=s.master.entities[k],hay=(e.id+" "+(e.name||"")+" "+(e.type||"")).toLowerCase();if(hay.indexOf(q2)>=0)hits.push({kind:"entity",x:e})});
 if(!hits.length)return pack("اطلاعات کافی برای پاسخ قطعی پیدا نشد.","Kernel هیچ Evidence مرتبطی در Scope فعلی پیدا نکرد.",[],"نامشخص",[],[],"سیستم علت را حدس نمی‌زند.");
 var ids=hits.slice(0,10).map(function(h){return h.x.id});
 var cases=hits.filter(function(h){return h.kind==="cases"}).map(function(h){return h.x});
 return pack(hits.length+" رکورد مرتبط در Kernel پیدا شد.",hits.slice(0,5).map(function(h){return (h.x.title||h.x.name||h.x.type||h.x.id)+" ["+h.kind+"]"}).join("؛ "),ids,"وابسته به رکوردهای یافت‌شده",currentActions(cases.map(function(c){return c.id})),cases,"برای تحلیل دقیق‌تر روی یکی از Evidenceها کلیک کن.");
}
function pack(answer,why,evidence,impact,actions,cases,next){
 var owner=actions.length?actions.map(function(a){return a.owner}).filter(function(x,i,a){return a.indexOf(x)===i}).join("، "):(cases.length?cases.map(function(c){return c.owner}).filter(function(x,i,a){return a.indexOf(x)===i}).join("، "):"—");
 var milestone=actions.length?actions.map(function(a){return a.title+" — "+fmt(a.dueAt)}).join(" | "):next||"—";
 return '<div class="kai-pack"><div><b>Answer</b><p>'+esc(answer)+'</p></div><div><b>Evidence / Why</b><p>'+esc(why||"—")+'</p><div class="meta">'+evidenceList(evidence||[])+'</div></div><div class="kai-grid"><div><small>Impact</small><b>'+esc(impact||"—")+'</b></div><div><small>Owner</small><b>'+esc(owner||"—")+'</b></div><div><small>Current Action</small><b>'+esc(actions.length?actions.map(function(a){return a.id}).join("، "):"—")+'</b></div><div><small>Next Milestone</small><b>'+esc(milestone)+'</b></div></div></div>';
}
function answer(q){
 if(/تولید|برنامه|توقف/.test(q))return productionAnswer();
 if(/خرید|تدارک|سفارش|تأمین|po/i.test(q))return procurementAnswer();
 if(/جانشین|مدیر شیفت|succession/i.test(q))return successionAnswer();
 if(/ریسک|بحرانی|critical/i.test(q))return riskAnswer();
 return genericAnswer(q);
}
function ask(q){
 var inp=document.getElementById("aiq");q=q||(inp&&inp.value.trim());if(!q)return;
 var box=document.getElementById("aimsgs");if(!box)return;
 box.insertAdjacentHTML("beforeend",'<div class="msg user">'+esc(q)+'</div>');
 if(inp)inp.value="";
 box.insertAdjacentHTML("beforeend",'<div class="msg bot"><div class="kai-source">Evidence-based · Kernel v2 · Scope: '+esc(K.currentUser().name)+'</div>'+answer(q)+'</div>');
 box.scrollTop=box.scrollHeight;
}
window.askAI=ask;

function openEvidence(id){
 var s=store(),obj=(s.master.entities||{})[id];
 if(!obj){
  ["cases","actions","decisions","approvals","risks","events","notifications"].some(function(k){obj=(s[k]||[]).find(function(x){return x.id===id});return !!obj});
 }
 if(!obj)return;
 var links=linksOf(id);
 var body='<div class="infogrid">'+Object.keys(obj).filter(function(k){return ["payload","timeline","options"].indexOf(k)<0&&typeof obj[k]!=="object"}).slice(0,12).map(function(k){return '<div class="info"><small>'+esc(k)+'</small><b>'+esc(obj[k])+'</b></div>'}).join("")+'</div><div class="label">Evidence Graph</div><div class="flow">'+(links.length?links.map(function(l){return '<span class="step '+(l.root?"done":"")+'">'+esc(describeId(l.from)+" → "+l.type+" → "+describeId(l.to))+'</span>'}).join(""):'<span class="step">رابطه‌ای ثبت نشده</span>')+'</div>';
 var m=document.getElementById("modal");if(m)m.innerHTML='<div class="modalbg"><div class="modal"><div class="mh"><b>'+esc(id)+'</b><button class="close" data-kai="close">×</button></div><div class="mb">'+body+'</div></div></div>';
}
document.addEventListener("click",function(ev){
 var x=ev.target.closest("[data-kai-id],[data-kai]");
 if(!x)return;
 if(x.hasAttribute("data-kai-id"))openEvidence(x.getAttribute("data-kai-id"));
 if(x.getAttribute("data-kai")==="close"){var m=document.getElementById("modal");if(m)m.innerHTML=""}
});

function setupKernelSearch(){
 var input=document.getElementById("gsearch"),box=document.getElementById("searchres");if(!input||!box)return;
 input.oninput=function(){
  var q=input.value.trim().toLowerCase();if(!q){box.classList.add("hidden");return}
  var results=[],s=store();
  function add(kind,x,label){var hay=(x.id+" "+(x.title||"")+" "+(x.name||"")+" "+(x.type||"")+" "+(x.owner||"")).toLowerCase();if(hay.indexOf(q)>=0)results.push({kind:kind,id:x.id,title:x.title||x.name||x.type||x.id,label:label})}
  ["cases","actions","decisions","approvals","risks","events"].forEach(function(k){visible(k).forEach(function(x){add(k,x,k)})});
  Object.keys(s.master.entities||{}).forEach(function(k){var x=s.master.entities[k];if(K.can("read","entity",x))add("entity",x,x.type||"entity")});
  results=results.slice(0,10);
  box.innerHTML=results.length?results.map(function(r){return '<div class="sr" data-kai-search="'+esc(r.id)+'"><b>'+esc(r.title)+'</b><small>'+esc(r.id)+' · '+esc(r.label)+'</small></div>'}).join(""):'<div class="sr"><small>نتیجه‌ای در Kernel پیدا نشد.</small></div>';
  box.classList.remove("hidden");
 };
 box.addEventListener("click",function(ev){var r=ev.target.closest("[data-kai-search]");if(!r)return;openEvidence(r.getAttribute("data-kai-search"));input.value="";box.classList.add("hidden")});
}
var obs=new MutationObserver(function(){var h=document.querySelector("#content .head h2");if(h&&h.textContent.trim()==="دستیار هوشمند"){setTimeout(function(){var intro=document.querySelector("#aimsgs .msg.bot");if(intro&&!intro.dataset.kai){intro.dataset.kai="1";intro.innerHTML="<b>دستیار:</b><br>پاسخ‌ها از Management Kernel و Evidence Graph ساخته می‌شوند؛ اگر Evidence کافی نباشد علت حدس زده نمی‌شود.<div class=\"quick\"><button onclick=\"askAI('چرا تولید امروز کمتر از برنامه بود؟')\">چرا تولید کم شد؟</button><button onclick=\"askAI('کدام خریدها ریسک تأمین دارند؟')\">ریسک خرید</button><button onclick=\"askAI('برای مدیر شیفت چه جانشینی داریم؟')\">جانشینی</button><button onclick=\"askAI('ریسک‌های بحرانی چیست؟')\">ریسک‌ها</button></div>"}},0)}});var c=document.getElementById("content");if(c)obs.observe(c,{childList:true,subtree:false});
var style=document.createElement("style");style.textContent=".kai-source{font-size:10px;color:#64748b;margin-bottom:8px}.kai-pack>div{margin-bottom:12px}.kai-pack p{margin:4px 0 8px;line-height:1.8}.kai-grid{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}.kai-grid>div{border:1px solid #e2e8f0;border-radius:10px;padding:9px;display:flex;flex-direction:column;gap:4px}.kai-grid small{color:#64748b}.kai-evidence{cursor:pointer;border:1px solid #bae6fd}.kai-evidence:hover{background:#e0f2fe}@media(max-width:640px){.kai-grid{grid-template-columns:1fr!important}}";document.head.appendChild(style);
setupKernelSearch();
})();