/* ══════════════════════════════════════════════════════
   Deep-Sea Compound Database — Homepage Dashboard
   Uses inline data (COMPOUNDS_DATA + CHEMOTYPES_DATA)
   with fetch() fallback for HTTP server mode.
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var CT_COLORS = {
    'Polyketide': '#1565c0', 'Alkaloid': '#2e7d32', 'Terpenoid': '#d4532a',
    'Peptide': '#6a1b9a', 'Phenylpropanoid': '#f9a825',
    'Polyketide-Peptide': '#00695c', 'Alkaloid-Peptide': '#4a148c',
    'Azaphilone': '#00acc1', 'Unclassified': '#bdbdbd', 'Other': '#78909c',
  };

  var DEPTH_COLORS = {
    'Shallow': '#1565c0', 'Slope': '#0d47a1', 'Deep': '#071a5e', 'Hadal': '#3b1f7a',
  };

  function escapeHtml(t) { if (!t) return ''; var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function imgUrl(cid, smiles) {
    if (cid) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=' + cid + '&t=s';
    if (smiles) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?smiles=' + encodeURIComponent(smiles) + '&t=s';
    return '';
  }

  function showStatsOnly(inv) {
    if (!inv) return;
    document.getElementById('stat-compounds').textContent = inv.total_compounds;
    document.getElementById('stat-bioactive').textContent = inv.total_phenotype_entries;
    document.getElementById('stat-interactions').textContent = inv.total_target_entries;
    document.getElementById('stat-strains').textContent = inv.unique_strains;
    document.getElementById('stat-refs').textContent = inv.unique_references;
  }

  function loadData() {
    var inv = window.INVENTORY_DATA;

    // Use inline data if available (works in file:// mode)
    if (window.COMPOUNDS_DATA && window.CHEMOTYPES_DATA) {
      var compounds = window.COMPOUNDS_DATA;
      var chemotypes = window.CHEMOTYPES_DATA;

      if (inv) {
        document.getElementById('stat-compounds').textContent = inv.total_compounds;
        document.getElementById('stat-bioactive').textContent = inv.total_phenotype_entries;
        document.getElementById('stat-interactions').textContent = inv.total_target_entries;
        document.getElementById('stat-strains').textContent = inv.unique_strains;
        document.getElementById('stat-chemotypes').textContent = chemotypes.length;
        document.getElementById('stat-refs').textContent = inv.unique_references;
      }

      // Chemotype chart
      renderBarChart(chemotypes, 'chemotype-chart', 'name', 'compound_count', CT_COLORS);

      // Depth chart
      var depthCounts = {};
      compounds.forEach(function (c) {
        var d = c.depth || 'Unknown';
        depthCounts[d] = (depthCounts[d] || 0) + 1;
      });
      renderDepthChart(depthCounts, 'depth-chart');

      // Latest compounds (last 15)
      var latest = compounds.slice(-15).reverse();
      renderCompoundList(latest, 'latest-compounds');
      return;
    }

    // Fallback: fetch via HTTP (server mode)
    Promise.all([
      fetch('assets/data/compounds.json').then(function (r) { return r.json(); }),
      fetch('assets/data/strains.json').then(function (r) { return r.json(); }),
      fetch('assets/data/targets.json').then(function (r) { return r.json(); }),
      fetch('assets/data/chemotypes.json').then(function (r) { return r.json(); }),
    ])
    .then(function (results) {
      var compounds = results[0];
      var chemotypes = results[3];

      if (inv) {
        document.getElementById('stat-compounds').textContent = inv.total_compounds;
        document.getElementById('stat-bioactive').textContent = inv.total_phenotype_entries;
        document.getElementById('stat-interactions').textContent = inv.total_target_entries;
        document.getElementById('stat-strains').textContent = inv.unique_strains;
        document.getElementById('stat-chemotypes').textContent = chemotypes.length;
        document.getElementById('stat-refs').textContent = inv.unique_references;
      }

      renderBarChart(chemotypes, 'chemotype-chart', 'name', 'compound_count', CT_COLORS);

      var depthCounts = {};
      compounds.forEach(function (c) {
        var d = c.depth || 'Unknown';
        depthCounts[d] = (depthCounts[d] || 0) + 1;
      });
      renderDepthChart(depthCounts, 'depth-chart');

      var latest = compounds.slice(-15).reverse();
      renderCompoundList(latest, 'latest-compounds');
    })
    .catch(function () {
      // Last resort: stats only
      showStatsOnly(inv);
    });
  }

  function renderBarChart(data, containerId, nameKey, valueKey, colorMap) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var maxVal = Math.max.apply(null, data.map(function (d) { return d[valueKey]; }));

    var html = '';
    data.forEach(function (d) {
      var pct = (d[valueKey] / maxVal) * 100;
      var color = colorMap[d[nameKey]] || '#78909c';
      html += '<div class="bar-row">';
      html += '  <span class="bar-label">' + escapeHtml(d[nameKey]) + '</span>';
      html += '  <div class="bar-track">';
      html += '    <div class="bar-fill" style="width:' + pct + '%;background:' + color + '"></div>';
      html += '  </div>';
      html += '  <span class="bar-value">' + d[valueKey] + '</span>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  function renderDepthChart(depthCounts, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var order = ['Shallow', 'Slope', 'Deep', 'Hadal'];
    var items = order.filter(function (d) { return depthCounts[d]; }).map(function (d) {
      return { name: d, count: depthCounts[d], color: DEPTH_COLORS[d] || '#78909c' };
    });
    Object.keys(depthCounts).forEach(function (d) {
      if (order.indexOf(d) === -1) {
        items.push({ name: d, count: depthCounts[d], color: '#78909c' });
      }
    });

    var maxVal = Math.max.apply(null, items.map(function (i) { return i.count; }));

    var html = '';
    items.forEach(function (item) {
      var pct = (item.count / maxVal) * 100;
      html += '<div class="bar-row">';
      html += '  <span class="bar-label">' + escapeHtml(item.name) + '</span>';
      html += '  <div class="bar-track">';
      html += '    <div class="bar-fill" style="width:' + pct + '%;background:' + item.color + '"></div>';
      html += '  </div>';
      html += '  <span class="bar-value">' + item.count + '</span>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  function renderCompoundList(compounds, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!compounds || compounds.length === 0) {
      container.innerHTML = '<div class="emp