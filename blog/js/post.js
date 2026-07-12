import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.0.9/dist/purify.es.mjs';
import {
  fetchPosts,
  formatDate,
  tagList,
  sortPosts,
  escapeHtml,
} from './shared.js';

const titleEl = document.getElementById('post-title');
const dateEl = document.getElementById('post-date');
const tagsEl = document.getElementById('post-tags');
const excerptEl = document.getElementById('post-excerpt');
const bodyEl = document.getElementById('post-body');
const relatedEl = document.getElementById('related-posts');

marked.use({ gfm: true });

function renderNotFound() {
  document.title = 'Post not found';
  titleEl.textContent = 'Post not found';
  dateEl.textContent = '';
  tagsEl.innerHTML = '';
  excerptEl.innerHTML = '';
  bodyEl.innerHTML = `<div class="empty-state">
      This post could not be loaded. <a href="index.html">Back to blog</a>.
    </div>`;
  relatedEl.hidden = true;
}

function parseFrontmatter(md) {
  const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, content: md };
  // js-yaml is loaded globally by the UMD script in post.html.
  const data = window.jsyaml.load(match[1]);
  return { data, content: match[2] };
}

function renderRelated(currentSlug, currentTags, allPosts) {
  const related = sortPosts(allPosts).filter(
    p => p.slug !== currentSlug && (p.tags || []).some(t => currentTags.includes(t))
  ).slice(0, 3);

  if (!related.length) {
    relatedEl.hidden = true;
    return;
  }

  relatedEl.hidden = false;
  relatedEl.innerHTML = `<h2>Related posts</h2>
    <div class="posts-grid">${related
      .map(
        p => `<article class="card post-card">
          <div>
            <div class="post-meta"><time datetime="${escapeHtml(p.date)}">${formatDate(p.date)}</time></div>
            <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></h2>
            <p>${escapeHtml(p.excerpt || '')}</p>
          </div>
          <div class="tags">${tagList(p.tags)}</div>
        </article>`
      )
      .join('')}</div>`;
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    renderNotFound();
    return;
  }

  try {
    const posts = await fetchPosts();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      renderNotFound();
      return;
    }

    const res = await fetch(post.file);
    if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
    const md = await res.text();
    const { data, content } = parseFrontmatter(md);

    document.title = `${post.title} — Sarthak Kapaliya`;
    titleEl.textContent = post.title;
    dateEl.textContent = formatDate(post.date);
    tagsEl.innerHTML = tagList(post.tags);
    excerptEl.textContent = post.excerpt || data.excerpt || '';

    const rawHtml = marked.parse(content || '');
    bodyEl.innerHTML = DOMPurify.sanitize(rawHtml);

    renderRelated(post.slug, post.tags || [], posts);
  } catch (err) {
    renderNotFound();
  }
}

init();
