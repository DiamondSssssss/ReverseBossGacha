import { REDEEM_CODES, normalizeRedeemCode } from '../data/redeemCodes.js?v=64';
import { saveState } from './storage.js?v=64';

/**
 * @returns {{ ok: boolean, reason?: string, reward?: object, label?: string }}
 */
export function tryRedeemCode(state, rawCode) {
  const code = normalizeRedeemCode(rawCode);
  if (!code) return { ok: false, reason: 'Nhập mã quà' };

  const def = REDEEM_CODES[code];
  if (!def) return { ok: false, reason: 'Mã không hợp lệ' };

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
