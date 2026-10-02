/* =========================================
   SHARED NAV + UTILITY SCRIPTS
   ========================================= */

// ---- Set footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
if (navbar) {
  // Pages without hero get solid nav always
  if (navbar.classList.contains('solid')) {
    // already solid
  } else {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }
}

// ---- Hamburger ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  const setMenuOpen = (isOpen) => {
    navLinks.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    const spans = hamburger.querySelectorAll('span');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5.5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5.5px)' : '';
  };
  hamburger.addEventListener('click', () => {
    setMenuOpen(!navLinks.classList.contains('open'));
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  document.addEventListener('click', event => {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
      setMenuOpen(false);
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && navLinks.classList.contains('open')) {
      setMenuOpen(false);
    }
  });
}

// ---- Intersection Observer: reveal on scroll ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.index || 0) * 90;
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.timeline-item, .award-card, .reveal, .pub-item, .featured-card, .editorial-quote-card, .rec-card').forEach(el => {
  revealObserver.observe(el);
});

// ---- Publication filter ----
const filterBtns = document.querySelectorAll('.filter-btn');
const pubItems   = document.querySelectorAll('.pub-item');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const filter = btn.dataset.filter;
    pubItems.forEach(item => {
      const show = filter === 'all' || item.dataset.type === filter;
      item.classList.toggle('hidden', !show);
      if (show) {
        item.classList.add('visible');
        item.style.animation = 'fadeUp .4s forwards';
      }
    });
  });
});

// ---- Back to Top Button ----
const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
backToTop.setAttribute('aria-label', 'Back to top');

const footerInner = document.querySelector('.footer-inner');
if (footerInner) {
  const mainFooter = footerInner.closest('footer') || footerInner.parentElement.parentElement;
  mainFooter.style.position = 'relative'; // Ensure absolute positioning works
  mainFooter.appendChild(backToTop);
} else {
  document.body.appendChild(backToTop);
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
