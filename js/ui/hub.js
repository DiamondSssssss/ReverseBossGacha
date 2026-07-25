import { DUNGEON_TEMPLATE } from '../data/rooms.js';
import { TERRAIN_LABELS, ROOM_UPGRADE } from '../data/constants.js';
import { tryUpgradeRoom, upgradeRoomCost } from '../core/dungeon.js';
import { saveState } from '../core/storage.js';
import { achievementProgress, isGameCleared, evaluateAchievements } from '../core/achievements.js';
import { showTutorial } from './tutorial.js';

const GATE_SVG = `
<svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="30" y="40" width="140" height="190" fill="#1a1612" opacity="0.12"/>
  <path d="M40 230 V70 Q100 20 160 70 V230" stroke="#1a1612" stroke-width="6" fill="#cfc5b2"/>
  <path d="M55 230 V85 Q100 45 145 85 V230" stroke="#1a1612" stroke-width="3" fill="#ebe4d6"/>
  <circle cx="100" cy="140" r="14" fill="#c43c28" stroke="#1a1612" stroke-width="3"/>
  <rect x="92" y="140" width="28" height="6" fill="#1a1612"/>
  <path d="M70 100 h60 M70 120 h60 M70 160 h60 M70 180 h60" stroke="#1a1612" stroke-width="2" opacity="0.35"/>
</svg>`;

export function renderHub(root, ctx) {
  const { state, go, toast, refreshChrome, startRun, announceAchievements } = ctx;
  const prog = achievementProgress(state);
  const cleared = isGameCleared(state);
  const stageLabel = cleared ? 'Phá đảo' : `Ải ${Math.min(state.dungeonLevel, 20)}/20`;

  const upgrades = DUNGEON_TEMPLATE.rooms
    .map((room) => {
      const lvl = state.roomUpgrades[room.id] || 0;
      const cost = upgradeRoomCost(lvl);
      const maxed = lvl >= ROOM_UPGRADE.MAX_LEVEL;
      return `
        <div class="upgrade-item">
          <div>
            <strong>${room.name}</strong>
            <div class="meta">${TERRAIN_LABELS[room.terrain]} · Cap ${room.costCap + lvl * ROOM_UPGRADE.COST_CAP_BONUS} · Lv ${lvl}</div>
          </div>
          <button type="button" data-upgrade="${room.id}" ${maxed ? 'disabled' : ''}>
            ${maxed ? 'MAX' : `${cost} vàng`}
          </button>
        </div>`;
    })
    .join('');

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
        <div class="economy-guide">
          <h3>Cách kiếm nguyên liệu</h3>
          <ul>
            <li><strong>Linh Hồn</strong> — thắng/thua ải → dùng quay Gacha</li>
            <li><strong>Vàng</strong> — thắng ải → nâng cấp phòng</li>
            <li><strong>Gem</strong> — mở Ấn chương (thành tựu)</li>
          </ul>
          <p class="muted" style="margin:8px 0 0;font-size:0.78rem">
            Guest = lưu trên máy này. Bấm <strong>Đăng nhập</strong> (username + mật khẩu) để đồng bộ giữa các thiết bị.
          </p>
          ${
            state.souls === 0 && state.gold === 0 && state.gems === 0
              ? '<p class="economy-zero">Bạn đang tay trắng — bấm <strong>Mở cổng ải</strong> để kiếm vốn đầu.</p>'
              : ''
          }
        </div>
        <p class="section-label">Cải tạo hầm</p>
        <div class="upgrade-list">${upgrades}</div>
        <p class="how-inline muted">
          Mới chơi?
          <button type="button" class="ghost" id="btn-help">Xem hướng dẫn</button>
          ·
          <button type="button" class="ghost" id="btn-collection">Kho quái</button>
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
  root.querySelector('#btn-collection').onclick = () => go('collection');
  root.querySelector('#btn-ach').onclick = () => go('achievements');
  root.querySelector('#btn-help').onclick = () => {
    showTutorial(document.getElementById('modal'), {
      onDone: () => toast('Chúc Sếp giữ được kho!'),
    });
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

  root.querySelectorAll('[data-upgrade]').forEach((btn) => {
    btn.onclick = () => {
      const res = tryUpgradeRoom(state, btn.getAttribute('data-upgrade'));
      if (!res.ok) {
        toast(res.reason);
        return;
      }
      saveState(state);
      const unlocked = evaluateAchievements(state);
      announceAchievements?.(unlocked);
      toast(`Phòng lên Lv ${res.level}`);
      refreshChrome();
      renderHub(root, ctx);
    };
  });
}
