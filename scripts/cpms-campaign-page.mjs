import assert from 'node:assert/strict';
import { documentFrom, all, text } from './editorial-dom.mjs';
import { locationNotice } from './cpms-contact-details.mjs';

/** Présentation lisible des pièces et du calendrier issus de la campagne WP. */
export function campaignContent(record,safe) {
  const source=documentFrom(record.cleanHtml),lists=all(source,'ul');
  const documents=all(lists[0],'li').map(item=>text(item).replace(/^\d+\)\s*/, '').replace(/\s*;$/, '').trim());
  const dates=all(lists[1],'li').map(item=>{
    const original=text(item).replace(/^\*\s*/,''),colon=original.indexOf(':');
    assert(colon>0,'Chaque étape du calendrier doit garder sa date.');
    return {
      label:original.slice(0,colon).trim().replace(/1\s+er/g,'1er').replace(/([234])\s+ème/g,'$1e').replace(/1\s+ère/g,'1re').replace(/Test/g,'test'),
      date:original.slice(colon+1).trim(),
    };
  });
  assert.equal(documents.length,6);assert.equal(dates.length,8);
  const html=`<p>La candidature s’adresse aux élèves de Terminales C, D et E.</p>
    <h3 class="mb-20">Déposer votre dossier</h3>
    <p>Envoyez votre dossier à <a href="mailto:contact@cpms.education">contact@cpms.education</a> ou déposez-le directement au CPMS.</p>
    ${locationNotice()}
    <h3 class="mb-20">Les pièces à fournir</h3>
    <ol class="cpms-campaign-documents">${documents.map(value=>`<li>${safe(value)}</li>`).join('')}</ol>
    <p>Les dossiers sont attendus jusqu’au <strong>11 septembre 2026</strong>.</p>
    <h3 class="mb-20" id="calendrier-rentree">Calendrier de la rentrée 2026-2027</h3>
    <div class="table-responsive"><table class="table cpms-campaign-calendar" aria-labelledby="calendrier-rentree"><thead><tr><th scope="col">Étape</th><th scope="col">Date</th></tr></thead><tbody>${dates.map(row=>`<tr><td>${safe(row.label)}</td><td>${safe(row.date)}</td></tr>`).join('')}</tbody></table></div>
    <p>Les places étant limitées, aucun dossier ne sera accepté après le dernier test.</p>
    <h3 class="mb-20">Besoin d’informations ?</h3>
    <p>Le secrétariat vous renseigne au <a href="tel:+2290162721072">+229 01 62 72 10 72</a> (appel ou WhatsApp) ou au <a href="tel:+2290149141277">+229 01 49 14 12 77</a> (appel uniquement).</p>`;
  const result=documentFrom(html);
  assert.deepEqual(all(result,'.cpms-campaign-documents li').map(text),documents,'Conserver les six pièces du dossier.');
  assert.deepEqual(all(result,'tbody tr').map(row=>text(all(row,'td')[1])),dates.map(row=>row.date),'Conserver toutes les dates du calendrier.');
  return html;
}
