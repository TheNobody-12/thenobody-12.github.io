/* =========================================
   RECOMMENDATIONS — LIGHTBOX + CARDS
   ========================================= */

// ---- Build avatar initials from data-name ----
document.querySelectorAll('.rec-card').forEach(card => {
  const name = card.dataset.name || '';
  const avatar = card.querySelector('.rec-avatar');
  if (avatar && name) {
    const parts = name.trim().split(' ');
    const initials = parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
    avatar.textContent = initials.toUpperCase();
  }
});


