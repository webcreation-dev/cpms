import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "../keenitsolutions.com/products/html/educavo");
const publicRoot = join(root, "public");
const templates = join(root, "src/templates/educavo");
const manifest = { source, templates: {}, assets: {}, aliases: {} };

await mkdir(templates, { recursive: true });
await mkdir(publicRoot, { recursive: true });

async function copyTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const from = join(directory, entry.name);
    if (entry.isDirectory()) {
      await copyTree(from);
      continue;
    }
    if (!entry.isFile()) continue;
    const path = relative(source, from);
    const isTemplate = directory === source && entry.name.endsWith(".html");
    const destination = isTemplate ? join(templates, entry.name) : join(publicRoot, path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(from, destination);
    const digest = createHash("sha256").update(await readFile(from)).digest("hex");
    (isTemplate ? manifest.templates : manifest.assets)[path] = digest;

    // Le miroir a des polices dont le nom contient littéralement ?v=4.7.0.
    // Le serveur HTTP traite cette partie comme une query : créer un alias
    // de même contenu dans la copie, sans toucher aux CSS ni à l'original.
    if (!isTemplate && path.includes("?")) {
      const alias = path.split("?")[0];
      await copyFile(from, join(publicRoot, alias));
      manifest.aliases[alias] = { original: path, sha256: digest };
    }
  }
}

await copyTree(source);
await writeFile(join(root, "template-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`${Object.keys(manifest.templates).length} modèles et ${Object.keys(manifest.assets).length} assets copiés à l'identique.`);
