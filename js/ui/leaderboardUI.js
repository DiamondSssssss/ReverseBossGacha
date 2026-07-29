import { MONSTERS } from '../data/monsters.js?v=120';
import { RARITY_COLORS, RARITY_LABELS, MAX_STAGE } from '../data/constants.js?v=120';
import { monsterDisplayUrl } from '../render/sprites.js?v=120';
import { fetchLeaderboard, fetchPlayerProfile } from '../core/leaderboard.js?v=120';
import { getUser } from '../core/auth.js?v=120';
import { titleName } from '../core/challenge.js?v=120';
import { CHALLENGES } from '../data/challenges.js?v=120';
import { getEquippedMonsterAppearance } from '../core/monsterSkins.js?v=120';

const CHALLENGE_TOTAL = CHALLENGES.length || 10;

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function challengeLabel(cleared) {
  const n = Number(cleared) || 0;
  return `${n}/${CHALLENGE_TOTAL}`;
}

function medal(rank) {
  if (rank === 1) return '①';
  if (rank === 2) return '②';
  if (rank === 3) return '③';
  return String(rank);
}

function closeModal(modalEl) {
  modalEl.classList.remove('show');
  modalEl.innerHTML = '';
}

function ownedIds(profile) {
  const set = new Set([...(profile.ownedEver || [])]);
  for (const [id, count] of Object.entries(profile.inventory || {})) {
    if ((Number(count) || 0) > 0) set.add(id);
  }
  return set;
}

function titleBadge(titleId) {
  const name = titleName(titleId);
  if (!name) return '';
  return `<span class="lb-title">${escapeHtml(name)}</span>`;
}

function renderMonsterGrid(profile) {
  const owned = ownedIds(profile);
  const list = MONSTERS.filter((m) => owned.has(m.id)).sort(
    (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, 'vi')
  );

  if (!list.length) {
    return `<p class="muted" style="padding:8px 0">Chưa thu thập quái nào.</p>`;
  }

  return list
    .map((m) => {
      const count = profile.inventory?.[m.id] || 0;
      const upLv = profile.monsterUpgrades?.[m.id] || 0;
      const src = monsterDisplayUrl(
        true,
        m.id,
        m.color,
        m.rarity,
        getEquippedMonsterAppearance(profile, m.id, m)
      );
      const everOnly = count <= 0;
      return `
        <article class="lb-mon">
          <img src="${src}" alt="" width="48" height="48" />
          <div class="lb-mon-name">${escapeHtml(m.name)}</div>
          <div class="lb-mon-meta" style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)} ${RARITY_LABELS[m.rarity]}</div>
          <div class="lb-mon-count">${everOnly ? 'Đã từng có' : `×${count}`}${upLv ? ` · Lv↑${upLv}` : ''}</div>
        </article>`;
    })
    .join('');
}

export async function openPlayerProfile(modalEl, username, { toast } = {}) {
  if (!modalEl || !username) return;
  modalEl.classList.add('show');
  modalEl.innerHTML = `
    <div class="modal profile-modal" role="dialog" aria-modal="true">
      <p class="section-label" style="margin:0">Hồ sơ</p>
      <h2 style="margin:4px 0 12px">Đang tải…</h2>
      <button type="button" class="ghost" data-close>Đóng</button>
    </div>`;
  modalEl.querySelector('[data-close]').onclick = () => closeModal(modalEl);
  modalEl.onclick = (e) => {
    if (e.target === modalEl) closeModal(modalEl);
  };

  try {
    const profile = await fetchPlayerProfile(username);
    const me = getUser();
    const isMe = me && me.username?.toLowerCase() === profile.username.toLowerCase();
    const owned = ownedIds(profile).size;
    const eqTitle = titleName(profile.equippedTitle);

    modalEl.innerHTML = `
      <div class="modal profile-modal" role="dialog" aria-modal="true">
        <div class="profile-head">
          <div>
            <p class="section-label" style="margin:0">${isMe ? 'Hồ sơ của bạn' : 'Hồ sơ'}</p>
            <h2>${escapeHtml(profile.displayName || profile.username)}</h2>
            <p class="muted">@${escapeHtml(profile.username)}</p>
            ${eqTitle ? `<p class="lb-title profile-title">${escapeHtml(eqTitle)}</p>` : ''}
          </div>
          <button type="button" class="ghost" data-close>Đóng</button>
        </div>
        <div class="profile-stats">
          <div><strong>${Number(profile.stagesCleared) >= MAX_STAGE ? 'Phá đảo' : `${Number(profile.stagesCleared) || 0}/${MAX_STAGE}`}</strong><span>Ải thường</span></div>
          <div><strong>${Number(profile.hardStagesCleared) >= MAX_STAGE ? 'Phá đảo' : `${Number(profile.hardStagesCleared) || 0}/${MAX_STAGE}`}</strong><span>Ải khó</span></div>
          <div><strong>${challengeLabel(profile.challengesCleared)}</strong><span>Thử thách</span></div>
          <div><strong>${owned}/${MONSTERS.length}</strong><span>Loại quái</span></div>
          <div><strong>${profile.wins || 0}</strong><span>Thắng</span></div>
        </div>
        <p class="section-label">Bộ sưu tập</p>
        <div class="lb-mon-grid">${renderMonsterGrid(profile)}</div>
      </div>`;

    modalEl.querySelector('[data-close]').onclick = () => closeModal(modalEl);
    modalEl.onclick = (e) => {
      if (e.target === modalEl) closeModal(modalEl);
    };
  } catch (e) {
    closeModal(modalEl);
    toast?.(e.message || 'Không tải được hồ sơ');
  }
}

function rowHtml(entry, meUsername) {
  const isMe =
    meUsername && entry.username?.toLowerCase() === meUsername.toLowerCase();
  const rankClass =
    entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : '';
  const titleHtml = titleBadge(entry.equippedTitle);
  const n = Number(entry.stagesCleared) || 0;
  const h = Number(entry.hardStagesCleared) || 0;
  const c = Number(entry.challengesCleared) || 0;
  return `
    <button type="button" class="lb-row ${isMe ? 'me' : ''} ${rankClass}" data-user="${escapeHtml(entry.username)}">
      <span class="lb-rank">${medal(entry.rank)}</span>
      <span class="lb-who">
        <strong>${escapeHtml(entry.displayName || entry.username)}</strong>
        ${titleHtml}
        <span class="muted">@${escapeHtml(entry.username)}</span>
      </span>
      <span class="lb-stat">
        <strong>${n >= MAX_STAGE ? 'Phá đảo' : `${n}/${MAX_STAGE}`}</strong>
        <span>Thường</span>
      </span>
      <span class="lb-stat">
        <strong>${h >= MAX_STAGE ? 'Phá đảo' : `${h}/${MAX_STAGE}`}</strong>
        <span>Khó</span>
      </span>
      <span class="lb-stat">
        <strong>${c}/${CHALLENGE_TOTAL}</strong>
        <span>Challenge</span>
      </span>
      <span class="lb-stat">
        <strong>${entry.uniqueMonsters}</strong>
        <span>Quái</span>
      </span>
    </button>`;
}

export async function renderLeaderboard(root, ctx) {
  const { toast, modalEl } = ctx;
  const me = getUser();

  root.innerHTML = `
    <div class="lb-hero">
      <p class="section-label" style="margin:0">Cộng đồng</p>
      <h2>Bảng xếp hạng</h2>
      <p class="muted">Xếp theo ải thường → ải khó → challenge đã vượt → quái unique. Bấm vào người chơi để xem hồ sơ.</p>
    </div>
    <div class="lb-toolbar">
      <button type="button" class="ghost" id="lb-refresh">Làm mới</button>
      ${
        me
          ? `<span class="muted lb-hint">Đăng nhập: <strong>${escapeHtml(me.displayName || me.username)}</strong></span>`
          : `<span class="muted lb-hint">Đăng nhập + đồng bộ cloud để lên bảng xếp hạng.</span>`
      }
    </div>
    <div class="lb-list" id="lb-list">
      <p class="muted" style="padding:16px 0">Đang tải bảng xếp hạng…</p>
    </div>
  `;

  const listEl = root.querySelector('#lb-list');

  async function load() {
    listEl.innerHTML = `<p class="muted" style="padding:16px 0">Đang tải bảng xếp hạng…</p>`;
    try {
      const entries = await fetchLeaderboard(50);
      if (!entries.length) {
        listEl.innerHTML = `
          <div class="lb-empty">
            <p>Chưa có ai trên bảng xếp hạng.</p>
            <p class="muted">Đăng nhập tài khoản và đồng bộ tiến độ để xuất hiện tại đây.</p>
          </div>`;
        return;
      }
      listEl.innerHTML = entries.map((e) => rowHtml(e, me?.username)).join('');
      listEl.querySelectorAll('[data-user]').forEach((btn) => {
        btn.onclick = () => {
          openPlayerProfile(modalEl, btn.getAttribute('data-user'), { toast });
        };
      });
    } catch (e) {
      listEl.innerHTML = `
        <div class="lb-empty">
          <p>Không tải được bảng xếp hạng.</p>
          <p class="muted">${escapeHtml(e.message || 'Lỗi mạng / server')}</p>
        </div>`;
    }
  }

  root.querySelector('#lb-refresh').onclick = () => load();
  await load();
}

