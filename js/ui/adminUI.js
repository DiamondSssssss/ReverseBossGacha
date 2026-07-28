import { isAdmin } from '../core/auth.js?v=113';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminUser,
  patchAdminUser,
  deleteAdminUser,
  fetchRedeemCodesAdmin,
  createRedeemCodeAdmin,
  updateRedeemCodeAdmin,
  deleteRedeemCodeAdmin,
} from '../core/adminApi.js?v=113';
import { formatRedeemReward } from '../core/redeem.js?v=113';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString('vi-VN');
  } catch {
    return s;
  }
}

let tab = 'overview';
let userQ = '';
let selectedUserId = null;

export function renderAdmin(root, ctx) {
  if (!isAdmin()) {
    root.innerHTML = `
      <div class="admin-denied">
        <h2>Không có quyền</h2>
        <p class="muted">Chỉ tài khoản admin mới vào được dashboard.</p>
        <button type="button" class="primary" id="admin-back">Về Sảnh</button>
      </div>`;
    root.querySelector('#admin-back')?.addEventListener('click', () => ctx.go('hub'));
    return;
  }

  root.innerHTML = `
    <div class="admin-shell">
      <header class="admin-head">
        <div>
          <p class="section-label">Quản trị</p>
          <h2>Dashboard Admin</h2>
        </div>
        <div class="admin-head-actions">
          <button type="button" class="ghost" id="admin-refresh">Làm mới</button>
          <button type="button" class="primary" id="admin-back-game">Về game</button>
        </div>
      </header>
      <nav class="admin-tabs">
        <button type="button" data-tab="overview" class="${tab === 'overview' ? 'active' : ''}">Tổng quan</button>
        <button type="button" data-tab="players" class="${tab === 'players' ? 'active' : ''}">Người chơi</button>
        <button type="button" data-tab="codes" class="${tab === 'codes' ? 'active' : ''}">Mã thưởng</button>
      </nav>
      <div class="admin-body" id="admin-body">
        <p class="muted">Đang tải…</p>
      </div>
    </div>`;

  root.querySelector('#admin-back-game')?.addEventListener('click', () => ctx.go('hub'));
  root.querySelector('#admin-refresh')?.addEventListener('click', () => paintBody(root, ctx));
  root.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.onclick = () => {
      tab = btn.getAttribute('data-tab');
      selectedUserId = null;
      renderAdmin(root, ctx);
    };
  });

  paintBody(root, ctx);
}

async function paintBody(root, ctx) {
  const body = root.querySelector('#admin-body');
  if (!body) return;
  body.innerHTML = '<p class="muted">Đang tải…</p>';
  try {
    if (tab === 'overview') await paintOverview(body);
    else if (tab === 'players') await paintPlayers(body, ctx);
    else if (tab === 'codes') await paintCodes(body, ctx);
  } catch (e) {
    body.innerHTML = `<p class="admin-error">${esc(e.message || 'Lỗi tải dashboard')}</p>
      <p class="muted">Server có đang chạy không? (npm run dev trong thư mục server)</p>`;
  }
}

async function paintOverview(body) {
  const stats = await fetchAdminStats();
  body.innerHTML = `
    <div class="admin-stats">
      <div class="admin-stat"><span class="lbl">Tài khoản</span><span class="val">${stats.users}</span></div>
      <div class="admin-stat"><span class="lbl">Có save cloud</span><span class="val">${stats.saves}</span></div>
      <div class="admin-stat"><span class="lbl">Mã đang bật</span><span class="val">${stats.codes}</span></div>
      <div class="admin-stat"><span class="lbl">Lượt đổi mã</span><span class="val">${stats.redemptions}</span></div>
      <div class="admin-stat warn"><span class="lbl">Bị khóa</span><span class="val">${stats.banned}</span></div>
    </div>
    <div class="admin-panel">
      <h3>Hướng dẫn nhanh</h3>
      <ul class="admin-help">
        <li>Tài khoản admin mặc định: <code>admin</code> / <code>admin123</code> (đổi bằng biến môi trường <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD</code> trên server).</li>
        <li>Mã thưởng tạo ở tab <strong>Mã thưởng</strong> — người chơi đã đăng nhập đổi qua server (Guest vẫn dùng mã tĩnh trong game).</li>
        <li>Tab <strong>Người chơi</strong>: cấp LH/Vàng/Gem, khóa/mở, reset save, xóa tài khoản.</li>
      </ul>
    </div>`;
}

async function paintPlayers(body, ctx) {
  const users = await fetchAdminUsers(userQ, 100);
  body.innerHTML = `
    <div class="admin-toolbar">
      <input type="search" id="admin-user-q" placeholder="Tìm username / tên…" value="${esc(userQ)}" />
      <button type="button" class="primary" id="admin-user-search">Tìm</button>
    </div>
    <div class="admin-split">
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Ải</th>
              <th>Quái</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${users
              .map(
                (u) => `
              <tr data-uid="${u.id}" class="${selectedUserId === u.id ? 'sel' : ''}">
                <td>
                  <strong>${esc(u.displayName)}</strong>
                  <div class="muted small">@${esc(u.username)}</div>
                </td>
                <td>${u.stagesCleared ?? 0}</td>
                <td>${u.uniqueMonsters ?? 0}</td>
                <td>${u.isBanned ? '<span class="badge bad">Khóa</span>' : u.isAdmin ? '<span class="badge ok">Admin</span>' : '—'}</td>
              </tr>`
              )
              .join('') || '<tr><td colspan="4" class="muted">Không có user</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="admin-detail" id="admin-user-detail">
        <p class="muted">Chọn một người chơi để quản lý.</p>
      </div>
    </div>`;

  body.querySelector('#admin-user-search')?.addEventListener('click', () => {
    userQ = body.querySelector('#admin-user-q')?.value.trim() || '';
    paintPlayers(body, ctx);
  });
  body.querySelector('#admin-user-q')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      userQ = e.target.value.trim();
      paintPlayers(body, ctx);
    }
  });
  body.querySelectorAll('tr[data-uid]').forEach((tr) => {
    tr.onclick = async () => {
      selectedUserId = Number(tr.getAttribute('data-uid'));
      paintPlayers(body, ctx);
      await paintUserDetail(body.querySelector('#admin-user-detail'), selectedUserId, ctx);
    };
  });
  if (selectedUserId) {
    await paintUserDetail(body.querySelector('#admin-user-detail'), selectedUserId, ctx);
  }
}

async function paintUserDetail(el, id, ctx) {
  if (!el) return;
  el.innerHTML = '<p class="muted">Đang tải…</p>';
  const detail = await fetchAdminUser(id);
  const u = detail.user;
  const save = detail.save || {};
  el.innerHTML = `
    <h3>${esc(u.displayName)} <span class="muted">@${esc(u.username)}</span></h3>
    <p class="muted small">Tạo: ${fmtDate(u.createdAt)} · Save: ${fmtDate(detail.saveUpdatedAt)}</p>
    <div class="admin-kv">
      <span>LH</span><b>${save.souls ?? 0}</b>
      <span>Vàng</span><b>${save.gold ?? 0}</b>
      <span>Gem</span><b>${save.gems ?? 0}</b>
      <span>Ải</span><b>${save.dungeonLevel ?? 1}</b>
    </div>
    <form class="admin-form" id="grant-form">
      <p class="section-label">Cấp tài nguyên</p>
      <div class="admin-grant-row">
        <label>LH <input type="number" name="souls" min="0" value="0" /></label>
        <label>Vàng <input type="number" name="gold" min="0" value="0" /></label>
        <label>Gem <input type="number" name="gems" min="0" value="0" /></label>
      </div>
      <button type="submit" class="primary">Cấp thưởng</button>
    </form>
    <div class="admin-actions">
      <button type="button" class="${u.isBanned ? 'primary' : ''}" id="btn-ban">${u.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}</button>
      <button type="button" id="btn-reset-save">Reset save</button>
      <button type="button" class="danger" id="btn-del-user">Xóa user</button>
    </div>
    <p class="muted small" id="user-action-msg"></p>`;

  el.querySelector('#grant-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const grant = {
      souls: Number(fd.get('souls')) || 0,
      gold: Number(fd.get('gold')) || 0,
      gems: Number(fd.get('gems')) || 0,
    };
    if (!grant.souls && !grant.gold && !grant.gems) {
      ctx.toast('Nhập số > 0');
      return;
    }
    await patchAdminUser(id, { grant });
    ctx.toast('Đã cấp tài nguyên');
    await paintUserDetail(el, id, ctx);
  });

  el.querySelector('#btn-ban')?.addEventListener('click', async () => {
    await patchAdminUser(id, { isBanned: !u.isBanned });
    ctx.toast(u.isBanned ? 'Đã mở khóa' : 'Đã khóa');
    await paintPlayers(el.closest('.admin-body'), ctx);
  });

  el.querySelector('#btn-reset-save')?.addEventListener('click', async () => {
    if (!confirm(`Reset save của @${u.username}?`)) return;
    await patchAdminUser(id, { resetSave: true });
    ctx.toast('Đã reset save');
    await paintUserDetail(el, id, ctx);
  });

  el.querySelector('#btn-del-user')?.addEventListener('click', async () => {
    if (!confirm(`Xóa vĩnh viễn @${u.username}?`)) return;
    await deleteAdminUser(id);
    ctx.toast('Đã xóa user');
    selectedUserId = null;
    await paintPlayers(el.closest('.admin-body'), ctx);
  });
}

async function paintCodes(body, ctx) {
  const codes = await fetchRedeemCodesAdmin();
  body.innerHTML = `
    <div class="admin-panel">
      <h3>Tạo mã mới</h3>
      <form class="admin-form" id="code-form">
        <label>Mã <input name="code" required placeholder="VD: EVENT2026" /></label>
        <label>Tên hiển thị <input name="label" placeholder="Quà sự kiện" /></label>
        <div class="admin-grant-row">
          <label>LH <input type="number" name="souls" min="0" value="0" /></label>
          <label>Vàng <input type="number" name="gold" min="0" value="0" /></label>
          <label>Gem <input type="number" name="gems" min="0" value="0" /></label>
        </div>
        <label>Giới hạn lượt (để trống = ∞)
          <input type="number" name="maxUses" min="1" placeholder="∞" />
        </label>
        <label class="admin-check"><input type="checkbox" name="perUserOnce" checked /> Mỗi tài khoản 1 lần</label>
        <button type="submit" class="primary">Tạo mã</button>
      </form>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Thưởng</th>
            <th>Dùng</th>
            <th>TT</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${codes
            .map(
              (c) => `
            <tr>
              <td><strong>${esc(c.code)}</strong><div class="muted small">${esc(c.label)}</div></td>
              <td>${esc(formatRedeemReward(c.reward))}</td>
              <td>${c.usesCount}${c.maxUses != null ? ` / ${c.maxUses}` : ''}</td>
              <td>${c.active ? '<span class="badge ok">Bật</span>' : '<span class="badge bad">Tắt</span>'}</td>
              <td class="admin-row-actions">
                <button type="button" data-toggle="${c.id}">${c.active ? 'Tắt' : 'Bật'}</button>
                <button type="button" class="danger" data-del="${c.id}">Xóa</button>
              </td>
            </tr>`
            )
            .join('') || '<tr><td colspan="5" class="muted">Chưa có mã</td></tr>'}
        </tbody>
      </table>
    </div>`;

  body.querySelector('#code-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const reward = {
      souls: Number(fd.get('souls')) || 0,
      gold: Number(fd.get('gold')) || 0,
      gems: Number(fd.get('gems')) || 0,
    };
    const maxUsesRaw = fd.get('maxUses');
    await createRedeemCodeAdmin({
      code: fd.get('code'),
      label: fd.get('label') || fd.get('code'),
      reward,
      maxUses: maxUsesRaw ? Number(maxUsesRaw) : null,
      perUserOnce: fd.get('perUserOnce') === 'on',
      active: true,
    });
    ctx.toast('Đã tạo mã');
    await paintCodes(body, ctx);
  });

  body.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.getAttribute('data-toggle'));
      const c = codes.find((x) => x.id === id);
      await updateRedeemCodeAdmin(id, { active: !c?.active });
      ctx.toast('Đã cập nhật mã');
      await paintCodes(body, ctx);
    };
  });
  body.querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm('Xóa mã này?')) return;
      await deleteRedeemCodeAdmin(Number(btn.getAttribute('data-del')));
      ctx.toast('Đã xóa mã');
      await paintCodes(body, ctx);
    };
  });
}

