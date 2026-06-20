(function () {
    function playVideo(video) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                video.controls = true;
            });
        }
    }

    function setupPlayer(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var stream = player.getAttribute('data-stream');
        var hls = null;
        if (!video || !cover || !stream) {
            return;
        }

        function load() {
            if (video.getAttribute('data-ready') === 'true') {
                playVideo(video);
                return;
            }
            video.setAttribute('data-ready', 'true');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    playVideo(video);
                }, { once: true });
                playVideo(video);
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo(video);
                });
                return;
            }
            video.src = stream;
            playVideo(video);
        }

        function begin() {
            player.classList.add('is-playing');
            load();
        }

        cover.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(setupPlayer);
    });
})();
