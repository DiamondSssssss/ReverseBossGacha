/**
 * Ghost Hero walks path on setup board (preview).
 */

import { heroSpriteUrl } from '../render/sprites.js';

/**
 * @param {HTMLElement} boardEl
 * @param {Array<{col:number,row:number}>} path
 * @param {object} hero - wave hero template
 * @returns {() => void} cancel
 */
export function playGhostWalk(boardEl, path, hero) {
  if (!path?.length || !boardEl) return () => {};

  const grid = boardEl.querySelector('.grid-board');
  if (!grid) return () => {};

  let ghost = boardEl.querySelector('.ghost-walker');
  if (ghost) ghost.remove();

  ghost = document.createElement('div');
  ghost.className = 'ghost-walker';
  ghost.innerHTML = `<img src="${heroSpriteUrl(hero.id, hero.class, hero.color)}" alt="" width="36" height="36" />`;
  boardEl.appendChild(ghost);

  const br = () => boardEl.getBoundingClientRect();
  function cellCenter(col, row) {
    const el = boardEl.querySelector(`.grid-cell[data-col="${col}"][data-row="${row}"]`);
    if (!el) return null;
    const b = br();
    const c = el.getBoundingClientRect();
    return {
      x: c.left - b.left + c.width / 2,
      y: c.top - b.top + c.height / 2,
    };
  }

  let i = 0;
  let t = 0;
  let cancelled = false;
  let raf = 0;
  let last = performance.now();
  const STEP = 0.28;

  function placeAt(col, row, face = 1) {
    const p = cellCenter(col, row);
    if (!p) return;
    ghost.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scaleX(${face})`;
  }

  const start = path[0];
  placeAt(start.col, start.row, 1);
  ghost.classList.add('show');

  function loop(ts) {
    if (cancelled) return;
    let dt = (ts - last) / 1000;
    last = ts;
    if (dt > 0.05) dt = 0.05;
    t += dt;
    if (t >= STEP) {
      t = 0;
      i++;
      if (i >= path.length) {
        ghost.classList.add('fade');
        setTimeout(() => ghost.remove(), 400);
        return;
      }
      const prev = path[i - 1];
      const cur = path[i];
      const face = cur.col >= prev.col ? 1 : -1;
      placeAt(cur.col, cur.row, face);
      const el = boardEl.querySelector(`.grid-cell[data-col="${cur.col}"][data-row="${cur.row}"]`);
      el?.classList.add('ghost-pass');
      setTimeout(() => el?.classList.remove('ghost-pass'), 280);
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    ghost.remove();
  };
}
