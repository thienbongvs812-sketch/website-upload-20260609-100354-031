(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    const number = Number(value || 0);
    if (number >= 10000) {
      return (number / 10000).toFixed(1) + "万";
    }
    return number.toLocaleString("zh-CN");
  }

  function initMobileMenu() {
    const toggle = $("[data-mobile-toggle]");
    const panel = $("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
      document.body.classList.toggle("menu-open", panel.classList.contains("open"));
    });
  }

  function initSearchForms() {
    $$("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const query = input ? input.value.trim() : "";
        const target = form.getAttribute("action") || "./search.html";
        window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
      });
    });
  }

  function initHero() {
    const hero = $("[data-hero]");
    if (!hero) {
      return;
    }

    const slides = $$(".hero-slide", hero);
    const dots = $$("[data-hero-dot]", hero);
    const prev = $("[data-hero-prev]", hero);
    const next = $("[data-hero-next]", hero);
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length === 0) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilterLists() {
    $$('[data-filter-list]').forEach(function (section) {
      const input = $('[data-filter-text]', section);
      const sort = $('[data-filter-sort]', section);
      const year = $('[data-filter-year]', section);
      const cards = $$('.movie-card, .ranking-row', section);
      const list = $('[data-filter-items]', section);
      const count = $('[data-filter-count]', section);
      const gridButton = $('[data-view-grid]', section);
      const listButton = $('[data-view-list]', section);

      function apply() {
        const query = input ? input.value.trim().toLowerCase() : '';
        const yearValue = year ? year.value : '';
        let visible = 0;

        cards.forEach(function (card) {
          const haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.year
          ].join(' ').toLowerCase();
          const matchQuery = !query || haystack.includes(query);
          const matchYear = !yearValue || card.dataset.year === yearValue;
          const shouldShow = matchQuery && matchYear;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });

        if (sort && list) {
          const sorted = cards.slice().sort(function (a, b) {
            if (sort.value === 'likes') {
              return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
            }
            if (sort.value === 'year') {
              return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }
            if (sort.value === 'title') {
              return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
            }
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          });
          sorted.forEach(function (card) {
            list.appendChild(card);
          });
        }

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (sort) {
        sort.addEventListener('change', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (gridButton && listButton && list) {
        gridButton.addEventListener('click', function () {
          list.classList.remove('list-view');
          gridButton.classList.add('active');
          listButton.classList.remove('active');
        });
        listButton.addEventListener('click', function () {
          list.classList.add('list-view');
          listButton.classList.add('active');
          gridButton.classList.remove('active');
        });
      }
      apply();
    });
  }

  function renderSearchCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="./' + escapeHTML(movie.file) + '">',
      '  <article>',
      '    <div class="card-poster">',
      '      <img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '      <div class="card-hover"><span>▶</span></div>',
      '      <span class="card-duration">' + escapeHTML(movie.duration) + '</span>',
      '      <span class="card-category">' + escapeHTML(movie.category) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>' + escapeHTML(movie.title) + '</h3>',
      '      <p>' + escapeHTML(movie.oneLine) + '</p>',
      '      <div class="card-tags">' + tags + '</div>',
      '      <div class="card-meta">',
      '        <span>' + escapeHTML(movie.year) + '</span>',
      '        <span>' + escapeHTML(movie.region) + '</span>',
      '        <span>' + formatNumber(movie.views) + '次观看</span>',
      '      </div>',
      '    </div>',
      '  </article>',
      '</a>'
    ].join('');
  }

  function initSearchPage() {
    const results = $('#search-results');
    const input = $('#search-page-input');
    const count = $('#search-page-count');
    const sort = $('#search-page-sort');
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
    }

    function getFiltered() {
      const query = input ? input.value.trim().toLowerCase() : '';
      let data = window.MOVIE_SEARCH_DATA.slice();

      if (query) {
        data = data.filter(function (movie) {
          return [
            movie.title,
            movie.region,
            movie.type,
            movie.genre,
            movie.category,
            (movie.tags || []).join(' '),
            movie.oneLine
          ].join(' ').toLowerCase().includes(query);
        });
      } else {
        data = data.sort(function (a, b) {
          return Number(b.views || 0) - Number(a.views || 0);
        }).slice(0, 120);
      }

      if (sort) {
        data.sort(function (a, b) {
          if (sort.value === 'likes') {
            return Number(b.likes || 0) - Number(a.likes || 0);
          }
          if (sort.value === 'year') {
            return Number(b.year || 0) - Number(a.year || 0);
          }
          if (sort.value === 'title') {
            return String(a.title || '').localeCompare(String(b.title || ''), 'zh-CN');
          }
          return Number(b.views || 0) - Number(a.views || 0);
        });
      }

      return data;
    }

    function render() {
      const data = getFiltered();
      results.innerHTML = data.length ? data.map(renderSearchCard).join('') : '<div class="empty-state">没有找到匹配影片</div>';
      if (count) {
        count.textContent = '找到 ' + data.length + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', render);
    }
    if (sort) {
      sort.addEventListener('change', render);
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initFilterLists();
    initSearchPage();
  });
})();
