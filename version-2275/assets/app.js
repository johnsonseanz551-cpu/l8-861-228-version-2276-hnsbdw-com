(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
        });
    }

    function initGlobalSearch() {
        document.querySelectorAll('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(text) {
        return (text || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-root]').forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('.filter-card'));
            var empty = root.querySelector('[data-empty-state]');
            var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-value]'));
            var chipValue = '';
            if (root.hasAttribute('data-search-page')) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q') || '';
                if (input && query) {
                    input.value = query;
                }
            }
            function applyFilter() {
                var query = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search') || card.textContent);
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesChip = !chipValue || haystack.indexOf(normalize(chipValue)) !== -1;
                    var show = matchesQuery && matchesChip;
                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', applyFilter);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chipValue = chip.getAttribute('data-filter-value') || '';
                    chips.forEach(function (item) {
                        item.classList.toggle('active', item === chip);
                    });
                    applyFilter();
                });
            });
            applyFilter();
        });
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing-image');
            });
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var source = player.getAttribute('data-src');
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var hlsInstance = null;
            var prepared = false;
            if (!source || !video || !button) {
                return;
            }
            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }
            function attachSource() {
                if (prepared) {
                    return Promise.resolve();
                }
                prepared = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放加载异常，请刷新页面后重试。');
                        }
                    });
                    return Promise.resolve();
                }
                video.src = source;
                return Promise.resolve();
            }
            function playVideo() {
                setMessage('');
                attachSource().then(function () {
                    player.classList.add('is-playing');
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {
                            player.classList.remove('is-playing');
                            setMessage('请再次点击播放按钮开始播放。');
                        });
                    }
                });
            }
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
            player.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                if (!player.classList.contains('is-playing')) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove('is-playing');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initGlobalSearch();
        initHero();
        initFilters();
        initImages();
        initPlayers();
    });
}());
