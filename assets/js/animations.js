/* ============================================================
   animations.js — drop-in animation behaviours (vanilla JS,
   no dependencies, GitHub Pages safe).

   Auto-initialises on DOMContentLoaded. Opt in with attributes:

   <canvas data-constellation></canvas>        hero particle network
   <span data-typewriter='["phrase one","phrase two"]'></span>
   <div data-reveal></div>                     scroll reveal
   <div data-reveal-group></div>               staggered children
   <span data-count="35" data-suffix="%"></span>  count-up number
   <div class="spotlight"></div>               cursor glow card
   ============================================================ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ACCENT = getComputedStyle(document.documentElement)
    .getPropertyValue("--anim-accent").trim() || "#2dd4bf";

  /* ---------------------------------------------------------
     1. Constellation — particle network canvas.
     Particles drift with velocity vectors; lines are drawn
     between particles closer than LINK_DIST. The cursor joins
     the network: particles near it link to it and brighten.
     Pauses when offscreen or tab hidden. DPR-aware.
     --------------------------------------------------------- */
  function initConstellation(canvas) {
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var LINK_DIST = 130;        // px, particle-to-particle link range
    var MOUSE_DIST = 170;       // px, particle-to-cursor link range
    var DENSITY = 1 / 14000;    // particles per px^2
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var w = 0, h = 0, running = false, rafId = null;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var target = Math.round(w * h * DENSITY);
      while (particles.length < target) particles.push(spawn());
      particles.length = Math.min(particles.length, target);
    }

    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6
      };
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      var i, j, p, q, dx, dy, d, alpha;

      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;

        // node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148, 233, 216, 0.55)";
        ctx.fill();

        // links to neighbours
        for (j = i + 1; j < particles.length; j++) {
          q = particles[j];
          dx = p.x - q.x; dy = p.y - q.y;
          d = dx * dx + dy * dy;
          if (d < LINK_DIST * LINK_DIST) {
            alpha = (1 - Math.sqrt(d) / LINK_DIST) * 0.28;
            ctx.strokeStyle = "rgba(45, 212, 191," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // link to cursor — the cursor becomes a node in the graph
        dx = p.x - mouse.x; dy = p.y - mouse.y;
        d = dx * dx + dy * dy;
        if (d < MOUSE_DIST * MOUSE_DIST) {
          alpha = (1 - Math.sqrt(d) / MOUSE_DIST) * 0.5;
          ctx.strokeStyle = "rgba(94, 234, 212," + alpha.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      rafId = requestAnimationFrame(step);
    }

    function setRunning(on) {
      if (on && !running && !REDUCED) { running = true; rafId = requestAnimationFrame(step); }
      else if (!on && running) { running = false; cancelAnimationFrame(rafId); }
    }

    var host = canvas.parentElement;
    host.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    host.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });

    // only animate while visible
    new IntersectionObserver(function (entries) {
      setRunning(entries[0].isIntersecting && !document.hidden);
    }).observe(canvas);
    document.addEventListener("visibilitychange", function () {
      setRunning(!document.hidden);
    });

    window.addEventListener("resize", resize);
    resize();

    if (REDUCED) {
      // static single frame for reduced-motion users
      running = true; step(); running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }
  }

  /* ---------------------------------------------------------
     2. Typewriter — cycles phrases with a blinking caret.
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
     3. Scroll reveal — elements rise + fade in when visible.
     --------------------------------------------------------- */
  function initReveal() {
    var singles = document.querySelectorAll("[data-reveal]");
    var groups = document.querySelectorAll("[data-reveal-group]");

    singles.forEach(function (el) {
      el.classList.add("reveal");
      if (el.hasAttribute("data-reveal-delay")) {
        el.style.setProperty("--reveal-delay", el.getAttribute("data-reveal-delay") + "ms");
      }
    });
    groups.forEach(function (group) {
      group.classList.add("reveal-group");
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty("--i", i);
      });
    });

    if (REDUCED || !("IntersectionObserver" in window)) {
      singles.forEach(function (el) { el.classList.add("in"); });
      groups.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    singles.forEach(function (el) { io.observe(el); });
    groups.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     4. Count-up numbers — <span data-count="35" data-suffix="%">
     --------------------------------------------------------- */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      if (REDUCED) { el.textContent = prefix + target + suffix; return; }
      var start = null, DURATION = 1400;
      function frame(ts) {
        if (!start) start = ts;
        var t = Math.min((ts - start) / DURATION, 1);
        var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        var val = target % 1 === 0 ? Math.round(target * eased)
                                     : (target * eased).toFixed(1);
        el.textContent = prefix + val + suffix;
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) {
      els.forEach(animate); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     5. Scroll progress bar
     --------------------------------------------------------- */
  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress__bar");
    if (!bar) return;
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     6. Spotlight cards — track cursor into CSS variables
     --------------------------------------------------------- */
  function initSpotlight() {
    document.querySelectorAll(".spotlight").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        card.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  /* --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-constellation]").forEach(initConstellation);
    document.querySelectorAll("[data-typewriter]").forEach(initTypewriter);
    initReveal();
    initCounters();
    initScrollProgress();
    initSpotlight();
  });
})();
