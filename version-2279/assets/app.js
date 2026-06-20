(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      menuToggle.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const keyword = input ? input.value.trim() : '';

      if (!keyword) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHeroSlide(index);
      startHeroTimer();
    });
  });

  startHeroTimer();

  const filterBars = document.querySelectorAll('[data-filter-bar]');

  filterBars.forEach(function (bar) {
    const input = bar.querySelector('[data-card-filter-input]');
    const chips = Array.from(bar.querySelectorAll('[data-filter]'));
    const scope = bar.closest('main') || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const emptyState = scope.querySelector('[data-empty-state]');
    let activeGenre = 'all';

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const search = (card.getAttribute('data-search') || '').toLowerCase();
        const genre = card.getAttribute('data-genre') || '';
        const genreMatched = activeGenre === 'all' || genre === activeGenre;
        const keywordMatched = !keyword || search.indexOf(keyword) !== -1;
        const matched = genreMatched && keywordMatched;

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeGenre = chip.getAttribute('data-filter') || 'all';

        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });

        applyFilter();
      });
    });

    if (input) {
      input.addEventListener('input', applyFilter);
    }
  });

  const searchPageInput = document.querySelector('[data-search-page-input]');

  if (searchPageInput) {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('q') || '';
    searchPageInput.value = keyword;
    searchPageInput.dispatchEvent(new Event('input'));
  }
})();
