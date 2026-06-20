(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q'], input[type='search']");
                var query = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "search.html";
                window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
            });
        });

        var filter = document.querySelector("[data-card-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var countNode = document.querySelector("[data-result-count]");
        var noResults = document.querySelector("[data-no-results]");

        function applyFilter(value) {
            var query = normalize(value);
            var matched = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var visible = !query || haystack.indexOf(query) !== -1;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    matched += 1;
                }
            });

            if (countNode) {
                countNode.textContent = query ? "已匹配 " + matched + " 部作品" : "输入关键词筛选片库";
            }

            if (noResults) {
                noResults.classList.toggle("show", matched === 0);
            }
        }

        if (filter && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query) {
                filter.value = query;
            }
            applyFilter(filter.value);
            filter.addEventListener("input", function () {
                applyFilter(filter.value);
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function setSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    var active = slideIndex === current;
                    slide.classList.toggle("active", active);
                    slide.setAttribute("aria-hidden", active ? "false" : "true");
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    setSlide(current + 1);
                }, 5600);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    setSlide(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    setSlide(current + 1);
                    restart();
                });
            }

            setSlide(0);
            restart();
        }
    });
}());
