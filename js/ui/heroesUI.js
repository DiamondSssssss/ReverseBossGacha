import { HEROES } from '../data/heroes.js?v=129';
import { HERO_CLASS_LABELS } from '../data/constants.js?v=129';
import { heroSpriteUrl } from '../render/sprites.js?v=129';

const filters = {
  q: '',
  cls: 'all',
  sort: 'class',
};

const CLASS_OPTIONS = [
  { id: 'all', label: 'Mọi class' },
  ...Object.entries(HERO_CLASS_LABELS).map(([id, label]) => ({ id, label })),
];

const CLASS_ORDER = {
  TANK: 0,
  WARRIOR: 1,
  BERSERKER: 2,
  ARCHER: 3,
  MAGE: 4,
  HEXER: 5,
  HEALER: 6,
  ROGUE: 7,
  SCOUT: 8,
  BOSS: 9,
};

function filterList() {
  let list = HEROES.filter((h) => {
    if (filters.cls !== 'all' && h.class !== filters.cls) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = `${h.name} ${h.description} ${h.id} ${HERO_CLASS_LABELS[h.class] || ''} ${
        h.skills || []
      }`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return [...list].sort((a, b) => {
    if (filters.sort === 'name') return a.name.localeCompare(b.name, 'vi');
    if (filters.sort === 'hp') return b.hp - a.hp || a.name.localeCompare(b.name, 'vi');
    if (filters.sort === 'atk') return b.atk - a.atk || a.name.localeCompare(b.name, 'vi');
    if (filters.sort === 'range') return b.range - a.range || b.atk - a.atk;
    const ca = CLASS_ORDER[a.class] ?? 99;
    const cb = CLASS_ORDER[b.class] ?? 99;
    return ca - cb || b.hp - a.hp || a.name.localeCompare(b.name, 'vi');
  });
}

function chip(active, attrs, label) {
  return `<button type="button" class="filter-chip ${active ? 'active' : ''}" ${attrs}>${label}</button>`;
}

function skillTags(h) {
  const skills = h.skills || [];
  const tags = [];
  if (h.stealth) tags.push('Tàng hình');
  if (skills.includes('BERSERK')) tags.push('Berserk');
  if (h.class === 'HEXER' || skills.includes('HEAL_CUT')) tags.push('Giảm hồi');
  if (skills.includes('TAUNT_SELF')) tags.push('Khiêu khích');
  if (skills.includes('SHIELD')) tags.push('Khiên');
  if (skills.includes('HEAL_ALLY')) tags.push('Hồi máu');
  if (skills.includes('HERO_AURA_ATK')) tags.push('Buff công');
  if (skills.includes('HERO_AURA_SHIELD')) tags.push('Buff khiên');
  if (skills.includes('SHIELD_ALLY')) tags.push('Trao khiên');
  if (skills.includes('STASIS_REVIVE')) tags.push('Ngủ đông');
  if (skills.includes('HERO_AURA_SPEED')) tags.push('Buff tốc chạy');
  if (skills.includes('AOE_FIRE') || skills.includes('AOE_FROST')) tags.push('AoE');
  if (skills.includes('FREEZE')) tags.push('Đóng băng');
  if (skills.includes('BACKSTAB')) tags.push('Lén đánh');
  if (skills.includes('REVEAL')) tags.push('Soi hình');
  if (h.class === 'ARCHER') tags.push('Tầm xa');
  if (h.class === 'SCOUT') tags.push('Trinh sát');
  if (h.class === 'BOSS' || h.isBoss) tags.push('Hero Boss');
  if (h.class === 'TANK') tags.push('Thuần tank');
  return tags;
}

function heroCue(h) {
  const ai = h.ai_behavior || {};
  let role = HERO_CLASS_LABELS[h.class] || h.class;
  if (ai.movementStyle === 'STEALTH_AMBUSH' || ai.movementStyle === 'FLANKING') role = 'Lách sườn';
  else if (ai.movementStyle === 'KITING' || ai.movementStyle === 'KEEP_DISTANCE') role = 'Thả diều';
  else if (ai.movementStyle === 'TANK_WALL') role = 'Giữ choke';
  else if (ai.movementStyle === 'SUICIDE_CHARGE') role = 'Cảm tử';
  else if (ai.movementStyle === 'CHARGER' || ai.movementStyle === 'BULL_RUSH') role = 'Lao thẳng';
  else if (ai.movementStyle === 'ZONING_ORBIT') role = 'Chiếm ô mạnh';

  let danger = 'Ép lane trực diện.';
  if (ai.targetPriority === 'TREASURE_RUSH') danger = 'Thấy hở là đâm Kho.';
  else if (ai.targetPriority === 'BACKLINE_DIVE' || ai.targetPriority === 'HIGH_THREAT') {
    danger = 'Ưu tiên dí carry/support.';
  } else if (ai.targetPriority === 'LOWEST_HP_ALLOY') danger = 'Săn mục tiêu thấp máu.';
  else if (ai.targetPriority === 'CROWD_DENSEST') danger = 'Thích xả vào cụm đông.';
  else if (ai.targetPriority === 'AOE_BUFF_CARRIER') danger = 'Bám buff hoặc bảo kê lõi.';

  return { role, danger };
}

function renderCards() {
  const list = filterList();
  const cards = list
    .map((h) => {
      const src = heroSpriteUrl(h.id, h.class, h.color);
      const tags = skillTags(h);
      const cls = HERO_CLASS_LABELS[h.class] || h.class;
      const cue = heroCue(h);
      return `
      <article class="monster-card hero-card" data-hid="${h.id}">
        <img class="card-sprite" src="${src}" alt="" width="64" height="64" />
        <div class="body">
          <div class="stars" style="color:${h.color}">${cls}</div>
          <div class="name">${h.name}</div>
          <div class="muted" style="font-size:0.75rem;margin-top:2px">
            HP ${h.hp} · ATK ${h.atk} · SPD ${h.speed} · RNG ${h.range} · AS ${h.atkSpeed}
          </div>
          ${
            tags.length
              ? `<div class="hero-tags">${tags.map((t) => `<span class="hero-tag">${t}</span>`).join('')}</div>`
              : ''
          }
          <div class="desc"><b>${cue.role}</b> · ${cue.danger}</div>
        </div>
      </article>`;
    })
    .join('');
  return { html: cards || '<p class="muted collection-empty">Không có hero khớp bộ lọc.</p>', count: list.length };
}

function bindFilters(root, ctx) {
  const q = root.querySelector('#hero-q');
  if (q) {
    q.oninput = () => {
      filters.q = q.value.trim();
      updateGrid(root);
    };
  }
  root.querySelectorAll('[data-hclass]').forEach((btn) => {
    btn.onclick = () => {
      filters.cls = btn.getAttribute('data-hclass');
      renderHeroes(root, ctx);
    };
  });
  const sort = root.querySelector('#hero-sort');
  if (sort) {
    sort.onchange = () => {
      filters.sort = sort.value;
      updateGrid(root);
    };
  }
}

function updateGrid(root) {
  const { html, count } = renderCards();
  const grid = root.querySelector('#heroes-grid');
  const meta = root.querySelector('#heroes-meta');
  if (grid) grid.innerHTML = html;
  if (meta) {
    meta.innerHTML = `Catalog <strong>${HEROES.length}</strong> hero · Đang hiện ${count}`;
  }
}

export function renderHeroes(root, ctx) {
  const { html, count } = renderCards();
  root.innerHTML = `
    <div class="collection-head">
      <div>
        <p class="section-label" style="margin-top:0">Địch thủ</p>
        <h2>Catalog Hero</h2>
        <p class="muted" id="heroes-meta">Catalog <strong>${HEROES.length}</strong> hero · Đang hiện ${count}</p>
        <p class="muted" style="font-size:0.78rem;margin:4px 0 0">
          Hero là địch xâm nhập hầm — xem class / skill để chọn quái khắc chế. Ải 30–60 trộn Cung thủ, Thuần tank, Berserker.
        </p>
      </div>
      <button type="button" class="ghost" id="btn-heroes-to-col">Kho quái</button>
    </div>

    <div class="collection-filters">
      <label class="filter-search">
        <span class="sr-only">Tìm</span>
        <input type="search" id="hero-q" placeholder="Tìm tên / class / skill…" value="${filters.q.replace(/"/g, '&quot;')}" autocomplete="off" />
      </label>

      <div class="filter-row filter-row-scroll" data-group="hclass">
        ${CLASS_OPTIONS.map((c) =>
          chip(filters.cls === c.id, `data-hclass="${c.id}"`, c.label)
        ).join('')}
      </div>

      <label class="filter-sort">
        Sắp xếp
        <select id="hero-sort">
          <option value="class" ${filters.sort === 'class' ? 'selected' : ''}>Theo class</option>
          <option value="hp" ${filters.sort === 'hp' ? 'selected' : ''}>HP cao</option>
          <option value="atk" ${filters.sort === 'atk' ? 'selected' : ''}>ATK cao</option>
          <option value="range" ${filters.sort === 'range' ? 'selected' : ''}>Tầm xa</option>
          <option value="name" ${filters.sort === 'name' ? 'selected' : ''}>Tên A–Z</option>
        </select>
      </label>
    </div>

    <div class="collection-grid" id="heroes-grid">${html}</div>
  `;

  bindFilters(root, ctx);
  root.querySelector('#btn-heroes-to-col').onclick = () => ctx.go('collection');
}

