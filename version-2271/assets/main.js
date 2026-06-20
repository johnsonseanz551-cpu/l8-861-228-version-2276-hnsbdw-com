(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let active = 0;
        let timer = null;

        const showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        startTimer();
    }

    const normalize = function (value) {
        return String(value || "").trim().toLowerCase();
    };

    const applyFilter = function (input, list) {
        const keyword = normalize(input.value);
        const cards = Array.from(list.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
            const haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-meta"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            card.classList.toggle("is-filter-hidden", keyword && !haystack.includes(keyword));
        });
    };

    const pageFilter = document.querySelector("[data-page-filter]");
    const pageList = document.querySelector("[data-filter-list]");
    if (pageFilter && pageList) {
        pageFilter.addEventListener("input", function () {
            applyFilter(pageFilter, pageList);
        });
    }

    const searchInput = document.querySelector("[data-global-filter]");
    const searchList = document.querySelector("[data-search-list]");
    if (searchInput && searchList) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get("q") || "";
        searchInput.value = initial;
        applyFilter(searchInput, searchList);
        searchInput.addEventListener("input", function () {
            applyFilter(searchInput, searchList);
        });

        document.querySelectorAll("[data-chip]").forEach(function (chip) {
            chip.addEventListener("click", function () {
                searchInput.value = chip.getAttribute("data-chip") || "";
                applyFilter(searchInput, searchList);
                searchInput.focus();
            });
        });
    }
})();
