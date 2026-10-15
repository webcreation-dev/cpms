import { parseDocument } from 'htmlparser2';
import { Element, Text } from 'domhandler';
import { findAll, getOuterHTML, textContent } from 'domutils';

export const documentFrom = html => parseDocument(html, { decodeEntities: true });
export const serialize = node => getOuterHTML(node, { encodeEntities: 'utf8' });
export const text = node => node ? textContent(node).replace(/\s+/g, ' ').trim() : '';

function simpleMatch(node, part) {
  if (!(node instanceof Element)) return false;
  const attr = part.match(/\[([\w-]+)(?:=["']?([^"'\]]+)["']?)?\]/);
  if (attr && (attr[2] ? node.attribs[attr[1]] !== attr[2] : !(attr[1] in node.attribs))) return false;
  part = part.replace(/\[[^\]]+\]/g, '');
  const tag = part.match(/^[\w-]+/)?.[0];
  const id = part.match(/#([\w-]+)/)?.[1];
  const classes = Array.from(part.matchAll(/\.([\w-]+)/g), x => x[1]);
  return (!tag || node.name === tag) && (!id || node.attribs.id === id)
    && classes.every(c => (node.attribs.class ?? '').split(/\s+/).includes(c));
}

function matchChain(node, tokens, index = tokens.length - 1) {
  if (!simpleMatch(node, tokens[index])) return false;
  if (!index) return true;
  if (tokens[index - 1] === '>') return matchChain(node.parent, tokens, index - 2);
  for (let p = node.parent; p; p = p.parent) if (matchChain(p, tokens, index - 1)) return true;
  return false;
}

export function all(root, selector) {
  const choices = selector.split(',').map(s => s.trim().replace(/\s*>\s*/g, ' > ').split(/\s+/));
  return findAll(node => node instanceof Element && choices.some(tokens => matchChain(node, tokens)), [root]);
}
export const one = (root, selector) => all(root, selector)[0];

export function contents(node, html) {
  if (!node) return;
  node.children = documentFrom(html).children;
  node.children.forEach(child => { child.parent = node; });
}

export function label(node, value) {
  if (!node) return;
  // Garder les icônes, flèches et retours à la ligne du dessin d'origine.
  const decorations = node.children.filter(child => child instanceof Element);
  if (/^h[1-6]$/.test(node.name) && decorations.some(el => el.name === 'a')) return label(decorations.find(el => el.name === 'a'), value);
  if (decorations.some(el => el.name === 'br')) {
    const parts = value.includes('|') ? value.split('|') : [value, ''];
    node.children = [new Text(parts[0]), ...decorations, new Text(parts.slice(1).join(' '))];
  } else if (decorations.length) {
    const firstWasText = node.children[0] instanceof Text && node.children[0].data.trim();
    node.children = firstWasText ? [new Text(value + ' '), ...decorations] : [...decorations, new Text(' ' + value)];
  } else node.children = [new Text(value)];
  node.children.forEach(child => { child.parent = node; });
}

export function put(root, selector, value) { label(one(root, selector), value); }
export function link(node, title, href) { if (node) { label(node, title); node.attribs.href = href; } }

export function replaceText(root, dictionary) {
  function visit(node) {
    if (node instanceof Text) {
      const normalized = node.data.replace(/\s+/g, ' ').trim();
      if (dictionary[normalized] !== undefined) node.data = node.data.replace(/\S[\s\S]*\S|\S/, dictionary[normalized]);
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(root);
}

export function shape(root) {
  return all(root, '*').map(el => `${el.name}|${el.attribs.class ?? ''}|${el.attribs.style ?? ''}`);
}
