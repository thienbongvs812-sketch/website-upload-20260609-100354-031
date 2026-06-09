(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-video-src]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      var message = shell.querySelector('[data-player-message]');
      var source = shell.getAttribute('data-video-src');
      var hlsInstance = null;
      var prepared = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function prepare() {
        if (!video || !source || prepared) {
          return;
        }

        prepared = true;
        setMessage('播放源加载中');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('点击播放器继续播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage('播放源加载失败，请刷新后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('点击播放器继续播放');
            });
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {
            setMessage('当前浏览器需要启用 HLS 播放支持');
          });
        }
      }

      function start() {
        if (button) {
          button.classList.add('is-hidden');
        }
        prepare();
        if (video) {
          video.play().catch(function () {
            setMessage('点击播放器继续播放');
          });
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
          setMessage('');
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
