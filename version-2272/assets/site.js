(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  const syncHeader = () => {
    if (!header) {
      return;
    }

    header.classList.toggle('is-solid', window.scrollY > 30);
  };

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    const showSlide = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    window.setInterval(() => {
      showSlide(active + 1);
    }, 5600);
  }

  const root = document.body.getAttribute('data-root') || './';
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyStates = Array.from(document.querySelectorAll('[data-empty-state]'));
  const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
  let activeFilter = '全部';

  const textOfCard = (card) => [
    card.getAttribute('data-title'),
    card.getAttribute('data-category'),
    card.getAttribute('data-year'),
    card.getAttribute('data-region'),
    card.getAttribute('data-genre'),
    card.getAttribute('data-tags'),
    card.textContent
  ].join(' ').toLowerCase();

  const applyFilters = () => {
    const query = (searchInputs[0]?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const content = textOfCard(card);
      const matchQuery = !query || content.includes(query);
      const matchFilter = activeFilter === '全部' || content.includes(activeFilter.toLowerCase());
      const show = matchQuery && matchFilter;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    emptyStates.forEach((node) => {
      node.classList.toggle('is-visible', cards.length > 0 && visible === 0);
    });
  };

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery && cards.length) {
    searchInputs.forEach((input) => {
      input.value = initialQuery;
    });
    applyFilters();
  }

  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('[data-search-input]');
      const query = (input?.value || '').trim();

      if (cards.length) {
        event.preventDefault();
        searchInputs.forEach((target) => {
          if (target !== input) {
            target.value = query;
          }
        });
        applyFilters();
        return;
      }

      if (query) {
        event.preventDefault();
        window.location.href = `${root}movies.html?q=${encodeURIComponent(query)}`;
      }
    });
  });

  searchInputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (cards.length) {
        applyFilters();
      }
    });
  });

  document.querySelectorAll('[data-filter]').forEach((button) => {
    if (button.textContent.trim() === activeFilter) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      activeFilter = button.textContent.trim();
      document.querySelectorAll('[data-filter]').forEach((item) => {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  const video = document.querySelector('video[data-stream]');
  const playButton = document.querySelector('[data-play-button]');

  if (video) {
    let ready = false;
    let hls = null;

    const attachVideo = () => new Promise((resolve) => {
      if (ready) {
        resolve();
        return;
      }

      ready = true;
      const url = video.getAttribute('data-stream');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.load();
        resolve();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => resolve());
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
        return;
      }

      video.src = url;
      video.load();
      resolve();
    });

    const startPlayback = () => {
      attachVideo().then(() => {
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
      });
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    };

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', () => {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
