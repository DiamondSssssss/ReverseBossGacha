/**
 * Tutorial tận tay — coach overlay trên UI thật (hub → scout → setup → combat).
 * Người chơi bấm / thả / chọn đúng chỗ mới sang bước tiếp.
 */

import { totalPlacements } from '../core/dungeon.js?v=130';
import { loadoutUnitCount } from '../core/loadout.js?v=130';

/** @typedef {'click' | 'condition' | 'next' | 'either'} AdvanceMode */

/**
 * @type {Array<{
 *   id: string,
 *   title: string,
 *   body: string,
 *   screen?: string,
 *   target?: string | (() => string | null),
 *   advance?: AdvanceMode,
 *   allowNext?: boolean,
 *   prepare?: (ctx: object) => void,
 *   ready?: (ctx: object) => boolean,
 *   pauseCombat?: boolean,
 * }>}
 */
export const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Chào Sếp Tổng!',
    body: 'Bạn là <strong>chủ hầm</strong>, không phải Hero. Làm theo từng bước — bấm đúng chỗ được khoanh sáng.',
    advance: 'next',
    allowNext: true,
  },
  {
    id: 'hub_play',
    screen: 'hub',
    title: 'Mở cổng ải',
    body: 'Bấm <strong>Mở cổng ải</strong> để chọn ải (Thường/Khó), rồi vào Trinh sát.',
    target: '#btn-play',
    advance: 'condition',
    prepare: (ctx) => {
      if (ctx.currentScreen?.() !== 'hub') ctx.go('hub');
    },
    ready: (ctx) => {
      const s = ctx.currentScreen?.();
      return s === 'stages' || s === 'scout';
    },
  },
  {
    id: 'scout_enemy',
    screen: 'scout',
    title: 'Xem địch trước',
    body: 'Đây là đội Hero sẽ xông vào. Nhìn class (Pháp sư / Chiến sĩ / Đạo tặc) để biết mang gì khắc chế.',
    target: '.hero-formation, .formation-march, .scout-lead',
    advance: 'next',
    allowNext: true,
    prepare: (ctx) => {
      if (!ctx.run) ctx.startRun();
      if (ctx.currentScreen?.() !== 'scout') ctx.go('scout');
    },
  },
  {
    id: 'scout_loadout',
    screen: 'scout',
    title: 'Chọn loadout',
    body: 'Chạm một quái trong kho để <strong>thêm vào loadout</strong> (hoặc bấm Gợi ý). Pool mang ≈3× Cap — trên sân chỉ ≤ Cap; phần dư thả trong trận.',
    target: () =>
      document.querySelector('.loadout-pick:not([disabled])')
        ? '.loadout-pick:not([disabled])'
        : '#btn-loadout-suggest',
    advance: 'condition',
    ready: (ctx) => loadoutUnitCount(ctx.run?.loadout) > 0,
  },
  {
    id: 'scout_to_setup',
    screen: 'scout',
    title: 'Sang xếp trận',
    body: 'Loadout xong → bấm <strong>Xếp trận với loadout này</strong>.',
    target: '#btn-to-setup',
    advance: 'condition',
    ready: (ctx) => ctx.currentScreen?.() === 'setup',
  },
  {
    id: 'setup_tray',
    screen: 'setup',
    title: 'Khay quái',
    body: 'Chọn một quái trong <strong>khay dưới</strong> (chỉ quái đã mang trong loadout).',
    target: '.tray-item, .monster-tray .tray-item',
    advance: 'condition',
    prepare: (ctx) => {
      if (ctx.currentScreen?.() !== 'setup') ctx.go('setup');
    },
    ready: (ctx) => !!ctx.run?.selectedMonsterId || totalPlacements(ctx.run) > 0,
  },
  {
    id: 'setup_place',
    screen: 'setup',
    title: 'Thả lên map',
    body: 'Chạm một <strong>ô trống</strong> trên map (hoặc kéo từ khay) để đặt quái. Cost sân không vượt Cap.',
    target: '.grid-cell.empty.can-drop, .grid-cell.empty[data-placeable="1"]',
    advance: 'condition',
    ready: (ctx) => totalPlacements(ctx.run) > 0,
  },
  {
    id: 'setup_start',
    screen: 'setup',
    title: 'Vào chiến đấu',
    body: 'Quái còn trong khay = <strong>tay bài trong trận</strong>. Bấm <strong>START</strong> khi sẵn sàng.',
    target: '#btn-start',
    advance: 'condition',
    ready: (ctx) => ctx.currentScreen?.() === 'combat',
  },
  {
    id: 'combat_cost',
    screen: 'combat',
    title: 'Cost sân',
    body: 'Ô <strong>Cost sân</strong> = chỗ đang chiếm. Quái chết → mở slot → thả thêm từ tay bài.',
    target: '#hud-cost',
    advance: 'next',
    allowNext: true,
    pauseCombat: true,
  },
  {
    id: 'combat_hand',
    screen: 'combat',
    title: 'Tay bài',
    body: 'Chọn quái ở đây rồi <strong>chạm map</strong> để thả (chỉ khi còn slot Cost). Không mang dư cũng không sao — học cách này cho lần sau.',
    target: '.deploy-row, #deploy-hand',
    advance: 'next',
    allowNext: true,
    pauseCombat: true,
  },
  {
    id: 'combat_spell',
    screen: 'combat',
    title: 'Skill boss',
    body: 'Hai nút phép là skill của boss bạn chọn ở Sảnh. Bấm thử một phép (hoặc Tiếp nếu đang cooldown).',
    target: '#spell-row',
    advance: 'either',
    allowNext: true,
    pauseCombat: true,
  },
  {
    id: 'combat_go',
    screen: 'combat',
    title: 'Giữ kho báu!',
    body: 'Hero vào từ Cổng → kho bên phải. Dùng tốc độ ×2/×3 nếu muốn. <strong>Thắng/thua đều ra Linh Hồn</strong> để quay Gacha.',
    target: '#combat-canvas',
    advance: 'next',
    allowNext: true,
    pauseCombat: true,
  },
  {
    id: 'economy',
    title: 'Ba nguyên liệu',
    body: '<ul class="tut-list"><li><strong>Linh Hồn</strong> — thắng/thua → Gacha</li><li><strong>Vàng</strong> — nâng quái trong Kho</li><li><strong>Gem</strong> — nâng Cap hầm ở Sảnh</li></ul>Xong hướng dẫn — giữ kho &amp; phá đảo ải 40!',
    target: '#resources, .combat-hud',
    advance: 'next',
    allowNext: true,
    pauseCombat: true,
  },
];

/** Legacy text steps (fallback / achievements replay short) */
export const TUTORIAL_STEPS = TOUR_STEPS.map((s) => ({
  id: s.id,
  title: s.title,
  body: s.body,
}));

export const SCREEN_TIPS = {
  hub: 'LH = Gacha · Vàng = nâng quái · Gem = nâng hầm. Bấm “Xem hướng dẫn” để học tận tay.',
  gacha: '100 LH/lần. Mỗi loại tối đa ×3; quay dư → hoàn Linh Hồn.',
  collection: 'Kho: nâng quái bằng Vàng (+HP/ATK). Cap sở hữu ×3/loại.',
  leaderboard: 'BXH xếp theo ải đã vượt + số loại quái unique. Bấm tên để xem hồ sơ & bộ sưu tập.',
  achievements: 'Ấn chương thưởng Gem. Gem dùng cải tạo hầm.',
};

let activeTour = null;

function resolveTarget(step) {
  const t = typeof step.target === 'function' ? step.target() : step.target;
  if (!t) return null;
  return document.querySelector(t);
}

function padRect(r, pad = 6) {
  return {
    top: Math.max(8, r.top - pad),
    left: Math.max(8, r.left - pad),
    width: Math.min(window.innerWidth - 16, r.width + pad * 2),
    height: Math.min(window.innerHeight - 16, r.height + pad * 2),
  };
}

/**
 * Bắt đầu tour tận tay trên UI thật.
 * @param {object} ctx — bag từ main (go, startRun, state, saveState, toast, …)
 * @param {{ onDone?: () => void }} opts
 */
export function startGuidedTour(ctx, { onDone } = {}) {
  stopGuidedTour();

  const root = document.createElement('div');
  root.id = 'coach-root';
  root.className = 'coach-root';
  root.innerHTML = `
    <div class="coach-spotlight" id="coach-spot" hidden></div>
    <div class="coach-card" id="coach-card" role="dialog" aria-live="polite">
      <div class="coach-progress" id="coach-progress"></div>
      <h3 id="coach-title"></h3>
      <div class="coach-body" id="coach-body"></div>
      <div class="coach-actions">
        <button type="button" class="ghost" id="coach-skip">Bỏ qua</button>
        <button type="button" class="primary" id="coach-next" hidden>Tiếp</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  let i = 0;
  let clickHandler = null;
  let conditionTimer = 0;
  let layoutTimer = 0;
  let finished = false;

  const spot = root.querySelector('#coach-spot');
  const card = root.querySelector('#coach-card');
  const btnNext = root.querySelector('#coach-next');
  const btnSkip = root.querySelector('#coach-skip');

  function clearListeners() {
    if (clickHandler) {
      document.removeEventListener('click', clickHandler, true);
      clickHandler = null;
    }
    clearInterval(conditionTimer);
    conditionTimer = 0;
    clearInterval(layoutTimer);
    layoutTimer = 0;
  }

  function setCombatPaused(on) {
    try {
      ctx.setCombatPaused?.(!!on);
    } catch {
      /* ignore */
    }
  }

  function placeSpotlight(el) {
    if (!el) {
      spot.hidden = true;
      return;
    }
    const r = padRect(el.getBoundingClientRect());
    spot.hidden = false;
    spot.style.top = `${r.top}px`;
    spot.style.left = `${r.left}px`;
    spot.style.width = `${Math.max(40, r.width)}px`;
    spot.style.height = `${Math.max(36, r.height)}px`;
    el.classList.add('coach-pulse');
  }

  function clearPulse() {
    document.querySelectorAll('.coach-pulse').forEach((n) => n.classList.remove('coach-pulse'));
  }

  function positionCard(el) {
    card.style.bottom = '';
    card.style.top = '';
    // Prefer bottom; if target is low, put card on top
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.bottom > window.innerHeight * 0.55) {
        card.style.bottom = 'auto';
        card.style.top = '12px';
      } else {
        card.style.top = 'auto';
        card.style.bottom = '12px';
      }
    } else {
      card.style.top = 'auto';
      card.style.bottom = '12px';
    }
  }

  function advance() {
    if (finished) return;
    clearPulse();
    setCombatPaused(false);
    i += 1;
    if (i >= TOUR_STEPS.length) {
      finish(true);
      return;
    }
    paint();
  }

  function finish(completed) {
    if (finished) return;
    finished = true;
    clearListeners();
    clearPulse();
    setCombatPaused(false);
    root.remove();
    activeTour = null;
    onDone?.({ completed: !!completed });
  }

  function paint() {
    clearListeners();
    clearPulse();

    const step = TOUR_STEPS[i];
    root.querySelector('#coach-progress').textContent = `${i + 1} / ${TOUR_STEPS.length}`;
    root.querySelector('#coach-title').textContent = step.title;
    root.querySelector('#coach-body').innerHTML = step.body;

    const showNext = step.allowNext || step.advance === 'next' || step.advance === 'either';
    btnNext.hidden = !showNext;
    btnNext.textContent = i >= TOUR_STEPS.length - 1 ? 'Xong!' : 'Tiếp';

    try {
      step.prepare?.(ctx);
    } catch {
      /* ignore */
    }

    if (step.pauseCombat) setCombatPaused(true);
    else setCombatPaused(false);

    // Đợi DOM screen render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (finished) return;
        const el = resolveTarget(step);
        placeSpotlight(el);
        positionCard(el);
        if (el && 'scrollIntoView' in el) {
          try {
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          } catch {
            /* ignore */
          }
        }

        layoutTimer = window.setInterval(() => {
          const cur = resolveTarget(step);
          placeSpotlight(cur);
          positionCard(cur);
        }, 400);

        const mode = step.advance || 'next';

        if (mode === 'click' || mode === 'either') {
          clickHandler = (e) => {
            const cur = resolveTarget(step);
            if (!cur) return;
            if (!(cur === e.target || cur.contains(e.target))) return;
            // Không advance khi bấm nút disabled / chưa đủ điều kiện
            const btn = e.target.closest?.('button');
            if (btn?.disabled) return;
            if (typeof step.ready === 'function' && mode === 'click' && !step.ready(ctx)) {
              return;
            }
            setTimeout(() => advance(), 100);
          };
          document.addEventListener('click', clickHandler, true);
        }

        if (mode === 'condition' || mode === 'either') {
          conditionTimer = window.setInterval(() => {
            if (step.ready?.(ctx)) advance();
          }, 280);
        }
      });
    });
  }

  btnSkip.onclick = () => finish(false);
  btnNext.onclick = () => {
    const step = TOUR_STEPS[i];
    if (typeof step.ready === 'function' && !step.allowNext && !step.ready(ctx)) {
      ctx.toast?.('Làm bước đang khoanh sáng trước đã');
      return;
    }
    advance();
  };

  activeTour = { finish, advance, root };
  paint();
  return activeTour;
}

export function stopGuidedTour() {
  if (activeTour) {
    activeTour.finish?.(false);
    activeTour = null;
  }
  document.getElementById('coach-root')?.remove();
}

/**
 * Modal text cũ — giữ API; chuyển sang tour tận tay.
 */
export function showTutorial(modalEl, { onDone, startIndex = 0 } = {}) {
  // Dùng guided tour thay modal dài; modalEl không cần
  const ctx = window.__RBG_BAG__;
  if (ctx?.go) {
    startGuidedTour(ctx, {
      onDone: () => onDone?.(),
    });
    return;
  }
  // Fallback modal nếu bag chưa sẵn
  let i = startIndex;
  function paint() {
    const step = TOUR_STEPS[i];
    const isLast = i >= TOUR_STEPS.length - 1;
    modalEl.classList.add('show');
    modalEl.innerHTML = `
      <div class="modal tutorial-modal" role="dialog" aria-labelledby="tut-title">
        <div class="tut-progress">${i + 1} / ${TOUR_STEPS.length}</div>
        <h2 id="tut-title">${step.title}</h2>
        <div class="tut-body">${step.body}</div>
        <div class="row" style="margin-top:16px;justify-content:space-between">
          <button type="button" class="ghost" id="tut-skip">Bỏ qua</button>
          <div class="row">
            ${i > 0 ? '<button type="button" id="tut-prev">Quay lại</button>' : ''}
            <button type="button" class="primary" id="tut-next">${isLast ? 'Bắt đầu chơi!' : 'Tiếp theo'}</button>
          </div>
        </div>
      </div>`;
    modalEl.querySelector('#tut-skip').onclick = () => finish();
    modalEl.querySelector('#tut-next').onclick = () => {
      if (isLast) finish();
      else {
        i += 1;
        paint();
      }
    };
    const prev = modalEl.querySelector('#tut-prev');
    if (prev) {
      prev.onclick = () => {
        i -= 1;
        paint();
      };
    }
  }
  function finish() {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
    onDone?.();
  }
  paint();
}

export function showTipBanner(container, screen, state, { onDismiss } = {}) {
  if (!container) return;
  const tip = SCREEN_TIPS[screen];
  if (!tip) {
    container.innerHTML = '';
    return;
  }
  const dismissed = state.tipsDismissed?.[screen];
  if (dismissed) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="tip-banner" role="note">
      <div class="tip-text">${tip}</div>
      <button type="button" class="tip-close" aria-label="Đóng">✕</button>
    </div>`;
  container.querySelector('.tip-close').onclick = () => {
    if (!state.tipsDismissed) state.tipsDismissed = {};
    state.tipsDismissed[screen] = true;
    onDismiss?.();
    container.innerHTML = '';
  };
}

