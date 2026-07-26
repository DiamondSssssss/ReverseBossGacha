/** Mã quà — code không phân biệt hoa thường khi nhập. */

export const REDEEM_CODES = {
  SEPTONGMOI: {
    id: 'SEPTONGMOI',
    label: 'Quà SEPTONGMOI',
    reward: { souls: 1000 },
  },
};

export function normalizeRedeemCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}
