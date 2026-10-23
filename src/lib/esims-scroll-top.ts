/** Retour en haut partagé, sans animation jQuery en attente ni double défilement. */
export function initializeEsimsScrollTop() {
  const button=document.querySelector<HTMLButtonElement>('#esims-scroll-top');
  if(!button||button.dataset.initialized)return;
  button.dataset.initialized='true';
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const update=()=>{
    frame=0;
    button.hidden=window.scrollY<320;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  button.addEventListener('click',event=>{
    window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'});
    if(event.detail===0)document.querySelector<HTMLAnchorElement>('.cpms-header .cpms-brand')?.focus({preventScroll:true});
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
  update();
}
