import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "http://127.0.0.1:3003";
const manifest = JSON.parse(await readFile(join(root, "template-manifest.json"), "utf8"));
const results = { origin, pages: [], assets: [], failures: [], notFound: null, demoContact: null };

async function check(url, target, expectedHash) {
  const response = await fetch(origin + url);
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const result = { path: url, status: response.status, bytes: bytes.length };
  if (expectedHash) result.identical = hash === expectedHash;
  target.push(result);
  if (response.status !== 200 || (expectedHash && !result.identical)) results.failures.push(result);
}

const tasks = [() => check("/", results.pages),
  ...Object.keys(manifest.templates).map((name) => () => check(`/${name}`, results.pages)),
  ...Object.entries(manifest.assets).map(([file, hash]) => () =>
    check("/" + file.split("/").map(encodeURIComponent).join("/"), results.assets, hash))];

await Promise.all(Array.from({ length: 6 }, async () => {
  while (tasks.length) await tasks.shift()();
}));
results.notFound = (await fetch(origin + "/page-absente.html")).status;
results.demoContact = (await fetch(origin + "/api/demo-contact", { method: "POST" })).status;
await mkdir(join(root, "verification"), { recursive: true });
await writeFile(join(root, "verification/http.json"), JSON.stringify(results, null, 2) + "\n");
console.log(`${results.pages.length} pages et ${results.assets.length} assets contrôlés ; ${results.failures.length} échecs.`);
if (results.failures.length) console.log(JSON.stringify(results.failures, null, 2));
assert.equal(results.notFound, 404, "La page inconnue doit répondre 404.");
assert.equal(results.demoContact, 503, "Le formulaire de démonstration ne doit pas simuler un envoi.");
assert.equal(results.failures.length, 0, "Des routes ou des fichiers diffèrent de l'original.");
