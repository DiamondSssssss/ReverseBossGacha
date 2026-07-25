import { isCloudConfigured } from '../config.js';
import { signIn, signUp, signOut, getUser, isLoggedIn } from '../core/auth.js';
import { pullCloudSave, pushCloudSave, pickBetterSave } from '../core/cloudSave.js';
import { applySaveData, saveState, saveStateNow } from '../core/storage.js';

/**
 * Render account strip + wire modal.
 * @param {object} opts
 * @param {HTMLElement} opts.accountEl
 * @param {HTMLElement} opts.modalEl
 * @param {object} opts.state - mutable game state
 * @param {function} opts.toast
 * @param {function} opts.onSaveLoaded - after cloud merge
 * @param {function} opts.refreshChrome
 */
export function renderAccountBar({ accountEl, modalEl, state, toast, onSaveLoaded, refreshChrome }) {
  const configured = isCloudConfigured();
  const user = getUser();

  if (!configured) {
    accountEl.innerHTML = `
      <button type="button" class="account-btn guest" id="btn-account" title="Cần cấu hình Supabase">
        Guest · máy này
      </button>`;
    accountEl.querySelector('#btn-account').onclick = () => {
      showSetupHelp(modalEl);
    };
    return;
  }

  if (user) {
    const label = user.email?.split('@')[0] || 'Account';
    accountEl.innerHTML = `
      <button type="button" class="account-btn in" id="btn-account" title="${user.email || ''}">
        <span class="account-dot"></span>
        ${escapeHtml(label)}
      </button>`;
    accountEl.querySelector('#btn-account').onclick = () =>
      showAccountMenu(modalEl, { state, toast, onSaveLoaded, refreshChrome, renderBar: () =>
        renderAccountBar({ accountEl, modalEl, state, toast, onSaveLoaded, refreshChrome })
      });
  } else {
    accountEl.innerHTML = `
      <button type="button" class="account-btn" id="btn-account">Đăng nhập</button>`;
    accountEl.querySelector('#btn-account').onclick = () =>
      showAuthModal(modalEl, { state, toast, onSaveLoaded, refreshChrome, renderBar: () =>
        renderAccountBar({ accountEl, modalEl, state, toast, onSaveLoaded, refreshChrome })
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

function showSetupHelp(modalEl) {
  modalEl.classList.add('show');
  modalEl.innerHTML = `
    <div class="modal auth-modal">
      <h2>Lưu cloud chưa bật</h2>
      <p class="muted">Hiện mỗi trình duyệt / máy lưu riêng bằng localStorage (Guest).</p>
      <p class="muted">Để đăng nhập đồng bộ tiến trình:</p>
      <ol class="tut-list">
        <li>Tạo project miễn phí trên <strong>supabase.com</strong></li>
        <li>Chạy SQL trong <code>supabase/schema.sql</code></li>
        <li>Dán URL + anon key vào <code>js/config.js</code></li>
        <li>Bật Email auth (tắt confirm email khi test)</li>
      </ol>
      <button type="button" class="primary" id="auth-close" style="width:100%;margin-top:12px">Đã hiểu</button>
    </div>`;
  modalEl.querySelector('#auth-close').onclick = () => {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
  };
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
            ? 'Đăng nhập để đồng bộ Linh Hồn, kho quái, ải… giữa các máy.'
            : 'Email + mật khẩu (≥ 6 ký tự). Tiến trình sẽ lưu trên cloud.'
        }</p>
        <form id="auth-form" class="auth-form">
          <label>Email
            <input type="email" id="auth-email" required autocomplete="email" placeholder="ban@email.com" />
          </label>
          <label>Mật khẩu
            <input type="password" id="auth-pass" required minlength="6" autocomplete="${
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
      const email = modalEl.querySelector('#auth-email').value.trim();
      const password = modalEl.querySelector('#auth-pass').value;
      const errEl = modalEl.querySelector('#auth-error');
      const btn = modalEl.querySelector('#auth-submit');
      errEl.hidden = true;
      btn.disabled = true;
      btn.textContent = 'Đang xử lý…';

      const res = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
      btn.disabled = false;
      btn.textContent = mode === 'login' ? 'Đăng nhập' : 'Đăng ký';

      if (res.error) {
        errEl.hidden = false;
        errEl.textContent = res.error;
        return;
      }
      if (res.needsConfirm) {
        errEl.hidden = false;
        errEl.textContent =
          'Đã tạo tài khoản. Nếu Supabase bật Confirm email, hãy vào hộp thư xác nhận rồi đăng nhập.';
        mode = 'login';
        paint();
        return;
      }

      modalEl.classList.remove('show');
      modalEl.innerHTML = '';
      ctx.toast(mode === 'login' || res.user ? 'Đăng nhập thành công — đang đồng bộ…' : 'OK');
      await syncAfterLogin(ctx);
      ctx.renderBar();
      ctx.refreshChrome();
    };
  }

  paint();
}

function showAccountMenu(modalEl, ctx) {
  const user = getUser();
  modalEl.classList.add('show');
  modalEl.innerHTML = `
    <div class="modal auth-modal">
      <h2>Tài khoản</h2>
      <p class="muted">${escapeHtml(user?.email || '')}</p>
      <p class="muted">Tiến trình đang đồng bộ lên cloud khi bạn chơi.</p>
      <div class="auth-form">
        <button type="button" class="primary" id="btn-sync-now">Đồng bộ ngay</button>
        <button type="button" id="btn-pull">Tải save từ cloud</button>
        <button type="button" id="btn-logout">Đăng xuất</button>
        <button type="button" class="ghost" id="auth-close">Đóng</button>
      </div>
    </div>`;

  modalEl.querySelector('#auth-close').onclick = () => {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
  };
  modalEl.querySelector('#btn-sync-now').onclick = async () => {
    const r = await saveStateNow(ctx.state);
    ctx.toast(r.ok ? 'Đã đẩy save lên cloud' : r.error || 'Lỗi đồng bộ');
  };
  modalEl.querySelector('#btn-pull').onclick = async () => {
    await syncAfterLogin(ctx, { preferCloud: true });
    ctx.toast('Đã tải save cloud');
    ctx.refreshChrome();
    ctx.onSaveLoaded?.();
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
  };
  modalEl.querySelector('#btn-logout').onclick = async () => {
    await signOut();
    ctx.toast('Đã đăng xuất — vẫn còn save Guest trên máy này');
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
    ctx.renderBar();
  };
}

async function syncAfterLogin(ctx, { preferCloud = false } = {}) {
  const local = { ...ctx.state };
  const pulled = await pullCloudSave();

  if (!pulled.ok) {
    ctx.toast(pulled.error || 'Không tải được cloud save');
    await pushCloudSave(ctx.state);
    return;
  }

  if (pulled.empty) {
    await pushCloudSave(ctx.state);
    ctx.toast('Tạo save cloud từ máy này');
    return;
  }

  const chosen = preferCloud
    ? pulled.data
    : pickBetterSave(local, pulled.data);

  applySaveData(ctx.state, chosen);
  saveState(ctx.state, { syncCloud: false });
  await pushCloudSave(ctx.state);
  ctx.onSaveLoaded?.();
  ctx.toast(
    chosen === pulled.data || preferCloud
      ? 'Đã đồng bộ từ cloud'
      : 'Đã đẩy tiến trình máy này lên cloud'
  );
}

export { syncAfterLogin };
