document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var searchInput = document.querySelector('[data-live-search]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applySearch() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var category = normalize(categorySelect ? categorySelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchCategory = !category || normalize(card.getAttribute('data-category')) === category;
      var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
      var isVisible = matchQuery && matchCategory && matchYear;

      card.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-show', visibleCount === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', applySearch);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', applySearch);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applySearch);
  }

  applySearch();
});
