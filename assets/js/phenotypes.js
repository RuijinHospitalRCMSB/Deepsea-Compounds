/* ══════════════════════════════════════════════════════
   Deep-Sea Compound Database — Phenotypes Browse
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var phenotypeData = [];

  var PHENOTYPE_COLORS = {
    'Anticancer': '#e53935',
    'Antimicrobial': '#2e7d32',
    'Anti-inflammatory': '#1565c0',
    'Enzyme Inhibition': '#6a1b9a',
    'Antioxidant': '#f9a825',
    'Antiviral': '#00897b',
    'Antiparasitic': '#d4532a',
    'Neuroprotective': '#00acc1',
    'Bioactivity (Generic)': '#78909c',
    'Other': '#bdbdbd',
  };

  function escapeHtml(t) { if (!t) return ''; var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function imgUrl(cid, smiles) {
    if (cid) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=' + cid + '&t=s';
    if (smiles) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?smiles=' + encodeURIComponent(smiles) + '&t=s';
    return '';
  }

  function init() {
    var grid = document.getElementById('phenotype-grid');
    var compoundsSection = document.getElementById('phenotype-compounds');
    var compoundList = document.getElementById('phenotype-compound-list');
    var catTitle = document.getElementById('phenotype-cat-title');
    var backBtn = document.getElementById('phenotype-back-btn');
    if (!grid) return;

    fetch('../assets/data/phenotypes.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        phenotypeData = data;
        renderCategoryGrid(grid, data);

        // Category card clicks
        grid.addEventListener('click', function (e) {
          var card = e.target.closest('.cat-card');
          if (!card) return;
          var cat = card.dataset.category;
          var catData = phenotypeData.find(function (d) { return d.category === cat; });
          if (!catData) return;
          grid.style.display = 'none';
          catTitle.textContent = cat + ' (' + catData.compound_count + ' entries)';
          renderCompoundList(compoundList, catData);
          compoundsSection.style.display = 'block';
          compoundsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Back button
        backBtn && backBtn.addEventListener('click', function () {
          compoundsSection.style.display = 'none';
          grid.style.display = '';
          grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      })
      .catch(function (err) {
        grid.innerHTML = '<div class="error-msg">Failed to load phenotype data</div>';
        console.error(err);
      });
  }

  function renderCategoryGrid(grid, data) {
    var html = '';
    data.forEach(function (d) {
      var color = PHENOTYPE_COLORS[d.category] || '#78909c';
      var subCats = (d.sub_categories || []).slice(0, 6).map(function (s) { return '<span class="mini-tag">' + escapeHtml(s) + '</span>'; }).join('');
      html += '<div class="cat-card" data-category="' + escapeHtml(d.category) + '" style="--cat-color:' + color + '">';
      html += '  <div class="cat-card-header" style="background:' + color + '20">';
      html += '    <span class="cat-card-icon">' + getCategoryIcon(d.category) + '</span>';
      html += '    <span class="cat-card-count">' + d.compound_count + '</span>';
      html += '  </div>';
      html += '  <h3 class="cat-card-title">' + escapeHtml(d.category) + '</h3>';
      if (subCats) html += '  <div class="cat-card-tags">' + subCats + '</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  function getCategoryIcon(cat) {
    var icons = {
      'Anticancer': '🔬',
      'Antimicrobial': '🦠',
      'Anti-inflammatory': '🩹',
      'Enzyme Inhibition': '⚗️',
      'Antioxidant': '🛡️',
      'Antiviral': '🧬',
      'Antiparasitic': '🪱',
      'Neuroprotective': '🧠',
      'Bioactivity (Generic)': '📋',
    };
    return icons[cat] || '🔬';
  }

  function renderCompoundList(list, catData) {
    var html = '';
    (catData.compounds || []).forEach(function (cpd) {
      var img = imgUrl(cpd.cid, cpd.smiles);
      html += '<a href="../1-Compounds/' + cpd.file + '" class="compound-row">';
      if (img) {
        html += '  <div class="cr-img"><img src="' + img + '" alt="" loading="lazy"></div>';
      } else {
        html += '  <div class="cr-img"><span class="cr-fallback">?</span></div>';
      }
      html += '  <div class="cr-info">';
      html += '    <div class="cr-name">' + escapeHtml(cpd.name) + '</div>';
      var metaParts = [];
      if (cpd.title && cpd.title !== cpd.name) metaParts.push(escapeHtml(cpd.title));
      if (cpd.cell_line) metaParts.push(escapeHtml(cpd.cell_line));
      if (cpd.ic50) metaParts.push(escapeHtml(cpd.ic50));
      if (cpd.pmid) metaParts.push('PMID: ' + cpd.pmid);
      if (metaParts.length) html += '    <div class="cr-meta">' + metaParts.join(' · ') + '</div>';
      html += '  </div>';
      html += '  <div class="cr-tags">';
      if (cpd.chemotype) html += '<span class="chemotype-tag" style="background:' + getCtColor(cpd.chemotype) + '20;color:' + getCtColor(cpd.chemotype) + '">' + escapeHtml(cpd.chemotype) + '</span>';
      html += '  </div>';
      html += '</a>';
    });
    list.innerHTML = html;
  }

  function getCtColor(ct) {
    var colors = {
      'Polyketide': '#1565c0', 'Alkaloid': '#2e7d32', 'Terpenoid': '#d4532a',
      'Peptide': '#6a1b9a', 'Phenylpropanoid': '#f9a825',
      'Polyketide-Peptide': '#00695c', 'Alkaloid-Peptide': '#4a148c',
    };
    return colors[ct] || '#78909c';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
