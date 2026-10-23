import { Element, Text } from 'domhandler';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { documentFrom, serialize } from './editorial-dom.mjs';

// Les coordonnées, adresses web et chemins des archives restent opérationnels.
const addresses = /((?:https?:\/\/|www\.)[^\s<>"']+|(?:mailto:)?[\w.%+-]+@[\w.-]+\.[a-z]{2,}|\/cpms\/[^\s<>"']+)/gi;

export function esimsName(value) {
  return String(value).split(addresses).map((part, index) => {
    if (index % 2) return part;
    return part.replace(/\b(le|du|au)\s+(?:CPMS|ESIMS)\b/gi, (_, article) => {
      const forms = { le: 'l’EIMS', du: 'de l’EIMS', au: 'à l’EIMS' };
      const result = forms[article.toLowerCase()];
      return article[0] === article[0].toUpperCase() ? result[0].toUpperCase() + result.slice(1) : result;
    }).replace(/\b(?:CPMS|ESIMS)\b/gi, 'EIMS')
      .replace(/\bEIMS est reconnu et autorisé\b/g, 'EIMS est reconnue et autorisée');
  }).join('');
}

export function nameDocument(doc) {
  const texts = [];
  function visit(node) {
    if (node instanceof Text) { node.data = esimsName(node.data); if (node.data.trim()) texts.push(node); return; }
    if (node instanceof Element) {
      if (['script', 'style'].includes(node.name)) return;
      for (const key of ['alt', 'title', 'aria-label', 'placeholder']) {
        if (node.attribs[key]) node.attribs[key] = esimsName(node.attribs[key]);
      }
      if (node.name === 'meta' && node.attribs.content && ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].includes(node.attribs.name || node.attribs.property)) node.attribs.content = esimsName(node.attribs.content);
      if (node.attribs.download) node.attribs.download = node.attribs.download.replace(/cpms|esims/gi, 'eims');
    }
    for (const child of node.children || []) visit(child);
  }
  visit(doc);
  // Garder une élision correcte aussi dans « au <strong>CPMS</strong> ».
  const block = node => {
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (/^(p|div|li|h[1-6]|td|th|figcaption|blockquote|a)$/.test(parent.name || '')) return parent;
    }
    return doc;
  };
  for (let index = 1; index < texts.length; index++) {
    const previous = texts[index - 1], current = texts[index];
    if (!/^\s*EIMS\b/.test(current.data) || block(previous) !== block(current)) continue;
    if (/\b(le|du|au)\s+$/i.test(previous.data)) {
      previous.data = previous.data.replace(/\b(le|du|au)\s+$/i, (_, article) => {
        const forms = { le: 'l’', du: 'de l’', au: 'à l’' };
        const result = forms[article.toLowerCase()];
        return article[0] === article[0].toUpperCase() ? result[0].toUpperCase() + result.slice(1) : result;
      });
      current.data = current.data.replace(/^\s+/, '');
    }
  }
  return doc;
}

/** Appliquer le nom public après les adaptations, sans réécrire les archives. */
export async function nameSite(registry, generated, records) {
  for (const file of new Set(Object.values(registry).map(entry => entry.file))) {
    const path = join(generated, file);
    await writeFile(path, serialize(nameDocument(documentFrom(await readFile(path, 'utf8')))));
  }
  for (const entry of Object.values(registry)) {
    entry.title = esimsName(entry.title);
    entry.description = esimsName(entry.description);
  }
  for (const record of records) {
    for (const key of ['title', 'shortTitle', 'contentText', 'excerpt']) record[key] = esimsName(record[key]);
    record.contentHtml = serialize(nameDocument(documentFrom(record.contentHtml)));
  }
}
