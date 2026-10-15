// Tableau demandé, dans les conteneurs, titres et espacements Educavo existants.
export function subjectsTable({ paragraphs, rows, safe }) {
  return `<section id="matieres" class="rs-about style1 gray-bg pt-100 pb-100 md-pt-70 md-pb-70" aria-labelledby="subjects-title">
    <div class="container">
      <div class="sec-title mb-40">
        <div class="sub-title">Le cycle préparatoire</div>
        <h2 class="title mb-17" id="subjects-title">Les matières et leurs coefficients</h2>
        <div class="desc"><p>${safe(paragraphs[4])}</p><p>${safe(paragraphs[5])}</p></div>
      </div>
      <div class="table-responsive cpms-about-table-wrap"><table class="table table-striped cpms-about-table">
        <thead><tr><th scope="col">Matières enseignées</th><th scope="col">Coefficient<br>1ère année</th><th scope="col">Coefficient<br>2ème année</th></tr></thead>
        <tbody>${rows.map(row=>`<tr><th scope="row">${safe(row[0])}</th><td>${safe(row[1])}</td><td>${safe(row[2])}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>
  </section>`;
}
