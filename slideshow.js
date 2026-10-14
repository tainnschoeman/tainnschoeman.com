// Portfolio slideshow. The slides are pre-rendered JPEGs in assets/slides/ (slide-01.jpg ...).
// Visitors move through them by clicking the slide, with the arrow keys, or by swiping;
// there are no on-screen arrows or page number.
//
// Two ways in:
// - Home page: clicking the Portfolio link opens the slides straight into fullscreen over the
//   page. Fullscreen has to start inside the click itself (browsers refuse it on page load),
//   which is why this is an overlay and not a jump to portfolio.html. Leaving fullscreen with
//   Escape closes the overlay, so Escape lands you back on the home page. Where a browser
//   cannot go fullscreen (iPhone), the overlay fills the window instead and shows a close button.
// - portfolio.html: the same slides on their own page, for direct links and visitors without
//   JavaScript. Escape, or leaving fullscreen, returns to the home page.
(function () {
  var TOTAL = 52;

  function clamp(n) { return Math.min(TOTAL, Math.max(1, n)); }
  function src(n) { return "assets/slides/slide-" + String(n).padStart(2, "0") + ".jpg"; }
  function preload(n) { if (n >= 1 && n <= TOTAL) { new Image().src = src(n); } }

  // Wires click / keyboard / swipe navigation onto `root`, showing slides in `img`.
  // `onExit` runs when the visitor presses Escape outside fullscreen.
  function startViewer(root, img, first, onExit, onChange) {
    var current = clamp(first);
    var touchX = null;

    function show(n) {
      current = clamp(n);
      img.src = src(current);
      img.alt = "Portfolio slide " + current + " of " + TOTAL;
      preload(current + 1);
      preload(current - 1);
      if (onChange) { onChange(current); }
    }

    function onKey(e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); show(current + 1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); show(current - 1); }
      else if (e.key === "Home") { e.preventDefault(); show(1); }
      else if (e.key === "End") { e.preventDefault(); show(TOTAL); }
      else if (e.key === "Escape") { e.preventDefault(); onExit(); }
    }
    function onClick() { show(current + 1); }
    function onTouchStart(e) { touchX = e.touches[0].clientX; }
    function onTouchEnd(e) {
      if (touchX === null) { return; }
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) { show(dx < 0 ? current + 1 : current - 1); }
    }

    document.addEventListener("keydown", onKey);
    img.addEventListener("click", onClick);
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd);
    show(current);

    return function stop() {
      document.removeEventListener("keydown", onKey);
      img.removeEventListener("click", onClick);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchend", onTouchEnd);
    };
  }

  // ---------- Home page: Portfolio link opens a fullscreen overlay ----------

  var link = document.querySelector("a[data-slideshow]");
  if (link) {
    var warm = function () { preload(1); preload(2); };
    link.addEventListener("mouseenter", warm, { once: true });
    link.addEventListener("focus", warm, { once: true });
    link.addEventListener("touchstart", warm, { once: true, passive: true });

    link.addEventListener("click", function (e) {
      // Leave modified clicks alone, so "open in new tab" still reaches portfolio.html.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
      e.preventDefault();
      openOverlay();
    });
  }

  function openOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "viewer";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Portfolio slideshow. Use the arrow keys or click the slide; Escape to close.");
    overlay.innerHTML =
      '<img class="viewer-slide" alt="" decoding="async">' +
      '<button type="button" class="viewer-close" aria-label="Close portfolio">&times;</button>';
    document.body.appendChild(overlay);
    document.documentElement.classList.add("viewer-open");

    var closed = false;
    var stop;

    function close() {
      if (closed) { return; }
      closed = true;
      stop();
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (document.fullscreenElement) { document.exitFullscreen().catch(function () {}); }
      overlay.remove();
      document.documentElement.classList.remove("viewer-open");
      link.focus({ preventScroll: true });
    }
    function onFullscreenChange() {
      if (document.fullscreenElement === overlay) { overlay.classList.add("is-fullscreen"); }
      else { close(); } // Escape (or any other exit) from fullscreen: back to the home page.
    }

    stop = startViewer(overlay, overlay.querySelector("img"), 1, close);
    overlay.querySelector(".viewer-close").addEventListener("click", close);

    if (overlay.requestFullscreen) {
      document.addEventListener("fullscreenchange", onFullscreenChange);
      overlay.requestFullscreen().catch(function () {
        // Refused: stay as a full-window overlay with its close button.
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      });
    }
    overlay.querySelector(".viewer-close").focus({ preventScroll: true });
  }

  // ---------- portfolio.html: the stand-alone page ----------

  var root = document.getElementById("slideshow");
  if (root) {
    var goHome = function () { location.href = "./"; };
    var first = parseInt(location.hash.slice(1), 10) || 1;
    startViewer(root, document.getElementById("slide"), first, goHome, function (n) {
      history.replaceState(null, "", "#" + n);
    });

    var wasFullscreen = false;
    document.addEventListener("fullscreenchange", function () {
      if (document.fullscreenElement) { wasFullscreen = true; }
      else if (wasFullscreen) { goHome(); }
    });
    var button = document.getElementById("fullscreen");
    if (button) {
      button.addEventListener("click", function () {
        if (document.fullscreenElement) { document.exitFullscreen(); }
        else if (root.requestFullscreen) { root.requestFullscreen(); }
      });
    }
  }
})();
