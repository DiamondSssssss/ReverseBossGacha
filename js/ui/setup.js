import {
  TERRAIN_HINTS,
  TERRAIN_LABELS,
  RARITY_COLORS,
  HERO_CLASS_LABELS,
} from '../data/constants.js?v=68';
import { MONSTER_BY_ID, MONSTERS } from '../data/monsters.js?v=68';
import { terrainAt, isPlaceable } from '../data/maps.js?v=68';
import { findPath, buildBlockedFromMap } from '../core/pathfinding.js?v=68';
import {
  mapUsedCost,
  placeMonster,
  removePlacement,
  totalPlacements,
} from '../core/dungeon.js?v=68';
import {
  loadoutMaxPoolCost,
  loadoutPoolCost,
  loadoutUnitCount,
  loadoutTypeCount,
  sanitizeLoadout,
  suggestLoadout,
  tryAddToLoadout,
  tryRemoveFromLoadout,
} from '../core/loadout.js?v=68';
import { monsterSpriteUrl, heroSpriteUrl } from '../render/sprites.js?v=68';
import { attachSetupBoardFx } from './setupBoardFx.js?v=68';
import { playGhostWalk } from './setupPreview.js?v=68';
import { saveState } from '../core/storage.js?v=68';
import {
  hideMonsterTip,
  monsterTipHtml,
} from './monsterTip.js?v=68';
import {
  displayMonsterStats,
  getMonsterUpgradeLevel,
} from '../core/monsterUpgrade.js?v=68';

function shortName(name) {
  if (!name) return '?';
  const parts = name.split(/\s+/);
  return parts.slice(-2).join(' ');
}

/** Cap gốc cho pool loadout (map.costCap là Cap sân = 3×). */
function loadoutRefCap(map) {
  return Math.max(1, Number(map.refCostCap) || Number(map.costCap) || 1);
}

function cellTooltip(map, col, row, ch) {
  if (ch === '#' || ch === 'o') return ch === 'o' ? 'Chướng ngại' : 'Tường';
  if (ch === 'G') return 'Cổng — Hero vào đây';
  if (ch === 'T') return 'Kho báu';
  if (ch === 'x' || map.noPlace?.has(`${col},${row}`)) {
    const buffs = map.buffIndex[`${col},${row}`] || [];
    const parts = ['Hành lang — không đặt quái'];
    for (const b of buffs) {
      if (b.side === 'monster') parts.push('Buff quái');
      else if (b.side === 'hero') parts.push(`Buff hero: ${b.kind}`);
      else parts.push('Buff chung');
    }
    return parts.join(' · ');
  }
  const terrain = terrainAt(map, col, row);
  const buffs = map.buffIndex[`${col},${row}`] || [];
  const parts = [TERRAIN_LABELS[terrain] || TERRAIN_HINTS[terrain] || 'Sàn'];
  for (const b of buffs) {
    if (b.side === 'monster') parts.push(`Buff quái: ${b.kind}`);
    else if (b.side === 'hero') parts.push(`Buff hero: ${b.kind}`);
    else parts.push(`Buff chung: ${b.kind}`);
  }
  return parts.join(' · ');
}

function hintPath(map) {
  const start = map.gate[0];
  const goal = map.treasure[0];
  const blocked = buildBlockedFromMap(map);
  for (const t of map.treasure) blocked.delete(`${t.col},${t.row}`);
  for (const g of map.gate) blocked.delete(`${g.col},${g.row}`);
  return findPath(start, goal, map.cols, map.rows, blocked) || [];
}

/** HTML: đội hình hero (thứ tự + ô cổng + chỉ số) */
function heroFormationHtml(wave) {
  const march = [...wave]
    .sort((a, b) => (a.formation?.order || 0) - (b.formation?.order || 0))
    .map((h) => {
      const f = h.formation || {};
      const t = (f.spawnAt ?? h.spawnDelay ?? 0).toFixed(1);
      const skills = (h.skills || []).join(', ') || '—';
      return `
        <div class="formation-slot ${h.class}">
          <span class="formation-order">#${f.order || '?'}</span>
          <img class="formation-sprite" src="${heroSpriteUrl(h.id, h.class, h.color)}" alt="" width="48" height="48" />
          <div class="formation-meta">
            <strong>${h.name}</strong>
            <span class="formation-cls">${HERO_CLASS_LABELS[h.class] || h.class}${h.stealth ? ' · Tàng hình' : ''}</span>
            <span class="formation-role">${f.roleLine || ''}</span>
            <span class="formation-stats">HP ${h.maxHp || h.hp} · ATK ${h.atk} · SPD ${h.speed}</span>
            <span class="formation-stats">Tầm ${h.range}${h.aoeRadius ? ` · AoE ${h.aoeRadius}` : ''} · Skill ${skills}</span>
            <span class="formation-gate">Cổng (${f.col ?? '?'},${f.row ?? '?'}) · vào sau ${t}s</span>
          </div>
        </div>`;
    })
    .join('');

  return `
    <div class="hero-formation">
      <div class="hero-formation-head">
        <h3>Đội hình & chi tiết Hero</h3>
        <p class="muted">Thứ tự vào · chỉ số · ô cổng — đọc rồi chọn loadout quái bên dưới.</p>
      </div>
      <div class="formation-march" aria-label="Đội hình Hero">${march}</div>
    </div>`;
}

/** Mini map với marker đội hình hero tại cổng */
function scoutMapPreviewHtml(map, wave, pathHint) {
  const pathSet = new Set(pathHint.map((p) => `${p.col},${p.row}`));
  const heroesByCell = {};
  for (const h of wave) {
    const f = h.formation;
    if (!f) continue;
    const key = `${f.col},${f.row}`;
    if (!heroesByCell[key]) heroesByCell[key] = [];
    heroesByCell[key].push(h);
  }

  const cells = [];
  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      const ch = map.tiles[row][col];
      const key = `${col},${row}`;
      const terrain = terrainAt(map, col, row);
      const isWall = ch === '#' || ch === 'o';
      const isNoPlace = ch === 'x' || map.noPlace?.has(key);
      const heroesHere = heroesByCell[key] || [];
      let cls = 'scout-cell';
      if (isWall) cls += ' wall';
      else if (ch === 'G') cls += ' gate';
      else if (ch === 'T') cls += ' treasure';
      else {
        cls += ` terrain-${terrain}`;
        if (isNoPlace) cls += ' no-place';
      }
      if (pathSet.has(key) && !isWall) cls += ' path';
      if (heroesHere.length) cls += ' has-hero';

      const marks =
        heroesHere.length > 0
          ? `<span class="scout-hero-stack">${heroesHere
              .map(
                (h) =>
                  `<span class="scout-hero-dot ${h.class}" title="#${h.formation.order} ${h.name}">${h.formation.order}</span>`
              )
              .join('')}</span>`
          : ch === 'G'
            ? '<span class="scout-mark">G</span>'
            : ch === 'T'
              ? '<span class="scout-mark">T</span>'
              : isNoPlace
                ? '<span class="scout-mark noplace">×</span>'
                : '';

      cells.push(`<div class="${cls}" style="grid-column:${col + 1};grid-row:${row + 1}">${marks}</div>`);
    }
  }

  return `
    <div class="scout-map-preview">
      <div class="scout-map-grid" style="grid-template-columns:repeat(${map.cols},1fr);grid-template-rows:repeat(${map.rows},1fr);aspect-ratio:${map.cols}/${map.rows}">
        ${cells.join('')}
      </div>
      <p class="muted scout-map-cap">Số trên cổng = thứ tự Hero vào · đường mờ = path gợi ý tới Kho</p>
    </div>`;
}

function ownedList(inventory) {
  return MONSTERS.filter((m) => (inventory[m.id] || 0) > 0).sort(
    (a, b) => b.rarity - a.rarity || a.cost - b.cost || a.name.localeCompare(b.name, 'vi')
  );
}

export function renderScout(root, ctx) {
  const { run, go, state, toast, applyLoadout } = ctx;
  if (!run) {
    root.innerHTML = `<p class="muted">Chưa có run. Quay lại Hub.</p>`;
    return;
  }

  const map = run.map;
  const pathHint = hintPath(map);
  const vault = state.inventory || {};

  if (!run.loadout) {
    run.loadout = sanitizeLoadout(state.lastLoadout, vault, loadoutRefCap(map));
    if (!loadoutUnitCount(run.loadout)) {
      run.loadout = suggestLoadout(vault, loadoutRefCap(map));
    }
  } else {
    run.loadout = sanitizeLoadout(run.loadout, vault, loadoutRefCap(map));
  }

  let filterRole = 'all';

  const classes = [...new Set(run.wave.map((h) => h.class))];
  const tips = [];
  if (run.waveTip) tips.push(run.waveTip);
  if (map.tip) tips.push(map.tip);
  if (classes.includes('MAGE')) tips.push('Có Pháp sư → Silence / áp sát');
  if (classes.includes('WARRIOR')) tips.push('Có Chiến sĩ → Boss burst / DoT');
  if (classes.includes('ARCHER')) tips.push('Có Cung thủ → gap-close / chase tầm xa');
  if (classes.includes('TANK')) tips.push('Có Thuần tank → DoT / %HP / Boss');
  if (classes.includes('BERSERKER')) tips.push('Có Berserker → burst sớm hoặc CC / slow');
  if (classes.includes('ROGUE')) {
    tips.push(
      run.wave.some((h) => h.stealth)
        ? 'Có Đạo tặc ẩn → Mắt thần / Bẫy trên đường phụ'
        : 'Có Đạo tặc → focus DPS / chậm'
    );
  }
  if (classes.includes('HEALER')) tips.push('Có Healer → ưu tiên hạ hồi máu / mang anti-heal');
  if (classes.includes('HEXER')) tips.push('Có Diệt hồi → heal quái bị giảm — vẫn focus hexer nếu cần');

  function loadoutPanelHtml() {
    const loadout = run.loadout || {};
    const pool = loadoutPoolCost(loadout);
    const maxPool = loadoutMaxPoolCost(loadoutRefCap(map));
    const units = loadoutUnitCount(loadout);
    const types = loadoutTypeCount(loadout);
    const placeCap = map.costCap;
    const owned = ownedList(vault).filter((m) => {
      if (filterRole === 'all') return true;
      const tags = m.tags || [];
      if (filterRole === 'trap') return tags.includes('trap');
      if (filterRole === 'utility') {
        return tags.some((t) => ['utility', 'silence', 'detect', 'slow'].includes(t));
      }
      if (filterRole === 'dps') return tags.includes('dps') || tags.includes('boss');
      if (filterRole === 'tank') return tags.includes('tank') || tags.includes('tankette');
      return true;
    });

    const loadoutChips = Object.entries(loadout)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => {
        const m = MONSTER_BY_ID[id];
        if (!m) return '';
        const upLv = getMonsterUpgradeLevel(state, id);
        const st = displayMonsterStats(m, upLv);
        return `
          <button type="button" class="loadout-chip" data-remove="${id}" data-mid="${id}">
            <img src="${monsterSpriteUrl(id, m.color, m.rarity)}" alt="" width="36" height="36" />
            <span class="loadout-chip-meta">
              <strong>${shortName(m.name)}</strong>
              <span>C${m.cost} · ×${n}${upLv ? ` · ↑${upLv}` : ''}</span>
              <span class="pick-stats">HP ${st.hp} · ATK ${st.atk}</span>
            </span>
            <span class="loadout-chip-x">−</span>
          </button>`;
      })
      .join('');

    const poolCards = owned
      .map((m) => {
        const have = vault[m.id] || 0;
        const inLoad = loadout[m.id] || 0;
        const left = have - inLoad;
        const full = left <= 0;
        const upLv = getMonsterUpgradeLevel(state, m.id);
        const st = displayMonsterStats(m, upLv);
        return `
          <button type="button" class="loadout-pick ${full ? 'is-full' : ''}" data-add="${m.id}" data-mid="${m.id}" ${full ? 'aria-disabled="true"' : ''}>
            <img src="${monsterSpriteUrl(m.id, m.color, m.rarity)}" alt="" width="44" height="44" />
            <span class="stars" style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)}</span>
            <strong>${shortName(m.name)}</strong>
            <span class="muted">C${m.cost} · kho ×${have}${inLoad ? ` · +${inLoad}` : ''}${upLv ? ` · ↑${upLv}` : ''}</span>
            <span class="pick-stats">HP ${st.hp} · ATK ${st.atk}</span>
            <span class="pick-stats dim">SPD ${st.speed} · RNG ${st.range}</span>
          </button>`;
      })
      .join('');

    return {
      units,
      html: `
        <div class="loadout-head">
          <div>
            <p class="section-label" style="margin:0">Loadout của bạn</p>
            <h3 style="margin:2px 0 0;font-size:1.05rem">Chọn quái mang vào xếp trận</h3>
            <p class="muted" style="margin:4px 0 0;font-size:0.75rem">
              Pool mang theo <strong>${pool}/${maxPool}</strong>
              · Cap sân <strong>${placeCap}</strong>
              · <strong>${types}</strong> loại
              · ${units} quái
            </p>
            <p class="muted" style="margin:4px 0 0;font-size:0.72rem">
              Pool mang 3× Cap gốc — trên sân chỉ ≤ Cap ${placeCap}; phần dư thả khi có slot.
            </p>
          </div>
          <div class="loadout-tools">
            <button type="button" class="ghost" id="btn-loadout-suggest">Gợi ý</button>
            <button type="button" class="ghost" id="btn-loadout-clear">Xóa</button>
          </div>
        </div>

        <div class="loadout-selected" id="loadout-selected">
          ${loadoutChips || '<p class="muted loadout-empty">Chưa chọn quái — chạm kho bên dưới để thêm.</p>'}
        </div>

        <div class="loadout-filters">
          <button type="button" class="filter-chip ${filterRole === 'all' ? 'active' : ''}" data-lrole="all">Tất cả</button>
          <button type="button" class="filter-chip ${filterRole === 'utility' ? 'active' : ''}" data-lrole="utility">Utility</button>
          <button type="button" class="filter-chip ${filterRole === 'trap' ? 'active' : ''}" data-lrole="trap">Bẫy</button>
          <button type="button" class="filter-chip ${filterRole === 'tank' ? 'active' : ''}" data-lrole="tank">Tank</button>
          <button type="button" class="filter-chip ${filterRole === 'dps' ? 'active' : ''}" data-lrole="dps">DPS</button>
        </div>

        <div class="loadout-pool">
          ${poolCards || '<p class="muted">Kho trống — quay Gacha trước.</p>'}
        </div>

        <div class="unit-stat-panel loadout-stat-panel sticky-stat" id="loadout-stat-panel">
          <p class="muted" style="margin:0;font-size:0.75rem">Chạm / hover thẻ quái để xem mô tả chi tiết.</p>
        </div>
      `,
    };
  }

  function bindLoadout() {
    const panel = root.querySelector('#loadout-panel');
    if (!panel) return;
    const statPanel = panel.querySelector('#loadout-stat-panel');

    function showPickInfo(el) {
      const id = el?.getAttribute?.('data-mid');
      if (!id) return;
      if (statPanel) {
        statPanel.innerHTML = monsterTipHtml(id, state);
        statPanel.classList.add('has-unit');
      }
    }

    function clearPickInfo() {
      if (statPanel) {
        statPanel.classList.remove('has-unit');
        statPanel.innerHTML =
          '<p class="muted" style="margin:0;font-size:0.75rem">Chạm / hover thẻ quái để xem mô tả chi tiết.</p>';
      }
    }

    // Event delegation — không phụ thuộc bind từng nút
    panel.onpointerover = (e) => {
      const el = e.target.closest?.('[data-mid]');
      if (!el || !panel.contains(el)) return;
      showPickInfo(el);
    };
    panel.onpointerout = (e) => {
      const el = e.target.closest?.('[data-mid]');
      if (!el) return;
      const to = e.relatedTarget;
      if (to && (el === to || el.contains(to))) return;
      if (to && to.closest?.('[data-mid]') && panel.contains(to.closest('[data-mid]'))) {
        return; // chuyển sang thẻ khác — pointerover sẽ cập nhật
      }
      clearPickInfo();
    };

    panel.querySelectorAll('[data-add]').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains('is-full') || btn.getAttribute('aria-disabled') === 'true') {
          return;
        }
        showPickInfo(btn);
        const id = btn.getAttribute('data-add');
        const res = tryAddToLoadout(run.loadout, vault, id, loadoutRefCap(map));
        if (!res.ok) {
          toast(res.reason);
          return;
        }
        run.loadout = res.loadout;
        btn.blur();
        refreshLoadout();
      };
    });

    panel.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-remove');
        showPickInfo(btn);
        const res = tryRemoveFromLoadout(run.loadout, id);
        if (res.ok) {
          run.loadout = res.loadout;
          btn.blur();
          refreshLoadout();
        }
      };
    });

    panel.querySelectorAll('[data-lrole]').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        filterRole = btn.getAttribute('data-lrole');
        refreshLoadout();
      };
    });

    panel.querySelector('#btn-loadout-suggest').onclick = (e) => {
      e.preventDefault();
      run.loadout = suggestLoadout(vault, loadoutRefCap(map));
      refreshLoadout();
      toast('Đã gợi ý loadout');
    };

    panel.querySelector('#btn-loadout-clear').onclick = (e) => {
      e.preventDefault();
      run.loadout = {};
      refreshLoadout();
    };
  }

  function refreshLoadout() {
    const page = root.querySelector('.scout-page');
    const pool = root.querySelector('.loadout-pool');
    const keepPageScroll = page ? page.scrollTop : 0;
    const keepPoolScroll = pool ? pool.scrollTop : 0;
    const { html, units } = loadoutPanelHtml();
    const panel = root.querySelector('#loadout-panel');
    if (panel) panel.innerHTML = html;

    const setupBtn = root.querySelector('#btn-to-setup');
    if (setupBtn) setupBtn.disabled = units < 1;

    bindLoadout();

    const restore = () => {
      if (page) page.scrollTop = keepPageScroll;
      const nextPool = root.querySelector('.loadout-pool');
      if (nextPool) nextPool.scrollTop = keepPoolScroll;
    };
    restore();
    requestAnimationFrame(restore);
  }

  // Shell một lần — phần trên không bị vẽ lại khi chọn quái
  const first = loadoutPanelHtml();
  root.innerHTML = `
    <div class="scout-page">
      <div class="scout-lead">
        <div class="kicker">Ải ${run.level} · Trinh sát</div>
        <h2>${map.name}</h2>
        <p class="wave-theme"><strong>${run.waveTheme || 'Wave Hero'}</strong></p>
        <p class="muted">Xem địch → chọn <b>loadout</b> (không giới hạn loại, chỉ giới hạn Cost) → xếp trận.</p>
      </div>
      <div class="flow-legend scout-flow">
        <span class="flow-gate">CỔNG</span>
        <span class="flow-arr">→</span>
        <span><strong>${map.name}</strong> (${map.cols}×${map.rows})</span>
        <span class="flow-arr">→</span>
        <span class="flow-treasure">KHO</span>
      </div>
      <div class="counter-box">
        <h3>Khắc chế & địa hình</h3>
        <div class="counter-tips">
          ${tips.map((t) => `<span>${t}</span>`).join('') || '<span>Cân utility + DPS</span>'}
        </div>
      </div>

      <p class="section-label">Địch (${run.wave.length} Hero)</p>
      ${heroFormationHtml(run.wave)}
      ${scoutMapPreviewHtml(map, run.wave, pathHint)}

      <div class="loadout-panel" id="loadout-panel">${first.html}</div>

      <div class="row scout-actions">
        <button type="button" class="primary" id="btn-to-setup" style="flex:1" ${first.units < 1 ? 'disabled' : ''}>
          Xếp trận với loadout này
        </button>
        <button type="button" id="btn-back-hub">Sảnh</button>
      </div>
    </div>
  `;

  bindLoadout();
  root._cleanup = () => hideMonsterTip(true);

  root.querySelector('#btn-to-setup').onclick = () => {
    hideMonsterTip(true);
    const clean = sanitizeLoadout(run.loadout, vault, loadoutRefCap(map));
    if (!loadoutUnitCount(clean)) {
      toast('Chọn ít nhất 1 quái vào loadout');
      return;
    }
    run.loadout = clean;
    state.lastLoadout = { ...clean };
    saveState(state);
    applyLoadout?.(clean);
    go('setup');
  };

  root.querySelector('#btn-back-hub').onclick = () => {
    hideMonsterTip(true);
    go('hub');
  };
}

export function renderSetup(root, ctx) {
  const { run, go, toast, inventory, state } = ctx;
  if (!run) {
    root.innerHTML = `<p class="muted">Chưa có run.</p>`;
    return;
  }

  // Bảo đảm inventory session = loadout (tránh mang cả kho)
  if (run.loadout && inventory && ctx.ensureLoadoutInventory) {
    ctx.ensureLoadoutInventory();
  }

  const map = run.map;
  let selectedId = run.selectedMonsterId;
  /** @type {null | {col:number,row:number,kind:string,color?:string,costText?:string}} */
  let fxPulse = null;
  let disposeFx = null;
  let bobTimer = 0;
  let cancelGhost = null;
  let showPath = true;
  /** @type {null | {fromCol:number,fromRow:number}} */
  let draggingBoard = null;
  let pathCache = hintPath(map);

  function stopFx() {
    disposeFx?.();
    disposeFx = null;
    clearInterval(bobTimer);
    bobTimer = 0;
    cancelGhost?.();
    cancelGhost = null;
  }

  function tryPlace(col, row, monsterId) {
    const res = placeMonster(run, 0, monsterId, col, row, inventory);
    if (!res.ok) {
      toast(res.reason);
      const el = root.querySelector(`.grid-cell[data-col="${col}"][data-row="${row}"]`);
      el?.classList.add('shake');
      setTimeout(() => el?.classList.remove('shake'), 380);
      return false;
    }
    const m = MONSTER_BY_ID[monsterId];
    fxPulse = { col, row, kind: 'place', color: m?.color, costText: `−${m?.cost ?? '?'}` };
    return true;
  }

  function paint() {
    hideMonsterTip(true);
    stopFx();
    pathCache = hintPath(map);
    const used = mapUsedCost(map);
    const selected = selectedId ? MONSTER_BY_ID[selectedId] : null;
    const ghostSrc = selected
      ? monsterSpriteUrl(selected.id, selected.color, selected.rarity)
      : '';
    const pathHint = showPath
      ? new Set(pathCache.map((p) => `${p.col},${p.row}`))
      : new Set();
    const costPct = Math.min(100, Math.round((used / map.costCap) * 100));
    const costHot = used / map.costCap >= 0.85;

    const cells = [];
    for (let row = 0; row < map.rows; row++) {
      for (let col = 0; col < map.cols; col++) {
        const ch = map.tiles[row][col];
        const key = `${col},${row}`;
        const terrain = terrainAt(map, col, row);
        const isWall = ch === '#' || ch === 'o';
        const isGate = ch === 'G';
        const isTreasure = ch === 'T';
        const buffs = map.buffIndex[key] || [];
        const buffClass = buffs.some((b) => b.side === 'monster')
          ? 'buff-monster'
          : buffs.some((b) => b.side === 'hero')
            ? 'buff-hero'
            : buffs.length
              ? 'buff-both'
              : '';
        const tip = cellTooltip(map, col, row, ch);
        const pathIdx = pathCache.findIndex((p) => p.col === col && p.row === row);
        const pathCls = pathHint.has(key) ? 'path-hint' : '';
        const pathOrd =
          showPath && pathIdx >= 0
            ? `<span class="path-ord" aria-hidden="true"></span>`
            : '';

        if (isWall) {
          cells.push(`
            <div class="grid-cell wall-cell ${ch === 'o' ? 'obstacle-cell' : ''}" data-col="${col}" data-row="${row}" title="${tip}">
              <span class="cell-wall-face"></span>
            </div>`);
          continue;
        }

        const p = map.placements.find((x) => x.col === col && x.row === row);
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
            <button type="button" class="grid-cell filled terrain-${terrain} ${buffClass} ${pathCls} ${trap ? 'is-trap' : ''} ${just}" data-col="${col}" data-row="${row}" data-filled="1" data-mid="${p.monsterId}" draggable="true" style="--m:${m?.color || '#cfc5b2'}" title="${m?.name || ''} · ${tip}" aria-label="${m?.name || 'quái'}">
              <span class="cell-glow"></span>
              ${pathOrd}
              <img class="cell-sprite" src="${src}" alt="" width="36" height="36" draggable="false" />
              <span class="cell-name">${shortName(m?.name)}</span>
              <span class="cell-cost">C${m?.cost ?? '?'}</span>
            </button>`);
        } else {
          const locked = isGate || isTreasure;
          const noPlace = ch === 'x' || map.noPlace?.has(key);
          const placeable = !locked && isPlaceable(map, col, row);
          const canDrop =
            selected && placeable ? 'can-drop' : selected && !placeable ? 'no-drop' : '';
          const dim = selected && !placeable && !locked ? 'dim-cell' : '';
          cells.push(`
            <button type="button" class="grid-cell empty terrain-${terrain} ${buffClass} ${pathCls} ${canDrop} ${dim} ${isGate ? 'edge-in' : ''} ${isTreasure ? 'edge-out' : ''} ${locked ? 'locked-cell' : ''} ${noPlace ? 'no-place-cell' : ''}" data-col="${col}" data-row="${row}" data-placeable="${placeable ? 1 : 0}" title="${tip}" aria-label="Ô ${col},${row}" ${locked ? 'disabled' : ''}>
              ${pathOrd}
              ${
                isGate
                  ? '<span class="cell-mark">G</span>'
                  : isTreasure
                    ? '<span class="cell-mark">T</span>'
                    : noPlace
                      ? '<span class="cell-mark noplace">×</span>'
                    : selected && placeable
                      ? `<img class="ghost-sprite" src="${ghostSrc}" alt="" width="32" height="32" draggable="false" />`
                      : placeable
                        ? '<span class="cell-plus">+</span>'
                        : ''
              }
              ${buffClass === 'buff-monster' ? '<span class="buff-ico mon" title="Buff quái">▲</span>' : ''}
              ${buffClass === 'buff-hero' ? '<span class="buff-ico hero" title="Buff hero">!</span>' : ''}
              ${buffClass === 'buff-both' ? '<span class="buff-ico both" title="Buff chung">◆</span>' : ''}
            </button>`);
        }
      }
    }

    const tray = Object.entries(inventory)
      .filter(([, c]) => c > 0)
      .map(([id, count]) => {
        const m = MONSTER_BY_ID[id];
        if (!m) return '';
        const trap = m.tags?.includes('trap');
        const src = monsterSpriteUrl(id, m.color, m.rarity);
        const upLv = getMonsterUpgradeLevel(state, id);
        const st = displayMonsterStats(m, upLv);
        return `
          <button type="button" class="tray-item ${selectedId === id ? 'selected' : ''}" data-mid="${id}" draggable="true">
            <img class="tray-sprite" src="${src}" alt="" width="40" height="40" draggable="false" />
            <div style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)}</div>
            <div>${shortName(m.name)}</div>
            <div class="muted">C${m.cost} · ×${count}${trap ? ' · Bẫy' : ''}</div>
            <div class="pick-stats">HP ${st.hp} · ATK ${st.atk}</div>
          </button>`;
      })
      .join('');

    const enemyPills = [...run.wave]
      .sort((a, b) => (a.formation?.order || 0) - (b.formation?.order || 0))
      .map(
        (h) => `
        <span class="enemy-pill ${h.class}" title="${h.name} · (${h.formation?.col},${h.formation?.row}) · ${h.spawnDelay?.toFixed?.(1)}s">
          <b>#${h.formation?.order}</b>
          <img src="${heroSpriteUrl(h.id, h.class, h.color)}" alt="" width="20" height="20" />
        </span>`
      )
      .join('');

    root.innerHTML = `
      <div class="setup-layout setup-v2">
        <div class="setup-top">
          <div class="setup-top-left">
            <span class="setup-kicker">Ải ${run.level} · Xếp trận</span>
            <h2>${map.name}</h2>
          </div>
          <button type="button" class="ghost" id="btn-scout">← Trinh sát</button>
        </div>

        <div class="enemy-formation-bar compact" aria-label="Đội hình Hero">
          <span class="enemy-formation-title">Địch</span>
          ${enemyPills}
        </div>

        <div class="room-board map-board interactive-board board-hero">
          <div class="board-chrome">
            <div class="cost-ring ${costHot ? 'hot' : ''}" title="Cost đã dùng">
              <svg viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15.5" class="cost-bg" pathLength="100" />
                <circle cx="18" cy="18" r="15.5" class="cost-fg" pathLength="100" style="stroke-dasharray:${costPct} 100" />
              </svg>
              <span class="cost-num">${used}<small>/${map.costCap}</small></span>
            </div>
            <div class="board-tools">
              <button type="button" class="tool-btn ${showPath ? 'on' : ''}" id="btn-toggle-path" title="Hiện path Hero">Path</button>
              <button type="button" class="tool-btn" id="btn-ghost-walk" title="Xem Hero đi thử">Thử đường</button>
            </div>
            <p class="board-tip muted" id="board-tip">${selected ? `Thả ${selected.name} · kéo từ khay hoặc chạm ô` : 'Chọn / kéo quái · hover ô để xem địa hình'}</p>
          </div>
          <div class="board-stage single-map">
              <div class="grid-board map-grid" style="--cols:${map.cols};--rows:${map.rows};grid-template-columns:repeat(${map.cols},minmax(0,1fr));grid-template-rows:repeat(${map.rows},minmax(0,1fr));aspect-ratio:${map.cols}/${map.rows}">${cells.join('')}</div>
          </div>
          <div class="map-legend-mini" aria-hidden="true">
            <span class="leg wall"></span><span class="leg water"></span><span class="leg dark"></span>
            <span class="leg bm"></span><span class="leg bh"></span>
          </div>
        </div>

        <div class="setup-tray-bar sticky-tray">
          <div class="tray-loadout-hint muted">
            Khay còn lại sẽ thả trong trận · Cap sân ${used}/${map.costCap}
            · Loadout ${Object.keys(run.loadout || {}).length} loại — ← Trinh sát để đổi
          </div>
          <div class="monster-tray">${tray || '<span class="muted">Đã xếp hết / trống — START nếu đã có quái trên sân, hoặc về Trinh sát</span>'}</div>
        </div>

        <div class="setup-footer">
          <button type="button" id="btn-clear">Xóa</button>
          <button type="button" class="primary" id="btn-start">START</button>
        </div>
      </div>
    `;

    const boardEl = root.querySelector('.room-board');
    disposeFx = attachSetupBoardFx(boardEl, { path: showPath ? pathCache : [] });
    boardEl._setupFx?.setPath(showPath ? pathCache : []);

    if (fxPulse) {
      const cell = root.querySelector(
        `.grid-cell[data-col="${fxPulse.col}"][data-row="${fxPulse.row}"]`
      );
      if (cell && boardEl._setupFx) {
          boardEl._setupFx.burstAtCell(
            cell,
            fxPulse.color || selected?.color || '#9a6b2a',
            fxPulse.kind
          );
        if (fxPulse.costText) {
          boardEl._setupFx.floatCost(cell, fxPulse.costText, '#2f6f5e');
        }
      }
      fxPulse = null;
    }

    const sprites = root.querySelectorAll('.cell-sprite');
    bobTimer = window.setInterval(() => {
      sprites.forEach((img, i) => {
        if (img.closest('.just-placed')) return;
        const t = performance.now() / 1000;
        img.style.transform = `translateY(${Math.sin(t * 3.2 + i * 0.7) * 1.5}px)`;
      });
    }, 50);

    const tipEl = root.querySelector('#board-tip');
    const defaultBoardTip = selected
      ? `Thả ${selected.name} · kéo từ khay hoặc chạm ô`
      : 'Chọn / kéo quái · hover ô để xem địa hình';

    // Tray select + drag
    root.querySelectorAll('.tray-item').forEach((el) => {
      el.onclick = () => {
        selectedId = el.getAttribute('data-mid');
        run.selectedMonsterId = selectedId;
        paint();
        requestAnimationFrame(() => {
          root.querySelector('.room-board')?._setupFx?.sparkleSelect(
            MONSTER_BY_ID[selectedId]?.color
          );
        });
      };
      el.ondragstart = (e) => {
        selectedId = el.getAttribute('data-mid');
        run.selectedMonsterId = selectedId;
        e.dataTransfer.setData('text/monster', selectedId);
        e.dataTransfer.setData('text/plain', selectedId);
        e.dataTransfer.effectAllowed = 'copy';
        el.classList.add('dragging');
      };
      el.ondragend = () => el.classList.remove('dragging');
    });

    // Board cells
    root.querySelectorAll('.grid-cell').forEach((el) => {
      const col = Number(el.getAttribute('data-col'));
      const row = Number(el.getAttribute('data-row'));

      el.onpointerenter = () => {
        el.classList.add('hover-preview');
        if (tipEl) tipEl.textContent = el.getAttribute('title') || defaultBoardTip;
        if (showPath && pathHint.has(`${col},${row}`)) {
          el.classList.add('path-hot');
        }
      };
      el.onpointerleave = () => {
        el.classList.remove('hover-preview', 'path-hot');
        if (tipEl) tipEl.textContent = defaultBoardTip;
      };

      if (el.classList.contains('wall-cell') || el.disabled) return;

      el.onclick = () => {
        const existing = map.placements.find((p) => p.col === col && p.row === row);
        if (existing) {
          const mid = existing.monsterId;
          removePlacement(run, 0, col, row, inventory);
          fxPulse = { col, row, kind: 'remove', color: MONSTER_BY_ID[mid]?.color };
          paint();
          return;
        }
        if (!selectedId) {
          toast('Chọn hoặc kéo quái từ khay');
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 380);
          return;
        }
        if (tryPlace(col, row, selectedId)) paint();
      };

      el.ondragover = (e) => {
        if (el.getAttribute('data-placeable') === '1' || el.getAttribute('data-filled') === '1') {
          e.preventDefault();
          el.classList.add('drag-over');
        }
      };
      el.ondragleave = () => el.classList.remove('drag-over');
      el.ondrop = (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const mid = e.dataTransfer.getData('text/monster') || e.dataTransfer.getData('text/plain');
        const from = e.dataTransfer.getData('text/from-cell');
        if (from) {
          const [fc, fr] = from.split(',').map(Number);
          const existing = map.placements.find((p) => p.col === fc && p.row === fr);
          if (!existing) return;
          // move / swap
          const target = map.placements.find((p) => p.col === col && p.row === row);
          if (fc === col && fr === row) return;
          if (target) {
            // swap
            existing.col = col;
            existing.row = row;
            target.col = fc;
            target.row = fr;
            fxPulse = { col, row, kind: 'place', color: MONSTER_BY_ID[existing.monsterId]?.color };
            paint();
            return;
          }
          if (!isPlaceable(map, col, row) || map.tiles[row][col] === 'G' || map.tiles[row][col] === 'T') {
            toast('Ô không đặt được');
            return;
          }
          existing.col = col;
          existing.row = row;
          fxPulse = { col, row, kind: 'place', color: MONSTER_BY_ID[existing.monsterId]?.color };
          paint();
          return;
        }
        if (mid && el.getAttribute('data-placeable') === '1') {
          selectedId = mid;
          run.selectedMonsterId = mid;
          if (tryPlace(col, row, mid)) paint();
        }
      };

      if (el.getAttribute('data-filled') === '1') {
        el.ondragstart = (e) => {
          e.dataTransfer.setData('text/from-cell', `${col},${row}`);
          e.dataTransfer.effectAllowed = 'move';
          el.classList.add('dragging');
          draggingBoard = { fromCol: col, fromRow: row };
        };
        el.ondragend = () => {
          el.classList.remove('dragging');
          draggingBoard = null;
        };
      }
    });

    root.querySelector('#btn-toggle-path').onclick = () => {
      showPath = !showPath;
      paint();
    };

    root.querySelector('#btn-ghost-walk').onclick = () => {
      cancelGhost?.();
      const hero = run.wave[0];
      if (!hero || !pathCache.length) {
        toast('Không có path tới Kho');
        return;
      }
      cancelGhost = playGhostWalk(boardEl, pathCache, hero);
      toast(`${hero.name} đi thử đường…`);
    };

    root.querySelector('#btn-scout').onclick = () => {
      hideMonsterTip(true);
      stopFx();
      go('scout');
    };
    root.querySelector('#btn-clear').onclick = () => {
      [...map.placements].forEach((p) => {
        removePlacement(run, 0, p.col, p.row, inventory);
      });
      boardEl._setupFx?.sparkleSelect('#90a4ae');
      paint();
    };
    root.querySelector('#btn-start').onclick = () => {
      if (totalPlacements(run) === 0) {
        toast('Hãy thả ít nhất 1 quái!');
        return;
      }
      // Phần còn trong khay → tay bài thả trong trận
      run.deployHand = { ...inventory };
      hideMonsterTip(true);
      stopFx();
      go('combat');
    };
  }

  paint();

  root._cleanup = () => {
    hideMonsterTip(true);
    stopFx();
  };
}
