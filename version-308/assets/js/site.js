(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initScrollButtons();
  });

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var region = scope.querySelector('[data-filter-region]');
      var category = scope.querySelector('[data-filter-category]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('[data-empty-state]');

      function filter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        var categoryValue = category ? category.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && card.getAttribute('data-type') !== typeValue) {
            matched = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            matched = false;
          }
          if (regionValue && card.getAttribute('data-region') !== regionValue) {
            matched = false;
          }
          if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, year, region, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', filter);
          control.addEventListener('change', filter);
        }
      });
      filter();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var src = player.getAttribute('data-src');
      var startButton = player.querySelector('.video-start');
      var playButton = player.querySelector('[data-play-toggle]');
      var muteButton = player.querySelector('[data-mute-toggle]');
      var fullscreenButton = player.querySelector('[data-fullscreen-toggle]');
      if (!video || !src) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      function togglePlay(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (video.paused) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }

      function updatePlayState() {
        var playing = !video.paused;
        player.classList.toggle('is-playing', playing);
        if (playButton) {
          playButton.textContent = playing ? '暂停' : '播放';
        }
      }

      video.addEventListener('play', updatePlayState);
      video.addEventListener('pause', updatePlayState);
      video.addEventListener('click', togglePlay);
      if (startButton) {
        startButton.addEventListener('click', togglePlay);
      }
      if (playButton) {
        playButton.addEventListener('click', togglePlay);
      }
      if (muteButton) {
        muteButton.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
      }
      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
      updatePlayState();
    });
  }

  function initScrollButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        var player = document.querySelector('.video-player');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var startButton = player.querySelector('.video-start');
          if (startButton) {
            window.setTimeout(function () {
              startButton.focus();
            }, 350);
          }
        }
      });
    });
  }
})();
