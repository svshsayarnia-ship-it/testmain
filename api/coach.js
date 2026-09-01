const SOURCE_MAP = {
  'who':'https://www.who.int/publications/i/item/9789240116559',
  'osha':'https://www.osha.gov/bloodborne-pathogens/standards',
  'fda1':'https://www.fda.gov/cosmetics/resources-consumers-cosmetics/using-cosmetics-safely',
  'fda2':'https://www.fda.gov/medical-devices/products-and-medical-procedures/aesthetic-cosmetic-devices',
  'fda3':'https://www.fda.gov/cosmetics/potential-contaminants-cosmetics/microbiological-safety-and-cosmetics',
  'aad1':'https://www.aad.org/public/diseases/acne/skin-care/tips',
  'aad2':'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/choosing-right-sunscreen',
  'aad3':'https://www.aad.org/public/diseases/acne/really-acne/acne-rosacea'
};
const FALLBACK = [
 {keys:['حساس','سوزش','قرمز'], refs:['aad3','fda1'], answer:'### جواب کوتاه\nبرای پوست حساس، جلسه را کوتاه و کم‌تحریک نگه دار و اول سابقه محصولات/درمان‌های اخیر را بررسی کن.\n\n### چه کار کنم؟\n• پاکسازی ملایم\n• حذف اسکراب و اکتیوهای غیرضروری\n• مرطوب‌کننده ساده و SPF\n• واکنش پوست را ثبت کن\n\n### موارد منع / ارجاع\nتاول، کهیر، تورم، زخم باز یا قرمزی شدید و ناشناخته → توقف و ارجاع. مشکل تنفسی → کمک اورژانسی.'},
 {keys:['رتینول','رتینو','ترتینو'], refs:['fda1','aad1'], answer:'### جواب کوتاه\nمصرف رتینوئید را ثبت کن. اگر پوست خشک، پوسته‌ریز یا تحریک‌شده است، لایه‌برداری و اکسترکشن را حذف کن یا جلسه را عقب بینداز.\n\n### چه کار کنم؟\n• نام محصول و زمان آخرین مصرف را بپرس\n• سد و تحمل پوست را بررسی کن\n• پروتکل مینیمال انتخاب کن\n• دارو را خودت قطع/شروع نکن\n\n### موارد منع / ارجاع\nالتهاب شدید، زخم یا واکنش غیرمعمول → ارجاع.'},
 {keys:['آکنه','جوش','چرب'], refs:['aad1'], answer:'### جواب کوتاه\nپوست چرب را بیش‌ازحد خشک نکن و ضایعات عمقی/دردناک را دستکاری نکن.\n\n### چه کار کنم؟\n• پاکسازی ملایم\n• لایه‌برداری فقط اگر تحمل مناسب است\n• اکسترکشن محدود فقط برای کومدون سطحی مناسب\n• مرطوب‌کننده سبک و ضدآفتاب مناسب\n\n### موارد منع / ارجاع\nآکنه کیستی/ندولی، اسکارشونده یا التهاب شدید → متخصص پوست.'},
 {keys:['اکستر','تخلیه'], refs:['aad1','osha'], answer:'### جواب کوتاه\nاکسترکشن فقط برای کومدون سطحی مناسب و در محدوده آموزش/قانون. اگر با فشار کم آزاد نشد، متوقف شو.\n\n### چه کار کنم؟\n• نور و بهداشت مناسب\n• فشار حداقلی\n• عدم دستکاری پاپول/پوسچول/کیست/ندول\n• ثبت واکنش پوست\n\n### موارد منع / ارجاع\nزخم، عفونت، تبخال و ضایعات عمقی یا دردناک → عدم دستکاری و ارجاع.'}
];
function fallback(question){const low=(question||'').toLowerCase();const hit=FALLBACK.find(x=>x.keys.some(k=>low.includes(k)))||{refs:['fda1','aad1'],answer:'### جواب کوتاه\nبرای پاسخ امن، اول نوع پوست، علائم فعلی، درمان/محصول اخیر و هدف جلسه را مشخص کن. اگر Red Flag وجود دارد، خدمت را متوقف و ارجاع بده.\n\n### چه کار کنم؟\n• فرم مشاوره را کامل کن\n• مشاهده غیرتشخیصی انجام بده\n• کم‌تحریک‌ترین مسیر را انتخاب کن\n• واکنش پوست را ثبت کن\n\n### موارد منع / ارجاع\nزخم باز، عفونت/تبخال فعال، ضایعه مشکوک، تورم شدید یا علائم خارج از محدوده → ارجاع. مشکل تنفسی → اورژانس.'};return {answer:hit.answer,sources:hit.refs,status:'منابع داخلی'};}

async function gateway(model, question, live=false){
 const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
 if(!token) throw new Error('gateway auth unavailable');
 const sourceText=Object.entries(SOURCE_MAP).map(([id,url])=>`${id}: ${url}`).join('\n');
 const system=`تو مربی آموزشی فیشال غیرپزشکی هستی. همیشه فارسی پاسخ بده و اصطلاح انگلیسی را داخل پرانتز بیاور. تشخیص بیماری، نسخه، دوز دارو یا آموزش تزریق/لیزر/میکرونیدلینگ عمیق/پیلینگ پزشکی ارائه نکن. پاسخ باید دقیقاً این بخش‌ها را داشته باشد: "### جواب کوتاه"، "### توضیح کامل"، "### چه کار کنم؟"، "### موارد منع / ارجاع"، "### منابع". برای ادعاهای ایمنی تا جای ممکن به منابع رسمی تکیه کن. اگر تورم صورت همراه مشکل تنفسی مطرح شد، اقدام اورژانسی را توصیه کن. منابع پایه:\n${sourceText}`;
 const body={model,messages:[{role:'system',content:system},{role:'user',content:question}],temperature:0.25,max_tokens:1000};
 const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify(body)});
 if(!response.ok) throw new Error(`gateway ${response.status}`);
 const data=await response.json();
 const text=data?.choices?.[0]?.message?.content;
 if(!text) throw new Error('empty');
 return {answer:text,sources:live?['who','fda1','aad1','aad2']:['fda1','aad1','aad3'],status:live?'جستجوی زنده + منابع':model.startsWith('google/')?'Gemini + منابع':'OpenAI + منابع'};
}

module.exports=async (req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST') return res.status(405).json({error:'POST only'});
 const {question,provider='auto'}=req.body||{};
 if(!question||typeof question!=='string') return res.status(400).json({error:'question required'});
 try{
   let model='openai/gpt-5.6-luna'; let live=false;
   if(provider==='gemini') model='google/gemini-3.1-flash-lite';
   if(provider==='openai') model='openai/gpt-5.6-luna';
   if(provider==='perplexity'){model='perplexity/sonar-pro';live=true;}
   if(provider==='auto'){model='openai/gpt-5.6-luna';}
   const out=await gateway(model,question,live);
   return res.status(200).json(out);
 }catch(err){
   return res.status(200).json(fallback(question));
 }
};
