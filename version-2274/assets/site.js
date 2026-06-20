(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!button || !mobileNav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      slides[index].classList.remove("is-active");
      if (dots[index]) {
        dots[index].classList.remove("is-active");
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add("is-active");
      if (dots[index]) {
        dots[index].classList.add("is-active");
      }
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    start();
  }

  function setupFiltering() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid"));
    if (!grids.length) {
      return;
    }
    var input = document.querySelector("#search-input") || document.querySelector(".filter-input");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }
    function apply() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.children).forEach(function (item) {
          var haystack = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
          var matched = !value || haystack.indexOf(value) !== -1;
          item.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
      });
      var empty = document.querySelector(".empty-state");
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFiltering();
  });
}());

window.initMoviePlayer = function (streamUrl) {
  var video = document.getElementById("movie-player");
  var overlay = document.querySelector(".play-overlay");
  var hls = null;
  var loaded = false;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function hideOverlay() {
    overlay.classList.add("is-hidden");
  }

  function loadAndPlay() {
    hideOverlay();
    if (!loaded) {
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        var nativePromise = video.play();
        if (nativePromise && nativePromise.catch) {
          nativePromise.catch(function () {});
        }
      } else {
        video.src = streamUrl;
        var fallbackPromise = video.play();
        if (fallbackPromise && fallbackPromise.catch) {
          fallbackPromise.catch(function () {});
        }
      }
    } else {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
  }

  overlay.addEventListener("click", loadAndPlay);
  video.addEventListener("click", function () {
    if (video.paused) {
      loadAndPlay();
    }
  });
  video.addEventListener("play", hideOverlay);
};
