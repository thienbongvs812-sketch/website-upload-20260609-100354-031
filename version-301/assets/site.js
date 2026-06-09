(function () {
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
            return;
        }
        fn();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
        scopes.forEach(function (scope) {
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
            if (!cards.length) {
                return;
            }
            var input = scope.querySelector('[data-search-input]');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
            var empty = scope.querySelector('[data-empty-state]');
            function apply() {
                var term = normalize(input ? input.value : '');
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter-key')] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre')
                    ].join(' '));
                    var matched = true;
                    if (term && text.indexOf(term) === -1) {
                        matched = false;
                    }
                    Object.keys(filters).forEach(function (key) {
                        var value = filters[key];
                        var cardValue = normalize(card.getAttribute('data-' + key));
                        if (value && cardValue.indexOf(value) === -1) {
                            matched = false;
                        }
                    });
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    onReady(function () {
        initNavigation();
        initHero();
        initFilters();
    });
}());

function initMoviePlayer(streamUrl) {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
        return;
    }
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.play-cover');
    var started = false;
    var hls = null;
    function bind() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }
    function play() {
        bind();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }
    if (cover) {
        cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
        if (!started || video.paused) {
            play();
        }
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
