(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function openSearch(term) {
    var query = String(term || '').trim();
    if (query) {
      window.location.href = 'search.html?q=' + encodeURIComponent(query);
    }
  }

  qsa('[data-menu-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = qs('[data-mobile-panel]');
      if (panel) {
        panel.classList.toggle('is-open');
      }
    });
  });

  qsa('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var prefix = form.getAttribute('data-prefix') || '';
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = prefix + 'search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    qsa('[data-hero-next]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    });

    qsa('[data-hero-prev]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  });

  qsa('[data-filter-area]').forEach(function (area) {
    var input = qs('[data-filter-input]', area);
    var year = qs('[data-filter-year]', area);
    var type = qs('[data-filter-type]', area);
    var cards = qsa('.filter-card', area);
    var empty = qs('[data-empty]', area);

    function apply() {
      var text = normalize(input ? input.value : '');
      var yearValue = normalize(year ? year.value : '');
      var typeValue = normalize(type ? type.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        var ok = matchesText && matchesYear && matchesType;
        card.classList.toggle('hide-card', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });

  function startVideo(player, trigger) {
    var video = qs('video', player);
    var stream = trigger.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }
    if (player._hlsInstance) {
      player._hlsInstance.destroy();
      player._hlsInstance = null;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      player._hlsInstance = hls;
    } else {
      video.src = stream;
    }
    trigger.classList.add('is-hidden');
    video.play().catch(function () {
      video.setAttribute('controls', 'controls');
    });
  }

  qsa('[data-player]').forEach(function (player) {
    qsa('[data-play-trigger]', player).forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        startVideo(player, trigger);
      });
    });
  });

  function renderSearchResults() {
    var box = qs('[data-search-results]');
    if (!box || typeof movieSearchIndex === 'undefined') {
      return;
    }
    var input = qs('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function card(movie) {
      return [
        '<a class="search-card" href="' + movie.link + '">',
        '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
        '<div>',
        '<h2>' + movie.title + '</h2>',
        '<p>' + movie.oneLine + '</p>',
        '<div class="rank-meta"><span>★ ' + movie.rating + '</span><span>' + movie.year + '</span><span>' + movie.channel + '</span></div>',
        '</div>',
        '</a>'
      ].join('');
    }

    function apply() {
      var query = normalize(input ? input.value : initial);
      var results = movieSearchIndex.filter(function (movie) {
        var haystack = normalize([movie.title, movie.oneLine, movie.channel, movie.year, movie.genre, movie.tags].join(' '));
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);
      if (results.length) {
        box.innerHTML = results.map(card).join('');
      } else {
        box.innerHTML = '<div class="empty-state">没有找到匹配影片，换个关键词试试。</div>';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    apply();
  }

  renderSearchResults();
})();
