(function () {
  var data = window.MOVIE_SEARCH_DATA || [];
  var form = document.querySelector('[data-global-search-form]');
  var input = document.querySelector('#global-search-input');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');

  if (!form || !input || !results || !summary) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  input.value = initialQuery;

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function makeCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.href) + '">',
      '    <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'./assets/poster-fallback.svg\';">',
      '    <span class="poster-badge">' + escapeHtml(movie.score) + '</span>',
      '    <span class="poster-play">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><a class="category-chip" href="./category/' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
      '    <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.summary) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <div class="card-stats"><span>' + Number(movie.views).toLocaleString() + ' 次播放</span><span>' + escapeHtml(movie.duration) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function runSearch() {
    var query = input.value.trim();
    var queryLower = normalize(query);

    if (!queryLower) {
      results.innerHTML = '';
      summary.textContent = '请输入关键词开始搜索。';
      return;
    }

    var matched = data.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.type,
        movie.region,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.summary
      ].join(' '));

      return haystack.indexOf(queryLower) !== -1;
    }).slice(0, 160);

    results.innerHTML = matched.map(makeCard).join('');
    summary.textContent = '关键词“' + query + '”共找到 ' + matched.length + ' 条结果。';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = new URL(window.location.href);

    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }

    window.history.replaceState({}, '', url.toString());
    runSearch();
  });

  input.addEventListener('input', function () {
    window.clearTimeout(input.searchTimer);
    input.searchTimer = window.setTimeout(runSearch, 120);
  });

  runSearch();
})();
