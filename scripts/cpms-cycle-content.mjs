import { documentFrom, all, text, serialize, one } from './editorial-dom.mjs';

export function cycleContent(record, engineer, safe, schoolPhoto) {
  const source=documentFrom(record.cleanHtml);
  const paragraphs=all(source,'p').filter(p=>text(p));
  const p=i=>serialize(paragraphs[i]);
  const heading=(tag,value,id='')=>`<${tag}${id?` id="${id}"`:''}>${safe(value)}</${tag}>`;
  const frame=html=>`<div class="content white-bg pt-30"><div class="course-overview"><div class="inner-box">${html}</div></div></div>`;
  const notice='<p>Ces informations sont reprises de l’ancien site du CPMS. Le secrétariat confirme les modalités et les données applicables à votre rentrée.</p>';
  let panels;
  if(engineer) {
    panels=[
      {label:'Présentation',html:heading('h4','Le cycle ingénieur')+p(0)+p(1)+p(2)+notice+'<p><a class="readon2" href="/qui-sommes-nous#ecoles-partenaires">Découvrir les écoles partenaires</a></p>'},
      {label:'Campus et métiers',html:heading('h4','Les campus et les métiers de l’ingénieur')+p(3)+`<figure class="mb-30"><img src="${schoolPhoto}" alt="Les étudiants de JUNIA France — photographie de l’ancien site CPMS" loading="lazy"></figure>`+'<p><a class="readon2" href="/domaines">Domaines de professionnalisation</a></p>'},
      {label:'Enseignements',html:heading('h4','Les enseignements et la dimension internationale')+p(4)+'<p><a class="readon2" href="/contact">Contacter le CPMS</a></p>'},
    ];
  } else {
    const images=all(source,'figure').filter(f=>one(f,'img'));
    const photo=i=>{
      const figure=documentFrom(serialize(images[i]));
      const image=one(figure,'img');
      const caption=one(figure,'figcaption');
      image.attribs.alt=text(caption)||'Le cursus au CPMS';
      image.attribs.loading='lazy';
      one(figure,'figure').attribs.class='mb-30';
      return serialize(figure);
    };
    const lists=all(source,'ul');
    const list=i=>`<ul class="review-list">${lists[i].children.map(serialize).join('')}</ul>`;
    const tableFigures=all(source,'figure').filter(f=>one(f,'table'));
    const tables=tableFigures.map((figure,i)=>{
      const table=one(figure,'table');
      const rows=all(table,'tr').map(row=>all(row,'td, th').map(text)).filter(row=>row.some(Boolean));
      const headers=rows[0].map((value,j)=>value||(j===0?'Frais concernés':''));
      const titles=['Frais administratifs et activités','Scolarité et échéancier','Double inscription JUNIA'];
      const extra=figure.children.filter(n=>n!==table).map(serialize).join('');
      return heading('h3',titles[i])+`<div class="table-responsive cpms-course-table-wrap mb-30" tabindex="0" role="region" aria-label="${titles[i]}"><table class="table table-striped cpms-course-table" data-cpms-fees="${i}"><thead><tr>${headers.map(h=>`<th scope="col">${safe(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map((cell,j)=>j===0?`<th scope="row">${safe(cell)}</th>`:`<td>${safe(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`+extra;
    }).join('');
    panels=[
      {label:'Présentation',html:heading('h4','Le cycle préparatoire')+p(0)+heading('h3',text(paragraphs[1]))+p(2)+photo(0)+'<p><a class="readon2" href="/qui-sommes-nous#matieres">Matières et coefficients</a></p>'},
      {label:'Pédagogie',html:heading('h4','Entraide et accompagnement')+p(3)+p(7)+p(8)+photo(3)+heading('h3','Un suivi tout au long de l’année')+p(17)+p(18)+p(19)},
      {label:'Stages et projets',html:heading('h4','Stages et projets')+heading('h3','Les stages académiques','stages')+p(4)+p(5)+p(6)+heading('h3','Les projets en équipe','projets')+p(9)+photo(1)+heading('h3',text(paragraphs[10]))+p(11)+p(12)+p(13)},
      {label:'Ressources',html:heading('h4','Les ressources numériques')+p(14)+p(15)+list(0)+photo(2)+heading('h3','Le suivi des parents')+p(16)+list(1)},
      {label:'Frais et tenue',html:heading('h4','Coûts et modalités des paiements au CPMS','frais')+'<p>Montants et échéances repris de l’ancien site. Contactez le secrétariat pour confirmer le barème applicable à votre rentrée.</p><p class="d-md-none"><small>Faites défiler les tableaux horizontalement pour voir toutes les colonnes.</small></p>'+tables+heading('h3','Tenue et équipements demandés','tenue')+list(2)+list(3)+list(4)},
    ];
  }
  return {panels:panels.map(panel=>({...panel,html:frame(panel.html)})),source,paragraphs};
}
