import {
  fetchPosts,
  formatDate,
  tagList,
  sortPosts,
  getUniqueTags,
  escapeHtml,
} from './shared.js';

const grid = document.getElementById('posts-grid');
const filterContainer = document.getElementById('tag-filter');
const countLabel = document.getElementById('post-count');

function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'card post-card';
  article.innerHTML = `
    <div>
      <div class="post-meta">
        <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
      </div>
      <h2><a href="post.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
      <p>${escapeHtml(post.excerpt || '')}</p>
    </div>
    <div class="tags">${tagList(post.tags)}</div>
  `;
  return article;
}

function renderPosts(posts) {
  grid.innerHTML = '';
  if (!posts.length) {
    grid.innerHTML = '<div class="empty-state">No posts match this tag.</div>';
    countLabel.textContent = '0 posts';
    return;
  }
  posts.forEach(post => grid.appendChild(createPostCard(post)));
  countLabel.textContent = `${posts.length} post${posts.length === 1 ? '' : 's'}`;
}

function renderFilter(tags, activeTag, allPosts, applyFilter) {
  filterContainer.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.classList.toggle('active', activeTag === 'all');
  allBtn.addEventListener('click', () => applyFilter('all'));
  filterContainer.appendChild(allBtn);

  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.classList.toggle('active', tag === activeTag);
    btn.addEventListener('click', () => applyFilter(tag));
    filterContainer.appendChild(btn);
  });
}

async function init() {
  try {
    const posts = sortPosts(await fetchPosts());
    const tags = getUniqueTags(posts);

    const params = new URLSearchParams(window.location.search);
    let activeTag = params.get('tag') || 'all';
    if (activeTag !== 'all' && !tags.includes(activeTag)) activeTag = 'all';

    const applyFilter = (tag) => {
      activeTag = tag;
      const filtered = tag === 'all' ? posts : posts.filter(p => (p.tags || []).includes(tag));
      renderPosts(filtered);
      renderFilter(tags, activeTag, posts, applyFilter);
      const url = tag === 'all' ? 'index.html' : `index.html?tag=${encodeURIComponent(tag)}`;
      window.history.replaceState(null, '', url);
    };

    applyFilter(activeTag);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">
      Could not load posts. <a href="index.html">Retry</a>.
    </div>`;
  }
}

init();
