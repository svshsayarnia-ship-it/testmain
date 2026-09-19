(function(){
"use strict";

var UIKEY="ard_ops_depth_ui_v2";
var state={active:{}};
try{var saved=JSON.parse(localStorage.getItem(UIKEY)||"null");if(saved&&saved.active)state.active=saved.active}catch(e){}
function save(){localStorage.setItem(UIKEY,JSON.stringify({active:state.active}))}
function kernel(){return window.ManagementKernel&&window.ManagementKernel.version===2?window.ManagementKernel:null}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fa(n){try{return new Intl.NumberFormat("fa-IR").format(n)}catch(e){return n}}
function tone(t){return /Critical|بحران|P1|بالا|قرمز/.test(t)?"critical":/High|هشدار|متوسط|P2|تاخیر|ریسک/.test(t)?"high":/سالم|Completed|سبز|عادی|پایین/.test(t)?"ok":"wait"}
function st(t){return '<span class="st '+tone(t)+'">'+esc(t)+'</span>'}
function chip(t){return '<span class="chip">'+esc(t)+'</span>'}
function toast(a,b){var box=document.getElementById("toasts");if(!box)return;var x=document.createElement("div");x.className="toast";x.innerHTML="<b>"+esc(a)+"</b>"+(b?"<small>"+esc(b)+"</small>":"");box.appendChild(x);setTimeout(function(){x.remove()},3200)}
function modal(title,body,foot){var m=document.getElementById("modal");if(!m)return;m.innerHTML='<div class="modalbg od-modalbg"><div class="modal"><div class="mh"><b>'+title+'</b><button class="close" data-od="close">×</button></div><div class="mb">'+body+'</div>'+(foot?'<div class="mf">'+foot+'</div>':'')+'</div></div>'}
function closeModal(){var m=document.getElementById("modal");if(m)m.innerHTML=""}
function table(headers,rows){return '<div class="tablewrap"><table class="tbl"><thead><tr>'+headers.map(function(h){return '<th>'+h+'</th>'}).join("")+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>'}
function kpis(items){return '<div class="grid kpis od-kpis">'+items.map(function(x,i){return '<div class="card kpi '+(x[3]||"")+'"><div class="kico">'+(["◉","◆","✓","⚠"][i%4])+'</div><div><div class="kl">'+esc(x[0])+'</div><div class="kv">'+esc(x[1])+'</div><div class="kf">'+esc(x[2]||"")+'</div></div></div>'}).join("")+'</div>'}
function flow(items){return '<div class="flow od-flow">'+items.map(function(x,i){return '<span class="step '+(i<2?"done":i===2?"active":"")+'">'+esc(x)+'</span>'+(i<items.length-1?'<span>←</span>':'')}).join("")+'</div>'}
function hasCentralRecords(c){return !!(window.ModuleRecordsV2&&window.ModuleRecordsV2.modules&&window.ModuleRecordsV2.modules[c.key])}
function recordTable(c){return hasCentralRecords(c)?window.ModuleRecordsV2.renderTable(c.key):table(c.records[0],c.records[1].map(function(r){return r.map(function(v){return esc(v)})}))}
function head(c){return '<div class="head"><div><h2>'+esc(c.title)+'</h2><p>'+esc(c.subtitle)+'</p></div><div class="acts">'+(hasCentralRecords(c)?'<button class="btn primary" data-mrv2="new" data-key="'+c.key+'">+ ثبت داده عملیاتی</button>':'')+'<button class="btn" data-od="module-action" data-key="'+c.key+'">+ اقدام</button><button class="btn" data-od="new-event" data-key="'+c.key+'">Event دستی</button></div></div>'}
function tabs(c){var a=state.active[c.key]||"overview",items=[["overview","نمای کلی"],["ops","عملیات"],["flow","فرایند و کنترل"],["rules","Exception / Rule"],["deps","ارتباطات"],["reports","KPI و گزارش"]];return '<div class="tabs od-tabs">'+items.map(function(x){return '<button class="tab '+(a===x[0]?"active":"")+'" data-od="tab" data-key="'+c.key+'" data-tab="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</div>'}
function areaCards(c){return '<div class="grid od-areas">'+c.areas.map(function(a){return '<div class="card panel od-area"><div class="pt">'+esc(a[0])+'</div><div class="ps">'+esc(a[1])+'</div><div class="meta">'+chip("Owner: "+a[2])+chip("Source: "+a[3])+'</div></div>'}).join("")+'</div>'}
function exceptionCards(c){return c.exceptions.map(function(x,i){return '<div class="att od-ex"><span class="dot '+(tone(x[2])==="critical"?"red":"amber")+'"></span><div style="flex:1"><h4>'+esc(x[0])+'</h4><p>'+esc(x[1])+'</p><div class="meta">'+chip(x[2])+chip("Owner: "+x[3])+chip(x[4])+'</div></div><button class="btn sm" data-od="run-rule" data-key="'+c.key+'" data-idx="'+i+'">اجرای Rule</button></div>'}).join("")}
function actionList(c){var K=kernel(),a=K?K.query("actions").filter(function(x){return x.module===c.key&&!/Completed|Verified|Cancelled/.test(x.status)}):[];if(!a.length)return '<div class="option"><p>Action فعالی در Kernel برای این ماژول ثبت نشده است.</p></div>';return a.map(function(x){return '<div class="att"><span class="dot '+(/P0|P1/.test(x.priority)?"red":"amber")+'"></span><div style="flex:1"><h4>'+esc(x.title)+'</h4><p>'+esc(x.owner)+' · '+new Date(x.dueAt).toLocaleString("fa-IR")+'</p></div>'+st(x.status)+' <button class="btn sm" data-od="complete-action" data-id="'+x.id+'">تکمیل</button></div>'}).join("")}
function renderOverview(c){
  return kpis(c.kpis)+
    '<div class="grid two"><div class="card panel"><div class="ph"><div><div class="pt">صف توجه عملیاتی</div><div class="ps">مواردی که از وضعیت عادی خارج شده‌اند</div></div></div>'+exceptionCards(c)+'</div>'+
    '<div class="card panel"><div class="pt">معماری عملیاتی ماژول</div><div class="ps">هر زیرحوزه Owner و Source مشخص دارد.</div>'+areaCards(c)+'</div></div>'+
    '<div class="card panel" style="margin-top:13px"><div class="pt">جریان اصلی</div><div class="ps">'+esc(c.flowDesc)+'</div>'+flow(c.process)+'</div>'+
    '<div class="card panel" style="margin-top:13px"><div class="ph"><div><div class="pt">رکوردهای عملیاتی</div><div class="ps">'+(hasCentralRecords(c)?'Source: Management Kernel Business Record Store · تغییر داده → Event خودکار':'داده نمایشی')+'</div></div>'+(hasCentralRecords(c)?'<button class="btn sm" data-mrv2="new" data-key="'+c.key+'">+ رکورد</button>':'')+'</div>'+recordTable(c)+'</div>'
}
function renderOps(c){
  return '<div class="card panel"><div class="ph"><div><div class="pt">زیرماژول‌ها و مسئولیت داده</div><div class="ps">ثبت داده فقط در Source اصلی؛ استفاده در سایر ماژول‌ها به‌صورت Read</div></div></div>'+areaCards(c)+'</div>'+
    '<div class="card panel" style="margin-top:13px"><div class="ph"><div><div class="pt">رکوردها و عملیات جاری</div><div class="ps">'+(hasCentralRecords(c)?'Single Source of Truth: Kernel':'Legacy View')+'</div></div>'+(hasCentralRecords(c)?'<button class="btn primary sm" data-mrv2="new" data-key="'+c.key+'">+ ثبت داده</button>':'')+'</div>'+recordTable(c)+'</div>'+
    '<div class="card panel" style="margin-top:13px"><div class="ph"><div><div class="pt">اقدامات ماژول</div><div class="ps">Action باید Owner + Deadline + Expected Result داشته باشد.</div></div><button class="btn primary" data-od="module-action" data-key="'+c.key+'">+ اقدام جدید</button></div>'+actionList(c)+'</div>'
}
function renderFlow(c){
  return '<div class="card panel"><div class="pt">فرایند End-to-End</div><div class="ps">'+esc(c.flowDesc)+'</div>'+flow(c.process)+'</div>'+
    '<div class="grid two" style="margin-top:13px"><div class="card panel"><div class="pt">نقاط کنترل</div>'+c.controls.map(function(x){return '<div class="att"><span class="dot '+(x[2]==="Gate"?"red":"")+'"></span><div style="flex:1"><h4>'+esc(x[0])+'</h4><p>'+esc(x[1])+'</p></div>'+chip(x[2])+'</div>'}).join("")+'</div>'+
    '<div class="card panel"><div class="pt">State Model</div><div class="ps">وضعیت‌ها باید قابل Audit باشند.</div>'+c.states.map(function(x){return '<span class="chip od-state">'+esc(x)+'</span>'}).join("")+'</div></div>'+
    '<div class="card panel" style="margin-top:13px"><div class="pt">منطق Exception</div><div class="rules od-engine">'+["EVENT","VALIDATE","DEDUP","CONTEXT","IMPACT","URGENCY","RESPONSE","OWNER","ACTION/CASE","DECISION","NOTIFY","SLA","ESCALATE","VERIFY"].map(function(x,i){return '<span class="rn">'+x+'</span>'+(i<13?'<span class="arr">←</span>':'')}).join("")+'</div></div>'
}
function renderRules(c){
  return '<div class="grid two"><div class="card panel"><div class="pt">Exception Queue</div><div class="ps">رویداد مهم ≠ تصمیم مدیرعامل. ابتدا Rule و Existing Response بررسی می‌شود.</div>'+exceptionCards(c)+'</div>'+
    '<div class="card panel"><div class="pt">Rule Matrix ماژول</div>'+table(["Event","Condition","Output","Notify"],c.rules.map(function(r){return [esc(r[0]),esc(r[1]),st(r[2]),esc(r[3])] }))+'</div></div>'+
    '<div class="card panel" style="margin-top:13px"><div class="pt">آخرین اجراهای Rule Engine</div>'+renderExecutions(c.key)+'</div>'
}
function renderExecutions(key){var K=kernel(),a=K?K.query("events").filter(function(x){return x.module===key}).slice(-6).reverse():[];if(!a.length)return '<div class="option"><p>هنوز Event پردازش‌شده‌ای برای این ماژول در Kernel نیست.</p></div>';return a.map(function(x){return '<div class="att"><span class="dot '+(tone(x.severity)==="critical"?"red":"amber")+'"></span><div style="flex:1"><h4>'+esc(x.type)+'</h4><p>'+new Date(x.updatedAt||x.createdAt).toLocaleString("fa-IR")+' · '+esc(x.context||"")+' · Occurrences: '+esc(x.occurrences||1)+'</p></div>'+st(x.severity)+'</div>'}).join("")}
function renderDeps(c){
  return '<div class="card panel"><div class="pt">Dependency Graph</div><div class="ps">این ماژول مستقل نیست؛ تغییرات مهم باید اثر خود را در واحدهای مرتبط منتقل کنند.</div>'+c.dependencies.map(function(d){return '<div class="od-dep"><div><b>'+esc(c.title)+'</b><small>'+esc(d[0])+'</small></div><span>←</span><div><b>'+esc(d[1])+'</b><small>'+esc(d[2])+'</small></div></div>'}).join("")+'</div>'+
    '<div class="card panel" style="margin-top:13px"><div class="pt">Correlation Rules</div>'+c.correlations.map(function(x){return '<div class="option '+(x[2]==="Root"?"rec":"")+'"><p><b>'+esc(x[0])+'</b><br>'+esc(x[1])+' · '+esc(x[2])+'</p></div>'}).join("")+'</div>'
}
function renderReports(c){
  return '<div class="grid kpis od-kpis">'+c.kpis.map(function(x,i){return '<div class="card kpi"><div class="kico">'+(["◉","◆","✓","⚠"][i%4])+'</div><div><div class="kl">'+esc(x[0])+'</div><div class="kv">'+esc(x[1])+'</div><div class="kf">'+esc(x[2]||"")+'</div></div></div>'}).join("")+'</div>'+
    '<div class="card panel"><div class="pt">KPI Dictionary</div><div class="ps">تعریف KPI در کل سازمان باید یکسان باشد.</div>'+table(["KPI","تعریف","مالک","تناوب","هدف"],c.kpiDict.map(function(r){return r.map(esc)}))+'</div>'+
    '<div class="grid three" style="margin-top:13px"><div class="card panel"><div class="pt">Daily</div><div class="ps">Exception + Actions + Decisions</div></div><div class="card panel"><div class="pt">Weekly</div><div class="ps">Trend + Recurrence + Risk</div></div><div class="card panel"><div class="pt">Monthly</div><div class="ps">Performance + Learning + Capacity</div></div></div>'
}
function renderModule(c){
  state.active[c.key]=state.active[c.key]||"overview";save();
  var body=state.active[c.key]==="ops"?renderOps(c):state.active[c.key]==="flow"?renderFlow(c):state.active[c.key]==="rules"?renderRules(c):state.active[c.key]==="deps"?renderDeps(c):state.active[c.key]==="reports"?renderReports(c):renderOverview(c);
  var content=document.getElementById("content");if(!content)return;
  content.innerHTML='<div id="od-root" data-key="'+c.key+'">'+head(c)+kpis(c.kpis)+tabs(c)+body+'</div>';
}
function runRule(c,idx){
  var x=c.exceptions[idx],r=c.rules[idx%c.rules.length],when=new Date().toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"});
  var out=r[2];
  var chain=["Event: "+r[0],"Validate ✓","Context: "+x[1],"Existing Response: "+x[4],"Owner: "+x[3],"Output: "+out];
  modal("اجرای Rule — "+c.title,'<div class="rules od-engine">'+chain.map(function(v,i){return '<span class="rn '+(i===chain.length-1?"active":"")+'">'+esc(v)+'</span>'+(i<chain.length-1?'<span class="arr">←</span>':'')}).join("")+'</div><div class="infogrid"><div class="info"><small>Severity</small><b>'+esc(x[2])+'</b></div><div class="info"><small>Owner</small><b>'+esc(x[3])+'</b></div><div class="info"><small>Existing Response</small><b>'+esc(x[4])+'</b></div><div class="info"><small>Engine Output</small><b>'+esc(out)+'</b></div></div><div class="option rec"><p>اعلان فقط زمانی ساخته می‌شود که Awareness ارزش مدیریتی داشته باشد؛ Action و Decision موجودیت جدا هستند.</p></div>','<button class="btn primary" data-od="close">بستن</button>');
  toast("Rule اجرا شد",out);
}
function actionForm(c){
  modal("اقدام جدید — "+c.title,'<div class="form"><div class="field full"><label>عنوان اقدام</label><input id="od-at" placeholder="اقدام مشخص و قابل انجام"></div><div class="field"><label>مسئول</label><input id="od-ao" value="'+esc(c.defaultOwner)+'"></div><div class="field"><label>مهلت</label><input id="od-ad" value="امروز ۱۷:۰۰"></div><div class="field full"><label>نتیجه مورد انتظار</label><textarea id="od-ar">رفع انحراف و ثبت نتیجه قابل Verification</textarea></div></div>','<button class="btn primary" data-od="save-action" data-key="'+c.key+'">ثبت Action</button><button class="btn" data-od="close">انصراف</button>')
}
function newEvent(c){
  modal("ثبت Event — "+c.title,'<div class="form"><div class="field full"><label>Event Type</label><input id="od-ev" value="'+esc(c.key)+'.Exception"></div><div class="field"><label>Severity</label><select id="od-sev"><option>S2</option><option>S3</option><option>S4</option><option>S5</option></select></div><div class="field"><label>Impact</label><select id="od-imp"><option>I2</option><option>I3</option><option>I4</option><option>I5</option></select></div><div class="field full"><label>Context</label><textarea id="od-ctx">شرح رویداد و اثر عملیاتی</textarea></div></div>','<button class="btn primary" data-od="save-event" data-key="'+c.key+'">Validate و ارزیابی</button><button class="btn" data-od="close">انصراف</button>')
}
function val(id){var x=document.getElementById(id);return x?x.value:""}
function saveAction(c){var K=kernel();if(!K){toast("Kernel در دسترس نیست");return}try{var dueText=val("od-ad"),dueMs=6*60*60*1000;var a=K.createManualAction({module:c.key,title:val("od-at")||"اقدام جدید",owner:val("od-ao"),dueMs:dueMs,expectedResult:val("od-ar"),priority:"P3"});closeModal();renderModule(c);toast("Action در Kernel ثبت شد",a.id)}catch(e){toast("ثبت Action ناموفق",e.message)}}
function saveEvent(c){closeModal();state.active[c.key]="rules";save();renderModule(c);toast("Event برای پردازش به Management Kernel ارسال شد")}
function completeAction(id){var K=kernel();if(!K)return;try{var a=K.completeAction(id,false);var c=a&&configs[a.module];if(c)renderModule(c);toast("Action در Kernel تکمیل شد","برای Case بحرانی هنوز Verification لازم است")}catch(e){toast("تکمیل Action ناموفق",e.message)}}

var configs={
production:{
 key:"production",title:"تولید و برنامه‌ریزی",subtitle:"از برنامه تولید تا گزارش شیفت، توقف، ضایعات، بهره‌وری و Root Cause.",
 defaultOwner:"مدیر تولید",
 kpis:[["تحقق برنامه","۹۲٪","۴۱۴ از ۴۵۰ تن","amber"],["توقف امروز","۳۲ دقیقه","الویتور خط ۲","red"],["ضایعات","۱.۷٪","هدف ≤ ۱.۵٪","amber"],["OEE","۸۴٪","هدف ۸۸٪",""]],
 areas:[["برنامه تولید","هدف روز/شیفت و توالی سفارش","مدیر تولید","Production Plan"],["تولید واقعی","Actual، Yield و ثبت شیفت","سرپرست شیفت","Shift Report"],["توقفات","علت، تجهیز، مدت و Root Event","مدیر تولید","Downtime Log"],["ضایعات","نوع، مقدار، علت و اقدام","کنترل تولید","Waste Log"],["بهره‌وری","OEE، ظرفیت و راندمان","مدیر تولید","KPI Engine"],["گزارش شیفت","خروجی، مشکل، تحویل شیفت","سرپرست شیفت","Shift Handover"]],
 process:["برنامه","آماده‌سازی","تولید شیفت","کنترل کیفیت","ثبت Actual","Variance","Corrective Action"],
 flowDesc:"Plan → Actual → Variance → Cause → Corrective Action. توقف باید به Root Event تعمیرات/مواد متصل شود.",
 records:[["شیفت","برنامه","واقعی","انحراف","توقف","علت","وضعیت"],[["صبح","۱۵۰ تن","۱۴۶ تن","-۴","۰","—","عادی"],["عصر","۱۵۰ تن","۱۲۵ تن","-۲۵","۳۲ دقیقه","الویتور خط ۲","High"],["شب","۱۵۰ تن","۱۴۳ تن","-۷","۸ دقیقه","تنظیم خط","هشدار"]]],
 controls:[["Release تولید","مواد، برنامه و تجهیز آماده باشد","Gate"],["ثبت Downtime","مدت > ۵ دقیقه علت اجباری","Control"],["Variance Review","انحراف > Threshold نیازمند علت","Gate"],["Shift Handover","کار باز به شیفت بعد منتقل شود","Control"]],
 states:["Planned","Released","Running","Interrupted","Completed","Reviewed","Closed"],
 exceptions:[["کاهش تحقق برنامه","Actual = 92% و زیر Target","High","مدیر تولید","Maintenance Case موجود"],["توقف خط ۲","۳۲ دقیقه توقف تجهیز بحرانی","Critical","مدیر فنی","WO-529 فعال"],["ضایعات بالاتر از هدف","۱.۷٪ در برابر ۱.۵٪","Medium","کنترل تولید","No Response"]],
 rules:[["Production.TargetMissed","Variance > 5% و علت معتبر","Action + Case","مدیر تولید"],["Production.DowntimeExceeded","Critical Asset + Downtime > 30m","Executive Awareness","مدیرعامل فقط Awareness"],["Production.WasteHigh","Waste > Target برای ۲ شیفت","Corrective Action","سرپرست + مدیر"]],
 dependencies:[["Downtime","فنی و نگهداری","Root Event و Work Order"],["Material Shortage","انبار/تدارکات","Coverage و ETA"],["Batch Hold","آزمایشگاه","Release/Hold روی بارگیری"],["Overtime Cost","مالی","اثر هزینه‌ای انحراف"]],
 correlations:[["Maintenance.AssetFailed → Production.Downtime","خرابی تجهیز Root Event است؛ TargetMissed Impact Event","Root"],["Inventory.StockOut → Production.Interruption","کمبود قطعه/مواد می‌تواند علت توقف شود","Impact"]],
 kpiDict:[["Plan Attainment","Actual / Plan","مدیر تولید","هر شیفت","≥ 98٪"],["Downtime","جمع دقیقه توقف","مدیر تولید","روزانه","< ۳۰ دقیقه"],["Waste Rate","Waste / Input","کنترل تولید","روزانه","≤ ۱.۵٪"],["OEE","Availability×Performance×Quality","مدیر تولید","روزانه","≥ ۸۸٪"]]
},
wheat:{
 key:"wheat",title:"گندم و سیلوها",subtitle:"تأمین گندم، ورود، موجودی سیلو، کیفیت ورودی، خواب موجودی و برنامه اختلاط.",defaultOwner:"مدیر سیلو",
 kpis:[["پوشش گندم","۴۳ روز","بر اساس مصرف جاری","green"],["موجودی کل","۶,۸۲۰ تن","۶ سیلو فعال",""],["افت ورودی","۰.۸٪","داخل حد","green"],["سیلوی پرریسک","۱","خواب موجودی","amber"]],
 areas:[["ورود گندم","نوبت، باسکول و پذیرش","مسئول باسکول","Weighbridge"],["سیلوها","ظرفیت، موجودی، عمر و گردش","مدیر سیلو","Silo Master"],["کیفیت ورودی","رطوبت، پروتئین و افت","آزمایشگاه","Incoming QC"],["اختلاط","Recipe و مصرف هر سیلو","مدیر تولید","Blend Plan"],["تأمین","قرارداد، محموله و ETA","تدارکات","Supply Plan"],["خواب موجودی","Aging و FIFO","مدیر سیلو","Inventory Aging"]],
 process:["ورود کامیون","باسکول اول","نمونه‌برداری","قبول/رد","تخلیه در سیلو","باسکول دوم","موجودی/Batch"],
 flowDesc:"ورود بدون QC Release نباید به موجودی قابل مصرف تبدیل شود؛ Batch و خاستگاه باید قابل ردیابی باشد.",
 records:[["سیلو","موجودی","ظرفیت","عمر متوسط","کیفیت","مصرف روزانه","وضعیت"],[["S-01","۱,۳۲۰","۱,۵۰۰","۱۸ روز","A","۹۰ تن","عادی"],["S-02","۱,۴۵۰","۱,۵۰۰","۴۷ روز","B","۴۰ تن","ریسک Aging"],["S-03","۹۸۰","۱,۵۰۰","۱۲ روز","A","۱۲۰ تن","عادی"]]],
 controls:[["Incoming QC","قبل از تخلیه Release لازم است","Gate"],["Silo Capacity","Overfill ممنوع","Gate"],["FIFO/Aging","خواب > Threshold هشدار","Control"],["Blend Recipe","مصرف مطابق برنامه اختلاط","Control"]],
 states:["Scheduled","Arrived","Sampling","Accepted","Rejected","Unloaded","Stored","Consumed"],
 exceptions:[["خواب موجودی S-02","۴۷ روز بالاتر از حد هدف","High","مدیر سیلو","Blend Plan موجود"],["کاهش پوشش گندم","پوشش به زیر حد سیاست نزدیک شود","Medium","تدارکات","Supply Plan فعال"],["عدم انطباق ورودی","QC خارج Spec","High","مدیر کیفیت","Hold محموله"]],
 rules:[["Wheat.AgingHigh","Age > Threshold","Blend Action","مدیر سیلو"],["Wheat.CoverageLow","Coverage < Reorder Coverage","Procurement Case","تدارکات"],["Wheat.IncomingQCFail","Spec Failure","Hold + Supplier Action","کیفیت"]],
 dependencies:[["Incoming Quality","آزمایشگاه","Release/Reject"],["Coverage","تدارکات","برنامه تأمین و ETA"],["Blend","تولید","مصرف سیلو و کیفیت آرد"],["Inventory Value","مالی","Exposure موجودی"]],
 correlations:[["Wheat.CoverageLow → Procurement.Need","کمبود آینده قبل از Stockout باید دیده شود","Root"],["IncomingQCFail → Supplier.Performance","عدم‌انطباق باید در امتیاز تأمین‌کننده اثر بگذارد","Impact"]],
 kpiDict:[["Wheat Coverage","Stock / Daily Consumption","مدیر سیلو","روزانه","≥ ۳۰ روز"],["Incoming Rejection","Rejected / Received","کیفیت","هفتگی","< ۲٪"],["Silo Aging","Average Days in Silo","مدیر سیلو","روزانه","< ۴۵ روز"],["Shrinkage","Weight Difference / Input","مدیر سیلو","روزانه","≤ ۱٪"]]
},
quality:{
 key:"quality",title:"آزمایشگاه و کیفیت",subtitle:"نمونه‌برداری، آزمون، Release/Hold، عدم‌انطباق، CAPA، شکایت و ردیابی بچ.",defaultOwner:"مدیر کیفیت",
 kpis:[["قبولی بچ","۹۶٪","ماه جاری","green"],["Batch Hold","۲","منتظر تأیید","amber"],["NCR باز","۱","نیازمند CAPA","amber"],["شکایت کیفی","۰","۳۰ روز اخیر","green"]],
 areas:[["نمونه‌برداری","ورودی، حین تولید، محصول نهایی","آزمایشگاه","Sample Register"],["آزمون‌ها","Spec و Result","کارشناس آزمایشگاه","Test Result"],["Batch Release","Release/Hold/Reject","مدیر آزمایشگاه","Batch Status"],["عدم‌انطباق","NCR و Root Cause","مدیر کیفیت","NCR"],["CAPA","اصلاحی و پیشگیرانه","مدیر کیفیت","CAPA"],["شکایات","Customer Complaint و Trace","QA","Complaint"]],
 process:["Sample","Test","Compare Spec","Release/Hold","NCR","CAPA","Verification"],
 flowDesc:"هر Batch تا تأیید کیفیت نباید به بارگیری آزاد شود؛ NCR باید به CAPA و Verification برسد.",
 records:[["Batch","محصول","نتیجه","وضعیت","وابستگی","مالک","SLA"],[["B-2405","آرد ستاره","در انتظار","Hold","بارگیری ORD-91","مدیر آزمایشگاه","امروز ۱۳:۰۰"],["B-2406","آرد خبازی","در انتظار","Hold","بارگیری ORD-94","مدیر آزمایشگاه","امروز ۱۳:۳۰"],["B-2402","آرد ستاره","قبول","Released","—","QA","Completed"]]],
 controls:[["Sample Integrity","نمونه معتبر و قابل ردیابی","Gate"],["Spec Comparison","نتیجه خارج Spec = Hold","Gate"],["Batch Release","فقط نقش مجاز Release کند","Gate"],["CAPA Verification","Completed ≠ Effective","Control"]],
 states:["Sampled","Testing","Pass","Hold","Rejected","Released","CAPA Open","Verified"],
 exceptions:[["دو Batch در Hold","بارگیری وابسته و SLA نزدیک","High","مدیر آزمایشگاه","Testing In Progress"],["NCR تکراری","علت مشابه در ۳ Batch","High","مدیر کیفیت","CAPA باز"],["آزمون خارج Spec","پارامتر رطوبت خارج حد","Critical","QA","Batch Hold"]],
 rules:[["Quality.BatchHold","Hold + Shipment Dependency","Action + Manager Alert","کیفیت/فروش"],["Quality.NCRRepeated","Same Cause >= 3","Problem + RCA","مدیر کیفیت"],["Quality.SpecFail","Critical Spec Fail","Hold + Case","کیفیت"]],
 dependencies:[["Batch Release","فروش/لجستیک","اجازه بارگیری"],["Incoming QC","گندم و سیلو","قبول/رد محموله"],["NCR Cause","تولید","Corrective Action"],["Complaint","فروش","Traceability تا Batch"]],
 correlations:[["Quality.BatchHold → Sales.ShipmentBlocked","Hold علت توقف بارگیری است","Root"],["RepeatedNCR → Production.ProcessIssue","تکرار کیفیت باید Problem تلقی شود","Impact"]],
 kpiDict:[["Batch Pass Rate","Passed / Tested","مدیر کیفیت","روزانه","≥ 97٪"],["Lab SLA","On-time Tests / Total","مدیر آزمایشگاه","روزانه","≥ 95٪"],["NCR Closure","Closed NCR / Opened","QA","هفتگی","≥ 90٪"],["Complaint Rate","Complaints / Shipments","کیفیت","ماهانه","< ۰.۵٪"]]
},
inventory:{
 key:"inventory",title:"انبار و لجستیک",subtitle:"Item Master، موجودی، رسید/خروج، رزرو، انتقال، انبارگردانی، مغایرت و نقطه سفارش.",defaultOwner:"مدیر انبار",
 kpis:[["اقلام زیر Safety","۳","۲ قلم حیاتی","red"],["Stockout","۱","ITEM-6205","red"],["مغایرت انبار","۲","در بررسی","amber"],["دقت موجودی","۹۸.۷٪","ماه جاری","green"]],
 areas:[["Item Master","کد، گروه، UOM و Lead Time","مدیر انبار","Item Master"],["موجودی","On Hand/Reserved/Available","انباردار","Stock Ledger"],["رسید و خروج","GRN و Issue","انباردار","Inventory Tx"],["رزرو","Work Order/Production Reservation","سرپرست انبار","Reservation"],["انبارگردانی","Count و Variance","مدیر انبار","Stock Count"],["نقطه سفارش","Min/Max/Safety/ROP","برنامه‌ریز","Reorder Policy"]],
 process:["Need/Receipt","Transaction","Balance","Coverage","ROP Check","Existing PR/PO","Action/Case"],
 flowDesc:"Low Stock ابتدا باید PR/PO باز و ETA را بررسی کند؛ اگر Existing Response کافی است Action جدید نسازد.",
 records:[["کالا","On Hand","Reserved","Available","Safety","Coverage","ETA","وضعیت"],[["ITEM-6205","۰","۰","۰","۸","۰ روز","۵ روز","Critical"],["ITEM-B90","۳","۱","۲","۷","۷ روز","۹ روز","High"],["ITEM-F11","۵","۰","۵","۱۰","۱۶ روز","۱۲ روز","هشدار"]]],
 controls:[["Negative Stock","موجودی منفی ممنوع","Gate"],["Critical Issue","خروج قطعه حیاتی با Related Entity","Control"],["Count Variance","مغایرت > Threshold نیازمند تأیید","Gate"],["ROP Check","PR/PO باز قبل از درخواست جدید","Control"]],
 states:["Available","Reserved","Issued","In Transit","Quarantine","Count Hold","Stockout"],
 exceptions:[["Stockout رولبرینگ","Coverage صفر و ETA پنج روز","Critical","مدیر انبار","PO-881 ناکافی"],["تسمه زیر Safety","Coverage < ETA","High","مدیر تدارکات","PO باز"],["مغایرت شمارش","Variance دو قلم بالاتر از حد","Medium","مدیر انبار","Recount"]],
 rules:[["Inventory.Stockout","Critical Item + Available = 0","Case + Procurement Action","انبار/تدارکات"],["Inventory.LowStock","Coverage < ETA","Action + Risk","تدارکات"],["Inventory.CountVariance","Variance > Tolerance","Approval + Audit","مدیر انبار"]],
 dependencies:[["Parts Need","فنی و نگهداری","WO Reservation"],["Material Need","تولید","Production Reservation"],["Reorder","تدارکات","PR/RFQ/PO"],["Valuation","مالی","ارزش موجودی"]],
 correlations:[["Inventory.Stockout → Maintenance.Blocked","نبود قطعه می‌تواند WO را Block کند","Root"],["Coverage<ETA → ProductionRisk","ریسک قبل از Stockout شکل می‌گیرد","Impact"]],
 kpiDict:[["Inventory Accuracy","Correct Count / Total","مدیر انبار","ماهانه","≥ 99٪"],["Stockout Count","Critical Stockouts","مدیر انبار","روزانه","۰"],["Coverage","Available / Consumption","برنامه‌ریز","روزانه","طبق Policy"],["Slow Moving","Aged Items / Stock","مدیر انبار","ماهانه","< ۱۰٪"]]
},
procurement:{
 key:"procurement",title:"تدارکات و تأمین",subtitle:"PR، RFQ، پیشنهاد قیمت، مقایسه، Approval، PO، قرارداد، تحویل و ارزیابی تأمین‌کننده.",defaultOwner:"مدیر تدارکات",
 kpis:[["PR باز","۱۲","۳ مورد فوری","amber"],["PO دیرکرد","۲","۱ مورد حیاتی","red"],["On-time Delivery","۹۱٪","هدف ۹۵٪","amber"],["Vendor Risk","۱","نیازمند جایگزین","amber"]],
 areas:[["درخواست خرید","Need + Stock Check","درخواست‌کننده/خرید","PR"],["استعلام","RFQ و دعوت تأمین‌کننده","کارشناس خرید","RFQ"],["مقایسه","قیمت، کیفیت، Lead Time","مدیر خرید","Bid Comparison"],["سفارش خرید","PO و تعهد","مدیر تدارکات","PO"],["قرارداد","شرایط، تاریخ و تعهد","حقوقی/خرید","Contract"],["ارزیابی فروشنده","Delivery/Quality/Price","تدارکات","Vendor Score"]],
 process:["Need","PR","RFQ","Quotation","Comparison","Approval","PO","Delivery","GRN","Invoice Match","Payment"],
 flowDesc:"PR باید موجودی را بررسی کند؛ Approval با Decision متفاوت است و خروج از Policy به Decision تبدیل می‌شود.",
 records:[["شناسه","نوع","کالا","فروشنده","ETA","مبلغ","وضعیت"],[["PR-912","فوری","ITEM-6205","—","—","—","Open"],["PO-881","PO","ITEM-6205","تأمین‌گستر A","۵ روز","۶۹۰M","High"],["PO-884","PO","ITEM-B90","صنعت‌یار","۹ روز","۲۴۰M","In Transit"]]],
 controls:[["Stock Check","PR قبل از ایجاد خرید موجودی را بخواند","Gate"],["3 Quote Policy","حد سیاست برای تعداد استعلام","Control"],["Authority Matrix","مبلغ/Policy سطح Approval را تعیین کند","Gate"],["3-Way Match","PO + GRN + Invoice","Gate"]],
 states:["Requested","RFQ","Quoted","Compared","Approved","Ordered","Delivered","Received","Invoiced","Closed"],
 exceptions:[["PO-881 دیرتر از نیاز","Coverage ۰ و ETA پنج روز","Critical","مدیر تدارکات","نیازمند خرید اضطراری"],["Vendor OTD پایین","تحویل به‌موقع ۸۴٪","High","مدیر خرید","Corrective Plan"],["PR فوری بدون سه استعلام","Policy Exception","High","معاون عملیات","Decision Gate"]],
 rules:[["Procurement.ETAExceedsCoverage","ETA > Coverage","Case + Emergency Purchase Check","تدارکات"],["Vendor.PerformanceLow","OTD < Threshold","Supplier Action","مدیر خرید"],["Purchase.PolicyException","Policy Exception = True","Decision","Authority Owner"]],
 dependencies:[["Stock/Need","انبار","Coverage/ROP"],["Technical Spec","فنی/تولید","تأیید فنی"],["Commitment","مالی","Budget/Cash"],["GRN","انبار","Proof of Receipt"]],
 correlations:[["Inventory.LowStock → Procurement.Need","Stock risk منبع نیاز است","Root"],["Supplier.Delay → ProductionRisk","اثر تاخیر باید روی عملیات محاسبه شود","Impact"]],
 kpiDict:[["PR Lead Time","PR to PO","مدیر خرید","هفتگی","< ۳ روز"],["OTD","On-time Delivery / Total","تدارکات","ماهانه","≥ 95٪"],["Price Variance","Buy vs Benchmark","مدیر خرید","ماهانه","≤ ۳٪"],["Supplier NCR","Quality NCR / Deliveries","تدارکات","ماهانه","< ۲٪"]]
},
maintenance:{
 key:"maintenance",title:"فنی و نگهداری",subtitle:"Asset، درخواست تعمیر، Work Order، PM، اضطراری، توقف، قطعات، هزینه و RCA.",defaultOwner:"مدیر فنی",
 kpis:[["WO باز","۳","۱ اولویت بالا","amber"],["PM به‌موقع","۹۴٪","هدف ۹۸٪","amber"],["Downtime","۳۲ دقیقه","الویتور خط ۲","red"],["خرابی تکراری","۱","RCA Required","red"]],
 areas:[["Asset Master","تجهیز، Criticality، Location","مدیر فنی","Asset Master"],["درخواست تعمیر","Failure/Request","اپراتور","Maintenance Request"],["Work Order","Diagnosis/Work/Parts","سرپرست تعمیرات","WO"],["PM","Plan/Schedule/Compliance","برنامه‌ریز PM","PM Plan"],["Downtime","Start/End/Cause","تولید+فنی","Downtime"],["RCA","Problem/Root Cause/Prevention","مدیر فنی","Problem Record"]],
 process:["Failure","Request","WO","Diagnosis","Parts Check","Repair","Test","Return to Service","RCA/Verify"],
 flowDesc:"Failure تجهیز بحرانی باید با Production Impact و Parts Dependency correlate شود؛ تکرار خرابی Problem می‌سازد.",
 records:[["WO","تجهیز","نوع","شروع","توقف","قطعه","وضعیت"],[["WO-529","الویتور خط ۲","Emergency","۰۷:۰۲","۳۲ دقیقه","ITEM-6205","Monitoring"],["WO-531","فن غبارگیر","Corrective","۰۹:۲۰","۰","—","In Progress"],["PM-144","آسیاب ۱","PM","فردا","—","KIT-11","Scheduled"]]],
 controls:[["Critical Asset","Failure سطح Criticality را بخواند","Gate"],["Parts Reservation","قطعه قبل از شروع Reserve شود","Control"],["Return to Service","Test/Approval قبل از Release","Gate"],["Repeated Failure","Recurrence > Threshold = RCA","Gate"]],
 states:["Requested","Diagnosed","Planned","In Progress","Waiting Part","Testing","Returned","Verified","Closed"],
 exceptions:[["خرابی الویتور خط ۲","۳۲ دقیقه توقف و اثر تولید","Critical","مدیر فنی","Repair Completed / RCA Open"],["PM عقب‌افتاده","۲ PM نزدیک SLA","High","برنامه‌ریز PM","Scheduled"],["قطعه حیاتی ناموجود","ITEM-6205 Stockout","Critical","انبار/خرید","PO ناکافی"]],
 rules:[["Maintenance.AssetFailed","Critical Asset + Production Stop","Case + Executive Awareness","فنی/تولید"],["Maintenance.PMOverdue","Critical Asset + T4","Escalation","مدیر فنی"],["Maintenance.RepeatedFailure","Same Failure >= 3","Problem + RCA","مدیر فنی"]],
 dependencies:[["Spare Parts","انبار","Reservation/Stock"],["Purchase","تدارکات","Unavailable Part"],["Downtime","تولید","Production Impact"],["Repair Cost","مالی","Cost Exposure"]],
 correlations:[["AssetFailed → Production.Downtime","خرابی Root Event است","Root"],["PartStockout → WO.Blocked","کمبود قطعه Blocker تعمیر است","Root"]],
 kpiDict:[["PM Compliance","Done PM / Planned","مدیر فنی","هفتگی","≥ 98٪"],["MTTR","Repair Time / Failures","سرپرست تعمیرات","ماهانه","کاهشی"],["MTBF","Run Time / Failures","مدیر فنی","ماهانه","افزایشی"],["Downtime","Total Stop Minutes","تولید/فنی","روزانه","< ۳۰ دقیقه"]]
},
energy:{
 key:"energy",title:"انرژی و تأسیسات",subtitle:"برق، گاز، آب، هوای فشرده، ژنراتور، پیک مصرف و مصرف ویژه.",defaultOwner:"مدیر تأسیسات",
 kpis:[["برق ویژه","۸۲ kWh/t","هدف ۸۰","amber"],["گاز ویژه","۲۹ m³/t","داخل حد","green"],["پیک برق","۹۴٪","نزدیک Demand Limit","amber"],["ژنراتور","Ready","تست هفتگی موفق","green"]],
 areas:[["برق","کنتور، Demand و کیفیت توان","برق","Meter"],["گاز","مصرف و فشار","تأسیسات","Gas Meter"],["آب","مصرف و نشتی","تأسیسات","Water Meter"],["هوای فشرده","فشار و Leak","فنی","Compressed Air"],["ژنراتور","Fuel/Test/Availability","برق","Generator"],["مصرف ویژه","Energy per Ton","مدیر تأسیسات","Energy KPI"]],
 process:["Meter Read","Normalize by Production","Compare Baseline","Detect Deviation","Find Cause","Action","Verify Saving"],
 flowDesc:"مصرف مطلق بدون نرمال‌سازی بر تولید گمراه‌کننده است؛ KPI اصلی مصرف ویژه است.",
 records:[["منبع","مصرف امروز","مصرف ویژه","هدف","انحراف","وضعیت"],[["برق","۳۳,۹۰۰ kWh","۸۲ kWh/t","۸۰","+۲.۵٪","هشدار"],["گاز","۱۲,۰۰۰ m³","۲۹ m³/t","۳۰","-۳.۳٪","عادی"],["آب","۱۸۰ m³","۰.۴۳ m³/t","۰.۴۵","-۴٪","عادی"]]],
 controls:[["Meter Validity","Reading غیرعادی Validate شود","Control"],["Demand Limit","Peak > Threshold اقدام بار","Gate"],["Generator Test","تست دوره‌ای اجباری","Control"],["Specific Consumption","بر تولید واقعی نرمال شود","Control"]],
 states:["Normal","Warning","Peak Risk","Utility Failure","Generator Mode","Recovered"],
 exceptions:[["پیک برق نزدیک حد","۹۴٪ Demand Limit","High","مدیر تأسیسات","Load Plan"],["مصرف ویژه برق بالا","۸۲ در برابر ۸۰","Medium","مدیر تأسیسات","Investigation"],["افت فشار هوا","Leak محتمل","High","مدیر فنی","Inspection"]],
 rules:[["Energy.PeakRisk","Demand > 90% Limit","Load Action","تأسیسات"],["Energy.SpecificHigh","Specific > Target for 2 shifts","Case","مدیر تأسیسات"],["Utility.Failure","Power/Gas Failure","Emergency Flow","عملیات/CEO حسب Impact"]],
 dependencies:[["Production Volume","تولید","Normalization"],["Equipment Efficiency","فنی","Cause Analysis"],["Energy Cost","مالی","Cost Impact"],["Generator Fuel","انبار/خرید","Availability"]],
 correlations:[["ProductionDrop + EnergyFlat","مصرف ویژه بالا می‌رود حتی اگر مصرف مطلق ثابت باشد","Impact"],["AirLeak → Energy.SpecificHigh","نشتی هوای فشرده می‌تواند Root Cause باشد","Root"]],
 kpiDict:[["Electricity Specific","kWh / ton","تأسیسات","روزانه","≤ 80"],["Gas Specific","m3 / ton","تأسیسات","روزانه","≤ 30"],["Peak Demand","Max kW","برق","روزانه","< Contract Limit"],["Generator Availability","Ready Hours / Required","برق","هفتگی","100٪"]]
},
sales:{
 key:"sales",title:"فروش و توزیع",subtitle:"سفارش، قیمت، تخصیص، بارگیری، تحویل، وصول و ریسک مشتری.",defaultOwner:"مدیر فروش",
 kpis:[["سفارش امروز","۱۴","۲ وابسته به QC",""],["تحویل به‌موقع","۹۱٪","هدف ۹۵٪","amber"],["وصول معوق","۱","مشتری کلیدی","red"],["حاشیه فروش","۱۲.۴٪","داخل هدف","green"]],
 areas:[["سفارش","Customer/Item/Qty/Date","فروش","Sales Order"],["قیمت/تخفیف","Price Policy و Approval","مدیر فروش","Pricing"],["تخصیص","Available-to-Promise","برنامه‌ریزی","Allocation"],["بارگیری","QC Release + Logistics","لجستیک","Shipment"],["تحویل","OTIF و Proof","لجستیک","Delivery"],["وصول","Receivable و Credit","مالی/فروش","AR"]],
 process:["Order","Credit Check","ATP","QC Release","Loading","Delivery","Invoice","Collection"],
 flowDesc:"Order نباید بدون Credit/ATP/QC Gate وارد بارگیری شود؛ تأخیر علت‌محور به QC/Production/Logistics وصل می‌شود.",
 records:[["سفارش","مشتری","محصول","مقدار","تاریخ","Blocker","وضعیت"],[["ORD-91","مشتری A","آرد ستاره","۲۸ تن","امروز","B-2405 Hold","High"],["ORD-94","مشتری B","آرد خبازی","۲۴ تن","امروز","B-2406 Hold","High"],["ORD-88","مشتری C","آرد ستاره","۳۰ تن","تحویل شد","—","Completed"]]],
 controls:[["Credit Check","بدهی/سقف اعتبار","Gate"],["ATP","موجودی/برنامه تولید","Gate"],["QC Release","Batch Released باشد","Gate"],["Discount Approval","خارج Policy نیازمند Approval","Gate"]],
 states:["Draft","Confirmed","Allocated","QC Hold","Ready","Loaded","Delivered","Invoiced","Collected"],
 exceptions:[["دو سفارش Blocked by QC","Batch Hold مانع بارگیری","High","مدیر فروش","Quality Testing"],["وصول مشتری کلیدی معوق","۴ روز تأخیر","High","مدیر فروش/مالی","Follow-up"],["OTD زیر هدف","۹۱٪ در برابر ۹۵٪","Medium","لجستیک","Improvement Plan"]],
 rules:[["Sales.ShipmentBlocked","QC Hold + Due Today","Action + Manager Alert","فروش/کیفیت"],["AR.Overdue","Critical Customer + >3d","Finance/Sales Case","مدیر فروش"],["Sales.OTDLow","OTD < Target 2 weeks","Problem Analysis","لجستیک"]],
 dependencies:[["QC Release","آزمایشگاه","Shipment Gate"],["Production ATP","تولید","Availability"],["Credit","مالی","Order Release"],["Loading","انبار/لجستیک","Shipment"]],
 correlations:[["Quality.BatchHold → ShipmentBlocked","Quality Root Event است","Root"],["Production.TargetMissed → DeliveryRisk","کمبود تولید روی OTD اثر دارد","Impact"]],
 kpiDict:[["OTD","On-time Deliveries / Total","فروش","هفتگی","≥95٪"],["Margin","Gross Margin / Sales","فروش/مالی","ماهانه","طبق بودجه"],["DSO","Receivables / Sales × Days","مالی","ماهانه","کاهشی"],["Order Fill Rate","Delivered Qty / Ordered","فروش","هفتگی","≥98٪"]]
},
finance:{
 key:"finance",title:"مالی و خزانه",subtitle:"تعهدات، پرداخت/دریافت آتی، بودجه، هزینه، Cash Forecast و ریسک نقدینگی.",defaultOwner:"مدیر مالی",
 kpis:[["نقدینگی","۱۸ میلیارد","امروز",""],["پرداخت ۷ روز","۷ میلیارد","۳ تعهد اصلی","amber"],["دریافت ۷ روز","۳ میلیارد","۲ وصول",""],["Liquidity Risk","Medium","Gap کوتاه‌مدت","amber"]],
 areas:[["تعهدات","PO/Contract Commitment","کنترل مالی","Commitment"],["پرداخت","Request/Approval/Payment","خزانه","Payment"],["دریافت","Invoice/Collection","خزانه","Receivable"],["بودجه","Budget/Available/Variance","بودجه","Budget"],["Cash Forecast","7/30/90 Day","مدیر مالی","Cash Forecast"],["ریسک نقدینگی","Gap/Scenario","مدیر مالی","Liquidity Risk"]],
 process:["Commitment","Due Date","Cash Forecast","Payment Request","Approval","Payment","Reconcile"],
 flowDesc:"این لایه مدیریت مالی است، نه جایگزین حسابداری. PO باید قبل از سررسید در Cash Forecast دیده شود.",
 records:[["تعهد","منبع","سررسید","مبلغ","بودجه","Cash Status","وضعیت"],[["COM-881","PO-881","۵ روز","۶۹۰M","Available","Gap ندارد","Open"],["PAY-440","قرارداد انرژی","امروز","۴.۲B","Available","Ready","Due"],["REC-112","مشتری کلیدی","۴ روز معوق","۱.۱B","—","Expected","High"]]],
 controls:[["Budget Availability","قبل از تعهد Check شود","Gate"],["Payment Authority","Amount/Policy Matrix","Gate"],["Cash Forecast","تعهدات باز وارد Forecast شوند","Control"],["3-Way Match","PO/GRN/Invoice","Gate"]],
 states:["Planned","Committed","Due","Requested","Approved","Paid","Reconciled"],
 exceptions:[["پرداخت ۴.۲B امروز","سررسید امروز و اهمیت بالا","High","خزانه","Cash Available"],["وصول ۱.۱B معوق","۴ روز تأخیر","High","فروش/مالی","Follow-up"],["Cash Gap 30 روزه","تعهدات > ورودی پیش‌بینی","Medium","مدیر مالی","Scenario"]],
 rules:[["Finance.PaymentDue","Critical Payment + Today","Action","خزانه"],["Finance.CashRisk","Forecast Gap > Threshold","Executive Awareness","مدیرعامل"],["Budget.Overrun","Available < Commitment","Decision Gate","Authority Owner"]],
 dependencies:[["PO Commitment","تدارکات","تعهد خرید"],["GRN","انبار","اثبات تحویل"],["Receivable","فروش","وصول مشتری"],["CAPEX","پروژه","بودجه سرمایه‌ای"]],
 correlations:[["PO.Created → FinancialCommitment","تعهد قبل از Invoice شکل می‌گیرد","Root"],["AR.Overdue → LiquidityRisk","معوق مشتری بر Forecast اثر دارد","Impact"]],
 kpiDict:[["Cash Coverage","Cash / 7d Payables","مدیر مالی","روزانه","≥1.2"],["Forecast Accuracy","Actual vs Forecast","خزانه","ماهانه","≥90٪"],["Budget Variance","Actual vs Budget","بودجه","ماهانه","≤5٪"],["Overdue Receivables","Past Due / AR","مالی","هفتگی","<10٪"]]
},
tax:{
 key:"tax",title:"مالیات و سامانه مودیان",subtitle:"صورتحساب، سامانه مودیان، ارزش افزوده، اظهارنامه، ابلاغیه، مغایرت و تقویم تعهدات.",defaultOwner:"مسئول مالیاتی",
 kpis:[["تعهد نزدیک","۲","۷ روز آینده","amber"],["صورتحساب مغایر","۱","نیازمند اصلاح","amber"],["ارسال موفق","۹۹.۲٪","ماه جاری","green"],["ابلاغیه باز","۱","مهلت ۱۰ روز","amber"]],
 areas:[["صورتحساب","Invoice/UID/Status","مالیات","Tax Invoice"],["مودیان","Send/Ack/Error","مالیات","Taxpayer System"],["VAT","Input/Output VAT","مالیات","VAT"],["اظهارنامه","Period/Deadline/Status","مالیات","Return"],["ابلاغیه","Notice/Deadline/Response","مالیات/حقوقی","Notice"],["مغایرت","ERP vs Tax Records","مالیات","Reconciliation"]],
 process:["Invoice","Validate","Send","Ack/Error","Reconcile","Return","Archive"],
 flowDesc:"خطای ارسال باید Queue و Retry کنترل‌شده داشته باشد؛ Deadline مالیاتی Rule مستقل دارد.",
 records:[["موضوع","دوره","مهلت","وضعیت","مغایرت","مالک"],[["VAT-Q3","Q3","۱۰ روز","In Progress","۰","مالیات"],["Notice-71","—","۱۰ روز","Open","—","مالیات/حقوقی"],["INV-8821","شهریور","—","Error","UID mismatch","کارشناس"]]],
 controls:[["Invoice Validation","Fields/UID قبل از ارسال","Gate"],["Deadline Calendar","مهلت‌ها SLA مستقل","Control"],["Retry Policy","خطا بدون Loop نامحدود","Control"],["Reconciliation","سیستم داخلی با تاییدیه سامانه","Gate"]],
 states:["Draft","Validated","Sent","Acknowledged","Error","Corrected","Filed","Closed"],
 exceptions:[["UID mismatch","یک صورتحساب Error","High","کارشناس مالیاتی","Correction"],["ابلاغیه باز","مهلت پاسخ محدود","High","مسئول مالیاتی","Review"],["تعهد نزدیک","۲ موعد در هفت روز","Medium","مسئول مالیاتی","Calendar"]],
 rules:[["Tax.InvoiceError","Send Error + Retry Failed","Action","مالیات"],["Tax.DeadlineNear","Deadline < 7d","Owner Alert","مسئول مالیاتی"],["Tax.NoticeCritical","Notice + High Exposure","Management Case","مالی/حقوقی"]],
 dependencies:[["Invoice Source","فروش/مالی","صورتحساب"],["Payment","خزانه","مالیات پرداختنی"],["Notice Response","حقوقی","پاسخ ابلاغیه"],["Ledger","دفتر کل","Reconciliation"]],
 correlations:[["Invoice.Error → FilingRisk","خطای حل‌نشده می‌تواند ریسک اظهارنامه بسازد","Impact"],["LedgerMismatch → TaxReconciliation","مغایرت دفتر کل Root Data Issue است","Root"]],
 kpiDict:[["Submission Success","Acknowledged / Sent","مالیات","روزانه","≥99٪"],["Deadline Compliance","On-time / Total","مالیات","ماهانه","100٪"],["Reconciliation Gap","Mismatch Amount","مالیات","ماهانه","0"],["Open Notices","Active Notices","مالیات","هفتگی","0 Critical"]]
},
ledger:{
 key:"ledger",title:"دفتر کل و بستن حساب‌ها",subtitle:"کدینگ، اسناد، تراز آزمایشی، مغایرت، بستن دوره، کنترل دسترسی و Audit.",defaultOwner:"رئیس حسابداری",
 kpis:[["دوره باز","شهریور","در حال بستن",""],["اسناد منتظر","۷","نیازمند تأیید","amber"],["مغایرت","۲","بین زیرسیستم‌ها","amber"],["روز تا Close","۳","تا Deadline",""]],
 areas:[["کدینگ","Account/Cost Center","حسابداری","COA"],["اسناد","Draft/Post/Reverse","حسابداری","Journal"],["تراز","Trial Balance","رئیس حسابداری","TB"],["مغایرت","Subledger vs GL","کنترل مالی","Reconciliation"],["بستن دوره","Checklist و Lock","رئیس حسابداری","Close"],["Audit","Change/Posting Log","حسابرسی","Audit Trail"]],
 process:["Collect","Validate","Post","Reconcile","Adjust","Review","Close","Lock"],
 flowDesc:"بستن دوره باید Checklist و Gate داشته باشد؛ مغایرت باز نباید بدون Approval نادیده گرفته شود.",
 records:[["کنترل","وضعیت","تعداد","مالک","Deadline","ریسک"],[["اسناد Draft","Open","۷","حسابداری","فردا","Medium"],["Bank Reconcile","In Progress","۱","خزانه","امروز","High"],["Inventory Reconcile","Open","۱","کنترل مالی","امروز","High"]]],
 controls:[["Balanced Journal","Debit=Credit","Gate"],["Period Access","Posting بعد از Lock ممنوع","Gate"],["Reconciliation","Subledger Match","Gate"],["Close Checklist","همه Critical Controlها Complete","Gate"]],
 states:["Draft","Approved","Posted","Reconciled","Adjusted","Closed","Locked"],
 exceptions:[["مغایرت بانک","Reconcile باز در روز Close","High","خزانه","In Progress"],["مغایرت انبار","Ledger vs Stock اختلاف","High","کنترل مالی","Investigation"],["۷ سند Draft","نزدیک Deadline","Medium","حسابداری","Assigned"]],
 rules:[["Ledger.ReconGap","Gap > Tolerance","Action + Approval","رئیس حسابداری"],["Ledger.CloseBlocked","Critical Checklist Open","Escalation","مدیر مالی"],["Ledger.PostAfterClose","Period Locked","Block + Audit","حسابرسی"]],
 dependencies:[["Inventory Value","انبار","Subledger"],["Payments","خزانه","Bank"],["Tax","مالیات","Tax Reconcile"],["CAPEX/Assets","دارایی","Asset Register"]],
 correlations:[["InventoryMismatch → Ledger.ReconGap","مغایرت Master/Stock روی GL اثر می‌گذارد","Root"],["UnpostedCommitment → CloseRisk","داده ناقص می‌تواند Close را عقب بیندازد","Impact"]],
 kpiDict:[["Close Cycle","Days to Close","رئیس حسابداری","ماهانه","≤5 روز"],["Reconciliation Open","Open Recons","کنترل مالی","روزانه","0 Critical"],["Posting Error","Corrected / Posted","حسابداری","ماهانه","<1٪"],["Audit Exceptions","Control Failures","حسابرسی","ماهانه","0 High"]]
},
assets:{
 key:"assets",title:"کالا، انبار و دارایی",subtitle:"Asset Master مستقل از Item Master؛ مالکیت، مکان، وضعیت، چرخه عمر، سرویس و تاریخچه.",defaultOwner:"مسئول دارایی",
 kpis:[["دارایی فعال","۱۸۷","ثبت‌شده",""],["دارایی بحرانی","۱۲","Criticality بالا","amber"],["بدون Custodian","۳","نیازمند تعیین","amber"],["Lifecycle Risk","۲","تعویض نزدیک","red"]],
 areas:[["Asset Master","ID/Type/Criticality","دارایی","Asset Master"],["مالکیت","Custodian/Department","دارایی","Custody"],["مکان","Location/Transfer","دارایی","Location"],["چرخه عمر","Commission/End of Life","دارایی","Lifecycle"],["هزینه","Repair/TCO","مالی/فنی","Asset Cost"],["تاریخچه","WO/Move/Incident","سیستم","Asset Timeline"]],
 process:["Register","Assign","Operate","Maintain","Transfer","Assess Health","Replace/Retire"],
 flowDesc:"Asset تجهیز واقعی است و نباید با Item انبار یکی شود؛ WO باید Asset ID انتخاب کند.",
 records:[["دارایی","نوع","مکان","Custodian","Criticality","Health","وضعیت"],[["AST-ELV2","الویتور خط ۲","خط ۲","تولید","High","۷۱٪","High"],["AST-MILL1","آسیاب ۱","خط ۱","تولید","Critical","۸۸٪","عادی"],["AST-GEN1","ژنراتور","تأسیسات","برق","Critical","۹۳٪","عادی"]]],
 controls:[["Unique Asset ID","ثبت تکراری ممنوع","Gate"],["Custody","انتقال با تحویل/تأیید","Control"],["Criticality","ورودی Maintenance Risk","Control"],["Retirement","خروج با Approval و Audit","Gate"]],
 states:["Active","Under Maintenance","Transferred","Idle","At Risk","Retired"],
 exceptions:[["Health الویتور پایین","۷۱٪ و خرابی اخیر","High","مدیر فنی","WO/RCA"],["۳ دارایی بدون Custodian","Accountability Gap","Medium","دارایی","Assignment"],["۲ دارایی End-of-Life","Replacement Exposure","High","مدیر فنی/مالی","CAPEX Review"]],
 rules:[["Asset.HealthLow","Health < Threshold + Critical","Replacement Case","فنی/مالی"],["Asset.NoCustodian","Custodian Null","Action","دارایی"],["Asset.Retire","Retirement Requested","Approval","مدیر مالی"]],
 dependencies:[["Maintenance History","فنی","Health/TCO"],["CAPEX","پروژه/مالی","Replacement"],["Insurance","مالی/حقوقی","Risk"],["Security Transfer","حراست","خروج/ورود Asset"]],
 correlations:[["RepeatedFailure → Asset.HealthLow","خرابی‌های تکراری Health را کاهش می‌دهد","Impact"],["HighTCO + LowHealth → ReplaceDecision","ترکیب هزینه و سلامت می‌تواند Decision بسازد","Root"]],
 kpiDict:[["Asset Availability","Available Hours / Required","دارایی/فنی","ماهانه","≥95٪"],["Critical Health","Critical Assets < Health Target","فنی","هفتگی","0"],["TCO","Maintenance+Operating Cost","مالی","ماهانه","طبق Benchmark"],["Custody Completeness","Assigned / Active","دارایی","ماهانه","100٪"]]
},
security:{
 key:"security",title:"حراست",subtitle:"تردد کارکنان، مهمان، پیمانکار، مجوز، گشت، رخداد و اشیای ورودی/خروجی.",defaultOwner:"مدیر حراست",
 kpis:[["ورود غیرمجاز","۰","امروز","green"],["مهمان فعال","۷","داخل سایت",""],["پیمانکار فعال","۳","مجوز معتبر",""],["رخداد باز","۱","در بررسی","amber"]],
 areas:[["تردد کارکنان","Shift/Permit/Access","حراست","Access Log"],["مهمان","Host/Area/Expire","نگهبانی","Visitor"],["پیمانکار","Contract/Permit/Area","حراست","Contractor"],["مجوزها","After Hours/Special Area","مدیر حراست","Permit"],["گشت","Checkpoint/Patrol","سرپرست نگهبانی","Patrol"],["رخداد","Incident/Follow-up","حراست","Security Incident"]],
 process:["Identity","Shift/Permit Check","Access Decision","Log","Exception Detection","Incident/Follow-up"],
 flowDesc:"ورود خارج شیفت باید Permit معتبر را بخواند؛ Incident مهم Management Case می‌سازد.",
 records:[["شناسه","نوع","شخص","زمان","مجوز","محدوده","وضعیت"],[["ACC-91","کارمند","EMP-41","۰۶:۰۳","Shift","تولید","عادی"],["VIS-72","مهمان","شرکت X","۱۰:۱۵","تا ۱۲:۰۰","اداری","Active"],["CON-31","پیمانکار","تعمیرکار Y","۰۸:۴۰","PTW-11","خط ۲","Active"]]],
 controls:[["Shift Check","خارج شیفت نیازمند Permit","Gate"],["Contract Validity","پیمانکار با قرارداد معتبر","Gate"],["Area Scope","دسترسی فقط Area مجاز","Gate"],["Asset Exit","خروج اشیا با مجوز","Gate"]],
 states:["Requested","Verified","Allowed","Denied","Inside","Exited","Incident"],
 exceptions:[["رخداد باز","ورود به محدوده اشتباه","Medium","حراست","Investigation"],["مجوز نزدیک انقضا","پیمانکار خط ۲","Medium","حراست","Renewal"],["Patrol Missed","یک Checkpoint ثبت نشده","High","سرپرست نگهبانی","Follow-up"]],
 rules:[["Security.UnauthorizedAccess","No Valid Permit","Deny + Incident","حراست"],["Security.ContractorExpired","Contract/Permit Expired","Block Access","حراست"],["Security.IncidentMajor","Severity >= High","Management Case","حراست/CEO حسب Rule"]],
 dependencies:[["Shift","سرمایه انسانی","برنامه حضور"],["Permit to Work","HSE","مجوز کار"],["Asset Exit","دارایی/انبار","Related Entity"],["Contractor","تدارکات/حقوقی","اعتبار قرارداد"]],
 correlations:[["ExpiredPermit → AccessDenied","مجوز Root Condition است","Root"],["MajorIncident → ExecutiveAwareness","فقط severity/impact بالا به CEO می‌رسد","Impact"]],
 kpiDict:[["Access Violation","Unauthorized Attempts","حراست","روزانه","0"],["Patrol Compliance","Completed / Planned","حراست","هر شیفت","100٪"],["Permit Validity","Valid Active / Active","حراست","روزانه","100٪"],["Incident Closure","Closed / Opened","حراست","ماهانه","≥95٪"]]
},
hse:{
 key:"hse",title:"HSE",subtitle:"حادثه، Near Miss، بازرسی، PPE، ریسک، مجوز کار، اقدام اصلاحی و Verification.",defaultOwner:"مدیر HSE",
 kpis:[["حادثه شدید","۰","ماه جاری","green"],["Near Miss","۲","در بررسی","amber"],["اقدام اصلاحی باز","۳","۱ نزدیک SLA","amber"],["PTW فعال","۴","امروز",""]],
 areas:[["حوادث","Incident/Severity","HSE","Incident"],["Near Miss","Unsafe Event","HSE","Near Miss"],["بازرسی","Checklist/Finding","HSE","Inspection"],["PPE","Issue/Compliance","HSE","PPE"],["ریسک","Hazard/Risk/Control","HSE","Risk Assessment"],["مجوز کار","PTW/Area/Expire","HSE","Permit to Work"]],
 process:["Report","Immediate Response","Investigate","Root Cause","Corrective Action","Verify","Close/Learn"],
 flowDesc:"Incident Completed نیست؛ Action باید Verification و اثربخشی کنترل داشته باشد.",
 records:[["شناسه","نوع","محل","شدت","مالک","اقدام","وضعیت"],[["NM-81","Near Miss","خط ۱","Medium","HSE","ACT-H11","Investigation"],["NM-82","Near Miss","سیلو","Medium","HSE","ACT-H12","Actioning"],["INS-44","Inspection","تأسیسات","High","تأسیسات","ACT-H14","Open"]]],
 controls:[["Immediate Response","ایمن‌سازی قبل از Investigation","Gate"],["Severity","Severe Safety = Override","Gate"],["Root Cause","حادثه مهم RCA اجباری","Gate"],["Verification","Action Complete ≠ Risk Reduced","Control"]],
 states:["Reported","Contained","Investigating","Actioning","Monitoring","Verified","Closed"],
 exceptions:[["Near Miss تکراری","نوع مشابه در یک ماه","High","HSE","Investigation"],["Finding با ریسک بالا","بازرسی تأسیسات","High","مدیر تأسیسات","Action Open"],["PTW نزدیک انقضا","مجوز کار خط ۲","Medium","HSE","Active Work"]],
 rules:[["HSE.IncidentSevere","Safety Severe","Emergency Flow","HSE + CEO"],["HSE.NearMissRepeated","Same Type >= Threshold","Problem + RCA","HSE"],["HSE.CorrectiveOverdue","Action T4/T5","Escalation","Owner Manager"]],
 dependencies:[["Permit Access","حراست","Contractor Access"],["Training","سرمایه انسانی","HSE Competency"],["Maintenance","فنی","Unsafe Equipment"],["Production","عملیات","Stop Work Impact"]],
 correlations:[["UnsafeEquipment → HSE.Finding","وضعیت تجهیز می‌تواند Root Cause باشد","Root"],["CorrectiveOverdue → ResidualRiskHigh","تاخیر Action ریسک باقیمانده را بالا نگه می‌دارد","Impact"]],
 kpiDict:[["TRIR","Recordable Incidents / Hours","HSE","ماهانه","کاهشی"],["Near Miss Closure","Closed / Reported","HSE","هفتگی","≥95٪"],["Inspection Compliance","Done / Planned","HSE","هفتگی","100٪"],["Corrective SLA","On-time Actions","HSE","هفتگی","≥95٪"]]
},
meetings:{
 key:"meetings",title:"جلسات و مصوبات",subtitle:"Agenda، تصمیم، اقدام، Owner، Deadline، پیگیری و تبدیل صورتجلسه به Workflow.",defaultOwner:"دفتر مدیرعامل",
 kpis:[["مصوبه باز","۱۲","۵ معوق","red"],["جلسه این هفته","۶","۲ مدیریتی",""],["تصمیم بدون Action","۱","نیازمند اصلاح","amber"],["On-time Closure","۸۲٪","هدف ۹۵٪","amber"]],
 areas:[["Agenda","موضوع و Owner","دفتر","Agenda"],["صورتجلسه","Discussion/Record","دبیر جلسه","Minutes"],["تصمیم","Decision Object","مدیر جلسه","Decision"],["اقدام","Owner/Deadline/Result","دبیر جلسه","Action"],["پیگیری","SLA/Escalation","دفتر","Follow-up"],["بستن","Result/Verification","مدیر جلسه","Closure"]],
 process:["Agenda","Meeting","Decision","Action","Owner/Deadline","Follow-up","Verify","Close"],
 flowDesc:"صورتجلسه نباید فایل منفعل باشد؛ هر تصمیم اجرایی باید Action قابل پیگیری بسازد.",
 records:[["مصوبه","مسئول","سررسید","تاخیر","Case","وضعیت"],[["رفع لرزش الویتور","مدیر فنی","امروز","۰","CASE-201","In Progress"],["تأمین رولبرینگ","مدیر تدارکات","امروز","۰","CASE-231","Blocked"],["اقدام جلسه فروش","مدیر فروش","۴ روز قبل","۴ روز","CASE-178","معوق"]]],
 controls:[["Decision vs Comment","Comment تصمیم محسوب نشود","Control"],["Action Required","Decision اجرایی بدون Action ممنوع","Gate"],["Owner","مسئول شخص مشخص باشد","Gate"],["Closure","Result/Verification قبل از Close","Gate"]],
 states:["Draft","Scheduled","Held","Decision Recorded","Actioning","Follow-up","Verified","Closed"],
 exceptions:[["۵ مصوبه معوق","از SLA عبور کرده‌اند","High","دفتر مدیرعامل","Escalated"],["تصمیم بدون Action","یک تصمیم اجرایی Action ندارد","High","دبیر جلسه","Needs Fix"],["Owner نامشخص","یک مصوبه به واحد نسبت داده شده","Medium","دفتر","Assignment"]],
 rules:[["Meeting.ActionOverdue","T4/T5 + Open","Escalation","Owner Manager"],["Meeting.DecisionNoAction","Executable Decision + No Action","Action Required","دبیر جلسه"],["Meeting.OwnerMissing","Action + Person Owner Null","Block Closure","دفتر"]],
 dependencies:[["Decision","مرکز تصمیم","Decision Memory"],["Action","کارهای من","Execution"],["Project","پروژه‌ها","Milestone/Task"],["Case","موضوعات مدیریتی","Cross-functional Follow-up"]],
 correlations:[["Decision → Action","تصمیم بدون اجرا ناقص است","Root"],["OverdueActions → ManagementCase","تجمع تاخیر می‌تواند Case بسازد","Impact"]],
 kpiDict:[["Action Closure","Closed / Created","دفتر","هفتگی","≥95٪"],["Overdue Actions","Past Due Open","دفتر","روزانه","0 Critical"],["Decision-to-Action","Actions / Executable Decisions","دفتر","هفتگی","100٪"],["Meeting Effectiveness","Verified Outcomes / Decisions","دفتر","ماهانه","≥90٪"]]
},
projects:{
 key:"projects",title:"پروژه‌ها و سرمایه‌گذاری",subtitle:"Project، Milestone، Critical Path، بودجه/CAPEX، پیمانکار، ریسک، تأخیر و Benefit.",defaultOwner:"مدیر پروژه",
 kpis:[["پروژه فعال","۴","۲ CAPEX",""],["Milestone معوق","۱","روی Critical Path","red"],["Budget Variance","+۳.۱٪","داخل Threshold","amber"],["Benefit at Risk","۱","نیازمند اقدام","amber"]],
 areas:[["Project Charter","هدف/مالک/Scope","PMO","Project"],["Milestone","Date/Dependency","مدیر پروژه","Milestone"],["Budget/CAPEX","Plan/Actual/Commitment","مالی/PMO","CAPEX"],["Contractor","Contract/Progress","پروژه","Contractor"],["Risk","Probability/Impact","مدیر پروژه","Project Risk"],["Benefit","Expected/Actual Outcome","Sponsor","Benefit"]],
 process:["Charter","Approve","Plan","Execute","Milestone","Control","Handover","Benefit Review"],
 flowDesc:"هر Delay به CEO نمی‌رسد؛ فقط Critical Path/Impact بالا Case و Decision می‌سازد.",
 records:[["پروژه","Milestone","برنامه","واقعی/Forecast","Critical Path","بودجه","وضعیت"],[["PRJ-11","نصب خط بسته‌بندی","۳۰ مهر","۵ آبان","Yes","۱۲B","High"],["PRJ-07","بهینه‌سازی انرژی","۱۵ آبان","۱۵ آبان","No","۳B","عادی"],["PRJ-04","ارتقای آزمایشگاه","Completed","Completed","No","۱.۸B","Completed"]]],
 controls:[["Business Case","CAPEX قبل از Approval","Gate"],["Critical Path","Delay Impact تحلیل شود","Control"],["Change Request","Scope/Cost/Schedule تغییر رسمی","Gate"],["Benefit Review","پس از تحویل Outcome سنجیده شود","Control"]],
 states:["Idea","Business Case","Approved","Planning","Executing","At Risk","Delivered","Benefit Review","Closed"],
 exceptions:[["Milestone Critical معوق","۵ روز Forecast Delay","High","مدیر پروژه","Recovery Plan"],["CAPEX +۳.۱٪","داخل Threshold ولی روند افزایشی","Medium","مالی/PMO","Monitor"],["Contractor Delay","تجهیز وارد نشده","High","تدارکات/پروژه","Supplier Action"]],
 rules:[["Project.MilestoneDelayed","Critical Path + Delay","Management Case","Sponsor"],["Project.BudgetOverrun","Variance > Threshold","Decision Gate","Authority Owner"],["Project.BenefitAtRisk","Expected Benefit Gap","Corrective Plan","Sponsor"]],
 dependencies:[["Procurement","تدارکات","Equipment/Contract"],["CAPEX","مالی","Budget/Commitment"],["HSE","HSE","Permit/Construction Safety"],["Operations","تولید","Handover/Benefit"]],
 correlations:[["Supplier.Delay → Project.Delay","تأمین‌کننده می‌تواند Root Cause باشد","Root"],["Project.Delay → ProductionCapacityRisk","تاخیر ممکن است روی Capacity اثر بگذارد","Impact"]],
 kpiDict:[["Schedule Variance","Forecast vs Baseline","PMO","هفتگی","≤5٪"],["Cost Variance","Actual+Commit / Budget","مالی/PMO","ماهانه","≤5٪"],["Milestone OTD","On-time / Total","PMO","ماهانه","≥95٪"],["Benefit Realization","Actual / Expected Benefit","Sponsor","فصلی","≥90٪"]]
},
bi:{
 key:"bi",title:"گزارش‌های مدیریتی و BI",subtitle:"Executive KPI، KPI Dictionary، گزارش واحدها، Drill-down، Anomaly و Brief زمان‌بندی‌شده.",defaultOwner:"دفتر مدیریت/BI",
 kpis:[["KPI فعال","۴۰","۱۲ Executive",""],["خارج هدف","۱۴","۳ Critical","red"],["تعریف ناسازگار","۲","نیازمند یکسان‌سازی","amber"],["Brief امروز","Ready","۱۰:۲۰","green"]],
 areas:[["Executive KPI","Top-level Health","BI","KPI Store"],["KPI Dictionary","Definition/Formula/Owner","BI","KPI Dictionary"],["Module BI","HR/Finance/Production/...","BI","Data Mart"],["Anomaly","Trend/Threshold","Rule Engine","Anomaly"],["Custom Report","Filter/Export","BI","Report"],["Brief","Daily/Weekly/Monthly","Executive Assistant","Brief"]],
 process:["Source Data","Validate","Metric","Threshold","Exception","Drill-down","Brief/Report"],
 flowDesc:"BI نباید Data Owner شود؛ فقط Sourceهای اصلی را بخواند و تعریف KPI را استاندارد کند.",
 records:[["KPI","مقدار","هدف","Trend","مالک","وضعیت"],[["Plan Attainment","۹۲٪","۹۸٪","↓","تولید","High"],["OTD","۹۱٪","۹۵٪","→","فروش","High"],["PM Compliance","۹۴٪","۹۸٪","↑","فنی","هشدار"],["Wheat Coverage","۴۳ روز","≥۳۰","→","سیلو","عادی"]]],
 controls:[["KPI Formula","یک تعریف مرکزی","Gate"],["Source Lineage","هر KPI Source مشخص","Control"],["Freshness","داده قدیمی Flag شود","Control"],["Drill-down","Summary → Evidence","Control"]],
 states:["Fresh","Warning","Stale","Anomaly","Investigating","Resolved"],
 exceptions:[["تعریف KPI متفاوت","دو تعریف OTD وجود دارد","High","BI","Standardize"],["Plan Attainment خارج هدف","۹۲٪","High","تولید","CASE-201"],["داده یک Source قدیمی","آخرین Update > SLA","Medium","Data Owner","Refresh"]],
 rules:[["BI.KPIDefinitionConflict","Same KPI + Multiple Formula","Data Governance Case","BI"],["BI.AnomalyDetected","Deviation > Dynamic Threshold","Investigation","Metric Owner"],["BI.DataStale","Freshness > SLA","Owner Alert","Data Owner"]],
 dependencies:[["Source Data","تمام ماژول‌ها","Read Only"],["Rule Engine","هشدار و ریسک","Exception"],["Executive Brief","داشبورد مدیرعامل","What Matters"],["AI Assistant","دستیار هوشمند","Evidence"]],
 correlations:[["KPI Anomaly → Source Event","BI باید به Source Record برگردد","Impact"],["Repeated Anomaly → Problem","تکرار انحراف می‌تواند Problem بسازد","Root"]],
 kpiDict:[["Data Freshness","Now - Last Update","BI","ساعتی","< SLA"],["KPI Coverage","Defined KPI / Required","BI","ماهانه","100٪"],["Drill-down Integrity","KPI with Evidence / Total","BI","ماهانه","100٪"],["Brief Relevance","Actionable Items / Total","دفتر","هفتگی","بالا"]]
},
documents:{
 key:"documents",title:"اسناد",subtitle:"قرارداد، دستورالعمل، فرم، نامه، گزارش، صورتجلسه و مستند فنی با Version/Owner/Access/Expiry.",defaultOwner:"مسئول اسناد",
 kpis:[["اسناد فعال","۱,۲۸۰","نسخه کنترل‌شده",""],["منقضی","۳","نیازمند اقدام","red"],["نیاز بازبینی","۷","۳۰ روز آینده","amber"],["دسترسی محدود","۱۲","Sensitive",""]],
 areas:[["قرارداد","Version/Expiry/Party","حقوقی","Contract"],["دستورالعمل","Owner/Revision","واحد مالک","Procedure"],["فرم","Controlled Template","کیفیت","Form"],["نامه","Inbound/Outbound","دبیرخانه","Letter"],["صورتجلسه","Meeting Link","دفتر","Minutes"],["فنی","Asset/Project Link","فنی","Technical Doc"]],
 process:["Create","Review","Approve","Publish","Use","Review Due","Revise/Archive"],
 flowDesc:"فایل بدون Metadata و Related Entity سند مدیریتی محسوب نمی‌شود؛ نسخه قبلی حذف نمی‌شود.",
 records:[["سند","نوع","Owner","نسخه","اعتبار","Related Entity","وضعیت"],[["DOC-119","دستورالعمل PM","مدیر فنی","v4","۶ ماه","Maintenance","Active"],["CON-88","قرارداد تأمین","تدارکات","v2","۲ روز","Vendor-A","هشدار"],["POL-14","سیاست خرید","مالی/خرید","v3","منقضی","Procurement","Critical"]]],
 controls:[["Version Control","نسخه قبلی Archive شود","Gate"],["Approval","Role مجاز Publish کند","Gate"],["Expiry","قبل از انقضا Owner Alert","Control"],["Access","Sensitive Scope","Gate"]],
 states:["Draft","Review","Approved","Published","Review Due","Expired","Archived"],
 exceptions:[["Policy خرید منقضی","Policy-14 Expired","Critical","مالی/خرید","Review"],["قرارداد نزدیک انقضا","۲ روز تا پایان","High","تدارکات","Renewal"],["۷ سند Review Due","در ۳۰ روز آینده","Medium","Owners","Scheduled"]],
 rules:[["Document.Expired","Critical Doc + Expired","Block/Case","Owner"],["Document.ReviewDue","Review < 30d","Action","Owner"],["Document.AccessViolation","Unauthorized Request","Security Alert","حراست"]],
 dependencies:[["Contract","تدارکات/پروژه","Commercial Entity"],["Procedure","HSE/Quality/Maintenance","Process Control"],["Minutes","جلسات","Decision/Action"],["Technical Doc","دارایی/فنی","Asset Evidence"]],
 correlations:[["ExpiredPolicy → ApprovalRisk","Policy منقضی می‌تواند تصمیم/Approval را مختل کند","Root"],["ContractExpiry → SupplyRisk","انقضای قرارداد ممکن است تأمین را متاثر کند","Impact"]],
 kpiDict:[["Review Compliance","On-time Reviews / Due","اسناد","ماهانه","100٪"],["Expired Critical Docs","Count","اسناد","روزانه","0"],["Version Integrity","Controlled / Active","کیفیت","ماهانه","100٪"],["Linked Documents","With Related Entity / Total","اسناد","ماهانه","≥95٪"]]
},
department:{
 key:"department",title:"واحد من",subtitle:"KPI، People، Cases، Actions، Risks، Approvals و Delayهای یک مدیر واحد.",defaultOwner:"مدیر واحد",
 kpis:[["KPI خارج هدف","۳","نیازمند تحلیل","amber"],["Case باز","۴","۱ High","red"],["Action معوق","۲","SLA گذشته","red"],["Approval منتظر","۳","در Inbox مدیر",""]],
 areas:[["KPI","هدف/Actual/Trend","مدیر واحد","KPI"],["People","Capacity/Attendance/Skill","مدیر واحد","HR Read"],["Cases","Open/Owner/Blocker","مدیر واحد","Case"],["Actions","Owner/Deadline","مدیر واحد","Action"],["Risks","Risk/Mitigation","مدیر واحد","Risk"],["Approvals","Pending/Authority","مدیر واحد","Approval"]],
 process:["Observe","Detect","Prioritize","Assign","Act","Follow-up","Verify"],
 flowDesc:"مدیر واحد باید Exceptionهای واحد خود را حل کند؛ فقط Authority Gap/Impact بالا Escalate می‌شود.",
 records:[["نوع","موضوع","Owner","Deadline","Blocker","وضعیت"],[["KPI","تحقق برنامه","مدیر تولید","امروز","RCA","High"],["Action","RCA خط ۲","مدیر فنی","امروز ۱۲:۰۰","—","In Progress"],["Approval","PR-912","مدیر تدارکات","امروز","Authority","Open"]]],
 controls:[["Owner","هر مورد یک Owner شخصی","Gate"],["SLA","Deadline و Escalation","Control"],["Authority","حل در پایین‌ترین سطح مجاز","Gate"],["Verification","Completed ≠ Verified","Control"]],
 states:["Normal","Warning","Actioning","Blocked","Escalated","Verified"],
 exceptions:[["۳ KPI خارج هدف","نیازمند علت/اقدام","High","مدیر واحد","Actions Open"],["۲ Action معوق","T4","High","مدیر واحد","Escalation"],["Approval منتظر","۳ مورد","Medium","مدیر واحد","Pending"]],
 rules:[["Department.KPIOffTarget","Deviation > Threshold","Corrective Action","مدیر واحد"],["Action.Overdue","T4/T5","Escalation","مدیر بالاتر"],["Approval.Pending","SLA > Threshold","Reminder","Approver"]],
 dependencies:[["People","سرمایه انسانی","Read Only"],["Budget","مالی","Budget Availability"],["Cases","Management Case Engine","Cross-unit"],["Executive","مدیرعامل","Only Exceptions"]],
 correlations:[["Multiple KPI Miss → ManagementCase","چند انحراف مرتبط می‌توانند یک Case شوند","Impact"],["Blocked Action → Dependency Owner","Blocker باید Action مستقل داشته باشد","Root"]],
 kpiDict:[["On-target KPI","Green / Total","مدیر واحد","هفتگی","≥90٪"],["Action SLA","On-time / Total","مدیر واحد","هفتگی","≥95٪"],["Open Risk","High Risks","مدیر واحد","هفتگی","0 Uncontrolled"],["Escalation Rate","Escalated / Actions","مدیر واحد","ماهانه","کاهشی"]]
}
};

var titleToKey={};
Object.keys(configs).forEach(function(k){titleToKey[configs[k].title]=k});

document.addEventListener("click",function(ev){
  var t=ev.target.closest("[data-od]");if(!t)return;
  var act=t.getAttribute("data-od"),key=t.getAttribute("data-key"),c=configs[key];
  if(act==="tab"&&c){state.active[key]=t.getAttribute("data-tab");save();renderModule(c)}
  if(act==="run-rule"&&c)runRule(c,+t.getAttribute("data-idx"));
  if(act==="module-action"&&c)actionForm(c);
  if(act==="new-event"&&c)newEvent(c);
  if(act==="save-action"&&c)saveAction(c);
  if(act==="save-event"&&c)saveEvent(c);
  if(act==="complete-action")completeAction(t.getAttribute("data-id"));
  if(act==="close")closeModal();
});

var style=document.createElement("style");
style.textContent=".od-tabs{position:sticky;top:58px;z-index:5;background:#f8fafc;padding:6px 0;overflow:auto;flex-wrap:nowrap}.od-tabs .tab{white-space:nowrap}.od-kpis{margin-bottom:13px}.od-areas{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.od-area{padding:12px!important}.od-area .pt{font-size:12px}.od-area .ps{min-height:34px}.od-flow{margin-top:12px}.od-state{display:inline-block;margin:5px 4px}.od-engine{overflow:auto;white-space:nowrap;padding-bottom:5px}.od-dep{display:grid;grid-template-columns:1fr 35px 1fr;align-items:center;gap:8px;padding:12px;border-bottom:1px solid #e2e8f0}.od-dep div{display:flex;flex-direction:column}.od-dep small{color:#64748b;margin-top:4px}.od-ex{align-items:flex-start}.od-modalbg .modal{max-width:850px}@media(max-width:850px){.od-areas{grid-template-columns:1fr}.od-dep{grid-template-columns:1fr 25px 1fr}.od-kpis{grid-template-columns:1fr 1fr!important}}";
document.head.appendChild(style);

var busy=false;
function enhance(){
 if(busy)return;
 var content=document.getElementById("content");if(!content||content.querySelector("#od-root")||content.querySelector("#hrx-root"))return;
 var h=content.querySelector(".head h2");if(!h)return;
 var key=titleToKey[h.textContent.trim()];if(!key)return;
 busy=true;renderModule(configs[key]);setTimeout(function(){busy=false},0);
}
var content=document.getElementById("content");
if(content){new MutationObserver(enhance).observe(content,{childList:true,subtree:false});setTimeout(enhance,0)}
if(window.ModuleRecordsV2){
 window.ModuleRecordsV2.onSaved=function(key){
  var cfg=configs[key];if(cfg)renderModule(cfg);
 };
}
})();