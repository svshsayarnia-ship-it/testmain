(function(){
"use strict";

function showInitError(message){
  console.error("[Kernel AI]", message);
  function paint(){
    var box=document.getElementById("toasts");
    if(!box)return;
    var x=document.createElement("div");
    x.className="toast";
    x.innerHTML="<b>دستیار هوشمند آماده نشد</b><small>"+escapeHtml(message)+"</small>";
    box.appendChild(x);
    setTimeout(function(){x.remove()},5000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",paint,{once:true});else paint();
}
function escapeHtml(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function sanitizeHtml(html){
  var tpl=document.createElement("template");
  tpl.innerHTML=String(html||"");
  var allowed={DIV:1,P:1,B:1,STRONG:1,SMALL:1,SPAN:1,BUTTON:1,BR:1,H3:1,UL:1,OL:1,LI:1};
  var allowedAttrs={"class":1,"data-kai-id":1,"data-kai":1};
  Array.from(tpl.content.querySelectorAll("*")).forEach(function(el){
    if(!allowed[el.tagName]){el.replaceWith(document.createTextNode(el.textContent||""));return}
    Array.from(el.attributes).forEach(function(a){
      if(!allowedAttrs[a.name])el.removeAttribute(a.name);
      if(/^on/i.test(a.name))el.removeAttribute(a.name);
    });
  });
  return tpl.innerHTML;
}
function init(K){
  if(!K||K.version!==2){showInitError("Management Kernel v2 در دسترس نیست.");return}

  function fmt(ts){try{return new Date(ts).toLocaleString("fa-IR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return "—"}}
  function visible(kind){try{return K.query(kind)}catch(e){return []}}
  function store(){return K.getStore()}
  function allEntities(){var s=store();return Object.keys((s.master&&s.master.entities)||{}).map(function(k){return s.master.entities[k]}).filter(function(e){try{return K.can("read","entity",e)}catch(_){return true}})}
  function entity(id){return allEntities().find(function(e){return e.id===id})||null}
  function entities(type,module){return allEntities().filter(function(e){return (!type||e.type===type)&&(!module||e.module===module)})}
  function linksOf(id){return (store().links||[]).filter(function(l){return l.from===id||l.to===id})}
  function relatedIds(seedIds,depth){
    var seen={},front=(seedIds||[]).filter(Boolean).slice(),d=0;front.forEach(function(x){seen[x]=true});
    while(front.length&&d<(depth||2)){
      var next=[];front.forEach(function(id){linksOf(id).forEach(function(l){var other=l.from===id?l.to:l.from;if(!seen[other]){seen[other]=true;next.push(other)}})});front=next;d++;
    }
    return Object.keys(seen);
  }
  function describeId(id){
    var e=entity(id);if(e)return e.name||e.id;
    var s=store(),buckets=["cases","actions","decisions","approvals","risks","events","notifications"];
    for(var i=0;i<buckets.length;i++){var x=(s[buckets[i]]||[]).find(function(r){return r.id===id});if(x)return x.title||x.type||x.id}
    return id;
  }
  function evidenceList(ids){
    return (ids||[]).filter(Boolean).filter(function(id,i,a){return a.indexOf(id)===i}).slice(0,12).map(function(id){return '<button class="chip kai-evidence" data-kai-id="'+escapeHtml(id)+'">'+escapeHtml(id)+'</button>'}).join("");
  }
  function currentActions(caseIds){return visible("actions").filter(function(a){return caseIds.indexOf(a.caseId)>=0&&!/Completed|Verified|Cancelled/.test(a.status)})}
  function currentDecisions(caseIds){return visible("decisions").filter(function(d){return caseIds.indexOf(d.caseId)>=0&&d.status!=="Decided"})}
  function latestBy(list,field){return list.slice().sort(function(a,b){return (+b[field]||+b.updatedAt||+b.createdAt||0)-(+a[field]||+a.updatedAt||+a.createdAt||0)})[0]||null}
  var conversation=[];
  function markdown(text){
    var safe=escapeHtml(text||"");
    safe=safe.replace(/^###\s+(.+)$/gm,"<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
    var lines=safe.split("\n"),out=[],list=false;
    lines.forEach(function(line){
      var item=line.match(/^\s*[-•]\s+(.+)/);
      if(item){if(!list){out.push("<ul>");list=true}out.push("<li>"+item[1]+"</li>");return}
      if(list){out.push("</ul>");list=false}
      if(/^<h3>/.test(line))out.push(line);else if(line.trim())out.push("<p>"+line+"</p>");
    });
    if(list)out.push("</ul>");
    return sanitizeHtml(out.join(""));
  }
  function compactRecord(x){
    var out={};["id","title","name","type","module","status","severity","priority","owner","reason","context","dueAt","updatedAt"].forEach(function(k){if(x&&x[k]!=null)out[k]=x[k]});return out;
  }
  function liveContext(){
    var page=document.querySelector("#content .head h2"),records={};
    ["cases","actions","decisions","approvals","risks","events"].forEach(function(kind){records[kind]=visible(kind).slice(0,12).map(compactRecord)});
    var snapshot={};try{snapshot=K.snapshot()}catch(_){snapshot={}}
    return {page:page?page.textContent.trim():"دستیار هوشمند",user:{name:K.currentUser().name,role:K.currentUser().role,scope:K.currentUser().scope},snapshot:snapshot,records:records};
  }

  function productionAnswer(){
    var prodEvents=visible("events").filter(function(e){return e.module==="production"&&e.status==="Active"});
    var prodCases=visible("cases").filter(function(c){return c.module==="production"&&c.status!=="Closed"});
    var rootIds=[];prodEvents.forEach(function(e){if(e.rootEventId)rootIds.push(e.rootEventId)});
    var related=relatedIds(prodEvents.map(function(e){return e.id}).concat(rootIds),3);
    var shift=latestBy(entities("production_shift","production"),"updatedAt")||latestBy(entities("production_shift"),"updatedAt");
    var impact=shift&&+shift.plan>0?Math.round(((+shift.plan-(+shift.actual||0))/+shift.plan)*100):null;
    var behind=impact!=null&&impact>5;
    var workOrders=entities("work_order","maintenance").filter(function(w){return w.productionImpact||related.indexOf(w.id)>=0});
    var wo=latestBy(workOrders,"updatedAt");
    var asset=wo&&wo.assetId?entity(wo.assetId):null;
    var actions=currentActions(prodCases.map(function(c){return c.id}));
    var answer;
    if(behind)answer="تولید از برنامه عقب است و علت‌های مرتبط از Evidence Graph بررسی شده‌اند.";
    else if(impact!=null)answer="بر اساس آخرین رکورد تولید، انحراف از آستانه ۵٪ عبور نکرده است.";
    else if(prodCases.length||prodEvents.length)answer="Exception تولیدی فعال وجود دارد، اما داده Plan/Actual کافی برای نتیجه‌گیری درباره عقب‌ماندگی تولید موجود نیست.";
    else answer="در Kernel فعلی داده کافی برای نتیجه‌گیری قطعی درباره انحراف تولید وجود ندارد.";
    var why=[];
    if(shift)why.push("آخرین رکورد تولید: "+(+shift.actual||0)+" از "+(+shift.plan||0)+" تن"+(impact!=null?" ("+impact+"٪ انحراف)":"")+".");
    if(wo)why.push((wo.name||wo.id)+" در وضعیت "+(wo.status||"نامشخص")+" ثبت شده است.");
    if(asset)why.push("تجهیز مرتبط "+(asset.name||asset.id)+" است.");
    var evIds=prodEvents.map(function(e){return e.id});
    return pack(answer,why.join(" "),related.concat(evIds,[shift&&shift.id,wo&&wo.id,asset&&asset.id]),impact!=null?impact+"٪ انحراف تولید":"نامشخص",actions,prodCases,"Root/Impact Linkها مبنای تحلیل‌اند.");
  }

  function procurementAnswer(){
    var pos=entities("po").filter(function(e){return e.status!=="Closed"});
    var cases=visible("cases").filter(function(c){return /procurement|inventory/.test(c.module)&&c.status!=="Closed"});
    var actions=currentActions(cases.map(function(c){return c.id})),decisions=currentDecisions(cases.map(function(c){return c.id}));
    var risky=pos.filter(function(p){var item=entity(p.itemId);return item&&+p.etaDays>(+item.coverageDays||0)});
    var answer=risky.length?risky.length+" سفارش خرید نسبت به پوشش موجودی ریسک زمانی دارند.":"بر اساس داده فعلی Kernel سفارش خریدی با ETA بالاتر از Coverage پیدا نشد.";
    var why=risky.map(function(p){var item=entity(p.itemId);return (p.id||"PO")+": ETA "+p.etaDays+" روز در برابر Coverage "+(+item.coverageDays||0)+" روز برای "+(item.name||item.id)}).join("؛ ");
    return pack(answer,why,risky.reduce(function(a,p){return a.concat([p.id,p.itemId])},[]).concat(cases.map(function(c){return c.id})).concat(decisions.map(function(d){return d.id})),"ریسک تأمین/توقف",actions,cases,decisions.length?"Decision فعال: "+decisions.map(function(d){return d.id}).join("، "):"Decision فعالی نیست.");
  }

  function successionAnswer(){
    var positions=entities("position","hr").filter(function(p){return p.critical});
    var pos=positions.slice().sort(function(a,b){return (+a.readyNow||0)-(+b.readyNow||0)})[0]||null;
    var cases=visible("cases").filter(function(c){return c.module==="hr"&&c.status!=="Closed"});
    var acts=currentActions(cases.map(function(c){return c.id})),ds=currentDecisions(cases.map(function(c){return c.id}));
    var answer=pos?(+pos.readyNow||0)===0?"برای "+(pos.name||pos.id)+" جانشین Ready Now ثبت نشده است.":"برای "+(pos.name||pos.id)+" جانشین آماده ثبت شده است.":"در Scope فعلی پست بحرانی قابل مشاهده‌ای وجود ندارد.";
    var why=pos?"Critical Position=Yes و Ready Now="+(+pos.readyNow||0)+".":"";
    return pack(answer,why,[pos&&pos.id].concat(cases.map(function(c){return c.id})).concat(ds.map(function(d){return d.id})),"تداوم عملیات / People Risk",acts,cases,ds.length?"تصمیم فعال: "+ds.map(function(d){return d.id}).join("، "):"برنامه توسعه باید در HR پیگیری شود.");
  }

  function riskAnswer(){
    var risks=visible("risks").filter(function(r){return r.status!=="Closed"}).sort(function(a,b){var rank={Critical:4,High:3,Medium:2,Low:1};return (rank[b.level]||0)-(rank[a.level]||0)});
    var top=risks.slice(0,5),cases=visible("cases").filter(function(c){return top.some(function(r){return r.caseId===c.id})});
    return pack(top.length?"بالاترین ریسک‌های فعال از Risk Register مرکزی استخراج شدند.":"ریسک فعالی در Scope فعلی وجود ندارد.",top.map(function(r){return r.title+" ("+r.level+"، Residual "+r.residual+")"}).join("؛ "),top.map(function(r){return r.id}).concat(cases.map(function(c){return c.id})),"مطابق سطح Risk Register",currentActions(cases.map(function(c){return c.id})),cases,"اولویت بر اساس Level و Residual Risk است.");
  }

  function genericAnswer(q){
    var q2=String(q||"").trim().toLowerCase();
    if(q2.length<3)return pack("پرسش برای جست‌وجوی امن خیلی کوتاه است.","حداقل ۳ کاراکتر وارد کنید.",[],"—",[],[],"—");
    var hits=[];
    ["cases","actions","decisions","approvals","risks","events"].forEach(function(kind){
      visible(kind).forEach(function(x){var hay=(x.id+" "+(x.title||"")+" "+(x.type||"")+" "+(x.context||"")+" "+(x.owner||"")).toLowerCase();if(hay.indexOf(q2)>=0)hits.push({kind:kind,x:x})});
    });
    allEntities().forEach(function(e){var hay=(e.id+" "+(e.name||"")+" "+(e.type||"")).toLowerCase();if(hay.indexOf(q2)>=0)hits.push({kind:"entity",x:e})});
    if(!hits.length)return pack("اطلاعات کافی برای پاسخ قطعی پیدا نشد.","Kernel هیچ Evidence مرتبطی در Scope فعلی پیدا نکرد.",[],"نامشخص",[],[],"سیستم علت را حدس نمی‌زند.");
    var ids=hits.slice(0,10).map(function(h){return h.x.id}),cases=hits.filter(function(h){return h.kind==="cases"}).map(function(h){return h.x});
    return pack(hits.length+" رکورد مرتبط در Kernel پیدا شد.",hits.slice(0,5).map(function(h){return (h.x.title||h.x.name||h.x.type||h.x.id)+" ["+h.kind+"]"}).join("؛ "),ids,"وابسته به رکوردهای یافت‌شده",currentActions(cases.map(function(c){return c.id})),cases,"برای تحلیل دقیق‌تر روی Evidence کلیک کنید.");
  }

  function pack(answer,why,evidence,impact,actions,cases,next){
    var owner=actions.length?actions.map(function(a){return a.owner}).filter(function(x,i,a){return a.indexOf(x)===i}).join("، "):(cases.length?cases.map(function(c){return c.owner}).filter(function(x,i,a){return a.indexOf(x)===i}).join("، "):"—");
    var milestone=actions.length?actions.map(function(a){return a.title+" — "+fmt(a.dueAt)}).join(" | "):next||"—";
    return '<div class="kai-pack"><div><b>Answer</b><p>'+escapeHtml(answer)+'</p></div><div><b>Evidence / Why</b><p>'+escapeHtml(why||"—")+'</p><div class="meta">'+evidenceList(evidence||[])+'</div></div><div class="kai-grid"><div><small>Impact</small><b>'+escapeHtml(impact||"—")+'</b></div><div><small>Owner</small><b>'+escapeHtml(owner||"—")+'</b></div><div><small>Current Action</small><b>'+escapeHtml(actions.length?actions.map(function(a){return a.id}).join("، "):"—")+'</b></div><div><small>Next Milestone</small><b>'+escapeHtml(milestone)+'</b></div></div></div>';
  }
  function answer(q){
    if(/تولید|برنامه|توقف/.test(q))return productionAnswer();
    if(/خرید|تدارک|سفارش|تأمین|po/i.test(q))return procurementAnswer();
    if(/جانشین|مدیر شیفت|succession/i.test(q))return successionAnswer();
    if(/ریسک|بحرانی|critical/i.test(q))return riskAnswer();
    return genericAnswer(q);
  }
  async function ask(q){
    var inp=document.getElementById("aiq");q=(q||(inp&&inp.value)||"").trim();if(!q)return;
    var box=document.getElementById("aimsgs");if(!box)return;
    var userMsg=document.createElement("div");userMsg.className="msg user";userMsg.textContent=q;box.appendChild(userMsg);
    if(inp)inp.value="";
    var bot=document.createElement("div");bot.className="msg bot";
    var src=document.createElement("div");src.className="kai-source";src.textContent="در حال بررسی راهنمای نرم‌افزار و اطلاعات مجاز…";bot.appendChild(src);
    var body=document.createElement("div");body.innerHTML="<p>کمی صبر کنید…</p>";bot.appendChild(body);box.appendChild(bot);box.scrollTop=box.scrollHeight;
    try{
      var response=await fetch("/api/coach",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q,context:liveContext(),history:conversation.slice(-6)})});
      var data=await response.json();if(!response.ok)throw new Error(data.error||"پاسخی دریافت نشد");
      body.innerHTML=markdown(data.answer||"");src.textContent=data.status||"راهنمای هوشمند نرم‌افزار";
      conversation.push({role:"user",content:q},{role:"assistant",content:data.answer||""});
    }catch(error){
      body.innerHTML=sanitizeHtml(answer(q));src.textContent="پاسخ داخلی هسته مدیریتی؛ اتصال ChatGPT موقتاً در دسترس نیست";
    }
    box.scrollTop=box.scrollHeight;
  }
  window.askAI=ask;

  function openEvidence(id){
    var s=store(),obj=entity(id);
    if(!obj){["cases","actions","decisions","approvals","risks","events","notifications"].some(function(k){obj=(s[k]||[]).find(function(x){return x.id===id});return !!obj})}
    if(!obj)return;
    var links=linksOf(id),body='<div class="infogrid">'+Object.keys(obj).filter(function(k){return ["payload","timeline","options"].indexOf(k)<0&&typeof obj[k]!=="object"}).slice(0,12).map(function(k){return '<div class="info"><small>'+escapeHtml(k)+'</small><b>'+escapeHtml(obj[k])+'</b></div>'}).join("")+'</div><div class="label">Evidence Graph</div><div class="flow">'+(links.length?links.map(function(l){return '<span class="step '+(l.root?"done":"")+'">'+escapeHtml(describeId(l.from)+" → "+l.type+" → "+describeId(l.to))+'</span>'}).join(""):'<span class="step">رابطه‌ای ثبت نشده</span>')+'</div>';
    var m=document.getElementById("modal");if(m)m.innerHTML=sanitizeHtml('<div class="modalbg"><div class="modal"><div class="mh"><b>'+escapeHtml(id)+'</b><button class="close" data-kai="close">×</button></div><div class="mb">'+body+'</div></div></div>');
  }
  document.addEventListener("click",function(ev){
    var x=ev.target.closest("[data-kai-id],[data-kai]");if(!x)return;
    if(x.hasAttribute("data-kai-id"))openEvidence(x.getAttribute("data-kai-id"));
    if(x.getAttribute("data-kai")==="close"){var m=document.getElementById("modal");if(m)m.innerHTML=""}
  });

  function setupKernelSearch(){
    var input=document.getElementById("gsearch"),box=document.getElementById("searchres");if(!input||!box)return;
    input.oninput=function(){
      var q=input.value.trim().toLowerCase();if(q.length<3){box.classList.add("hidden");box.innerHTML="";return}
      var results=[];
      function add(kind,x,label){var hay=(x.id+" "+(x.title||"")+" "+(x.name||"")+" "+(x.type||"")+" "+(x.owner||"")).toLowerCase();if(hay.indexOf(q)>=0)results.push({kind:kind,id:x.id,title:x.title||x.name||x.type||x.id,label:label})}
      ["cases","actions","decisions","approvals","risks","events"].forEach(function(k){visible(k).forEach(function(x){add(k,x,k)})});
      allEntities().forEach(function(x){add("entity",x,x.type||"entity")});
      results=results.slice(0,10);
      box.innerHTML=results.length?results.map(function(r){return '<div class="sr" data-kai-search="'+escapeHtml(r.id)+'"><b>'+escapeHtml(r.title)+'</b><small>'+escapeHtml(r.id)+' · '+escapeHtml(r.label)+'</small></div>'}).join(""):'<div class="sr"><small>نتیجه‌ای در Kernel پیدا نشد.</small></div>';
      box.classList.remove("hidden");
    };
    box.addEventListener("click",function(ev){var r=ev.target.closest("[data-kai-search]");if(!r)return;openEvidence(r.getAttribute("data-kai-search"));input.value="";box.classList.add("hidden")});
  }

  var obs=new MutationObserver(function(){
    var h=document.querySelector("#content .head h2");
    if(h&&h.textContent.trim()==="دستیار هوشمند"){
      setTimeout(function(){
        var intro=document.querySelector("#aimsgs .msg.bot");
        if(intro&&!intro.dataset.kai){
          intro.dataset.kai="1";
          intro.innerHTML='<b>دستیار راهنمای نرم‌افزار:</b><br>درباره هر ماژول، منو، گزینه، فرم یا منطق سامانه سؤال کنید. پاسخ با ChatGPT و راهنمای جامع همین نرم‌افزار ساخته می‌شود و برای وضعیت جاری فقط از اطلاعات مجاز هسته مدیریتی استفاده می‌کند.<div class="quick"><button data-kai-prompt="ماژول تدارکات چه کاری انجام می‌دهد و با انبار چه ارتباطی دارد؟">راهنمای تدارکات</button><button data-kai-prompt="گزینه حیاتی در درخواست قطعه یعنی چه؟">گزینه حیاتی</button><button data-kai-prompt="موضوع مدیریتی چه تفاوتی با هشدار و اقدام دارد؟">منطق سامانه</button><button data-kai-prompt="چرا تولید امروز کمتر از برنامه بود؟">وضعیت تولید</button></div>';
        }
      },0);
    }
  });
  var c=document.getElementById("content");if(c)obs.observe(c,{childList:true,subtree:false});
  document.addEventListener("click",function(ev){var p=ev.target.closest("[data-kai-prompt]");if(p)ask(p.getAttribute("data-kai-prompt"))});
  var style=document.createElement("style");style.textContent=".kai-source{font-size:10px;color:#64748b;margin-bottom:8px}.kai-pack>div{margin-bottom:12px}.kai-pack p{margin:4px 0 8px;line-height:1.8}.kai-grid{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}.kai-grid>div{border:1px solid #e2e8f0;border-radius:10px;padding:9px;display:flex;flex-direction:column;gap:4px}.kai-grid small{color:#64748b}.kai-evidence{cursor:pointer;border:1px solid #bae6fd}.kai-evidence:hover{background:#e0f2fe}@media(max-width:640px){.kai-grid{grid-template-columns:1fr!important}}";document.head.appendChild(style);
  setupKernelSearch();
}

if(window.ManagementKernel&&window.ManagementKernel.version===2)init(window.ManagementKernel);
else{
  var ready=false;
  window.addEventListener("management-kernel:ready",function(ev){if(ready)return;ready=true;init((ev.detail&&ev.detail.kernel)||window.ManagementKernel)},{once:true});
  setTimeout(function(){if(!ready&&(!window.ManagementKernel||window.ManagementKernel.version!==2))showInitError("Kernel v2 در زمان مقرر آماده نشد.")},2000);
}
})();
