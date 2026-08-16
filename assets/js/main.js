/**
 * Portfolio + blog shared interactivity.
 * Handles: mobile nav, active section highlight, scroll reveals,
 * hero data-mesh canvas, back-to-top, latest blog posts on homepage.
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  const icon = navToggle.querySelector('i');

  function setOpen(isOpen) {
    navLinks.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    if (icon) {
      icon.classList.toggle('bx-menu', !isOpen);
      icon.classList.toggle('bx-x', isOpen);
    }
  }

  navToggle.addEventListener('click', () => setOpen(!navLinks.classList.contains('open')));

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
      setOpen(false);
    }
  });
}

function initActiveLinks() {
  const sections = [...document.querySelectorAll('section[id]')];
  if (!sections.length) return;

  const setActive = () => {
    const pos = window.scrollY + 160;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!navLink) return;
      navLink.classList.toggle('active', pos >= top && pos < top + height);
    });
  };

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
}

function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  const toggle = () => btn.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

async function initLatestPosts() {
  const container = document.getElementById('latest-posts-grid');
  if (!container) return;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function tagList(tags) {
    if (!Array.isArray(tags) || !tags.length) return '';
    return tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  }

  try {
    const res = await fetch('/blog/data/posts.json');
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const posts = Array.isArray(data) ? data : data.posts ?? [];
    const latest = posts
      .filter(p => !p.draft)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    if (!latest.length) {
      container.innerHTML = '<p class="muted">No posts yet. Check back soon.</p>';
      return;
    }

    container.innerHTML = latest.map(post => `
      <article class="card post-card">
        <div>
          <div class="post-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></div>
          <h2><a href="blog/post.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
          <p class="muted">${escapeHtml(post.excerpt || '')}</p>
        </div>
        <div class="tags">${tagList(post.tags)}</div>
      </article>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="muted">Could not load latest posts.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initActiveLinks();
  initBackToTop();
  initLatestPosts();
});
