(function(){
"use strict";
var KEY="ard_management_kernel_v1";
function now(){return Date.now()}
function id(p){return p+"-"+Math.floor(Math.random()*900000+100000)}
function clone(x){return JSON.parse(JSON.stringify(x))}
function seed(){
 return {
  version:1,
  thresholds:{ceoPurchase:500000000,criticalDowntimeMin:30,actionSlaMs:6*60*60*1000},
  entities:{
   "ITEM-6205":{id:"ITEM-6205",type:"item",name:"رولبرینگ SKF 6205",critical:true,stock:0,safety:8,coverageDays:0},
   "PO-881":{id:"PO-881",type:"po",itemId:"ITEM-6205",vendor:"تأمین‌گستر A",etaDays:5,value:690000000,status:"Open"},
   "AST-ELV2":{id:"AST-ELV2",type:"asset",name:"الویتور خط ۲",critical:true,partIds:["ITEM-6205"],status:"At Risk"},
   "WO-529":{id:"WO-529",type:"work_order",assetId:"AST-ELV2",partIds:["ITEM-6205"],status:"Monitoring",productionImpact:true},
   "PROD-SHIFT-829":{id:"PROD-SHIFT-829",type:"production_shift",plan:150,actual:125,downtimeMin:32,status:"Completed"},
   "B-2405":{id:"B-2405",type:"batch",status:"Hold",shipmentIds:["ORD-91"]},
   "ORD-91":{id:"ORD-91",type:"sales_order",status:"Blocked",batchId:"B-2405"},
   "POS-14":{id:"POS-14",type:"position",title:"مدیر شیفت تولید",critical:true,readyNow:0}
  },
  events:[],cases:[],actions:[],decisions:[],notifications:[],risks:[],links:[],audit:[],
  seq:{case:300,action:1000,decision:200,notification:100},
  scenarioSeeded:false
 };
}
var store;
try{store=JSON.parse(localStorage.getItem(KEY)||"null")||seed()}catch(e){store=seed()}
function persist(){localStorage.setItem(KEY,JSON.stringify(store));window.dispatchEvent(new CustomEvent("management-kernel:update",{detail:snapshot()}))}
function audit(kind,entityId,message,meta){store.audit.unshift({id:id("AUD"),at:now(),kind:kind,entityId:entityId||null,message:message,meta:meta||{}});store.audit=store.audit.slice(0,250)}
function next(kind){store.seq[kind]=(store.seq[kind]||0)+1;var p={case:"CASE",action:"ACT",decision:"DEC",notification:"NTF"}[kind]||kind.toUpperCase();return p+"-"+store.seq[kind]}
function activeCaseByKey(key){return store.cases.find(function(x){return x.key===key&&x.status!=="Closed"})}
function activeDecisionByKey(key){return store.decisions.find(function(x){return x.key===key&&!/Decided|Cancelled|Closed/.test(x.status)})}
function actionByKey(key){return store.actions.find(function(x){return x.key===key&&!/Completed|Cancelled/.test(x.status)})}
function notify(caseId,purpose,priority,title,recipient,reason){
 var key=(caseId||"none")+"|"+purpose+"|"+recipient;
 var existing=store.notifications.find(function(n){return n.groupKey===key&&n.status!=="Resolved"});
 if(existing){existing.title=title;existing.priority=priority;existing.updatedAt=now();audit("notification.update",existing.id,"اعلان موجود بروزرسانی شد",{reason:reason});return existing}
 var n={id:next("notification"),caseId:caseId||null,purpose:purpose,priority:priority,title:title,recipient:recipient,status:"Created",groupKey:key,createdAt:now(),updatedAt:now(),reason:reason||""};
 store.notifications.push(n);audit("notification.create",n.id,title,{purpose:purpose,priority:priority,recipient:recipient});return n
}
function makeCase(key,title,module,severity,impact,owner,accountable,rootEventId){
 var c=activeCaseByKey(key);
 if(c){c.severity=severityRank(severity)>severityRank(c.severity)?severity:c.severity;c.updatedAt=now();if(rootEventId&&c.eventIds.indexOf(rootEventId)<0)c.eventIds.push(rootEventId);audit("case.update",c.id,"Case موجود با Context جدید بروزرسانی شد");return c}
 c={id:next("case"),key:key,title:title,module:module,severity:severity,impact:impact,priority:severity==="Critical"?"P1":severity==="High"?"P2":"P3",owner:owner,accountable:accountable||owner,status:"Qualified",eventIds:rootEventId?[rootEventId]:[],actionIds:[],decisionIds:[],riskIds:[],blockers:[],createdAt:now(),updatedAt:now(),timeline:[{at:now(),text:"Management Case ایجاد شد"}]};
 store.cases.push(c);audit("case.create",c.id,title,{key:key,module:module});return c
}
function makeAction(key,caseId,title,module,owner,dueMs,expected,priority){
 var a=actionByKey(key);if(a)return a;
 a={id:next("action"),key:key,caseId:caseId||null,title:title,module:module,owner:owner,status:"Assigned",createdAt:now(),dueAt:now()+(dueMs||store.thresholds.actionSlaMs),expectedResult:expected||"",priority:priority||"P3",acknowledged:false,verified:false};
 store.actions.push(a);var c=store.cases.find(function(x){return x.id===caseId});if(c&&c.actionIds.indexOf(a.id)<0)c.actionIds.push(a.id);audit("action.create",a.id,title,{caseId:caseId,owner:owner});return a
}
function makeDecision(key,caseId,title,owner,authority,reason,options,recommendation,priority){
 var d=activeDecisionByKey(key);if(d)return d;
 d={id:key==="inventory:ITEM-6205:emergency-buy"?"DEC-142":next("decision"),key:key,caseId:caseId,title:title,owner:owner,authority:authority,status:"Waiting for Decision",reason:reason,options:options||[],recommendation:recommendation||"",priority:priority||"P2",createdAt:now(),decidedAt:null,outcome:null};
 store.decisions.push(d);var c=store.cases.find(function(x){return x.id===caseId});if(c&&c.decisionIds.indexOf(d.id)<0)c.decisionIds.push(d.id);audit("decision.create",d.id,title,{owner:owner,authority:authority});return d
}
function makeRisk(key,caseId,title,probability,impact,owner,residual){
 var r=store.risks.find(function(x){return x.key===key&&x.status!=="Closed"});if(r)return r;
 r={id:id("RSK"),key:key,caseId:caseId,title:title,probability:probability,impact:impact,level:riskLevel(probability,impact),owner:owner,residual:residual||"High",status:"Open",createdAt:now()};store.risks.push(r);var c=store.cases.find(function(x){return x.id===caseId});if(c)c.riskIds.push(r.id);audit("risk.create",r.id,title);return r
}
function link(from,to,type,root){if(!store.links.some(function(x){return x.from===from&&x.to===to&&x.type===type})){store.links.push({id:id("LNK"),from:from,to:to,type:type,root:!!root,createdAt:now()});audit("link.create",from+"→"+to,type)}}
function severityRank(s){return {Normal:0,Low:1,Medium:2,High:3,Critical:4,Emergency:5,S0:0,S1:1,S2:2,S3:3,S4:4,S5:5}[s]||0}
function riskLevel(p,i){var n=(+String(p).replace(/\D/g,"")||3)*(+String(i).replace(/\D/g,"")||3);return n>=16?"Critical":n>=9?"High":n>=4?"Medium":"Low"}
function normalizeSeverity(s){return {S0:"Normal",S1:"Low",S2:"Medium",S3:"High",S4:"Critical",S5:"Emergency"}[s]||s||"Medium"}
function moduleOwner(m){return {inventory:"مدیر انبار",procurement:"مدیر تدارکات",maintenance:"مدیر فنی",production:"مدیر تولید",quality:"مدیر کیفیت",finance:"مدیر مالی",hse:"مدیر HSE",security:"مدیر حراست",projects:"مدیر پروژه",hr:"مدیر منابع انسانی",wheat:"مدیر سیلو",sales:"مدیر فروش"}[m]||"مدیر واحد"}
function entity(x){return store.entities[x]||null}
function findOpenPO(itemId){return Object.keys(store.entities).map(function(k){return store.entities[k]}).filter(function(x){return x.type==="po"&&x.itemId===itemId&&x.status!=="Closed"}).sort(function(a,b){return a.etaDays-b.etaDays})[0]||null}
function affectedWorkOrders(itemId){return Object.keys(store.entities).map(function(k){return store.entities[k]}).filter(function(x){return x.type==="work_order"&&x.partIds&&x.partIds.indexOf(itemId)>=0})}
function emitEvent(input){
 input=input||{};var type=input.type||"Custom.Event",entityId=input.entityId||null,module=input.module||String(type).split(".")[0].toLowerCase(),severity=normalizeSeverity(input.severity),impact=input.impact||"I2";
 var dedupeKey=input.dedupeKey||type+"|"+(entityId||input.context||"generic");
 var existing=store.events.find(function(e){return e.dedupeKey===dedupeKey&&e.status==="Active"});
 if(existing){existing.occurrences=(existing.occurrences||1)+1;existing.updatedAt=now();existing.context=input.context||existing.context;audit("event.dedupe",existing.id,"رویداد تکراری به Event فعال متصل شد",{occurrences:existing.occurrences});var rr=evaluate(existing,input);persist();return rr}
 var ev={id:id("EVT"),type:type,module:module,entityId:entityId,severity:severity,impact:impact,urgency:input.urgency||"U3",context:input.context||"",payload:input.payload||{},dedupeKey:dedupeKey,status:"Active",occurrences:1,createdAt:now(),updatedAt:now(),rootEventId:input.rootEventId||null};
 store.events.push(ev);audit("event.create",ev.id,type,{entityId:entityId,module:module,severity:severity,impact:impact});var r=evaluate(ev,input);persist();return r
}
function evaluate(ev,input){
 var t=ev.type;
 if(/Inventory\.(Stockout|LowStock)/i.test(t))return inventoryRule(ev,input);
 if(/Maintenance\.AssetFailed/i.test(t))return maintenanceRule(ev,input);
 if(/Production\.(TargetMissed|DowntimeExceeded)/i.test(t))return productionRule(ev,input);
 if(/Quality\.BatchHold/i.test(t))return qualityRule(ev,input);
 if(/HSE\.(IncidentSevere|Incident)/i.test(t)&&severityRank(ev.severity)>=4)return hseRule(ev,input);
 if(/HR\.KeyPositionRisk/i.test(t))return hrRule(ev,input);
 if(/Project\.MilestoneDelayed/i.test(t))return projectRule(ev,input);
 if(/Finance\.CashRisk/i.test(t))return financeRule(ev,input);
 return genericRule(ev,input)
}
function inventoryRule(ev,input){
 var item=entity(ev.entityId)||{id:ev.entityId||"UNKNOWN",critical:severityRank(ev.severity)>=4,coverageDays:+(input.payload&&input.payload.coverageDays||0),stock:+(input.payload&&input.payload.stock||0)};
 var po=findOpenPO(item.id),coverage=item.coverageDays==null?0:+item.coverageDays,eta=po?+po.etaDays:999,insufficient=!po||eta>coverage;
 var c=makeCase("supply:"+item.id,"ریسک تأمین "+(item.name||item.id),"inventory",item.critical?"Critical":"High","I4","مدیر تدارکات","معاون عملیات",ev.id);
 c.timeline.push({at:now(),text:"Existing Response بررسی شد: "+(po?po.id+" / ETA "+eta+" روز":"PO فعال وجود ندارد")});
 var r=makeRisk("supply-risk:"+item.id,c.id,"ریسک توقف ناشی از کمبود "+(item.name||item.id),"P4","I4","مدیر تدارکات","High");
 link(ev.id,c.id,"creates-case",true);link(item.id,c.id,"subject",true);if(po)link(po.id,c.id,"existing-response",false);
 var a=makeAction("procure:"+item.id,c.id,"تأمین فوری "+(item.name||item.id),"procurement","مدیر تدارکات",4*60*60*1000,"پوشش تأمین >= زمان مصرف","P1");
 link(c.id,a.id,"requires-action",false);
 affectedWorkOrders(item.id).forEach(function(wo){link(item.id,wo.id,"blocks-work-order",true);link(wo.id,c.id,"operational-impact",false);if(wo.productionImpact){var pe=emitImpact("Production.MaterialRisk","production",wo.id,"High","I4","کمبود "+item.id+" می‌تواند تولید را متوقف کند",ev.id);link(ev.id,pe.id,"root-impact",true)}});
 if(insufficient){
   c.blockers=["Existing supply response insufficient"];c.status="Actioning";
   var amount=+(input.payload&&input.payload.emergencyPurchaseAmount||780000000);
   if(amount>store.thresholds.ceoPurchase){
    var d=makeDecision("inventory:"+item.id+":emergency-buy",c.id,"خرید اضطراری "+(item.name||item.id),"مدیرعامل","A5","Coverage ("+coverage+" روز) کمتر از ETA ("+eta+" روز) است و پاسخ موجود کافی نیست.",[
      {label:"تأمین عادی",cost:po?po.value:null,risk:"ETA "+eta+" روز"},
      {label:"خرید اضطراری",cost:amount,risk:"هزینه بالاتر / کاهش ریسک توقف"}
    ],"خرید اضطراری مشروط به تحویل حداکثر ۴۸ ساعت","P1");
    c.blockers.push(d.id);link(c.id,d.id,"needs-decision",false);notify(c.id,"Decide","P1",d.title,"مدیرعامل","Authority Gap A5");
    return {event:ev,case:c,action:a,decision:d,risk:r,output:"Case + Action + CEO Decision"}
   }
 }
 notify(c.id,"Act","P2",a.title,"مدیر تدارکات","Supply risk");return {event:ev,case:c,action:a,risk:r,output:"Case + Action"}
}
function emitImpact(type,module,entityId,severity,impact,context,rootEventId){
 var dk=type+"|"+entityId+"|"+rootEventId;var ex=store.events.find(function(e){return e.dedupeKey===dk&&e.status==="Active"});if(ex)return ex;
 var e={id:id("EVT"),type:type,module:module,entityId:entityId,severity:severity,impact:impact,urgency:"U4",context:context,payload:{},dedupeKey:dk,status:"Active",occurrences:1,createdAt:now(),updatedAt:now(),rootEventId:rootEventId};store.events.push(e);audit("event.impact",e.id,type,{rootEventId:rootEventId});return e
}
function maintenanceRule(ev,input){
 var asset=entity(ev.entityId)||{id:ev.entityId||"ASSET",critical:true,name:ev.entityId||"تجهیز"};
 var downtime=+(input.payload&&input.payload.downtimeMin||32),sev=(asset.critical&&downtime>=store.thresholds.criticalDowntimeMin)?"Critical":"High";
 var c=makeCase("maintenance:"+asset.id,"خرابی "+(asset.name||asset.id),"maintenance",sev,"I4","مدیر فنی","مدیر تولید",ev.id);
 var a=makeAction("rca:"+asset.id,c.id,"تکمیل RCA خرابی "+(asset.name||asset.id),"maintenance","مدیر فنی",6*60*60*1000,"علت ریشه‌ای و اقدام پیشگیرانه تأیید شود","P2");
 link(ev.id,c.id,"creates-case",true);link(c.id,a.id,"requires-action",false);
 if(downtime>0){var pe=emitImpact("Production.DowntimeExceeded","production",asset.id,"High","I4",downtime+" دقیقه توقف تولید",ev.id);link(ev.id,pe.id,"root-impact",true)}
 if(sev==="Critical")notify(c.id,"Know","P1","توقف تجهیز بحرانی: "+(asset.name||asset.id),"مدیرعامل","Critical production impact");
 notify(c.id,"Act","P2",a.title,"مدیر فنی","RCA required");return {event:ev,case:c,action:a,output:"Case + RCA + Executive Awareness"}
}
function productionRule(ev,input){
 var c=makeCase("production:"+String(ev.entityId||ev.dedupeKey),"انحراف تولید","production",ev.severity,"I3","مدیر تولید","معاون عملیات",ev.id);
 var a=makeAction("production-corrective:"+c.key,c.id,"تحلیل علت و برنامه جبرانی تولید","production","مدیر تولید",4*60*60*1000,"برنامه جبرانی و علت ثبت شود","P2");
 link(ev.id,c.id,"creates-case",!ev.rootEventId);if(ev.rootEventId)link(ev.rootEventId,ev.id,"root-impact",true);return {event:ev,case:c,action:a,output:"Case + Corrective Action"}
}
function qualityRule(ev,input){
 var batch=entity(ev.entityId)||{id:ev.entityId||"BATCH",shipmentIds:[]};
 var c=makeCase("quality:"+batch.id,"Batch Hold "+batch.id,"quality","High","I3","مدیر کیفیت","مدیر تولید",ev.id);
 var a=makeAction("quality-release:"+batch.id,c.id,"تکمیل آزمون و تعیین تکلیف "+batch.id,"quality","مدیر آزمایشگاه",3*60*60*1000,"Release یا Reject مستند","P2");
 (batch.shipmentIds||[]).forEach(function(o){link(batch.id,o,"blocks-shipment",true);emitImpact("Sales.ShipmentBlocked","sales",o,"High","I3","بارگیری وابسته به "+batch.id,ev.id)});
 notify(c.id,"Act","P2",a.title,"مدیر آزمایشگاه","Shipment dependency");return {event:ev,case:c,action:a,output:"Case + Quality Action"}
}
function hseRule(ev,input){
 var c=makeCase("hse:"+String(ev.entityId||ev.id),"رخداد HSE شدید","hse","Emergency","I5","مدیر HSE","مدیر سایت",ev.id);
 var a=makeAction("hse-contain:"+c.key,c.id,"ایمن‌سازی فوری و کنترل رخداد","hse","مدیر HSE",60*60*1000,"ریسک فوری کنترل و محدوده ایمن شود","P0");
 notify(c.id,"Escalate","P0","رخداد HSE اضطراری","مدیرعامل","Safety severe override");notify(c.id,"Act","P0",a.title,"مدیر HSE","Emergency response");return {event:ev,case:c,action:a,output:"Emergency Case + P0 Escalation"}
}
function hrRule(ev,input){
 var pos=entity(ev.entityId)||{id:ev.entityId||"POS",title:"پست کلیدی",readyNow:0};
 var c=makeCase("succession:"+pos.id,"ریسک جانشینی "+(pos.title||pos.id),"hr","High","I3","مدیر منابع انسانی","معاون عملیات",ev.id);
 var a=makeAction("succession-plan:"+pos.id,c.id,"برنامه توسعه جانشین برای "+(pos.title||pos.id),"hr","مدیر منابع انسانی",7*24*60*60*1000,"Readiness و Development Plan ثبت شود","P2");
 if((pos.readyNow||0)===0){var d=makeDecision("succession:"+pos.id+":decision",c.id,"تعیین رویکرد جانشینی "+(pos.title||pos.id),"معاون عملیات","A4","هیچ جانشین Ready Now وجود ندارد.",[{label:"انتصاب موقت"},{label:"برنامه توسعه"},{label:"جذب بیرونی"}],"انتصاب موقت + برنامه توسعه","P2");link(c.id,d.id,"needs-decision",false);notify(c.id,"Decide","P2",d.title,"معاون عملیات","Succession authority");return {event:ev,case:c,action:a,decision:d,output:"HR Case + Executive Decision"}}
 return {event:ev,case:c,action:a,output:"HR Case + Action"}
}
function projectRule(ev,input){var c=makeCase("project:"+String(ev.entityId||ev.id),"تأخیر Milestone بحرانی","projects","High","I3","مدیر پروژه","Sponsor",ev.id);var a=makeAction("project-recovery:"+c.key,c.id,"Recovery Plan برای Milestone","projects","مدیر پروژه",8*60*60*1000,"برنامه بازیابی زمان و هزینه","P2");notify(c.id,"Act","P2",a.title,"مدیر پروژه","Critical path delay");return {event:ev,case:c,action:a,output:"Project Case + Recovery Action"}}
function financeRule(ev,input){var c=makeCase("finance:"+String(ev.entityId||ev.id),"ریسک نقدینگی","finance","High","I4","مدیر مالی","مدیرعامل",ev.id);var a=makeAction("cash-plan:"+c.key,c.id,"سناریوی اصلاح Cash Forecast","finance","مدیر مالی",4*60*60*1000,"Gap و گزینه‌های تأمین نقدینگی","P2");notify(c.id,"Know","P2","ریسک نقدینگی نیازمند پایش","مدیرعامل","Major financial exposure");return {event:ev,case:c,action:a,output:"Finance Case + Executive Awareness"}}
function genericRule(ev,input){
 var sev=severityRank(ev.severity);if(sev>=4){var c=makeCase("generic:"+ev.dedupeKey,ev.context||ev.type,ev.module,ev.severity,ev.impact,moduleOwner(ev.module),moduleOwner(ev.module),ev.id);var a=makeAction("generic-action:"+c.key,c.id,"اقدام اصلاحی برای "+ev.type,ev.module,moduleOwner(ev.module),store.thresholds.actionSlaMs,"رفع Exception و Verification","P2");return {event:ev,case:c,action:a,output:"Case + Action"}}
 var a=makeAction("event-action:"+ev.dedupeKey,null,"بررسی "+ev.type,ev.module,moduleOwner(ev.module),store.thresholds.actionSlaMs,"نتیجه بررسی ثبت شود","P3");return {event:ev,action:a,output:"Action"}
}
function resolveDecision(decisionId,outcome,meta){
 var d=store.decisions.find(function(x){return x.id===decisionId});if(!d)return null;d.status="Decided";d.outcome=outcome;d.decidedAt=now();d.meta=meta||{};audit("decision.decide",d.id,"تصمیم ثبت شد: "+outcome,meta);
 var c=store.cases.find(function(x){return x.id===d.caseId});if(c){c.timeline.push({at:now(),text:"تصمیم "+d.id+" ثبت شد: "+outcome});c.blockers=(c.blockers||[]).filter(function(b){return b!==d.id})}
 if(d.key&&/inventory:.*:emergency-buy/.test(d.key)&&/approve|conditional|تصمیم ثبت شد|Approved/i.test(outcome)){
  var itemId=d.key.split(":")[1],poId="PO-EM-"+Math.floor(Math.random()*900+100);store.entities[poId]={id:poId,type:"po",itemId:itemId,vendor:"تأمین‌کننده اضطراری B",etaDays:2,value:780000000,status:"Ordered",sourceDecisionId:d.id};
  var pa=makeAction("emergency-po:"+itemId,d.caseId,"صدور و پیگیری PO اضطراری "+itemId,"procurement","مدیر تدارکات",2*60*60*1000,"PO صادر و ETA قطعی ثبت شود","P1");
  var fa=makeAction("financial-commitment:"+poId,d.caseId,"ثبت تعهد مالی "+poId,"finance","مدیر مالی",2*60*60*1000,"تعهد در Cash Forecast ثبت شود","P2");
  link(d.id,poId,"authorizes-po",true);link(poId,pa.id,"execution-action",false);link(poId,fa.id,"financial-impact",false);notify(d.caseId,"Act","P1",pa.title,"مدیر تدارکات","Decision execution");notify(d.caseId,"Act","P2",fa.title,"مدیر مالی","Financial commitment");
 }
 persist();return d
}
function completeAction(actionId,verified){
 var a=store.actions.find(function(x){return x.id===actionId});if(!a)return null;a.status="Completed";a.completedAt=now();a.verified=!!verified;a.status=verified?"Verified":"Completed";audit("action.complete",a.id,"Action تکمیل شد",{verified:!!verified});
 var c=store.cases.find(function(x){return x.id===a.caseId});if(c){c.timeline.push({at:now(),text:a.id+" "+a.status});var open=store.actions.some(function(x){return x.caseId===c.id&&!/Completed|Verified|Cancelled/.test(x.status)});if(!open&&!(c.decisionIds||[]).some(function(id){var d=store.decisions.find(function(x){return x.id===id});return d&&d.status!=="Decided"})){c.status=verified?"Verified":"Resolved"}}
 persist();return a
}
function tick(advanceMs){
 var t=now()+(advanceMs||0),created=[];store.actions.forEach(function(a){if(/Completed|Verified|Cancelled/.test(a.status))return;var remain=a.dueAt-t,dur=a.dueAt-a.createdAt,ratio=1-(remain/dur);if(remain<0&&a.slaState!=="Overdue"){a.slaState="Overdue";created.push(notify(a.caseId,"Escalate",a.priority==="P1"?"P1":"P2","SLA معوق: "+a.title,managerOf(a.owner),"ESC_SLA"));audit("sla.overdue",a.id,"Action از SLA عبور کرد")}else if(ratio>=.8&&!a.slaState){a.slaState="80%";created.push(notify(a.caseId,"Act",a.priority,a.title+" — ۸۰٪ SLA مصرف شد",a.owner,"SLA 80%"))}});
 persist();return created
}
function managerOf(owner){if(/مدیرعامل/.test(owner))return "مدیرعامل";if(/مدیر/.test(owner))return "معاون عملیات";return "مدیر واحد"}
function acknowledge(notificationId){var n=store.notifications.find(function(x){return x.id===notificationId});if(n){n.status="Acknowledged";n.ackAt=now();audit("notification.ack",n.id,"اعلان Acknowledge شد");persist()}return n}
function snapshot(){return {events:store.events.length,activeEvents:store.events.filter(function(x){return x.status==="Active"}).length,cases:store.cases.filter(function(x){return x.status!=="Closed"}).length,actions:store.actions.filter(function(x){return !/Completed|Verified|Cancelled/.test(x.status)}).length,decisions:store.decisions.filter(function(x){return x.status!=="Decided"}).length,notifications:store.notifications.filter(function(x){return x.status!=="Resolved"}).length,risks:store.risks.filter(function(x){return x.status!=="Closed"}).length,links:store.links.length,audit:store.audit.length}}
function getStore(){return clone(store)}
function reset(){store=seed();persist();return snapshot()}
function runReferenceScenario(){
 if(store.scenarioSeeded)return {already:true,snapshot:snapshot()};
 store.scenarioSeeded=true;
 var r1=emitEvent({type:"Inventory.Stockout",module:"inventory",entityId:"ITEM-6205",severity:"S4",impact:"I4",urgency:"U5",context:"موجودی رولبرینگ حیاتی صفر است.",payload:{stock:0,coverageDays:0,emergencyPurchaseAmount:780000000}});
 var r2=emitEvent({type:"Maintenance.AssetFailed",module:"maintenance",entityId:"AST-ELV2",severity:"S4",impact:"I4",urgency:"U5",context:"الویتور خط ۲ متوقف شد.",payload:{downtimeMin:32}});
 var r3=emitEvent({type:"Quality.BatchHold",module:"quality",entityId:"B-2405",severity:"S3",impact:"I3",context:"Batch منتظر تأیید آزمایشگاه است."});
 persist();return {inventory:r1,maintenance:r2,quality:r3,snapshot:snapshot()}
}
window.ManagementKernel={emitEvent:emitEvent,resolveDecision:resolveDecision,completeAction:completeAction,tick:tick,acknowledge:acknowledge,snapshot:snapshot,getStore:getStore,reset:reset,runReferenceScenario:runReferenceScenario,link:link};
audit("kernel.boot","KERNEL","Management Kernel initialized",{version:store.version});persist();
})();