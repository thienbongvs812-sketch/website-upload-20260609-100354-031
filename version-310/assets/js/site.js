(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var previous = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      if (previous) {
        previous.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-box]').forEach(function (box) {
      var input = box.querySelector('[data-filter-input]');
      var yearSelect = box.querySelector('[data-filter-year]');
      var typeSelect = box.querySelector('[data-filter-type]');
      var scope = box.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card], .rank-card'));

      function applyFilter() {
        var keyword = normalize(input ? input.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-filter-text'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear === year;
          var matchedType = !type || cardType.indexOf(type) !== -1 || text.indexOf(type) !== -1;
          card.classList.toggle('hidden', !(matchedKeyword && matchedYear && matchedType));
        });
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
    });

    var searchPage = document.querySelector('[data-search-page]');
    var searchData = window.MOVIE_SEARCH_DATA || [];

    if (searchPage && searchData.length) {
      var searchInput = searchPage.querySelector('[data-search-input]');
      var searchButton = searchPage.querySelector('[data-search-button]');
      var results = searchPage.querySelector('[data-search-results]');
      var url = new URL(window.location.href);
      var initialQuery = url.searchParams.get('q') || '';

      function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
          '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-shade"></span>',
          '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="movie-meta-line">',
          '      <span>' + escapeHtml(movie.region) + '</span>',
          '      <span>' + escapeHtml(movie.type) + '</span>',
          '    </div>',
          '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + tags + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }

      function render() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var list = searchData.filter(function (movie) {
          return !keyword || normalize(movie.searchText).indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (!results) {
          return;
        }

        if (!list.length) {
          results.innerHTML = '<div class="content-card"><h2>暂无匹配影片</h2><p>可以更换片名、地区、年份、类型或标签继续查找。</p></div>';
          return;
        }

        results.innerHTML = list.map(cardTemplate).join('');
      }

      if (searchInput) {
        searchInput.value = initialQuery;
        searchInput.addEventListener('input', render);
      }

      if (searchButton) {
        searchButton.addEventListener('click', render);
      }

      render();
    }
  });
})();
