/* ══════════════════════════════════════════════════════
   Deep-Sea Compound Database — Global JavaScript
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var themeToggle = document.getElementById('theme-toggle');
  var htmlEl = document.documentElement;

  function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      htmlEl.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.textContent = '☀️';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = htmlEl.getAttribute('data-theme') === 'dark';
      htmlEl.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
      this.textContent = isDark ? '🌙' : '☀️';
    });
  }

  initTheme();

  var navToggle = document.getElementById('nav-toggle');
  var sidebar = document.getElementById('sidebar');

  if (navToggle && sidebar) {
    navToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      document.body.classList.toggle('nav-open');
    });
    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 900 &&
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          e.target !== navToggle) {
        sidebar.classList.remove('open');
        document.body.classList.remove('nav-open');
      }
    });
  }

  var progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (link) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  document.addEventListener('error', function (e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.cr-img')) {
      e.target.style.display = 'none';
    }
  }, true);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var text = btn.getAttribute('data-copy') || btn.previousElementSibling && btn.previousElementSibling.textContent;
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    }
  });

  function loadFuse(callback) {
    if (window.Fuse) { callback(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/7.0.0/fuse.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  var searchData = null;
  var fuse = null;

  function initSearch() {
    var searchInput = document.getElementById('global-search');
    var searchResults = document.getElementById('search-results');
    if (!searchInput || !searchResults) return;

    loadFuse(function () {
      var jsonPath = window.location.pathname.indexOf('/pages/') !== -1 ? '../assets/data/compounds.json' : 'assets/data/compounds.json';
      fetch(jsonPath)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          searchData = data;
          fuse = new Fuse(data, {
            keys: [
              { name: 'name', weight: 3 },
              { name: 'smiles', weight: 1 },
              { name: 'formula', weight: 1 },
              { name: 'chemotype', weight: 1.5 },
            ],
            threshold: 0.4,
            includeScore: true,
          });
        })
        .catch(function () { console.warn('Search data not available'); });
    });

    searchInput.addEventListener('input', function () {
      var query = this.value.trim();
      searchResults.innerHTML = '';
      if (!query || !fuse) {
        searchResults.classList.remove('active');
        return;
      }
      var results = fuse.search(query, { limit: 15 });
      if (results.length === 0) {
        searchResults.classList.remove('active');
        return;
      }
      searchResults.classList.add('active');
      results.forEach(function (r) {
        var item = r.item;
        var link = document.createElement('a');
        link.className = 'search-result-item';
        link.href = window.location.pathname.indexOf('/pages/') !== -1 ? '../' + item.file : item.file;
        var nameSpan = document.createElement('span');
        nameSpan.className = 'sr-name';
        nameSpan.textContent = item.name;
        var metaSpan = document.createElement('span');
        metaSpan.className = 'sr-meta';
        metaSpan.textContent = [item.formula, item.chemotype].filter(Boolean).join(' · ');
        link.appendChild(nameSpan);
        link.appendChild(metaSpan);
        searchResults.appendChild(link);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-container')) {
        searchResults.classList.remove('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }

})();
