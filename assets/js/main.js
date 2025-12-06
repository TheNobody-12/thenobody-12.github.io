// Minimal interactivity: mobile nav, active link on scroll, and reveal animations.
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-link");

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    navToggle.querySelector("i").classList.toggle("bi-list");
    navToggle.querySelector("i").classList.toggle("bi-x");
  });

  links.forEach(link => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        navToggle.querySelector("i").classList.add("bi-list");
        navToggle.querySelector("i").classList.remove("bi-x");
      }
    });
  });

  // Active link on scroll
  const sections = [...document.querySelectorAll("section[id]")];
  const setActive = () => {
    const pos = window.scrollY + 140;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!navLink) return;
      if (pos >= top && pos < top + height) navLink.classList.add("active");
      else navLink.classList.remove("active");
    });
  };
  window.addEventListener("scroll", setActive);
  setActive();

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".card, .section-header, .hero-card, .hero-copy");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        e.target.style.opacity = 1;
        e.target.style.transform = "translateY(0)";
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = "translateY(24px)";
    observer.observe(el);
  });
});
