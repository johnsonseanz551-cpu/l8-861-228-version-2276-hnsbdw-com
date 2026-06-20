(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var button = one('[data-menu-toggle]');
    var menu = one('[data-nav-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    all('[data-hero]').forEach(function (hero) {
      var slides = all('.hero-slide', hero);
      var dots = all('.hero-dot', hero);
      var prev = one('[data-hero-prev]', hero);
      var next = one('[data-hero-next]', hero);
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });

      show(0);
      restart();
    });
  }

  function initFilters() {
    all('[data-filter-form]').forEach(function (form) {
      var scope = form.closest('main') || document;
      var cards = all('.movie-card, .ranking-item', scope);
      var noResults = one('[data-no-results]', scope);

      function apply() {
        var search = (one('[data-search]', form) || {}).value || '';
        var type = (one('[data-filter="type"]', form) || {}).value || '';
        var region = (one('[data-filter="region"]', form) || {}).value || '';
        var year = (one('[data-filter="year"]', form) || {}).value || '';
        var query = search.trim().toLowerCase();
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();

          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (type && (card.getAttribute('data-type') || '').indexOf(type) === -1) {
            ok = false;
          }
          if (region && (card.getAttribute('data-region') || '').indexOf(region) === -1) {
            ok = false;
          }
          if (year && (card.getAttribute('data-year') || '') !== year) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle('is-visible', shown === 0);
        }
      }

      all('input, select', form).forEach(function (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });
      apply();
    });
  }

  function initRails() {
    all('[data-rail]').forEach(function (section) {
      var track = one('.rail-track', section);
      var prev = one('[data-rail-prev]', section);
      var next = one('[data-rail-next]', section);
      if (!track) {
        return;
      }
      if (prev) {
        prev.addEventListener('click', function () {
          track.scrollBy({ left: -320, behavior: 'smooth' });
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          track.scrollBy({ left: 320, behavior: 'smooth' });
        });
      }
    });
  }

  function initPlayers() {
    all('[data-player]').forEach(function (player) {
      var video = one('video', player);
      var cover = one('.player-cover', player);
      var hls = null;

      function start() {
        if (!video) {
          return;
        }
        var src = video.getAttribute('data-video');
        if (!src) {
          return;
        }
        if (!player.getAttribute('data-loaded')) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            video.src = src;
          }
          player.setAttribute('data-loaded', '1');
        }
        video.controls = true;
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!player.getAttribute('data-loaded')) {
            start();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initRails();
    initPlayers();
  });
})();
