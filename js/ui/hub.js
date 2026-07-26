import { MAP_UPGRADE, SPELLS, MAX_STAGE } from '../data/constants.js?v=67';
import {
  DUNGEON_BOSSES,
  getBoss,
  isBossUnlocked,
  unlockHint,
  syncUnlockedBosses,
} from '../data/dungeonBosses.js?v=67';
import { tryUpgradeMap, upgradeMapCost } from '../core/dungeon.js?v=67';
import { saveState } from '../core/storage.js?v=67';
import { achievementProgress, isGameCleared, evaluateAchievements } from '../core/achievements.js?v=67';
import { showTutorial } from './tutorial.js?v=67';
import { showRedeemModal } from './redeemUI.js?v=67';

const GATE_SVG = `
<svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="30" y="40" width="140" height="190" fill="#1a1612" opacity="0.12"/>
  <path d="M40 230 V70 Q100 20 160 70 V230" stroke="#1a1612" stroke-width="6" fill="#cfc5b2"/>
  <path d="M55 230 V85 Q100 45 145 85 V230" stroke="#1a1612" stroke-width="3" fill="#ebe4d6"/>
  <circle cx="100" cy="140" r="14" fill="#c43c28" stroke="#1a1612" stroke-width="3"/>
  <rect x="92" y="140" width="28" height="6" fill="#1a1612"/>
  <path d="M70 100 h60 M70 120 h60 M70 160 h60 M70 180 h60" stroke="#1a1612" stroke-width="2" opacity="0.35"/>
</svg>`;

function bossCardHtml(boss, state) {
  const unlocked = isBossUnlocked(boss, state);
  const selected = state.selectedBossId === boss.id;
  const spells = (boss.spells || [])
    .map((id) => SPELLS[id])
    .filter(Boolean)
    .map((s) => `<span class="boss-spell">${s.name}</span>`)
    .join('');
  return `
    <button type="button" class="boss-card ${selected ? 'selected' : ''} ${unlocked ? '' : 'locked'}"
      data-boss="${boss.id}" ${unlocked ? '' : 'disabled'}
      style="--boss-accent:${boss.color}">
      <div class="boss-card-top">
        <strong>${boss.name}</strong>
        ${selected ? '<span class="boss-badge">Đang dùng</span>' : ''}
        ${!unlocked ? '<span class="boss-badge lock">Khóa</span>' : ''}
      </div>
      <div class="meta">${boss.title} · ${boss.blurb}</div>
      <div class="boss-spells">${spells}</div>
      ${!unlocked ? `<div class="boss-lock-hint">${unlockHint(boss)}</div>` : ''}
    </button>
  `;
}

export function renderHub(root, ctx) {
  const { state, go, toast, refreshChrome, startRun, announceAchievements } = ctx;
  syncUnlockedBosses(state);
  const prog = achievementProgress(state);
  const cleared = isGameCleared(state);
  const stageLabel = cleared ? 'Phá đảo' : `Ải ${Math.min(state.dungeonLevel, MAX_STAGE)}/${MAX_STAGE}`;
  const activeBoss = getBoss(state.selectedBossId);

  const lvl = state.mapUpgrade || 0;
  const cost = upgradeMapCost(lvl);
  const maxed = lvl >= MAP_UPGRADE.MAX_LEVEL;
  const baseCapHint = 5 + lvl * MAP_UPGRADE.COST_CAP_BONUS;

  root.innerHTML = `
    <div class="hub-layout">
      <div class="hub-stage">
        <div class="hub-gate">${GATE_SVG}</div>
        <div class="hub-brand">
          <div class="kicker">Reverse Boss Gacha</div>
          <h1>Sếp Tổng Hầm Ngục</h1>
          <p class="tagline">Xếp quái. Chặn Hero. Giữ kho báu.</p>
        </div>
        <div class="hub-cta">
          <button type="button" class="primary big" id="btn-play">Mở cổng ải</button>
          <div class="hub-secondary">
            <button type="button" id="btn-gacha">Quay Gacha</button>
            <button type="button" id="btn-redeem">Nhập mã</button>
            <button type="button" id="btn-ach">Ấn chương</button>
          </div>
        </div>
        <div class="hub-meta">
          <div><strong>${stageLabel}</strong><span>Tiến độ</span></div>
          <div><strong>${state.stats.wins}</strong><span>Thắng</span></div>
          <div><strong>${prog.done}/${prog.total}</strong><span>Ấn</span></div>
        </div>
      </div>

      <div class="hub-side">
        <p class="section-label">Boss hầm · ${activeBoss.name}</p>
        <div class="boss-picker" id="boss-picker">
          ${DUNGEON_BOSSES.map((b) => bossCardHtml(b, state)).join('')}
        </div>

        <div class="economy-guide">
          <h3>Cách kiếm / dùng nguyên liệu</h3>
          <ul>
            <li><strong>Linh Hồn</strong> — thắng/thua ải → quay Gacha (trùng tối đa ×3 → hoàn LH)</li>
            <li><strong>Vàng</strong> — thắng ải → nâng cấp quái (Kho)</li>
            <li><strong>Gem</strong> — Ấn chương → cải tạo hầm (tăng Cost)</li>
            <li><strong>Tay bài</strong> — pool mang ~3× Cap; xếp sân ≤ Cap, thả thêm trong trận khi có slot</li>
          </ul>
          <p class="muted" style="margin:8px 0 0;font-size:0.78rem">
            Cap map gốc ~5–6. Muốn xếp nhiều hơn phải nâng hầm bằng Gem.
          </p>
          <p class="muted" style="margin:4px 0 0;font-size:0.78rem">
            Guest = lưu trên máy này. Bấm <strong>Đăng nhập</strong> để đồng bộ.
          </p>
          ${
            state.souls === 0 && state.gold === 0 && state.gems === 0
              ? '<p class="economy-zero">Bạn đang tay trắng — bấm <strong>Mở cổng ải</strong> để kiếm vốn đầu.</p>'
              : state.souls < 100
                ? '<p class="economy-zero">Chưa đủ 100 LH để quay — thắng/thua ải để kiếm Linh Hồn.</p>'
                : ''
          }
        </div>
        <p class="section-label">Cải tạo hầm</p>
        <div class="upgrade-list">
          <div class="upgrade-item">
            <div>
              <strong>Nâng Cost map</strong>
              <div class="meta">+${MAP_UPGRADE.COST_CAP_BONUS} Cost mỗi cấp · Lv ${lvl}/${MAP_UPGRADE.MAX_LEVEL} · ải đầu ≈ Cap ${baseCapHint}</div>
            </div>
            <button type="button" id="btn-upgrade-map" ${maxed ? 'disabled' : ''}>
              ${maxed ? 'MAX' : `${cost} gem`}
            </button>
          </div>
        </div>
        <p class="how-inline muted">
          Mới chơi?
          <button type="button" class="ghost" id="btn-help">Xem hướng dẫn</button>
          ·
          <button type="button" class="ghost" id="btn-collection">Kho quái</button>
          ·
          <button type="button" class="ghost" id="btn-heroes">Catalog Hero</button>
          ·
          <button type="button" class="ghost" id="btn-reset">Reset</button>
        </p>
      </div>
    </div>
  `;

  root.querySelector('#btn-play').onclick = () => {
    startRun();
    go('scout');
  };
  root.querySelector('#btn-gacha').onclick = () => go('gacha');
  root.querySelector('#btn-redeem').onclick = () => {
    showRedeemModal(document.getElementById('modal'), {
      state,
      toast,
      refreshChrome,
    });
  };
  root.querySelector('#btn-collection').onclick = () => go('collection');
  root.querySelector('#btn-heroes').onclick = () => go('heroes');
  root.querySelector('#btn-ach').onclick = () => go('achievements');
  root.querySelector('#btn-help').onclick = () => {
    if (ctx.startTutorial) ctx.startTutorial();
    else {
      showTutorial(document.getElementById('modal'), {
        onDone: () => toast('Chúc Sếp giữ được kho!'),
      });
    }
  };
  root.querySelector('#btn-reset').onclick = () => {
    if (confirm('Xóa toàn bộ tiến trình?')) {
      ctx.reset();
      toast('Đã reset');
      refreshChrome();
      ctx.maybeStartTutorial?.();
      renderHub(root, ctx);
    }
  };

  root.querySelector('#boss-picker').onclick = (e) => {
    const btn = e.target.closest('[data-boss]');
    if (!btn || btn.disabled) return;
    const id = btn.getAttribute('data-boss');
    const boss = getBoss(id);
    if (!isBossUnlocked(boss, state)) {
      toast(unlockHint(boss));
      return;
    }
    if (state.selectedBossId === id) return;
    state.selectedBossId = id;
    saveState(state);
    toast(`Boss: ${boss.name}`);
    renderHub(root, ctx);
  };

  root.querySelector('#btn-upgrade-map').onclick = () => {
    const res = tryUpgradeMap(state);
    if (!res.ok) {
      toast(res.reason);
      return;
    }
    saveState(state);
    const unlocked = evaluateAchievements(state);
    announceAchievements?.(unlocked);
    toast(`Hầm lên Lv ${res.level} · +${MAP_UPGRADE.COST_CAP_BONUS} Cost`);
    refreshChrome();
    renderHub(root, ctx);
  };
}
