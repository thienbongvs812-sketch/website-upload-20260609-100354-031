(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
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
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-page]').forEach(function (page) {
      var input = page.querySelector('[data-filter-input]');
      var year = page.querySelector('[data-filter-year]');
      var type = page.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
      var empty = page.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';

      if (input && q) {
        input.value = q;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags'),
            card.querySelector('p') ? card.querySelector('p').textContent : ''
          ].join(' '));
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matchedQuery = !query || text.indexOf(query) !== -1 || cardYear.indexOf(query) !== -1;
          var matchedYear = !selectedYear || cardYear === selectedYear;
          var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var matched = matchedQuery && matchedYear && matchedType;

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      if (year) {
        year.addEventListener('change', applyFilter);
      }

      if (type) {
        type.addEventListener('change', applyFilter);
      }

      var form = page.querySelector('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          applyFilter();
        });
      }

      applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var button = player.querySelector('[data-play]');
      var source = player.getAttribute('data-src');
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (attached || !video || !source) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          attached = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          attached = true;
          return;
        }

        video.src = source;
        attached = true;
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (video) {
          video.setAttribute('controls', 'controls');
          var playResult = video.play();
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      if (cover) {
        cover.addEventListener('click', function () {
          play();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
