// Portfolio slideshow. The slides are pre-rendered JPEGs in assets/slides/ (slide-01.jpg ...),
// so nothing is fetched until a slide is needed, and the neighbours are preloaded so a step
// never shows a blank frame. There are no on-screen arrows or page number: visitors move
// through it by clicking the slide, with the arrow keys, or by swiping.
(function () {
  var TOTAL = 52;
  var root = document.getElementById("slideshow");
  var img = document.getElementById("slide");
  var current = clamp(parseInt(location.hash.slice(1), 10) || 1);

  function clamp(n) { return Math.min(TOTAL, Math.max(1, n)); }
  function src(n) { return "assets/slides/slide-" + String(n).padStart(2, "0") + ".jpg"; }

  function show(n) {
    current = clamp(n);
    img.src = src(current);
    img.alt = "Portfolio slide " + current + " of " + TOTAL;
    history.replaceState(null, "", "#" + current);
    [current + 1, current - 1].forEach(function (k) {
      if (k >= 1 && k <= TOTAL) { new Image().src = src(k); }
    });
  }

  img.addEventListener("click", function () { show(current + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); show(current + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(current - 1); }
    else if (e.key === "Home") { show(1); }
    else if (e.key === "End") { show(TOTAL); }
  });

  var touchX = null;
  root.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) { show(dx < 0 ? current + 1 : current - 1); }
  });

  document.getElementById("fullscreen").addEventListener("click", function () {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else if (root.requestFullscreen) { root.requestFullscreen(); }
  });

  show(current);
})();
