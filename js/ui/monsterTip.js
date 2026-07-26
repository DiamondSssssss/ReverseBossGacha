import { RARITY_COLORS, RARITY_LABELS } from '../data/constants.js';
import { MONSTER_BY_ID } from '../data/monsters.js';
import {
  displayMonsterStats,
  getMonsterUpgradeLevel,
} from '../core/monsterUpgrade.js';

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
    <div class="mtip-desc">${escapeHtml(m.description || '')}</div>
    ${note}
  `;
}

let tipEl = null;
let tipHideTimer = 0;
let tipAnchor = null;

function ensureTipEl() {
  if (tipEl && document.body.contains(tipEl)) return tipEl;
  tipEl = document.createElement('div');
  tipEl.className = 'monster-tip';
  tipEl.setAttribute('role', 'tooltip');
  tipEl.hidden = true;
  document.body.appendChild(tipEl);
  return tipEl;
}

function positionTip(anchor) {
  const el = ensureTipEl();
  const rect = anchor.getBoundingClientRect();
  const pad = 10;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  el.style.visibility = 'hidden';
  el.hidden = false;
  const tw = el.offsetWidth || 220;
  const th = el.offsetHeight || 120;

  let left = rect.left + rect.width / 2 - tw / 2;
  let top = rect.top - th - pad;

  if (top < pad) top = rect.bottom + pad;
  if (left < pad) left = pad;
  if (left + tw > vw - pad) left = vw - pad - tw;
  if (top + th > vh - pad) top = Math.max(pad, vh - pad - th);

  el.style.left = `${Math.round(left)}px`;
  el.style.top = `${Math.round(top)}px`;
  el.style.visibility = '';
}

export function showMonsterTip(anchor, monsterOrId, state, extra) {
  const html = monsterTipHtml(monsterOrId, state, extra);
  if (!html || !anchor) return;
  clearTimeout(tipHideTimer);
  const el = ensureTipEl();
  el.innerHTML = html;
  tipAnchor = anchor;
  positionTip(anchor);
  el.classList.add('show');
}

export function hideMonsterTip(immediate = false) {
  tipAnchor = null;
  clearTimeout(tipHideTimer);
  const run = () => {
    if (!tipEl) return;
    tipEl.classList.remove('show');
    tipEl.hidden = true;
    tipEl.innerHTML = '';
  };
  if (immediate) run();
  else tipHideTimer = setTimeout(run, 80);
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
    const show = () => {
      const id = getId(el);
      if (!id) return;
      showMonsterTip(el, id, state, getExtra?.(el));
    };
    const hide = () => hideMonsterTip();

    el.addEventListener('pointerenter', show);
    el.addEventListener('pointerleave', hide);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
    el.addEventListener('dragstart', () => hideMonsterTip(true));
  });
}

export function hideMonsterTipOnScroll(root) {
  if (!root) return;
  const hide = () => hideMonsterTip(true);
  root.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide);
}
