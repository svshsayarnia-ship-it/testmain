(function(){
"use strict";

var HRKEY="ard_hr_v2_store";
var defaultStore={
  performance:[
    {id:"PERF-Q2-41",employeeId:"EMP-41",name:"حسین مرادی",unit:"تولید",period:"۱۴۰۵-Q2",kpi:"تحقق برنامه شیفت",target:95,actual:88,score:88,status:"نیازمند بهبود"},
    {id:"PERF-Q2-57",employeeId:"EMP-57",name:"مهدی رضایی",unit:"تولید",period:"۱۴۰۵-Q2",kpi:"پایداری عملیات شیفت",target:92,actual:84,score:84,status:"قابل قبول"},
    {id:"PERF-Q2-22",employeeId:"EMP-22",name:"علی موسوی",unit:"تولید",period:"۱۴۰۵-Q2",kpi:"کیفیت اجرای برنامه",target:94,actual:91,score:91,status:"خوب"}
  ],
  training:[
    {id:"TR-41",employeeId:"EMP-41",name:"حسین مرادی",need:"رهبری تیم",course:"رهبری تیم و مدیریت شیفت",pre:62,post:82,impact:78,status:"اثربخش"},
    {id:"TR-57",employeeId:"EMP-57",name:"مهدی رضایی",need:"تصمیم‌گیری عملیاتی",course:"تصمیم‌گیری در عملیات",pre:58,post:76,impact:72,status:"نیازمند پیگیری"},
    {id:"TR-22",employeeId:"EMP-22",name:"علی موسوی",need:"مدیریت شیفت",course:"مدیریت پیشرفته شیفت",pre:64,post:88,impact:81,status:"اثربخش"}
  ],
  competency:[
    {id:"COMP-41-L",employeeId:"EMP-41",name:"حسین مرادی",role:"مدیر شیفت تولید",competency:"رهبری تیم",required:85,actual:74},
    {id:"COMP-41-D",employeeId:"EMP-41",name:"حسین مرادی",role:"مدیر شیفت تولید",competency:"تصمیم‌گیری",required:82,actual:76},
    {id:"COMP-57-L",employeeId:"EMP-57",name:"مهدی رضایی",role:"مدیر شیفت تولید",competency:"رهبری تیم",required:85,actual:79},
    {id:"COMP-57-D",employeeId:"EMP-57",name:"مهدی رضایی",role:"مدیر شیفت تولید",competency:"تصمیم‌گیری",required:82,actual:75},
    {id:"COMP-22-L",employeeId:"EMP-22",name:"علی موسوی",role:"مدیر شیفت تولید",competency:"رهبری تیم",required:85,actual:68},
    {id:"COMP-22-D",employeeId:"EMP-22",name:"علی موسوی",role:"مدیر شیفت تولید",competency:"تصمیم‌گیری",required:82,actual:72}
  ],
  experience:{"EMP-41":91,"EMP-57":73,"EMP-22":67},
  positions:[
    {id:"POS-14",title:"مدیر شیفت تولید",unit:"تولید",critical:true,risk:"High"},
    {id:"POS-08",title:"مدیر آزمایشگاه",unit:"کیفیت",critical:false,risk:"Low"}
  ],
  activeTab:"succession"
};

function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){
  try{
    var x=JSON.parse(localStorage.getItem(HRKEY)||"null");
    if(x && x.performance && x.training && x.competency) return x;
  }catch(e){}
  return clone(defaultStore);
}
var store=load();

function save(){
  localStorage.setItem(HRKEY,JSON.stringify(store));
}
function e(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fa(n){try{return new Intl.NumberFormat("fa-IR").format(n)}catch(_){return n}}
function avg(a){return a.length?Math.round(a.reduce(function(x,y){return x+y},0)/a.length):0}
function statusChip(text,tone){
  return '<span class="st '+(tone||"")+'">'+e(text)+'</span>';
}
function tabs(){
  var items=[["succession","جانشین‌پروری"],["performance","عملکرد"],["training","آموزش"],["competency","شایستگی"]];
  return '<div class="tabs hrx-tabs">'+items.map(function(x){
    return '<button class="tab '+(store.activeTab===x[0]?"active":"")+'" data-hrtab="'+x[0]+'">'+x[1]+'</button>';
  }).join("")+'</div>';
}
function scoreFor(emp){
  var p=store.performance.filter(function(x){return x.employeeId===emp}).map(function(x){return +x.score||0});
  var t=store.training.filter(function(x){return x.employeeId===emp}).map(function(x){return +x.post||0});
  var c=store.competency.filter(function(x){return x.employeeId===emp}).map(function(x){return +x.actual||0});
  var perf=avg(p),train=avg(t),comp=avg(c),exp=+store.experience[emp]||0;
  var total=Math.round(perf*.35+comp*.30+train*.20+exp*.15);
  var readiness=total>=85?"آماده اکنون":total>=75?"آماده ۶ ماهه":"نیازمند توسعه";
  var tone=total>=85?"ok":total>=75?"high":"critical";
  var gaps=store.competency.filter(function(x){return x.employeeId===emp}).map(function(x){return {name:x.competency,gap:Math.max(0,(+x.required||0)-(+x.actual||0))}}).sort(function(a,b){return b.gap-a.gap});
  return {perf:perf,train:train,comp:comp,exp:exp,total:total,readiness:readiness,tone:tone,gap:gaps[0]&&gaps[0].gap?gaps[0].name+" ("+gaps[0].gap+")":"بدون Gap بحرانی"};
}
function candidates(){
  return [
    {id:"EMP-41",name:"حسین مرادی"},
    {id:"EMP-57",name:"مهدی رضایی"},
    {id:"EMP-22",name:"علی موسوی"}
  ];
}
function meter(label,value){
  return '<div class="hrx-meter"><div><span>'+e(label)+'</span><b>'+fa(value)+'٪</b></div><div class="hrx-bar"><i style="width:'+Math.max(0,Math.min(100,value))+'%"></i></div></div>';
}
function summary(){
  var critical=store.positions.filter(function(x){return x.critical}).length;
  var noReady=candidates().filter(function(x){return scoreFor(x.id).readiness!=="آماده اکنون"}).length;
  var perfLow=store.performance.filter(function(x){return +x.score<85}).length;
  var gaps=store.competency.filter(function(x){return +x.actual<+x.required}).length;
  return '<div class="grid kpis hrx-kpis">'+
    '<div class="card kpi"><div class="kico">♙</div><div><div class="kl">پست کلیدی</div><div class="kv">'+fa(critical)+'</div><div class="kf">Critical Position</div></div></div>'+
    '<div class="card kpi red"><div class="kico">!</div><div><div class="kl">بدون Ready Now</div><div class="kv">'+fa(noReady)+'</div><div class="kf">نیازمند برنامه توسعه</div></div></div>'+
    '<div class="card kpi amber"><div class="kico">◎</div><div><div class="kl">عملکرد زیر ۸۵</div><div class="kv">'+fa(perfLow)+'</div><div class="kf">نیازمند بررسی</div></div></div>'+
    '<div class="card kpi"><div class="kico">◇</div><div><div class="kl">Gap شایستگی</div><div class="kv">'+fa(gaps)+'</div><div class="kf">از منبع شایستگی</div></div></div>'+
  '</div>';
}
function succession(){
  var pos=store.positions.map(function(p){
    return '<div class="att"><span class="dot '+(p.critical?"red":"")+'"></span><div style="flex:1"><h4>'+e(p.title)+'</h4><p>'+e(p.id)+' · '+e(p.unit)+'</p></div>'+statusChip(p.critical?"High":"Low",p.critical?"critical":"ok")+'</div>';
  }).join("");
  var cand=candidates().map(function(c){
    var s=scoreFor(c.id);
    return '<div class="att hrx-candidate"><div style="flex:1"><h4>'+e(c.name)+'</h4><p>'+e(c.id)+' · Gap اصلی: '+e(s.gap)+'</p><div class="meta"><span class="chip">عملکرد '+fa(s.perf)+'</span><span class="chip">شایستگی '+fa(s.comp)+'</span><span class="chip">آموزش '+fa(s.train)+'</span><span class="chip">تجربه '+fa(s.exp)+'</span></div>'+meter("Readiness Score",s.total)+'</div>'+statusChip(s.readiness,s.tone)+'</div>';
  }).join("");
  return '<div class="grid two"><div class="card panel"><div class="pt">پست‌های کلیدی</div><div class="ps">Position مستقل از Person است.</div>'+pos+
    '<div class="flow"><span class="step done">واحد</span><span>←</span><span class="step done">پست</span><span>←</span><span class="step done">Critical?</span><span>←</span><span class="step active">نامزدها</span><span>←</span><span class="step">Readiness</span></div></div>'+
    '<div class="card panel"><div class="ph"><div><div class="pt">نامزدهای POS-14</div><div class="ps">READ: Performance + Training + Competency + Experience</div></div><button class="btn primary" data-hraction="development">ساخت برنامه توسعه</button></div>'+cand+
    '<div class="option rec"><p><b>قاعده معماری:</b> جانشین‌پروری هیچ نمره عملکرد، آموزش یا شایستگی را دوباره ثبت نمی‌کند؛ فقط Readiness، Gap و Development Plan را تولید می‌کند.</p></div></div></div>';
}
function performance(){
  var rows=store.performance.map(function(x){
    var diff=(+x.actual)-(+x.target);
    return '<tr><td>'+e(x.id)+'</td><td><b>'+e(x.name)+'</b><small class="hrx-sub">'+e(x.employeeId)+'</small></td><td>'+e(x.period)+'</td><td>'+e(x.kpi)+'</td><td>'+fa(x.target)+'٪</td><td>'+fa(x.actual)+'٪</td><td>'+statusChip((diff>=0?"+":"")+fa(diff)+"٪",diff>=0?"ok":"high")+'</td><td>'+fa(x.score)+'</td><td><button class="btn sm" data-hraction="edit-performance" data-id="'+e(x.id)+'">ویرایش</button></td></tr>';
  }).join("");
  return '<div class="card panel"><div class="ph"><div><div class="pt">مدیریت عملکرد</div><div class="ps">Goal → KPI → Target → Actual → Variance → Corrective Action</div></div><button class="btn primary" data-hraction="new-performance">+ ثبت ارزیابی</button></div>'+
    '<div class="flow"><span class="step done">هدف سازمان</span><span>←</span><span class="step done">هدف واحد</span><span>←</span><span class="step active">KPI فردی</span><span>←</span><span class="step">انحراف</span><span>←</span><span class="step">اقدام اصلاحی</span></div>'+
    '<div class="tablewrap"><table class="tbl"><thead><tr><th>شناسه</th><th>کارمند</th><th>دوره</th><th>KPI</th><th>هدف</th><th>واقعی</th><th>انحراف</th><th>امتیاز</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div class="option"><p>خروجی این ماژول به آموزش، توسعه فردی و جانشین‌پروری خوانده می‌شود؛ Succession اجازه تغییر رکورد عملکرد را ندارد.</p></div></div>';
}
function training(){
  var rows=store.training.map(function(x){
    var gain=(+x.post)-(+x.pre);
    return '<tr><td>'+e(x.id)+'</td><td><b>'+e(x.name)+'</b><small class="hrx-sub">'+e(x.employeeId)+'</small></td><td>'+e(x.need)+'</td><td>'+e(x.course)+'</td><td>'+fa(x.pre)+'٪</td><td>'+fa(x.post)+'٪</td><td>'+statusChip((gain>=0?"+":"")+fa(gain)+"٪",gain>=15?"ok":"high")+'</td><td>'+fa(x.impact)+'٪</td><td>'+statusChip(x.status,/اثربخش/.test(x.status)?"ok":"high")+'</td><td><button class="btn sm" data-hraction="edit-training" data-id="'+e(x.id)+'">ویرایش</button></td></tr>';
  }).join("");
  return '<div class="card panel"><div class="ph"><div><div class="pt">آموزش و اثربخشی</div><div class="ps">Competency Gap → Need → Course → Learning → Post Assessment → Performance Impact</div></div><button class="btn primary" data-hraction="new-training">+ ثبت آموزش</button></div>'+
    '<div class="flow"><span class="step done">Gap</span><span>←</span><span class="step done">نیاز</span><span>←</span><span class="step active">دوره</span><span>←</span><span class="step">پس‌آزمون</span><span>←</span><span class="step">اثر بر عملکرد</span></div>'+
    '<div class="tablewrap"><table class="tbl"><thead><tr><th>شناسه</th><th>کارمند</th><th>نیاز</th><th>دوره</th><th>قبل</th><th>بعد</th><th>یادگیری</th><th>اثر عملکرد</th><th>وضعیت</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div class="option"><p>ثبت «حضور در کلاس» کافی نیست. اثربخشی آموزش باید با یادگیری و سپس تغییر عملکرد سنجیده شود.</p></div></div>';
}
function competency(){
  var rows=store.competency.map(function(x){
    var gap=Math.max(0,(+x.required)-(+x.actual));
    return '<tr><td>'+e(x.id)+'</td><td><b>'+e(x.name)+'</b><small class="hrx-sub">'+e(x.employeeId)+'</small></td><td>'+e(x.role)+'</td><td>'+e(x.competency)+'</td><td>'+fa(x.required)+'٪</td><td>'+fa(x.actual)+'٪</td><td>'+statusChip(fa(gap),gap===0?"ok":gap<=8?"high":"critical")+'</td><td><button class="btn sm" data-hraction="edit-competency" data-id="'+e(x.id)+'">ویرایش</button></td></tr>';
  }).join("");
  return '<div class="card panel"><div class="ph"><div><div class="pt">مدیریت شایستگی</div><div class="ps">Required Competency vs Actual Competency → Gap → Development Need</div></div><button class="btn primary" data-hraction="new-competency">+ ثبت ارزیابی</button></div>'+
    '<div class="grid three">'+
      '<div class="card rcode"><b>'+fa(store.competency.length)+'</b><small>ارزیابی فعال</small></div>'+
      '<div class="card rcode"><b>'+fa(store.competency.filter(function(x){return +x.actual<+x.required}).length)+'</b><small>Gap باز</small></div>'+
      '<div class="card rcode"><b>'+fa(avg(store.competency.map(function(x){return +x.actual||0})))+'٪</b><small>میانگین شایستگی</small></div>'+
    '</div>'+
    '<div class="tablewrap"><table class="tbl"><thead><tr><th>شناسه</th><th>کارمند</th><th>پست هدف</th><th>شایستگی</th><th>سطح لازم</th><th>سطح فعلی</th><th>Gap</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div class="option"><p>Gap شایستگی مستقیماً ورودی نیاز آموزشی و Readiness جانشینی است؛ داده در این ماژول مالکیت دارد.</p></div></div>';
}
function renderHR(tab){
  if(tab) store.activeTab=tab;
  save();
  var c=document.getElementById("content");
  if(!c) return;
  var body=store.activeTab==="performance"?performance():store.activeTab==="training"?training():store.activeTab==="competency"?competency():succession();
  c.innerHTML='<div id="hrx-root">'+
    '<div class="head"><div><h2>سرمایه انسانی</h2><p>منبع یکتای داده برای عملکرد، آموزش و شایستگی؛ جانشین‌پروری فقط مصرف‌کننده و تحلیل‌گر است.</p></div><div class="acts"><button class="btn" data-hraction="reset">بازنشانی داده نمونه</button></div></div>'+
    summary()+tabs()+body+
  '</div>';
}
function openModal(title,body,footer){
  var m=document.getElementById("modal");
  if(!m) return;
  m.innerHTML='<div class="modalbg hrx-modalbg"><div class="modal"><div class="mh"><b>'+e(title)+'</b><button class="close" data-hraction="close-modal">×</button></div><div class="mb">'+body+'</div><div class="mf">'+footer+'</div></div></div>';
}
function closeModal(){var m=document.getElementById("modal");if(m)m.innerHTML=""}
function peopleOptions(selected){
  return candidates().map(function(x){return '<option value="'+x.id+'" '+(x.id===selected?"selected":"")+'>'+e(x.name)+' — '+x.id+'</option>'}).join("");
}
function personName(id){var x=candidates().filter(function(p){return p.id===id})[0];return x?x.name:id}
function performanceForm(id){
  var x=store.performance.filter(function(r){return r.id===id})[0]||{id:"",employeeId:"EMP-41",period:"۱۴۰۵-Q3",kpi:"",target:90,actual:0,score:0,status:"جدید"};
  openModal(id?"ویرایش ارزیابی عملکرد":"ثبت ارزیابی عملکرد",
    '<div class="form"><div class="field"><label>کارمند</label><select id="hr-emp">'+peopleOptions(x.employeeId)+'</select></div><div class="field"><label>دوره</label><input id="hr-period" value="'+e(x.period)+'"></div><div class="field full"><label>KPI</label><input id="hr-kpi" value="'+e(x.kpi)+'" placeholder="مثلاً تحقق برنامه شیفت"></div><div class="field"><label>هدف</label><input id="hr-target" type="number" min="0" max="100" value="'+e(x.target)+'"></div><div class="field"><label>واقعی</label><input id="hr-actual" type="number" min="0" max="100" value="'+e(x.actual)+'"></div><div class="field"><label>امتیاز</label><input id="hr-score" type="number" min="0" max="100" value="'+e(x.score)+'"></div><input type="hidden" id="hr-id" value="'+e(x.id)+'"></div>',
    '<button class="btn primary" data-hraction="save-performance">ذخیره</button><button class="btn" data-hraction="close-modal">انصراف</button>');
}
function trainingForm(id){
  var x=store.training.filter(function(r){return r.id===id})[0]||{id:"",employeeId:"EMP-41",need:"",course:"",pre:0,post:0,impact:0,status:"نیازمند پیگیری"};
  openModal(id?"ویرایش آموزش":"ثبت آموزش و اثربخشی",
    '<div class="form"><div class="field"><label>کارمند</label><select id="hr-emp">'+peopleOptions(x.employeeId)+'</select></div><div class="field"><label>نیاز آموزشی</label><input id="hr-need" value="'+e(x.need)+'"></div><div class="field full"><label>دوره</label><input id="hr-course" value="'+e(x.course)+'"></div><div class="field"><label>پیش‌آزمون</label><input id="hr-pre" type="number" min="0" max="100" value="'+e(x.pre)+'"></div><div class="field"><label>پس‌آزمون</label><input id="hr-post" type="number" min="0" max="100" value="'+e(x.post)+'"></div><div class="field"><label>اثر بر عملکرد</label><input id="hr-impact" type="number" min="0" max="100" value="'+e(x.impact)+'"></div><input type="hidden" id="hr-id" value="'+e(x.id)+'"></div>',
    '<button class="btn primary" data-hraction="save-training">ذخیره</button><button class="btn" data-hraction="close-modal">انصراف</button>');
}
function competencyForm(id){
  var x=store.competency.filter(function(r){return r.id===id})[0]||{id:"",employeeId:"EMP-41",role:"مدیر شیفت تولید",competency:"",required:80,actual:0};
  openModal(id?"ویرایش ارزیابی شایستگی":"ثبت ارزیابی شایستگی",
    '<div class="form"><div class="field"><label>کارمند</label><select id="hr-emp">'+peopleOptions(x.employeeId)+'</select></div><div class="field"><label>پست هدف</label><input id="hr-role" value="'+e(x.role)+'"></div><div class="field full"><label>شایستگی</label><input id="hr-comp" value="'+e(x.competency)+'" placeholder="مثلاً رهبری تیم"></div><div class="field"><label>سطح لازم</label><input id="hr-required" type="number" min="0" max="100" value="'+e(x.required)+'"></div><div class="field"><label>سطح فعلی</label><input id="hr-actual" type="number" min="0" max="100" value="'+e(x.actual)+'"></div><input type="hidden" id="hr-id" value="'+e(x.id)+'"></div>',
    '<button class="btn primary" data-hraction="save-competency">ذخیره</button><button class="btn" data-hraction="close-modal">انصراف</button>');
}
function val(id){var x=document.getElementById(id);return x?x.value:""}
function num(id){return Math.max(0,Math.min(100,+val(id)||0))}
function notify(msg){
  var box=document.getElementById("toasts");
  if(!box)return;
  var x=document.createElement("div");x.className="toast";x.innerHTML="<b>"+e(msg)+"</b><small>اطلاعات جانشین‌پروری نیز بروزرسانی شد.</small>";box.appendChild(x);setTimeout(function(){x.remove()},3000);
}
function savePerformance(){
  var id=val("hr-id"),emp=val("hr-emp"),rec={id:id||"PERF-"+Date.now(),employeeId:emp,name:personName(emp),unit:"تولید",period:val("hr-period"),kpi:val("hr-kpi"),target:num("hr-target"),actual:num("hr-actual"),score:num("hr-score"),status:num("hr-score")>=90?"خوب":num("hr-score")>=80?"قابل قبول":"نیازمند بهبود"};
  var i=store.performance.findIndex(function(x){return x.id===id});if(i>=0)store.performance[i]=rec;else store.performance.push(rec);save();closeModal();renderHR("performance");notify("ارزیابی عملکرد ذخیره شد");
}
function saveTraining(){
  var id=val("hr-id"),emp=val("hr-emp"),post=num("hr-post"),pre=num("hr-pre"),impact=num("hr-impact"),rec={id:id||"TR-"+Date.now(),employeeId:emp,name:personName(emp),need:val("hr-need"),course:val("hr-course"),pre:pre,post:post,impact:impact,status:(post-pre)>=15&&impact>=70?"اثربخش":"نیازمند پیگیری"};
  var i=store.training.findIndex(function(x){return x.id===id});if(i>=0)store.training[i]=rec;else store.training.push(rec);save();closeModal();renderHR("training");notify("رکورد آموزش ذخیره شد");
}
function saveCompetency(){
  var id=val("hr-id"),emp=val("hr-emp"),rec={id:id||"COMP-"+Date.now(),employeeId:emp,name:personName(emp),role:val("hr-role"),competency:val("hr-comp"),required:num("hr-required"),actual:num("hr-actual")};
  var i=store.competency.findIndex(function(x){return x.id===id});if(i>=0)store.competency[i]=rec;else store.competency.push(rec);save();closeModal();renderHR("competency");notify("ارزیابی شایستگی ذخیره شد");
}
function development(){
  var rows=candidates().map(function(c){var s=scoreFor(c.id);return '<div class="att"><div style="flex:1"><h4>'+e(c.name)+'</h4><p>'+e(s.readiness)+' · Gap: '+e(s.gap)+'</p></div><span class="chip">هدف: Ready Now</span></div>'}).join("");
  openModal("برنامه توسعه جانشین‌ها",rows+'<div class="option rec"><p>این برنامه از Gap شایستگی، عملکرد و آموزش خوانده شده و هیچ رکورد منبعی را دوباره ایجاد نمی‌کند.</p></div>','<button class="btn primary" data-hraction="close-modal">ثبت در برنامه توسعه</button>');
}
document.addEventListener("click",function(ev){
  var t=ev.target.closest("[data-hrtab],[data-hraction]");
  if(!t)return;
  if(t.hasAttribute("data-hrtab")){ev.preventDefault();renderHR(t.getAttribute("data-hrtab"));return}
  var a=t.getAttribute("data-hraction"),id=t.getAttribute("data-id");
  if(a==="new-performance")performanceForm();
  if(a==="edit-performance")performanceForm(id);
  if(a==="save-performance")savePerformance();
  if(a==="new-training")trainingForm();
  if(a==="edit-training")trainingForm(id);
  if(a==="save-training")saveTraining();
  if(a==="new-competency")competencyForm();
  if(a==="edit-competency")competencyForm(id);
  if(a==="save-competency")saveCompetency();
  if(a==="development")development();
  if(a==="close-modal")closeModal();
  if(a==="reset"){store=clone(defaultStore);save();renderHR("succession");notify("داده نمونه سرمایه انسانی بازنشانی شد")}
});

var style=document.createElement("style");
style.textContent=".hrx-kpis{margin-bottom:13px}.hrx-sub{display:block;color:#64748b;margin-top:3px}.hrx-candidate{align-items:flex-start}.hrx-meter{margin-top:9px;max-width:420px}.hrx-meter>div:first-child{display:flex;justify-content:space-between;font-size:11px;color:#64748b}.hrx-bar{height:6px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-top:4px}.hrx-bar i{display:block;height:100%;background:#0f766e;border-radius:99px}.hrx-tabs{position:sticky;top:58px;z-index:4;background:#f8fafc;padding:6px 0}.hrx-modalbg .modal{max-width:760px}@media(max-width:720px){.hrx-tabs{overflow:auto;flex-wrap:nowrap}.hrx-tabs .tab{white-space:nowrap}.hrx-kpis{grid-template-columns:1fr 1fr!important}.hrx-candidate{display:block}.hrx-candidate>.st{display:inline-block;margin-top:8px}}";
document.head.appendChild(style);

var obs=new MutationObserver(function(){
  var c=document.getElementById("content");if(!c||c.querySelector("#hrx-root"))return;
  var h=c.querySelector(".head h2");
  if(h && h.textContent.trim()==="سرمایه انسانی") renderHR(store.activeTab||"succession");
});
var content=document.getElementById("content");
if(content)obs.observe(content,{childList:true,subtree:false});
})();