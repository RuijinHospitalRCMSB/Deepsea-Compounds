/* ══════════════════════════════════════════════════════
   Deep-Sea Compound Database — Compounds Browse
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var compoundData = [];

  var CHEMOTYPE_COLORS = {
    'Polyketide': '#1565c0',
    'Alkaloid': '#2e7d32',
    'Terpenoid': '#d4532a',
    'Peptide': '#6a1b9a',
    'Phenylpropanoid': '#f9a825',
    'Polyketide-Peptide': '#00695c',
    'Alkaloid-Peptide': '#4a148c',
    'Azaphilone': '#00acc1',
    'Unclassified': '#bdbdbd',
    'Other': '#78909c',
  };

  function escapeHtml(t) { if (!t) return ''; var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function imgUrl(cid, smiles) {
    if (cid) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=' + cid + '&t=s';
    if (smiles) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?smiles=' + encodeURIComponent(smiles) + '&t=s';
    return '';
  }

  function getCtColor(ct) { return CHEMOTYPE_COLORS[ct] || '#78909c'; }

  function getChemotypeCounts(data) {
    var counts = {};
    data.forEach(function (c) {
      var ct = c.chemotype || 'Unclassified';
      counts[ct] = (counts[ct] || 0) + 1;
    });
    return Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; });
  }

  function init() {
    var list = document.getElementById('cpdGrid');
    var filters = document.getElementById('filterChips');
    var searchInput = document.getElementById('searchInput');
    var countEl = document.getElementById('resultCount');
    if (!list) return;

    fetch('../assets/data/compounds.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        compoundData = data;

        // Build chemotype filter chips
        var allChip = document.createElement('div');
        allChip.className = 'filter-chip active';
        allChip.dataset.chemotype = '';
        allChip.textContent = 'All (' + data.length + ')';
        filters.appendChild(allChip);

        var ctCounts = getChemotypeCounts(data);
        ctCounts.forEach(function (pair) {
          var chip = document.createElement('div');
          chip.className = 'filter-chip';
          chip.dataset.chemotype = pair[0];
          chip.textContent = pair[0] + ' (' + pair[1] + ')';
          filters.appendChild(chip);
        });

        // Filter chip clicks
        filters.addEventListener('click', function (e) {
          var chip = e.target.closest('.filter-chip');
          if (!chip) return;
          filters.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          var ct = chip.dataset.chemotype;
          var filtered = ct ? compoundData.filter(function (c) { return c.chemotype === ct; }) : compoundData;
          if (searchInput && searchInput.value.trim()) {
            var q = searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(function (c) {
              return c.name.toLowerCase().indexOf(q) !== -1 ||
                     (c.formula && c.formula.toLowerCase().indexOf(q) !== -1) ||
                     (c.smiles && c.smiles.toLowerCase().indexOf(q) !== -1);
            });
          }
          renderCompoundList(list, filtered);
          if (countEl) countEl.textContent = filtered.length;
        });

        // Search input
        searchInput && searchInput.addEventListener('input', function () {
          var q = this.value.trim().toLowerCase();
          var activeCt = filters.querySelector('.filter-chip.active');
          var ct = activeCt && activeCt.dataset.chemotype ? activeCt.dataset.chemotype : '';
          var filtered = ct ? compoundData.filter(function (c) { return c.chemotype === ct; }) : compoundData;
          if (q) {
            filtered = filtered.filter(function (c) {
              return c.name.toLowerCase().indexOf(q) !== -1 ||
                     (c.formula && c.formula.toLowerCase().indexOf(q) !== -1) ||
                     (c.smiles && c.smiles.toLowerCase().indexOf(q) !== -1);
            });
          }
          renderCompoundList(list, filtered);
          if (countEl) countEl.textContent = filtered.length;
        });

        // Initial render
        renderCompoundList(list, data);
        if (countEl) countEl.textContent = 'Browse all ' + data.length + ' deep-sea natural products';
      })
      .catch(function (err) {
        list.innerHTML = '<div class="error-msg">Failed to load compound data</div>';
        console.error(err);
      });
  }

  function renderCompoundList(list, compounds) {
    if (compounds.length === 0) {
      list.innerHTML = '<div class="empty-state">No compounds match your filter</div>';
      return;
    }
    var html = '';
    compounds.forEach(function (cpd) {
      var img = imgUrl(cpd.cid, cpd.smiles);
      var ctColor = getCtColor(cpd.chemotype);
      html += '<a href="../' + cpd.file + '" class="compound-row">';
      if (img) {
        html += '  <div class="cr-img"><img src="' + img + '" alt="" loading="lazy"></div>';
      } else {
        html += '  <div class="cr-img"><span class="cr-fallback">?</span></div>';
      }
      html += '  <div class="cr-info">';
      html += '    <div class="cr-name">' + escapeHtml(cpd.name) + '</div>';
      var metaParts = [];
      if (cpd.formula) metaParts.push(escapeHtml(cpd.formula));
      if (cpd.mw) metaParts.push(escapeHtml(cpd.mw));
      if (cpd.depth) metaParts.push(escapeHtml(cpd.depth));
      html += '    <div class="cr-meta">' + metaParts.join(' · ') + '</div>';
      html += '  </div>';
      html += '  <div class="cr-tags">';
      if (cpd.chemotype) html += '<span class="chemotype-tag" style="background:' + ctColor + '20;color:' + ctColor + '">' + escapeHtml(cpd.chemotype) + '</span>';
      if (cpd.sub_class) html += '<span class="mini-tag">' + escapeHtml(cpd.sub_class) + '</span>';
      html += '  </div>';
      html += '</a>';
    });
    list.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
