import { REDEEM_CODES, normalizeRedeemCode } from '../data/redeemCodes.js?v=100';
import { saveState, applySaveData } from './storage.js?v=100';
import { isLoggedIn } from './auth.js?v=100';
import { redeemCodeServer } from './adminApi.js?v=100';

/**
 * @returns {Promise<{ ok: boolean, reason?: string, reward?: object, label?: string }>}
 */
export async function tryRedeemCode(state, rawCode) {
  const code = normalizeRedeemCode(rawCode);
  if (!code) return { ok: false, reason: 'Nhập mã quà' };

  if (isLoggedIn()) {
    try {
      const res = await redeemCodeServer(code);
      if (res.ok && res.save) {
        applySaveData(state, res.save);
        saveState(state, { syncCloud: false });
      } else if (res.ok) {
        saveState(state);
      }
      return res;
    } catch (e) {
      return { ok: false, reason: e.message || 'Lỗi đổi mã' };
    }
  }

  const def = REDEEM_CODES[code];
  if (!def) return { ok: false, reason: 'Mã không hợp lệ (Guest: chỉ mã tĩnh; đăng nhập để dùng mã server)' };

  if (!state.redeemedCodes) state.redeemedCodes = [];
  if (state.redeemedCodes.includes(def.id)) {
    return { ok: false, reason: 'Bạn đã nhập mã này rồi' };
  }

  const reward = def.reward || {};
  if (reward.souls) state.souls = (Number(state.souls) || 0) + reward.souls;
  if (reward.gold) state.gold = (Number(state.gold) || 0) + reward.gold;
  if (reward.gems) state.gems = (Number(state.gems) || 0) + reward.gems;

  state.redeemedCodes.push(def.id);
  saveState(state);

  return { ok: true, reward, label: def.label || def.id };
}

export function formatRedeemReward(reward = {}) {
  const parts = [];
  if (reward.souls) parts.push(`+${reward.souls} LH`);
  if (reward.gold) parts.push(`+${reward.gold} Vàng`);
  if (reward.gems) parts.push(`+${reward.gems} Gem`);
  return parts.join(' · ') || '—';
}
