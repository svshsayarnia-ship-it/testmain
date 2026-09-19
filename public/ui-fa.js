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
 "Management Kernel":"هسته یکپارچه مدیریت","Kernel v2":"هسته مدیریت نسخه ۲","Single Source of Truth":"منبع واحد و معتبر اطلاعات",
 "Live Projection":"نمای زنده","Executive Brief":"خلاصه مدیریتی","Context Pack":"جزئیات و شواهد تصمیم","Dependency Graph":"نقشه ارتباط‌ها و وابستگی‌ها",
 "Risk Register":"فهرست ریسک‌ها","Audit Trail":"سوابق تغییرات","Related Entity ID":"شناسه موضوع مرتبط","Item Master":"شناسنامه کالا",
 "Work Order":"دستور کار","Safety Stock":"موجودی اطمینان","Lead Time":"زمان تأمین","UOM":"واحد اندازه‌گیری","GRN":"رسید انبار",
 "Reservation":"رزرو","Count":"شمارش","Variance":"مغایرت","Reorder":"سفارش مجدد","Transaction":"تراکنش","Balance":"مانده",
 "Stock":"موجودی","Delayed":"با تأخیر","In Transit":"در مسیر تحویل","RFQ":"استعلام قیمت","Quotation":"پیشنهاد قیمت",
 "Comparison":"مقایسه","Delivery":"تحویل","Payment":"پرداخت","Available":"موجودی قابل استفاده","Coverage":"پوشش موجودی","ETA":"زمان تقریبی تحویل",
 "Existing Response":"اقدام موجود","Root Event":"رویداد ریشه","Data Validation":"اعتبارسنجی داده","Rule Automation":"اجرای خودکار قوانین",
 "Rule Matrix":"جدول قوانین","Rule Engine":"موتور قوانین","Decision Engine":"موتور تصمیم‌گیری","Decision Center":"مرکز تصمیم",
 "Acceptance Suite":"مجموعه آزمون پذیرش","Close Case":"بستن پرونده","Verify":"تأیید نتیجه","Acknowledge":"مشاهده شد","Complete":"تکمیل",
 "Reset Kernel":"بازنشانی هسته مدیریت","Processed":"پردازش شد","No links":"ارتباطی ثبت نشده است","On Track":"طبق برنامه",
 "Source":"منبع","Priority":"اولویت","Severity":"شدت","Deadline":"مهلت انجام","Due Date":"مهلت انجام","HSE":"بهداشت، ایمنی و محیط‌زیست"
};

function t(key,fallback){
 var k=String(key==null?"":key);
 return Object.prototype.hasOwnProperty.call(dictionary,k)?dictionary[k]:(fallback==null?k:fallback);
}
function translateExact(value){
 var raw=String(value==null?"":value),trimmed=raw.trim();
 if(!trimmed||!Object.prototype.hasOwnProperty.call(dictionary,trimmed))return raw;
 return raw.replace(trimmed,dictionary[trimmed]);
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
window.UIFA={t:t,dictionary:dictionary};
if(document.body){apply();observer.observe(document.body,{childList:true,subtree:true})}
else document.addEventListener("DOMContentLoaded",function(){apply();observer.observe(document.body,{childList:true,subtree:true})});
})();