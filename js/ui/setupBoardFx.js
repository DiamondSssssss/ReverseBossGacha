/**
 * Interactive FX for setup board — ambient particles, place/remove bursts, path shimmer.
 */

import { ParticleSystem } from '../render/particles.js';

const TERRAIN_AMBIENT = {
  WATER: { colors: ['#4db6ac', '#80cbc4', '#e0f2f1'], rate: 14, shape: 'circle', gravity: -8 },
  LOW_CEILING: { colors: ['#a1887f', '#d7ccc8', '#efebe9'], rate: 8, shape: 'square', gravity: 25 },
  DARK: { colors: ['#5c6bc0', '#7986cb', '#9fa8da'], rate: 10, shape: 'star', gravity: -20 },
  HIGH: { colors: ['#ffe082', '#fff8e1', '#ffcc80'], rate: 9, shape: 'spark', gravity: -15 },
  NORMAL: { colors: ['#bcaaa4', '#d7ccc8'], rate: 6, shape: 'circle', gravity: 10 },
};

/**
 * @param {HTMLElement} boardEl - .room-board
 * @param {object} opts
 * @returns {() => void} dispose
 */
export function attachSetupBoardFx(boardEl, opts = {}) {
  const terrain = opts.terrain || 'NORMAL';
  const stage = boardEl.querySelector('.board-stage');
  if (!stage) return () => {};

  let canvas = boardEl.querySelector('.board-fx');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'board-fx';
    canvas.setAttribute('aria-hidden', 'true');
    boardEl.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  const particles = new ParticleSystem();
  const ambient = TERRAIN_AMBIENT[terrain] || TERRAIN_AMBIENT.NORMAL;

  let running = true;
  let last = performance.now();
  let pathPhase = 0;
  let raf = 0;

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

  function burstAtCell(cellEl, color, kind = 'place') {
    const p = boardPointFromCell(cellEl);
    if (kind === 'place') {
      particles.burst(p.x, p.y, color || '#ffe082');
      particles.magic(p.x, p.y, color || '#ffd54f');
    } else if (kind === 'remove') {
      particles.death(p.x, p.y, color || '#90a4ae');
    } else {
      particles.hit(p.x, p.y, color || '#fff');
    }
  }

  function ambientTick(dt, w, h) {
    const n = ambient.rate * dt;
    if (Math.random() > n) return;
    particles.emit(Math.random() * w, h * (0.25 + Math.random() * 0.6), {
      count: 1 + ((Math.random() * 2) | 0),
      colors: ambient.colors,
      speed: 18 + Math.random() * 25,
      life: 1.1,
      size: 2 + Math.random() * 2,
      gravity: ambient.gravity,
      shape: ambient.shape,
      angle: terrain === 'WATER' ? -Math.PI / 2 : Math.random() * Math.PI * 2,
      spread: terrain === 'WATER' ? 0.6 : Math.PI * 2,
    });
  }

  function drawPathShimmer(w, h) {
    const grid = boardEl.querySelector('.grid-board');
    if (!grid) return;
    const br = boardEl.getBoundingClientRect();
    const gr = grid.getBoundingClientRect();
    const gx = gr.left - br.left;
    const gy = gr.top - br.top;
    const gw = gr.width;
    const gh = gr.height;

    ctx.save();
    ctx.globalAlpha = 0.22;
    const midY = gy + gh / 2;
    const grad = ctx.createLinearGradient(gx, midY, gx + gw, midY);
    const t = (pathPhase % 1 + 1) % 1;
    grad.addColorStop(Math.max(0, t - 0.15), 'rgba(255,213,79,0)');
    grad.addColorStop(t, 'rgba(255,213,79,0.85)');
    grad.addColorStop(Math.min(1, t + 0.15), 'rgba(255,213,79,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(gx, midY - 3, gw, 6);

    // flowing chevrons
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#2f6f5e';
    const step = gw / 6;
    for (let i = 0; i < 6; i++) {
      const x = gx + i * step + ((pathPhase * step) % step);
      ctx.beginPath();
      ctx.moveTo(x, midY - 5);
      ctx.lineTo(x + 8, midY);
      ctx.lineTo(x, midY + 5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function loop(ts) {
    if (!running) return;
    let dt = (ts - last) / 1000;
    last = ts;
    if (dt > 0.05) dt = 0.05;

    const w = canvas._cssW || 1;
    const h = canvas._cssH || 1;
    pathPhase += dt * 0.55;
    ambientTick(dt, w, h);
    particles.update(dt);

    ctx.clearRect(0, 0, w, h);
    drawPathShimmer(w, h);
    particles.draw(ctx);

    raf = requestAnimationFrame(loop);
  }

  resize();
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  raf = requestAnimationFrame(loop);

  // Public hooks hung on board for setup.js
  boardEl._setupFx = {
    burstAtCell,
    sparkleSelect(color) {
      const w = canvas._cssW || 100;
      const h = canvas._cssH || 100;
      particles.magic(w * 0.5, h * 0.35, color || '#ffd54f');
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
