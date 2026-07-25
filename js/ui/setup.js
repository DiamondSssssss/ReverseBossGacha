import {
  TERRAIN_LABELS,
  TERRAIN_HINTS,
  RARITY_COLORS,
  HERO_CLASS_LABELS,
  LANE_LABELS,
} from '../data/constants.js';
import { MONSTER_BY_ID } from '../data/monsters.js';
import {
  roomUsedCost,
  placeMonster,
  removePlacement,
  totalPlacements,
} from '../core/dungeon.js';
import { monsterSpriteUrl, heroSpriteUrl } from '../render/sprites.js';
import { attachSetupBoardFx } from './setupBoardFx.js';

function shortName(name) {
  if (!name) return '?';
  const parts = name.split(/\s+/);
  return parts.slice(-2).join(' ');
}

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
        <img class="sprite-thumb" src="${heroSpriteUrl(h.id, h.class, h.color)}" alt="" width="48" height="48" />
        <div class="cls">${HERO_CLASS_LABELS[h.class] || h.class}</div>
        <div><strong>${h.name}</strong></div>
        <div class="muted">HP ${h.maxHp || h.hp} · ATK ${h.atk} · SPD ${h.speed}</div>
        <div class="muted">${h.stealth ? 'Tàng hình · ' : ''}Tầm ${h.range}${h.aoeRadius ? ' · AoE' : ''}</div>
      </div>`
    )
    .join('');

  const rooms = run.rooms
    .map(
      (r, i) => `
      <div class="room-row">
        <strong>${i + 1}. ${r.name}</strong>
        <div class="muted">${TERRAIN_LABELS[r.terrain]} · Cost ${r.costCap} · ${TERRAIN_HINTS[r.terrain] || ''}</div>
      </div>`
    )
    .join('');

  const classes = [...new Set(run.wave.map((h) => h.class))];
  const tips = [];
  if (run.waveTip) tips.push(run.waveTip);
  if (classes.includes('MAGE')) tips.push('Có Pháp sư → Silence / áp sát (Ve Ve, Slime…)');
  if (classes.includes('WARRIOR')) tips.push('Có Chiến sĩ → Boss 5★ burst (Hydra, Rồng…)');
  if (classes.includes('ROGUE')) {
    const anyStealth = run.wave.some((h) => h.stealth);
    tips.push(
      anyStealth
        ? 'Có Đạo tặc tàng hình → Mắt thần / Bẫy gai'
        : 'Có Đạo tặc (không ẩn) → focus DPS / làm chậm'
    );
  }

  root.innerHTML = `
    <div class="scout-lead">
      <h2>Ải ${run.level} — Trinh sát</h2>
      <p class="wave-theme"><strong>${run.waveTheme || 'Wave Hero'}</strong></p>
      <p class="muted">Hero vào từ <b>Cổng (trái)</b> → xuyên phòng → rút <b>Kho (phải)</b>. Chặn chúng trước khi kho về 0.</p>
    </div>
    <div class="flow-legend scout-flow">
      <span class="flow-gate">CỔNG</span>
      <span class="flow-arr">→</span>
      <span>Phòng 1…4</span>
      <span class="flow-arr">→</span>
      <span class="flow-treasure">KHO</span>
    </div>
    <div class="counter-box">
      <h3>Khắc chế wave này</h3>
      <div class="counter-tips">
        ${tips.map((t) => `<span>${t}</span>`).join('') || '<span>Wave hỗn hợp — cân utility + DPS</span>'}
      </div>
    </div>
    <p class="section-label">Wave Hero</p>
    <div class="scout-wave">${heroes}</div>
    <p class="section-label">Chuỗi phòng (trái → phải)</p>
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
  /** @type {null | {col:number,row:number,kind:string}} */
  let fxPulse = null;
  let disposeFx = null;
  let bobTimer = 0;

  function stopFx() {
    disposeFx?.();
    disposeFx = null;
    clearInterval(bobTimer);
    bobTimer = 0;
  }

  function paint() {
    stopFx();
    const room = run.rooms[roomIndex];
    const used = roomUsedCost(room);
    const selected = selectedId ? MONSTER_BY_ID[selectedId] : null;
    const ghostSrc = selected
      ? monsterSpriteUrl(selected.id, selected.color, selected.rarity)
      : '';

    const flowRooms = run.rooms
      .map((r, i) => {
        const u = roomUsedCost(r);
        const n = r.placements.length;
        const mini = r.placements
          .slice(0, 3)
          .map((p) => {
            const m = MONSTER_BY_ID[p.monsterId];
            return `<img src="${monsterSpriteUrl(p.monsterId, m?.color || '#888', m?.rarity || 1)}" alt="" />`;
          })
          .join('');
        return `
          <button type="button" class="flow-room ${i === roomIndex ? 'active' : ''}" data-room="${i}">
            <span class="flow-room-num">P${i + 1}</span>
            <span class="flow-room-name">${r.name.split(' ').slice(-1)[0]}</span>
            <span class="flow-room-cost">${u}/${r.costCap}</span>
            <span class="flow-room-sprites">${mini || '<span class="flow-empty">trống</span>'}</span>
          </button>`;
      })
      .join('<span class="flow-arr" aria-hidden="true">→</span>');

    const cells = [];
    for (let row = 0; row < room.rows; row++) {
      for (let col = 0; col < room.cols; col++) {
        const p = room.placements.find((x) => x.col === col && x.row === row);
        const delay = ((row * room.cols + col) * 0.07).toFixed(2);
        if (p) {
          const m = MONSTER_BY_ID[p.monsterId];
          const trap = m?.tags?.includes('trap');
          const src = monsterSpriteUrl(p.monsterId, m?.color || '#ccc', m?.rarity || 1);
          const just =
            fxPulse && fxPulse.col === col && fxPulse.row === row
              ? fxPulse.kind === 'place'
                ? 'just-placed'
                : 'just-removed'
              : '';
          cells.push(`
            <button type="button" class="grid-cell filled ${trap ? 'is-trap' : ''} ${just}" data-col="${col}" data-row="${row}" style="--m:${m?.color || '#cfc5b2'};--bob-delay:${delay}s" aria-label="${m?.name || 'quái'}">
              <span class="cell-glow"></span>
              <img class="cell-sprite" src="${src}" alt="" width="40" height="40" draggable="false" />
              <span class="cell-name">${shortName(m?.name)}</span>
              <span class="cell-cost">C${m?.cost ?? '?'}</span>
            </button>`);
        } else {
          const edge =
            col === 0 ? 'edge-in' : col === room.cols - 1 ? 'edge-out' : '';
          const canDrop = selected ? 'can-drop' : '';
          cells.push(`
            <button type="button" class="grid-cell empty ${edge} ${canDrop}" data-col="${col}" data-row="${row}" style="--bob-delay:${delay}s" aria-label="Ô trống ${col},${row}">
              <span class="cell-path" aria-hidden="true"></span>
              ${
                selected
                  ? `<img class="ghost-sprite" src="${ghostSrc}" alt="" width="36" height="36" draggable="false" />`
                  : '<span class="cell-plus">+</span>'
              }
            </button>`);
        }
      }
    }

    const laneLabels = LANE_LABELS.slice(0, room.rows)
      .map((lab) => `<span>${lab}</span>`)
      .join('');

    const tray = Object.entries(inventory)
      .filter(([, c]) => c > 0)
      .map(([id, count]) => {
        const m = MONSTER_BY_ID[id];
        if (!m) return '';
        const trap = m.tags?.includes('trap');
        const src = monsterSpriteUrl(id, m.color, m.rarity);
        return `
          <button type="button" class="tray-item ${selectedId === id ? 'selected' : ''}" data-mid="${id}">
            <img class="tray-sprite" src="${src}" alt="" width="40" height="40" draggable="false" />
            <div style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)}</div>
            <div>${shortName(m.name)}</div>
            <div class="muted">C${m.cost} · ×${count}${trap ? ' · Bẫy' : ''}</div>
          </button>`;
      })
      .join('');

    const pickHtml = selected
      ? `<div class="setup-pick has-pick pulse-pick">
          <img class="pick-sprite" src="${monsterSpriteUrl(selected.id, selected.color, selected.rarity)}" alt="" width="44" height="44" />
          <div>
            <strong>${selected.name}</strong>
            <span class="muted"> · C${selected.cost} · ${'★'.repeat(selected.rarity)}</span>
            <p>${selected.description}</p>
          </div>
        </div>`
      : `<div class="setup-pick"><p>Chọn quái ở khay → chạm ô trống để thả. Cột trái = Hero vào, cột phải = ra phòng sau.</p></div>`;

    const costHot = used / room.costCap >= 0.85 ? 'cost-hot' : '';

    root.innerHTML = `
      <div class="setup-layout">
        <div class="setup-top">
          <h2>Xếp trận</h2>
          <button type="button" class="ghost" id="btn-scout">← Trinh sát</button>
        </div>

        <div class="dungeon-flow" aria-label="Hướng hầm ngục">
          <span class="flow-gate pulse-gate" title="Hero xuất hiện ở đây">CỔNG</span>
          <span class="flow-arr">→</span>
          ${flowRooms}
          <span class="flow-arr">→</span>
          <span class="flow-treasure pulse-treasure" title="Hero rút máu kho ở đây">KHO</span>
        </div>

        <div class="setup-tray-bar">
          <p class="hint">Kho quái · Cost phòng này <b class="${costHot}">${used}/${room.costCap}</b></p>
          <div class="monster-tray">${tray || '<span class="muted">Hết quái</span>'}</div>
        </div>

        ${pickHtml}

        <div class="room-board terrain-${room.terrain} interactive-board">
          <div class="board-meta">
            <strong>${room.name}</strong>
            <span class="muted">${TERRAIN_LABELS[room.terrain]} · ${TERRAIN_HINTS[room.terrain] || ''}</span>
          </div>
          <div class="board-stage">
            <div class="board-rail enter" aria-hidden="true">
              <span class="rail-ico">⚔</span>
              <span>Hero<br/>vào</span>
            </div>
            <div class="board-grid-wrap">
              <div class="lane-labels">${laneLabels}</div>
              <div class="grid-board" style="grid-template-columns:repeat(${room.cols},minmax(0,1fr));grid-template-rows:repeat(${room.rows},minmax(0,1fr))">${cells.join('')}</div>
            </div>
            <div class="board-rail exit" aria-hidden="true">
              <span>Ra<br/>→</span>
              <span class="rail-ico">💎</span>
            </div>
          </div>
        </div>

        <div class="setup-footer">
          <button type="button" id="btn-clear">Xóa phòng</button>
          <button type="button" class="primary" id="btn-start">START</button>
        </div>
      </div>
    `;

    const boardEl = root.querySelector('.room-board');
    disposeFx = attachSetupBoardFx(boardEl, { terrain: room.terrain });

    if (fxPulse) {
      const cell = root.querySelector(
        `.grid-cell[data-col="${fxPulse.col}"][data-row="${fxPulse.row}"]`
      );
      if (cell && boardEl._setupFx) {
        const placed = room.placements.find(
          (p) => p.col === fxPulse.col && p.row === fxPulse.row
        );
        const m = placed ? MONSTER_BY_ID[placed.monsterId] : null;
        boardEl._setupFx.burstAtCell(
          cell,
          fxPulse.color || m?.color || selected?.color || '#ffd54f',
          fxPulse.kind
        );
      }
      fxPulse = null;
    }

    const sprites = root.querySelectorAll('.cell-sprite');
    bobTimer = window.setInterval(() => {
      sprites.forEach((img, i) => {
        if (img.closest('.just-placed')) return;
        const t = performance.now() / 1000;
        const y = Math.sin(t * 3.2 + i * 0.7) * 2;
        img.style.transform = `translateY(${y}px)`;
      });
    }, 40);

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
        const m = MONSTER_BY_ID[selectedId];
        paint();
        // sparkle after paint
        requestAnimationFrame(() => {
          root.querySelector('.room-board')?._setupFx?.sparkleSelect(m?.color);
        });
      };
    });

    root.querySelectorAll('.grid-cell').forEach((el) => {
      el.onclick = () => {
        const col = Number(el.getAttribute('data-col'));
        const row = Number(el.getAttribute('data-row'));
        const existing = room.placements.find((p) => p.col === col && p.row === row);
        if (existing) {
          const mid = existing.monsterId;
          removePlacement(run, roomIndex, col, row, inventory);
          fxPulse = { col, row, kind: 'remove', color: MONSTER_BY_ID[mid]?.color };
          paint();
          return;
        }
        if (!selectedId) {
          toast('Chọn quái ở khay trước');
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 380);
          return;
        }
        const res = placeMonster(run, roomIndex, selectedId, col, row, inventory);
        if (!res.ok) {
          toast(res.reason);
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 380);
          return;
        }
        fxPulse = { col, row, kind: 'place' };
        paint();
      };
    });

    root.querySelector('#btn-scout').onclick = () => {
      stopFx();
      go('scout');
    };
    root.querySelector('#btn-clear').onclick = () => {
      [...room.placements].forEach((p) => {
        removePlacement(run, roomIndex, p.col, p.row, inventory);
      });
      boardEl._setupFx?.sparkleSelect('#90a4ae');
      paint();
    };
    root.querySelector('#btn-start').onclick = () => {
      if (totalPlacements(run) === 0) {
        toast('Hãy thả ít nhất 1 quái!');
        return;
      }
      stopFx();
      go('combat');
    };
  }

  paint();
}
