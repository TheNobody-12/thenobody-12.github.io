/* ============================================================
   animations.js — minimal animation behaviours for Lab Report.
   Only: typewriter + scroll reveal.
   Auto-initialises on DOMContentLoaded.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Typewriter — cycles phrases with a blinking caret.
     --------------------------------------------------------- */
  function initTypewriter(el) {
    var phrases;
    try { phrases = JSON.parse(el.getAttribute("data-typewriter")); }
    catch (e) { return; }
    if (!phrases || !phrases.length) return;
    el.classList.add("typewriter");

    if (REDUCED) { el.textContent = phrases[0]; return; }

    var pi = 0, ci = 0, deleting = false;
    function tick() {
      var phrase = phrases[pi];
      ci += deleting ? -1 : 1;
      el.textContent = phrase.slice(0, ci);

      var delay = deleting ? 32 : 62;
      if (!deleting && ci === phrase.length) { delay = 2100; deleting = true; }
      else if (deleting && ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        delay = 420;
      }
      setTimeout(tick, delay);
    }
    tick();
  }

  /* ---------------------------------------------------------
     2. Scroll reveal — elements fade in when visible.
     --------------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    els.forEach(function (el) {
      el.classList.add("reveal");
    });

    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });

    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-typewriter]").forEach(initTypewriter);
    initReveal();
  });
})();
