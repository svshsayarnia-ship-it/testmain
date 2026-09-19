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
    "POS-14":{id:"POS-14",type:"position",name:"مدیر شیفت تولید",module:"hr",critical:true,readyNow:0,sensitivity:"restricted"}
   }
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
function ruleGeneric(ev,input,ctx){if(sevRank(ev.severity)>=4){var c=createCase({key:"generic:"+ev.dedupeKey,title:ev.context||ev.type,module:ev.module,severity:ev.severity,impact:ev.impact,owner:"مدیر واحد",eventId:ev.id});var a=createAction({key:"generic-action:"+c.key,caseId:c.id,title:"اقدام اصلاحی برای "+ev.type,module:ev.module,owner:"مدیر واحد",expectedResult:"Exception Resolved",priority:"P2"});return {event:ev,case:c,action:a,output:"Case + Action"}}var a2=createAction({key:"event-action:"+ev.dedupeKey,title:"بررسی "+ev.type,module:ev.module,owner:"مسئول واحد",expectedResult:"Review Result",priority:"P3"});return {event:ev,action:a2,output:"Action"}}
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
  test("Stockout creates CEO decision",function(){var r=emitEvent({type:"Inventory.Stockout",module:"inventory",entityId:"ITEM-6205",severity:"S4",impact:"I4",urgency:"U5",payload:{coverageDays:0,emergencyPurchaseAmount:780000000}});return r.decision&&r.decision.owner==="مدیرعامل"});
  test("Duplicate event does not duplicate case",function(){var before=db.cases.length;emitEvent({type:"Inventory.Stockout",module:"inventory",entityId:"ITEM-6205",severity:"S4",impact:"I4",payload:{coverageDays:0,emergencyPurchaseAmount:780000000}});return db.cases.length===before});
  test("CEO can decide",function(){setSession("USR-CEO");var d=db.decisions[0];resolveDecision(d.id,"Approved",{test:true});return d.status==="Decided"&&Object.keys(db.master.entities).some(function(k){return /^PO-EM-/.test(k)})});
  test("Expert cannot decide",function(){setSession("USR-PROC-EX");var d=createDecision({key:"test-decision",title:"Test Decision",owner:"مدیرعامل",requiredRole:"CEO",authority:"A5"});try{resolveDecision(d.id,"Approved");return false}catch(e){return e.message==="ACCESS_DENIED"}});
  test("Approval stays separate from Decision",function(){setSession("USR-CEO");var ap=createApproval({key:"test-approval",title:"Test Approval",module:"procurement",approver:"مدیر تدارکات",requiredRole:"Manager",amount:100000000});return db.approvals.length>0&&!db.decisions.some(function(x){return x.key==="test-approval"})});
  test("HSE severe creates P0 CEO notification",function(){var r=emitEvent({type:"HSE.Incident",module:"hse",entityId:"HSE-X",severity:"S5",impact:"I5",context:"Severe"});return db.notifications.some(function(n){return n.caseId===r.case.id&&n.priority==="P0"&&n.recipient==="مدیرعامل"})});
  test("SLA creates escalation",function(){tick(12*3600000);return db.notifications.some(function(n){return n.purpose==="Escalate"&&n.reason==="ESC_SLA"})});
  test("Restricted HR hidden from procurement expert",function(){setSession("USR-PROC-EX");return query("cases").every(function(c){return c.module!=="hr"||c.sensitivity!=="restricted"})});
 }finally{
  var pass=results.filter(function(x){return x.ok}).length;
  db=original;db.acceptance=results;db.session.userId="USR-CEO";audit("acceptance.run","KERNEL","Acceptance Suite: "+pass+"/"+results.length,{results:results});persist();
 }
 return clone(results);
}
function getStore(){return clone(db)}
window.ManagementKernel={
 version:2,emitEvent:emitEvent,resolveDecision:resolveDecision,transitionApproval:transitionApproval,completeAction:completeAction,verifyCase:verifyCase,closeCase:closeCase,acknowledge:acknowledgeNotification,tick:tick,snapshot:snapshot,getStore:getStore,reset:reset,runReferenceScenario:runReferenceScenario,runAcceptanceSuite:runAcceptanceSuite,setSession:setSession,currentUser:function(){return clone(currentUser())},can:can,query:query,upsertEntity:upsertEntity,addDelegation:addDelegation,findLinks:findLinks,link:link
};
audit("kernel.boot","KERNEL","Management Kernel v2 initialized",{version:2});persist();
})();