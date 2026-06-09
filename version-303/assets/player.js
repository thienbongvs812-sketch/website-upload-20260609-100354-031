import { H as Hls } from './video-player-dru42stk.js';

function bindPlayer(shell) {
  var video = shell.querySelector('video[data-hls]');
  var button = shell.querySelector('[data-player-start]');
  var hlsInstance = null;

  if (!video || !button) {
    return;
  }

  function startPlayback() {
    var source = video.getAttribute('data-hls');

    if (!source) {
      button.querySelector('strong').textContent = '暂无播放源';
      return;
    }

    if (!video.dataset.bound) {
      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            console.error('HLS fatal error:', data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }

      video.dataset.bound = 'true';
    }

    button.classList.add('is-hidden');
    video.play().catch(function () {
      button.classList.remove('is-hidden');
    });
  }

  button.addEventListener('click', startPlayback);
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(bindPlayer);
