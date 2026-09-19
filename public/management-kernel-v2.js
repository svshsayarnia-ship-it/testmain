(function(){
"use strict";
var KEY="ard_management_kernel_v2";
function now(){return Date.now()}
function uid(prefix){return prefix+"-"+Math.floor(Math.random()*900000+100000)}
function clone(x){return JSON.parse(JSON.stringify(x))}
function sevRank(s){return {S0:0,Normal:0,S1:1,Low:1,S2:2,Medium:2,S3:3,High:3,S4:4,Critical:4,S5:5,Emergency:5}[s]||0}
function normalizeSeverity(s){return {S0:"Normal",S1:"Low",S2:"Medium",S3:"High",S4:"Critical",S5:"Emergency"}[s]||s||"Medium"}
function impactRank(i){return +String(i||"I2").replace(/\D/g,"")||2}
function riskLevel(p,i){var n=(+String(p).replace(/\D/g,"")||3)*(+String(i).replace(/\D/g,"")||3);return n>=16?"Critical":n>=9?"High":n>=4?"Medium":"Low"}
function roleLevel(r){return {Operator:1,Expert:2,Supervisor:3,Manager:4,Executive:5,CEO:6,Board:7,Auditor:3}[r]||1}
function mkSeed(){
 return {
  version:2,
  config:{
   thresholds:{ceoPurchase:500000000,executivePurchase:250000000,criticalDowntimeMin:30,highFinancialExposure:1000000000},
   sla:{actionDefaultMs:6*3600000,decisionP1Ms:3600000,decisionP2Ms:4*3600000,approvalMs:8*3600000,ackP0Ms:15*60000,ackP1Ms:60*60000},
   notification:{quietStart:22,quietEnd:7,cooldownMs:30*60000}
  },
  session:{userId:"USR-CEO"},
  users:{
   "USR-CEO":{id:"USR-CEO",name:"مدیرعامل",role:"CEO",department:"Executive",scope:"organization",sensitivity:["public","internal","confidential","restricted"]},
   "USR-OPS":{id:"USR-OPS",name:"معاون عملیات",role:"Executive",department:"Operations",scope:"operations",sensitivity:["public","internal","confidential"]},
   "USR-PROC":{id:"USR-PROC",name:"مدیر تدارکات",role:"Manager",department:"Procurement",scope:"department",sensitivity:["public","internal","confidential"]},
   "USR-PROC-EX":{id:"USR-PROC-EX",name:"کارشناس خرید",role:"Expert",department:"Procurement",scope:"assigned",sensitivity:["public","internal"]},
   "USR-HR":{id:"USR-HR",name:"مدیر منابع انسانی",role:"Manager",department:"HR",scope:"department",sensitivity:["public","internal","confidential","restricted"]},
   "USR-HSE":{id:"USR-HSE",name:"مدیر HSE",role:"Manager",department:"HSE",scope:"department",sensitivity:["public","internal","confidential","restricted"]},
   "USR-FIN":{id:"USR-FIN",name:"مدیر مالی",role:"Manager",department:"Finance",scope:"department",sensitivity:["public","internal","confidential"]},
   "USR-AUD":{id:"USR-AUD",name:"حسابرس",role:"Auditor",department:"Audit",scope:"organization-read",sensitivity:["public","internal","confidential"]}
  },
  delegations:[],
  master:{
   departments:["Executive","Operations","Production","Maintenance","Procurement","Inventory","Quality","Finance","HR","HSE","Security","Projects"],
   entities:{
    "ITEM-6205":{id:"ITEM-6205",type:"item",name:"رولبرینگ SKF 6205",module:"inventory",critical:true,stock:0,safety:8,coverageDays:0,sensitivity:"internal"},
    "PO-881":{id:"PO-881",type:"po",name:"PO-881",module:"procurement",itemId:"ITEM-6205",vendor:"تأمین‌گستر A",etaDays:5,value:690000000,status:"Open",sensitivity:"confidential"},
    "AST-ELV2":{id:"AST-ELV2",type:"asset",name:"الویتور خط ۲",module:"maintenance",critical:true,partIds:["ITEM-6205"],status:"At Risk",sensitivity:"internal"},
    "WO-529":{id:"WO-529",type:"work_order",name:"WO-529",module:"maintenance",assetId:"AST-ELV2",partIds:["ITEM-6205"],status:"Monitoring",productionImpact:true,sensitivity:"internal"},
    "PROD-SHIFT-829":{id:"PROD-SHIFT-829",type:"production_shift",name:"شیفت عصر",module:"production",plan:150,actual:125,downtimeMin:32,status:"Completed",sensitivity:"internal"},
    "B-2405":{id:"B-2405",type:"batch",name:"Batch B-2405",module:"quality",status:"Hold",shipmentIds:["ORD-91"],sensitivity:"internal"},
    "ORD-91":{id:"ORD-91",type:"sales_order",name:"ORD-91",module:"sales",status:"Blocked",batchId:"B-2405",sensitivity:"confidential"},
    "POS-14":{id:"POS-14",type:"position",name:"مدیر شیفت تولید",module:"hr",critical:true,readyNow:0,sensitivity:"restricted"},
    "EMP-41":{id:"EMP-41",type:"employee",name:"حسین مرادی",module:"hr",department:"HR",operationalDepartment:"Production",sensitivity:"restricted"},
    "EMP-57":{id:"EMP-57",type:"employee",name:"مهدی رضایی",module:"hr",department:"HR",operationalDepartment:"Production",sensitivity:"restricted"},
    "EMP-22":{id:"EMP-22",type:"employee",name:"علی موسوی",module:"hr",department:"HR",operationalDepartment:"Production",sensitivity:"restricted"}
   }
  },
  records:{
   partRequests:[],inventoryMovements:[],purchaseRequests:[],goodsReceipts:[],financialCommitments:[],
   hrPerformance:[
    {id:"PERF-Q2-41",kind:"hrPerformance",module:"hr",department:"HR",employeeId:"EMP-41",name:"حسین مرادی",unit:"تولید",period:"۱۴۰۵-Q2",kpi:"تحقق برنامه شیفت",target:95,actual:88,score:88,status:"نیازمند بهبود",sensitivity:"restricted"},
    {id:"PERF-Q2-57",kind:"hrPerformance",module:"hr",department:"HR",employeeId:"EMP-57",name:"مهدی رضایی",unit:"تولید",period:"۱۴۰۵-Q2",kpi:"پایداری عملیات شیفت",target:92,actual:84,score:84,status:"قابل قبول",sensitivity:"restricted"},
    {id:"PERF-Q2-22",kind:"hrPerformance",module:"hr",department:"HR",employeeId:"EMP-22",name:"علی موسوی",unit:"تولید",period:"۱۴۰۵-Q2",kpi:"کیفیت اجرای برنامه",target:94,actual:91,score:91,status:"خوب",sensitivity:"restricted"}
   ],
   hrTraining:[
    {id:"TR-41",kind:"hrTraining",module:"hr",department:"HR",employeeId:"EMP-41",name:"حسین مرادی",need:"رهبری تیم",course:"رهبری تیم و مدیریت شیفت",pre:62,post:82,impact:78,status:"اثربخش",sensitivity:"restricted"},
    {id:"TR-57",kind:"hrTraining",module:"hr",department:"HR",employeeId:"EMP-57",name:"مهدی رضایی",need:"تصمیم‌گیری عملیاتی",course:"تصمیم‌گیری در عملیات",pre:58,post:76,impact:72,status:"نیازمند پیگیری",sensitivity:"restricted"},
    {id:"TR-22",kind:"hrTraining",module:"hr",department:"HR",employeeId:"EMP-22",name:"علی موسوی",need:"مدیریت شیفت",course:"مدیریت پیشرفته شیفت",pre:64,post:88,impact:81,status:"اثربخش",sensitivity:"restricted"}
   ],
   hrCompetency:[
    {id:"COMP-41-L",kind:"hrCompetency",module:"hr",department:"HR",employeeId:"EMP-41",name:"حسین مرادی",role:"مدیر شیفت تولید",competency:"رهبری تیم",required:85,actual:74,sensitivity:"restricted"},
    {id:"COMP-41-D",kind:"hrCompetency",module:"hr",department:"HR",employeeId:"EMP-41",name:"حسین مرادی",role:"مدیر شیفت تولید",competency:"تصمیم‌گیری",required:82,actual:76,sensitivity:"restricted"},
    {id:"COMP-57-L",kind:"hrCompetency",module:"hr",department:"HR",employeeId:"EMP-57",name:"مهدی رضایی",role:"مدیر شیفت تولید",competency:"رهبری تیم",required:85,actual:79,sensitivity:"restricted"},
    {id:"COMP-57-D",kind:"hrCompetency",module:"hr",department:"HR",employeeId:"EMP-57",name:"مهدی رضایی",role:"مدیر شیفت تولید",competency:"تصمیم‌گیری",required:82,actual:75,sensitivity:"restricted"},
    {id:"COMP-22-L",kind:"hrCompetency",module:"hr",department:"HR",employeeId:"EMP-22",name:"علی موسوی",role:"مدیر شیفت تولید",competency:"رهبری تیم",required:85,actual:68,sensitivity:"restricted"},
    {id:"COMP-22-D",kind:"hrCompetency",module:"hr",department:"HR",employeeId:"EMP-22",name:"علی موسوی",role:"مدیر شیفت تولید",competency:"تصمیم‌گیری",required:82,actual:72,sensitivity:"restricted"}
   ],
   hrExperience:[
    {id:"EXP-41",kind:"hrExperience",module:"hr",department:"HR",employeeId:"EMP-41",score:91,sensitivity:"restricted"},
    {id:"EXP-57",kind:"hrExperience",module:"hr",department:"HR",employeeId:"EMP-57",score:73,sensitivity:"restricted"},
    {id:"EXP-22",kind:"hrExperience",module:"hr",department:"HR",employeeId:"EMP-22",score:67,sensitivity:"restricted"}
   ]
  },
  events:[],eventOccurrences:[],cases:[],actions:[],decisions:[],approvals:[],notifications:[],risks:[],links:[],audit:[],problems:[],
  seq:{case:300,action:1000,decision:200,approval:400,notification:100,problem:50},
  acceptance:[],
  scenarioSeeded:false
 };
}
function migrate(old,s){
 try{
  if(!old)return s;
  ["events","cases","actions","decisions","notifications","risks","links","audit"].forEach(function(k){
   if(Array.isArray(old[k])&&old[k].length&&!s[k].length)s[k]=clone(old[k]);
  });
 }catch(e){}
 return s
}
var db;
try{
 db=JSON.parse(localStorage.getItem(KEY)||"null");
 if(!db){
  var old=JSON.parse(localStorage.getItem("ard_management_kernel_v1")||"null");
  db=migrate(old,mkSeed());
 }
}catch(e){db=mkSeed()}
db.records=db.records||{};
["partRequests","inventoryMovements","purchaseRequests","goodsReceipts","financialCommitments","hrPerformance","hrTraining","hrCompetency","hrExperience"].forEach(function(k){if(!Array.isArray(db.records[k]))db.records[k]=clone(mkSeed().records[k]||[])});
["EMP-41","EMP-57","EMP-22"].forEach(function(id){if(!db.master.entities[id])db.master.entities[id]=clone(mkSeed().master.entities[id])});
function persist(){
 localStorage.setItem(KEY,JSON.stringify(db));
 window.dispatchEvent(new CustomEvent("management-kernel:update",{detail:snapshot()}));
}
function next(kind){
 db.seq[kind]=(db.seq[kind]||0)+1;
 var p={case:"CASE",action:"ACT",decision:"DEC",approval:"APR",notification:"NTF",problem:"PRB"}[kind]||kind.toUpperCase();
 return p+"-"+db.seq[kind];
}
function audit(kind,entityId,message,meta){
 db.audit.unshift({id:uid("AUD"),at:now(),actorId:db.session.userId,kind:kind,entityId:entityId||null,message:message,meta:meta||{}});
 db.audit=db.audit.slice(0,500);
}
function currentUser(){return db.users[db.session.userId]||db.users["USR-CEO"]}
function setSession(userId){
 if(db.users[userId]){db.session.userId=userId;audit("session.switch",userId,"نقش فعال تغییر کرد");persist()}
 return currentUser();
}
function effectiveUser(user){
 var u=user||currentUser(),d=db.delegations.find(function(x){return x.toUserId===u.id&&x.active&&x.startAt<=now()&&x.endAt>=now()});
 return d&&db.users[d.fromUserId]?db.users[d.fromUserId]:u
}
function resourceDepartment(record){
 if(!record)return null;
 var map={hr:"HR",hse:"HSE",security:"Security",finance:"Finance",procurement:"Procurement",inventory:"Inventory",maintenance:"Maintenance",production:"Production",quality:"Quality",projects:"Projects"};
 return record.department||map[record.module]||null;
}
function can(action,resource,record,user){
 var u=user||currentUser(),eff=effectiveUser(u),role=eff.role,rl=roleLevel(role);
 if(role==="CEO")return true;
 if(role==="Auditor")return action==="read"||action==="view_audit";
 if(action==="view_audit")return rl>=5;
 if(action==="decide")return rl>=5&&(!record||roleLevel(record.requiredRole||"Executive")<=rl);
 if(action==="approve")return rl>=4&&(!record||roleLevel(record.requiredRole||"Manager")<=rl);
 if(action==="configure")return rl>=5;
 if(action==="escalate")return rl>=3;
 if(action==="write"||action==="create"||action==="transition"){
  var dep=resourceDepartment(record);
  return rl>=2&&(eff.scope==="organization"||eff.scope==="operations"||!dep||dep===eff.department);
 }
 if(action==="read"){
  var sensitivity=(record&&record.sensitivity)||"internal";
  if(eff.sensitivity.indexOf(sensitivity)<0)return false;
  var dep=resourceDepartment(record);
  if(eff.scope==="organization"||eff.scope==="organization-read"||eff.scope==="operations")return true;
  return !dep||dep===eff.department||record.ownerUserId===eff.id;
 }
 return false;
}
function requirePerm(action,resource,record){
 if(!can(action,resource,record)){audit("access.denied",record&&record.id,"دسترسی رد شد",{action:action,resource:resource,userId:currentUser().id});throw new Error("ACCESS_DENIED")}
}
function entity(id){return db.master.entities[id]||null}
function upsertEntity(rec){
 requirePerm("write","entity",rec);
 if(!rec.id)rec.id=uid("ENT");
 var old=db.master.entities[rec.id]||{};
 db.master.entities[rec.id]=Object.assign({},old,clone(rec),{updatedAt:now()});
 audit("entity.upsert",rec.id,"Master Entity بروزرسانی شد",{type:rec.type,module:rec.module});
 persist();return clone(db.master.entities[rec.id]);
}
function link(from,to,type,root){
 if(!db.links.some(function(x){return x.from===from&&x.to===to&&x.type===type})){
  db.links.push({id:uid("LNK"),from:from,to:to,type:type,root:!!root,createdAt:now()});
  audit("link.create",from+"→"+to,type,{root:!!root});
 }
}
function findLinks(id){return db.links.filter(function(x){return x.from===id||x.to===id})}
function activeCase(key){return db.cases.find(function(x){return x.key===key&&!/Closed/.test(x.status)})}
function activeAction(key){return db.actions.find(function(x){return x.key===key&&!/Completed|Verified|Cancelled/.test(x.status)})}
function activeDecision(key){return db.decisions.find(function(x){return x.key===key&&!/Decided|Cancelled|Closed/.test(x.status)})}
function activeApproval(key){return db.approvals.find(function(x){return x.key===key&&!/Approved|Rejected|Cancelled|Expired/.test(x.status)})}
function createCase(p){
 var c=activeCase(p.key);
 if(c){
  if(sevRank(p.severity)>sevRank(c.severity))c.severity=p.severity;
  c.updatedAt=now();if(p.eventId&&c.eventIds.indexOf(p.eventId)<0)c.eventIds.push(p.eventId);
  audit("case.update",c.id,"Case با Context جدید بروزرسانی شد");return c;
 }
 c={id:next("case"),key:p.key,title:p.title,module:p.module,severity:p.severity||"Medium",impact:p.impact||"I2",priority:p.priority||(p.severity==="Critical"?"P1":p.severity==="High"?"P2":"P3"),owner:p.owner,accountable:p.accountable||p.owner,ownerUserId:p.ownerUserId||null,status:"Qualified",eventIds:p.eventId?[p.eventId]:[],actionIds:[],decisionIds:[],approvalIds:[],riskIds:[],blockers:[],sensitivity:p.sensitivity||"internal",createdAt:now(),updatedAt:now(),timeline:[{at:now(),text:"Management Case ایجاد شد"}]};
 db.cases.push(c);audit("case.create",c.id,c.title,{module:c.module});return c;
}
function createAction(p){
 var a=activeAction(p.key);if(a)return a;
 a={id:next("action"),key:p.key,caseId:p.caseId||null,title:p.title,module:p.module,owner:p.owner,ownerUserId:p.ownerUserId||null,status:"Assigned",createdAt:now(),dueAt:now()+(p.dueMs||db.config.sla.actionDefaultMs),expectedResult:p.expectedResult||"",priority:p.priority||"P3",acknowledged:false,verified:false,sensitivity:p.sensitivity||"internal",slaState:"On Track"};
 db.actions.push(a);var c=db.cases.find(function(x){return x.id===p.caseId});if(c&&c.actionIds.indexOf(a.id)<0)c.actionIds.push(a.id);
 audit("action.create",a.id,a.title,{caseId:a.caseId,owner:a.owner});return a;
}
function createDecision(p){
 var d=activeDecision(p.key);if(d)return d;
 d={id:p.fixedId||next("decision"),key:p.key,caseId:p.caseId||null,title:p.title,owner:p.owner,ownerUserId:p.ownerUserId||null,authority:p.authority||"A4",requiredRole:p.requiredRole||"Executive",status:"Waiting for Decision",reason:p.reason||"",options:p.options||[],recommendation:p.recommendation||"",priority:p.priority||"P2",createdAt:now(),dueAt:now()+(p.priority==="P1"?db.config.sla.decisionP1Ms:db.config.sla.decisionP2Ms),decidedAt:null,outcome:null,sensitivity:p.sensitivity||"confidential"};
 db.decisions.push(d);var c=db.cases.find(function(x){return x.id===p.caseId});if(c&&c.decisionIds.indexOf(d.id)<0)c.decisionIds.push(d.id);
 audit("decision.create",d.id,d.title,{owner:d.owner,authority:d.authority});return d;
}
function createApproval(p){
 var a=activeApproval(p.key);if(a)return a;
 a={id:next("approval"),key:p.key,caseId:p.caseId||null,title:p.title,module:p.module,requester:p.requester||currentUser().name,approver:p.approver,approverUserId:p.approverUserId||null,requiredRole:p.requiredRole||"Manager",status:"Requested",policy:p.policy||"",amount:+p.amount||0,createdAt:now(),dueAt:now()+(p.dueMs||db.config.sla.approvalMs),conditions:[],sensitivity:p.sensitivity||"confidential"};
 db.approvals.push(a);var c=db.cases.find(function(x){return x.id===p.caseId});if(c&&c.approvalIds.indexOf(a.id)<0)c.approvalIds.push(a.id);
 audit("approval.create",a.id,a.title,{approver:a.approver,amount:a.amount});return a;
}
function createRisk(p){
 var r=db.risks.find(function(x){return x.key===p.key&&x.status!=="Closed"});if(r)return r;
 r={id:uid("RSK"),key:p.key,caseId:p.caseId||null,title:p.title,probability:p.probability||"P3",impact:p.impact||"I3",level:riskLevel(p.probability||"P3",p.impact||"I3"),owner:p.owner,residual:p.residual||"High",status:"Open",createdAt:now(),controls:p.controls||[],sensitivity:p.sensitivity||"internal"};
 db.risks.push(r);var c=db.cases.find(function(x){return x.id===p.caseId});if(c)c.riskIds.push(r.id);audit("risk.create",r.id,r.title);return r;
}
function quietHour(){
 var h=new Date().getHours(),s=db.config.notification.quietStart,e=db.config.notification.quietEnd;
 return s>e?(h>=s||h<e):(h>=s&&h<e);
}
function notify(p){
 var key=(p.caseId||"none")+"|"+p.purpose+"|"+p.recipient;
 var existing=db.notifications.find(function(n){return n.groupKey===key&&!/Resolved|Expired|Suppressed/.test(n.status)});
 var emergency=p.priority==="P0"||p.purpose==="Escalate"&&p.priority==="P1";
 if(!emergency&&quietHour()&&p.priority!=="P1"){
  var sup={id:next("notification"),caseId:p.caseId||null,purpose:p.purpose,priority:p.priority,title:p.title,recipient:p.recipient,status:"Suppressed",groupKey:key,createdAt:now(),updatedAt:now(),reason:"Quiet Hours",sensitivity:p.sensitivity||"internal"};
  db.notifications.push(sup);audit("notification.suppressed",sup.id,p.title,{reason:"Quiet Hours"});return sup;
 }
 if(existing&&now()-existing.updatedAt<db.config.notification.cooldownMs){
  existing.title=p.title;existing.priority=p.priority;existing.updatedAt=now();existing.reason=p.reason||existing.reason;
  audit("notification.update",existing.id,"اعلان Grouped/Cooldown بروزرسانی شد");return existing;
 }
 var n={id:next("notification"),caseId:p.caseId||null,purpose:p.purpose,priority:p.priority,title:p.title,recipient:p.recipient,status:"Created",groupKey:key,createdAt:now(),updatedAt:now(),reason:p.reason||"",sensitivity:p.sensitivity||"internal"};
 db.notifications.push(n);audit("notification.create",n.id,n.title,{purpose:n.purpose,priority:n.priority,recipient:n.recipient});return n;
}
function addOccurrence(eventId,input){
 var o={id:uid("EVO"),eventId:eventId,at:now(),source:input.source||"ui",context:input.context||"",payload:clone(input.payload||{})};
 db.eventOccurrences.push(o);return o;
}
function contextFor(input){
 var ctx={entity:input.entityId?entity(input.entityId):null,related:[],existingResponse:[]};
 if(ctx.entity){
  var e=ctx.entity;
  if(e.type==="item"){
   Object.keys(db.master.entities).forEach(function(k){var x=db.master.entities[k];if(x.type==="po"&&x.itemId===e.id&&x.status!=="Closed")ctx.existingResponse.push(x);if(x.type==="work_order"&&x.partIds&&x.partIds.indexOf(e.id)>=0)ctx.related.push(x)});
  }
  if(e.type==="asset")Object.keys(db.master.entities).forEach(function(k){var x=db.master.entities[k];if(x.type==="work_order"&&x.assetId===e.id)ctx.related.push(x)});
  if(e.type==="batch")Object.keys(db.master.entities).forEach(function(k){var x=db.master.entities[k];if(x.type==="sales_order"&&x.batchId===e.id)ctx.related.push(x)});
 }
 return ctx;
}
function emitEvent(input){
 input=input||{};var type=input.type||"Custom.Event",module=input.module||String(type).split(".")[0].toLowerCase(),entityId=input.entityId||null,severity=normalizeSeverity(input.severity),impact=input.impact||"I2";
 var dedupeKey=input.dedupeKey||type+"|"+(entityId||input.context||"generic");
 var ev=db.events.find(function(e){return e.dedupeKey===dedupeKey&&e.status==="Active"});
 if(ev){
  ev.occurrences=(ev.occurrences||1)+1;ev.updatedAt=now();if(input.context)ev.context=input.context;addOccurrence(ev.id,input);audit("event.dedupe",ev.id,"Occurrence به Event فعال متصل شد",{occurrences:ev.occurrences});
 }else{
  ev={id:uid("EVT"),type:type,module:module,entityId:entityId,severity:severity,impact:impact,urgency:input.urgency||"U3",context:input.context||"",payload:clone(input.payload||{}),dedupeKey:dedupeKey,status:"Active",occurrences:1,createdAt:now(),updatedAt:now(),rootEventId:input.rootEventId||null,sensitivity:input.sensitivity||((entity(entityId)||{}).sensitivity)||"internal"};
  db.events.push(ev);addOccurrence(ev.id,input);audit("event.create",ev.id,type,{entityId:entityId,module:module,severity:severity,impact:impact});
 }
 var ctx=contextFor(input);var out=evaluate(ev,input,ctx);persist();return out;
}
function emitImpact(p){
 var dk=p.type+"|"+p.entityId+"|"+p.rootEventId,ex=db.events.find(function(e){return e.dedupeKey===dk&&e.status==="Active"});if(ex)return ex;
 var ev={id:uid("EVT"),type:p.type,module:p.module,entityId:p.entityId,severity:p.severity,impact:p.impact,urgency:p.urgency||"U4",context:p.context||"",payload:{},dedupeKey:dk,status:"Active",occurrences:1,createdAt:now(),updatedAt:now(),rootEventId:p.rootEventId,sensitivity:"internal"};
 db.events.push(ev);addOccurrence(ev.id,{source:"correlation",context:p.context});audit("event.impact",ev.id,p.type,{rootEventId:p.rootEventId});link(p.rootEventId,ev.id,"root-impact",true);return ev;
}
function evaluate(ev,input,ctx){
 var t=ev.type;
 if(/Wheat\.(CoverageLow|AgingHigh|IncomingQCFail)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مدیر سیلو");
 if(/Procurement\.(ETAExceedsCoverage|VendorPerformanceLow)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مدیر تدارکات");
 if(/Sales\.(ShipmentBlocked|OTDLow)|AR\.Overdue/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مدیر فروش");
 if(/Energy\.(SpecificHigh|PeakRisk)|Utility\.Failure/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مدیر تأسیسات");
 if(/Tax\.(DeadlineNear|InvoiceError|NoticeCritical)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مسئول مالیاتی");
 if(/Ledger\.(CloseBlocked|ReconGap|PostAfterClose)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"رئیس حسابداری");
 if(/Asset\.(HealthLow|NoCustodian|Retire)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مسئول دارایی");
 if(/Security\.(UnauthorizedAccess|ContractorExpired|IncidentMajor)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مدیر حراست");
 if(/Meeting\.(ActionOverdue|DecisionNoAction|OwnerMissing)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"دفتر مدیرعامل");
 if(/Document\.(Expired|ReviewDue|AccessViolation)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مسئول اسناد");
 if(/Department\.(KPIOffTarget|ActionOverdue)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"مدیر واحد");
 if(/BI\.(AnomalyDetected|DataStale|KPIDefinitionConflict)/i.test(t))return ruleOperationalDomain(ev,input,ctx,"BI");
 if(/Inventory\.(Stockout|LowStock)/i.test(t))return ruleInventory(ev,input,ctx);
 if(/Maintenance\.AssetFailed/i.test(t))return ruleMaintenance(ev,input,ctx);
 if(/Production\.(TargetMissed|DowntimeExceeded|MaterialRisk)/i.test(t))return ruleProduction(ev,input,ctx);
 if(/Quality\.BatchHold/i.test(t))return ruleQuality(ev,input,ctx);
 if(/HSE\.(IncidentSevere|Incident)/i.test(t)&&sevRank(ev.severity)>=4)return ruleHSE(ev,input,ctx);
 if(/HR\.KeyPositionRisk/i.test(t))return ruleHR(ev,input,ctx);
 if(/Project\.MilestoneDelayed/i.test(t))return ruleProject(ev,input,ctx);
 if(/Finance\.CashRisk/i.test(t))return ruleFinance(ev,input,ctx);
 if(/Purchase\.PolicyException/i.test(t))return rulePolicyException(ev,input,ctx);
 return ruleGeneric(ev,input,ctx);
}
function ruleInventory(ev,input,ctx){
 var item=ctx.entity||{id:ev.entityId||"UNKNOWN",name:ev.entityId||"کالا",critical:sevRank(ev.severity)>=4,coverageDays:+(input.payload&&input.payload.coverageDays||0)};
 var openPO=(ctx.existingResponse||[]).slice().sort(function(a,b){return (+a.etaDays||999)-(+b.etaDays||999)})[0]||null;
 var coverage=item.coverageDays==null?+(input.payload&&input.payload.coverageDays||0):+item.coverageDays,eta=openPO?+openPO.etaDays:999,insufficient=!openPO||eta>coverage;
 var c=createCase({key:"supply:"+item.id,title:"ریسک تأمین "+(item.name||item.id),module:"inventory",severity:item.critical?"Critical":"High",impact:"I4",priority:item.critical?"P1":"P2",owner:"مدیر تدارکات",ownerUserId:"USR-PROC",accountable:"معاون عملیات",eventId:ev.id});
 c.timeline.push({at:now(),text:"Existing Response: "+(openPO?openPO.id+" / ETA "+eta+" روز":"PO فعال ندارد")});
 var r=createRisk({key:"supply-risk:"+item.id,caseId:c.id,title:"ریسک توقف ناشی از کمبود "+(item.name||item.id),probability:"P4",impact:"I4",owner:"مدیر تدارکات",residual:"High"});
 var a=createAction({key:"procure:"+item.id,caseId:c.id,title:"تأمین فوری "+(item.name||item.id),module:"procurement",owner:"مدیر تدارکات",ownerUserId:"USR-PROC",dueMs:4*3600000,expectedResult:"Coverage >= ETA",priority:"P1"});
 link(ev.id,c.id,"creates-case",true);link(item.id,c.id,"subject",true);link(c.id,a.id,"requires-action",false);if(openPO)link(openPO.id,c.id,"existing-response",false);
 (ctx.related||[]).forEach(function(wo){link(item.id,wo.id,"blocks-work-order",true);link(wo.id,c.id,"operational-impact",false);if(wo.productionImpact)emitImpact({type:"Production.MaterialRisk",module:"production",entityId:wo.id,severity:"High",impact:"I4",context:"کمبود "+item.id+" ریسک توقف تولید ایجاد کرده است.",rootEventId:ev.id})});
 if(insufficient){
  c.status="Actioning";c.blockers=["Existing response insufficient"];
  var amount=+(input.payload&&input.payload.emergencyPurchaseAmount||780000000);
  if(amount<=db.config.thresholds.executivePurchase){
   var ap=createApproval({key:"emergency-purchase:"+item.id,caseId:c.id,title:"تأیید خرید فوری "+(item.name||item.id),module:"procurement",requester:"مدیر تدارکات",approver:"معاون عملیات",requiredRole:"Executive",amount:amount,policy:"داخل سقف اختیار اجرایی"});
   c.approvalIds.push(ap.id);link(c.id,ap.id,"needs-approval",false);notify({caseId:c.id,purpose:"Act",priority:"P2",title:ap.title,recipient:"معاون عملیات",reason:"Approval Required"});return {event:ev,case:c,action:a,approval:ap,risk:r,output:"Case + Action + Approval"};
  }
  var d=createDecision({key:"inventory:"+item.id+":emergency-buy",fixedId:item.id==="ITEM-6205"?"DEC-142":null,caseId:c.id,title:"خرید اضطراری "+(item.name||item.id),owner:"مدیرعامل",ownerUserId:"USR-CEO",authority:"A5",requiredRole:"CEO",reason:"Coverage ("+coverage+" روز) کمتر از ETA ("+eta+" روز) است و پاسخ موجود کافی نیست.",options:[{label:"تأمین عادی",cost:openPO?openPO.value:null,risk:"ETA "+eta+" روز"},{label:"خرید اضطراری",cost:amount,risk:"هزینه بالاتر / کاهش ریسک توقف"}],recommendation:"خرید اضطراری مشروط به تحویل حداکثر ۴۸ ساعت",priority:"P1"});
  c.blockers.push(d.id);link(c.id,d.id,"needs-decision",false);notify({caseId:c.id,purpose:"Decide",priority:"P1",title:d.title,recipient:"مدیرعامل",reason:"Authority Gap A5",sensitivity:"confidential"});
  return {event:ev,case:c,action:a,decision:d,risk:r,output:"Case + Action + CEO Decision"};
 }
 notify({caseId:c.id,purpose:"Act",priority:"P2",title:a.title,recipient:"مدیر تدارکات",reason:"Supply risk"});return {event:ev,case:c,action:a,risk:r,output:"Case + Action"};
}
function ruleMaintenance(ev,input,ctx){
 var asset=ctx.entity||{id:ev.entityId||"ASSET",name:ev.entityId||"تجهیز",critical:true};
 var downtime=+(input.payload&&input.payload.downtimeMin||32),crit=asset.critical&&downtime>=db.config.thresholds.criticalDowntimeMin;
 var c=createCase({key:"maintenance:"+asset.id,title:"خرابی "+(asset.name||asset.id),module:"maintenance",severity:crit?"Critical":"High",impact:"I4",owner:"مدیر فنی",accountable:"مدیر تولید",eventId:ev.id});
 var a=createAction({key:"rca:"+asset.id,caseId:c.id,title:"تکمیل RCA خرابی "+(asset.name||asset.id),module:"maintenance",owner:"مدیر فنی",dueMs:6*3600000,expectedResult:"Root Cause + Prevention Verified",priority:"P2"});
 link(ev.id,c.id,"creates-case",true);link(c.id,a.id,"requires-action",false);
 if(downtime>0)emitImpact({type:"Production.DowntimeExceeded",module:"production",entityId:asset.id,severity:"High",impact:"I4",context:downtime+" دقیقه توقف تولید",rootEventId:ev.id});
 if(crit)notify({caseId:c.id,purpose:"Know",priority:"P1",title:"توقف تجهیز بحرانی: "+(asset.name||asset.id),recipient:"مدیرعامل",reason:"Critical production impact"});
 notify({caseId:c.id,purpose:"Act",priority:"P2",title:a.title,recipient:"مدیر فنی",reason:"RCA required"});return {event:ev,case:c,action:a,output:"Case + RCA + Executive Awareness"};
}
function ruleProduction(ev,input,ctx){
 var c=createCase({key:"production:"+String(ev.entityId||ev.dedupeKey),title:"انحراف تولید",module:"production",severity:ev.severity,impact:ev.impact||"I3",owner:"مدیر تولید",accountable:"معاون عملیات",eventId:ev.id});
 var a=createAction({key:"production-corrective:"+c.key,caseId:c.id,title:"تحلیل علت و برنامه جبرانی تولید",module:"production",owner:"مدیر تولید",dueMs:4*3600000,expectedResult:"Cause + Recovery Plan",priority:"P2"});
 if(ev.rootEventId)link(ev.rootEventId,ev.id,"root-impact",true);link(ev.id,c.id,"creates-case",!ev.rootEventId);return {event:ev,case:c,action:a,output:"Case + Corrective Action"};
}
function ruleQuality(ev,input,ctx){
 var batch=ctx.entity||{id:ev.entityId||"BATCH",shipmentIds:[]};
 var c=createCase({key:"quality:"+batch.id,title:"Batch Hold "+batch.id,module:"quality",severity:"High",impact:"I3",owner:"مدیر کیفیت",accountable:"مدیر تولید",eventId:ev.id});
 var a=createAction({key:"quality-release:"+batch.id,caseId:c.id,title:"تکمیل آزمون و تعیین تکلیف "+batch.id,module:"quality",owner:"مدیر آزمایشگاه",dueMs:3*3600000,expectedResult:"Release/Reject مستند",priority:"P2"});
 (batch.shipmentIds||[]).forEach(function(o){link(batch.id,o,"blocks-shipment",true);emitImpact({type:"Sales.ShipmentBlocked",module:"sales",entityId:o,severity:"High",impact:"I3",context:"بارگیری وابسته به "+batch.id,rootEventId:ev.id})});
 notify({caseId:c.id,purpose:"Act",priority:"P2",title:a.title,recipient:"مدیر آزمایشگاه",reason:"Shipment dependency"});return {event:ev,case:c,action:a,output:"Case + Quality Action"};
}
function ruleHSE(ev,input,ctx){
 var c=createCase({key:"hse:"+String(ev.entityId||ev.id),title:"رخداد HSE شدید",module:"hse",severity:"Emergency",impact:"I5",priority:"P0",owner:"مدیر HSE",ownerUserId:"USR-HSE",accountable:"مدیر سایت",eventId:ev.id,sensitivity:"restricted"});
 var a=createAction({key:"hse-contain:"+c.key,caseId:c.id,title:"ایمن‌سازی فوری و کنترل رخداد",module:"hse",owner:"مدیر HSE",ownerUserId:"USR-HSE",dueMs:3600000,expectedResult:"Immediate Risk Controlled",priority:"P0",sensitivity:"restricted"});
 notify({caseId:c.id,purpose:"Escalate",priority:"P0",title:"رخداد HSE اضطراری",recipient:"مدیرعامل",reason:"Safety severe override",sensitivity:"restricted"});notify({caseId:c.id,purpose:"Act",priority:"P0",title:a.title,recipient:"مدیر HSE",reason:"Emergency response",sensitivity:"restricted"});return {event:ev,case:c,action:a,output:"Emergency Case + P0 Escalation"};
}
function ruleHR(ev,input,ctx){
 var pos=ctx.entity||{id:ev.entityId||"POS",name:"پست کلیدی",readyNow:0};
 var c=createCase({key:"succession:"+pos.id,title:"ریسک جانشینی "+(pos.name||pos.id),module:"hr",severity:"High",impact:"I3",owner:"مدیر منابع انسانی",ownerUserId:"USR-HR",accountable:"معاون عملیات",eventId:ev.id,sensitivity:"restricted"});
 var a=createAction({key:"succession-plan:"+pos.id,caseId:c.id,title:"برنامه توسعه جانشین برای "+(pos.name||pos.id),module:"hr",owner:"مدیر منابع انسانی",ownerUserId:"USR-HR",dueMs:7*24*3600000,expectedResult:"Readiness + Development Plan",priority:"P2",sensitivity:"restricted"});
 if((pos.readyNow||0)===0){var d=createDecision({key:"succession:"+pos.id+":decision",caseId:c.id,title:"تعیین رویکرد جانشینی "+(pos.name||pos.id),owner:"معاون عملیات",ownerUserId:"USR-OPS",authority:"A4",requiredRole:"Executive",reason:"هیچ جانشین Ready Now وجود ندارد.",options:[{label:"انتصاب موقت"},{label:"برنامه توسعه"},{label:"جذب بیرونی"}],recommendation:"انتصاب موقت + برنامه توسعه",priority:"P2",sensitivity:"restricted"});link(c.id,d.id,"needs-decision",false);notify({caseId:c.id,purpose:"Decide",priority:"P2",title:d.title,recipient:"معاون عملیات",reason:"Succession authority",sensitivity:"restricted"});return {event:ev,case:c,action:a,decision:d,output:"HR Case + Executive Decision"}}
 return {event:ev,case:c,action:a,output:"HR Case + Action"};
}
function ruleProject(ev,input,ctx){var c=createCase({key:"project:"+String(ev.entityId||ev.id),title:"تأخیر Milestone بحرانی",module:"projects",severity:"High",impact:"I3",owner:"مدیر پروژه",accountable:"Sponsor",eventId:ev.id});var a=createAction({key:"project-recovery:"+c.key,caseId:c.id,title:"Recovery Plan برای Milestone",module:"projects",owner:"مدیر پروژه",dueMs:8*3600000,expectedResult:"Recovery Plan",priority:"P2"});notify({caseId:c.id,purpose:"Act",priority:"P2",title:a.title,recipient:"مدیر پروژه",reason:"Critical path delay"});return {event:ev,case:c,action:a,output:"Project Case + Recovery Action"}}
function ruleFinance(ev,input,ctx){var c=createCase({key:"finance:"+String(ev.entityId||ev.id),title:"ریسک نقدینگی",module:"finance",severity:"High",impact:"I4",owner:"مدیر مالی",ownerUserId:"USR-FIN",accountable:"مدیرعامل",eventId:ev.id,sensitivity:"confidential"});var a=createAction({key:"cash-plan:"+c.key,caseId:c.id,title:"سناریوی اصلاح Cash Forecast",module:"finance",owner:"مدیر مالی",ownerUserId:"USR-FIN",dueMs:4*3600000,expectedResult:"Gap + Funding Options",priority:"P2",sensitivity:"confidential"});notify({caseId:c.id,purpose:"Know",priority:"P2",title:"ریسک نقدینگی نیازمند پایش",recipient:"مدیرعامل",reason:"Major financial exposure",sensitivity:"confidential"});return {event:ev,case:c,action:a,output:"Finance Case + Executive Awareness"}}
function rulePolicyException(ev,input,ctx){var c=createCase({key:"policy:"+String(ev.entityId||ev.id),title:"استثنای سیاست خرید",module:"procurement",severity:"High",impact:"I3",owner:"مدیر تدارکات",ownerUserId:"USR-PROC",accountable:"معاون عملیات",eventId:ev.id});var d=createDecision({key:"policy-decision:"+c.key,caseId:c.id,title:"تصمیم درباره استثنای سیاست خرید",owner:"معاون عملیات",ownerUserId:"USR-OPS",authority:"A4",requiredRole:"Executive",reason:ev.context||"Policy Exception",options:[{label:"Approve Exception"},{label:"Return to Policy"}],recommendation:"فقط در صورت توجیه اثر عملیاتی",priority:"P2"});notify({caseId:c.id,purpose:"Decide",priority:"P2",title:d.title,recipient:"معاون عملیات",reason:"Policy Exception"});return {event:ev,case:c,decision:d,output:"Decision"}}
function ruleOperationalDomain(ev,input,ctx,owner){
 var severe=sevRank(ev.severity)>=4||impactRank(ev.impact)>=4;
 var c=severe?createCase({key:"domain:"+ev.dedupeKey,title:ev.context||ev.type,module:ev.module,severity:ev.severity,impact:ev.impact,owner:owner,accountable:owner,eventId:ev.id,sensitivity:ev.sensitivity||"internal"}):null;
 var a=createAction({key:"domain-action:"+ev.dedupeKey,caseId:c?c.id:null,title:"رسیدگی به "+ev.type,module:ev.module,owner:owner,dueMs:severe?4*3600000:db.config.sla.actionDefaultMs,expectedResult:"Exception رفع و نتیجه قابل Verification ثبت شود",priority:severe?"P2":"P3",sensitivity:ev.sensitivity||"internal"});
 if(c){link(ev.id,c.id,"creates-case",true);link(c.id,a.id,"requires-action",false)}
 notify({caseId:c?c.id:null,purpose:"Act",priority:severe?"P2":"P3",title:a.title,recipient:owner,reason:ev.type,sensitivity:ev.sensitivity||"internal"});
 if(/Security\.UnauthorizedAccess|Tax\.NoticeCritical|Ledger\.CloseBlocked/.test(ev.type)&&severe){
  notify({caseId:c?c.id:null,purpose:"Know",priority:"P2",title:ev.context||ev.type,recipient:"مدیرعامل",reason:"Major exception",sensitivity:ev.sensitivity||"internal"});
 }
 return {event:ev,case:c,action:a,output:c?"Case + Action":"Action"};
}
function ruleGeneric(ev,input,ctx){if(sevRank(ev.severity)>=4){var c=createCase({key:"generic:"+ev.dedupeKey,title:ev.context||ev.type,module:ev.module,severity:ev.severity,impact:ev.impact,owner:"مدیر واحد",eventId:ev.id});var a=createAction({key:"generic-action:"+c.key,caseId:c.id,title:"اقدام اصلاحی برای "+ev.type,module:ev.module,owner:"مدیر واحد",expectedResult:"Exception Resolved",priority:"P2"});return {event:ev,case:c,action:a,output:"Case + Action"}}var a2=createAction({key:"event-action:"+ev.dedupeKey,title:"بررسی "+ev.type,module:ev.module,owner:"مسئول واحد",expectedResult:"Review Result",priority:"P3"});return {event:ev,action:a2,output:"Action"}}
function queryBusinessRecords(kind,filter){
 var arr=clone((db.records&&db.records[kind])||[]),u=currentUser();
 return arr.filter(function(x){return can("read","business_record",x,u)&&(typeof filter!=="function"||filter(x))});
}
function resolveDerivedEvent(type,entityId){
 var dk=type+"|"+entityId,ev=db.events.find(function(e){return e.status==="Active"&&(e.dedupeKey===dk||e.dedupeKey.indexOf(dk)===0)});
 if(ev){ev.status="Resolved";ev.resolvedAt=now();audit("event.resolve",ev.id,type+" resolved from source data",{entityId:entityId})}
}
function syncMasterFromBusinessRecord(kind,record){
 var id=record.entityId||record.itemId||record.assetId||record.poId||record.batchId||record.orderId||null;
 if(!id)return;
 var e=db.master.entities[id]||{id:id,name:record.name||id,module:record.module||"general",type:record.entityType||kind,sensitivity:record.sensitivity||"internal"};
 if(kind==="inventoryStock"){e.stock=+record.available||0;e.available=+record.available||0;e.safety=+record.safety||0;e.coverageDays=+record.coverageDays||0;e.critical=!!record.critical}
 if(kind==="procurementOrder"){e.type="po";e.itemId=record.itemId;e.etaDays=+record.etaDays||0;e.value=+record.value||0;e.status=record.status||"Open";e.vendor=record.vendor||e.vendor}
 if(kind==="maintenanceAsset"){e.type="asset";e.critical=!!record.critical;e.status=record.status||e.status;e.health=+record.health||0}
 if(kind==="maintenanceWO"){e.type="work_order";e.assetId=record.assetId;e.partIds=record.partIds||e.partIds||[];e.status=record.status||e.status;e.productionImpact=!!record.productionImpact}
 if(kind==="qualityBatch"){e.type="batch";e.status=record.status||e.status;e.shipmentIds=record.shipmentIds||e.shipmentIds||[]}
 if(kind==="salesOrder"){e.type="sales_order";e.status=record.status||e.status;e.batchId=record.batchId||e.batchId}
 db.master.entities[id]=e;
}
function deriveBusinessEvents(kind,record,previous,opts){
 if(opts&&opts.skipAutomation)return [];
 var out=[],emit=function(p){p.source="business-record";out.push(emitEvent(p))};
 if(kind==="inventoryStock"){
  var entityId=record.itemId||record.entityId||record.id,avail=+record.available||0,safety=+record.safety||0,cov=+record.coverageDays||0,eta=+record.etaDays||0;
  if(avail<=0)emit({type:"Inventory.Stockout",module:"inventory",entityId:entityId,severity:record.critical?"S4":"S3",impact:record.critical?"I4":"I3",urgency:"U5",context:"موجودی "+(record.name||entityId)+" صفر شده است.",payload:{stock:avail,coverageDays:cov,emergencyPurchaseAmount:+record.emergencyPurchaseAmount||780000000}});
  else if(avail<safety||eta>cov)emit({type:"Inventory.LowStock",module:"inventory",entityId:entityId,severity:record.critical?"S4":"S3",impact:record.critical?"I4":"I3",urgency:"U4",context:"پوشش/موجودی "+(record.name||entityId)+" زیر حد ایمن است.",payload:{stock:avail,coverageDays:cov,emergencyPurchaseAmount:+record.emergencyPurchaseAmount||300000000}});
  else {resolveDerivedEvent("Inventory.Stockout",entityId);resolveDerivedEvent("Inventory.LowStock",entityId)}
 }
 if(kind==="productionShift"){
  var eid=record.entityId||record.id,plan=+record.plan||0,actual=+record.actual||0,down=+record.downtimeMin||0;
  if(plan>0&&actual/plan<0.95)emit({type:"Production.TargetMissed",module:"production",entityId:eid,severity:actual/plan<0.85?"S4":"S3",impact:actual/plan<0.85?"I4":"I3",urgency:"U4",context:"تولید واقعی "+actual+" در برابر برنامه "+plan+" ثبت شد.",payload:{plan:plan,actual:actual,downtimeMin:down}});
  else resolveDerivedEvent("Production.TargetMissed",eid);
  if(down>=db.config.thresholds.criticalDowntimeMin)emit({type:"Production.DowntimeExceeded",module:"production",entityId:record.assetId||eid,severity:"S4",impact:"I4",urgency:"U5",context:down+" دقیقه توقف تولید ثبت شد.",payload:{downtimeMin:down}});
  else resolveDerivedEvent("Production.DowntimeExceeded",record.assetId||eid);
 }
 if(kind==="maintenanceWO"&&(record.status==="Failed"||record.status==="Emergency"||(+record.downtimeMin||0)>=db.config.thresholds.criticalDowntimeMin)){
  emit({type:"Maintenance.AssetFailed",module:"maintenance",entityId:record.assetId||record.entityId||record.id,severity:record.critical?"S4":"S3",impact:record.productionImpact?"I4":"I3",urgency:"U5",context:"WO "+record.id+" خرابی تجهیز را ثبت کرده است.",payload:{downtimeMin:+record.downtimeMin||0}});
 }
 if(kind==="qualityBatch"){
  var bid=record.batchId||record.entityId||record.id;
  if(record.status==="Hold")emit({type:"Quality.BatchHold",module:"quality",entityId:bid,severity:"S3",impact:record.shipmentBlocked?"I4":"I3",urgency:"U4",context:"Batch "+bid+" در وضعیت Hold است."});
  else resolveDerivedEvent("Quality.BatchHold",bid);
 }
 if(kind==="procurementOrder"&&(record.status==="Delayed"||(+record.etaDays||0)>(+record.needInDays||999))){
  emit({type:"Procurement.ETAExceedsCoverage",module:"procurement",entityId:record.poId||record.entityId||record.id,severity:record.critical?"S4":"S3",impact:record.critical?"I4":"I3",urgency:"U4",context:"ETA سفارش "+record.id+" از زمان نیاز عبور کرده است."});
 }
 if(kind==="wheatStock"&&(+record.coverageDays||0)<(+record.minCoverageDays||30))emit({type:"Wheat.CoverageLow",module:"wheat",entityId:record.id,severity:"S3",impact:"I3",urgency:"U3",context:"پوشش گندم به "+record.coverageDays+" روز رسیده است."});
 if(kind==="energyMeter"&&(+record.specific||0)>(+record.target||0))emit({type:"Energy.SpecificHigh",module:"energy",entityId:record.id,severity:(+record.specific>+record.target*1.1)?"S4":"S3",impact:"I3",urgency:"U3",context:"مصرف ویژه "+record.utility+" بالاتر از هدف است."});
 if(kind==="salesOrder"&&/Blocked|Hold|Overdue/.test(record.status||""))emit({type:"Sales.ShipmentBlocked",module:"sales",entityId:record.orderId||record.id,severity:"S3",impact:"I3",urgency:"U4",context:"سفارش "+record.id+" با مانع "+(record.blocker||record.status)+" روبه‌رو است."});
 if(kind==="financeCash"&&(+record.netGap||0)<0)emit({type:"Finance.CashRisk",module:"finance",entityId:record.id,severity:Math.abs(+record.netGap)>=db.config.thresholds.highFinancialExposure?"S4":"S3",impact:"I4",urgency:"U4",context:"Cash Forecast دارای Gap منفی است.",payload:{gap:+record.netGap}});
 if(kind==="hseIncident"&&/High|Critical|Emergency/.test(record.severity||""))emit({type:"HSE.Incident",module:"hse",entityId:record.id,severity:record.severity==="Emergency"?"S5":"S4",impact:"I5",urgency:"U5",context:record.title||"رخداد HSE مهم",sensitivity:"restricted"});
 if(kind==="projectMilestone"&&(record.status==="Delayed"||(+record.delayDays||0)>0)&&record.criticalPath)emit({type:"Project.MilestoneDelayed",module:"projects",entityId:record.id,severity:(+record.delayDays||0)>7?"S4":"S3",impact:"I3",urgency:"U3",context:"Milestone بحرانی "+record.id+" با "+record.delayDays+" روز تأخیر روبه‌رو است."});
 if(kind==="securityAccess"&&record.authorized===false)emit({type:"Security.UnauthorizedAccess",module:"security",entityId:record.id,severity:"S4",impact:"I3",urgency:"U5",context:"تلاش دسترسی غیرمجاز ثبت شد.",sensitivity:"restricted"});
 if(kind==="taxObligation"&&(+record.daysToDue||999)<=7)emit({type:"Tax.DeadlineNear",module:"tax",entityId:record.id,severity:(+record.daysToDue<=2)?"S4":"S3",impact:"I3",urgency:"U4",context:"مهلت مالیاتی "+record.id+" نزدیک است."});
 if(kind==="ledgerControl"&&record.status==="Blocked")emit({type:"Ledger.CloseBlocked",module:"ledger",entityId:record.id,severity:"S4",impact:"I4",urgency:"U4",context:"بستن دوره توسط "+record.id+" Block شده است."});
 if(kind==="assetHealth"&&record.critical&&(+record.health||100)<75)emit({type:"Asset.HealthLow",module:"assets",entityId:record.assetId||record.id,severity:"S4",impact:"I4",urgency:"U3",context:"سلامت دارایی بحرانی "+record.id+" به "+record.health+"٪ رسیده است."});
 if(kind==="meetingAction"&&(record.status==="Overdue"||(+record.overdueDays||0)>0))emit({type:"Meeting.ActionOverdue",module:"meetings",entityId:record.id,severity:(+record.overdueDays||0)>3?"S4":"S3",impact:"I2",urgency:"U4",context:"مصوبه "+record.id+" معوق است."});
 if(kind==="documentControl"&&record.status==="Expired")emit({type:"Document.Expired",module:"documents",entityId:record.id,severity:record.critical?"S4":"S3",impact:record.critical?"I4":"I2",urgency:"U4",context:"سند "+record.id+" منقضی شده است."});
 if(kind==="departmentKpi"&&+record.actual<+record.target)emit({type:"Department.KPIOffTarget",module:record.sourceModule||"department",entityId:record.id,severity:(+record.actual/+record.target)<0.85?"S4":"S3",impact:"I3",urgency:"U3",context:"KPI "+record.name+" پایین‌تر از هدف است."});
 if(kind==="biMetric"&&record.anomaly)emit({type:"BI.AnomalyDetected",module:"bi",entityId:record.id,severity:"S3",impact:"I2",urgency:"U2",context:"ناهنجاری در KPI "+record.name+" تشخیص داده شد."});
 return out;
}
function upsertBusinessRecord(kind,record,opts){
 record=clone(record||{});record.kind=kind;record.module=record.module||"hr";record.department=record.department||resourceDepartment(record)||"HR";record.sensitivity=record.sensitivity||((record.module==="hr"||record.module==="hse"||record.module==="security")?"restricted":"internal");
 requirePerm("write","business_record",record);
 if(!record.id)record.id=(kind==="hrPerformance"?"PERF":kind==="hrTraining"?"TR":kind==="hrCompetency"?"COMP":"REC")+"-"+Math.floor(Math.random()*900000+100000);
 db.records[kind]=db.records[kind]||[];
 var i=db.records[kind].findIndex(function(x){return x.id===record.id}),previous=i>=0?clone(db.records[kind][i]):null;
 record.updatedAt=now();if(i>=0)db.records[kind][i]=Object.assign({},db.records[kind][i],record);else{record.createdAt=now();db.records[kind].push(record)}
 syncMasterFromBusinessRecord(kind,record);
 audit("record.upsert",record.id,kind+" رکورد بروزرسانی شد",{kind:kind,employeeId:record.employeeId||null});
 var derived=deriveBusinessEvents(kind,record,previous,opts||{});
 persist();var result=clone(record);result._derivedEvents=derived.map(function(x){return x&&x.output||"Processed"});return result;
}
function removeBusinessRecord(kind,id){
 var list=db.records[kind]||[],rec=list.find(function(x){return x.id===id});if(!rec)return false;requirePerm("write","business_record",rec);
 db.records[kind]=list.filter(function(x){return x.id!==id});audit("record.remove",id,kind+" رکورد حذف شد");persist();return true;
}
function requestPart(input){
 input=clone(input||{});var qty=+input.qty||0,item=entity(input.itemId),requestId=input.id||uid("REQ");
 requirePerm("create","business_record",{module:"inventory",department:"Inventory",sensitivity:"internal"});
 if(!item||item.type!=="item")throw new Error("ITEM_NOT_FOUND");
 if(qty<=0||Math.floor(qty)!==qty)throw new Error("INVALID_QUANTITY");
 if((db.records.partRequests||[]).some(function(x){return x.id===requestId}))throw new Error("DUPLICATE_REQUEST");
 var available=+(item.available==null?item.stock:item.available)||0,safety=+item.safety||0,issued=Math.min(available,qty),remaining=available-issued;
 var req={id:requestId,kind:"partRequest",module:"inventory",department:"Inventory",itemId:item.id,qty:qty,requester:input.requester||currentUser().name,workOrderId:input.workOrderId||null,status:issued===qty?"Issued":"Partially Issued",issuedQty:issued,createdAt:now(),sensitivity:"internal"};
 db.records.partRequests.push(req);
 if(issued>0){
  var mov={id:uid("ISS"),kind:"inventoryMovement",module:"inventory",department:"Inventory",requestId:req.id,itemId:item.id,qty:issued,type:"Issue",status:"Posted",createdAt:now(),sensitivity:"internal"};
  db.records.inventoryMovements.push(mov);item.stock=remaining;item.available=remaining;link(req.id,mov.id,"fulfilled-by-issue",true);if(req.workOrderId)link(mov.id,req.workOrderId,"issued-to-work-order",false);
 }
 var replenish=issued<qty||remaining<=safety;
 if(replenish){
  var shortage=Math.max(0,qty-issued),needReason=shortage>0?"کسری موجودی":"رسیدن موجودی به حد سفارش",existingPr=(db.records.purchaseRequests||[]).find(function(x){return x.itemId===item.id&&!/Received|Cancelled|Rejected/.test(x.status)}),existingPo=Object.keys(db.master.entities).map(function(k){return db.master.entities[k]}).find(function(x){return x.type==="po"&&x.itemId===item.id&&!/Delivered|Closed|Cancelled/.test(x.status)}),existing=existingPr||existingPo;
  if(existing){req.existingResponseId=existing.id;req.status=issued===qty?"Issued / Existing Supply Monitored":"Awaiting Existing Supply";link(req.id,existing.id,"uses-existing-supply",true)}
  else{var prQty=Math.max(shortage,safety-remaining+1),pr={id:uid("PR"),kind:"purchaseRequest",module:"procurement",department:"Procurement",requestId:req.id,itemId:item.id,qty:prQty,status:"Requested",reason:needReason,createdAt:now(),sensitivity:"confidential"};db.records.purchaseRequests.push(pr);req.purchaseRequestId=pr.id;req.status=issued===qty?"Issued / Replenishment Requested":"Awaiting Supply";link(req.id,pr.id,"triggers-purchase-request",true)}
  emitEvent({type:remaining<=0?"Inventory.Stockout":"Inventory.LowStock",module:"inventory",entityId:item.id,severity:item.critical?"S4":"S3",impact:item.critical?"I4":"I3",urgency:"U4",context:needReason+" برای "+(item.name||item.id),payload:{stock:remaining,coverageDays:item.coverageDays||0,emergencyPurchaseAmount:+input.estimatedAmount||300000000}});
 }
 audit("part.request",req.id,"درخواست قطعه ارزیابی شد",{itemId:item.id,qty:qty,issued:issued,purchaseRequired:replenish});persist();return clone({request:req,purchaseRequest:req.purchaseRequestId?(db.records.purchaseRequests.find(function(x){return x.id===req.purchaseRequestId})):null});
}
function progressPurchase(prId,step,input){
 input=clone(input||{});var pr=(db.records.purchaseRequests||[]).find(function(x){return x.id===prId});if(!pr)throw new Error("PURCHASE_REQUEST_NOT_FOUND");
 requirePerm("transition","business_record",pr);var po,receipt,commitment;
 if(step==="order"){
  if(pr.poId)throw new Error("PURCHASE_ALREADY_ORDERED");
  po={id:input.poId||uid("PO"),type:"po",name:input.poId||"سفارش خرید",module:"procurement",department:"Procurement",itemId:pr.itemId,qty:pr.qty,vendor:input.vendor||"تأمین‌کننده تأییدشده",etaDays:+input.etaDays||5,value:+input.value||0,status:"Ordered",sourcePrId:pr.id,sensitivity:"confidential"};
  db.master.entities[po.id]=po;pr.poId=po.id;pr.status="Ordered";link(pr.id,po.id,"converted-to-order",true);
 }else if(step==="receive"){
  if(!pr.poId)throw new Error("ORDER_REQUIRED");if(pr.receiptId)throw new Error("PURCHASE_ALREADY_RECEIVED");
  po=entity(pr.poId);var received=+input.qty||pr.qty;if(received<=0||received>pr.qty)throw new Error("INVALID_RECEIPT_QUANTITY");
  receipt={id:uid("GRN"),kind:"goodsReceipt",module:"inventory",department:"Inventory",prId:pr.id,poId:pr.poId,itemId:pr.itemId,qty:received,status:"Accepted",createdAt:now(),sensitivity:"internal"};db.records.goodsReceipts.push(receipt);pr.receiptId=receipt.id;pr.status="Received";if(po)po.status="Delivered";
  var item=entity(pr.itemId);item.stock=(+item.stock||0)+received;item.available=(+item.available||0)+received;link(pr.poId,receipt.id,"received-as",true);
  commitment={id:uid("FIN"),kind:"financialCommitment",module:"finance",department:"Finance",prId:pr.id,poId:pr.poId,amount:po?+po.value||0:0,status:"Recorded",createdAt:now(),sensitivity:"confidential"};db.records.financialCommitments.push(commitment);pr.financialCommitmentId=commitment.id;link(receipt.id,commitment.id,"creates-financial-commitment",false);
 }else throw new Error("INVALID_PURCHASE_STEP");
 audit("purchase."+step,pr.id,"فرایند خرید به‌روزرسانی شد",{poId:pr.poId||null});persist();return clone({purchaseRequest:pr,order:po||entity(pr.poId),receipt:receipt||null,financialCommitment:commitment||null});
}
function createManualAction(input){
 input=input||{};
 var rec={module:input.module||"general",sensitivity:input.sensitivity||"internal"};
 requirePerm("create","action",rec);
 var a=createAction({
  key:input.key||("manual:"+(input.module||"general")+":"+uid("KEY")),
  caseId:input.caseId||null,
  title:input.title||"اقدام جدید",
  module:input.module||"general",
  owner:input.owner||currentUser().name,
  ownerUserId:input.ownerUserId||null,
  dueMs:input.dueMs||db.config.sla.actionDefaultMs,
  expectedResult:input.expectedResult||"",
  priority:input.priority||"P3",
  sensitivity:input.sensitivity||"internal"
 });
 audit("action.manual",a.id,"Action دستی از ماژول ایجاد شد",{module:a.module});
 persist();
 return clone(a);
}
function transitionApproval(id,status,note){
 var a=db.approvals.find(function(x){return x.id===id});if(!a)return null;requirePerm("approve","approval",a);
 var allowed={Requested:["Under Review","Approved","Rejected","Returned"],"Under Review":["Approved","Rejected","Returned"],Returned:["Under Review","Cancelled"]};
 if((allowed[a.status]||[]).indexOf(status)<0)throw new Error("INVALID_TRANSITION");
 a.status=status;a.updatedAt=now();if(note)a.note=note;a.conditions=a.conditions||[];
 if(status==="Approved")a.approvedAt=now();audit("approval."+status.toLowerCase().replace(/\s/g,"_"),a.id,"Approval → "+status,{note:note||""});persist();return clone(a);
}
function resolveDecision(id,outcome,meta){
 var d=db.decisions.find(function(x){return x.id===id});if(!d)return null;requirePerm("decide","decision",d);
 d.status="Decided";d.outcome=outcome;d.decidedAt=now();d.meta=meta||{};audit("decision.decide",d.id,"Decision → "+outcome,meta||{});
 var c=db.cases.find(function(x){return x.id===d.caseId});if(c){c.timeline.push({at:now(),text:"Decision "+d.id+": "+outcome});c.blockers=(c.blockers||[]).filter(function(b){return b!==d.id})}
 if(d.key&&/inventory:.*:emergency-buy/.test(d.key)&&/approve|approved|conditional|ثبت|تأیید/i.test(outcome)){
  var itemId=d.key.split(":")[1],poId="PO-EM-"+Math.floor(Math.random()*900+100);
  db.master.entities[poId]={id:poId,type:"po",name:poId,module:"procurement",itemId:itemId,vendor:"تأمین‌کننده اضطراری B",etaDays:2,value:780000000,status:"Ordered",sourceDecisionId:d.id,sensitivity:"confidential"};
  var pa=createAction({key:"emergency-po:"+itemId,caseId:d.caseId,title:"صدور و پیگیری PO اضطراری "+itemId,module:"procurement",owner:"مدیر تدارکات",ownerUserId:"USR-PROC",dueMs:2*3600000,expectedResult:"PO صادر و ETA قطعی",priority:"P1"});
  var fa=createAction({key:"financial-commitment:"+poId,caseId:d.caseId,title:"ثبت تعهد مالی "+poId,module:"finance",owner:"مدیر مالی",ownerUserId:"USR-FIN",dueMs:2*3600000,expectedResult:"Commitment در Cash Forecast",priority:"P2",sensitivity:"confidential"});
  link(d.id,poId,"authorizes-po",true);link(poId,pa.id,"execution-action",false);link(poId,fa.id,"financial-impact",false);
  notify({caseId:d.caseId,purpose:"Act",priority:"P1",title:pa.title,recipient:"مدیر تدارکات",reason:"Decision execution"});notify({caseId:d.caseId,purpose:"Act",priority:"P2",title:fa.title,recipient:"مدیر مالی",reason:"Financial commitment",sensitivity:"confidential"});
 }
 persist();return clone(d);
}
function completeAction(id,verify){
 var a=db.actions.find(function(x){return x.id===id});if(!a)return null;requirePerm("transition","action",a);
 a.status=verify?"Verified":"Completed";a.completedAt=now();a.verified=!!verify;a.slaState="Done";audit("action.complete",a.id,"Action → "+a.status,{verified:!!verify});
 var c=db.cases.find(function(x){return x.id===a.caseId});if(c){c.timeline.push({at:now(),text:a.id+" → "+a.status});recalcCase(c)}
 persist();return clone(a);
}
function recalcCase(c){
 var openA=db.actions.some(function(x){return x.caseId===c.id&&!/Completed|Verified|Cancelled/.test(x.status)});
 var openD=db.decisions.some(function(x){return x.caseId===c.id&&!/Decided|Cancelled|Closed/.test(x.status)});
 var openP=db.approvals.some(function(x){return x.caseId===c.id&&!/Approved|Rejected|Cancelled|Expired/.test(x.status)});
 if(!openA&&!openD&&!openP){
  var critical=sevRank(c.severity)>=4;
  var allVerified=!db.actions.some(function(x){return x.caseId===c.id&&x.status==="Completed"&&!x.verified});
  c.status=critical?(allVerified?"Verified":"Resolved"):"Resolved";
 }
}
function verifyCase(id){
 var c=db.cases.find(function(x){return x.id===id});if(!c)return null;requirePerm("transition","case",c);
 var open=db.actions.some(function(x){return x.caseId===id&&!/Completed|Verified|Cancelled/.test(x.status)})||db.decisions.some(function(x){return x.caseId===id&&!/Decided|Cancelled|Closed/.test(x.status)})||db.approvals.some(function(x){return x.caseId===id&&!/Approved|Rejected|Cancelled|Expired/.test(x.status)});
 if(open)throw new Error("CASE_HAS_OPEN_ITEMS");
 c.status="Verified";c.verifiedAt=now();c.timeline.push({at:now(),text:"Verification انجام شد"});audit("case.verify",c.id,"Case Verified");persist();return clone(c);
}
function closeCase(id){
 var c=db.cases.find(function(x){return x.id===id});if(!c)return null;requirePerm("transition","case",c);
 if(sevRank(c.severity)>=4&&c.status!=="Verified")throw new Error("CRITICAL_REQUIRES_VERIFICATION");
 if(!/Resolved|Verified/.test(c.status))throw new Error("CASE_NOT_READY");
 c.status="Closed";c.closedAt=now();c.timeline.push({at:now(),text:"Case Closed"});audit("case.close",c.id,"Case Closed");persist();return clone(c);
}
function acknowledgeNotification(id){
 var n=db.notifications.find(function(x){return x.id===id});if(!n)return null;n.status="Acknowledged";n.ackAt=now();audit("notification.ack",n.id,"Acknowledged");persist();return clone(n);
}
function tick(advanceMs){
 var t=now()+(advanceMs||0),changes=[];
 db.actions.forEach(function(a){if(/Completed|Verified|Cancelled/.test(a.status))return;var dur=a.dueAt-a.createdAt,ratio=1-((a.dueAt-t)/dur);if(t>a.dueAt&&a.slaState!=="Overdue"){a.slaState="Overdue";changes.push(notify({caseId:a.caseId,purpose:"Escalate",priority:a.priority==="P1"?"P1":"P2",title:"SLA معوق: "+a.title,recipient:"مدیر بالاتر",reason:"ESC_SLA"}));audit("sla.overdue",a.id,"Action Overdue")}else if(ratio>=.8&&!/80%|Overdue/.test(a.slaState)){a.slaState="80%";changes.push(notify({caseId:a.caseId,purpose:"Act",priority:a.priority,title:a.title+" — ۸۰٪ SLA مصرف شد",recipient:a.owner,reason:"SLA 80%"}))}});
 db.decisions.forEach(function(d){if(d.status==="Decided")return;if(t>d.dueAt&&d.slaState!=="Overdue"){d.slaState="Overdue";changes.push(notify({caseId:d.caseId,purpose:"Escalate",priority:d.priority,title:"Decision SLA معوق: "+d.title,recipient:d.owner,reason:"ESC_SLA"}));audit("decision.sla.overdue",d.id,"Decision Overdue")}});
 db.approvals.forEach(function(a){if(/Approved|Rejected|Cancelled|Expired/.test(a.status))return;if(t>a.dueAt&&a.slaState!=="Overdue"){a.slaState="Overdue";changes.push(notify({caseId:a.caseId,purpose:"Escalate",priority:"P2",title:"Approval SLA معوق: "+a.title,recipient:a.approver,reason:"ESC_SLA"}));audit("approval.sla.overdue",a.id,"Approval Overdue")}});
 persist();return clone(changes);
}
function addDelegation(fromUserId,toUserId,hours){
 requirePerm("configure","delegation",{});
 var d={id:uid("DLG"),fromUserId:fromUserId,toUserId:toUserId,startAt:now(),endAt:now()+(hours||24)*3600000,active:true};db.delegations.push(d);audit("delegation.create",d.id,"Delegation created",{from:fromUserId,to:toUserId});persist();return clone(d);
}
function query(kind,filter){
 var arr=clone(db[kind]||[]),u=currentUser();return arr.filter(function(x){return can("read",kind,x,u)&&(typeof filter!=="function"||filter(x))});
}
function snapshot(){
 return {version:db.version,user:currentUser(),events:query("events").filter(function(x){return x.status==="Active"}).length,cases:query("cases").filter(function(x){return x.status!=="Closed"}).length,actions:query("actions").filter(function(x){return !/Completed|Verified|Cancelled/.test(x.status)}).length,decisions:query("decisions").filter(function(x){return x.status!=="Decided"}).length,approvals:query("approvals").filter(function(x){return !/Approved|Rejected|Cancelled|Expired/.test(x.status)}).length,notifications:query("notifications").filter(function(x){return !/Resolved|Expired|Suppressed/.test(x.status)}).length,risks:query("risks").filter(function(x){return x.status!=="Closed"}).length,links:db.links.length,audit:can("view_audit","audit",{})?db.audit.length:0};
}
function reset(){db=mkSeed();persist();return snapshot()}
function runReferenceScenario(){
 if(db.scenarioSeeded)return {already:true,snapshot:snapshot()};
 db.scenarioSeeded=true;
 var a=emitEvent({type:"Inventory.Stockout",module:"inventory",entityId:"ITEM-6205",severity:"S4",impact:"I4",urgency:"U5",context:"موجودی رولبرینگ حیاتی صفر است.",payload:{coverageDays:0,emergencyPurchaseAmount:780000000}});
 var b=emitEvent({type:"Maintenance.AssetFailed",module:"maintenance",entityId:"AST-ELV2",severity:"S4",impact:"I4",urgency:"U5",context:"الویتور خط ۲ متوقف شد.",payload:{downtimeMin:32}});
 var c=emitEvent({type:"Quality.BatchHold",module:"quality",entityId:"B-2405",severity:"S3",impact:"I3",context:"Batch منتظر تأیید آزمایشگاه است."});
 persist();return {inventory:a,maintenance:b,quality:c,snapshot:snapshot()};
}
function runAcceptanceSuite(){
 var original=clone(db),results=[];
 function test(name,fn){try{var ok=!!fn();results.push({name:name,ok:ok})}catch(e){results.push({name:name,ok:false,error:e.message})}}
 try{
  db=mkSeed();
  test("کمبود موجودی، تصمیم مدیرعامل ایجاد می‌کند",function(){var r=emitEvent({type:"Inventory.Stockout",module:"inventory",entityId:"ITEM-6205",severity:"S4",impact:"I4",urgency:"U5",payload:{coverageDays:0,emergencyPurchaseAmount:780000000}});return r.decision&&r.decision.owner==="مدیرعامل"});
  test("رویداد تکراری، پرونده تکراری نمی‌سازد",function(){var before=db.cases.length;emitEvent({type:"Inventory.Stockout",module:"inventory",entityId:"ITEM-6205",severity:"S4",impact:"I4",payload:{coverageDays:0,emergencyPurchaseAmount:780000000}});return db.cases.length===before});
  test("مدیرعامل مجاز به ثبت تصمیم است",function(){setSession("USR-CEO");var d=db.decisions[0];resolveDecision(d.id,"Approved",{test:true});return d.status==="Decided"&&Object.keys(db.master.entities).some(function(k){return /^PO-EM-/.test(k)})});
  test("کارشناس خرید مجاز به تصمیم مدیریتی نیست",function(){setSession("USR-PROC-EX");var d=createDecision({key:"test-decision",title:"تصمیم آزمایشی",owner:"مدیرعامل",requiredRole:"CEO",authority:"A5"});try{resolveDecision(d.id,"Approved");return false}catch(e){return e.message==="ACCESS_DENIED"}});
  test("تأیید فرایندی از تصمیم مدیریتی جدا می‌ماند",function(){setSession("USR-CEO");var ap=createApproval({key:"test-approval",title:"تأیید آزمایشی",module:"procurement",approver:"مدیر تدارکات",requiredRole:"Manager",amount:100000000});return db.approvals.length>0&&!db.decisions.some(function(x){return x.key==="test-approval"})});
  test("رخداد شدید ایمنی، اعلان فوری مدیرعامل ایجاد می‌کند",function(){var r=emitEvent({type:"HSE.Incident",module:"hse",entityId:"HSE-X",severity:"S5",impact:"I5",context:"رخداد شدید"});return db.notifications.some(function(n){return n.caseId===r.case.id&&n.priority==="P0"&&n.recipient==="مدیرعامل"})});
  test("عبور از مهلت انجام، ارجاع به سطح بالاتر ایجاد می‌کند",function(){tick(12*3600000);return db.notifications.some(function(n){return n.purpose==="Escalate"&&n.reason==="ESC_SLA"})});
  test("کارشناس خرید اطلاعات محرمانه سرمایه انسانی را نمی‌بیند",function(){setSession("USR-PROC-EX");return query("cases").every(function(c){return c.module!=="hr"||c.sensitivity!=="restricted"})});
  test("سوابق محرمانه کارکنان از کارشناس خرید پنهان است",function(){setSession("USR-PROC-EX");return queryBusinessRecords("hrPerformance").length===0});
  test("مدیر سرمایه انسانی می‌تواند رکورد واحد خود را ویرایش کند",function(){setSession("USR-HR");var r=upsertBusinessRecord("hrPerformance",{id:"PERF-TEST",employeeId:"EMP-41",name:"حسین مرادی",period:"TEST",kpi:"آزمون",target:90,actual:91,score:91});return r.id==="PERF-TEST"&&queryBusinessRecords("hrPerformance").some(function(x){return x.id==="PERF-TEST"})});
  test("تغییر موجودی، رویداد کمبود و تصمیم لازم را خودکار می‌سازد",function(){setSession("USR-CEO");var r=upsertBusinessRecord("inventoryStock",{id:"STK-TEST",module:"inventory",itemId:"ITEM-6205",name:"رولبرینگ SKF 6205",available:0,safety:8,coverageDays:0,etaDays:5,critical:true,emergencyPurchaseAmount:780000000});return r._derivedEvents.length>0&&db.events.some(function(e){return e.type==="Inventory.Stockout"&&e.entityId==="ITEM-6205"})&&db.decisions.some(function(d){return d.key==="inventory:ITEM-6205:emergency-buy"})});
  test("افت تولید، رویداد عدم تحقق برنامه را خودکار می‌سازد",function(){var r=upsertBusinessRecord("productionShift",{id:"SHIFT-TEST",module:"production",entityId:"SHIFT-TEST",plan:100,actual:80,downtimeMin:5});return r._derivedEvents.length>0&&db.events.some(function(e){return e.type==="Production.TargetMissed"&&e.entityId==="SHIFT-TEST"})});
  test("بازگشت موجودی به حالت عادی، رخداد کمبود را رفع می‌کند",function(){upsertBusinessRecord("inventoryStock",{id:"STK-TEST",module:"inventory",itemId:"ITEM-6205",name:"رولبرینگ SKF 6205",available:20,safety:8,coverageDays:20,etaDays:5,critical:true});return !db.events.some(function(e){return e.status==="Active"&&e.type==="Inventory.Stockout"&&e.entityId==="ITEM-6205"})});
  test("دستور کار تعمیراتی با اثر توقف به تولید مرتبط می‌شود",function(){var r=upsertBusinessRecord("maintenanceWO",{id:"WO-AUTO",module:"maintenance",assetId:"AST-ELV2",status:"Emergency",downtimeMin:45,productionImpact:true,critical:true,partIds:["ITEM-6205"]});return r._derivedEvents.length>0&&db.events.some(function(e){return e.type==="Maintenance.AssetFailed"&&e.entityId==="AST-ELV2"})&&db.events.some(function(e){return e.type==="Production.DowntimeExceeded"&&e.rootEventId})});
  test("توقف بچ، پرونده کیفیت و اثر بارگیری ایجاد می‌کند",function(){var r=upsertBusinessRecord("qualityBatch",{id:"B-AUTO",module:"quality",batchId:"B-2405",status:"Hold",shipmentBlocked:true,shipmentIds:["ORD-91"]});return r._derivedEvents.length>0&&db.cases.some(function(x){return x.key==="quality:B-2405"})&&db.events.some(function(e){return e.type==="Sales.ShipmentBlocked"&&e.entityId==="ORD-91"})});
  test("کسری جریان نقد، پرونده مدیریتی مالی می‌سازد",function(){var r=upsertBusinessRecord("financeCash",{id:"CASH-AUTO",module:"finance",department:"Finance",sensitivity:"confidential",netGap:-2000000000,status:"At Risk"});return r._derivedEvents.length>0&&db.events.some(function(e){return e.type==="Finance.CashRisk"&&e.entityId==="CASH-AUTO"})&&db.cases.some(function(x){return x.module==="finance"})});
  test("رخداد مهم ایمنی وارد مسیر واکنش فوری می‌شود",function(){var r=upsertBusinessRecord("hseIncident",{id:"HSE-AUTO",module:"hse",department:"HSE",sensitivity:"restricted",title:"حادثه مهم تست",severity:"Critical",status:"Reported"});return r._derivedEvents.length>0&&db.notifications.some(function(n){return n.priority==="P0"&&n.recipient==="مدیرعامل"})});
  test("تأخیر نقطه عطف بحرانی، برنامه جبرانی می‌سازد",function(){var r=upsertBusinessRecord("projectMilestone",{id:"MS-AUTO",module:"projects",department:"Projects",project:"پروژه تست",criticalPath:true,delayDays:8,status:"Delayed"});return r._derivedEvents.length>0&&db.cases.some(function(x){return x.module==="projects"&&x.status!=="Closed"})});
  test("دسترسی غیرمجاز، مورد غیرعادی فعال ایجاد می‌کند",function(){var r=upsertBusinessRecord("securityAccess",{id:"SEC-AUTO",module:"security",department:"Security",sensitivity:"restricted",person:"X",area:"سیلو",authorized:false,status:"Denied"});return r._derivedEvents.length>0&&db.events.some(function(e){return e.type==="Security.UnauthorizedAccess"&&e.entityId==="SEC-AUTO"})});
  test("نزدیک شدن سررسید مالیاتی، اقدام مسئول ایجاد می‌کند",function(){var r=upsertBusinessRecord("taxObligation",{id:"TAX-AUTO",module:"tax",department:"Finance",sensitivity:"confidential",type:"VAT",daysToDue:2,status:"Open"});return r._derivedEvents.length>0&&db.actions.some(function(a){return a.module==="tax"&&!/Completed|Verified/.test(a.status)})});
  test("توقف کنترل دفتر کل، پرونده مدیریتی ایجاد می‌کند",function(){var r=upsertBusinessRecord("ledgerControl",{id:"GL-AUTO",module:"ledger",department:"Finance",sensitivity:"confidential",name:"تطبیق بانک",status:"Blocked",critical:true});return r._derivedEvents.length>0&&db.cases.some(function(x){return x.module==="ledger"&&x.status!=="Closed"})});
  test("سند حیاتی منقضی، پرونده و اقدام ایجاد می‌کند",function(){var r=upsertBusinessRecord("documentControl",{id:"DOC-AUTO",module:"documents",department:"Executive",name:"سیاست آزمایشی",type:"Policy",owner:"مدیریت",status:"Expired",critical:true});return r._derivedEvents.length>0&&db.actions.some(function(a){return a.module==="documents"})});
  test("انحراف شاخص واحد، اقدام اصلاحی خودکار ایجاد می‌کند",function(){var r=upsertBusinessRecord("departmentKpi",{id:"KPI-AUTO",module:"department",department:"Operations",name:"تحقق برنامه",sourceModule:"production",actual:80,target:100,owner:"مدیر تولید"});return r._derivedEvents.length>0&&db.actions.some(function(a){return a.module==="production"&&/Department.KPIOffTarget/.test(a.title)});});
  test("درخواست قطعه موجود، بدون خرید از انبار خارج می‌شود",function(){db.master.entities["ITEM-OK"]={id:"ITEM-OK",type:"item",name:"قطعه موجود",module:"inventory",stock:20,available:20,safety:5};var r=requestPart({id:"REQ-IN-STOCK",itemId:"ITEM-OK",qty:4,workOrderId:"WO-531"});return r.request.issuedQty===4&&entity("ITEM-OK").stock===16&&!r.purchaseRequest&&db.records.inventoryMovements.some(function(x){return x.requestId==="REQ-IN-STOCK"})});
  test("رسیدن موجودی به حد سفارش، پس از خروج کالا درخواست خرید می‌سازد",function(){var r=requestPart({id:"REQ-REORDER",itemId:"ITEM-OK",qty:12,estimatedAmount:120000000});return r.request.issuedQty===12&&entity("ITEM-OK").stock===4&&r.purchaseRequest&&r.purchaseRequest.reason==="رسیدن موجودی به حد سفارش"});
  test("کسری موجودی درخواست خرید می‌سازد و سفارش تکراری را می‌بندد",function(){db.master.entities["ITEM-SHORT"]={id:"ITEM-SHORT",type:"item",name:"قطعه کسری",module:"inventory",stock:2,available:2,safety:4,critical:false};var r=requestPart({id:"REQ-SHORT",itemId:"ITEM-SHORT",qty:6,estimatedAmount:100000000});var o=progressPurchase(r.purchaseRequest.id,"order",{poId:"PO-FLOW",vendor:"تأمین‌کننده آزمون",value:90000000,etaDays:3});var blocked=false;try{progressPurchase(r.purchaseRequest.id,"order",{poId:"PO-DUP"})}catch(e){blocked=e.message==="PURCHASE_ALREADY_ORDERED"}return r.request.issuedQty===2&&r.purchaseRequest.qty>=4&&o.order.id==="PO-FLOW"&&blocked});
  test("تحویل سفارش، موجودی و تعهد مالی را به‌روز می‌کند",function(){var pr=db.records.purchaseRequests.find(function(x){return x.requestId==="REQ-SHORT"}),before=entity("ITEM-SHORT").stock,r=progressPurchase(pr.id,"receive",{qty:pr.qty});return entity("ITEM-SHORT").stock===before+pr.qty&&r.receipt.status==="Accepted"&&r.financialCommitment.status==="Recorded"&&entity("PO-FLOW").status==="Delivered"});
  test("درخواست قطعه نامعتبر بدون تغییر داده متوقف می‌شود",function(){try{requestPart({id:"REQ-BAD",itemId:"ITEM-OK",qty:-1});return false}catch(e){return e.message==="INVALID_QUANTITY"&&!db.records.partRequests.some(function(x){return x.id==="REQ-BAD"})}});
  test("سفارش خرید باز از ایجاد درخواست خرید غیرضروری جلوگیری می‌کند",function(){entity("ITEM-6205").stock=0;entity("ITEM-6205").available=0;var before=db.records.purchaseRequests.length,r=requestPart({id:"REQ-EXISTING",itemId:"ITEM-6205",qty:1,estimatedAmount:300000000});return db.records.purchaseRequests.length===before&&!r.purchaseRequest&&!!r.request.existingResponseId});

 }finally{
  var pass=results.filter(function(x){return x.ok}).length;
  db=original;db.acceptance=results;db.session.userId="USR-CEO";audit("acceptance.run","KERNEL","Acceptance Suite: "+pass+"/"+results.length,{results:results});persist();
 }
 return clone(results);
}
function getStore(){return clone(db)}
window.ManagementKernel={
 version:2,emitEvent:emitEvent,queryBusinessRecords:queryBusinessRecords,upsertBusinessRecord:upsertBusinessRecord,removeBusinessRecord:removeBusinessRecord,requestPart:requestPart,progressPurchase:progressPurchase,createManualAction:createManualAction,resolveDecision:resolveDecision,transitionApproval:transitionApproval,completeAction:completeAction,verifyCase:verifyCase,closeCase:closeCase,acknowledge:acknowledgeNotification,tick:tick,snapshot:snapshot,getStore:getStore,reset:reset,runReferenceScenario:runReferenceScenario,runAcceptanceSuite:runAcceptanceSuite,setSession:setSession,currentUser:function(){return clone(currentUser())},can:can,query:query,upsertEntity:upsertEntity,addDelegation:addDelegation,findLinks:findLinks,link:link
};
audit("kernel.boot","KERNEL","Management Kernel v2 initialized",{version:2});persist();
})();
