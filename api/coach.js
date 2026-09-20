const guide = require('./software-guide-data');

const MODEL = process.env.EXECUTIVE_ASSISTANT_MODEL || process.env.COACH_MODEL_OPENAI || 'openai/gpt-5.6-luna';
const REQUEST_TIMEOUT_MS = Number(process.env.COACH_REQUEST_TIMEOUT_MS || 20000);
const MAX_QUESTION_CHARS = Number(process.env.COACH_MAX_QUESTION_CHARS || 2500);
const RATE_LIMIT_WINDOW_MS = Number(process.env.COACH_RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.COACH_RATE_LIMIT_MAX || 20);
const rateBuckets = new Map();

function fetchWithTimeout(url,options,timeoutMs){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs||REQUEST_TIMEOUT_MS);
  return fetch(url,{...options,signal:controller.signal}).finally(()=>clearTimeout(timer));
}
function checkRateLimit(req){
  const forwarded=String(req.headers?.['x-forwarded-for']||'').split(',')[0].trim();
  const key=forwarded||req.socket?.remoteAddress||'anonymous',now=Date.now(),bucket=rateBuckets.get(key);
  if(!bucket||now-bucket.startedAt>=RATE_LIMIT_WINDOW_MS){rateBuckets.set(key,{startedAt:now,count:1});return true}
  if(bucket.count>=RATE_LIMIT_MAX)return false;bucket.count+=1;return true;
}
function cleanLiveContext(input){
  if(!input||typeof input!=='object')return null;
  const allowed=['page','user','snapshot','records'],out={};
  allowed.forEach(k=>{if(input[k]!=null)out[k]=input[k]});
  return JSON.parse(JSON.stringify(out).slice(0,16000));
}
function guideText(question){
  return JSON.stringify({navigation:guide.navigation(),modules:guide.selectGuide(question,6),glossary:guide.glossary,workflows:guide.workflows},null,2);
}
function localFallback(question){
  const selected=guide.selectGuide(question,3);
  if(!selected.length)return 'در راهنمای نرم‌افزار موضوع مرتبطی پیدا نشد. لطفاً نام منو یا گزینه را دقیق‌تر بنویسید.';
  return selected.map(m=>'### '+m.title+'\n'+m.purpose+'\n\n**بخش‌ها:** '+m.sections.join('، ')+'\n\n**منطق کار:** '+m.logic).join('\n\n');
}
async function askOpenAI(question,liveContext,history){
  const token=process.env.AI_GATEWAY_API_KEY;
  if(!token)throw new Error('AI_GATEWAY_API_KEY_NOT_CONFIGURED');
  const system=`تو راهنمای هوشمند نرم‌افزار «دستیار مدیرعامل آرد جنوب» هستی. فقط درباره همین نرم‌افزار، منوها، زیرمنوها، گزینه‌ها، فرم‌ها، گردش‌کارها و منطق مدیریتی آن پاسخ بده.

قواعد پاسخ:
- همیشه فارسی امروزی، روان و انسانی بنویس و اصطلاح انگلیسی غیرضروری به کار نبر.
- پاسخ را مستقیم و کاربردی بده؛ ابتدا بگو بخش یا گزینه چه کاری انجام می‌دهد، سپس منطق و ارتباطش با بخش‌های دیگر را توضیح بده.
- بین «راهنمای نرم‌افزار» و «اطلاعات جاری سازمان» تفاوت بگذار. اطلاعات جاری فقط از زمینه زنده ارائه‌شده قابل استناد است.
- اگر اطلاعات زنده کافی نیست، صریح بگو؛ عدد، وضعیت، نام یا علت نساز.
- فقط اطلاعاتی را استفاده کن که در دانشنامه یا زمینه زنده آمده است.
- به‌جای کاربر تصمیم ثبت نکن و ادعا نکن عملیاتی انجام شده است.
- در پایان، نام بخش‌های مرتبط نرم‌افزار را کوتاه ذکر کن.

دانشنامه مرتبط:
${guideText(question)}`;
  const messages=[{role:'system',content:system}];
  (Array.isArray(history)?history:[]).slice(-6).forEach(item=>{
    if(item&&['user','assistant'].includes(item.role)&&typeof item.content==='string')messages.push({role:item.role,content:item.content.slice(0,2000)});
  });
  messages.push({role:'user',content:`پرسش کاربر: ${question}\n\nزمینه زنده و مجاز رابط کاربر:\n${JSON.stringify(liveContext||{note:'زمینه زنده ارسال نشده است'})}`});
  const response=await fetchWithTimeout('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({model:MODEL,messages,temperature:0.2,max_tokens:1200})});
  if(!response.ok)throw new Error('AI_GATEWAY_HTTP_'+response.status);
  const data=await response.json();
  const answer=data?.choices?.[0]?.message?.content;
  if(!answer)throw new Error('AI_GATEWAY_EMPTY_RESPONSE');
  return answer;
}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET')return res.status(200).json({ok:true,assistant:'راهنمای هوشمند دستیار مدیرعامل',model:MODEL,modules:guide.modules.length});
  if(req.method!=='POST')return res.status(405).json({error:'فقط درخواست POST مجاز است.'});
  if(!checkRateLimit(req))return res.status(429).json({error:'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.'});
  const {question,context,history}=req.body||{};
  if(typeof question!=='string'||question.trim().length<3)return res.status(400).json({error:'پرسش باید حداقل ۳ نویسه داشته باشد.'});
  if(question.length>MAX_QUESTION_CHARS)return res.status(413).json({error:'پرسش بیش از حد طولانی است.'});
  try{
    const answer=await askOpenAI(question.trim(),cleanLiveContext(context),history);
    return res.status(200).json({answer,status:'پاسخ ChatGPT بر پایه راهنمای نرم‌افزار',source:'software-guide'});
  }catch(error){
    return res.status(200).json({answer:localFallback(question),status:'راهنمای داخلی نرم‌افزار',source:'local-guide',warning:error?.message||'AI unavailable'});
  }
};
