/**
 * Shared blog utilities.
 */

const POSTS_URL = './data/posts.json';

export async function fetchPosts() {
  const res = await fetch(POSTS_URL);
  if (!res.ok) throw new Error(`Failed to load posts: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.posts ?? [];
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function tagList(tags) {
  if (!Array.isArray(tags) || !tags.length) return '';
  return tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sortPosts(posts) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getUniqueTags(posts) {
  const set = new Set();
  posts.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return Array.from(set).sort();
}
