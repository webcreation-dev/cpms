import { Element, Text } from 'domhandler';
import { documentFrom, all, serialize, text } from './editorial-dom.mjs';

/** Remplacer les suites de photos par la grille de gallery-style1, sur place. */
export function articleGallery(html, safe) {
  const doc=documentFrom(html);
  const media=node=>node instanceof Element&&['img','a','p','figure'].includes(node.name)&&
    (node.name==='img'||all(node,'img').length>0)&&
    text(node).replace(/\s/g,'')===all(node,'figcaption').map(text).join('').replace(/\s/g,'');
  function visit(parent){
    const children=parent.children??[],result=[];
    for(let i=0;i<children.length;){
      const child=children[i];
      if(!media(child)){if(child.children)visit(child);result.push(child);i++;continue;}
      let end=i+1;
      while(end<children.length&&(media(children[end])||children[end] instanceof Text&&!children[end].data.trim()))end++;
      const group=children.slice(i,end),count=group.filter(media).reduce((n,node)=>n+(node.name==='img'?1:all(node,'img').length),0);
      if(count<2){result.push(...group);i=end;continue;}
      const cards=group.map(node=>{
        if(!media(node))return serialize(node);
        const photos=node.name==='img'?[node]:all(node,'img');
        const captions=all(node,'figcaption').map(serialize).join('');
        return photos.map((img,index)=>{
          img.attribs.loading='lazy';img.attribs.decoding='async';
          return `<div class="col-sm-6 mb-30"><figure class="mb-0"><div class="gallery-img"><a class="image-popup" href="${safe(img.attribs.src)}" aria-label="Agrandir la photo : ${safe(img.attribs.alt||'CPMS')}">${serialize(img)}</a></div>${index===photos.length-1?captions:''}</figure></div>`;
        }).join('');
      }).join('');
      const gallery=documentFrom(`<div class="rs-gallery cpms-article-gallery" role="group" aria-label="Galerie photos de l’article"><div class="row">${cards}</div></div>`).children[0];
      result.push(gallery);i=end;
    }
    parent.children=result;result.forEach(node=>{node.parent=parent;});
  }
  visit(doc);return serialize(doc);
}
