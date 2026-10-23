"use client";

import { initializeEsimsContact } from '@/lib/esims-contact';

import { useEffect } from "react";
import { initializeEsimsHome, initializeEsimsTestimonials } from '@/lib/esims-home';
import { initializeEsimsCourse } from '@/lib/esims-course';
import { initializeEsimsMobileMenu } from '@/lib/esims-mobile-menu';
import { initializeEsimsScrollTop } from '@/lib/esims-scroll-top';

type JQueryBridge = {
  (target: Window): { triggerHandler: (event: string) => void };
  (ready: () => void): void;
  (target: Element): {
    one: (event: string, handler: () => void) => void;
    find: (selector: string) => { magnificPopup: (options: {
      type: string; tClose: string; tLoading: string; image: { titleSrc: string };
      gallery: { enabled: boolean; tPrev: string; tNext: string; tCounter: string };
    }) => void };
  };
};

declare global {
  interface Window {
    jQuery?: JQueryBridge;
    educavoInitialization?: Promise<void>;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Impossible de charger le script Educavo : ${src}`));
    document.body.appendChild(script);
  });
}

async function initialize(scripts: string[]) {
  const unconfirmed = Array.from(document.querySelectorAll<HTMLElement>('[data-cpms-stat="unconfirmed"]'));
  for (const src of scripts) {
    if (src.endsWith("/main.js")) unconfirmed.forEach(node => node.classList.remove("rs-count"));
    await loadScript(src);
    if (src.endsWith("/main.js")) unconfirmed.forEach(node => node.classList.add("rs-count"));
  }
  const $ = window.jQuery;
  if (!$) throw new Error("jQuery Educavo n'a pas été chargé.");
  // rsmenu-main utilise document.ready. Attendre ses gestionnaires avant
  // de rejouer les callbacks load si le chargement de la page est déjà fini.
  await new Promise<void>((resolve) => $(resolve));
  initializeEsimsHome();
  initializeEsimsTestimonials();
  initializeEsimsCourse();
  initializeEsimsContact();
  // Le lecteur Educavo reste limité aux photos du billet, sans celles du menu.
  const articlePhotos=document.querySelector('.cpms-post-content');
  if(articlePhotos?.querySelector('.cpms-article-gallery')) $(articlePhotos).find('.cpms-article-gallery .image-popup').magnificPopup({
    type:'image',tClose:'Fermer (Échap)',tLoading:'Chargement…',image:{titleSrc:''},
    gallery:{enabled:true,tPrev:'Photo précédente',tNext:'Photo suivante',tCounter:'%curr% / %total%'},
  });
  document.querySelectorAll('.sub-menu-close').forEach(node => {
    for (const child of node.childNodes) if (child.nodeType === Node.TEXT_NODE && child.textContent?.includes('Close')) child.textContent = 'Fermer';
  });
  if (document.readyState === "complete") $(window).triggerHandler("load");
  initializeEsimsScrollTop();
  initializeEsimsMobileMenu();
  if (document.body.classList.contains('esims-news-hub')) {
    // Une catégorie peut s’ouvrir directement sur la liste avant que le
    // gestionnaire Educavo ne rende l’en-tête fixe. Rejouer puis réaligner.
    $(window).triggerHandler('scroll');
    if (window.location.hash === '#news-list') requestAnimationFrame(() => {
      document.getElementById('news-list')?.scrollIntoView({ block: 'start' });
    });
  }
  if (document.body.classList.contains('cpms-course-page')) {
    $(window).triggerHandler('scroll');
    // Les liens Stages/Projets du site peuvent viser un onglet encore masqué.
    const revealSection = () => {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      const pane = target?.closest('.tab-pane');
      if (!target) return;
      const scrollToTarget = () => {
        target.scrollIntoView({ block: 'start' });
        // L'en-tête Educavo devient fixe au premier défilement et libère
        // sa hauteur dans le document : réaligner ensuite la section.
        requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
      };
      // Les nouvelles fiches utilisent des sections visibles, sans onglet.
      if (!pane) { scrollToTarget(); return; }
      const tab = document.querySelector<HTMLAnchorElement>(`.intro-tabs a[aria-controls="${pane.id}"]`);
      if (tab && !pane.classList.contains('active')) {
        $(tab).one('shown.bs.tab', scrollToTarget);
        tab.click();
      } else scrollToTarget();
    };
    window.addEventListener('hashchange', revealSection);
    document.addEventListener('click', event => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (link?.hash && link.hash === location.hash && link.origin === location.origin && link.pathname === location.pathname) revealSection();
    });
    revealSection();
  }
}

/** Aucun élément de mise en page : ce composant active les scripts originaux. */
export function TemplateRuntime({ scripts }: { scripts: string[] }) {
  useEffect(() => {
    // Les liens classiques font des navigations de document : les plugins
    // repartent d'un DOM neuf. La promesse évite une double initialisation
    // lors des deux effets de contrôle de React en développement.
    if (!window.educavoInitialization) {
      window.educavoInitialization = initialize(scripts);
      document.addEventListener("submit", (event) => {
        if (event.target instanceof HTMLFormElement && event.target.classList.contains("newsletter-form")) {
          event.preventDefault();
          const input = event.target.querySelector<HTMLInputElement>('input[type="email"]');
          input?.setCustomValidity('L’abonnement aux actualités n’est pas encore disponible. Vous pouvez contacter l’ESIMS par email.');
          input?.reportValidity();
        }
      });
      document.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest('a[aria-disabled="true"]')) event.preventDefault();
      });
      document.querySelectorAll('.search-wrap').forEach(wrapper => {
        const input = wrapper.querySelector<HTMLInputElement>('.search-input');
        const button = wrapper.querySelector('button');
        const search = () => { if(input) window.location.assign('/recherche?q='+encodeURIComponent(input.value)); };
        button?.addEventListener('click',search);
        input?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();search();}});
      });
      document.addEventListener('input',event=>{
        if(event.target instanceof HTMLInputElement&&event.target.closest('.newsletter-form'))event.target.setCustomValidity('');
      });
    }
    void window.educavoInitialization.catch((error: unknown) => {
      console.error(error);
    });
  }, [scripts]);
  return null;
}
