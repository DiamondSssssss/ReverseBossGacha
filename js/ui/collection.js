import { MONSTERS } from '../data/monsters.js?v=84';
import {
  RARITY_COLORS,
  RARITY_LABELS,
  INVENTORY_CAP,
  MONSTER_UPGRADE,
} from '../data/constants.js?v=84';
import { monsterDisplayUrl } from '../render/sprites.js?v=84';
import {
  displayMonsterStats,
  getMonsterUpgradeLevel,
  tryUpgradeMonster,
  upgradeMonsterCost,
} from '../core/monsterUpgrade.js?v=84';
import { evaluateAchievements } from '../core/achievements.js?v=84';
import { describeMonsterKit } from '../data/skillDesc.js?v=84';
import { inventoryOwnCap } from '../core/storage.js?v=84';

const filters = {
  q: '',
  rarity: 'all',
  own: 'all',
  role: 'all',
  sort: 'rarity',
};

// Bỏ role filter cũ Mythic/Drawback (hiểu nhầm — drawback là hạn chế trên thẻ quái)
if (filters.role === 'mythic' || filters.role === 'drawback') filters.role = 'all';

const ROLE_OPTIONS = [
  { id: 'all', label: 'Mọi role' },
  { id: 'utility', label: 'Utility' },
  { id: 'trap', label: 'Bẫy' },
  { id: 'tank', label: 'Tank' },
  { id: 'dps', label: 'DPS' },
  { id: 'heal', label: 'Heal' },
  { id: 'anti_heal', label: 'Giảm hồi' },
  { id: 'silence', label: 'Silence' },
  { id: 'anti_rogue', label: 'Anti-Rogue' },
  { id: 'boss', label: 'Boss' },
  { id: 'potion', label: 'Potion' },
  { id: 'rainbow', label: 'Cầu vồng' },
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kitHtml(m) {
  const kit = describeMonsterKit(m);
  if (!kit.length) return '';
  return `<div class="card-kit">${kit
    .map(
      (k) =>
        `<div class="card-skill"><b>${escapeHtml(k.name)}</b> — ${escapeHtml(k.desc)}</div>`
    )
    .join('')}</div>`;
}

function matchesRole(m, role) {
  if (role === 'all') return true;
  const tags = m.tags || [];
  if (role === 'tank') return tags.some((t) => t === 'tank' || t === 'tankette');
  if (role === 'anti_rogue') {
    return tags.some((t) => t === 'anti_rogue' || t === 'detect' || t === 'trap');
  }
  return tags.includes(role);
}

function filterList(state) {
  let list = MONSTERS.filter((m) => {
    const count = state.inventory[m.id] || 0;
    if (filters.own === 'owned' && count <= 0) return false;
    if (filters.own === 'locked' && count > 0) return false;
    if (filters.rarity !== 'all' && m.rarity !== Number(filters.rarity)) return false;
    if (!matchesRole(m, filters.role)) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const kitText = describeMonsterKit(m)
        .map((k) => `${k.name} ${k.desc}`)
        .join(' ');
      const hay =
        count > 0
          ? `${m.name} ${m.description} ${m.id} ${kitText}`.toLowerCase()
          : `${RARITY_LABELS[m.rarity]} ★${m.rarity}`.toLowerCase();
      if (!hay.includes(q) && !(count <= 0 && q.includes('?'))) return false;
    }
    return true;
  });

  return [...list].sort((a, b) => {
    if (filters.sort === 'name') return a.name.localeCompare(b.name, 'vi');
    if (filters.sort === 'cost') return a.cost - b.cost || b.rarity - a.rarity;
    if (filters.sort === 'owned') {
      const ca = state.inventory[a.id] || 0;
      const cb = state.inventory[b.id] || 0;
      return cb - ca || b.rarity - a.rarity;
    }
    return b.rarity - a.rarity || a.name.localeCompare(b.name, 'vi');
  });
}

function chip(active, attrs, label) {
  return `<button type="button" class="filter-chip ${active ? 'active' : ''}" ${attrs}>${label}</button>`;
}

function renderCards(state) {
  const list = filterList(state);
  const cards = list
    .map((m) => {
      const count = state.inventory[m.id] || 0;
      const unlocked = count > 0;
      const src = monsterDisplayUrl(unlocked, m.id, m.color, m.rarity);
      if (!unlocked) {
        return `
      <article class="monster-card locked">
        <img class="card-sprite locked-sprite" src="${src}" alt="Chưa mở khóa" width="64" height="64" />
        <div class="body">
          <div class="stars" style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)} <span class="rarity-tag">${RARITY_LABELS[m.rarity]}</span></div>
          <div class="name">???</div>
          <div class="muted" style="font-size:0.75rem;margin-top:2px">Cost ? · HP ? · ATK ?</div>
          ${m.rarity >= 7 ? '<div class="desc drawback-line">Cầu vồng — aura toàn map, drawback nặng</div>' : m.rarity >= 6 ? '<div class="desc drawback-line">Mythic — có drawback khi dùng</div>' : ''}
          <div class="desc">Chưa mở khóa — quay Gacha hoặc thắng ải để nhận.</div>
          <div class="count locked-count">Chưa sở hữu</div>
        </div>
      </article>`;
      }
      const upLv = getMonsterUpgradeLevel(state, m.id);
      const st = displayMonsterStats(m, upLv);
      const maxed = upLv >= MONSTER_UPGRADE.MAX_LEVEL;
      const upCost = upgradeMonsterCost(m.id, upLv);
      const costOk = upCost != null && Number.isFinite(upCost);
      const canAfford = costOk && state.gold >= upCost;
      return `
      <article class="monster-card" data-mid="${m.id}">
        <img class="card-sprite" src="${src}" alt="" width="64" height="64" />
        <div class="body">
          <div class="stars" style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)} <span class="rarity-tag">${RARITY_LABELS[m.rarity]}</span></div>
          <div class="name">${escapeHtml(m.name)}</div>
          <div class="muted" style="font-size:0.75rem;margin-top:2px">Cost ${m.cost} · HP ${st.hp} · ATK ${st.atk}${upLv ? ` · Lv↑${upLv}` : ''}</div>
          ${m.drawback ? `<div class="desc drawback-line">⚠ ${escapeHtml(m.drawback)}</div>` : ''}
          ${kitHtml(m)}
          <div class="desc">${escapeHtml(m.description || '')}</div>
          <div class="count">Sở hữu ×${count}/${inventoryOwnCap(m.id)}</div>
          <div class="upgrade-row">
            <button type="button" class="btn-upgrade-mon" data-upgrade="${m.id}" ${maxed || !canAfford ? 'disabled' : ''}>
              ${maxed ? 'MAX' : costOk ? `Nâng Lv ${upLv + 1} · ${upCost} vàng` : 'Không nâng được'}
            </button>
          </div>
        </div>
      </article>`;
    })
    .join('');
  return { html: cards || '<p class="muted collection-empty">Không có quái khớp bộ lọc.</p>', count: list.length };
}

function updateGrid(root, ctx) {
  const state = ctx.state || ctx;
  const ownedCount = MONSTERS.filter((m) => (state.inventory[m.id] || 0) > 0).length;
  const { html, count } = renderCards(state);
  const grid = root.querySelector('#collection-grid');
  const meta = root.querySelector('#collection-meta');
  if (grid) grid.innerHTML = html;
  if (meta) {
    meta.innerHTML = `Đã mở <strong>${ownedCount}/${MONSTERS.length}</strong> · Cap ×${INVENTORY_CAP}/loại · Đang hiện ${count}`;
  }
  bindUpgradeButtons(root, ctx.state ? ctx : { state });
}

function bindUpgradeButtons(root, ctx) {
  const state = ctx.state;
  root.querySelectorAll('[data-upgrade]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-upgrade');
      const res = tryUpgradeMonster(state, id);
      if (!res.ok) {
        ctx.toast?.(res.reason);
        return;
      }
      const unlocked = evaluateAchievements(state);
      ctx.announceAchievements?.(unlocked);
      const name = MONSTERS.find((m) => m.id === id)?.name || id;
      ctx.toast?.(`${name} → Lv ${res.level}`);
      ctx.refreshChrome?.();
      renderCollection(root, ctx);
    };
  });
}

export function renderCollection(root, ctx) {
  const { state } = ctx;
  const ownedCount = MONSTERS.filter((m) => (state.inventory[m.id] || 0) > 0).length;
  const { html, count } = renderCards(state);

  root.innerHTML = `
    <div class="collection-head">
      <div>
        <p class="section-label" style="margin-top:0">Sưu tầm</p>
        <h2>Kho quái</h2>
        <p class="muted" id="collection-meta">Đã mở <strong>${ownedCount}/${MONSTERS.length}</strong> · Cap ×${INVENTORY_CAP}/loại · Đang hiện ${count}</p>
        <p class="muted" style="font-size:0.78rem;margin:4px 0 0">Dùng <strong>Vàng</strong> nâng HP/ATK (+${Math.round(MONSTER_UPGRADE.STAT_PER_LEVEL * 100)}%/cấp · max Lv ${MONSTER_UPGRADE.MAX_LEVEL}).</p>
      </div>
      <button type="button" class="ghost" id="btn-col-heroes">Catalog Hero</button>
    </div>

    <div class="collection-filters">
      <label class="filter-search">
        <span class="sr-only">Tìm</span>
        <input type="search" id="col-q" placeholder="Tìm tên / mô tả…" value="${filters.q.replace(/"/g, '&quot;')}" autocomplete="off" />
      </label>

      <div class="filter-row" data-group="own">
        ${chip(filters.own === 'all', 'data-own="all"', 'Tất cả')}
        ${chip(filters.own === 'owned', 'data-own="owned"', 'Đã có')}
        ${chip(filters.own === 'locked', 'data-own="locked"', 'Chưa có')}
      </div>

      <div class="filter-row" data-group="rarity">
        ${chip(filters.rarity === 'all', 'data-rarity="all"', '★ Tất cả')}
        ${[1, 2, 3, 4, 5]
          .map((r) => chip(filters.rarity === String(r), `data-rarity="${r}"`, `${'★'.repeat(r)}`))
          .join('')}
        ${chip(filters.rarity === '6', 'data-rarity="6"', '★★★★★★ Mythic')}
        ${chip(filters.rarity === '7', 'data-rarity="7"', '★★★★★★★ Cầu vồng')}
      </div>

      <div class="filter-row filter-row-scroll" data-group="role">
        ${ROLE_OPTIONS.map((r) =>
          chip(filters.role === r.id, `data-role="${r.id}"`, r.label)
        ).join('')}
      </div>

      <div class="filter-sort">
        <label for="col-sort">Sắp xếp</label>
        <select id="col-sort">
          <option value="rarity" ${filters.sort === 'rarity' ? 'selected' : ''}>Độ hiếm</option>
          <option value="name" ${filters.sort === 'name' ? 'selected' : ''}>Tên A–Z</option>
          <option value="cost" ${filters.sort === 'cost' ? 'selected' : ''}>Cost</option>
          <option value="owned" ${filters.sort === 'owned' ? 'selected' : ''}>Số lượng sở hữu</option>
        </select>
      </div>
    </div>

    <div class="collection-grid" id="collection-grid">${html}</div>
  `;

  const refreshChips = () => renderCollection(root, ctx);

  root.querySelector('#col-q').addEventListener('input', (e) => {
    filters.q = e.target.value.trim();
    updateGrid(root, ctx);
  });

  root.querySelectorAll('[data-own]').forEach((btn) => {
    btn.onclick = () => {
      filters.own = btn.getAttribute('data-own');
      refreshChips();
    };
  });
  root.querySelectorAll('[data-rarity]').forEach((btn) => {
    btn.onclick = () => {
      filters.rarity = btn.getAttribute('data-rarity');
      refreshChips();
    };
  });
  root.querySelectorAll('[data-role]').forEach((btn) => {
    btn.onclick = () => {
      filters.role = btn.getAttribute('data-role');
      refreshChips();
    };
  });
  root.querySelector('#col-sort').onchange = (e) => {
    filters.sort = e.target.value;
    updateGrid(root, ctx);
  };

  root.querySelector('#btn-col-heroes')?.addEventListener('click', () => ctx.go('heroes'));

  bindUpgradeButtons(root, ctx);
}
