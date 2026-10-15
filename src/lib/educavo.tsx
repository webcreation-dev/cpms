import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import parse, { Element, type HTMLReactParserOptions } from "html-react-parser";
import editorialRegistry from "@/generated/cpms-registry.json";
import editorialMedia from "@/generated/cpms-media.json";
import { searchTemplate } from "./search-content";

const templatesRoot = path.join(process.cwd(), "src/templates/educavo");
const editorialRoot = path.join(process.cwd(), "src/generated/cpms");
type EditorialEntry = { file: string; source: string; title: string; description: string; canonical?: string };
const registry = editorialRegistry as Record<string, EditorialEntry>;
export type TemplateParams = { path?: string[] };
export type TemplatePageProps = { params: Promise<TemplateParams> };

export const templateNames = cache(async () =>
  (await readdir(templatesRoot)).filter((name) => name.endsWith(".html")).sort(),
);

export async function pageNames() {
  return Array.from(new Set([...(await templateNames()), ...Object.keys(registry).filter(Boolean)])).sort();
}

export function templateName(params: TemplateParams): string | null {
  if (!params.path?.length) return "index3.html";
  const key = params.path.join("/");
  if (Object.hasOwn(registry, key)) return key;
  if (params.path.length !== 1 || !/^[a-z0-9-]+\.html$/.test(key)) return null;
  return key;
}

/** Conserve les chemins du catalogue, en les ancrant à la racine Next. */
function localUrl(value: string): string {
  if (!value || value.startsWith("#") || value.startsWith("/") || /^(?:[a-z]+:|\/\/)/i.test(value)) return value;
  return `/${value}`;
}

function contentOptions(editorial: boolean): HTMLReactParserOptions { return {
  replace(node) {
    if (!(node instanceof Element)) return;
    if (editorial && node.name === 'li' && node.parent instanceof Element &&
        node.parent.attribs.class?.split(/\s+/).includes('nav-menu') &&
        node.parent.children.filter(child=>child instanceof Element && child.name==='li').some((child,index)=>child===node && index!==2)) {
      node.attribs.class = (node.attribs.class??'').split(/\s+/)
        .filter(c=>!['rs-mega-menu','mega-rs','menu-item-has-children'].includes(c)).join(' ');
      node.children = node.children.filter(child=>child instanceof Element && child.name==='a');
      for (const child of node.children) if (child instanceof Element) {
        delete child.attribs['aria-haspopup'];
        delete child.attribs['aria-expanded'];
      }
    }
    if (editorial && node.attribs.class?.split(/\s+/).includes('full-width-header')) {
      node.attribs.class += ' cpms-header';
    }
    // Conserver les trois rubriques Cursus validées dans le sous-menu natif.
    if (editorial && node.name === 'li' && node.parent instanceof Element &&
        node.parent.attribs.class?.split(/\s+/).includes('nav-menu') &&
        node.parent.children.filter(child=>child instanceof Element && child.name==='li')[2] === node) {
      const submenu = node.children.find(child=>child instanceof Element && child.name==='ul');
      if (submenu instanceof Element) {
        submenu.children = submenu.children.filter(child=>child instanceof Element && child.name==='li').slice(0,3);
      }
    }
    if (editorial && node.attribs.class?.split(/\s+/).includes('categories-btn')) return <></>;
    // La boutique n'est pas reprise : garder son icône sans faux panier démo.
    if (editorial && node.attribs.class?.split(/\s+/).includes('woocommerce-mini-cart')) return <></>;
    if (editorial && node.attribs.class?.split(/\s+/).includes('logo-part')) {
      return <div className={node.attribs.class}>
        <a href="/" className="cpms-brand" aria-label="CPMS — Cycle Préparatoire Marie Stella, accueil">
          <img src={editorialMedia.logo} alt="" width={80} height={80} />
          <span className="cpms-brand-copy"><strong>CPMS</strong><span>Cycle Préparatoire Marie Stella</span></span>
        </a>
        <div className="cpms-brand-phone">
          <i className="fa fa-phone" aria-hidden="true" />
          <div><span className="cpms-phone-label">TÉLÉPHONE</span>
            <span className="cpms-phone-numbers"><a href="tel:+2290162721072">+229 01 62 72 10 72</a><span> / </span><a href="tel:+2290149141277">+229 01 49 14 12 77</a></span>
          </div>
        </div>
      </div>;
    }
    if (editorial && node.attribs.class?.split(/\s+/).includes('footer-logo')) {
      return <div className={node.attribs.class}>
        <a href="/" className="cpms-footer-brand" aria-label="CPMS — Cycle Préparatoire Marie Stella, accueil">
          <img src={editorialMedia.logo} alt="" width={60} height={60} />
          <span><strong>CPMS</strong><span>Cycle Préparatoire Marie Stella</span></span>
        </a>
      </div>;
    }
    if (editorial && node.attribs.class?.split(/\s+/).includes('copyright')) {
      return <div className={node.attribs.class}><p>© 2026 CPMS — Tous droits réservés.</p></div>;
    }
    if (editorial && node.name === 'ul' && node.attribs.class?.split(/\s+/).some(c => ['footer-social', 'social'].includes(c))) {
      return <ul className={node.attribs.class}>
        <li><a href="https://www.facebook.com/cpmscotonou" aria-label="Facebook du CPMS"><i className="fa fa-facebook" aria-hidden="true" /></a></li>
        <li><a href="https://www.linkedin.com/company/cpms/" aria-label="LinkedIn du CPMS"><i className="fa fa-linkedin" aria-hidden="true" /></a></li>
        <li><a href="https://www.instagram.com/prepamariestella/" aria-label="Instagram du CPMS"><i className="fa fa-instagram" aria-hidden="true" /></a></li>
      </ul>;
    }
    if (editorial && node.attribs.class?.split(/\s+/).includes('rs-partner')) node.attribs.class += ' cpms-partners';
    if (editorial && node.attribs.class?.split(/\s+/).includes('rs-carousel') &&
        node.parent instanceof Element && node.parent.parent instanceof Element &&
        node.parent.parent.attribs.class?.split(/\s+/).includes('rs-partner')) {
      Object.assign(node.attribs, { 'data-items':'4', 'data-md-device':'4', 'data-autoplay':'true',
        'data-loop':'true', 'data-hoverpause':'false', 'data-autoplay-timeout':'2200', 'data-smart-speed':'900' });
    }
    if (editorial && node.name === 'img' && node.parent instanceof Element && node.parent.parent instanceof Element &&
        node.parent.parent.attribs.class?.split(/\s+/).includes('partner-item')) {
      if (node.attribs.alt?.startsWith('JUNIA')) node.attribs.src = '/cpms/originals/branding/junia.png';
      if (node.attribs.alt === 'ECPI Dakar') node.attribs.src = '/cpms/originals/branding/ecpi.webp';
    }
    // Les scripts sont chargés dans leur ordre original après hydratation.
    if (node.name === "script") return <></>;
    for (const attribute of ["src", "href", "poster"]) {
      if (node.attribs[attribute]) node.attribs[attribute] = localUrl(node.attribs[attribute]);
    }
    // Le miroir a remplacé les fragments Bootstrap par page.html#pane.
    // Bootstrap 4 attend un sélecteur CSS : ajouter sa cible non visuelle
    // pour les onglets/accordéons, en gardant leurs liens et leur dessin.
    if (["tab", "pill", "collapse"].includes(node.attribs["data-toggle"]) && !node.attribs["data-target"]) {
      const fragment = node.attribs.href?.match(/#[a-z][a-z0-9_-]*$/i)?.[0];
      if (fragment) node.attribs["data-target"] = fragment;
    }
    // Les logos et liens d'accueil index.html reviennent à l'accueil retenu.
    if (node.name === "a" && node.attribs.href === "/index.html") node.attribs.href = "/";
    if (node.name === "form" && node.attribs.id === "contact-form") {
      // Aucun formulaire de cette démonstration ne part vers le mailer Educavo.
      node.attribs.action = "/api/demo-contact";
    }
  },
}; }

export const loadTemplate = cache(async (name: string) => {
  const entry = registry[name];
  if (!entry && !(await templateNames()).includes(name)) return null;
  const raw = await readFile(entry ? path.join(editorialRoot, entry.file) : path.join(templatesRoot, name), "utf8");
  const head = raw.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const body = raw.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/i);
  if (!body) throw new Error(`Modèle sans body : ${name}`);
  const bodyClass = body[1].match(/class=["']([^"']*)["']/i)?.[1] ?? "";
  const styles = Array.from(head.matchAll(/<link\b[^>]*>/gi))
    .filter(([tag]) => /rel=["']stylesheet["']/i.test(tag))
    .map(([tag]) => localUrl(tag.match(/href=["']([^"']+)["']/i)?.[1] ?? ""));
  const scripts = Array.from(body[2].matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi),
    (match) => localUrl(match[1]));
  const favicon = entry ? editorialMedia.logo : localUrl(head.match(/<link\b[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? "assets/images/fav.png");
  if (entry) styles.push('/cpms/header.css');
  if (bodyClass.split(/\s+/).includes('cpms-about-page')) styles.push('/cpms/about.css');
  if (bodyClass.split(/\s+/).includes('cpms-course-page')) styles.push('/cpms/cycles.css');
  if (bodyClass.split(/\s+/).includes('cpms-news-page')) styles.push('/cpms/news.css');
  if (bodyClass.split(/\s+/).some(name=>['cpms-contact-page','cpms-faq-page','cpms-error-page'].includes(name))) styles.push('/cpms/information.css');
  if (entry) {
    for (let i=0;i<styles.length;i++) {
      if (styles[i]==='/style.css'||['/assets/css/responsive.css','/assets/css/rsmenu-main.css'].includes(styles[i])||/^\/cpms\/(header|about|cycles|news|information)\.css$/.test(styles[i])) {
        styles[i]='/cpms/theme/'+path.posix.basename(styles[i]);
      }
    }
    styles.push('/cpms/brand.css');
  }
  return { name, bodyClass, styles, scripts, favicon, title: entry?.title ?? `CPMS — Modèle ${name}`, description: entry?.description ?? "Modèle original Educavo conservé comme référence.", canonical: entry?.canonical, editorial: Boolean(entry), content: parse(body[2], contentOptions(Boolean(entry))) };
});

export async function loadSearch(query: string) {
  const entry = registry.recherche;
  const template = await loadTemplate('recherche');
  if (!template) return null;
  const raw = await readFile(path.join(editorialRoot,entry.file),'utf8');
  const transformed = searchTemplate(raw,query.slice(0,200));
  const body = transformed.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  return { ...template, content: parse(body,contentOptions(true)) };
}

export async function resolveTemplate(params: TemplateParams) {
  const name = templateName(params);
  return name ? loadTemplate(name) : null;
}
