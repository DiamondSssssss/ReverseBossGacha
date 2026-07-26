/** Mã quà — code không phân biệt hoa thường khi nhập. */

export const REDEEM_CODES = {
  SEPTONGMOI: {
    id: 'SEPTONGMOI',
    label: 'Quà tân thủ',
    /** Chỉ người chơi mới (chưa thắng ải, còn ở ải 1) */
    newPlayerOnly: true,
    reward: { souls: 1000 },
  },
};

export function normalizeRedeemCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}
