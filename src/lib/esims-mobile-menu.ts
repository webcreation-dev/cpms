/** Navigation mobile commune, autour des éléments du menu Educavo existant. */
export function initializeEsimsMobileMenu() {
  const header=document.querySelector<HTMLElement>('.cpms-header');
  const toggle=header?.querySelector<HTMLAnchorElement>('.rs-menu-toggle');
  const nav=header?.querySelector<HTMLElement>('.rs-menu');
  if(!header||!toggle||!nav||header.dataset.mobileMenuInitialized)return;
  header.dataset.mobileMenuInitialized='true';
  const mobile=window.matchMedia('(max-width: 991px)');
  const icon=toggle.querySelector('i');
  if(icon)icon.setAttribute('aria-hidden','true');
  const label=document.createElement('span');
  label.className='esims-mobile-menu-label'; label.textContent='Menu';
  toggle.prepend(label);
  toggle.setAttribute('role','button'); toggle.tabIndex=0;
  toggle.setAttribute('aria-label','Ouvrir le menu');
  nav.id='esims-primary-navigation';
  nav.setAttribute('aria-label','Navigation principale');
  toggle.setAttribute('aria-controls',nav.id);
  toggle.setAttribute('aria-expanded','false');
  const backdrop=document.createElement('button');
  backdrop.type='button'; backdrop.className='esims-mobile-menu-backdrop';
  backdrop.setAttribute('aria-label','Fermer le menu'); backdrop.tabIndex=-1; backdrop.hidden=true;
  document.body.append(backdrop);
  const background=Array.from(document.querySelectorAll<HTMLElement>('.main-content, .rs-footer, #scrollUp'));
  const initialInert=new Map(background.map(element=>[element,element.inert]));
  const parents=Array.from(nav.querySelectorAll<HTMLElement>('.rs-menu-parent'));
  parents.forEach((parent,index)=>{
    const submenu=parent.parentElement?.querySelector<HTMLElement>('.sub-menu');
    if(!submenu)return;
    submenu.id=`esims-mobile-submenu-${index}`;
    parent.setAttribute('role','button'); parent.tabIndex=0;
    parent.setAttribute('aria-label','Afficher les filières');
    parent.setAttribute('aria-controls',submenu.id);
    parent.setAttribute('aria-expanded','false');
  });
  let open=false;
  const submenuState=(parent:HTMLElement,expanded:boolean)=>{
    parent.parentElement?.querySelector('.sub-menu')?.classList.toggle('visible',expanded);
    parent.setAttribute('aria-expanded',String(expanded));
    parent.setAttribute('aria-label',expanded?'Masquer les filières':'Afficher les filières');
    const arrow=parent.querySelector('i'); if(arrow)arrow.className=expanded?'fa fa-angle-up':'fa fa-angle-down';
  };
  const setOpen=(next:boolean,restoreFocus=false)=>{
    open=next&&mobile.matches;
    document.body.classList.toggle('esims-mobile-menu-open',open);
    document.documentElement.classList.toggle('esims-mobile-menu-open',open);
    toggle.classList.toggle('rs-menu-toggle-open',open);
    toggle.classList.toggle('rs-menu-toggle-close',!open);
    nav.classList.toggle('rs-menu-close',!open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
    label.textContent=open?'Fermer':'Menu';
    if(icon)icon.className=open?'fa fa-times':'fa fa-bars';
    backdrop.hidden=!open;
    background.forEach(element=>{element.inert=open||Boolean(initialInert.get(element));});
    if(!open)parents.forEach(parent=>submenuState(parent,false));
    if(restoreFocus)toggle.focus({preventScroll:true});
  };
  // Capturer uniquement les commandes mobiles ; le menu ordinateur reste natif.
  header.addEventListener('click',event=>{
    if(!mobile.matches||!(event.target instanceof Element))return;
    if(event.target.closest('.rs-menu-toggle')){
      event.preventDefault(); event.stopImmediatePropagation(); setOpen(!open); return;
    }
    const parent=event.target.closest<HTMLElement>('.rs-menu-parent');
    if(parent){
      event.preventDefault(); event.stopImmediatePropagation();
      submenuState(parent,parent.getAttribute('aria-expanded')!=='true');return;
    }
    if(event.target.closest('.rs-menu a[href]'))setOpen(false);
  },true);
  header.addEventListener('keydown',event=>{
    if(!mobile.matches||!(event.target instanceof HTMLElement))return;
    if((event.target===toggle||event.target.classList.contains('rs-menu-parent'))&&['Enter',' '].includes(event.key)){
      event.preventDefault();event.target.click();
    }
  });
  backdrop.addEventListener('click',()=>setOpen(false,true));
  document.addEventListener('keydown',event=>{
    if(!open)return;
    if(event.key==='Escape'){event.preventDefault();setOpen(false,true);return;}
    if(event.key!=='Tab')return;
    const focusable=[toggle,...Array.from(nav.querySelectorAll<HTMLElement>('a[href], [role="button"]'))]
      .filter(element=>element.getClientRects().length&&getComputedStyle(element).visibility!=='hidden');
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first&&last){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  let viewportWidth=window.innerWidth;
  window.addEventListener('resize',()=>{
    if(window.innerWidth===viewportWidth)return;
    viewportWidth=window.innerWidth;setOpen(false);
  });
  setOpen(false);
}
