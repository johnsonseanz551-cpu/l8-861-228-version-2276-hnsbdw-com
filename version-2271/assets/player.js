(function () {
    const card = document.querySelector("[data-hls]");
    if (!card) {
        return;
    }

    const video = card.querySelector("video");
    const overlay = card.querySelector(".play-overlay");
    const sourceUrl = card.getAttribute("data-hls");
    let attached = false;

    const attachSource = function () {
        if (attached || !video || !sourceUrl) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = sourceUrl;
    };

    const start = function () {
        attachSource();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    };

    if (overlay && video) {
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
    }
})();
