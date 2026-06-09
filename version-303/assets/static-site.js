(function () {
  var menuButton = document.querySelector('[data-mobile-menu]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    var keywordInput = filterScope.querySelector('[data-filter-keyword]');
    var yearSelect = filterScope.querySelector('[data-filter-year]');
    var typeSelect = filterScope.querySelector('[data-filter-type]');
    var grid = document.querySelector('[data-filter-grid]');
    var counter = filterScope.querySelector('[data-filter-count]');
    var cards = grid ? Array.prototype.slice.call(grid.children) : [];

    function fillOptions(select, attr) {
      if (!select || select.children.length > 1) {
        return;
      }

      var values = cards.map(function (card) {
        return card.getAttribute(attr) || '';
      }).filter(Boolean).filter(function (value, index, array) {
        return array.indexOf(value) === index;
      }).sort(function (a, b) {
        return b.localeCompare(a, 'zh-Hans-CN', { numeric: true });
      });

      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillOptions(yearSelect, 'data-year');
    fillOptions(typeSelect, 'data-type');

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var yearOk = !year || card.getAttribute('data-year') === year;
        var typeOk = !type || card.getAttribute('data-type') === type;
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var ok = yearOk && typeOk && keywordOk;

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = visible;
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
