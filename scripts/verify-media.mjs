import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const references = new Set();

// Contrôler les pages publiées, les données utilisées par la recherche et les CSS.
for (const directory of ['src/generated', 'src/data', 'public/cpms']) {
  const entries = await readdir(join(root, directory), { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/\.(html|json|css)$/.test(entry.name)) continue;
    const source = await readFile(join(entry.parentPath, entry.name), 'utf8');
    for (const match of source.matchAll(/\/cpms\/(?:originals|slots)\/[^"'<>]+?\.(?:jpe?g|png|webp|gif|svg|pdf|mp4)/gi)) {
      references.add('public' + decodeURIComponent(match[0]).replaceAll('&amp;', '&'));
    }
  }
}
assert(references.size > 0, 'Aucun média CPMS trouvé dans les pages générées.');

const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0'));
const missing = [], untracked = [], pngSlots = [];
let bytes = 0;
for (const file of references) {
  try {
    const info = await stat(join(root, file));
    assert(info.isFile() && info.size > 0);
    bytes += info.size;
  } catch { missing.push(file); }
  if (!tracked.has(file)) untracked.push(file);
  if (file.startsWith('public/cpms/slots/') && file.endsWith('.png')) pngSlots.push(file);
}
assert.equal(missing.length, 0, `Médias absents ou vides :\n${missing.join('\n')}`);
assert.equal(pngSlots.length, 0, `Recadrages encore référencés en PNG :\n${pngSlots.join('\n')}`);
if (process.argv.includes('--tracked')) {
  assert.equal(untracked.length, 0, `Médias utilisés absents du suivi Git :\n${untracked.join('\n')}`);
}
console.log(`${references.size} médias/documents présents (${(bytes / 1024 / 1024).toFixed(1)} Mio), recadrages en WebP.`);
if (process.argv.includes('--tracked')) console.log('Tous les médias utilisés sont suivis dans Git.');
