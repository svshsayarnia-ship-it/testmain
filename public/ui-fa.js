(function(){
"use strict";

var exact={
 "Critical":"بحرانی","Emergency":"فوری و بحرانی","High":"زیاد","Medium":"متوسط","Low":"کم","Normal":"عادی",
 "Open":"باز","Active":"فعال","Detected":"شناسایی‌شده","Qualified":"بررسی‌شده","Assigned":"واگذارشده","Actioning":"در حال اقدام","Monitoring":"در حال پایش",
 "Waiting":"در انتظار","Requested":"درخواست‌شده","Returned":"برگشت‌داده‌شده","Blocked":"متوقف‌شده","In Progress":"در حال انجام","Completed":"تکمیل‌شده",
 "Resolved":"رفع‌شده","Verified":"تأیید نتیجه‌شده","Closed":"بسته‌شده","Approved":"تأییدشده","Rejected":"ردشده","Decided":"تصمیم‌گیری‌شده",
 "Overdue":"از مهلت گذشته","Expired":"منقضی‌شده","Hold":"متوقف برای بررسی","Released":"آزادشده","Ready":"آماده","Failed":"ناموفق",
 "Decide":"نیازمند تصمیم","Escalate":"ارجاع به سطح بالاتر","Act":"نیازمند اقدام","Know":"جهت اطلاع",
 "PASS":"موفق","FAIL":"ناموفق","Role":"نقش","Scope":"دامنه دسترسی","Owner":"مسئول","Accountable":"پاسخ‌گو",
 "Event":"رویداد","Case":"پرونده مدیریتی","Action":"اقدام","Decision":"تصمیم","Approval":"تأیید فرایندی","Notification":"اعلان",
 "Risk":"ریسک","Links":"ارتباط‌ها","Level":"سطح","Residual":"ریسک باقی‌مانده","Timeline":"روند زمانی","item":"کالا",
 "inventory":"انبار و لجستیک","production":"تولید و برنامه‌ریزی","maintenance":"فنی و نگهداری","quality":"آزمایشگاه و کیفیت",
 "procurement":"تدارکات و تأمین","finance":"مالی و خزانه","projects":"پروژه‌ها","security":"حراست","hr":"سرمایه انسانی",
 "cases":"پرونده‌های مدیریتی","actions":"اقدام‌ها","decisions":"تصمیم‌ها","risks":"ریسک‌ها","records":"رکوردها"
};

var phrases=[
  [/Executive Management Operating System/g,"سامانه یکپارچه مدیریت اجرایی"],
  [/آخرین تغییرات قابل Audit/g,"آخرین تغییرات ثبت‌شده"],
  [/Action Store مرکزی/g,"مخزن مرکزی اقدامات"],
  [/Caseهای واقعی/g,"پرونده‌های مدیریتی واقعی"],
  [/Caseهای مرکزی/g,"پرونده‌های مدیریتی مرکزی"],
  [/Decisionهای مرکزی/g,"تصمیم‌های مرکزی"],
  [/Actionهای مرتبط/g,"اقدام‌های مرتبط"],
  [/Caseهای مرتبط/g,"پرونده‌های مدیریتی مرتبط"],
  [/Projection مستقیم/g,"نمای مستقیم"],
  [/Severity و Priority/g,"شدت و اولویت"],
  [/On Track/g,"طبق برنامه"],
  [/kernel\.boot/g,"راه‌اندازی هسته مدیریت"],
  [/session\.switch/g,"تغییر نقش فعال"],
  [/notification\.create/g,"ثبت اعلان"],
  [/v2 initialized/g,"نسخه ۲ راه‌اندازی شد"],
 [/Management Kernel/g,"هسته یکپارچه مدیریت"],
 [/Kernel v2/g,"هسته مدیریت نسخه ۲"],
 [/Single Source of Truth/g,"منبع واحد و معتبر اطلاعات"],
 [/Source of Truth/g,"منبع معتبر اطلاعات"],
 [/Live Projection/g,"نمای زنده"],
 [/Routine Work/g,"کارهای روزمره"],
 [/Executive Brief/g,"خلاصه مدیریتی"],
 [/What Matters → Why → Who Owns It → What Needs Decision/g,"چه چیزی مهم است ← چرا مهم است ← مسئول آن کیست ← چه تصمیمی لازم دارد"],
 [/Context Pack/g,"جزئیات و شواهد تصمیم"],
 [/Dependency Graph/g,"نقشه ارتباط‌ها و وابستگی‌ها"],
 [/Risk Register/g,"فهرست ریسک‌ها"],
 [/Exception Notifications/g,"اعلان موارد غیرعادی"],
 [/Exception/g,"مورد غیرعادی"],
 [/Health Score/g,"امتیاز سلامت"],
 [/Audit Trail/g,"سوابق تغییرات"],
 [/Immutable-like log/g,"سابقه تغییرات محافظت‌شده"],
 [/Initial\/Residual/g,"اولیه / باقی‌مانده"],
 [/Policy Flow/g,"روند کنترل سیاست‌ها"],
 [/Authority/g,"سطح اختیار"],
  [/Related Entity ID/g,"شناسه موضوع مرتبط"],
  [/Item Master/g,"شناسنامه کالا"],
  [/Work Order/g,"دستور کار"],
  [/Safety Stock/g,"موجودی اطمینان"],
  [/Available/g,"موجودی قابل استفاده"],
  [/Coverage/g,"پوشش موجودی"],
  [/ETA/g,"زمان تقریبی تحویل"],
  [/Existing Response/g,"اقدام موجود"],
  [/Root Event/g,"رویداد ریشه"],
  [/Data Validation/g,"اعتبارسنجی داده"],
  [/Rule Automation/g,"اجرای خودکار قوانین"],
  [/Mock/g,"داده نمایشی"],
  [/Gate/g,"نقطه کنترل"],
  [/Control/g,"کنترل"],
  [/Policy/g,"سیاست اجرایی"],
  [/Authority Gap/g,"کمبود سطح اختیار"],
  [/KPI/g,"شاخص کلیدی عملکرد"],
  [/Report/g,"گزارش"],
  [/Initial/g,"اولیه"],
  [/Remaining/g,"باقی‌مانده"],
 [/Rule Matrix/g,"جدول قوانین"],
 [/Rule Engine/g,"موتور قوانین"],
 [/Decision Engine/g,"موتور تصمیم‌گیری"],
 [/Decision Center/g,"مرکز تصمیم"],
 [/Acceptance Suite/g,"مجموعه آزمون پذیرش"],
 [/Close Case/g,"بستن پرونده"],
 [/Verify/g,"تأیید نتیجه"],
 [/Acknowledge/g,"مشاهده شد"],
 [/Complete/g,"تکمیل"],
 [/Reset Kernel/g,"بازنشانی هسته مدیریت"],
 [/Processed/g,"پردازش شد"],
 [/No links/g,"ارتباطی ثبت نشده است"],
 [/Grouped/g,"گروه‌بندی‌شده"],
 [/Source:/g,"منبع:"],
 [/Owner:/g,"مسئول:"],
 [/Role:/g,"نقش:"],
 [/Scope:/g,"دامنه دسترسی:"],
 [/\bSLA\b/g,"مهلت انجام"],
 [/\bRBAC\b/g,"کنترل دسترسی نقش‌محور"],
 [/\bApproval\b/g,"تأیید فرایندی"],
 [/\bDecision\b/g,"تصمیم"],
 [/\bNotification\b/g,"اعلان"],
 [/\bAction\b/g,"اقدام"],
 [/\bCase\b/g,"پرونده مدیریتی"],
 [/\bEvent\b/g,"رویداد"],
 [/\bRisk\b/g,"ریسک"],
 [/\bCritical\b/g,"بحرانی"],
 [/\bEmergency\b/g,"فوری و بحرانی"],
 [/\bHigh\b/g,"زیاد"],
 [/\bMedium\b/g,"متوسط"],
 [/\bLow\b/g,"کم"],
 [/\bNormal\b/g,"عادی"],
 [/\bOverdue\b/g,"از مهلت گذشته"],
 [/\bBlocked\b/g,"متوقف‌شده"],
 [/\bCompleted\b/g,"تکمیل‌شده"],
 [/\bVerified\b/g,"تأیید نتیجه‌شده"],
 [/\bClosed\b/g,"بسته‌شده"],
 [/\bApproved\b/g,"تأییدشده"],
 [/\bRejected\b/g,"ردشده"],
 [/\bWaiting\b/g,"در انتظار"],
 [/\bAssigned\b/g,"واگذارشده"],
 [/\bMonitoring\b/g,"در حال پایش"],
 [/\bAudit\b/g,"سوابق تغییرات"],
 [/\bOwner\b/g,"مسئول"],
 [/\bSource\b/g,"منبع"],
 [/\bRole\b/g,"نقش"],
  [/\bScope\b/g,"دامنه دسترسی"]
  ,[/\bCEO\b/g,"مدیرعامل"]
  ,[/\borganization\b/g,"کل سازمان"]
  ,[/\binventory\b/g,"انبار و لجستیک"]
  ,[/\bProjection\b/g,"نمای زنده"]
  ,[/\bSeverity\b/g,"شدت"]
  ,[/\bPriority\b/g,"اولویت"]
  ,[/\bStore\b/g,"مخزن اطلاعات"]
  ,[/\binitialized\b/g,"راه‌اندازی شد"]
  ,[/\bHSE\b/g,"بهداشت، ایمنی و محیط‌زیست"]
  ,[/پرونده مدیریتیهای/g,"پرونده‌های مدیریتی"]
  ,[/اعلانهای/g,"اعلان‌های"]
];

function translate(value){
 var raw=String(value==null?"":value),trimmed=raw.trim();if(!trimmed)return raw;
 var translated=exact[trimmed]||trimmed;
 phrases.forEach(function(pair){translated=translated.replace(pair[0],pair[1])});
 if(translated===trimmed)return raw;
 return raw.replace(trimmed,translated)
}
function translateElement(el){
 if(!el||el.nodeType!==1||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName))return;
 Array.prototype.forEach.call(el.childNodes,function(node){
  if(node.nodeType===3)node.nodeValue=translate(node.nodeValue);
  else if(node.nodeType===1)translateElement(node)
 });
 ["title","placeholder","aria-label"].forEach(function(attr){if(el.hasAttribute&&el.hasAttribute(attr))el.setAttribute(attr,translate(el.getAttribute(attr)))})
}
function apply(){translateElement(document.body);document.documentElement.lang="fa";document.documentElement.dir="rtl"}
var observer=new MutationObserver(function(records){records.forEach(function(record){Array.prototype.forEach.call(record.addedNodes,function(node){if(node.nodeType===1)translateElement(node);else if(node.nodeType===3)node.nodeValue=translate(node.nodeValue)})})});
if(document.body){apply();observer.observe(document.body,{childList:true,subtree:true})}
else document.addEventListener("DOMContentLoaded",function(){apply();observer.observe(document.body,{childList:true,subtree:true})});
})();
