import { TERRAIN_LABELS, RARITY_COLORS } from '../data/constants.js';
import { MONSTER_BY_ID } from '../data/monsters.js';
import {
  roomUsedCost,
  placeMonster,
  removePlacement,
  totalPlacements,
} from '../core/dungeon.js';

export function renderScout(root, ctx) {
  const { run, go } = ctx;
  if (!run) {
    root.innerHTML = `<p class="muted">Chưa có run. Quay lại Hub.</p>`;
    return;
  }

  const heroes = run.wave
    .map(
      (h) => `
      <div class="hero-chip ${h.class}">
        <div class="cls">${h.class}</div>
        <div><strong>${h.name}</strong></div>
        <div class="muted">HP ${h.maxHp || h.hp} · SPD ${h.speed}</div>
      </div>`
    )
    .join('');

  const rooms = run.rooms
    .map(
      (r) => `
      <div class="room-row">
        <strong>${r.name}</strong>
        <div class="muted">${TERRAIN_LABELS[r.terrain]} · Cost Cap ${r.costCap}</div>
      </div>`
    )
    .join('');

  const classes = [...new Set(run.wave.map((h) => h.class))];
  const tips = [];
  if (classes.includes('MAGE')) tips.push('Có Pháp sư → mang Silence / áp sát (Ve Ve, Slime, chuột…)');
  if (classes.includes('WARRIOR')) tips.push('Có Chiến sĩ → ưu tiên Boss 5★ burst (Hydra, Rồng…)');
  if (classes.includes('ROGUE')) tips.push('Có Đạo tặc → mang Mắt thần / Bẫy gai');

  root.innerHTML = `
    <div class="scout-lead">
      <p class="section-label" style="margin-top:0">Trinh sát</p>
      <h2>Ải ${run.level}</h2>
      <p class="muted">Đọc wave rồi mới xếp. Phá đảo khi thắng ải 20.</p>
    </div>
    <div class="counter-box">
      <h3>Khắc chế wave này</h3>
      <div class="counter-tips">
        ${tips.map((t) => `<span>${t}</span>`).join('') || '<span>Wave hỗn hợp — cân utility + DPS</span>'}
      </div>
    </div>
    <p class="section-label">Wave Hero</p>
    <div class="scout-wave">${heroes}</div>
    <p class="section-label">Chuỗi phòng</p>
    <div class="room-strip">${rooms}</div>
    <div class="row" style="margin-top:8px">
      <button type="button" class="primary" id="btn-to-setup" style="flex:1">Xếp trận</button>
      <button type="button" id="btn-back-hub">Sảnh</button>
    </div>
  `;

  root.querySelector('#btn-to-setup').onclick = () => go('setup');
  root.querySelector('#btn-back-hub').onclick = () => go('hub');
}

export function renderSetup(root, ctx) {
  const { run, go, toast, inventory } = ctx;
  if (!run) {
    root.innerHTML = `<p class="muted">Chưa có run.</p>`;
    return;
  }

  let roomIndex = run.selectedRoomIndex || 0;
  let selectedId = run.selectedMonsterId;

  function paint() {
    const room = run.rooms[roomIndex];
    const used = roomUsedCost(room);
    const costPct = Math.min(100, (used / room.costCap) * 100);

    const tabs = run.rooms
      .map((r, i) => {
        const u = roomUsedCost(r);
        return `<button type="button" class="${i === roomIndex ? 'active' : ''}" data-room="${i}">${r.name} (${u}/${r.costCap})</button>`;
      })
      .join('');

    const cells = [];
    for (let row = 0; row < room.rows; row++) {
      for (let col = 0; col < room.cols; col++) {
        const p = room.placements.find((x) => x.col === col && x.row === row);
        if (p) {
          const m = MONSTER_BY_ID[p.monsterId];
          cells.push(
            `<div class="grid-cell filled" data-col="${col}" data-row="${row}" style="background:${m?.color || '#cfc5b2'};color:#1a1612">${m?.name?.split(' ').slice(-2).join(' ') || '?'}</div>`
          );
        } else {
          cells.push(`<div class="grid-cell" data-col="${col}" data-row="${row}"></div>`);
        }
      }
    }

    const tray = Object.entries(inventory)
      .filter(([, c]) => c > 0)
      .map(([id, count]) => {
        const m = MONSTER_BY_ID[id];
        if (!m) return '';
        return `
          <div class="tray-item ${selectedId === id ? 'selected' : ''}" data-mid="${id}">
            <div class="dot" style="background:${m.color}"></div>
            <div style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)}</div>
            <div>${m.name}</div>
            <div class="muted">C${m.cost} · ×${count}</div>
          </div>`;
      })
      .join('');

    root.innerHTML = `
      <div class="setup-layout">
        <div class="setup-top">
          <div>
            <p class="section-label">Setup</p>
            <h2>Xếp trận</h2>
          </div>
          <button type="button" class="ghost" id="btn-scout">← Trinh sát</button>
        </div>
        <div class="room-tabs">${tabs}</div>
        <div class="room-board">
          <div class="board-meta">
            <div class="row spread">
              <strong>${room.name}</strong>
              <span class="muted" style="font-size:0.72rem">${TERRAIN_LABELS[room.terrain]} · ${used}/${room.costCap}</span>
            </div>
            <div class="cost-bar"><span class="${costPct > 90 ? 'hot' : ''}" style="width:${costPct}%"></span></div>
          </div>
          <div class="grid-board" style="grid-template-columns:repeat(${room.cols},minmax(0,1fr));grid-template-rows:repeat(${room.rows},minmax(0,1fr))">${cells.join('')}</div>
        </div>
        <div class="setup-bottom">
          <p class="section-label">Kho run · chọn quái rồi chạm ô</p>
          <div class="monster-tray">${tray || '<span class="muted">Hết quái — quay gacha</span>'}</div>
          <div class="setup-footer">
            <button type="button" id="btn-clear">Xóa phòng</button>
            <button type="button" class="primary" id="btn-start">START</button>
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll('[data-room]').forEach((btn) => {
      btn.onclick = () => {
        roomIndex = Number(btn.getAttribute('data-room'));
        run.selectedRoomIndex = roomIndex;
        paint();
      };
    });

    root.querySelectorAll('.tray-item').forEach((el) => {
      el.onclick = () => {
        selectedId = el.getAttribute('data-mid');
        run.selectedMonsterId = selectedId;
        paint();
      };
    });

    root.querySelectorAll('.grid-cell').forEach((el) => {
      el.onclick = () => {
        const col = Number(el.getAttribute('data-col'));
        const row = Number(el.getAttribute('data-row'));
        const existing = room.placements.find((p) => p.col === col && p.row === row);
        if (existing) {
          removePlacement(run, roomIndex, col, row, inventory);
          paint();
          return;
        }
        if (!selectedId) {
          toast('Chọn quái ở khay dưới trước');
          return;
        }
        const res = placeMonster(run, roomIndex, selectedId, col, row, inventory);
        if (!res.ok) {
          toast(res.reason);
          return;
        }
        paint();
      };
    });

    root.querySelector('#btn-scout').onclick = () => go('scout');
    root.querySelector('#btn-clear').onclick = () => {
      [...room.placements].forEach((p) => {
        removePlacement(run, roomIndex, p.col, p.row, inventory);
      });
      paint();
    };
    root.querySelector('#btn-start').onclick = () => {
      if (totalPlacements(run) === 0) {
        toast('Hãy thả ít nhất 1 quái!');
        return;
      }
      go('combat');
    };
  }

  paint();
}
