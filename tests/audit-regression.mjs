import fs from "node:fs";

function read(path){ return fs.readFileSync(path,"utf8"); }
function assert(cond,msg){ if(!cond) throw new Error(msg); }

const ai=read("public/kernel-ai-v2.js");
const bridge=read("public/kernel-bridge.js");
const kernel=read("public/management-kernel-v2.js");
const ui=read("public/ui-fa.js");
const coach=read("api/coach.js");
const index=read("public/index.html");

const demoIds=["WO-529","PROD-SHIFT-829","AST-ELV2","POS-14","ITEM-6205","PO-881","B-2405"];
for(const id of demoIds){
  assert(!ai.includes(id), `AI contains hardcoded demo id: ${id}`);
  assert(!bridge.includes(id), `Bridge contains hardcoded demo id: ${id}`);
}

assert(ai.includes("q2.length<3"),"AI generic search minimum length guard missing");
assert(ai.includes("sanitizeHtml"),"AI sanitizer missing");
assert(ai.includes("management-kernel:ready"),"AI does not wait for kernel ready event");

assert(!coach.includes("VERCEL_OIDC_TOKEN"),"coach.js still accepts VERCEL_OIDC_TOKEN");
assert(coach.includes("fetchWithTimeout"),"coach.js timeout wrapper missing");
assert(coach.includes("status(500)"),"coach.js must expose provider failures as HTTP 500");
assert(coach.includes("status(429)"),"coach.js rate limiting missing");
assert(coach.includes("COACH_MODEL_OPENAI"),"coach model config is not env-backed");

assert(!ui.includes("phrases.forEach"),"ui-fa.js still performs global regex translation");
assert(!ui.includes("/\\bStock\\b/g"),"ui-fa.js still rewrites arbitrary Stock tokens");
assert(ui.includes("data-i18n"),"ui-fa.js explicit i18n key support missing");

assert(kernel.includes("SCHEMA_VERSION"),"kernel schema version missing");
assert(kernel.includes("migrateState"),"kernel version-aware migration missing");
assert(kernel.includes("management-kernel:ready"),"kernel ready event missing");
assert(kernel.includes('KEY+":backup:"'),"pre-migration state backup missing");

assert(!fs.existsSync("public/management-kernel.js"),"legacy management-kernel.js must be deleted");
assert(!index.includes("/management-kernel.js"),"index references legacy kernel");

console.log("PASS: audit regression guards");
