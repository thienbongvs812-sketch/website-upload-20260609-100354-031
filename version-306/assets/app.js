(function () {
  var hlsPromise = null;

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");
    scopes.forEach(function (scope) {
      var section = scope.parentElement;
      var cards = Array.from(section.querySelectorAll("[data-filter-card]"));
      var input = scope.querySelector("[data-filter-input]");
      var selects = Array.from(scope.querySelectorAll("[data-filter-select]"));

      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter-select");
        var values = Array.from(new Set(cards.map(function (card) {
          return card.dataset[key] || "";
        }).filter(Boolean))).sort(function (a, b) {
          if (key === "year") {
            return Number(b) - Number(a);
          }
          return a.localeCompare(b, "zh-Hans-CN");
        });
        values.forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      });

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selected = {};
        selects.forEach(function (select) {
          selected[select.getAttribute("data-filter-select")] = select.value;
        });
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(" ").toLowerCase();
          var matchText = !query || haystack.indexOf(query) !== -1;
          var matchSelect = Object.keys(selected).every(function (key) {
            return !selected[key] || card.dataset[key] === selected[key];
          });
          card.classList.toggle("is-hidden", !(matchText && matchSelect));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  function initPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play]");
      var state = box.querySelector(".player-state");
      if (!video || !button) {
        return;
      }
      var url = button.getAttribute("data-video") || "";

      function setState(text) {
        if (state) {
          state.textContent = text;
        }
      }

      function playNative() {
        video.src = url;
        return video.play();
      }

      function start() {
        button.disabled = true;
        setState("正在加载...");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          playNative().then(function () {
            box.classList.add("is-playing");
            setState("");
          }).catch(function () {
            button.disabled = false;
            setState("播放加载失败");
          });
          return;
        }
        getHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            if (video.hlsController) {
              video.hlsController.destroy();
            }
            var hls = new Hls({ enableWorker: true });
            video.hlsController = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().then(function () {
                box.classList.add("is-playing");
                setState("");
              }).catch(function () {
                button.disabled = false;
                setState("播放加载失败");
              });
            });
            hls.on(Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                button.disabled = false;
                setState("播放加载失败");
              }
            });
          } else {
            playNative().then(function () {
              box.classList.add("is-playing");
              setState("");
            }).catch(function () {
              button.disabled = false;
              setState("播放加载失败");
            });
          }
        }).catch(function () {
          playNative().then(function () {
            box.classList.add("is-playing");
            setState("");
          }).catch(function () {
            button.disabled = false;
            setState("播放加载失败");
          });
        });
      }

      button.addEventListener("click", start);
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove("is-playing");
          button.disabled = false;
        }
      });
    });
  }

  function renderSearch() {
    var results = document.getElementById("search-results");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("site-search-input");
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var items = window.SEARCH_INDEX.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 80);
    document.querySelectorAll(".fallback-hot").forEach(function (node) {
      node.style.display = "none";
    });
    if (!items.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配内容，换一个关键词试试。</div>';
      return;
    }
    results.innerHTML = items.map(function (item) {
      return '<article class="search-result-card">' +
        '<a href="./' + item.url + '"><img src="./' + item.cover + '" alt="' + escapeHtml(item.title) + '"></a>' +
        '<div><h2><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.genre) + '</p>' +
        '<p>' + escapeHtml(item.oneLine) + '</p></div>' +
      '</article>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[match];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initFilters();
    initPlayer();
    renderSearch();
  });
})();
