/**
 * Setup board FX — ít particle, đúng chỗ: place/remove + path pulse theo ô.
 */

import { ParticleSystem } from '../render/particles.js?v=101';

/**
 * @param {HTMLElement} boardEl
 * @param {object} opts
 * @param {Array<{col:number,row:number}>} [opts.path]
 * @returns {() => void}
 */
export function attachSetupBoardFx(boardEl, opts = {}) {
  const stage = boardEl.querySelector('.board-stage') || boardEl;
  let canvas = boardEl.querySelector('.board-fx');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'board-fx';
    canvas.setAttribute('aria-hidden', 'true');
    boardEl.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  const particles = new ParticleSystem();
  let running = true;
  let last = performance.now();
  let pathPhase = 0;
  let raf = 0;
  let pathCells = opts.path || [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = boardEl.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas._cssW = w;
    canvas._cssH = h;
  }

  function boardPointFromCell(cellEl) {
    const br = boardEl.getBoundingClientRect();
    const cr = cellEl.getBoundingClientRect();
    return {
      x: cr.left - br.left + cr.width / 2,
      y: cr.top - br.top + cr.height / 2,
    };
  }

  function cellElAt(col, row) {
    return boardEl.querySelector(`.grid-cell[data-col="${col}"][data-row="${row}"]`);
  }

  function burstAtCell(cellEl, color, kind = 'place') {
    if (!cellEl) return;
    const p = boardPointFromCell(cellEl);
    if (kind === 'place') {
      particles.burst(p.x, p.y, color || '#c9a05a');
      particles.magic(p.x, p.y - 4, color || '#9a6b2a');
    } else if (kind === 'remove') {
      particles.death(p.x, p.y, color || '#7a7164');
    } else {
      particles.hit(p.x, p.y, color || '#f7f1e6');
    }
  }

  function burstAt(col, row, color, kind) {
    burstAtCell(cellElAt(col, row), color, kind);
  }

  function floatCost(cellEl, text, color) {
    if (!cellEl) return;
    const p = boardPointFromCell(cellEl);
    const el = document.createElement('span');
    el.className = 'board-float';
    el.textContent = text;
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.style.color = color || '#2f6f5e';
    el.style.textShadow = '0 1px 0 #f7f1e6';
    boardEl.appendChild(el);
    requestAnimationFrame(() => el.classList.add('go'));
    setTimeout(() => el.remove(), 700);
  }

  function drawPathPulse() {
    if (!pathCells.length) return;
    const n = pathCells.length;
    const idx = Math.floor(((pathPhase % 1) + 1) % 1 * n);
    for (let i = 0; i < n; i++) {
      const cell = pathCells[i];
      const el = cellElAt(cell.col, cell.row);
      if (!el || el.classList.contains('wall-cell')) continue;
      const p = boardPointFromCell(el);
      const dist = Math.min(Math.abs(i - idx), Math.abs(i - idx + n), Math.abs(i - idx - n));
      const a = Math.max(0, 0.45 - dist * 0.12);
      if (a <= 0.02) continue;
      ctx.beginPath();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#2f6f5e';
      ctx.arc(p.x, p.y, 3.5 + (i === idx ? 2.5 : 0), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** Soft sparkle only on hovered water / buff cells */
  function sparkleHover(dt) {
    const hover = boardEl.querySelector('.grid-cell.hover-preview');
    if (!hover || Math.random() > dt * 3) return;
    const isWater = hover.classList.contains('terrain-WATER');
    const isBuff = hover.classList.contains('buff-monster') || hover.classList.contains('buff-hero');
    if (!isWater && !isBuff) return;
    const p = boardPointFromCell(hover);
    particles.emit(p.x + (Math.random() - 0.5) * 12, p.y + (Math.random() - 0.5) * 12, {
      count: 1,
      colors: isWater ? ['#5a8a82', '#7ea8a0'] : ['#2f6f5e', '#9a6b2a'],
      speed: 12,
      life: 0.6,
      size: 2,
      gravity: isWater ? -12 : -6,
      shape: 'circle',
    });
  }

  function loop(ts) {
    if (!running) return;
    let dt = (ts - last) / 1000;
    last = ts;
    if (dt > 0.05) dt = 0.05;
    pathPhase += dt * 0.7;
    sparkleHover(dt);
    particles.update(dt);
    const w = canvas._cssW || 1;
    const h = canvas._cssH || 1;
    ctx.clearRect(0, 0, w, h);
    drawPathPulse();
    particles.draw(ctx);
    raf = requestAnimationFrame(loop);
  }

  resize();
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  raf = requestAnimationFrame(loop);

  boardEl._setupFx = {
    burstAtCell,
    burstAt,
    floatCost,
    setPath(path) {
      pathCells = path || [];
    },
    sparkleSelect(color) {
      const w = canvas._cssW || 100;
      const h = canvas._cssH || 100;
      particles.magic(w * 0.5, 28, color || '#9a6b2a');
    },
  };

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    particles.clear();
    boardEl._setupFx = null;
    if (canvas.parentNode) canvas.remove();
  };
}

