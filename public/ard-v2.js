
(function(){
"use strict";
var fa=new Intl.NumberFormat("fa-IR");
var state={
 page:"dashboard", decisionId:"DEC-142", inbox:"decision", caseFilter:"all",
 modules:[
  ["تولید و برنامه‌ریزی","تحقق تناژ، توقف و ضایعات",92,"warn","production"],
  ["گندم و سیلوها","پوشش، کیفیت و اختلاط",97,"ok","wheat"],
  ["آزمایشگاه و کیفیت","بچ، ردیابی و عدم‌انطباق",89,"warn","quality"],
  ["انبار و لجستیک","موجودی، بارگیری و تحویل",78,"crit","inventory"],
  ["فنی و نگهداری","PM، خرابی و قابلیت اطمینان",76,"crit","maintenance"],
  ["انرژی و تأسیسات","برق، گاز، آب و مصرف ویژه",95,"ok","energy"],
  ["تدارکات و تأمین","PR، RFQ، PO و فروشندگان",84,"warn","procurement"],
  ["فروش و توزیع","سفارش، حاشیه و وصول",91,"warn","sales"],
  ["مالی و خزانه","نقدینگی، تعهد و بودجه",88,"warn","finance"],
  ["سرمایه انسانی","عملکرد، شایستگی و جانشینی",86,"warn","hr"],
  ["HSE","حادثه، شبه‌حادثه و اقدام اصلاحی",98,"ok","hse"],
  ["حراست","تردد، شیفت و رخداد امنیتی",97,"ok","security"]
 ],
 attention:[
  {id:"CASE-201",title:"توقف الویتور خط ۲",desc:"۳۲ دقیقه توقف؛ علت اولیه: لرزش غیرعادی",owner:"مدیر فنی",tone:"red",impact:"تولید",status:"Monitoring"},
  {id:"CASE-231",title:"سه قلم قطعه زیر موجودی ایمن",desc:"دو قلم برای خط تولید حیاتی است؛ ETA بیشتر از پوشش موجودی",owner:"مدیر تدارکات",tone:"red",impact:"تأمین",status:"Actioning"},
  {id:"CASE-178",title:"۵ مصوبه از سررسید گذشته",desc:"قدیمی‌ترین تأخیر: ۴ روز",owner:"دفتر مدیرعامل",tone:"amber",impact:"راهبری",status:"Assigned"},
  {id:"CASE-190",title:"دو بچ منتظر تأیید آزمایشگاه",desc:"بارگیری دو سفارش وابسته به نتیجه است",owner:"مدیر کیفیت",tone:"amber",impact:"کیفیت",status:"Assigned"}
 ],
 decisions:[
  {id:"DEC-142",title:"خرید اضطراری رولبرینگ خط ۲",caseId:"CASE-231",reason:"پوشش موجودی ۲ روز و زمان تأمین سفارش باز ۵ روز است.",severity:"Critical",impact:"I4",urgency:"U5",authority:"A5",deadline:"امروز ۱۲:۳۰",financial:"۷۸۰ میلیون تومان",owner:"مدیرعامل",status:"منتظر تصمیم",recommendation:"خرید اضطراری از تأمین‌کننده B با شرط تحویل حداکثر ۴۸ ساعته.",evidence:["ITEM-6205","PO-881","WO-529","PROD-SHIFT-829"],options:[["تأمین‌کننده A","۶۹۰ میلیون","تحویل ۵ روزه؛ ریسک توقف تولید",0],["تأمین‌کننده B","۷۸۰ میلیون","تحویل ۴۸ ساعت؛ قیمت بالاتر",1],["بازسازی قطعه موجود","۲۱۰ میلیون","عدم قطعیت فنی",0]]},
  {id:"DEC-151",title:"تعیین برنامه جایگزینی مدیر شیفت تولید",caseId:"CASE-244",reason:"پست بحرانی است و جانشین آماده اکنون وجود ندارد.",severity:"High",impact:"I3",urgency:"U3",authority:"A4",deadline:"فردا",financial:"—",owner:"معاون عملیات",status:"منتظر تصمیم",recommendation:"انتصاب موقت نامزد اول و برنامه توسعه ۶ ماهه.",evidence:["POS-14","EMP-41","PERF-Q2","COMP-202"],options:[["انتصاب موقت نامزد اول","کم","نیاز به کوچینگ مدیریتی",1],["جذب بیرونی","متوسط","زمان جذب ۶ تا ۸ هفته",0]]},
  {id:"DEC-133",title:"اصلاح برنامه تولید هفتگی",caseId:"CASE-201",reason:"توقف خط باعث عقب‌ماندگی ۸٪ شده است.",severity:"Medium",impact:"I2",urgency:"U3",authority:"A3",deadline:"امروز",financial:"—",owner:"مدیر تولید",status:"در حال اجرا",recommendation:"جابجایی ترتیب دو سفارش و اضافه‌کاری محدود.",evidence:["PROD-PLAN-W38"],options:[["بازبرنامه‌ریزی سفارش‌ها","کم","حداقل",1]]}
 ],
 cases:[
  {id:"CASE-231",title:"ریسک کمبود رولبرینگ حیاتی خط ۲",status:"Actioning",severity:"Critical",priority:"P1",owner:"مدیر تدارکات",accountable:"معاون عملیات",blocker:"تصمیم خرید اضطراری",risk:"Critical",deadline:"امروز ۱۴:۰۰",source:"Inventory.LowStock",impact:"توقف احتمالی تولید",actions:[["ACT-901","گرفتن قیمت اضطراری","کارشناس خرید","Completed"],["ACT-902","بررسی فنی جایگزین","مدیر فنی","Completed"],["ACT-903","تصمیم خرید","مدیرعامل","Blocked"]],timeline:[["۰۸:۴۰","Inventory.LowStock ثبت شد"],["۰۸:۴۱","PO-881 با ETA پنج روز شناسایی شد"],["۰۸:۴۲","پوشش موجودی ۲ روز؛ پاسخ موجود ناکافی تشخیص داده شد"],["۰۸:۴۵","Management Case ایجاد و Owner تعیین شد"],["۰۹:۳۰","DEC-142 برای سطح اختیار A5 ایجاد شد"]]},
  {id:"CASE-201",title:"توقف الویتور خط ۲",status:"Monitoring",severity:"High",priority:"P2",owner:"مدیر فنی",accountable:"مدیر تولید",blocker:"ندارد",risk:"High",deadline:"امروز ۱۲:۰۰",source:"Maintenance.AssetFailed",impact:"۳۲ دقیقه توقف و ۸٪ انحراف تولید",actions:[["ACT-860","رفع لرزش و تست","سرپرست تعمیرات","Completed"],["ACT-861","RCA اولیه","مدیر فنی","In Progress"]],timeline:[["۰۶:۵۸","لرزش غیرعادی ثبت شد"],["۰۷:۰۲","خط متوقف شد"],["۰۷:۳۴","تجهیز به سرویس بازگشت"],["۰۸:۰۰","Production.TargetMissed به Root Event متصل شد"]]},
  {id:"CASE-178",title:"مصوبات معوق مدیریتی",status:"Assigned",severity:"Medium",priority:"P3",owner:"دفتر مدیرعامل",accountable:"مدیرعامل",blocker:"پاسخ سه واحد",risk:"Medium",deadline:"امروز ۱۷:۰۰",source:"Meeting.ActionOverdue",impact:"کندی اجرای تصمیمات",actions:[["ACT-780","پیگیری ۵ مصوبه","دفتر مدیرعامل","In Progress"]],timeline:[["دیروز","۵ اقدام از SLA عبور کرد"],["امروز ۰۸:۰۰","Escalation به مدیران واحد ارسال شد"]]},
  {id:"CASE-190",title:"بچ‌های کیفیت منتظر تأیید",status:"Assigned",severity:"Medium",priority:"P3",owner:"مدیر کیفیت",accountable:"مدیر تولید",blocker:"نتیجه آزمون",risk:"Medium",deadline:"امروز ۱۳:۰۰",source:"Quality.BatchHold",impact:"دو بارگیری منتظر",actions:[["ACT-801","تأیید بچ ۲۴۰۵ و ۲۴۰۶","مدیر آزمایشگاه","In Progress"]],timeline:[["۰۹:۱۵","دو بچ Hold شد"],["۰۹:۲۰","فروش و لجستیک به‌عنوان وابستگی شناسایی شدند"]]},
  {id:"CASE-244",title:"ریسک جانشینی مدیر شیفت تولید",status:"Qualified",severity:"High",priority:"P2",owner:"مدیر منابع انسانی",accountable:"معاون عملیات",blocker:"تصمیم توسعه یا انتصاب",risk:"High",deadline:"این هفته",source:"HR.KeyPositionRisk",impact:"تداوم عملیات",actions:[["ACT-990","مقایسه نامزدها","HRBP","Completed"]],timeline:[["شنبه","POS-14 به‌عنوان Critical Position علامت‌گذاری شد"],["یکشنبه","داده عملکرد، شایستگی و آموزش از منابع اصلی خوانده شد"],["امروز","هیچ نامزد Ready Now نیست؛ DEC-151 ایجاد شد"]]}
 ],
 actions:[
  {id:"ACT-903",title:"تصمیم خرید اضطراری رولبرینگ",owner:"مدیرعامل",status:"Blocked",due:"امروز ۱۲:۳۰",priority:"P1",caseId:"CASE-231"},
  {id:"ACT-861",title:"تکمیل RCA توقف الویتور",owner:"مدیر فنی",status:"In Progress",due:"امروز ۱۲:۰۰",priority:"P2",caseId:"CASE-201"},
  {id:"ACT-780",title:"پیگیری مصوبات معوق",owner:"دفتر مدیرعامل",status:"In Progress",due:"امروز ۱۷:۰۰",priority:"P3",caseId:"CASE-178"},
  {id:"ACT-801",title:"تأیید بچ‌های ۲۴۰۵ و ۲۴۰۶",owner:"مدیر آزمایشگاه",status:"In Progress",due:"امروز ۱۳:۰۰",priority:"P2",caseId:"CASE-190"}
 ],
 alerts:[
  {id:"ALT-1",purpose:"Decide",priority:"P1",title:"DEC-142 نیازمند تصمیم مدیرعامل",caseId:"CASE-231",ack:false},
  {id:"ALT-2",purpose:"Know",priority:"P2",title:"توقف خط ۲ کنترل شد؛ RCA باز است",caseId:"CASE-201",ack:true},
  {id:"ALT-3",purpose:"Escalate",priority:"P3",title:"۵ مصوبه از SLA عبور کرده‌اند",caseId:"CASE-178",ack:false},
  {id:"ALT-4",purpose:"Act",priority:"P2",title:"دو بچ کیفیت نیازمند تأیید هستند",caseId:"CASE-190",ack:false}
 ],
 inventory:[
  {id:"ITEM-6205",name:"رولبرینگ SKF 6205",stock:0,safety:8,coverage:0,eta:5,status:"بحرانی"},
  {id:"ITEM-B90",name:"تسمه صنعتی B90",stock:3,safety:7,coverage:7,eta:9,status:"ریسک"},
  {id:"ITEM-F11",name:"فیلتر غبارگیر F11",stock:5,safety:10,coverage:16,eta:12,status:"هشدار"}
 ],
 procurement:[
  {id:"PO-881",item:"ITEM-6205",vendor:"تأمین‌گستر A",eta:"۵ روز",value:"۶۹۰M",status:"تاخیر نسبت به نیاز"},
  {id:"PO-884",item:"ITEM-B90",vendor:"صنعت‌یار",eta:"۹ روز",value:"۲۴۰M",status:"در مسیر"}
 ],
 rules:[
  ["R-01","Inventory.LowStock","S2+","I2+","U3+","Coverage < ETA","Action + Case","Owner / Manager"],
  ["R-02","Maintenance.AssetFailed","S4","I3+","U4+","Critical Asset + Production Stop","Case + Executive Alert","Maintenance / CEO"],
  ["R-03","HR.KeyPositionRisk","S3+","I3+","U2+","Critical Position + Ready Now = 0","HR Risk Case","HR / Executive"],
  ["R-04","HSE.Incident","S5","I4+","U5","Severe Safety","Emergency Flow","HSE / CEO"],
  ["R-05","Action.Overdue","—","I3+","—","T4/T5 + Action Open","Escalation","Manager → Executive"],
  ["R-06","Decision.Required","S3+","I3+","U3+","Authority Gap = A5","CEO Decision","CEO Inbox"]
 ],
 risks:[
  ["توقف تولید به علت کمبود رولبرینگ","P4","I4","Critical","خرید اضطراری","High","مدیر تدارکات"],
  ["ریسک جانشینی مدیر شیفت","P3","I3","High","برنامه توسعه و انتصاب موقت","Medium","مدیر HR"]
 ],
 hr:{
  positions:[["POS-14","مدیر شیفت تولید","تولید","High"],["POS-08","مدیر آزمایشگاه","کیفیت","Low"]],
  candidates:[["EMP-41","حسین مرادی",88,74,82,91,"۶ ماهه","رهبری تیم"],["EMP-57","مهدی رضایی",84,79,76,73,"نیازمند توسعه","تصمیم‌گیری عملیاتی"],["EMP-22","علی موسوی",91,68,88,67,"نیازمند توسعه","تجربه شیفت"]]
 },
 meeting:[
  ["رفع لرزش الویتور خط ۲","مدیر فنی","امروز ۱۲:۰۰","بحرانی"],
  ["تأمین تسمه و رولبرینگ حیاتی","مدیر بازرگانی","امروز","در پیگیری"],
  ["وصول مشتری کلیدی","مدیر فروش","فردا","نیازمند تماس"],
  ["بستن عدم‌انطباق بچ ۲۴۰۵","مدیر کیفیت","فردا","باز"]
 ],
 logs:[["۱۰:۲۰","Rule Engine","DEC-142 به CEO Inbox هدایت شد"],["۰۹:۳۰","Decision Engine","DEC-142 ساخته شد"],["۰۹:۲۰","Quality","CASE-190 ایجاد شد"],["۰۸:۴۵","Case Engine","CASE-231 ساخته شد"]]
};
var groups=[
 ["فرماندهی",[["dashboard","⌂","داشبورد مدیرعامل"],["decisions","◆","مرکز تصمیم","2"],["inbox","▣","صندوق مدیرعامل","4"],["cases","◎","موضوعات مدیریتی","5"],["risks","⚠","هشدار و ریسک","3"],["mywork","✓","کارهای من","4"],["department","▤","واحد من"]]],
 ["عملیات کارخانه",[["production","▥","تولید و برنامه‌ریزی"],["wheat","◫","گندم و سیلوها"],["quality","◉","آزمایشگاه و کیفیت"],["inventory","▦","انبار و لجستیک"],["maintenance","⚙","فنی و نگهداری"],["energy","ϟ","انرژی و تأسیسات"]]],
 ["تجاری و مالی",[["procurement","⇄","تدارکات و تأمین"],["sales","◒","فروش و توزیع"],["finance","₮","مالی و خزانه"],["tax","▧","مالیات و مودیان"],["ledger","▨","دفتر کل و بستن حساب‌ها"],["assets","◇","کالا، انبار و دارایی"]]],
 ["سازمان و راهبری",[["hr","♙","سرمایه انسانی","1"],["security","◐","حراست"],["hse","✚","HSE"],["meetings","☷","جلسات و مصوبات","5"],["projects","▱","پروژه‌ها و سرمایه‌گذاری"],["bi","◫","گزارش‌های مدیریتی"],["documents","▤","اسناد"],["ai","✦","دستیار هوشمند"],["settings","⚙","تنظیمات و Rule Matrix"]]]
];
function E(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function st(t){var c=/Critical|بحران|P1/.test(t)?"critical":/High|P2|تاخیر|هشدار|در پیگیری/.test(t)?"high":/Completed|سالم|Ready|فعال/.test(t)?"ok":/Block/.test(t)?"block":/منتظر|Assigned|Actioning|Monitoring|In Progress/.test(t)?"wait":"";return '<span class="st '+c+'">'+esc(t)+'</span>'}
function chip(t){return '<span class="chip">'+esc(t)+'</span>'}
function btn(label,fn,cls){return '<button class="btn '+(cls||'')+'" onclick="'+fn+'">'+label+'</button>'}
function head(t,d,a){return '<div class="head"><div><h2>'+t+'</h2><p>'+d+'</p></div><div class="acts">'+(a||'')+'</div></div>'}
function kpi(i,l,v,f,t){return '<div class="card kpi '+(t||'')+'"><div class="kico">'+i+'</div><div><div class="kl">'+l+'</div><div class="kv">'+v+'</div><div class="kf">'+f+'</div></div></div>'}
function table(h,rows){return '<div class="tablewrap"><table class="tbl"><thead><tr>'+h.map(function(x){return '<th>'+x+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'}
function toast(m,s){var x=document.createElement("div");x.className="toast";x.innerHTML="<b>"+esc(m)+"</b>"+(s?"<small>"+esc(s)+"</small>":"");E("toasts").appendChild(x);setTimeout(function(){x.remove()},3300)}
function modal(title,body,foot){E("modal").innerHTML='<div class="modalbg" id="modalbg"><div class="modal"><div class="mh"><b>'+title+'</b><button class="close" onclick="closeModal()">×</button></div><div class="mb">'+body+'</div>'+(foot?'<div class="mf">'+foot+'</div>':'')+'</div></div>';E("modalbg").onclick=function(e){if(e.target.id==="modalbg")closeModal()}}
window.closeModal=function(){E("modal").innerHTML=""}
function liveNavCount(page,fallback){
 var K=window.ManagementKernel;if(!K||K.version!==2)return fallback||"";
 try{
  if(page==="decisions")return K.query("decisions").filter(function(x){return x.status!=="Decided"}).length;
  if(page==="inbox")return K.query("notifications").filter(function(x){return !/Resolved|Expired|Suppressed/.test(x.status)}).length;
  if(page==="cases")return K.query("cases").filter(function(x){return x.status!=="Closed"}).length;
  if(page==="risks")return K.query("risks").filter(function(x){return x.status!=="Closed"}).length;
  if(page==="mywork")return K.query("actions").filter(function(x){return !/Completed|Verified|Cancelled/.test(x.status)}).length;
  if(page==="hr")return K.queryRecords("hrCompetency").filter(function(x){return Number(x.actual)<Number(x.required)}).length;
  return "";
 }catch(e){return fallback||""}
}
function renderNav(){var n=E("nav");n.innerHTML=groups.map(function(g){return '<div class="ng">'+g[0]+'</div>'+g[1].map(function(i){var count=liveNavCount(i[0],i[3]);return '<button class="ni '+(state.page===i[0]?"active":"")+'" data-p="'+i[0]+'"><span class="ic">'+i[1]+'</span><span>'+i[2]+'</span>'+(count?'<span class="num">'+count+'</span>':'')+'</button>'}).join('')}).join('');Array.prototype.forEach.call(n.querySelectorAll("[data-p]"),function(b){b.onclick=function(){go(b.getAttribute("data-p"))}})}
window.refreshKernelNav=renderNav;
window.go=function(p){state.page=p;render();closeSide();window.scrollTo(0,0)}
function closeSide(){E("sidebar").classList.remove("open");E("overlay").classList.add("hidden")}
function dashboard(){
 var mods=state.modules.slice(0,8).map(function(m){return '<div class="card mod '+(m[3]==="ok"?"":m[3])+'" onclick="go(\''+m[4]+'\')"><span class="mdot"></span><div><div class="mn">'+m[0]+'</div><div class="ms">'+m[1]+'</div></div><div class="score">'+m[2]+'٪</div></div>'}).join('');
 var att=state.attention.map(function(a){return '<div class="att" onclick="openCase(\''+a.id+'\')"><span class="dot '+a.tone+'"></span><div style="flex:1"><h4>'+a.title+'</h4><p>'+a.desc+'</p><div class="meta">'+chip(a.owner)+chip(a.impact)+st(a.status)+'</div></div></div>'}).join('');
 var brief=[["تولید","۹۲٪ برنامه؛ ۸٪ زیر هدف"],["علت اصلی","توقف ۳۲ دقیقه‌ای الویتور خط ۲"],["انبار","۳ قلم زیر حد؛ ۲ قلم حیاتی"],["گندم","پوشش ۴۳ روز"],["HR","۱ پست کلیدی بدون جانشین آماده"],["HSE","بدون حادثه شدید"]].map(function(x){return '<div class="att"><div style="flex:1"><h4>'+x[0]+'</h4><p>'+x[1]+'</p></div></div>'}).join('');
 return head("مرکز فرمان مدیرعامل","فقط مواردی که اکنون نیاز به توجه، تصمیم یا پیگیری دارند.",btn("✦ پرسش از دستیار","go('ai')")+btn("+ ثبت موضوع","quickAdd()","primary"))+
 '<div class="hero"><h3>امروز چه چیزی نیاز به توجه، تصمیم یا پیگیری شما دارد؟</h3><p>داده پراکنده به Event، Context، Risk، Case و در صورت نیاز Decision تبدیل می‌شود؛ Routine Work به مدیرعامل Push نمی‌شود.</p><div class="chips"><span class="chip">امروز، ۲۸ شهریور ۱۴۰۵</span><span class="chip">آخرین بروزرسانی ۱۰:۲۰</span><span class="chip">بدون اتصال خودکار به راهکاران</span></div></div>'+
 '<div class="grid kpis">'+kpi("◆","تصمیم‌های منتظر","۲","یک مورد P1","red")+kpi("⚠","ریسک بحرانی","۳","۲ عملیاتی","amber")+kpi("⌛","اقدامات معوق","۵","قدیمی‌ترین ۴ روز","amber")+kpi("✓","شاخص‌های سالم","۲۶ / ۴۰","۶۵٪ در محدوده","green")+'</div>'+
 '<div class="grid two"><div class="card panel"><div class="ph"><div><div class="pt">نیازمند توجه شما</div><div class="ps">بر اساس اثر، فوریت و سطح اختیار</div></div><button class="link" onclick="go(\'cases\')">همه موضوعات ←</button></div>'+att+'</div><div class="card panel"><div class="ph"><div><div class="pt">Executive Brief</div><div class="ps">خلاصه صبحگاهی</div></div><button class="link" onclick="copyBrief()">کپی گزارش</button></div>'+brief+'</div></div>'+
 '<div class="card panel" style="margin-top:13px"><div class="ph"><div><div class="pt">سلامت حوزه‌ها</div><div class="ps">Drill-down از وضعیت به علت</div></div></div><div class="grid modules">'+mods+'</div></div>'+
 '<div class="card panel" style="margin-top:13px"><div class="ph"><div><div class="pt">پیگیری‌های کلیدی</div><div class="ps">چه کسی، چه کاری را تا چه زمانی انجام می‌دهد؟</div></div><button class="link" onclick="go(\'mywork\')">کارهای من ←</button></div>'+table(["موضوع","مسئول","سررسید","وضعیت"],state.meeting.map(function(x){return [x[0],x[1],x[2],st(x[3])] }))+'</div>'
}
function decisionDetail(d){
 return '<div class="ph"><div><div class="pt">'+d.title+'</div><div class="ps">'+d.id+' · '+d.caseId+'</div></div>'+st(d.severity)+'</div>'+
 '<div class="label">چرا الان؟</div><p class="ps">'+d.reason+'</p><div class="infogrid">'+
 [["اثر",d.impact],["فوریت",d.urgency],["اختیار",d.authority],["در معرض مالی",d.financial],["مهلت",d.deadline],["مالک",d.owner]].map(function(x){return '<div class="info"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>'}).join('')+'</div>'+
 '<div class="label">گزینه‌ها</div>'+d.options.map(function(o){return '<div class="option '+(o[3]?"rec":"")+'"><h4>'+o[0]+(o[3]?' · پیشنهاد کارشناسی':'')+'</h4><p>هزینه: '+o[1]+' · ریسک: '+o[2]+'</p></div>'}).join('')+
 '<div class="label">پیشنهاد کارشناسی</div><div class="option rec"><p>'+d.recommendation+'</p></div><div class="label">شواهد</div><div class="meta">'+d.evidence.map(chip).join('')+'</div>'+
 '<div class="acts" style="margin-top:14px">'+btn("تصمیم می‌گیرم","decisionAction('"+d.id+"','approve')","green")+btn("اطلاعات بیشتر","decisionAction('"+d.id+"','more')")+btn("ارجاع","decisionAction('"+d.id+"','delegate')")+btn("تأیید مشروط","decisionAction('"+d.id+"','conditional')")+btn("رد","decisionAction('"+d.id+"','reject')","red")+'</div>'
}
function decisions(){
 var d=state.decisions.filter(function(x){return x.id===state.decisionId})[0]||state.decisions[0];
 return head("مرکز تصمیم","Decision فقط زمانی ساخته می‌شود که Choice یا Authority لازم باشد.",btn("حافظه تصمیمات","decisionMemory()"))+
 '<div class="split"><div class="card list">'+state.decisions.map(function(x){return '<div class="li '+(x.id===d.id?"active":"")+'" onclick="selectDecision(\''+x.id+'\')"><h4>'+x.title+'</h4><p>'+x.reason+'</p><div class="meta">'+chip(x.id)+st(x.status)+'</div></div>'}).join('')+'</div><div class="card detail">'+decisionDetail(d)+'</div></div>'
}
window.selectDecision=function(id){state.decisionId=id;render()}
window.decisionAction=function(id,type){
 var d=state.decisions.filter(function(x){return x.id===id})[0],body="";
 if(type==="approve")body='<div class="field"><label>گزینه منتخب</label><select id="mopt">'+d.options.map(function(o){return '<option>'+o[0]+'</option>'}).join('')+'</select></div><div class="field"><label>دلیل تصمیم</label><textarea id="mnote">بر اساس Context Pack و شواهد ثبت‌شده.</textarea></div>';
 if(type==="more")body='<div class="field"><label>اطلاعات موردنیاز</label><textarea id="mnote" placeholder="مثلاً زمان تحویل قطعی"></textarea></div>';
 if(type==="delegate")body='<div class="field"><label>ارجاع به</label><select id="mopt"><option>معاون عملیات</option><option>مدیر مالی</option><option>مدیر تولید</option></select></div>';
 if(type==="conditional")body='<div class="field"><label>شرط</label><textarea id="mnote">تأیید مشروط به تحویل حداکثر ۴۸ ساعته.</textarea></div>';
 if(type==="reject")body='<div class="field"><label>علت رد</label><select id="mopt"><option>اطلاعات ناکافی</option><option>ریسک ناموجه</option><option>عدم انطباق با سیاست</option></select></div>';
 modal("ثبت اقدام روی "+id,'<div class="form">'+body+'</div>',btn("ثبت","commitDecision('"+id+"','"+type+"')","primary")+btn("انصراف","closeModal()"))
}
window.commitDecision=function(id,type){
 var d=state.decisions.filter(function(x){return x.id===id})[0],map={approve:"تصمیم ثبت شد",more:"Waiting for Information",delegate:"ارجاع شد",conditional:"Approved With Conditions",reject:"رد شد"};d.status=map[type];
 if(type==="approve"||type==="conditional"){var c=state.cases.filter(function(x){return x.id===d.caseId})[0];if(c){c.timeline.push(["اکنون","تصمیم "+id+" ثبت و Action اجرایی ایجاد شد"]);c.status="Actioning"}state.actions.unshift({id:"ACT-"+Math.floor(Math.random()*900+100),title:"اقدام اجرایی ناشی از "+id,owner:"مدیر تدارکات",status:"Assigned",due:"طبق تصمیم",priority:"P2",caseId:d.caseId})}
 closeModal();toast(map[type],id+" بروزرسانی شد");render()
}
function inbox(){
 var tabs=[["decision","تصمیم من"],["critical","بحرانی"],["follow","پیگیری"],["info","برای اطلاع"]],arr=[];
 if(state.inbox==="decision")arr=state.decisions.filter(function(x){return /منتظر/.test(x.status)});
 else if(state.inbox==="critical")arr=state.cases.filter(function(x){return x.severity==="Critical"||x.priority==="P1"});
 else if(state.inbox==="follow")arr=state.cases.filter(function(x){return ["Actioning","Monitoring","Assigned"].indexOf(x.status)>=0});
 else arr=state.alerts.filter(function(x){return x.purpose==="Know"});
 return head("صندوق مدیرعامل","Dashboard = What Matters؛ Inbox = What Requires Attention.")+
 '<div class="tabs">'+tabs.map(function(t){return '<button class="tab '+(state.inbox===t[0]?"active":"")+'" onclick="setInbox(\''+t[0]+'\')">'+t[1]+'</button>'}).join('')+'</div><div class="card panel">'+
 (arr.length?arr.map(function(x){if(x.id.indexOf("DEC")===0)return '<div class="att" onclick="selectDecision(\''+x.id+'\');go(\'decisions\')"><span class="dot red"></span><div style="flex:1"><h4>'+x.title+'</h4><p>'+x.reason+'</p></div>'+st(x.status)+'</div>';if(x.id.indexOf("CASE")===0)return '<div class="att" onclick="openCase(\''+x.id+'\')"><span class="dot '+(x.severity==="Critical"?"red":"amber")+'"></span><div style="flex:1"><h4>'+x.title+'</h4><p>'+x.impact+'</p></div>'+st(x.status)+'</div>';return '<div class="att"><span class="dot"></span><div><h4>'+x.title+'</h4><p>'+x.purpose+' · '+x.priority+'</p></div></div>'}).join(''):'<div class="option"><p>مورد فعالی در این بخش نیست.</p></div>')+'</div>'
}
window.setInbox=function(x){state.inbox=x;render()}
function cases(){
 var tabs=[["all","همه"],["critical","بحرانی"],["decision","منتظر تصمیم"],["overdue","عقب‌افتاده"]],a=state.cases.slice();
 if(state.caseFilter==="critical")a=a.filter(function(x){return x.severity==="Critical"||x.priority==="P1"});
 if(state.caseFilter==="decision")a=a.filter(function(x){return /تصمیم/.test(x.blocker)});
 if(state.caseFilter==="overdue")a=a.filter(function(x){return x.id==="CASE-178"});
 return head("موضوعات مدیریتی","یک Thread واحد برای Event، Risk، Action، Decision و نتیجه.",btn("+ موضوع جدید","quickAdd()","primary"))+
 '<div class="tabs">'+tabs.map(function(t){return '<button class="tab '+(state.caseFilter===t[0]?"active":"")+'" onclick="setCaseFilter(\''+t[0]+'\')">'+t[1]+'</button>'}).join('')+'</div>'+
 table(["شناسه","موضوع","شدت","مالک","وضعیت","Blocker",""],a.map(function(c){return [c.id,c.title,st(c.severity),c.owner,st(c.status),c.blocker,'<button class="btn sm" onclick="openCase(\''+c.id+'\')">جزئیات</button>']}))
}
window.setCaseFilter=function(x){state.caseFilter=x;render()}
window.openCase=function(id){
 var c=state.cases.filter(function(x){return x.id===id})[0];if(!c)return;
 var info=[["مالک",c.owner],["پاسخگو",c.accountable],["شدت",c.severity],["اولویت",c.priority],["ریسک",c.risk],["مهلت",c.deadline]].map(function(x){return '<div class="info"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>'}).join('');
 var acts=c.actions.map(function(a){return '<div class="att"><span class="dot '+(a[3]==="Completed"?"":"amber")+'"></span><div style="flex:1"><h4>'+a[1]+'</h4><p>'+a[0]+' · '+a[2]+'</p></div>'+st(a[3])+'</div>'}).join('');
 var tl=c.timeline.map(function(t){return '<div class="tl"><b>'+t[0]+'</b><p>'+t[1]+'</p></div>'}).join('');
 modal(c.id+" — "+c.title,'<div class="infogrid">'+info+'</div><div class="label">زنجیره اثر</div><div class="flow"><span class="step done">'+c.source+'</span><span>←</span><span class="step active">'+c.title+'</span><span>←</span><span class="step">'+c.impact+'</span></div><div class="label">اقدامات</div>'+acts+'<div class="label">Timeline</div><div class="timeline">'+tl+'</div>',btn("مرحله بعد","advanceCase('"+id+"')","primary")+btn("+ اقدام","addAction('"+id+"')")+btn("بستن","closeModal()"))
}
window.advanceCase=function(id){var c=state.cases.filter(function(x){return x.id===id})[0],s=["Detected","Qualified","Assigned","Actioning","Monitoring","Resolved","Verified","Closed"],i=s.indexOf(c.status);c.status=s[Math.min(i+1,s.length-1)];c.timeline.push(["اکنون","وضعیت به "+c.status+" تغییر کرد"]);closeModal();toast("وضعیت Case بروزرسانی شد",id+" → "+c.status);render()}
window.addAction=function(id){closeModal();modal("ایجاد اقدام",'<div class="form"><div class="field full"><label>عنوان</label><input id="at" value="اقدام جدید"></div><div class="field"><label>مسئول</label><select id="ao"><option>مدیر تدارکات</option><option>مدیر فنی</option><option>دفتر مدیرعامل</option></select></div><div class="field"><label>مهلت</label><input id="ad" value="امروز ۱۷:۰۰"></div></div>',btn("ایجاد","commitAction('"+id+"')","primary"))}
window.commitAction=function(id){var c=state.cases.filter(function(x){return x.id===id})[0],aid="ACT-"+Math.floor(Math.random()*900+100),t=E("at").value,o=E("ao").value,d=E("ad").value;c.actions.push([aid,t,o,"Assigned"]);c.timeline.push(["اکنون",aid+" برای "+o+" ایجاد شد"]);state.actions.unshift({id:aid,title:t,owner:o,status:"Assigned",due:d,priority:"P3",caseId:id});closeModal();toast("Action ایجاد شد",aid);render()}
function risks(){
 return head("مرکز هشدار و ریسک","Risk با Case یکی نیست؛ Risk آینده‌نگر و Case مسئله رخ‌داده است.")+
 '<div class="grid kpis">'+kpi("⚠","Critical","۱","نیازمند کنترل","red")+kpi("▲","High","۱","در برنامه کاهش","amber")+kpi("◉","اعلان فعال",fa.format(state.alerts.length),"گروه‌بندی بر اساس Case","")+kpi("✓","Ack شده",fa.format(state.alerts.filter(function(a){return a.ack}).length),"Acknowledged ≠ Resolved","green")+'</div>'+
 '<div class="grid two"><div class="card panel"><div class="ph"><div><div class="pt">Risk Register</div><div class="ps">Initial → Control → Residual</div></div></div>'+table(["ریسک","احتمال","اثر","اولیه","کنترل","باقیمانده","مالک"],state.risks.map(function(r){return [r[0],r[1],r[2],st(r[3]),r[4],st(r[5]),r[6]]}))+'</div><div class="card panel"><div class="pt">اعلان‌ها</div><div class="ps">Know / Act / Decide / Escalate</div>'+state.alerts.map(function(a){return '<div class="att"><span class="dot '+(a.priority==="P1"?"red":a.priority==="P2"?"amber":"")+'"></span><div style="flex:1"><h4>'+a.title+'</h4><p>'+a.purpose+' · '+a.priority+' · '+a.caseId+'</p></div><button class="btn sm" onclick="ack(\''+a.id+'\')">'+(a.ack?"Ack ✓":"Acknowledge")+'</button></div>'}).join('')+'</div></div>'
}
window.ack=function(id){var a=state.alerts.filter(function(x){return x.id===id})[0];a.ack=true;toast("اعلان تأیید شد","Acknowledge به معنی حل موضوع نیست");render()}
function mywork(){
 return head("کارهای من","اقدام، تصمیم، هشدار و موارد منتظر دیگران در یک صفحه.")+
 '<div class="grid kpis">'+kpi("✓","اقدامات باز",fa.format(state.actions.filter(function(a){return a.status!=="Completed"}).length),"اختصاص داده‌شده","")+kpi("◆","تصمیم‌های من","۲","یک مورد P1","red")+kpi("⌛","عقب‌افتاده","۱","نیازمند Escalation","amber")+kpi("◌","منتظر دیگران","۲","Blocker فعال","")+'</div>'+
 table(["شناسه","اقدام","مالک","مهلت","اولویت","وضعیت",""],state.actions.map(function(a){return [a.id,a.title,a.owner,a.due,st(a.priority),st(a.status),'<button class="btn sm" onclick="completeAction(\''+a.id+'\')">تکمیل</button>']}))
}
window.completeAction=function(id){var a=state.actions.filter(function(x){return x.id===id})[0];if(!a)return;a.status="Completed";var c=state.cases.filter(function(x){return x.id===a.caseId})[0];if(c)c.timeline.push(["اکنون",id+" تکمیل شد؛ منتظر Verification"]);toast("Action تکمیل شد","Case مهم هنوز Verification لازم دارد");render()}
function hr(){
 var pos=state.hr.positions.map(function(p){return '<div class="att"><span class="dot '+(p[3]==="High"?"red":"")+'"></span><div style="flex:1"><h4>'+p[1]+'</h4><p>'+p[0]+' · '+p[2]+'</p></div>'+st(p[3])+'</div>'}).join('');
 var cand=state.hr.candidates.map(function(c){var score=Math.round((c[2]+c[3]+c[4]+c[5])/4);return '<div class="att"><div style="flex:1"><h4>'+c[1]+'</h4><p>Gap: '+c[7]+' · امتیاز ترکیبی '+score+'</p><div class="meta">'+chip("عملکرد "+c[2])+chip("شایستگی "+c[3])+chip("آموزش "+c[4])+'</div></div>'+st(c[6])+'</div>'}).join('');
 return head("سرمایه انسانی","Performance، Training و Competency منبع اصلی خودشان را دارند؛ Succession دوباره‌کاری نمی‌کند.",btn("راهنمای معماری","toast('اصل معماری','Position مستقل از Person است')"))+
 '<div class="tabs"><button class="tab active">جانشین‌پروری</button><button class="tab" onclick="toast(\'Performance\',\'منبع اصلی مستقل\')">عملکرد</button><button class="tab" onclick="toast(\'Training\',\'اثربخشی آموزش در منبع اصلی\')">آموزش</button><button class="tab" onclick="toast(\'Competency\',\'Gap ورودی جانشینی است\')">شایستگی</button></div>'+
 '<div class="grid two"><div class="card panel"><div class="pt">پست‌های کلیدی</div><div class="ps">Position مستقل از Person</div>'+pos+'<div class="flow"><span class="step done">واحد</span><span>←</span><span class="step done">پست</span><span>←</span><span class="step active">Critical?</span><span>←</span><span class="step">نامزدها</span><span>←</span><span class="step">Readiness</span></div></div><div class="card panel"><div class="pt">نامزدهای POS-14</div><div class="ps">READ: Performance + Training + Competency + Experience · WRITE: Readiness + Gap + Development Plan</div>'+cand+btn("ساخت برنامه توسعه","toast('برنامه توسعه ساخته شد','هیچ نمره عملکرد یا آموزشی دوباره ثبت نشد')","primary")+'</div></div>'
}
function inventory(){
 return head("انبار و لجستیک","موجودی هوشمند = Quantity + Consumption + Coverage + Lead Time + Existing Response.",btn("+ ثبت گردش","quickAdd()","primary"))+
 '<div class="flow"><span class="step done">Low Stock</span><span>←</span><span class="step done">Open PR/PO?</span><span>←</span><span class="step active">ETA vs Coverage</span><span>←</span><span class="step">Action / Case</span></div>'+
 table(["کد","کالا","موجودی","Safety","پوشش","ETA","وضعیت",""],state.inventory.map(function(i){return [i.id,i.name,fa.format(i.stock),fa.format(i.safety),i.coverage+" روز",i.eta+" روز",st(i.status),'<button class="btn sm" onclick="stockDetail(\''+i.id+'\')">تحلیل</button>']}))
}
window.stockDetail=function(id){var i=state.inventory.filter(function(x){return x.id===id})[0],po=state.procurement.filter(function(x){return x.item===id})[0],bad=i.coverage<i.eta;modal("تحلیل موجودی — "+i.name,'<div class="infogrid">'+[["موجودی",i.stock],["Safety",i.safety],["پوشش",i.coverage+" روز"],["ETA",i.eta+" روز"],["سفارش باز",po?po.id:"ندارد"],["Rule Result",bad?"Existing Response ناکافی":"Monitor"]].map(function(x){return '<div class="info"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>'}).join('')+'</div><div class="label">خروجی موتور</div><div class="option '+(bad?"rec":"")+'"><p>'+(bad?"Case حفظ و Decision Gate بررسی می‌شود.":"Action جدید ساخته نمی‌شود؛ Monitoring کافی است.")+'</p></div>',btn("مشاهده Case","closeModal();go('cases')","primary"))}
function procurement(){
 return head("تدارکات و تأمین","PR → RFQ → Quotation → Comparison → Approval → PO → Delivery → GRN → Invoice → Payment")+
 '<div class="flow">'+["PR","RFQ","Quotation","Comparison","Approval","PO","Delivery","GRN","Invoice","Payment"].map(function(x,i){return '<span class="step '+(i<6?"done":i===6?"active":"")+'">'+x+'</span>'+(i<9?'<span>←</span>':'')}).join('')+'</div>'+
 table(["PO","کالا","فروشنده","ETA","مبلغ","وضعیت"],state.procurement.map(function(p){return [p.id,p.item,p.vendor,p.eta,p.value,st(p.status)]}))+
 '<div class="card panel" style="margin-top:12px"><div class="pt">Vendor Score از تراکنش واقعی</div><div class="ps">قیمت، کیفیت، زمان تحویل، پاسخ‌گویی، تأخیر و مرجوعی؛ نه ستاره تزئینی.</div></div>'
}
function maintenance(){
 return head("فنی و نگهداری","Asset → Failure → Work Order → Part → Inventory/Procurement → Repair → Test → RCA")+
 '<div class="grid kpis">'+kpi("⚙","توقف امروز","۳۲ دقیقه","الویتور خط ۲","amber")+kpi("▦","WO باز","۳","۱ اولویت بالا","")+kpi("✓","PM به‌موقع","۹۴٪","ماه جاری","green")+kpi("↻","خرابی تکراری","۱","نیازمند RCA","red")+'</div>'+
 '<div class="card panel"><div class="flow"><span class="step done">Asset Failure</span><span>←</span><span class="step done">WO-529</span><span>←</span><span class="step done">Inventory</span><span>←</span><span class="step active">Procurement Dependency</span><span>←</span><span class="step">Verified</span></div><div class="att" onclick="openCase(\'CASE-201\')"><span class="dot amber"></span><div style="flex:1"><h4>الویتور خط ۲</h4><p>Production.TargetMissed به Root Event خرابی متصل شده و Alert جدا ساخته نشده.</p></div>'+st("Monitoring")+'</div></div>'
}
function generic(title,desc,k,extra){
 return head(title,desc,btn("+ ثبت اطلاعات","quickAdd()","primary"))+
 '<div class="grid kpis">'+k.map(function(x,i){return kpi(["◉","◆","✓","⚠"][i%4],x[0],x[1],"نمونه عملیاتی",i===2?"green":i===3?"amber":"")}).join('')+'</div>'+
 (extra?'<div class="card panel">'+extra+'</div>':'')+
 '<div class="card panel" style="margin-top:12px"><div class="pt">منطق این حوزه</div><div class="ps">Data در منبع اصلی ثبت می‌شود؛ Event وارد Rule Engine می‌شود؛ فقط Exception معنادار به Action / Case / Decision تبدیل می‌شود.</div></div>'
}
function production(){return generic("تولید و برنامه‌ریزی","Plan vs Actual، توقف، ضایعات، کیفیت و بهره‌وری.",[["برنامه","۴۵۰ تن"],["واقعی","۴۱۴ تن"],["تحقق","۹۲٪"],["توقف","۳۲ دقیقه"]],'<div class="option rec"><p>Maintenance.AssetFailed → Production.Downtime → Production.TargetMissed در یک Case correlate شده‌اند.</p></div>')}
function wheat(){return generic("گندم و سیلوها","ورودی گندم، موجودی هر سیلو، افت، خواب موجودی و برنامه اختلاط.",[["پوشش","۴۳ روز"],["سیلو فعال","۶"],["افت","۰.۸٪"],["ریسک تأمین","پایین"]])}
function quality(){return generic("آزمایشگاه و کیفیت","کیفیت گندم و آرد، ردیابی بچ، شکایت و عدم‌انطباق.",[["بچ منتظر","۲"],["عدم‌انطباق","۱"],["قبولی","۹۶٪"],["شکایت","۰"]],'<div class="att" onclick="openCase(\'CASE-190\')"><span class="dot amber"></span><div><h4>دو بچ منتظر تأیید</h4><p>دو بارگیری به نتیجه وابسته‌اند.</p></div></div>')}
function finance(){return generic("مالی و خزانه","تعهدات، پرداخت و دریافت آتی، بودجه، هزینه و Cash Forecast.",[["نقدینگی","۱۸ میلیارد"],["پرداخت ۷ روزه","۷ میلیارد"],["دریافت ۷ روزه","۳ میلیارد"],["ریسک","متوسط"]],'<div class="option"><p>این لایه جایگزین حسابداری عملیاتی نیست و اتصال خودکار به راهکاران ندارد.</p></div>')}
function hse(){return generic("HSE","Incident → Investigation → Root Cause → Corrective Action → Verification.",[["حادثه شدید","۰"],["Near Miss","۲"],["اقدام باز","۳"],["مجوز کار","۴"]],'<div class="flow"><span class="step done">Incident</span><span>←</span><span class="step done">Investigation</span><span>←</span><span class="step active">Corrective Action</span><span>←</span><span class="step">Verification</span></div>')}
function security(){return generic("حراست","تردد کارکنان، مهمان و پیمانکار، شیفت، گشت، مجوز و رخداد.",[["ورود غیرمجاز","۰"],["مهمان","۷"],["پوشش پست","۱۰۰٪"],["رخداد باز","۱"]])}
function energy(){return generic("انرژی و تأسیسات","برق، گاز، آب، هوای فشرده، ژنراتور و مصرف ویژه.",[["برق","نرمال"],["گاز","نرمال"],["آب","نرمال"],["ژنراتور","آماده"]])}
function sales(){return generic("فروش و توزیع","سفارش، مشتری، حاشیه، بارگیری و وصول.",[["تحویل به‌موقع","۹۱٪"],["سفارش امروز","۱۴"],["وصول معوق","۱"],["وابسته به QC","۲"]])}
function tax(){return generic("مالیات و سامانه مودیان","تقویم تعهدات، صورتحساب، ارزش افزوده و ابلاغیه.",[["تعهد نزدیک","۲"],["مغایرت","۱"],["ارسال خودکار","غیرفعال"],["ریسک","پایین"]])}
function ledger(){return generic("دفتر کل و بستن حساب‌ها","کدینگ، اسناد، تراز آزمایشی، مغایرت و بستن دوره.",[["دوره باز","شهریور"],["مغایرت","۲"],["اسناد منتظر","۷"],["کنترل دسترسی","فعال"]])}
function assets(){return generic("کالا، انبار و دارایی","Item Master و Asset Master منابع یکتای داده هستند.",[["کالا فعال","۴۲۰"],["دارایی","۱۸۷"],["دارایی بحرانی","۱۲"],["مغایرت Master","۳"]],'<div class="option"><p>Work Order تجهیز را از Asset Master انتخاب می‌کند؛ نام تجهیز متن آزاد نیست.</p></div>')}
function department(){return generic("واحد من","KPI، People، Open Cases، Actions، Risks، Approvals و Delays.",[["KPI خارج هدف","۳"],["Case باز","۴"],["Action معوق","۲"],["ریسک بالا","۱"]])}
function meetings(){return head("جلسات و مصوبات","جلسه به Decision و Action تبدیل می‌شود؛ نه فایل منفعل.",btn("+ جلسه","quickAdd()","primary"))+table(["موضوع","مسئول","سررسید","وضعیت"],state.meeting.map(function(x){return [x[0],x[1],x[2],st(x[3])] }))}
function projects(){return generic("پروژه‌ها و سرمایه‌گذاری","Milestone، Critical Path، بودجه، CAPEX، ریسک و پیمانکار.",[["پروژه فعال","۴"],["Milestone دیرکرد","۱"],["CAPEX باز","۲"],["ریسک بالا","۱"]],'<div class="option"><p>Delay فقط وقتی Critical Path یا Impact Threshold را رد کند، Case مدیریتی می‌شود.</p></div>')}
function bi(){return head("گزارش‌های مدیریتی و BI","KPI Dictionary واحد و Executive Brief روزانه، هفتگی و ماهانه.")+'<div class="grid three"><div class="card panel"><div class="pt">روزانه</div><div class="ps">What Changed / What Matters / Decision Needed</div></div><div class="card panel"><div class="pt">هفتگی</div><div class="ps">بهبود، افت، تکرار و ریسک هفته بعد</div></div><div class="card panel"><div class="pt">ماهانه</div><div class="ps">عملکرد، مالی، HR، HSE و پروژه</div></div></div>'}
function documents(){return generic("اسناد","قرارداد، دستورالعمل، فرم، نامه، گزارش، صورتجلسه و مستندات فنی.",[["اسناد فعال","۱,۲۸۰"],["منقضی","۳"],["نیاز بازبینی","۷"],["دسترسی محدود","۱۲"]],'<div class="option"><p>هر سند: Version + Owner + Access + Expiry + Related Entity.</p></div>')}
function settings(){
 return head("تنظیمات و Rule Matrix","Thresholdها تنظیم‌پذیرند و هیچ حد سازمانی به‌صورت حدسی قفل نشده.",btn("+ Rule","addRule()","primary"))+
 '<div class="rules">'+["EVENT","VALIDATE","DEDUP","CONTEXT","SEVERITY","IMPACT","URGENCY","RESPONSE","OWNER","ACTION/CASE","DECISION","NOTIFY","SLA","ESCALATE","VERIFY","LEARN"].map(function(x,i){return '<span class="rn">'+x+'</span>'+(i<15?'<span class="arr">←</span>':'')}).join('')+'</div>'+
 '<div class="grid rulegrid">'+[["S0–S5","Severity"],["I0–I5","Impact"],["U0–U5","Urgency"],["A1–A6","Authority"],["T0–T5","SLA"],["R0–R5","Response"]].map(function(x){return '<div class="card rcode"><b>'+x[0]+'</b><small>'+x[1]+'</small></div>'}).join('')+'</div>'+
 '<div class="card panel" style="margin-top:12px">'+table(["Rule","Event","Severity","Impact","Urgency","شرط","خروجی","اعلان"],state.rules.map(function(r){return [r[0],r[1],r[2],r[3],r[4],r[5],st(r[6]),r[7]]}))+'</div>'+
 '<div class="card panel" style="margin-top:12px"><div class="flow"><span class="step">DATA ≠ EVENT</span><span class="step">EVENT ≠ ALERT</span><span class="step">ALERT ≠ ACTION</span><span class="step">ACTION ≠ CASE</span><span class="step">CASE ≠ APPROVAL</span><span class="step">APPROVAL ≠ DECISION</span><span class="step">DECISION ≠ ESCALATION</span></div></div>'
}
window.addRule=function(){modal("Rule جدید",'<div class="form"><div class="field"><label>Event</label><input id="re" value="Custom.Event"></div><div class="field"><label>Output</label><select id="ro"><option>Action</option><option>Case</option><option>Decision</option><option>Executive Alert</option></select></div><div class="field full"><label>Condition</label><textarea id="rc">Impact >= I3</textarea></div></div>',btn("ذخیره","saveNewRule()","primary"))}
window.saveNewRule=function(){state.rules.push(["R-"+Math.floor(Math.random()*90+10),E("re").value,"S2+","I3+","U3+",E("rc").value,E("ro").value,"Owner"]);closeModal();toast("Rule ذخیره شد");render()}
function ai(){
 return head("دستیار هوشمند مدیرعامل","AI روی Business Logic سوار است؛ داده نمی‌سازد و به‌جای مدیر تصمیم نمی‌گیرد.")+
 '<div class="card ai"><div class="aimsgs" id="aimsgs"><div class="msg bot"><b>دستیار:</b><br>پاسخ من باید Evidence، Impact، Current Action، Owner و Next Milestone داشته باشد.<div class="quick"><button onclick="askAI(\'چرا تولید امروز کمتر از برنامه بود؟\')">چرا تولید کم شد؟</button><button onclick="askAI(\'کدام خریدها عقب هستند؟\')">خریدهای عقب</button><button onclick="askAI(\'برای مدیر شیفت چه جانشینی داریم؟\')">جانشینی</button></div></div></div><div class="aiinput"><input id="aiq" placeholder="مثلاً چرا تولید پایین‌تر از برنامه است؟"><button class="btn primary" onclick="askAI()">ارسال</button></div></div>'
}
window.askAI=function(q){var inp=E("aiq");q=q||(inp&&inp.value.trim());if(!q)return;var b=E("aimsgs");b.insertAdjacentHTML("beforeend",'<div class="msg user">'+esc(q)+'</div>');if(inp)inp.value="";var a;if(/تولید|برنامه/.test(q))a='<b>Answer:</b> تحقق تولید ۹۲٪ است.<br><b>Evidence:</b> WO-529, CASE-201, PROD-SHIFT-829<br><b>Impact:</b> ۸٪ انحراف.<br><b>Current Action:</b> تجهیز برگشته؛ RCA باز است.<br><b>Owner:</b> مدیر فنی / تولید<br><b>Next Milestone:</b> تکمیل RCA تا ۱۲:۰۰.';else if(/خرید|تدارک|عقب/.test(q))a='<b>Answer:</b> PO-881 نسبت به نیاز عملیاتی دیر است.<br><b>Evidence:</b> ITEM-6205, PO-881, CASE-231<br><b>Impact:</b> ریسک توقف تولید.<br><b>Current Action:</b> DEC-142.<br><b>Owner:</b> مدیر تدارکات<br><b>Next Milestone:</b> تصمیم تا ۱۲:۳۰.';else if(/جانشین|مدیر شیفت/.test(q))a='<b>Answer:</b> برای POS-14 جانشین Ready Now نداریم.<br><b>Evidence:</b> Performance، Training و Competency از منابع اصلی خوانده شده‌اند.<br><b>Impact:</b> High.<br><b>Current Action:</b> Development Plan + DEC-151.<br><b>Owner:</b> HR.';else a='اطلاعات کافی برای پاسخ قطعی وجود ندارد. سیستم نباید علت را حدس بزند.';b.insertAdjacentHTML("beforeend",'<div class="msg bot">'+a+'</div>');b.scrollTop=b.scrollHeight}
window.quickAdd=function(){modal("ثبت موضوع",'<div class="form"><div class="field full"><label>عنوان</label><input id="qt" placeholder="عنوان موضوع"></div><div class="field"><label>حوزه</label><select><option>تولید</option><option>تدارکات</option><option>HR</option><option>HSE</option></select></div><div class="field"><label>شدت اولیه</label><select id="qs"><option>Medium</option><option>High</option><option>Critical</option></select></div><div class="field full"><label>شرح</label><textarea></textarea></div></div>',btn("ثبت و ارزیابی Rule","saveQuick()","primary"))}
window.saveQuick=function(){var id="CASE-"+Math.floor(Math.random()*900+100),sev=E("qs").value;state.cases.unshift({id:id,title:E("qt").value||"موضوع جدید",status:"Detected",severity:sev,priority:sev==="Critical"?"P1":"P3",owner:"تعیین نشده",accountable:"—",blocker:"—",risk:sev,deadline:"تعیین شود",source:"Manual.Entry",impact:"نیازمند ارزیابی",actions:[],timeline:[["اکنون","موضوع ثبت و برای Rule Assessment ارسال شد"]]});closeModal();toast("موضوع ثبت شد",id+" · Detected");go("cases")}
window.copyBrief=function(){var t="گزارش صبحگاهی: تولید ۹۲٪؛ توقف الویتور خط ۲؛ ۳ قلم زیر حد؛ پوشش گندم ۴۳ روز؛ ۲ تصمیم فعال؛ ۱ ریسک جانشینی.";if(navigator.clipboard)navigator.clipboard.writeText(t);toast("Executive Brief کپی شد")}
window.decisionMemory=function(){modal("حافظه تصمیمات سازمان",'<div class="timeline"><div class="tl"><b>DEC-088</b><p>تعویض Bearing خط ۱ → کاهش ۴ ساعت توقف ماهانه.</p></div><div class="tl"><b>DEC-071</b><p>تغییر ترتیب PM → خرابی تکراری ۱۸٪ کمتر شد.</p></div></div><div class="option"><p>Expected vs Actual حذف نمی‌شود و برای تصمیم آینده می‌ماند.</p></div>')}
function render(){
 var map={dashboard:dashboard,decisions:decisions,inbox:inbox,cases:cases,risks:risks,mywork:mywork,department:department,production:production,wheat:wheat,quality:quality,inventory:inventory,maintenance:maintenance,energy:energy,procurement:procurement,sales:sales,finance:finance,tax:tax,ledger:ledger,assets:assets,hr:hr,security:security,hse:hse,meetings:meetings,projects:projects,bi:bi,documents:documents,ai:ai,settings:settings};
 E("content").innerHTML=(map[state.page]||dashboard)();renderNav();if(state.page==="ai"){var q=E("aiq");if(q)q.onkeydown=function(e){if(e.key==="Enter")askAI()}}
}
function setupSearch(){var i=E("gsearch"),box=E("searchres");i.oninput=function(){var q=i.value.trim().toLowerCase();if(!q){box.classList.add("hidden");return}var a=[],K=window.ManagementKernel;
 if(K&&K.version===2){
  K.query("cases").forEach(function(x){a.push({t:x.title,s:x.id+" · Case",f:function(){go("cases")}})});
  K.query("decisions").forEach(function(x){a.push({t:x.title,s:x.id+" · Decision",f:function(){go("decisions")}})});
  K.queryRecords("inventoryItem").forEach(function(x){a.push({t:x.name||x.id,s:x.id+" · کالا",f:function(){go("inventory")}})});
 }else{
  state.cases.forEach(function(x){a.push({t:x.title,s:x.id+" · Case",f:function(){openCase(x.id)}})});
  state.decisions.forEach(function(x){a.push({t:x.title,s:x.id+" · Decision",f:function(){state.decisionId=x.id;go("decisions")}})});
  state.inventory.forEach(function(x){a.push({t:x.name,s:x.id+" · کالا",f:function(){go("inventory")}})});
 }
 var r=a.filter(function(x){return (x.t+" "+x.s).toLowerCase().indexOf(q)>=0}).slice(0,8);box.innerHTML=r.length?r.map(function(x,n){return '<div class="sr" data-n="'+n+'"><b>'+esc(x.t)+'</b><small>'+esc(x.s)+'</small></div>'}).join(''):'<div class="sr"><small>نتیجه‌ای پیدا نشد.</small></div>';box.classList.remove("hidden");Array.prototype.forEach.call(box.querySelectorAll("[data-n]"),function(e){e.onclick=function(){r[+e.getAttribute("data-n")].f();i.value="";box.classList.add("hidden")}})};document.addEventListener("click",function(e){if(!e.target.closest(".search"))box.classList.add("hidden")})}
E("menu").onclick=function(){E("sidebar").classList.toggle("open");E("overlay").classList.toggle("hidden")};E("overlay").onclick=closeSide;E("aib").onclick=function(){go("ai")};E("nb").onclick=function(){go("inbox")};setupSearch();render();
})();
