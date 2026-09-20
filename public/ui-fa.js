(function(){
"use strict";

var dictionary={
 "Critical":"بحرانی","Emergency":"فوری و بحرانی","High":"زیاد","Medium":"متوسط","Low":"کم","Normal":"عادی",
 "Open":"باز","Active":"فعال","Detected":"شناسایی‌شده","Qualified":"بررسی‌شده","Assigned":"واگذارشده","Actioning":"در حال اقدام","Monitoring":"در حال پایش",
 "Waiting":"در انتظار","Requested":"درخواست‌شده","Returned":"برگشت‌داده‌شده","Blocked":"متوقف‌شده","In Progress":"در حال انجام","Completed":"تکمیل‌شده",
 "Resolved":"رفع‌شده","Verified":"تأیید نتیجه‌شده","Closed":"بسته‌شده","Approved":"تأییدشده","Rejected":"ردشده","Decided":"تصمیم‌گیری‌شده",
 "Overdue":"از مهلت گذشته","Expired":"منقضی‌شده","Hold":"متوقف برای بررسی","Released":"آزادشده","Ready":"آماده","Failed":"ناموفق",
 "Decide":"نیازمند تصمیم","Escalate":"ارجاع به سطح بالاتر","Act":"نیازمند اقدام","Know":"جهت اطلاع",
 "PASS":"موفق","FAIL":"ناموفق","Role":"نقش","Scope":"دامنه دسترسی","Owner":"مسئول","Accountable":"پاسخ‌گو",
 "CEO":"مدیریت ارشد","Executive":"مدیریت اجرایی","Manager":"مدیر واحد","Expert":"کارشناس","Auditor":"حسابرس","Board":"هیئت‌مدیره","Operator":"کاربر عملیاتی","Supervisor":"سرپرست",
 "Event":"رویداد","Case":"پرونده مدیریتی","Action":"اقدام","Decision":"تصمیم","Approval":"تأیید فرایندی","Notification":"اعلان","Risk":"ریسک",
 "Links":"ارتباط‌ها","Level":"سطح","Residual":"ریسک باقی‌مانده","Timeline":"روند زمانی","item":"کالا",
 "inventory":"انبار و لجستیک","production":"تولید و برنامه‌ریزی","maintenance":"فنی و نگهداری","quality":"آزمایشگاه و کیفیت",
 "procurement":"تدارکات و تأمین","finance":"مالی و خزانه","projects":"پروژه‌ها","security":"حراست","hr":"سرمایه انسانی",
 "cases":"پرونده‌های مدیریتی","actions":"اقدام‌ها","decisions":"تصمیم‌ها","risks":"ریسک‌ها","records":"رکوردها",
 "Management Kernel":"هسته یکپارچه مدیریت","Kernel v2":"هسته مدیریت نسخه ۲","Kernel":"هسته مدیریت","Single Source of Truth":"منبع واحد و معتبر اطلاعات",
 "Live Projection":"نمای زنده","Executive Brief":"خلاصه مدیریتی","Context Pack":"جزئیات و شواهد تصمیم","Dependency Graph":"نقشه ارتباط‌ها و وابستگی‌ها",
 "Risk Register":"فهرست ریسک‌ها","Audit Trail":"سوابق تغییرات","Related Entity ID":"شناسه موضوع مرتبط","Item Master":"شناسنامه کالا",
 "Work Order":"دستور کار","Safety Stock":"موجودی اطمینان","Lead Time":"زمان تأمین","UOM":"واحد اندازه‌گیری","GRN":"رسید انبار",
 "Reservation":"رزرو","Count":"شمارش","Variance":"مغایرت","Reorder":"سفارش مجدد","Transaction":"تراکنش","Balance":"مانده",
 "Stock":"موجودی","Delayed":"با تأخیر","In Transit":"در مسیر تحویل","RFQ":"استعلام قیمت","Quotation":"پیشنهاد قیمت",
 "Comparison":"مقایسه","Delivery":"تحویل","Payment":"پرداخت","Available":"موجودی قابل استفاده","Coverage":"پوشش موجودی","ETA":"زمان تقریبی تحویل",
 "Existing Response":"اقدام موجود","Root Event":"رویداد ریشه","Data Validation":"اعتبارسنجی اطلاعات","Event Automation":"اجرای خودکار فرایندها","Rule Automation":"اجرای خودکار قوانین",
 "Rule Matrix":"جدول قوانین","Rule Engine":"موتور قوانین","Decision Engine":"موتور تصمیم‌گیری","Decision Center":"مرکز تصمیم",
 "Acceptance Suite":"مجموعه آزمون پذیرش","Close Case":"بستن پرونده","Verify":"تأیید نتیجه","Acknowledge":"مشاهده شد","Complete":"تکمیل",
 "Reset Kernel":"بازنشانی هسته مدیریت","Processed":"پردازش شد","No links":"ارتباطی ثبت نشده است","On Track":"طبق برنامه",
 "Source":"منبع","Priority":"اولویت","Severity":"شدت","Deadline":"مهلت انجام","Due Date":"مهلت انجام","HSE":"بهداشت، ایمنی و محیط‌زیست",
 "procurement":"تدارکات و تأمین","PO":"سفارش خرید","PR":"درخواست خرید","ETA":"زمان تقریبی تحویل","SLA":"زمان تعهدشده انجام",
 "ETA روز":"زمان تقریبی تحویل (روز)","Need":"زمان نیاز","WO":"دستور کار","Batch":"نوبت تولید","Aging":"عمر موجودی",
 "Available":"موجودی قابل استفاده","Safety Stock":"موجودی اطمینان","Safety":"موجودی اطمینان","Health %":"درصد سلامت","Health":"سلامت تجهیز","Custodian":"تحویل‌گیرنده",
 "Exposure":"مبلغ در معرض ریسک","Anomaly":"ناهنجاری","Freshness":"تازگی اطلاعات","Plan Attainment":"تحقق برنامه","OTD":"تحویل به‌موقع",
 "Policy Exception":"استثنای سیاست سازمانی","Policy Flow":"فرایند اجرای سیاست","Policy":"سیاست سازمانی","Authority Gap":"کمبود سطح اختیار","Authority":"سطح اختیار",
 "Choice":"انتخاب مدیریتی","Why Now":"دلیل فوریت","Options":"گزینه‌ها","Option":"گزینه","Recommendation":"پیشنهاد کارشناسی","Related Case":"پرونده مرتبط",
 "Context Pack":"جزئیات و شواهد تصمیم","Dependency Graph":"نقشه وابستگی‌ها","Thread":"زنجیره پیگیری","Blocker":"مانع فعال","Root Cause":"علت اصلی",
 "Corrective Action":"اقدام اصلاحی","Investigation":"بررسی حادثه","Verification":"تأیید نتیجه","Awareness":"اطلاع‌رسانی مدیریتی",
 "Initial":"اولیه","Control":"کنترل","Occurrences":"تعداد تکرار","Grouped":"گروه‌بندی‌شده","Immutable-like log":"سابقه تغییرات پایدار",
 "Live Projection":"نمای زنده","Legacy View":"نمای قدیمی","Business Record Store":"مخزن اطلاعات عملیاتی","Business Logic":"منطق کسب‌وکار",
 "Rule Assessment":"ارزیابی قواعد","Rule Matrix":"جدول قواعد","Rule Engine":"موتور قواعد","Engine Output":"خروجی موتور","Rule":"قاعده",
 "End-to-End":"سرتاسری","State Model":"الگوی وضعیت‌ها","Exception Queue":"صف موارد استثنایی","Exception Notifications":"اعلان‌های موارد استثنایی",
 "Dependency Contract":"قرارداد وابستگی","Correlation Rules":"قواعد ارتباط رویدادها","Root":"ریشه","Gate":"نقطه کنترل",
 "Daily":"روزانه","Weekly":"هفتگی","Monthly":"ماهانه","Trend":"روند","Recurrence":"تکرار","Capacity":"ظرفیت","Performance":"عملکرد",
 "Training":"آموزش","Competency":"شایستگی","Experience":"تجربه","Position":"پست سازمانی","Person":"فرد","Readiness":"آمادگی جانشینی","Ready Now":"آماده انتصاب",
 "Critical Position":"پست کلیدی","Gap":"فاصله تا هدف","Goal":"هدف","Target":"هدف تعیین‌شده","Actual":"عملکرد واقعی","Variance":"انحراف",
 "Post Assessment":"ارزیابی پس از آموزش","Performance Impact":"اثر بر عملکرد","People":"نیروی انسانی","Open Cases":"پرونده‌های باز","Delays":"تأخیرها",
 "Inventory":"موجودی","Quantity":"مقدار","Consumption":"مصرف","Coverage":"پوشش موجودی","Lead Time":"زمان تأمین","Low Stock":"کمبود موجودی",
 "Invoice":"صورتحساب","Vendor Score":"امتیاز تأمین‌کننده","Vendor":"تأمین‌کننده","Work Order":"دستور کار","Critical Asset":"تجهیز حیاتی",
 "Production Stop":"توقف تولید","Target Missed":"عدم تحقق برنامه","Downtime":"زمان توقف","Failure":"خرابی","Repair":"تعمیر","Test":"آزمون",
 "Asset Master":"شناسنامه تجهیزات","Item Master":"شناسنامه کالا","Cash Forecast":"پیش‌بینی جریان نقد","Milestone":"مرحله کلیدی","Critical Path":"مسیر بحرانی",
 "Impact Threshold":"حد اثرگذاری","CAPEX":"هزینه سرمایه‌ای","KPI Dictionary":"فرهنگ شاخص‌های کلیدی","KPI":"شاخص کلیدی عملکرد","BI":"هوش تجاری",
 "Version":"نسخه","Access":"سطح دسترسی","Expiry":"تاریخ انقضا","Related Entity":"موضوع مرتبط","Related Entity ID":"شناسه موضوع مرتبط",
 "Event Type":"نوع رویداد","Impact":"میزان اثر","Context":"شرح و شرایط رویداد","Validate":"اعتبارسنجی","Data":"اطلاعات",
 "Owner / Manager":"مسئول یا مدیر","HSE / CEO":"ایمنی و بهداشت / مدیرعامل","Manager → Executive":"مدیر واحد ← مدیریت ارشد",
 "CEO Decision":"تصمیم مدیرعامل","CEO Inbox":"صندوق مدیرعامل","Executive Alert":"هشدار مدیریتی","Executive Brief":"خلاصه مدیریتی",
 "Decision Required":"نیازمند تصمیم","Decision.Required":"نیازمند تصمیم","Action.Overdue":"اقدام از مهلت گذشته","Action Open":"اقدام باز",
 "Inventory.LowStock":"کمبود موجودی انبار","Production.TargetMissed":"عدم تحقق برنامه تولید","Maintenance.AssetFailed":"خرابی تجهیز فنی","Production.Downtime":"توقف تولید",
 "HSE.Incident":"رویداد ایمنی و بهداشت","RCA":"بررسی علت اصلی","PM":"نگهداری پیشگیرانه","HR":"منابع انسانی","QC":"کنترل کیفیت",
 "Hold":"متوقف برای بررسی","Master":"اطلاعات پایه","Drill-down":"مشاهده جزئیات","Dashboard":"داشبورد مدیریتی","Inbox":"صندوق پیگیری",
 "What Matters":"موضوعات مهم","What Requires Attention":"موارد نیازمند توجه","No links":"ارتباطی ثبت نشده است","Close Case":"بستن پرونده",
 "Need More Info":"نیازمند اطلاعات بیشتر","Cancelled":"لغوشده","Suppressed":"نمایش‌داده‌نشده","Acknowledged":"مشاهده‌شده",
 "Detected":"شناسایی‌شده","Assigned":"واگذارشده","Actioning":"در حال اقدام","Monitoring":"در حال پایش","In Progress":"در حال انجام",
 "Running":"در حال تولید","Interrupted":"متوقف‌شده","At Risk":"در معرض خطر","Testing":"در حال آزمایش","Ordered":"سفارش داده‌شده",
 "Delivered":"تحویل‌شده","Scheduled":"برنامه‌ریزی‌شده","Waiting Part":"در انتظار قطعه","Warning":"هشدار","Peak Risk":"خطر اوج مصرف",
 "Confirmed":"تأییدشده","Allocated":"تخصیص‌یافته","Filed":"ارسال‌شده","Error":"دارای خطا","Under Maintenance":"در حال تعمیر","Retired":"از رده خارج‌شده",
 "Allowed":"مجاز","Denied":"غیرمجاز","Inside":"داخل مجموعه","Exited":"خارج‌شده","Shift":"شیفت","Reported":"گزارش‌شده","Contained":"مهارشده",
 "Investigating":"در حال بررسی","Near Miss":"شبه‌حادثه","Finding":"یافته بازرسی","On Track":"طبق برنامه","Published":"منتشرشده","Review Due":"موعد بازبینی",
 "Archived":"بایگانی‌شده","Procedure":"دستورالعمل","VAT":"مالیات بر ارزش افزوده","Invoice":"صورتحساب","PM Compliance":"انجام نگهداری پیشگیرانه",
 "wheat":"گندم و سیلوها","quality":"آزمایشگاه و کیفیت","energy":"انرژی و تأسیسات","sales":"فروش و توزیع","finance":"مالی و خزانه",
 "tax":"مالیات و تعهدات قانونی","ledger":"دفتر کل","assets":"اموال و دارایی‌ها","meetings":"جلسات و مصوبات","documents":"اسناد و مدارک","department":"عملکرد واحدها",
 "مشتری A":"مشتری الف","مشتری C":"مشتری ج","تأمین‌گستر A":"تأمین‌گستر الف",
 "S1":"شدت ۱","S2":"شدت ۲","S3":"شدت ۳","S4":"شدت ۴","S5":"شدت ۵",
 "I1":"اثر ۱","I2":"اثر ۲","I3":"اثر ۳","I4":"اثر ۴","I5":"اثر ۵",
 "P0":"اولویت فوری","P1":"اولویت بسیار بالا","P2":"اولویت بالا","P3":"اولویت عادی","P4":"اولویت پایین",
 "A1":"اختیار سطح ۱","A2":"اختیار سطح ۲","A3":"اختیار سطح ۳","A4":"اختیار سطح ۴","A5":"اختیار سطح ۵"
};

var dictionaryKeys=Object.keys(dictionary).sort(function(a,b){return b.length-a.length});
function escapeRegExp(value){return value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}

function t(key,fallback){
 var k=String(key==null?"":key);
 return Object.prototype.hasOwnProperty.call(dictionary,k)?dictionary[k]:(fallback==null?k:fallback);
}
function translateExact(value){
 var raw=String(value==null?"":value),trimmed=raw.trim();
 if(!trimmed)return raw;
 if(Object.prototype.hasOwnProperty.call(dictionary,trimmed))return raw.replace(trimmed,dictionary[trimmed]);
 var translated=raw;
 dictionaryKeys.forEach(function(key){
   if(translated.indexOf(key)<0)return;
   var pattern=/^[A-Za-z0-9]+$/.test(key)
     ? new RegExp("(^|[^A-Za-z0-9_])("+escapeRegExp(key)+")(?=$|[^A-Za-z0-9_])","g")
     : new RegExp(escapeRegExp(key),"g");
   translated=translated.replace(pattern,function(match,prefix){
     return (/^[A-Za-z0-9]+$/.test(key)?(prefix||""):"")+dictionary[key];
   });
 });
 return translated;
}
function translateElement(el){
 if(!el||el.nodeType!==1||/^(SCRIPT|STYLE|NOSCRIPT|CODE|PRE)$/.test(el.tagName))return;
 if(el.hasAttribute("data-no-i18n"))return;
 if(el.hasAttribute("data-i18n")){
   var key=el.getAttribute("data-i18n");
   el.textContent=t(key,el.textContent);
   return;
 }
 Array.prototype.forEach.call(el.childNodes,function(node){
   if(node.nodeType===3)node.nodeValue=translateExact(node.nodeValue);
   else if(node.nodeType===1)translateElement(node);
 });
 ["title","placeholder","aria-label"].forEach(function(attr){
   if(el.hasAttribute&&el.hasAttribute(attr))el.setAttribute(attr,translateExact(el.getAttribute(attr)));
 });
}
function apply(){
 translateElement(document.body);
 document.documentElement.lang="fa";
 document.documentElement.dir="rtl";
}
var observer=new MutationObserver(function(records){
 records.forEach(function(record){
  Array.prototype.forEach.call(record.addedNodes,function(node){
   if(node.nodeType===1)translateElement(node);
   else if(node.nodeType===3)node.nodeValue=translateExact(node.nodeValue);
  });
 });
});
window.UIFA={t:t,translate:translateExact,dictionary:dictionary};
if(document.body){apply();observer.observe(document.body,{childList:true,subtree:true})}
else document.addEventListener("DOMContentLoaded",function(){apply();observer.observe(document.body,{childList:true,subtree:true})});
})();
