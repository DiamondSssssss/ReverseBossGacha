import { MONSTERS } from '../data/monsters.js';
import { RARITY_COLORS, RARITY_LABELS } from '../data/constants.js';
import { monsterDisplayUrl } from '../render/sprites.js';

const filters = {
  q: '',
  rarity: 'all',
  own: 'all',
  role: 'all',
  sort: 'rarity',
};

const ROLE_OPTIONS = [
  { id: 'all', label: 'Mọi role' },
  { id: 'utility', label: 'Utility' },
  { id: 'trap', label: 'Bẫy' },
  { id: 'tank', label: 'Tank' },
  { id: 'dps', label: 'DPS' },
  { id: 'silence', label: 'Silence' },
  { id: 'anti_rogue', label: 'Anti-Rogue' },
  { id: 'boss', label: 'Boss' },
];

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
      // Chưa mở khóa: chỉ tìm theo độ hiếm / id ẩn, không lộ tên
      const count = state.inventory[m.id] || 0;
      const hay =
        count > 0
          ? `${m.name} ${m.description} ${m.id}`.toLowerCase()
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
          <div class="desc">Chưa mở khóa — quay Gacha hoặc thắng ải để nhận.</div>
          <div class="count locked-count">Chưa sở hữu</div>
        </div>
      </article>`;
      }
      return `
      <article class="monster-card">
        <img class="card-sprite" src="${src}" alt="" width="64" height="64" />
        <div class="body">
          <div class="stars" style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)} <span class="rarity-tag">${RARITY_LABELS[m.rarity]}</span></div>
          <div class="name">${m.name}</div>
          <div class="muted" style="font-size:0.75rem;margin-top:2px">Cost ${m.cost} · HP ${m.stats.hp} · ATK ${m.stats.atk}</div>
          <div class="desc">${m.description}</div>
          <div class="count">Sở hữu ×${count}</div>
        </div>
      </article>`;
    })
    .join('');
  return { html: cards || '<p class="muted collection-empty">Không có quái khớp bộ lọc.</p>', count: list.length };
}

function updateGrid(root, state) {
  const ownedCount = MONSTERS.filter((m) => (state.inventory[m.id] || 0) > 0).length;
  const { html, count } = renderCards(state);
  const grid = root.querySelector('#collection-grid');
  const meta = root.querySelector('#collection-meta');
  if (grid) grid.innerHTML = html;
  if (meta) {
    meta.innerHTML = `Đã mở <strong>${ownedCount}/${MONSTERS.length}</strong> · Đang hiện ${count}`;
  }
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
        <p class="muted" id="collection-meta">Đã mở <strong>${ownedCount}/${MONSTERS.length}</strong> · Đang hiện ${count}</p>
      </div>
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
    updateGrid(root, state);
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
    updateGrid(root, state);
  };
}
