import { tryRedeemCode, formatRedeemReward } from '../core/redeem.js?v=88';
import { saveState } from '../core/storage.js?v=88';

export function showRedeemModal(modalEl, { state, toast, refreshChrome }) {
  if (!modalEl) return;

  modalEl.classList.add('show');
  modalEl.innerHTML = `
    <div class="modal auth-modal redeem-modal">
      <h2>Nhập mã quà</h2>
      <p class="muted">Ai cũng nhập được. Mỗi mã chỉ dùng <strong>một lần</strong> trên save này.</p>
      <form id="redeem-form" class="auth-form">
        <label>Mã quà
          <input type="text" id="redeem-code" maxlength="32" autocomplete="off"
            placeholder="VD: BOSSGACHA" spellcheck="false" />
        </label>
        <p class="auth-error muted" id="redeem-error" hidden></p>
        <button type="submit" class="primary" id="redeem-submit" style="width:100%">Nhận thưởng</button>
      </form>
      <button type="button" class="ghost" id="redeem-close" style="margin-top:10px;width:100%">Đóng</button>
    </div>`;

  const close = () => {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
  };

  modalEl.querySelector('#redeem-close').onclick = close;
  modalEl.onclick = (e) => {
    if (e.target === modalEl) close();
  };

  const input = modalEl.querySelector('#redeem-code');
  input.focus();

  modalEl.querySelector('#redeem-form').onsubmit = async (e) => {
    e.preventDefault();
    const errEl = modalEl.querySelector('#redeem-error');
    const btn = modalEl.querySelector('#redeem-submit');
    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Đang xử lý…';
    const res = await tryRedeemCode(state, input.value);
    btn.disabled = false;
    btn.textContent = 'Nhận thưởng';
    if (!res.ok) {
      errEl.hidden = false;
      errEl.textContent = res.reason || 'Không nhận được';
      return;
    }
    saveState(state);
    refreshChrome?.();
    toast?.(`${res.label || 'Mã quà'}: ${formatRedeemReward(res.reward)}`);
    close();
  };
}
