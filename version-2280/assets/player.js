
import { H as Hls } from './hls-vendor-dru42stk.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-overlay');
    const sourceNode = video ? video.querySelector('source') : null;
    const sourceUrl = sourceNode ? sourceNode.getAttribute('src') : '';
    let ready = false;

    const attach = function () {
        if (!video || !sourceUrl || ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            ready = true;
            return;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            player.hls = hls;
            ready = true;
            return;
        }

        video.src = sourceUrl;
        ready = true;
    };

    const start = function () {
        attach();
        if (button) {
            button.classList.add('is-hidden');
        }
        if (video) {
            video.setAttribute('controls', 'controls');
            const playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }
    };

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
        });
    }
});
