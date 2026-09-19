import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("public/index.html");
const app = read("public/ard-v2.js");
const views = read("public/kernel-views-v2.js");
const css = read("public/ard-v2.css");

const checks = [
  ["Kernel loads before UI", html.indexOf("management-kernel-v2.js") < html.indexOf("ard-v2.js")],
  ["Business records load before bridges and views", html.indexOf("module-records-v2.js") < html.indexOf("kernel-bridge.js") && html.indexOf("kernel-bridge.js") < html.indexOf("kernel-views-v2.js")],
  ["Navigation badges derive from Kernel", /function liveNavCount/.test(app) && /K\.query\("cases"\)/.test(app)],
  ["Global search derives from Kernel", /K\.query\("decisions"\)/.test(app) && /K\.queryRecords\("inventoryItem"\)/.test(app)],
  ["Role switch synchronizes profile", /function syncProfile/.test(views) && /syncProfile\(\)/.test(views)],
  ["Kernel updates refresh navigation", /refreshKernelNav/.test(app) && /window\.refreshKernelNav/.test(views)],
  ["Mobile header can shrink safely", /\.search\{[^}]*min-width:0/.test(css) && /@media\(max-width:520px\)/.test(css)],
  ["Mobile sidebar has overlay", /@media\(max-width:820px\)[\s\S]*\.sidebar\.open/.test(css) && /\.overlay/.test(css)]
];

for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) process.exit(1);
console.log(`PASS: ${checks.length}/${checks.length} UI contract checks`);
