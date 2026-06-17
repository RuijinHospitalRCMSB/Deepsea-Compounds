/* ══════════════════════════════════════════════════════
   Deep-Sea Compound Database — Strains Browse & Detail
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var strains = [];
  var filteredStrains = [];

  // ── Helpers ──
  function getDepthColor(depth) {
    if (!depth) return '#78909c';
    var d = depth.toLowerCase();
    if (d.indexOf('hadal') !== -1) return '#3b1f7a';
    if (d.indexOf('deep') !== -1) return '#071a5e';
    if (d.indexOf('slope') !== -1) return '#0d47a1';
    return '#1565c0';
  }

  var CHEMOTYPE_COLORS = {
    'Polyketide': '#1565c0',
    'Alkaloid': '#2e7d32',
    'Terpenoid': '#d4532a',
    'Peptide': '#6a1b9a',
    'Phenylpropanoid': '#f9a825',
    'Polyketide-Peptide': '#00695c',
    'Alkaloid-Peptide': '#4a148c',
  };

  function getChemotypeColor(ct) {
    return CHEMOTYPE_COLORS[ct] || '#78909c';
  }

  function escapeHtml(text) {
    if (!text) return '';
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function imgUrl(cid, smiles, size) {
    size = size || 'l';
    if (cid) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=' + cid + '&t=' + size;
    if (smiles) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?smiles=' + encodeURIComponent(smiles) + '&t=' + size;
    return '';
  }

  function getGenusCounts(data) {
    var counts = {};
    data.forEach(function (s) {
      var g = s.genus || 'Unknown';
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; });
  }

  // ── Browse Page ──
  function initBrowse() {
    var grid = document.getElementById('strain-grid');
    var filters = document.getElementById('genus-filters');
    var searchInput = document.getElementById('strain-search');
    var countEl = document.getElementById('strain-count');
    if (!grid) return;

    fetch('../assets/data/strains.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        strains = data;
        filteredStrains = data;

        // Render genus filter chips
        var genusCounts = getGenusCounts(data);
        genusCounts.forEach(function (pair) {
          var chip = document.createElement('div');
          chip.className = 'filter-chip';
          chip.dataset.genus = pair[0];
          chip.textContent = pair[0] + ' (' + pair[1] + ')';
          filters.appendChild(chip);
        });

        // Chip click
        filters.addEventListener('click', function (e) {
          var chip = e.target.closest('.filter-chip');
          if (!chip) return;
          filters.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          var genus = chip.dataset.genus;
          filteredStrains = genus ? strains.filter(function (s) { return s.genus === genus; }) : strains;
          if (searchInput && searchInput.value.trim()) {
            var q = searchInput.value.trim().toLowerCase();
            filteredStrains = filteredStrains.filter(function (s) { return s.organism.toLowerCase().indexOf(q) !== -1; });
          }
          renderStrainGrid(grid, filteredStrains);
          if (countEl) countEl.textContent = filteredStrains.length + ' strains';
        });

        // Search
        if (searchInput) {
          searchInput.addEventListener('input', function () {
            var q = this.value.trim().toLowerCase();
            var activeGenus = filters.querySelector('.filter-chip.active');
            var genus = activeGenus ? activeGenus.dataset.genus : '';
            filteredStrains = genus ? strains.filter(function (s) { return s.genus === genus; }) : strains;
            if (q) filteredStrains = filteredStrains.filter(function (s) { return s.organism.toLowerCase().indexOf(q) !== -1; });
            renderStrainGrid(grid, filteredStrains);
            if (countEl) countEl.textContent = filteredStrains.length + ' strains';
          });
        }

        renderStrainGrid(grid, data);
        if (countEl) countEl.textContent = data.length + ' strains';
      })
      .catch(function (err) {
        grid.innerHTML = '<div class="error-msg">Failed to load strain data</div>';
        console.error(err);
      });
  }

  function renderStrainGrid(grid, data) {
    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state">No strains match your filter</div>';
      return;
    }

    var html = '';
    data.forEach(function (s) {
      var depthColor = getDepthColor(s.depths && s.depths[0]);
      var location = s.locations && s.locations[0] ? escapeHtml(s.locations[0]) : '';
      var sourceTypes = s.source_types && s.source_types.length > 0 ? s.source_types.join(', ') : '';
      var chemotypeTags = (s.chemotypes || []).slice(0, 3).map(function (ct) {
        return '<span class="mini-tag" style="background:' + getChemotypeColor(ct) + '20;color:' + getChemotypeColor(ct) + '">' + escapeHtml(ct) + '</span>';
      }).join('');

      html += '<a href="strain-detail.html?strain=' + encodeURIComponent(s.id) + '" class="strain-card">';
      html += '  <div class="strain-card-header">';
      html += '    <span class="strain-genus-label">' + escapeHtml(s.genus) + '</span>';
      html += '    <span class="strain-count-badge">' + s.compound_count + ' cpds</span>';
      html += '  </div>';
      html += '  <h3 class="strain-card-name"><i>' + escapeHtml(s.organism) + '</i></h3>';
      if (sourceTypes) html += '  <div class="strain-card-meta">' + escapeHtml(sourceTypes) + '</div>';
      if (location) html += '  <div class="strain-card-loc">' + location + '</div>';
      if (chemotypeTags) html += '  <div class="strain-card-tags">' + chemotypeTags + '</div>';
      html += '  <div class="strain-card-bar" style="background:' + depthColor + '"></div>';
      html += '</a>';
    });

    grid.innerHTML = html;
  }

  // ── Detail Page ──
  function initDetail() {
    var container = document.getElementById('strain-detail');
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var strainId = params.get('strain');
    if (!strainId) {
      container.innerHTML = '<div class="error-msg">No strain specified. <a href="browse-strains.html">Browse strains</a></div>';
      return;
    }

    fetch('../assets/data/strains.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var strain = data.find(function (s) { return s.id === strainId; });
        if (!strain) {
          // Try decoding
          strain = data.find(function (s) { return decodeURIComponent(strainId) === s.id; });
        }
        if (!strain) {
          container.innerHTML = '<div class="error-msg">Strain not found. <a href="browse-strains.html">Browse strains</a></div>';
          return;
        }
        renderStrainDetail(container, strain);
      })
      .catch(function (err) {
        container.innerHTML = '<div class="error-msg">Failed to load strain data</div>';
        console.error(err);
      });
  }

  function renderStrainDetail(container, strain) {
    var tax = strain.taxonomy || {};
    var taxKeys = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'];
    var depthColor = getDepthColor(strain.depths && strain.depths[0]);
    var location = strain.locations && strain.locations[0] ? escapeHtml(strain.locations[0]) : 'Unknown';
    var sourceTypes = strain.source_types && strain.source_types.length > 0 ? strain.source_types.join(', ') : 'Unknown';

    var html = '';

    // Hero
    html += '<div class="detail-hero">';
    html += '  <h1 class="detail-hero-title"><i>' + escapeHtml(strain.organism) + '</i></h1>';
    html += '  <span class="detail-hero-badge">' + escapeHtml(strain.genus) + '</span>';
    if (strain.depths && strain.depths[0]) {
      html += '  <span class="depth-tag" style="background:' + depthColor + '">' + escapeHtml(strain.depths[0]) + '</span>';
    }
    html += '</div>';

    // Taxonomy bar
    if (strain.taxonomy && Object.keys(strain.taxonomy).length > 0) {
      html += '<div class="taxonomy-bar">';
      taxKeys.forEach(function (rank) {
        if (tax[rank]) {
          html += '<div class="tax-item"><span class="tax-rank">' + rank + '</span><span class="tax-name">' + escapeHtml(tax[rank]) + '</span></div>';
        }
      });
      html += '</div>';
    }

    // Info cards row
    html += '<div class="info-row">';
    html += infoCard('🧫', 'Genus', escapeHtml(strain.genus));
    html += infoCard('🌍', 'Location', location);
    html += infoCard('🏷️', 'Source', escapeHtml(sourceTypes));
    if (strain.depths && strain.depths[0]) html += infoCard('🌊', 'Depth', escapeHtml(strain.depths[0]));
    html += infoCard('🧪', 'Compounds', String(strain.compound_count));
    html += '</div>';

    // External links
    html += '<div class="section-header"><h2>External Links</h2></div>';
    html += '<div class="info-row">';
    html += '<a href="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=' + encodeURIComponent(strain.organism) + '" target="_blank" rel="noopener" class="ext-link">NCBI Taxonomy ↗</a>';
    html += '<a href="https://maricius.strait.name/" target="_blank" rel="noopener" class="ext-link">MariClus ↗</a>';
    html += '<a href="https://www.gbif.org/search?q=' + encodeURIComponent(strain.organism) + '" target="_blank" rel="noopener" class="ext-link">GBIF ↗</a>';
    if (strain.genus) {
      html += '<a href="https://www.mycobank.org/search?q=' + encodeURIComponent(strain.genus) + '" target="_blank" rel="noopener" class="ext-link">MycoBank ↗</a>';
    }
    html += '</div>';

    // Compounds list
    html += '<div class="section-header"><h2>Associated Compounds (' + strain.compound_count + ')</h2></div>';
    html += '<div class="compound-list">';
    (strain.compounds || []).forEach(function (cpd) {
      html += compoundRow(cpd);
    });
    html += '</div>';

    container.innerHTML = html;
    document.title = strain.organism + ' — Deep-Sea Compound Database';
  }

  function infoCard(icon, label, value) {
    return '<div class="info-card"><div class="info-card-icon">' + icon + '</div><div class="info-card-label">' + label + '</div><div class="info-card-value">' + value + '</div></div>';
  }

  function compoundRow(cpd) {
    var img = imgUrl(cpd.cid, cpd.smiles, 's');
    var ctColor = getChemotypeColor(cpd.chemotype);
    var depthColor = getDepthColor(cpd.depth);
    var phenotypes = '';
    if (cpd.phenotypes && cpd.phenotypes.length > 0) {
      phenotypes = cpd.phenotypes.slice(0, 2).map(function (p) {
        return escapeHtml(p.title) + (p.ic50 ? ': ' + escapeHtml(p.ic50) : '');
      }).join('; ');
    }

    var html = '<a href="../' + cpd.file + '" class="compound-row">';
    if (img) {
      html += '  <div class="cr-img"><img src="' + img + '" alt="' + escapeHtml(cpd.name) + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<span class=\\\\\'cr-fallback\\\\\'>?</span>\'"></div>';
    } else {
      html += '  <div class="cr-img"><span class="cr-fallback">?</span></div>';
    }
    html += '  <div class="cr-info">';
    html += '    <div class="cr-name">' + escapeHtml(cpd.name) + '</div>';
    html += '    <div class="cr-meta">';
    if (cpd.formula) html += escapeHtml(cpd.formula);
    if (cpd.mw) html += ' · ' + escapeHtml(cpd.mw);
    html += '    </div>';
    if (phenotypes) html += '    <div class="cr-pheno">' + phenotypes + '</div>';
    html += '  </div>';
    html += '  <div class="cr-tags">';
    if (cpd.chemotype) {
      html += '    <span class="chemotype-tag" style="background:' + ctColor + '20;color:' + ctColor + '">' + escapeHtml(cpd.chemotype) + '</span>';
    }
    if (cpd.depth) {
      html += '    <span class="depth-dot" style="background:' + depthColor + '" title="' + escapeHtml(cpd.depth) + '"></span>';
    }
    html += '  </div>';
    html += '</a>';
    return html;
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initBrowse();
      initDetail();
    });
  } else {
    initBrowse();
    initDetail();
  }

})();
