import { GACHA, RARITY_COLORS, RARITY_LABELS } from '../data/constants.js?v=115';
import { tryPull } from '../core/gacha.js?v=115';
import { evaluateAchievements } from '../core/achievements.js?v=115';
import { monsterSpriteUrl, getLockedMonsterSprite, getSpriteDataUrl } from '../render/sprites.js?v=115';

const CHARGE_MS = {
  1: 700,
  2: 900,
  3: 1100,
  4: 1400,
  5: 1800,
  6: 2200,
};

const REVEAL_STAGGER = {
  1: 180,
  2: 260,
  3: 380,
  4: 520,
  5: 700,
  6: 900,
};

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

function maxRarity(results) {
  return results.reduce((m, r) => Math.max(m, r.monster.rarity), 1);
}

function rarityTitle(r) {
  if (r >= 6) return 'MYTHIC';
  if (r >= 5) return 'LEGENDARY';
  if (r >= 4) return 'EPIC';
  if (r >= 3) return 'RARE+';
  if (r >= 2) return 'RARE';
  return 'COMMON';
}

export function renderGacha(root, ctx) {
  const { state, toast, refreshChrome, announceAchievements } = ctx;
  let busy = false;
  /** @type {AbortController | null} */
  let abortCtrl = null;

  function paintChrome() {
    if (state.mythicPityCounter == null) state.mythicPityCounter = 0;
    if (state.rainbowPityCounter == null) state.rainbowPityCounter = 0;
    const pityPct = Math.min(100, (state.pityCounter / GACHA.PITY_THRESHOLD) * 100);
    const mythicPct = Math.min(
      100,
      (state.mythicPityCounter / GACHA.MYTHIC_PITY_THRESHOLD) * 100
    );
    const rainbowPct = Math.min(
      100,
      (state.rainbowPityCounter / GACHA.RAINBOW_PITY_THRESHOLD) * 100
    );
    const pityEl = root.querySelector('#pity-count');
    const pityBar = root.querySelector('#pity-bar-fill');
    const mythicEl = root.querySelector('#mythic-pity-count');
    const mythicBar = root.querySelector('#mythic-pity-bar-fill');
    const rainbowEl = root.querySelector('#rainbow-pity-count');
    const rainbowBar = root.querySelector('#rainbow-pity-bar-fill');
    const soulsHint = root.querySelector('#souls-hint');
    if (pityEl) pityEl.textContent = `${state.pityCounter}/${GACHA.PITY_THRESHOLD}`;
    if (pityBar) pityBar.style.width = `${pityPct}%`;
    if (mythicEl) {
      mythicEl.textContent = `${state.mythicPityCounter}/${GACHA.MYTHIC_PITY_THRESHOLD}`;
    }
    if (mythicBar) mythicBar.style.width = `${mythicPct}%`;
    if (rainbowEl) {
      rainbowEl.textContent = `${state.rainbowPityCounter}/${GACHA.RAINBOW_PITY_THRESHOLD}`;
    }
    if (rainbowBar) rainbowBar.style.width = `${rainbowPct}%`;
    if (soulsHint) {
      soulsHint.innerHTML =
        state.souls < GACHA.PULL_COST_SOULS
          ? `<p class="economy-zero" style="margin-top:10px">Chưa đủ Linh Hồn (${state.souls}/${GACHA.PULL_COST_SOULS}). Về Sảnh → Mở cổng ải để kiếm.</p>`
          : '';
    }
  }

  root.innerHTML = `
    <div class="gacha-hero">
      <p class="section-label" style="margin-top:0">Gacha</p>
      <h2>Quay ấn quái</h2>
      <p class="muted">Dùng <strong>Linh Hồn</strong>. Pity ${GACHA.PITY_THRESHOLD} → 5★ · Pity Mythic ${GACHA.MYTHIC_PITY_THRESHOLD} → 6★ · Pity Cầu vồng ${GACHA.RAINBOW_PITY_THRESHOLD} → 7★.</p>
      <div id="souls-hint"></div>
    </div>

    <div class="gacha-stage" id="gacha-stage">
      <canvas class="gacha-fx" id="gacha-fx" aria-hidden="true"></canvas>
      <div class="gacha-rings" aria-hidden="true"></div>
      <div class="gacha-orb" id="gacha-orb">
        <span class="orb-core"></span>
        <span class="orb-glow"></span>
      </div>
      <p class="gacha-stage-hint" id="stage-hint">Chạm Quay để mở ấn</p>
    </div>

    <div class="pity-wrap">
      <div class="row spread">
        <span><strong>Pity 5★</strong> <span id="pity-count">${state.pityCounter}/${GACHA.PITY_THRESHOLD}</span></span>
        <span class="muted">${GACHA.PULL_COST_SOULS} / lần · ${GACHA.PULL10_COST_SOULS} / ×10</span>
      </div>
      <div class="pity-bar"><span id="pity-bar-fill" style="width:${Math.min(100, ((state.pityCounter || 0) / GACHA.PITY_THRESHOLD) * 100)}%"></span></div>
      <div class="row spread" style="margin-top:8px">
        <span><strong>Pity Mythic</strong> <span id="mythic-pity-count">${state.mythicPityCounter || 0}/${GACHA.MYTHIC_PITY_THRESHOLD}</span></span>
        <span class="muted">6★ · có drawback</span>
      </div>
      <div class="pity-bar mythic"><span id="mythic-pity-bar-fill" style="width:${Math.min(100, ((state.mythicPityCounter || 0) / GACHA.MYTHIC_PITY_THRESHOLD) * 100)}%"></span></div>
      <div class="row spread" style="margin-top:8px">
        <span><strong>Pity Cầu vồng</strong> <span id="rainbow-pity-count">${state.rainbowPityCounter || 0}/${GACHA.RAINBOW_PITY_THRESHOLD}</span></span>
        <span class="muted">7★ · không xóa pity Mythic</span>
      </div>
      <div class="pity-bar mythic"><span id="rainbow-pity-bar-fill" style="width:${Math.min(100, ((state.rainbowPityCounter || 0) / GACHA.RAINBOW_PITY_THRESHOLD) * 100)}%"></span></div>
    </div>

    <div class="pull-actions">
      <button type="button" class="primary" id="btn-pull1">Quay ×1</button>
      <button type="button" id="btn-pull10">Quay ×10</button>
    </div>
    <div class="pull-results" id="pull-results"></div>

    <div class="gacha-reveal" id="gacha-reveal" hidden>
      <div class="reveal-backdrop"></div>
      <div class="reveal-panel">
        <p class="reveal-banner" id="reveal-banner"></p>
        <div class="reveal-stage" id="reveal-stage"></div>
        <div class="reveal-actions">
          <button type="button" class="ghost" id="btn-skip-reveal">Bỏ qua</button>
          <button type="button" class="primary" id="btn-close-reveal" hidden>Xong</button>
        </div>
      </div>
    </div>
  `;

  paintChrome();

  const stage = root.querySelector('#gacha-stage');
  const orb = root.querySelector('#gacha-orb');
  const fxCanvas = root.querySelector('#gacha-fx');
  const stageHint = root.querySelector('#stage-hint');
  const resultsEl = root.querySelector('#pull-results');
  const revealEl = root.querySelector('#gacha-reveal');
  const revealStage = root.querySelector('#reveal-stage');
  const revealBanner = root.querySelector('#reveal-banner');
  const btnSkip = root.querySelector('#btn-skip-reveal');
  const btnClose = root.querySelector('#btn-close-reveal');
  const btn1 = root.querySelector('#btn-pull1');
  const btn10 = root.querySelector('#btn-pull10');

  const fx = setupGachaFx(fxCanvas, stage);

  function setBusy(v) {
    busy = v;
    btn1.disabled = v;
    btn10.disabled = v;
  }

  function showResultsGrid(results) {
    resultsEl.innerHTML = results
      .map((r, i) => {
        const m = r.monster;
        const stars = '★'.repeat(m.rarity);
        return `
          <div class="pull-card r${m.rarity} ${r.isNew ? 'is-new' : ''} ${r.refunded ? 'is-refund' : ''}" style="animation-delay:${i * 0.04}s;border-color:${RARITY_COLORS[m.rarity]}">
            ${r.isNew ? '<span class="new-badge">MỚI</span>' : ''}
            ${r.refunded ? `<span class="refund-badge">+${r.soulsRefunded} LH</span>` : ''}
            <img class="pull-sprite" src="${monsterSpriteUrl(m.id, m.color, m.rarity)}" alt="" width="52" height="52" />
            <div class="stars" style="color:${m.rarity >= 7 ? '#e040fb' : m.rarity >= 5 ? (m.rarity >= 6 ? '#ef5350' : '#e6b84a') : RARITY_COLORS[m.rarity]}">${stars}</div>
            <div style="font-weight:700;font-family:var(--font-display)">${m.name}</div>
            <div class="muted" style="font-size:0.75rem">${RARITY_LABELS[m.rarity]}${r.rainbowPityHit ? ' · Rainbow Pity' : r.mythicPityHit ? ' · Mythic Pity' : r.naturalMythic ? ' · Mythic (reset pity)' : r.pityHit ? ' · Pity' : ''}${r.refunded ? ' · Trùng' : ''}${m.drawback ? ' · ⚠' : ''}</div>
          </div>`;
      })
      .join('');
  }

  function buildRevealCard(r, faceDown = true) {
    const m = r.monster;
    const lockedUrl = getSpriteDataUrl(getLockedMonsterSprite(m.rarity));
    const openUrl = monsterSpriteUrl(m.id, m.color, m.rarity);
    return `
      <div class="reveal-card r${m.rarity} ${r.isNew ? 'is-new' : ''} ${r.refunded ? 'is-refund' : ''} ${faceDown ? 'face-down' : 'revealed'}" data-rarity="${m.rarity}">
        <div class="reveal-card-inner">
          <div class="reveal-face back">
            <img src="${lockedUrl}" alt="?" width="72" height="72" />
            <span class="back-stars">${'★'.repeat(m.rarity)}</span>
          </div>
          <div class="reveal-face front" style="--rc:${RARITY_COLORS[m.rarity]}">
            ${r.isNew ? '<span class="new-badge">MỚI</span>' : ''}
            ${r.mythicPityHit ? '<span class="pity-badge mythic">MYTHIC PITY</span>' : r.naturalMythic ? '<span class="pity-badge mythic">MYTHIC</span>' : r.pityHit ? '<span class="pity-badge">PITY</span>' : ''}
            ${r.refunded ? `<span class="refund-badge">+${r.soulsRefunded} LH</span>` : ''}
            <div class="reveal-rays" aria-hidden="true"></div>
            <img class="reveal-sprite" src="${openUrl}" alt="" width="88" height="88" />
            <div class="reveal-stars" style="color:${m.rarity >= 6 ? '#ef5350' : m.rarity >= 5 ? '#ffd54f' : RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)}</div>
            <strong class="reveal-name">${m.name}</strong>
            <span class="reveal-meta">${RARITY_LABELS[m.rarity]} · C${m.cost}${r.refunded ? ' · Trùng' : ''}</span>
            ${m.drawback ? `<span class="reveal-drawback">⚠ ${m.drawback}</span>` : ''}
          </div>
        </div>
      </div>`;
  }

  async function runRevealSequence(results, signal) {
    const top = maxRarity(results);
    revealEl.hidden = false;
    revealEl.className = `gacha-reveal show rarity-glow-${top}`;
    btnClose.hidden = true;
    btnSkip.hidden = false;
    revealBanner.textContent = rarityTitle(top);
    revealBanner.className = `reveal-banner rb${top}`;
    revealStage.className = `reveal-stage count-${Math.min(results.length, 10)}`;
    revealStage.innerHTML = results.map((r) => buildRevealCard(r, true)).join('');

    const cards = [...revealStage.querySelectorAll('.reveal-card')];

    // Sort reveal order: low → high so climax last (or keep pull order for ×10 feel)
    // Keep pull order but pause longer on high rarity
    for (let i = 0; i < cards.length; i++) {
      if (signal.aborted) break;
      const card = cards[i];
      const rarity = Number(card.getAttribute('data-rarity')) || 1;
      const r = results[i];

      card.classList.add('pending');
      fx.burst(rarity);
      if (rarity >= 4) fx.shake(stage, rarity >= 6 ? 24 : rarity >= 5 ? 18 : 10);
      if (rarity >= 5) document.body.classList.add('gacha-boss-flash');

      await sleep(Math.min(280, REVEAL_STAGGER[rarity] * 0.45), signal).catch(() => {});
      if (signal.aborted) break;

      card.classList.remove('face-down', 'pending');
      card.classList.add('revealed', `flip-r${rarity}`);
      if (r.isNew) card.classList.add('unlock-pop');

      stageHint.textContent = r.isNew ? `Mở khóa: ${r.monster.name}` : r.monster.name;
      await sleep(REVEAL_STAGGER[rarity], signal).catch(() => {});
      document.body.classList.remove('gacha-boss-flash');
    }

    // If skipped mid-way, flip all remaining
    cards.forEach((card) => {
      card.classList.remove('face-down', 'pending');
      card.classList.add('revealed');
    });

    btnSkip.hidden = true;
    btnClose.hidden = false;
    revealBanner.textContent =
      top >= 6 ? 'Ấn Mythic đã mở!' : top >= 5 ? 'Ấn Legendary!' : top >= 4 ? 'Ấn Epic!' : 'Kết quả quay';
  }

  async function doPull(count) {
    if (busy) return;
    const res = tryPull(state, count);
    if (res.error) {
      toast(res.error);
      return;
    }

    setBusy(true);
    abortCtrl?.abort();
    abortCtrl = new AbortController();
    const { signal } = abortCtrl;

    resultsEl.innerHTML = '';
    const top = maxRarity(res.results);
    stageHint.textContent = top >= 5 ? 'Ấn Boss đang thức…' : top >= 4 ? 'Ấn Epic rung chuyển…' : 'Đang mở ấn…';

    orb.classList.remove('spin', 'charge-1', 'charge-2', 'charge-3', 'charge-4', 'charge-5');
    void orb.offsetWidth;
    orb.classList.add('spin', `charge-${top}`);
    stage.classList.add('charging', `glow-${top}`);
    fx.startCharge(top);

    try {
      await sleep(CHARGE_MS[top] || 900, signal);
    } catch {
      /* skipped */
    }

    fx.stopCharge();
    orb.classList.remove('spin', `charge-${top}`);
    stage.classList.remove('charging', `glow-${top}`);

    try {
      await runRevealSequence(res.results, signal);
    } catch {
      // user skipped — still show all cards face up
      const cards = revealStage.querySelectorAll('.reveal-card');
      cards.forEach((c) => {
        c.classList.remove('face-down', 'pending');
        c.classList.add('revealed');
      });
      btnSkip.hidden = true;
      btnClose.hidden = false;
    }

    showResultsGrid(res.results);
    paintChrome();
    refreshChrome();
    const unlocked = evaluateAchievements(state);
    announceAchievements?.(unlocked);

    if (res.results.some((r) => r.monster.rarity === 5)) toast('Boss xuất hiện!');
    else if (res.results.some((r) => r.isNew && r.monster.rarity >= 4)) toast('Mở khóa ấn hiếm!');
    const refundTotal = res.results.reduce((s, r) => s + (r.soulsRefunded || 0), 0);
    if (refundTotal > 0) toast(`Trùng cap ×3 — hoàn ${refundTotal} Linh Hồn`);

    stageHint.textContent = 'Chạm Quay để mở ấn';
    // keep reveal open until user closes
  }

  function closeReveal() {
    revealEl.hidden = true;
    revealEl.className = 'gacha-reveal';
    document.body.classList.remove('gacha-boss-flash');
    setBusy(false);
    abortCtrl = null;
  }

  btnSkip.onclick = () => abortCtrl?.abort();
  btnClose.onclick = () => closeReveal();
  revealEl.querySelector('.reveal-backdrop').onclick = () => {
    if (!btnClose.hidden) closeReveal();
    else abortCtrl?.abort();
  };

  btn1.onclick = () => doPull(1);
  btn10.onclick = () => doPull(10);
}

function setupGachaFx(canvas, stage) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf = 0;
  let charging = false;
  let chargeRarity = 1;
  let last = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = stage.getBoundingClientRect();
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
    canvas.style.width = `${r.width}px`;
    canvas.style.height = `${r.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas._w = r.width;
    canvas._h = r.height;
  }

  function colorsFor(r) {
    if (r >= 5) return ['#ffd54f', '#ff8f00', '#fff8e1', '#ffecb3'];
    if (r >= 4) return ['#ce93d8', '#7e57c2', '#e1bee7', '#fff'];
    if (r >= 3) return ['#81c784', '#2f6f5e', '#c8e6c9'];
    if (r >= 2) return ['#4db6ac', '#80cbc4', '#e0f2f1'];
    return ['#bcaaa4', '#efebe9', '#8d6e63'];
  }

  function emit(x, y, rarity, count = 12) {
    const cols = colorsFor(rarity);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * (30 + rarity * 18);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.5 + Math.random() * 0.5,
        ttl: 0.5 + Math.random() * 0.5,
        size: 2 + Math.random() * (1 + rarity * 0.6),
        color: cols[(Math.random() * cols.length) | 0],
        g: rarity >= 4 ? -20 : 40,
      });
    }
  }

  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    const w = canvas._w || 1;
    const h = canvas._h || 1;
    ctx.clearRect(0, 0, w, h);

    if (charging) {
      const cx = w / 2;
      const cy = h / 2;
      if (Math.random() < 0.35 + chargeRarity * 0.08) {
        emit(cx, cy, chargeRarity, 2 + chargeRarity);
      }
      const pulse = 0.5 + Math.sin(ts / 120) * 0.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 48 + chargeRarity * 6 + pulse * 8, 0, Math.PI * 2);
      ctx.strokeStyle = colorsFor(chargeRarity)[0];
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.ttl -= dt;
      if (p.ttl <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.globalAlpha = Math.max(0, p.ttl / p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(loop);

  return {
    startCharge(rarity) {
      charging = true;
      chargeRarity = rarity;
      resize();
      emit((canvas._w || 100) / 2, (canvas._h || 100) / 2, rarity, 10 + rarity * 3);
    },
    stopCharge() {
      charging = false;
    },
    burst(rarity) {
      emit((canvas._w || 100) / 2, (canvas._h || 100) / 2, rarity, 14 + rarity * 5);
    },
    shake(el, amp = 8) {
      el.classList.remove('screen-shake');
      void el.offsetWidth;
      el.style.setProperty('--shake-amp', `${amp}px`);
      el.classList.add('screen-shake');
      setTimeout(() => el.classList.remove('screen-shake'), 450);
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    },
  };
}

