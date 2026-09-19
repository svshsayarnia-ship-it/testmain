const SOURCE_MAP = {
  who: 'https://www.who.int/publications/i/item/9789240116559',
  osha: 'https://www.osha.gov/bloodborne-pathogens/standards',
  fda1: 'https://www.fda.gov/cosmetics/resources-consumers-cosmetics/using-cosmetics-safely',
  fda2: 'https://www.fda.gov/medical-devices/products-and-medical-procedures/aesthetic-cosmetic-devices',
  fda3: 'https://www.fda.gov/cosmetics/potential-contaminants-cosmetics/microbiological-safety-and-cosmetics',
  aad1: 'https://www.aad.org/public/diseases/acne/skin-care/tips',
  aad2: 'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/choosing-right-sunscreen',
  aad3: 'https://www.aad.org/public/diseases/acne/really-acne/acne-rosacea'
};

const MODEL_CONFIG = {
  openai: process.env.COACH_MODEL_OPENAI || 'openai/gpt-5.6-luna',
  gemini: process.env.COACH_MODEL_GEMINI || 'google/gemini-3.1-flash-lite',
  perplexity: process.env.COACH_MODEL_PERPLEXITY || 'perplexity/sonar-pro'
};

const REQUEST_TIMEOUT_MS = Number(process.env.COACH_REQUEST_TIMEOUT_MS || 15000);
const MAX_QUESTION_CHARS = Number(process.env.COACH_MAX_QUESTION_CHARS || 2000);
const MIN_QUESTION_CHARS = Number(process.env.COACH_MIN_QUESTION_CHARS || 3);
const RATE_LIMIT_WINDOW_MS = Number(process.env.COACH_RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.COACH_RATE_LIMIT_MAX || 20);
const rateBuckets = new Map();

const FALLBACK = [
  {keys:['حساس','حساسیت','سوزش','ایریتشن','تحریک','قرمز','قرمزی','التهاب','خارش'], refs:['aad3','fda1'], answer:'### جواب کوتاه\nبرای پوست حساس یا تحریک‌شده، جلسه را کوتاه و کم‌تحریک نگه دار و اول سابقه محصولات/درمان‌های اخیر را بررسی کن.\n\n### چه کار کنم؟\n• پاکسازی ملایم\n• حذف اسکراب و اکتیوهای غیرضروری\n• مرطوب‌کننده ساده و SPF\n• واکنش پوست را ثبت کن\n\n### موارد منع / ارجاع\nتاول، کهیر، تورم، زخم باز یا قرمزی شدید و ناشناخته → توقف و ارجاع. مشکل تنفسی → کمک اورژانسی.'},
  {keys:['رتینول','رتینوئید','رتینو','ترتینو','آداپالن'], refs:['fda1','aad1'], answer:'### جواب کوتاه\nمصرف رتینوئید را ثبت کن. اگر پوست خشک، پوسته‌ریز یا تحریک‌شده است، لایه‌برداری و اکسترکشن را حذف کن یا جلسه را عقب بینداز.\n\n### چه کار کنم؟\n• نام محصول و زمان آخرین مصرف را بپرس\n• سد و تحمل پوست را بررسی کن\n• پروتکل مینیمال انتخاب کن\n• دارو را خودت قطع/شروع نکن\n\n### موارد منع / ارجاع\nالتهاب شدید، زخم یا واکنش غیرمعمول → ارجاع.'},
  {keys:['آکنه','جوش','کومدون','چرب','پوست چرب'], refs:['aad1'], answer:'### جواب کوتاه\nپوست چرب را بیش‌ازحد خشک نکن و ضایعات عمقی/دردناک را دستکاری نکن.\n\n### چه کار کنم؟\n• پاکسازی ملایم\n• لایه‌برداری فقط اگر تحمل مناسب است\n• اکسترکشن محدود فقط برای کومدون سطحی مناسب\n• مرطوب‌کننده سبک و ضدآفتاب مناسب\n\n### موارد منع / ارجاع\nآکنه کیستی/ندولی، اسکارشونده یا التهاب شدید → متخصص پوست.'},
  {keys:['اکستر','تخلیه','کومدون','سرسیاه'], refs:['aad1','osha'], answer:'### جواب کوتاه\nاکسترکشن فقط برای کومدون سطحی مناسب و در محدوده آموزش/قانون. اگر با فشار کم آزاد نشد، متوقف شو.\n\n### چه کار کنم؟\n• نور و بهداشت مناسب\n• فشار حداقلی\n• عدم دستکاری پاپول/پوسچول/کیست/ندول\n• ثبت واکنش پوست\n\n### موارد منع / ارجاع\nزخم، عفونت، تبخال و ضایعات عمقی یا دردناک → عدم دستکاری و ارجاع.'},
  {keys:['تورم','ورم','کهیر','تنگی نفس','تنفس','آنافیلاکسی'], refs:['fda1'], answer:'### جواب کوتاه\nتورم شدید صورت، کهیر گسترده یا هرگونه مشکل تنفسی می‌تواند نیازمند ارزیابی فوری پزشکی باشد.\n\n### چه کار کنم؟\n• خدمت زیبایی را متوقف کن\n• وضعیت تنفس و هوشیاری را بررسی کن\n• در صورت مشکل تنفسی یا بدترشدن سریع، کمک اورژانسی بگیر\n\n### موارد منع / ارجاع\nتورم سریع، تنگی نفس، خس‌خس یا ضعف شدید → اورژانس.'}
];

function fallback(question){
  const low = (question || '').toLowerCase();
  const hit = FALLBACK.find(x => x.keys.some(k => low.includes(k))) || {
    refs:['fda1','aad1'],
    answer:'### جواب کوتاه\nبرای پاسخ امن، اول نوع پوست، علائم فعلی، درمان/محصول اخیر و هدف جلسه را مشخص کن. اگر Red Flag وجود دارد، خدمت را متوقف و ارجاع بده.\n\n### چه کار کنم؟\n• فرم مشاوره را کامل کن\n• مشاهده غیرتشخیصی انجام بده\n• کم‌تحریک‌ترین مسیر را انتخاب کن\n• واکنش پوست را ثبت کن\n\n### موارد منع / ارجاع\nزخم باز، عفونت/تبخال فعال، ضایعه مشکوک، تورم شدید یا علائم خارج از محدوده → ارجاع. مشکل تنفسی → اورژانس.'
  };
  return {answer:hit.answer,sources:hit.refs,status:'منابع داخلی'};
}

function getToken(){
  const token = process.env.AI_GATEWAY_API_KEY;
  if (!token) throw new Error('AI_GATEWAY_API_KEY_NOT_CONFIGURED');
  return token;
}

function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {...options, signal: controller.signal}).finally(() => clearTimeout(timer));
}

function checkRateLimit(req){
  const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  const key = forwarded || req.socket?.remoteAddress || 'anonymous';
  const t = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || t - bucket.startedAt >= RATE_LIMIT_WINDOW_MS){
    rateBuckets.set(key,{startedAt:t,count:1});
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

async function gateway(model, question, live=false){
  const token = getToken();
  const sourceText = Object.entries(SOURCE_MAP).map(([id,url]) => `${id}: ${url}`).join('\n');
  const system = `تو مربی آموزشی فیشال غیرپزشکی هستی. همیشه فارسی پاسخ بده و اصطلاح انگلیسی را داخل پرانتز بیاور. تشخیص بیماری، نسخه، دوز دارو یا آموزش تزریق/لیزر/میکرونیدلینگ عمیق/پیلینگ پزشکی ارائه نکن. پاسخ باید دقیقاً این بخش‌ها را داشته باشد: "### جواب کوتاه"، "### توضیح کامل"، "### چه کار کنم؟"، "### موارد منع / ارجاع"، "### منابع". برای ادعاهای ایمنی تا جای ممکن به منابع رسمی تکیه کن. اگر تورم صورت همراه مشکل تنفسی مطرح شد، اقدام اورژانسی را توصیه کن. منابع پایه:\n${sourceText}`;
  const body = {model,messages:[{role:'system',content:system},{role:'user',content:question}],temperature:0.25,max_tokens:1000};
  const response = await fetchWithTimeout('https://ai-gateway.vercel.sh/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
    body:JSON.stringify(body)
  });
  if(!response.ok) throw new Error(`AI_GATEWAY_HTTP_${response.status}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if(!text) throw new Error('AI_GATEWAY_EMPTY_RESPONSE');
  const externalSources = [...(data?.citations||[]),...(data?.choices?.[0]?.message?.citations||[])]
    .map(x=>typeof x==='string'?x:x?.url).filter(Boolean);
  return {answer:text,sources:live?['who','fda1','aad1','aad2']:['fda1','aad1','aad3'],externalSources,status:live?'جستجوی زنده Perplexity + منابع':model===MODEL_CONFIG.gemini?'Gemini + منابع':'OpenAI + منابع'};
}

function extractResponseText(data){
  if(data?.output_text) return data.output_text;
  return (data?.output||[]).flatMap(x=>x?.content||[]).map(c=>c?.text||c?.value||'').filter(Boolean).join('\n');
}
function extractResponseUrls(data){
  return [...new Set((data?.output||[]).flatMap(x=>x?.content||[]).flatMap(c=>c?.annotations||[]).map(a=>a?.url||a?.url_citation?.url).filter(Boolean))];
}

async function openaiWeb(question){
  const token = getToken();
  const response = await fetchWithTimeout('https://ai-gateway.vercel.sh/v1/responses',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
    body:JSON.stringify({
      model:MODEL_CONFIG.openai,
      input:[
        {type:'message',role:'system',content:'به فارسی و فقط درباره فیشال غیرپزشکی پاسخ بده. تشخیص/نسخه/خدمات تهاجمی نده. منابع معتبر پزشکی و رسمی را ترجیح بده.'},
        {type:'message',role:'user',content:question}
      ],
      tools:[{type:'web_search'}],
      tool_choice:'auto',
      max_output_tokens:900
    })
  });
  if(!response.ok) throw new Error(`OPENAI_WEB_HTTP_${response.status}`);
  const data = await response.json();
  const text = extractResponseText(data);
  if(!text) throw new Error('OPENAI_WEB_EMPTY_RESPONSE');
  return {text,urls:extractResponseUrls(data)};
}

async function multiResearch(question){
  const [px,ow] = await Promise.allSettled([
    gateway(MODEL_CONFIG.perplexity,question,true),
    openaiWeb(question)
  ]);
  const parts=[],urls=[];
  if(px.status==='fulfilled'){parts.push('نتیجه Perplexity:\n'+px.value.answer);urls.push(...(px.value.externalSources||[]));}
  if(ow.status==='fulfilled'){parts.push('نتیجه OpenAI Web Search:\n'+ow.value.text);urls.push(...ow.value.urls);}
  if(!parts.length) throw new Error('ALL_LIVE_SEARCHES_FAILED');
  let answer = parts.join('\n\n');
  try{
    const synth = await gateway(MODEL_CONFIG.gemini,`این نتایج جستجوی وب را بدون افزودن ادعای بدون منبع، به یک پاسخ فارسی ساختاریافته با بخش‌های جواب کوتاه، توضیح کامل، چه کار کنم؟، موارد منع/ارجاع و منابع تبدیل کن:\n\n${answer}`,false);
    answer = synth.answer;
  }catch(_){}
  return {answer,sources:['who','fda1','fda2','aad1','aad2','aad3'],externalSources:[...new Set(urls)].slice(0,10),status:'تحقیق چندمنبعی'};
}

module.exports = async (req,res) => {
  res.setHeader('Cache-Control','no-store');

  if(req.method==='GET'){
    return res.status(200).json({
      ok:true,
      providers:['OpenAI','Google Gemini','Perplexity'],
      search:['Perplexity live web','OpenAI web search'],
      fallback:'curated internal sources',
      limits:{minQuestionChars:MIN_QUESTION_CHARS,maxQuestionChars:MAX_QUESTION_CHARS}
    });
  }
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  if(!checkRateLimit(req)) return res.status(429).json({error:'rate limit exceeded'});

  const {question,provider='auto'} = req.body || {};
  if(typeof question!=='string') return res.status(400).json({error:'question required'});
  const normalized = question.trim();
  if(normalized.length < MIN_QUESTION_CHARS) return res.status(400).json({error:`question must be at least ${MIN_QUESTION_CHARS} characters`});
  if(normalized.length > MAX_QUESTION_CHARS) return res.status(413).json({error:`question exceeds ${MAX_QUESTION_CHARS} characters`});

  try{
    let model = MODEL_CONFIG.openai, live = false;
    if(provider==='gemini') model = MODEL_CONFIG.gemini;
    else if(provider==='openai') model = MODEL_CONFIG.openai;
    else if(provider==='perplexity'){model = MODEL_CONFIG.perplexity;live = true;}
    else if(provider!=='auto' && provider!=='research') return res.status(400).json({error:'unsupported provider'});

    const out = provider==='research' ? await multiResearch(normalized) : await gateway(model,normalized,live);
    return res.status(200).json(out);
  }catch(err){
    const isConfig = err && err.message === 'AI_GATEWAY_API_KEY_NOT_CONFIGURED';
    return res.status(500).json({
      error:isConfig?'AI service is not configured':'AI service temporarily unavailable',
      fallback:fallback(normalized)
    });
  }
};
