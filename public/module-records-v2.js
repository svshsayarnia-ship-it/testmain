(function(){
"use strict";
var K=window.ManagementKernel;if(!K||K.version!==2)return;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fa(n){try{return new Intl.NumberFormat("fa-IR").format(n)}catch(e){return n}}
function st(t){var c=/Critical|Emergency|Blocked|Delayed|Expired|High|Overdue|Hold|Failed/.test(String(t))?"critical":/Warning|Open|Medium|At Risk|Due|In Progress/.test(String(t))?"high":/Normal|Completed|Released|Ready|Active|Approved/.test(String(t))?"ok":"wait";return '<span class="st '+c+'">'+esc(t)+'</span>'}
function def(key,kind,fields,columns,seeds){return {key:key,kind:kind,fields:fields,columns:columns,seeds:seeds}}
var modules={
 production:def("production","productionShift",[
  ["id","شناسه","text"],["plan","برنامه (تن)","number"],["actual","واقعی (تن)","number"],["downtimeMin","توقف (دقیقه)","number"],["assetId","تجهیز مرتبط","text"],["status","وضعیت","select",["Completed","Running","Interrupted"]]
 ],[["id","شیفت"],["plan","برنامه"],["actual","واقعی"],["downtimeMin","توقف"],["assetId","تجهیز"],["status","وضعیت"]],[
  {id:"PROD-SHIFT-829",entityId:"PROD-SHIFT-829",module:"production",department:"Production",plan:150,actual:125,downtimeMin:32,assetId:"AST-ELV2",status:"Completed"},
  {id:"PROD-SHIFT-830",entityId:"PROD-SHIFT-830",module:"production",department:"Production",plan:150,actual:146,downtimeMin:4,assetId:"AST-MILL1",status:"Completed"}
 ]),
 wheat:def("wheat","wheatStock",[
  ["id","سیلو","text"],["stock","موجودی (تن)","number"],["coverageDays","پوشش (روز)","number"],["minCoverageDays","حداقل پوشش","number"],["agingDays","عمر متوسط","number"],["status","وضعیت","select",["Normal","At Risk","Hold"]]
 ],[["id","سیلو"],["stock","موجودی"],["coverageDays","پوشش"],["agingDays","Aging"],["status","وضعیت"]],[
  {id:"S-01",module:"wheat",department:"Operations",stock:1320,coverageDays:43,minCoverageDays:30,agingDays:18,status:"Normal"},
  {id:"S-02",module:"wheat",department:"Operations",stock:1450,coverageDays:26,minCoverageDays:30,agingDays:47,status:"At Risk"}
 ]),
 quality:def("quality","qualityBatch",[
  ["id","Batch","text"],["product","محصول","text"],["status","وضعیت","select",["Testing","Hold","Released","Rejected"]],["shipmentBlocked","مانع بارگیری","checkbox"],["shipmentIds","سفارش‌های مرتبط","text"]
 ],[["id","Batch"],["product","محصول"],["status","وضعیت"],["shipmentBlocked","بارگیری"],["shipmentIds","سفارش"]],[
  {id:"B-2405",batchId:"B-2405",module:"quality",department:"Quality",product:"آرد ستاره",status:"Hold",shipmentBlocked:true,shipmentIds:["ORD-91"]},
  {id:"B-2402",batchId:"B-2402",module:"quality",department:"Quality",product:"آرد خبازی",status:"Released",shipmentBlocked:false,shipmentIds:[]}
 ]),
 inventory:def("inventory","inventoryStock",[
  ["id","رکورد","text"],["itemId","کد کالا","text"],["name","نام کالا","text"],["available","Available","number"],["safety","Safety Stock","number"],["coverageDays","Coverage","number"],["etaDays","ETA","number"],["critical","حیاتی","checkbox"],["emergencyPurchaseAmount","خرید اضطراری (تومان)","number"]
 ],[["itemId","کالا"],["name","نام"],["available","Available"],["safety","Safety"],["coverageDays","Coverage"],["etaDays","ETA"],["critical","حیاتی"]],[
  {id:"STK-6205",itemId:"ITEM-6205",module:"inventory",department:"Inventory",name:"رولبرینگ SKF 6205",available:0,safety:8,coverageDays:0,etaDays:5,critical:true,emergencyPurchaseAmount:780000000},
  {id:"STK-B90",itemId:"ITEM-B90",module:"inventory",department:"Inventory",name:"تسمه B90",available:3,safety:7,coverageDays:7,etaDays:9,critical:true,emergencyPurchaseAmount:260000000}
 ]),
 procurement:def("procurement","procurementOrder",[
  ["id","PO","text"],["itemId","کالا","text"],["vendor","فروشنده","text"],["etaDays","ETA روز","number"],["needInDays","زمان نیاز","number"],["value","مبلغ تومان","number"],["status","وضعیت","select",["Open","Ordered","In Transit","Delivered","Delayed"]],["critical","حیاتی","checkbox"]
 ],[["id","PO"],["itemId","کالا"],["vendor","فروشنده"],["etaDays","ETA"],["needInDays","Need"],["value","مبلغ"],["status","وضعیت"]],[
  {id:"PO-881",poId:"PO-881",entityId:"PO-881",module:"procurement",department:"Procurement",itemId:"ITEM-6205",vendor:"تأمین‌گستر A",etaDays:5,needInDays:0,value:690000000,status:"Delayed",critical:true},
  {id:"PO-884",poId:"PO-884",entityId:"PO-884",module:"procurement",department:"Procurement",itemId:"ITEM-B90",vendor:"صنعت‌یار",etaDays:9,needInDays:7,value:240000000,status:"In Transit",critical:false}
 ]),
 maintenance:def("maintenance","maintenanceWO",[
  ["id","WO","text"],["assetId","دارایی","text"],["status","وضعیت","select",["Scheduled","In Progress","Waiting Part","Emergency","Completed","Failed"]],["downtimeMin","توقف دقیقه","number"],["productionImpact","اثر تولید","checkbox"],["critical","بحرانی","checkbox"],["partIds","قطعات","text"]
 ],[["id","WO"],["assetId","دارایی"],["status","وضعیت"],["downtimeMin","توقف"],["productionImpact","اثر تولید"],["partIds","قطعه"]],[
  {id:"WO-529",entityId:"WO-529",module:"maintenance",department:"Maintenance",assetId:"AST-ELV2",status:"Emergency",downtimeMin:32,productionImpact:true,critical:true,partIds:["ITEM-6205"]},
  {id:"WO-531",entityId:"WO-531",module:"maintenance",department:"Maintenance",assetId:"AST-FAN1",status:"In Progress",downtimeMin:0,productionImpact:false,critical:false,partIds:[]}
 ]),
 energy:def("energy","energyMeter",[
  ["id","رکورد","text"],["utility","منبع","text"],["consumption","مصرف","number"],["specific","مصرف ویژه","number"],["target","هدف","number"],["status","وضعیت","select",["Normal","Warning","Peak Risk"]]
 ],[["utility","منبع"],["consumption","مصرف"],["specific","ویژه"],["target","هدف"],["status","وضعیت"]],[
  {id:"ENERGY-ELEC",module:"energy",department:"Operations",utility:"برق",consumption:33900,specific:82,target:80,status:"Warning"},
  {id:"ENERGY-GAS",module:"energy",department:"Operations",utility:"گاز",consumption:12000,specific:29,target:30,status:"Normal"}
 ]),
 sales:def("sales","salesOrder",[
  ["id","سفارش","text"],["customer","مشتری","text"],["product","محصول","text"],["qty","مقدار","number"],["status","وضعیت","select",["Confirmed","Allocated","Blocked","Ready","Delivered","Overdue"]],["blocker","مانع","text"],["batchId","Batch","text"]
 ],[["id","سفارش"],["customer","مشتری"],["product","محصول"],["qty","مقدار"],["blocker","مانع"],["status","وضعیت"]],[
  {id:"ORD-91",orderId:"ORD-91",entityId:"ORD-91",module:"sales",department:"Operations",customer:"مشتری A",product:"آرد ستاره",qty:28,status:"Blocked",blocker:"B-2405 Hold",batchId:"B-2405"},
  {id:"ORD-88",orderId:"ORD-88",entityId:"ORD-88",module:"sales",department:"Operations",customer:"مشتری C",product:"آرد خبازی",qty:30,status:"Delivered",blocker:"",batchId:"B-2402"}
 ]),
 finance:def("finance","financeCash",[
  ["id","سناریو","text"],["horizon","افق","text"],["cash","نقد","number"],["inflows","ورودی","number"],["outflows","خروجی","number"],["netGap","Gap","number"],["status","وضعیت","select",["Normal","At Risk","Critical"]]
 ],[["id","سناریو"],["horizon","افق"],["cash","نقد"],["inflows","ورودی"],["outflows","خروجی"],["netGap","Gap"],["status","وضعیت"]],[
  {id:"CASH-7D",module:"finance",department:"Finance",sensitivity:"confidential",horizon:"۷ روز",cash:18000000000,inflows:3000000000,outflows:7000000000,netGap:14000000000,status:"Normal"},
  {id:"CASH-30D",module:"finance",department:"Finance",sensitivity:"confidential",horizon:"۳۰ روز",cash:18000000000,inflows:9000000000,outflows:28500000000,netGap:-1500000000,status:"At Risk"}
 ]),
 tax:def("tax","taxObligation",[
  ["id","تعهد","text"],["type","نوع","text"],["daysToDue","روز تا سررسید","number"],["status","وضعیت","select",["Open","In Progress","Filed","Error"]],["exposure","Exposure","number"]
 ],[["id","تعهد"],["type","نوع"],["daysToDue","تا سررسید"],["exposure","Exposure"],["status","وضعیت"]],[
  {id:"VAT-Q3",module:"tax",department:"Finance",sensitivity:"confidential",type:"VAT",daysToDue:6,status:"In Progress",exposure:2400000000},
  {id:"TAX-INV-8821",module:"tax",department:"Finance",sensitivity:"confidential",type:"Invoice",daysToDue:20,status:"Error",exposure:120000000}
 ]),
 ledger:def("ledger","ledgerControl",[
  ["id","کنترل","text"],["name","نام","text"],["status","وضعیت","select",["Open","In Progress","Blocked","Completed"]],["owner","مالک","text"],["critical","بحرانی","checkbox"]
 ],[["id","کنترل"],["name","نام"],["owner","مالک"],["critical","بحرانی"],["status","وضعیت"]],[
  {id:"GL-BANK-REC",module:"ledger",department:"Finance",sensitivity:"confidential",name:"مغایرت بانک",status:"Blocked",owner:"خزانه",critical:true},
  {id:"GL-INV-REC",module:"ledger",department:"Finance",sensitivity:"confidential",name:"مغایرت انبار",status:"In Progress",owner:"کنترل مالی",critical:true}
 ]),
 assets:def("assets","assetHealth",[
  ["id","رکورد","text"],["assetId","دارایی","text"],["name","نام","text"],["health","Health %","number"],["critical","بحرانی","checkbox"],["custodian","Custodian","text"],["status","وضعیت","select",["Active","At Risk","Under Maintenance","Retired"]]
 ],[["assetId","دارایی"],["name","نام"],["health","Health"],["custodian","Custodian"],["critical","بحرانی"],["status","وضعیت"]],[
  {id:"HEALTH-ELV2",assetId:"AST-ELV2",module:"assets",department:"Operations",name:"الویتور خط ۲",health:71,critical:true,custodian:"تولید",status:"At Risk"},
  {id:"HEALTH-MILL1",assetId:"AST-MILL1",module:"assets",department:"Operations",name:"آسیاب ۱",health:88,critical:true,custodian:"تولید",status:"Active"}
 ]),
 security:def("security","securityAccess",[
  ["id","رخداد","text"],["person","شخص","text"],["area","محدوده","text"],["authorized","مجاز","checkbox"],["permit","مجوز","text"],["status","وضعیت","select",["Allowed","Denied","Inside","Exited"]]
 ],[["id","رخداد"],["person","شخص"],["area","محدوده"],["permit","مجوز"],["authorized","مجاز"],["status","وضعیت"]],[
  {id:"ACC-91",module:"security",department:"Security",sensitivity:"restricted",person:"EMP-41",area:"تولید",authorized:true,permit:"Shift",status:"Allowed"},
  {id:"ACC-X",module:"security",department:"Security",sensitivity:"restricted",person:"Contractor-X",area:"سیلو",authorized:false,permit:"نامعتبر",status:"Denied"}
 ]),
 hse:def("hse","hseIncident",[
  ["id","رخداد","text"],["title","عنوان","text"],["area","محل","text"],["severity","شدت","select",["Low","Medium","High","Critical","Emergency"]],["status","وضعیت","select",["Reported","Contained","Investigating","Actioning","Verified","Closed"]]
 ],[["id","رخداد"],["title","عنوان"],["area","محل"],["severity","شدت"],["status","وضعیت"]],[
  {id:"HSE-NM-81",module:"hse",department:"HSE",sensitivity:"restricted",title:"Near Miss خط ۱",area:"خط ۱",severity:"Medium",status:"Investigating"},
  {id:"HSE-INS-44",module:"hse",department:"HSE",sensitivity:"restricted",title:"Finding تأسیسات",area:"تأسیسات",severity:"High",status:"Actioning"}
 ]),
 meetings:def("meetings","meetingAction",[
  ["id","مصوبه","text"],["title","عنوان","text"],["owner","مسئول","text"],["overdueDays","روز تأخیر","number"],["status","وضعیت","select",["Assigned","In Progress","Overdue","Completed"]]
 ],[["id","مصوبه"],["title","عنوان"],["owner","مسئول"],["overdueDays","تأخیر"],["status","وضعیت"]],[
  {id:"MTG-ACT-11",module:"meetings",department:"Executive",title:"رفع لرزش الویتور",owner:"مدیر فنی",overdueDays:0,status:"In Progress"},
  {id:"MTG-ACT-12",module:"meetings",department:"Executive",title:"اقدام جلسه فروش",owner:"مدیر فروش",overdueDays:4,status:"Overdue"}
 ]),
 projects:def("projects","projectMilestone",[
  ["id","Milestone","text"],["project","پروژه","text"],["criticalPath","Critical Path","checkbox"],["delayDays","تأخیر","number"],["budgetVariance","انحراف بودجه %","number"],["status","وضعیت","select",["On Track","Delayed","Completed","At Risk"]]
 ],[["id","Milestone"],["project","پروژه"],["criticalPath","Critical"],["delayDays","تأخیر"],["budgetVariance","بودجه"],["status","وضعیت"]],[
  {id:"MS-PRJ11",module:"projects",department:"Projects",project:"نصب خط بسته‌بندی",criticalPath:true,delayDays:5,budgetVariance:3.1,status:"Delayed"},
  {id:"MS-PRJ07",module:"projects",department:"Projects",project:"بهینه‌سازی انرژی",criticalPath:false,delayDays:0,budgetVariance:0.8,status:"On Track"}
 ]),
 bi:def("bi","biMetric",[
  ["id","KPI","text"],["name","نام","text"],["actual","Actual","number"],["target","Target","number"],["anomaly","Anomaly","checkbox"],["freshnessMin","Freshness دقیقه","number"]
 ],[["id","KPI"],["name","نام"],["actual","Actual"],["target","Target"],["anomaly","Anomaly"],["freshnessMin","Freshness"]],[
  {id:"KPI-PROD-ATT",module:"bi",department:"Executive",name:"Plan Attainment",actual:92,target:98,anomaly:true,freshnessMin:10},
  {id:"KPI-OTD",module:"bi",department:"Executive",name:"OTD",actual:91,target:95,anomaly:true,freshnessMin:25}
 ]),
 documents:def("documents","documentControl",[
  ["id","سند","text"],["name","نام","text"],["type","نوع","text"],["owner","Owner","text"],["status","وضعیت","select",["Published","Review Due","Expired","Archived"]],["critical","بحرانی","checkbox"]
 ],[["id","سند"],["name","نام"],["type","نوع"],["owner","Owner"],["critical","بحرانی"],["status","وضعیت"]],[
  {id:"POL-14",module:"documents",department:"Executive",name:"سیاست خرید",type:"Policy",owner:"مالی/خرید",status:"Expired",critical:true},
  {id:"DOC-119",module:"documents",department:"Maintenance",name:"دستورالعمل PM",type:"Procedure",owner:"مدیر فنی",status:"Published",critical:false}
 ]),
 department:def("department","departmentKpi",[
  ["id","KPI","text"],["name","نام","text"],["sourceModule","ماژول","text"],["actual","Actual","number"],["target","Target","number"],["owner","Owner","text"]
 ],[["id","KPI"],["name","نام"],["sourceModule","ماژول"],["actual","Actual"],["target","Target"],["owner","Owner"]],[
  {id:"DEPT-PROD",module:"department",department:"Operations",name:"تحقق برنامه",sourceModule:"production",actual:92,target:98,owner:"مدیر تولید"},
  {id:"DEPT-PM",module:"department",department:"Operations",name:"PM Compliance",sourceModule:"maintenance",actual:94,target:98,owner:"مدیر فنی"}
 ])
};

function cloneRecord(x){var r={};Object.keys(x||{}).forEach(function(k){r[k]=Array.isArray(x[k])?x[k].slice():x[k]});return r}
function normalizeSeed(x){
 var r={};Object.keys(x).forEach(function(k){r[k]=x[k]});
 ["shipmentIds","partIds"].forEach(function(k){if(Array.isArray(r[k]))r[k]=r[k].join(",")});
 return r
}
function denormalize(kind,r){
 var d=modulesByKind[kind],x={};Object.keys(r).forEach(function(k){x[k]=r[k]});
 if(d){
  d.fields.forEach(function(f){
   if(f[2]==="number")x[f[0]]=+x[f[0]]||0;
   if(f[2]==="checkbox")x[f[0]]=!!x[f[0]];
  });
 }
 ["shipmentIds","partIds"].forEach(function(k){if(typeof x[k]==="string")x[k]=x[k].split(",").map(function(v){return v.trim()}).filter(Boolean)});
 return x
}
var modulesByKind={};Object.keys(modules).forEach(function(k){modulesByKind[modules[k].kind]=modules[k]});

function ensureSeeds(){
 Object.keys(modules).forEach(function(key){
  var d=modules[key];
  try{
   var existing=K.queryBusinessRecords(d.kind);
   if(!existing.length){
    d.seeds.forEach(function(r){K.upsertBusinessRecord(d.kind,r,{skipAutomation:true})});
   }
  }catch(e){}
 });
}
function records(key){var d=modules[key];if(!d)return[];try{return K.queryBusinessRecords(d.kind)}catch(e){return[]}}
function cell(v,k){
 if(typeof v==="boolean")return v?"بله":"خیر";
 if(/status|severity/.test(k))return st(v);
 if(/value|cash|inflows|outflows|netGap|emergencyPurchaseAmount/.test(k)&&typeof v==="number")return fa(v);
 if(Array.isArray(v))return esc(v.join("، "));
 return esc(v==null?"—":v)
}
function renderTable(key){
 var d=modules[key],rs=records(key);if(!d)return"";
 var tools=key==="inventory"?'<div class="ph"><div><div class="pt">درخواست و خروج قطعه</div><div class="ps">ابتدا موجودی بررسی می‌شود؛ خرید فقط هنگام کسری یا رسیدن به حد سفارش آغاز می‌شود.</div></div><button class="btn primary" data-mrv2="part-request">درخواست قطعه</button></div>':"";
 if(key==="procurement"){
  var prs=K.queryBusinessRecords("purchaseRequests");tools='<div class="card panel"><div class="pt">درخواست‌های خرید ناشی از نیاز واقعی انبار</div>'+(prs.length?prs.map(function(p){return '<div class="att"><div style="flex:1"><h4>'+esc(p.id)+' · '+esc(p.itemId)+'</h4><p>'+fa(p.qty)+' عدد · '+esc(p.reason)+' · '+esc(p.status)+'</p></div>'+(p.status==="Requested"?'<button class="btn sm" data-mrv2="order-pr" data-id="'+esc(p.id)+'">صدور سفارش خرید</button>':p.status==="Ordered"?'<button class="btn sm" data-mrv2="receive-pr" data-id="'+esc(p.id)+'">ثبت تحویل</button>':'')+'</div>'}).join(""):'<div class="option"><p>درخواست خرید بازی وجود ندارد.</p></div>')+'</div>';
 }
 if(!rs.length)return tools+'<div class="option"><p>رکوردی در دامنه دسترسی فعلی قابل مشاهده نیست.</p></div>';
 return tools+'<div class="tablewrap"><table class="tbl"><thead><tr>'+d.columns.map(function(c){return '<th>'+esc(c[1])+'</th>'}).join("")+'<th></th></tr></thead><tbody>'+rs.map(function(r){return '<tr>'+d.columns.map(function(c){return '<td>'+cell(r[c[0]],c[0])+'</td>'}).join("")+'<td><button class="btn sm" data-mrv2="edit" data-key="'+key+'" data-id="'+esc(r.id)+'">ویرایش</button></td></tr>'}).join("")+'</tbody></table></div>'
}
function openPartRequest(){
 var m=document.getElementById("modal");if(!m)return;m.innerHTML='<div class="modalbg"><div class="modal"><div class="mh"><b>ثبت درخواست قطعه</b><button class="close" data-mrv2="close">×</button></div><div class="mb"><div class="form"><div class="field"><label>کد کالا</label><input data-part-field="itemId" placeholder="مانند ITEM-6205"></div><div class="field"><label>تعداد موردنیاز</label><input data-part-field="qty" type="number" min="1"></div><div class="field"><label>شماره دستور کار</label><input data-part-field="workOrderId" placeholder="اختیاری"></div><div class="field"><label>مبلغ برآوردی خرید</label><input data-part-field="estimatedAmount" type="number" min="0"></div></div><div class="option rec"><p>سامانه موجودی را کنترل می‌کند؛ در صورت کفایت، قطعه خارج می‌شود و هیچ خریدی ساخته نمی‌شود.</p></div></div><div class="mf"><button class="btn primary" data-mrv2="save-part-request">ثبت و ارزیابی موجودی</button><button class="btn" data-mrv2="close">انصراف</button></div></div></div>';
}
function savePartRequest(){var v={};document.querySelectorAll("#modal [data-part-field]").forEach(function(el){v[el.getAttribute("data-part-field")]=el.type==="number"?+el.value:el.value});var r=K.requestPart(v),m=document.getElementById("modal");if(m)m.innerHTML="";var b=document.getElementById("toasts");if(b){var t=document.createElement("div");t.className="toast";t.innerHTML="<b>درخواست قطعه ثبت شد</b><small>"+(r.purchaseRequest?"درخواست خرید فقط به دلیل کسری یا حد سفارش ایجاد شد.":"قطعه از انبار خارج شد؛ خریدی ایجاد نشد.")+"</small>";b.appendChild(t);setTimeout(function(){t.remove()},4000)}}
function inputField(f,val){
 var key=f[0],label=f[1],type=f[2],opts=f[3]||[];
 if(type==="select")return '<div class="field"><label>'+esc(label)+'</label><select data-mrv2-field="'+key+'">'+opts.map(function(o){return '<option '+(String(val)===String(o)?"selected":"")+'>'+esc(o)+'</option>'}).join("")+'</select></div>';
 if(type==="checkbox")return '<div class="field"><label>'+esc(label)+'</label><label class="mrv2-check"><input type="checkbox" data-mrv2-field="'+key+'" '+(val?"checked":"")+'> بله</label></div>';
 return '<div class="field '+(key==="name"||key==="title"?"full":"")+'"><label>'+esc(label)+'</label><input data-mrv2-field="'+key+'" type="'+(type==="number"?"number":"text")+'" value="'+esc(val==null?"":(Array.isArray(val)?val.join(","):val))+'"></div>'
}
function openForm(key,id){
 var d=modules[key];if(!d)return;var rec=id?records(key).find(function(x){return x.id===id}):null;rec=rec||{module:key};
 var m=document.getElementById("modal");if(!m)return;
 m.innerHTML='<div class="modalbg"><div class="modal"><div class="mh"><b>'+(id?"ویرایش":"ثبت")+' داده عملیاتی — '+esc(key)+'</b><button class="close" data-mrv2="close">×</button></div><div class="mb"><div class="form">'+d.fields.map(function(f){return inputField(f,rec[f[0]])}).join("")+'</div><div class="option rec"><p>با ذخیره، Data Validation و Event Automation به‌صورت خودکار اجرا می‌شود؛ نیاز به «ثبت Event» جدا نیست.</p></div></div><div class="mf"><button class="btn primary" data-mrv2="save" data-key="'+key+'" data-id="'+esc(id||"")+'">ذخیره و ارزیابی</button><button class="btn" data-mrv2="close">انصراف</button></div></div></div>';
}
function saveForm(key,id){
 var d=modules[key],existing=id?records(key).find(function(x){return x.id===id}):null;
 var base=existing||cloneRecord((d.seeds&&d.seeds[0])||{});
 var rec={};Object.keys(base).forEach(function(k){rec[k]=base[k]});
 rec.module=key;
 document.querySelectorAll("#modal [data-mrv2-field]").forEach(function(el){
  var k=el.getAttribute("data-mrv2-field"),f=d.fields.find(function(x){return x[0]===k}),v=f&&f[2]==="checkbox"?el.checked:el.value;
  if(f&&f[2]==="number")v=+v||0;rec[k]=v;
 });
 if(id)rec.id=id;
 rec=denormalize(d.kind,rec);
 try{
  var result=K.upsertBusinessRecord(d.kind,rec);
  var m=document.getElementById("modal");if(m)m.innerHTML="";
  if(window.ModuleRecordsV2&&window.ModuleRecordsV2.onSaved)window.ModuleRecordsV2.onSaved(key,result);
  var box=document.getElementById("toasts");if(box){var t=document.createElement("div");t.className="toast";t.innerHTML="<b>داده عملیاتی ذخیره شد</b><small>"+esc((result._derivedEvents||[]).join(" · ")||"بدون Exception جدید")+"</small>";box.appendChild(t);setTimeout(function(){t.remove()},3500)}
 }catch(e){
  var box2=document.getElementById("toasts");if(box2){var t2=document.createElement("div");t2.className="toast";t2.innerHTML="<b>ذخیره انجام نشد</b><small>"+esc(e.message)+"</small>";box2.appendChild(t2);setTimeout(function(){t2.remove()},3500)}
 }
}
document.addEventListener("click",function(ev){
 var x=ev.target.closest("[data-mrv2]");if(!x)return;var a=x.getAttribute("data-mrv2"),key=x.getAttribute("data-key"),id=x.getAttribute("data-id");
 if(a==="edit")openForm(key,id);
 if(a==="part-request")openPartRequest();
 if(a==="save-part-request")savePartRequest();
 if(a==="order-pr"){K.progressPurchase(id,"order",{});if(window.render)window.render()}
 if(a==="receive-pr"){K.progressPurchase(id,"receive",{});if(window.render)window.render()}
 if(a==="new")openForm(key,null);
 if(a==="save")saveForm(key,id||null);
 if(a==="close"){var m=document.getElementById("modal");if(m)m.innerHTML=""}
});
var style=document.createElement("style");style.textContent=".mrv2-check{display:flex;align-items:center;gap:8px;height:38px}.mrv2-check input{width:18px;height:18px}.mrv2-source{border-inline-start:3px solid #0284c7;padding-inline-start:8px}";document.head.appendChild(style);
ensureSeeds();
window.ModuleRecordsV2={modules:modules,records:records,renderTable:renderTable,openForm:openForm,onSaved:null,ensureSeeds:ensureSeeds};
})();
