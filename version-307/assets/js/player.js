document.addEventListener('DOMContentLoaded', function () {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');

    if (!video || !cover || !stream) {
      return;
    }

    function startVideo() {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      cover.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    cover.addEventListener('click', startVideo);
  });
});
