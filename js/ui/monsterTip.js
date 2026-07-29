import { RARITY_COLORS, RARITY_LABELS } from '../data/constants.js?v=121';
import { MONSTER_BY_ID } from '../data/monsters.js?v=121';
import { describeMonsterKit, describeMonsterSummary } from '../data/skillDesc.js?v=121';
import {
  displayMonsterStats,
  getMonsterUpgradeLevel,
} from '../core/monsterUpgrade.js?v=121';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function monsterCue(m) {
  const b = m.monster_behavior || {};
  const role =
    b.movementStyle === 'STATIC_TRAP'
      ? 'Bẫy giữ vùng'
      : b.movementStyle === 'BUFF_ANCHOR' || b.movementStyle === 'SENTRY_HOLD'
        ? 'Giữ vị trí mạnh'
        : b.movementStyle === 'FLANK_DIVE' || b.movementStyle === 'RAPID_INTERCEPT'
          ? 'Đột kích bắt lẻ'
          : b.movementStyle === 'ANCHOR_BLOCK'
            ? 'Chặn lane / câu đòn'
            : b.movementStyle === 'VISION_SENTINEL'
              ? 'Canh tàng hình'
              : 'Ép giao tranh trực diện';

  let danger = 'Đè lane bằng chỉ số và passive.';
  if (b.targetPriority === 'CASTER_HUNTER') danger = 'Ưu tiên dí Pháp sư / nguồn phép.';
  else if (b.targetPriority === 'STEALTH_PUNISH') danger = 'Canh bắt rogue/tàng hình.';
  else if (b.targetPriority === 'EXECUTE_DRAINER') danger = 'Rất thích dí hero đang lao vào Kho.';
  else if (b.targetPriority === 'BACKLINE_DIVE') danger = 'Lẻn sang tuyến sau nếu có khe hở.';
  else if (b.targetPriority === 'FRONTLINE_LOCK') danger = 'Khóa giao tranh ở choke hoặc cửa hẹp.';
  else if (b.targetPriority === 'SHIELD_BREAK') danger = 'Đè tank/warrior đứng tuyến đầu.';
  else if (b.targetPriority === 'ZONE_DENIAL') danger = 'Ép bạn né vùng đặt bẫy hoặc ô xấu.';

  let counter = 'Khắc chế: đổi lane, focus đúng mục tiêu và không dồn sai chỗ.';
  if (b.targetPriority === 'CASTER_HUNTER') counter = 'Khắc chế: che pháp sư bằng taunt/tank, hạ nó sớm.';
  else if (b.targetPriority === 'STEALTH_PUNISH') counter = 'Khắc chế: đừng all-in vào tàng hình ở lane nó đang giữ.';
  else if (b.targetPriority === 'EXECUTE_DRAINER') counter = 'Khắc chế: đừng để hero hút Kho đi lẻ, giữ choke chặt.';
  else if (b.targetPriority === 'BACKLINE_DIVE') counter = 'Khắc chế: trap, stun, taunt hoặc cắt đường flank.';
  else if (b.targetPriority === 'FRONTLINE_LOCK') counter = 'Khắc chế: DoT, anti-heal, phá khiên hoặc kéo lệch giao tranh.';
  else if (b.targetPriority === 'ZONE_DENIAL') counter = 'Khắc chế: đặt quái lệch cụm và buộc nó kích hoạt lệch nhịp.';

  return { role, danger, counter };
}

/** HTML nội dung tip cho 1 quái (đã tính nâng cấp + scale ải). */
export function monsterTipHtml(monsterOrId, state, extra = {}) {
  const m = typeof monsterOrId === 'string' ? MONSTER_BY_ID[monsterOrId] : monsterOrId;
  if (!m) return '';

  const challengeMode = !!extra.challengeMode;
  const upLv =
    extra.upgradeLevel != null
      ? Number(extra.upgradeLevel) || 0
      : challengeMode
        ? 0
        : state
          ? getMonsterUpgradeLevel(state, m.id)
          : 0;
  const stageLv =
    extra.stageLevel > 0
      ? extra.stageLevel
      : challengeMode
        ? 0
        : state?.dungeonLevel > 0
          ? state.dungeonLevel
          : 0;
  const statMul =
    extra.statMul != null && Number.isFinite(Number(extra.statMul))
      ? Number(extra.statMul)
      : 1;
  const st = displayMonsterStats(m, upLv, stageLv, statMul);
  const tags = (m.tags || []).join(' · ') || '—';
  const kit = describeMonsterKit(m);
  const kitHtml = kit
    .map(
      (k) =>
        `<div class="mtip-skill"><b>${escapeHtml(k.name)}</b> — ${escapeHtml(k.desc)}</div>`
    )
    .join('');
  const stageName =
    challengeMode && extra.challengeId
      ? `CH${extra.challengeId}`
      : stageLv > 0
        ? `Ải ${stageLv}`
        : '';
  const challengeBadge =
    challengeMode
      ? `<span class="mtip-stage-badge">${stageName || 'Thử Thách'} · base</span>`
      : '';
  const stageBadge =
    !challengeMode && stageLv > 0
      ? `<span class="mtip-stage-badge">${stageName} · ×${Number(st.stageMul).toFixed(2)}</span>`
      : challengeBadge;
  const stageNote =
    challengeMode
      ? `<div class="mtip-note">HP/ATK Thử Thách = catalog base (không scale theo ải; không dùng nâng quái).</div>`
      : stageLv > 0
        ? `<div class="mtip-note">HP/ATK trong trận theo <b>${stageName}</b> (gốc ${st.baseHp}/${st.baseAtk} → trận ${st.hp}/${st.atk}).</div>`
        : '';
  const note = extra.note ? `<div class="mtip-note">${escapeHtml(extra.note)}</div>` : '';
  const cue = monsterCue(m);

  return `
    <div class="mtip-name" style="--r:${RARITY_COLORS[m.rarity]}">${escapeHtml(m.name)} ${stageBadge}</div>
    <div class="mtip-rarity" style="color:${RARITY_COLORS[m.rarity]}">
      ${'★'.repeat(m.rarity)} ${RARITY_LABELS[m.rarity] || ''}
      · Cost ${m.cost}${upLv ? ` · Lv↑${upLv}` : ''}${challengeMode ? ' · base' : ''}
    </div>
    <div class="mtip-stats">
      <span><b>HP</b> ${st.hp}${challengeMode || stageLv > 0 ? ` <i class="mtip-scaled">(${challengeMode ? 'base' : 'ải'})</i>` : ''}</span>
      <span><b>ATK</b> ${st.atk}${challengeMode || stageLv > 0 ? ` <i class="mtip-scaled">(${challengeMode ? 'base' : 'ải'})</i>` : ''}</span>
      <span><b>SPD</b> ${Number(st.speed).toFixed(2)}</span>
      <span><b>RNG</b> ${st.range}</span>
      <span><b>AS</b> ${st.atkSpeed}</span>
    </div>
    <div class="mtip-desc"><b>Vai trò:</b> ${escapeHtml(cue.role)}</div>
    <div class="mtip-desc"><b>Mối nguy:</b> ${escapeHtml(cue.danger)}</div>
    <div class="mtip-desc"><b>Khắc chế:</b> ${escapeHtml(cue.counter)}</div>
    <div class="mtip-tags">${escapeHtml(tags)}</div>
    ${kitHtml}
    ${m.drawback ? `<div class="mtip-drawback">⚠ ${escapeHtml(m.drawback)}</div>` : ''}
    <div class="mtip-desc">${escapeHtml(describeMonsterSummary(m))}</div>
    ${stageNote}
    ${note}
  `;
}

/** Một dòng gọn cho board-tip / status. */
export function monsterTipLine(monsterOrId, state, stageLevel = 0) {
  const m = typeof monsterOrId === 'string' ? MONSTER_BY_ID[monsterOrId] : monsterOrId;
  if (!m) return '';
  const upLv = state ? getMonsterUpgradeLevel(state, m.id) : 0;
  const stageLv =
    stageLevel > 0 ? stageLevel : state?.dungeonLevel > 0 ? state.dungeonLevel : 0;
  const st = displayMonsterStats(m, upLv, stageLv);
  const kit = describeMonsterKit(m);
  const skillShort = kit.length ? ` · ${kit.map((k) => k.name).join(', ')}` : '';
  const stageTag = stageLv > 0 ? ` · Ải ${stageLv}` : '';
  return `${m.name} · C${m.cost}${upLv ? ` · Lv↑${upLv}` : ''}${stageTag} · HP ${st.hp} · ATK ${st.atk}${skillShort}`;
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
  const desktopDock = vw >= 980;
  const mobileCompact = vw < 760;

  el.style.display = 'block';
  el.style.visibility = 'hidden';
  el.style.left = '0px';
  el.style.top = '0px';
  el.classList.toggle('docked-right', desktopDock);
  el.classList.toggle('mobile-compact', mobileCompact);

  const tw = Math.max(el.offsetWidth, 200);
  const th = Math.max(el.offsetHeight, 80);

  let left;
  let top;

  if (desktopDock) {
    left = Math.max(pad, vw - tw - 14);
    top = Math.min(vh - th - pad, Math.max(pad, rect.top));
  } else if (mobileCompact) {
    left = pad;
    top = rect.top > vh * 0.45 ? pad : Math.max(pad, vh - th - pad);
  } else {
    left = rect.left + rect.width / 2 - tw / 2;
    top = rect.bottom + pad;
    if (top + th > vh - pad) {
      top = rect.top - th - pad;
    }
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
      if (e.pointerType === 'touch') return;
      const id = getId(el);
      if (!id) return;
      showMonsterTip(el, id, state, getExtra?.(el));
    };
    const hide = (e) => {
      // Tránh clear khi pointer đi qua con/cháu trong cùng thẻ
      const to = e?.relatedTarget;
      if (to && (el === to || el.contains(to))) return;
      hideMonsterTip();
    };

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

