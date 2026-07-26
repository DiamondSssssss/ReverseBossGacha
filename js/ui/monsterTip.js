import { RARITY_COLORS, RARITY_LABELS } from '../data/constants.js?v=64';
import { MONSTER_BY_ID } from '../data/monsters.js?v=64';
import {
  displayMonsterStats,
  getMonsterUpgradeLevel,
} from '../core/monsterUpgrade.js?v=64';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** HTML nội dung tip cho 1 quái (đã tính nâng cấp). */
export function monsterTipHtml(monsterOrId, state, extra = {}) {
  const m = typeof monsterOrId === 'string' ? MONSTER_BY_ID[monsterOrId] : monsterOrId;
  if (!m) return '';

  const upLv = state ? getMonsterUpgradeLevel(state, m.id) : 0;
  const st = displayMonsterStats(m, upLv);
  const tags = (m.tags || []).join(' · ') || '—';
  const note = extra.note ? `<div class="mtip-note">${escapeHtml(extra.note)}</div>` : '';

  return `
    <div class="mtip-name" style="--r:${RARITY_COLORS[m.rarity]}">${escapeHtml(m.name)}</div>
    <div class="mtip-rarity" style="color:${RARITY_COLORS[m.rarity]}">
      ${'★'.repeat(m.rarity)} ${RARITY_LABELS[m.rarity] || ''}
      · Cost ${m.cost}${upLv ? ` · Lv↑${upLv}` : ''}
    </div>
    <div class="mtip-stats">
      <span><b>HP</b> ${st.hp}</span>
      <span><b>ATK</b> ${st.atk}</span>
      <span><b>SPD</b> ${st.speed}</span>
      <span><b>RNG</b> ${st.range}</span>
      <span><b>AS</b> ${st.atkSpeed}</span>
    </div>
    <div class="mtip-tags">${escapeHtml(tags)}</div>
    ${m.drawback ? `<div class="mtip-drawback">⚠ ${escapeHtml(m.drawback)}</div>` : ''}
    <div class="mtip-desc">${escapeHtml(m.description || '')}</div>
    ${note}
  `;
}

/** Một dòng gọn cho board-tip / status. */
export function monsterTipLine(monsterOrId, state) {
  const m = typeof monsterOrId === 'string' ? MONSTER_BY_ID[monsterOrId] : monsterOrId;
  if (!m) return '';
  const upLv = state ? getMonsterUpgradeLevel(state, m.id) : 0;
  const st = displayMonsterStats(m, upLv);
  return `${m.name} · C${m.cost}${upLv ? ` · Lv↑${upLv}` : ''} · HP ${st.hp} · ATK ${st.atk} · SPD ${st.speed} · RNG ${st.range}`;
}

let tipEl = null;
let tipHideTimer = 0;

function ensureTipEl() {
  if (tipEl && document.body.contains(tipEl)) return tipEl;
  tipEl = document.createElement('div');
  tipEl.className = 'monster-tip';
  tipEl.setAttribute('role', 'tooltip');
  tipEl.style.display = 'none';
  document.body.appendChild(tipEl);
  return tipEl;
}

function positionTip(anchor) {
  const el = ensureTipEl();
  const rect = anchor.getBoundingClientRect();
  const pad = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  el.style.display = 'block';
  el.style.visibility = 'hidden';
  el.style.left = '0px';
  el.style.top = '0px';

  const tw = Math.max(el.offsetWidth, 200);
  const th = Math.max(el.offsetHeight, 80);

  let left = rect.left + rect.width / 2 - tw / 2;
  let top = rect.bottom + pad;

  // Ưu tiên dưới con trỏ; nếu tràn đáy thì đưa lên trên
  if (top + th > vh - pad) {
    top = rect.top - th - pad;
  }
  if (top < pad) top = pad;
  if (left < pad) left = pad;
  if (left + tw > vw - pad) left = Math.max(pad, vw - pad - tw);

  el.style.left = `${Math.round(left)}px`;
  el.style.top = `${Math.round(top)}px`;
  el.style.visibility = 'visible';
}

export function showMonsterTip(anchor, monsterOrId, state, extra) {
  const html = monsterTipHtml(monsterOrId, state, extra);
  if (!html || !anchor) return;
  clearTimeout(tipHideTimer);
  const el = ensureTipEl();
  el.innerHTML = html;
  positionTip(anchor);
  // force reflow rồi mới bật class để transition chạy
  void el.offsetWidth;
  el.classList.add('show');
}

export function hideMonsterTip(immediate = false) {
  clearTimeout(tipHideTimer);
  const run = () => {
    if (!tipEl) return;
    tipEl.classList.remove('show');
    tipEl.style.display = 'none';
    tipEl.style.visibility = '';
    tipEl.innerHTML = '';
  };
  if (immediate) run();
  else tipHideTimer = setTimeout(run, 60);
}

/**
 * Gắn hover/focus tip cho các phần tử trong root.
 * @param {ParentNode} root
 * @param {string} selector
 * @param {(el: Element) => string|null} getId
 * @param {object} state
 * @param {(el: Element) => object|undefined} [getExtra]
 */
export function bindMonsterTips(root, selector, getId, state, getExtra) {
  if (!root) return;
  root.querySelectorAll(selector).forEach((el) => {
    const show = (e) => {
      // Tránh mouse synthetic sau touch
      if (e.pointerType === 'touch') return;
      const id = getId(el);
      if (!id) return;
      showMonsterTip(el, id, state, getExtra?.(el));
    };
    const hide = () => hideMonsterTip();

    el.addEventListener('pointerenter', show);
    el.addEventListener('pointerleave', hide);
    el.addEventListener('focus', () => {
      const id = getId(el);
      if (!id) return;
      showMonsterTip(el, id, state, getExtra?.(el));
    });
    el.addEventListener('blur', hide);
    el.addEventListener('dragstart', () => hideMonsterTip(true));
  });
}

export function hideMonsterTipOnScroll(root) {
  if (!root) return;
  const hide = () => hideMonsterTip(true);
  root.addEventListener('scroll', hide, { passive: true, capture: true });
}
