/* =========================================
   SHARED NAV + UTILITY SCRIPTS
   ========================================= */

// ---- Lightweight Preloader ----
function removePreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('hidden')) {
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 500);
  }
}

if (document.readyState === 'complete') {
  removePreloader();
} else {
  window.addEventListener('load', removePreloader);
  // Fallback in case some assets hang
  setTimeout(removePreloader, 3000);
}

// ---- Set footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Navbar scroll effect (Reactive) ----
const navbar = document.getElementById('navbar');
if (navbar) {
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Solid background if scrolled past 40px
    navbar.classList.toggle('scrolled', currentScrollY > 40);
    
    // Hide/show logic based on direction
    const isMenuOpen = document.querySelector('.nav-links')?.classList.contains('open');
    if (currentScrollY > 200 && currentScrollY > lastScrollY && !isMenuOpen) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
  });
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

// ---- Scroll Animations (GSAP or Fallback) ----
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.timeline-item, .award-card, .reveal, .pub-item, .featured-card, .editorial-quote-card, .rec-card');

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    revealElements.forEach((card) => {
      // Override initial CSS hide
      card.style.opacity = '1';
      card.style.transform = 'none';
      
      gsap.fromTo(card,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  } else {
    // Fallback Observer
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
    
    revealElements.forEach(el => revealObserver.observe(el));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}

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

// ---- Magnetic Micro-interactions ----
const magneticBtns = document.querySelectorAll('.btn-primary, .nav-cta, .about-contact-btn');
magneticBtns.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Disable CSS transition during hover for 1-to-1 tracking
    btn.style.transition = 'none';
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });
  
  btn.addEventListener('mouseleave', () => {
    // Re-enable smooth transition for the snap back
    btn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s';
    btn.style.transform = '';
  });
});
