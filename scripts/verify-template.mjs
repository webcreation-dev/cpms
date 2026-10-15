import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(root, "template-manifest.json"), "utf8"));
const baseline = JSON.parse(await readFile(join(root, "../docs/analyse/reference-template-sha256.json"), "utf8"));
const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");

for (const [path, hash] of Object.entries(manifest.templates)) {
  assert.equal(await digest(join(root, "src/templates/educavo", path)), hash, `HTML modifié : ${path}`);
}
for (const [path, hash] of Object.entries(manifest.assets)) {
  assert.equal(await digest(join(root, "public", path)), hash, `Asset modifié : ${path}`);
}
for (const [path, info] of Object.entries(manifest.aliases)) {
  assert.equal(await digest(join(root, "public", path)), info.sha256, `Alias modifié : ${path}`);
}
for (const [path, hash] of Object.entries(baseline)) {
  assert.equal(await digest(join(manifest.source, path)), hash, `Original modifié : ${path}`);
}
assert.equal(Object.keys(manifest.templates).length, 51);
assert.equal(Object.keys(manifest.templates).length + Object.keys(manifest.assets).length, 634);
console.log("Vérifié : 51 modèles, styles/scripts/assets identiques et 634 fichiers originaux intacts.");
