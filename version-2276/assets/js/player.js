(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");
        var configNode = document.getElementById("video-config");
        var attached = false;
        var hlsInstance = null;

        if (!video || !configNode) {
            return;
        }

        var config = {};
        try {
            config = JSON.parse(configNode.textContent || "{}");
        } catch (error) {
            config = {};
        }

        function attach() {
            if (attached || !config.source) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(config.source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = config.source;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("hide");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("hide");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hide");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
