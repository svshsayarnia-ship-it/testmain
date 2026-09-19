import fs from "node:fs";
import vm from "node:vm";

const storage = new Map();
globalThis.window = globalThis;
globalThis.localStorage = {
  getItem: (k) => storage.has(k) ? storage.get(k) : null,
  setItem: (k,v) => storage.set(k,String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init={}) { this.type = type; this.detail = init.detail; }
};
globalThis.dispatchEvent = () => true;

const source = fs.readFileSync(new URL("../public/management-kernel-v2.js", import.meta.url), "utf8");
vm.runInThisContext(source, { filename: "management-kernel-v2.js" });

if (!globalThis.ManagementKernel || globalThis.ManagementKernel.version !== 2) {
  throw new Error("ManagementKernel v2 did not boot");
}

const results = globalThis.ManagementKernel.runAcceptanceSuite();
const failed = results.filter(r => !r.ok);

console.table(results);
console.log("Kernel snapshot:", globalThis.ManagementKernel.snapshot());

if (failed.length) {
  console.error("Acceptance failures:", failed);
  process.exit(1);
}
console.log(`PASS: ${results.length}/${results.length} kernel acceptance checks`);
