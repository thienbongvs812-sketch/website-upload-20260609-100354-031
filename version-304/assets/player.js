(function () {
  function initPlayer(root) {
    const video = root.querySelector('video');
    const overlay = root.querySelector('.player-overlay');
    const source = root.getAttribute('data-source');
    let attached = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      root.classList.add('is-starting');
      const start = function () {
        video.play().then(function () {
          root.classList.remove('is-starting');
          root.classList.add('is-playing');
          if (overlay) {
            overlay.hidden = true;
          }
        }).catch(function () {
          root.classList.remove('is-starting');
          if (overlay) {
            overlay.hidden = false;
          }
        });
      };

      if (video.readyState >= 2) {
        start();
      } else {
        video.addEventListener('canplay', start, { once: true });
        window.setTimeout(start, 180);
      }
    }

    attach();

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      root.classList.add('is-playing');
      if (overlay) {
        overlay.hidden = true;
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime <= 0 || video.ended) {
        root.classList.remove('is-playing');
        if (overlay) {
          overlay.hidden = false;
        }
      }
    });

    video.addEventListener('ended', function () {
      root.classList.remove('is-playing');
      if (overlay) {
        overlay.hidden = false;
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  });
})();
