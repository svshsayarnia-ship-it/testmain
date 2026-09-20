import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("public/index.html");
const app = read("public/ard-v2.js");
const views = read("public/kernel-views-v2.js");
const css = read("public/ard-v2.css");
const faUi = read("public/ui-fa.js");

const checks = [
  ["Kernel loads before UI", html.indexOf("management-kernel-v2.js") < html.indexOf("ard-v2.js")],
  ["Business records load before bridges and views", html.indexOf("module-records-v2.js") < html.indexOf("kernel-bridge.js") && html.indexOf("kernel-bridge.js") < html.indexOf("kernel-views-v2.js")],
  ["Navigation badges derive from Kernel", /function liveNavCount/.test(app) && /K\.query\("cases"\)/.test(app)],
  ["Global search derives from Kernel", /K\.query\("decisions"\)/.test(app) && /K\.queryRecords\("inventoryItem"\)/.test(app)],
  ["Role switch synchronizes profile", /function syncProfile/.test(views) && /syncProfile\(\)/.test(views)],
  ["Kernel updates refresh navigation", /refreshKernelNav/.test(app) && /window\.refreshKernelNav/.test(views)],
  ["Navigation releases stale Kernel view ownership", /removeAttribute\("data-kv2"\)/.test(app)],
  ["Mobile header can shrink safely", /\.search\{[^}]*min-width:0/.test(css) && /@media\(max-width:520px\)/.test(css)],
  ["Mobile sidebar has overlay", /@media\(max-width:820px\)[\s\S]*\.sidebar\.open/.test(css) && /\.overlay/.test(css)]
  ,["Vazirmatn is bundled and applied", /@font-face/.test(css) && /Vazirmatn\.woff2/.test(css) && fs.existsSync(new URL("../public/fonts/Vazirmatn.woff2", import.meta.url))]
  ,["Persian UI humanizer loads last", html.indexOf("ui-fa.js") > html.indexOf("kernel-ai-v2.js")]
  ,["Core management terms have human Persian labels", ["رویداد","پرونده مدیریتی","اقدام","تصمیم","تأیید فرایندی","مهلت انجام","دامنه دسترسی"].every(term => faUi.includes(term))]
  ,["Mixed Persian-English labels are translated globally", /translate:translateExact/.test(faUi) && /dictionaryKeys/.test(faUi) && ["تدارکات و تأمین","سفارش خرید","زمان تقریبی تحویل \(روز\)","اعتبارسنجی اطلاعات","اجرای خودکار فرایندها"].every(term => faUi.includes(term))]
  ,["Operational modules and statuses have Persian labels", ["گندم و سیلوها","دفتر کل","اموال و دارایی‌ها","در حال تولید","در انتظار قطعه","در معرض خطر","تازگی اطلاعات"].every(term => faUi.includes(term))]
  ,["Part request is available from inventory UI", /data-mrv2="part-request"/.test(read("public/module-records-v2.js")) && /K\.requestPart\(v\)/.test(read("public/module-records-v2.js"))]
  ,["Procurement UI advances PR to order and receipt", /data-mrv2="order-pr"/.test(read("public/module-records-v2.js")) && /data-mrv2="receive-pr"/.test(read("public/module-records-v2.js"))]
  ,["Mobile menu locks background scrolling", /classList\.toggle\("menu-open",opening\)/.test(app) && /body\.menu-open,body\.modal-open\{overflow:hidden/.test(css)]
  ,["Long menus keep touch scrolling without visible bars", /height:100dvh/.test(css) && /overscroll-behavior:contain/.test(css) && /\.sidebar::-webkit-scrollbar\{display:none/.test(css)]
  ,["Modal scroll lock follows every dialog implementation", /new MutationObserver/.test(app) && /classList\.toggle\("modal-open"/.test(app)]
];

for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) process.exit(1);
console.log(`PASS: ${checks.length}/${checks.length} UI contract checks`);
