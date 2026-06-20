
(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-filter-input]');
        const typeSelect = scope.querySelector('[data-filter-type]');
        const cards = Array.from(scope.querySelectorAll('.movie-card'));
        let chipValue = '';

        const applyFilter = function () {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const typeValue = typeSelect ? typeSelect.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                const text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ');
                const matchesKeyword = !keyword || text.includes(keyword);
                const matchesType = !typeValue || text.includes(typeValue);
                const matchesChip = !chipValue || text.includes(chipValue);
                card.classList.toggle('is-hidden', !(matchesKeyword && matchesType && matchesChip));
            });
        };

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }

        scope.querySelectorAll('[data-chip]').forEach(function (button) {
            button.addEventListener('click', function () {
                const next = button.getAttribute('data-chip') || '';
                chipValue = chipValue === next ? '' : next;
                scope.querySelectorAll('[data-chip]').forEach(function (item) {
                    item.classList.toggle('is-active', item === button && chipValue);
                });
                applyFilter();
            });
        });
    });

    const searchForm = document.getElementById('globalSearch');
    const resultBox = document.getElementById('searchResults');

    if (searchForm && resultBox && Array.isArray(globalThis.movieIndex)) {
        const renderResults = function (keyword) {
            const q = keyword.trim().toLowerCase();
            if (!q) {
                resultBox.innerHTML = '';
                return;
            }

            const matches = globalThis.movieIndex.filter(function (movie) {
                return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.oneLine]
                    .join(' ')
                    .toLowerCase()
                    .includes(q);
            }).slice(0, 12);

            resultBox.innerHTML = matches.map(function (movie) {
                return '<a href="' + movie.link + '"><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span></a>';
            }).join('');
        };

        const input = searchForm.querySelector('input[name="keyword"]');
        if (input) {
            input.addEventListener('input', function () {
                renderResults(input.value);
            });
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const first = resultBox.querySelector('a');
            if (first) {
                first.click();
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
