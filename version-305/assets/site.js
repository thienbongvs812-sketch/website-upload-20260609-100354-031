(function () {
  var panel = document.querySelector(".mobile-panel");
  var toggle = document.querySelector(".mobile-toggle");
  if (panel && toggle) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.classList.add("image-missing");
    });
  });

  document.querySelectorAll(".global-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(value);
    });
  });

  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-go-slide]"));
    var index = 0;
    var timer = null;
    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    };
    var startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };
    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    };
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-go-slide")) || 0);
        restart();
      });
    });
    startTimer();
  }

  var grids = document.querySelectorAll(".filter-grid");
  grids.forEach(function (grid) {
    var section = grid.closest(".category-movies");
    if (!section) {
      return;
    }
    var input = section.querySelector(".page-filter-input");
    var typeSelect = section.querySelector(".page-filter-select");
    var sortSelect = section.querySelector(".page-sort-select");
    var empty = section.querySelector(".no-results");
    var originalCards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    var apply = function () {
      var query = input ? input.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;
      var cards = originalCards.slice();
      if (sortSelect && sortSelect.value !== "default") {
        cards.sort(function (a, b) {
          if (sortSelect.value === "year-desc") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (sortSelect.value === "year-asc") {
            return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
          }
          return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.meta, card.dataset.genre, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
        var typeMatch = !type || String(card.dataset.type || "").indexOf(type) !== -1;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var show = typeMatch && queryMatch;
        card.classList.toggle("hidden-card", !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", apply);
    }
  });

  var loadHls = function () {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector("script[data-hls-loader]");
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
      script.async = true;
      script.setAttribute("data-hls-loader", "1");
      script.addEventListener("load", function () {
        resolve(window.Hls);
      });
      script.addEventListener("error", reject);
      document.head.appendChild(script);
    });
  };

  document.querySelectorAll(".cinema-player").forEach(function (player) {
    var video = player.querySelector("video[data-stream]");
    var button = player.querySelector(".player-button");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var mounted = false;
    var mount = function () {
      if (mounted || !stream) {
        return Promise.resolve();
      }
      mounted = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = stream;
        }
      }).catch(function () {
        video.src = stream;
      });
    };
    var play = function () {
      mount().then(function () {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      });
    };
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("playing");
    });
    video.addEventListener("pause", function () {
      player.classList.remove("playing");
    });
  });

  var searchResults = document.getElementById("searchResults");
  var searchInput = document.getElementById("searchPageInput");
  if (searchResults && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (searchInput) {
      searchInput.value = initial;
    }
    var renderCard = function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.file + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
        '    <span class="poster-frame">',
        '      <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '      <span class="poster-overlay"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span></span>',
        '      <span class="poster-badge">' + escapeHtml(item.category) + '</span>',
        '      <span class="poster-time">' + escapeHtml(item.duration) + '</span>',
        '    </span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '  </div>',
        '</article>'
      ].join("");
    };
    var render = function (query) {
      var q = String(query || "").trim().toLowerCase();
      var intro = document.getElementById("searchIntro");
      if (!q) {
        searchResults.innerHTML = "";
        if (intro) {
          intro.textContent = "输入关键词后显示匹配影片。";
        }
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (item) {
        return item.text.indexOf(q) !== -1;
      }).slice(0, 120);
      searchResults.innerHTML = matched.length ? matched.map(renderCard).join("") : '<p class="no-results show">未找到相关影片</p>';
      if (intro) {
        intro.textContent = q ? "与“" + q + "”相关的影片。" : "输入关键词后显示匹配影片。";
      }
    };
    var escapeHtml = function (value) {
      return String(value || "").replace(/[&<>'"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[char];
      });
    };
    render(initial);
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        render(searchInput.value);
      });
    }
  }
})();
