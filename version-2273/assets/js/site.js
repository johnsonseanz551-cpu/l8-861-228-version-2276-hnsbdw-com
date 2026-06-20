(function () {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-shell'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector('.movie-filter-input');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('.movie-filter-select'));
            var grid = scope.querySelector('.movie-grid');
            if (!grid) {
                grid = document.querySelector('.movie-grid');
            }
            if (!grid) {
                return;
            }
            var items = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .rank-row'));

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var filters = {};
                selects.forEach(function (select) {
                    var key = select.getAttribute('data-filter');
                    filters[key] = normalize(select.value);
                });
                items.forEach(function (item) {
                    var haystack = normalize([
                        item.getAttribute('data-title'),
                        item.getAttribute('data-year'),
                        item.getAttribute('data-region'),
                        item.getAttribute('data-type'),
                        item.getAttribute('data-genre'),
                        item.getAttribute('data-category')
                    ].join(' '));
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;
                    Object.keys(filters).forEach(function (key) {
                        var value = filters[key];
                        if (value && normalize(item.getAttribute('data-' + key)) !== value) {
                            matched = false;
                        }
                    });
                    item.classList.toggle('is-hidden', !matched);
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
