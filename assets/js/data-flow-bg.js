/**
 * Ultimate Geek Mashup Canvas Background
 * Features paper planes, meteor showers, TBBT/Office/Dilbert quotes, and floating icons.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('math-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const QUOTES = [
    'Bazinga!', 'Bears. Beets. Battlestar Galactica.', "That's what she said.",
    'E = mc²', 'Schrödinger\'s Cat', 'String Theory', 'Dogbert', 'Dilbert',
    'Engineers like to solve problems', 'Assistant TO the Regional Manager', 'Knock knock knock Penny',
    'f(x)', '∇', '∑', 'W^T', 'O(n log n)', 'Dunder Mifflin', 'Soft Kitty', 'Wally',
    'I am Iron Man.', 'With great power...', 'Stark Industries', 'JARVIS', 'Spider-Sense tingling'
  ];

  const ICONS = ['💻', '🐍', '⚙️', '📊', '🧠', '🔬', '📡', '☕', '🛠️', '📈', '🗃️', '🤖', '⚡', '🧮'];

  const PALETTE = [
    { r: 37,  g: 99,  b: 235 }, // Blue
    { r: 5,   g: 150, b: 105 }, // Emerald
    { r: 71,  g: 85,  b: 105 }, // Slate
    { r: 217, g: 119, b: 6   }  // Amber
  ];

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let animationId = null;
  let isRunning = true;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  let particles = [];
  let meteors = [];
  let planes = [];
  let huds = [];

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = initial ? Math.random() * width : -50;
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.vx = 0.15 + Math.random() * 0.3;
      this.vy = -0.1 + Math.random() * 0.2;
      this.isText = Math.random() > 0.4;
      this.content = this.isText 
        ? QUOTES[Math.floor(Math.random() * QUOTES.length)]
        : ICONS[Math.floor(Math.random() * ICONS.length)];
      this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.fontSize = this.isText ? 10 + Math.random() * 6 : 14 + Math.random() * 10;
      this.alpha = 0.15 + Math.random() * 0.2;
      this.phase = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy + Math.sin(this.phase + this.x * 0.01) * 0.2;
      if (this.x > width + 100 || this.y < -100 || this.y > height + 100) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      if (this.isText) {
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.font = `500 ${this.fontSize}px 'DM Mono', monospace`;
      } else {
        ctx.font = `${this.fontSize}px sans-serif`;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.content, this.x, this.y);
      ctx.restore();
    }
  }

  class Meteor {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width * 1.5;
      this.y = -100;
      this.vx = -4 - Math.random() * 4;
      this.vy = 4 + Math.random() * 4;
      this.length = 30 + Math.random() * 50;
      this.alpha = 0.3 + Math.random() * 0.3;
      this.active = false;
      this.delay = Math.random() * 300; 
    }
    update() {
      if (!this.active) {
        this.delay--;
        if (this.delay <= 0) this.active = true;
        return;
      }
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -100 || this.y > height + 100) {
        this.reset();
      }
    }
    draw() {
      if (!this.active) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.stroke();
      ctx.restore();
    }
  }

  class PaperPlane {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = -100;
      this.y = Math.random() * height * 0.7 + height * 0.15;
      this.vx = 1.5 + Math.random() * 1.5;
      this.baseY = this.y;
      this.time = Math.random() * 100;
      this.active = Math.random() > 0.5;
    }
    update() {
      if (!this.active) {
        if (Math.random() < 0.003) this.active = true;
        return;
      }
      this.time += 0.015;
      this.x += this.vx;
      this.y = this.baseY + Math.sin(this.time) * 40;
      
      if (this.x > width + 100) {
        this.reset();
      }
    }
    draw() {
      if (!this.active) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      
      const angle = Math.cos(this.time) * 40 * 0.015 / this.vx;
      ctx.rotate(angle);
      
      ctx.fillStyle = '#0f172a';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-12, 9);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-12, -9);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.globalAlpha = 0.25;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.x - 14, this.y);
      ctx.lineTo(this.x - 70, this.baseY + Math.sin(this.time - 0.4) * 40);
      ctx.stroke();
      ctx.restore();
    }
  }

  class IronManHUD {
    constructor() {
      this.x = width * (0.7 + Math.random() * 0.2);
      this.y = height * (0.3 + Math.random() * 0.4);
      this.angle = 0;
      this.scale = 0.8 + Math.random() * 0.4;
      this.alpha = 0.08;
      this.spinSpeed = 0.005 + Math.random() * 0.005;
    }
    update() {
      this.angle += this.spinSpeed;
      // Slight drift
      this.x += Math.sin(this.angle * 2) * 0.1;
      this.y += Math.cos(this.angle * 2) * 0.1;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(this.scale, this.scale);
      
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = '#0ea5e9'; // JARVIS Blue
      ctx.lineWidth = 1;

      // Outer dashed ring
      ctx.setLineDash([10, 5, 2, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Inner solid ring
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(-60, 0); ctx.lineTo(-40, 0);
      ctx.moveTo(60, 0); ctx.lineTo(40, 0);
      ctx.moveTo(0, -60); ctx.lineTo(0, -40);
      ctx.moveTo(0, 60); ctx.lineTo(0, 40);
      ctx.stroke();

      ctx.restore();
    }
  }

  function init() {
    let targetCount = width < 600 ? 20 : 40;
    particles = [];
    meteors = [];
    planes = [];
    huds = [];
    for (let i = 0; i < targetCount; i++) particles.push(new Particle());
    for (let i = 0; i < 4; i++) meteors.push(new Meteor());
    for (let i = 0; i < 2; i++) planes.push(new PaperPlane());
    huds.push(new IronManHUD());
  }

  function animate() {
    if (!isRunning) return;
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    if (prefersReducedMotion) {
      particles.forEach(p => p.draw());
      return;
    }

    particles.forEach(p => { p.update(); p.draw(); });
    meteors.forEach(m => { m.update(); m.draw(); });
    planes.forEach(p => { p.update(); p.draw(); });
    huds.forEach(h => { h.update(); h.draw(); });
  }

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    if (particles.length === 0) init();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
    } else {
      isRunning = true;
      animate();
    }
  });

  init();
  animate();
  
  // ---- Hero Parallax Mapping ----
  const heroBg = document.querySelector('.hero-bg');
  window.addEventListener('scroll', () => {
    if (prefersReducedMotion) return;
    const scrollY = window.scrollY;
    if (scrollY < height) {
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
      }
      canvas.style.transform = `translateY(${scrollY * 0.15}px)`;
    }
  });
})();
