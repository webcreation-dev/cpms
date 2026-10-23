import sharp from "sharp";
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";

const dir = "public/cpms/slots";
const files = (await readdir(dir)).filter((f) => f.endsWith(".png"));

for (const f of files) {
    const src = path.join(dir, f);
    const dest = src.replace(/\.png$/, ".webp");
    await sharp(src).webp({ quality: 80 }).toFile(dest);
    await unlink(src);
}
console.log(`${files.length} fichiers convertis`);