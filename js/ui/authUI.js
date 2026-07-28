import { signIn, signUp, signOut, getUser } from '../core/auth.js?v=101';
import { pullCloudSave, pushCloudSave, pickBetterSave } from '../core/cloudSave.js?v=101';
import { applySaveData, saveState, saveStateNow } from '../core/storage.js?v=101';
import { showRedeemModal } from './redeemUI.js?v=101';

export function renderAccountBar({ accountEl, modalEl, state, toast, onSaveLoaded, refreshChrome, go }) {
  const user = getUser();

  if (user) {
    const label = user.displayName || user.username || 'Account';
    const adminBadge = user.isAdmin ? ' <span class="account-admin-tag">Admin</span>' : '';
    accountEl.innerHTML = `
      <button type="button" class="account-btn in" id="btn-account" title="@${escapeHtml(user.username || '')}">
        <span class="account-dot"></span>
        ${escapeHtml(label)}${adminBadge}
      </button>`;
    accountEl.querySelector('#btn-account').onclick = () =>
      showAccountMenu(modalEl, {
        state,
        toast,
        onSaveLoaded,
        refreshChrome,
        go,
        renderBar: () =>
          renderAccountBar({ accountEl, modalEl, state, toast, onSaveLoaded, refreshChrome, go }),
      });
  } else {
    accountEl.innerHTML = `
      <button type="button" class="account-btn" id="btn-account">Đăng nhập</button>`;
    accountEl.querySelector('#btn-account').onclick = () =>
      showAuthModal(modalEl, {
        state,
        toast,
        onSaveLoaded,
        refreshChrome,
        go,
        renderBar: () =>
          renderAccountBar({ accountEl, modalEl, state, toast, onSaveLoaded, refreshChrome, go }),
      });
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showAuthModal(modalEl, ctx) {
  let mode = 'login';

  function paint() {
    modalEl.classList.add('show');
    modalEl.innerHTML = `
      <div class="modal auth-modal">
        <h2>${mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
        <p class="muted">${
          mode === 'login'
            ? 'Nhập username + mật khẩu để đồng bộ tiến trình giữa các máy.'
            : 'Username, mật khẩu và tên hiển thị (≥ 3 ký tự). Không cần email.'
        }</p>
        <form id="auth-form" class="auth-form">
          <label>Username
            <input type="text" id="auth-user" required minlength="3" maxlength="24"
              autocomplete="username" placeholder="vd: septong01" pattern="[A-Za-z0-9_]+" />
          </label>
          ${
            mode === 'signup'
              ? `<label>Tên hiển thị
            <input type="text" id="auth-display" maxlength="32"
              autocomplete="nickname" placeholder="Sếp Tổng" />
          </label>`
              : ''
          }
          <label>Mật khẩu
            <input type="password" id="auth-pass" required minlength="3" autocomplete="${
              mode === 'login' ? 'current-password' : 'new-password'
            }" placeholder="••••••••" />
          </label>
          <p class="auth-error muted" id="auth-error" hidden></p>
          <button type="submit" class="primary" id="auth-submit" style="width:100%">
            ${mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>
        <div class="row spread" style="margin-top:12px">
          <button type="button" class="ghost" id="auth-switch">
            ${mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
          <button type="button" class="ghost" id="auth-close">Đóng</button>
        </div>
      </div>`;

    modalEl.querySelector('#auth-close').onclick = () => {
      modalEl.classList.remove('show');
      modalEl.innerHTML = '';
    };
    modalEl.querySelector('#auth-switch').onclick = () => {
      mode = mode === 'login' ? 'signup' : 'login';
      paint();
    };
    modalEl.querySelector('#auth-form').onsubmit = async (e) => {
      e.preventDefault();
      const username = modalEl.querySelector('#auth-user').value.trim();
      const password = modalEl.querySelector('#auth-pass').value;
      const displayName = modalEl.querySelector('#auth-display')?.value.trim() || username;
      const errEl = modalEl.querySelector('#auth-error');
      const btn = modalEl.querySelector('#auth-submit');
      errEl.hidden = true;
      btn.disabled = true;
      btn.textContent = 'Đang xử lý…';

      const res =
        mode === 'login'
          ? await signIn(username, password)
          : await signUp(username, password, displayName);

      btn.disabled = false;
      btn.textContent = mode === 'login' ? 'Đăng nhập' : 'Đăng ký';

      if (res.error) {
        errEl.hidden = false;
        errEl.textContent = res.error;
        return;
      }

      modalEl.classList.remove('show');
      modalEl.innerHTML = '';
      ctx.toast('Đăng nhập thành công — đang đồng bộ…');
      await syncAfterLogin(ctx);
      ctx.renderBar();
      ctx.refreshChrome();
      if (res.user?.isAdmin && ctx.go) {
        ctx.go('admin');
      }
    };
  }

  paint();
}

function showAccountMenu(modalEl, ctx) {
  const user = getUser();
  modalEl.classList.add('show');
  modalEl.innerHTML = `
    <div class="modal auth-modal">
      <h2>${escapeHtml(user?.displayName || user?.username || 'Tài khoản')}</h2>
      <p class="muted">@${escapeHtml(user?.username || '')}</p>
      <p class="muted">Tiến trình đồng bộ lên server khi bạn chơi.</p>
      <div class="auth-form">
        ${user?.isAdmin ? '<button type="button" class="primary" id="btn-admin-dash">Dashboard Admin</button>' : ''}
        <button type="button" class="primary" id="btn-sync-now">Đồng bộ ngay</button>
        <button type="button" id="btn-pull">Tải save từ server</button>
        <button type="button" id="btn-redeem-code">Nhập mã quà</button>
        <button type="button" id="btn-logout">Đăng xuất</button>
        <button type="button" class="ghost" id="auth-close">Đóng</button>
      </div>
    </div>`;

  modalEl.querySelector('#auth-close').onclick = () => {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
  };
  modalEl.querySelector('#btn-admin-dash')?.addEventListener('click', () => {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
    ctx.go?.('admin');
  });
  modalEl.querySelector('#btn-redeem-code').onclick = () => {
    showRedeemModal(modalEl, {
      state: ctx.state,
      toast: ctx.toast,
      refreshChrome: ctx.refreshChrome,
    });
  };
  modalEl.querySelector('#btn-sync-now').onclick = async () => {
    const r = await saveStateNow(ctx.state);
    ctx.toast(r.ok ? 'Đã đẩy save lên server' : r.error || 'Lỗi đồng bộ');
  };
  modalEl.querySelector('#btn-pull').onclick = async () => {
    await syncAfterLogin(ctx, { preferCloud: true });
    ctx.toast('Đã tải save server');
    ctx.refreshChrome();
    ctx.onSaveLoaded?.();
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
  };
  modalEl.querySelector('#btn-logout').onclick = async () => {
    await signOut();
    ctx.toast('Đã đăng xuất — save Guest vẫn trên máy này');
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
    ctx.renderBar();
  };
}

async function syncAfterLogin(ctx, { preferCloud = false } = {}) {
  const local = { ...ctx.state };
  const pulled = await pullCloudSave();

  if (!pulled.ok) {
    ctx.toast(pulled.error || 'Không tải được save server');
    await pushCloudSave(ctx.state);
    return;
  }

  if (pulled.empty) {
    await pushCloudSave(ctx.state);
    ctx.toast('Tạo save server từ máy này');
    return;
  }

  const chosen = preferCloud ? pulled.data : pickBetterSave(local, pulled.data);
  applySaveData(ctx.state, chosen);
  saveState(ctx.state, { syncCloud: false });
  await pushCloudSave(ctx.state);
  ctx.onSaveLoaded?.();
  ctx.toast(
    chosen === pulled.data || preferCloud
      ? 'Đã đồng bộ từ server'
      : 'Đã đẩy tiến trình máy này lên server'
  );
}

export { syncAfterLogin };

