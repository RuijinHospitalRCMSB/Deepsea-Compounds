/* ══════════════════════════════════════════════════════
   Deep-Sea Compound Database — Chemotypes Browse
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var chemotypeData = [];
  var CT_COLORS = {
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

  function init() {
    var treeList = document.getElementById('tree-list');
    var compoundSection = document.getElementById('chemotype-compounds');
    var compoundList = document.getElementById('chemotype-compound-list');
    var sectionTitle = document.getElementById('chemotype-section-title');
    var backBtn = document.getElementById('chemotype-back-btn');
    if (!treeList) return;

    fetch('../assets/data/chemotypes.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        chemotypeData = data;
        renderSunburst(data);
        renderTree(data, treeList);

        // Tree item clicks → show compounds
        treeList.addEventListener('click', function (e) {
          var item = e.target.closest('.tree-item');
          if (!item) return;
          var ctName = item.dataset.chemotype;
          var subClass = item.dataset.subclass;
          var ctData = chemotypeData.find(function (d) { return d.name === ctName; });
          if (!ctData) return;

          var compounds = ctData.compounds;
          if (subClass) {
            compounds = compounds.filter(function (c) { return c.sub_class === subClass; });
          }
          sectionTitle.textContent = (subClass || ctName) + ' (' + compounds.length + ' compounds)';
          renderCompoundList(compoundList, compounds);
          compoundSection.style.display = 'block';
          compoundSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        backBtn && backBtn.addEventListener('click', function () {
          compoundSection.style.display = 'none';
          document.querySelector('.chart-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      })
      .catch(function (err) {
        treeList.innerHTML = '<div class="error-msg">Failed to load chemotype data</div>';
        console.error(err);
      });
  }

  // ── Sunburst SVG ──
  function renderSunburst(data) {
    var svg = document.getElementById('sunburst-svg');
    if (!svg) return;

    var total = data.reduce(function (sum, d) { return sum + d.compound_count; }, 0);
    if (total === 0) return;

    var cx = 200, cy = 200;
    var innerR = 50, outerR = 180;
    var ringHeight = (outerR - innerR) / 2;
    var startAngle = -Math.PI / 2;

    var namespaces = [];
    // Level 1: each chemotype
    data.forEach(function (d) {
      var pct = d.compound_count / total;
      var angle = pct * 2 * Math.PI;
      namespaces.push({ name: d.name, count: d.compound_count, angle: angle, subItems: [] });
    });

    // Clear tooltip
    var tooltip = document.getElementById('sunburst-tooltip');

    function drawArc(cx, cy, r0, r1, a0, a1, color, label, count) {
      var x0 = cx + r0 * Math.cos(a0);
      var y0 = cy + r0 * Math.sin(a0);
      var x1 = cx + r1 * Math.cos(a0);
      var y1 = cy + r1 * Math.sin(a0);
      var x2 = cx + r1 * Math.cos(a1);
      var y2 = cy + r1 * Math.sin(a1);
      var x3 = cx + r0 * Math.cos(a1);
      var y3 = cy + r0 * Math.sin(a1);
      var largeArc = (a1 - a0) > Math.PI ? 1 : 0;

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      var d = 'M ' + x0 + ',' + y0 +
              ' L ' + x1 + ',' + y1 +
              ' A ' + r1 + ',' + r1 + ' 0 ' + largeArc + ',1 ' + x2 + ',' + y2 +
              ' L ' + x3 + ',' + y3 +
              ' A ' + r0 + ',' + r0 + ' 0 ' + largeArc + ',0 ' + x0 + ',' + y0 + ' Z';
      path.setAttribute('d', d);
      path.setAttribute('fill', color);
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '1.5');
      path.style.cursor = 'pointer';
      path.style.transition = 'opacity 0.2s';
      path.addEventListener('mouseenter', function () {
        path.style.opacity = '0.8';
        var midAngle = (a0 + a1) / 2;
        var tipR = (r0 + r1) / 2;
        var tipX = cx + tipR * Math.cos(midAngle);
        var tipY = cy + tipR * Math.sin(midAngle);
        tooltip.textContent = label + ': ' + count + ' compounds';
        tooltip.style.left = Math.min(Math.max(tipX, 20), 380) + 'px';
        tooltip.style.top = Math.min(Math.max(tipY - 20, 10), 380) + 'px';
        tooltip.style.display = 'block';
      });
      path.addEventListener('mouseleave', function () {
        path.style.opacity = '1';
        tooltip.style.display = 'none';
      });
      path.addEventListener('click', function () {
        // Trigger tree item click
        var treeItems = document.querySelectorAll('.tree-item');
        for (var i = 0; i < treeItems.length; i++) {
          if (treeItems[i].dataset.chemotype === label && !treeItems[i].dataset.subclass) {
            treeItems[i].click();
            break;
          }
        }
      });
      svg.appendChild(path);
    }

    // Draw level 1 (main chemotype rings)
    var a0 = startAngle;
    namespaces.forEach(function (ns) {
      var a1 = a0 + ns.angle;
      var color = CT_COLORS[ns.name] || '#78909c';
      drawArc(cx, cy, innerR, innerR + ringHeight, a0, a1, color, ns.name, ns.count);
      a0 = a1;
    });

    // Draw level 2 (sub-class rings)
    a0 = startAngle;
    data.forEach(function (d) {
      var pct = d.compound_count / total;
      var mainAngle = pct * 2 * Math.PI;
      var subClasses = Object.entries(d.sub_classes || {});
      if (subClasses.length === 0) {
        // Empty sub-class: draw placeholder
        var color = CT_COLORS[d.name] || '#78909c';
        drawArc(cx, cy, innerR + ringHeight + 1, outerR, a0, a0 + mainAngle, color + '40', d.name + ' / other', d.compound_count);
      } else {
        var subA0 = a0;
        subClasses.forEach(function (pair) {
          var subName = pair[0];
          var subCount = pair[1];
          var subAngle = (subCount / total) * 2 * Math.PI;
          var subA1 = subA0 + subAngle;
          var color = CT_COLORS[d.name] || '#78909c';
          drawArc(cx, cy, innerR + ringHeight + 1, outerR, subA0, subA1, color + '60', d.name + ' / ' + subName, subCount);
          subA0 = subA1;
        });
        // Fill remaining
        if (subA0 < a0 + mainAngle) {
          drawArc(cx, cy, innerR + ringHeight + 1, outerR, subA0, a0 + mainAngle, '#e0e0e0', d.name + ' / other', 0);
        }
      }
      a0 = a0 + mainAngle;
    });

    // Center label
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy - 6);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '22');
    text.setAttribute('font-weight', '700');
    text.setAttribute('fill', 'var(--text-primary)');
    text.textContent = total;
    svg.appendChild(text);

    var text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text2.setAttribute('x', cx);
    text2.setAttribute('y', cy + 14);
    text2.setAttribute('text-anchor', 'middle');
    text2.setAttribute('font-size', '11');
    text2.setAttribute('fill', 'var(--text-secondary)');
    text2.textContent = 'compounds';
    svg.appendChild(text2);
  }

  // ── Tree Navigation ──
  function renderTree(data, container) {
    var html = '';
    data.forEach(function (d) {
      var color = CT_COLORS[d.name] || '#78909c';
      html += '<div class="tree-item" data-chemotype="' + escapeHtml(d.name) + '">';
      html += '  <span class="tree-bullet" style="background:' + color + '"></span>';
      html += '  <span class="tree-name">' + escapeHtml(d.name) + '</span>';
      html += '  <span class="tree-count">' + d.compound_count + '</span>';
      html += '</div>';
      var subClasses = Object.entries(d.sub_classes || {});
      if (subClasses.length > 0) {
        html += '<div class="tree-children">';
        subClasses.forEach(function (pair) {
          html += '<div class="tree-item tree-sub" data-chemotype="' + escapeHtml(d.name) + '" data-subclass="' + escapeHtml(pair[0]) + '">';
          html += '  <span class="tree-bullet tree-bullet-sub" style="background:' + color + '60"></span>';
          html += '  <span class="tree-name">' + escapeHtml(pair[0]) + '</span>';
          html += '  <span class="tree-count">' + pair[1] + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }
    });
    container.innerHTML = html;
  }

  // ── Compound List ──
  function renderCompoundList(list, compounds) {
    var html = '';
    compounds.forEach(function (cpd) {
      var img = imgUrl(cpd.cid, cpd.smiles);
      var ctColor = CT_COLORS[cpd.chemotype] || '#78909c';
      html += '<a href="../' + cpd.file + '" class="compound-row">';
      if (img) {
        html += '  <div class="cr-img"><img src="' + img + '" alt="" loading="lazy" ></div>';
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
