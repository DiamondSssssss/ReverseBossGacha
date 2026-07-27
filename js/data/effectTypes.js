/**
 * Catalog hiệu ứng combat — category + mô tả dùng chung tip/UI.
 */

export const EFFECT_CATEGORY = {
  CROWD_CONTROL: 'CROWD_CONTROL',
  BUFF: 'BUFF',
  DEBUFF: 'DEBUFF',
  DOT: 'DOT',
  UTILITY: 'UTILITY',
  POSITIONING: 'POSITIONING',
};

export const EFFECT_CATEGORY_LABELS = {
  CROWD_CONTROL: 'Khống chế',
  BUFF: 'Buff',
  DEBUFF: 'Debuff',
  DOT: 'DoT',
  UTILITY: 'Tiện ích',
  POSITIONING: 'Vị trí',
};

/** @typedef {{ id: string, category: string, name: string, desc: string }} EffectDef */

/** @type {Record<string, EffectDef>} */
export const EFFECTS = {
  // —— Core status ——
  STUN: {
    id: 'STUN',
    category: EFFECT_CATEGORY.CROWD_CONTROL,
    name: 'Choáng',
    desc: 'Không hành động (không di chuyển / không đánh).',
  },
  FREEZE: {
    id: 'FREEZE',
    category: EFFECT_CATEGORY.CROWD_CONTROL,
    name: 'Đóng băng',
    desc: 'Đứng yên, không hành động.',
  },
  SLOW: {
    id: 'SLOW',
    category: EFFECT_CATEGORY.DEBUFF,
    name: 'Làm chậm',
    desc: 'Giảm tốc độ di chuyển.',
  },
  SILENCE: {
    id: 'SILENCE',
    category: EFFECT_CATEGORY.CROWD_CONTROL,
    name: 'Câm chú',
    desc: 'Tắt chiêu mạnh; Mage ATK còn ~35%.',
  },
  BURN: {
    id: 'BURN',
    category: EFFECT_CATEGORY.DOT,
    name: 'Đốt',
    desc: 'Mất máu mỗi giây.',
  },
  POISON: {
    id: 'POISON',
    category: EFFECT_CATEGORY.DOT,
    name: 'Độc',
    desc: 'Mất máu mỗi giây.',
  },
  DEF_SHRED: {
    id: 'DEF_SHRED',
    category: EFFECT_CATEGORY.DEBUFF,
    name: 'Phá giáp',
    desc: 'Nhận thêm sát thương.',
  },
  HEAL_CUT: {
    id: 'HEAL_CUT',
    category: EFFECT_CATEGORY.DEBUFF,
    name: 'Cắt hồi',
    desc: 'Giảm hiệu quả hồi máu nhận được.',
  },
  SHIELD: {
    id: 'SHIELD',
    category: EFFECT_CATEGORY.BUFF,
    name: 'Khiên',
    desc: 'Hấp thụ sát thương trong thời gian ngắn.',
  },
  STEALTH: {
    id: 'STEALTH',
    category: EFFECT_CATEGORY.UTILITY,
    name: 'Tàng hình',
    desc: 'Khó bị nhắm từ xa cho đến khi lộ.',
  },
  KNOCKBACK: {
    id: 'KNOCKBACK',
    category: EFFECT_CATEGORY.POSITIONING,
    name: 'Đẩy lùi',
    desc: 'Đẩy đơn vị về phía cổng / ra khỏi kho.',
  },
  // —— New (plan) ——
  ROOT: {
    id: 'ROOT',
    category: EFFECT_CATEGORY.CROWD_CONTROL,
    name: 'Kẹp chân',
    desc: 'Không di chuyển nhưng vẫn đánh được (khác Choáng).',
  },
  CHARM: {
    id: 'CHARM',
    category: EFFECT_CATEGORY.CROWD_CONTROL,
    name: 'Mê hoặc',
    desc: 'Hero bỏ kho / đánh nhầm đồng minh trong thời gian ngắn.',
  },
  CD_REDUCTION: {
    id: 'CD_REDUCTION',
    category: EFFECT_CATEGORY.BUFF,
    name: 'Giảm hồi chiêu',
    desc: 'Rút ngắn thời gian hồi kỹ năng / khiên / khiêu khích.',
  },
  CLEANSE_ALLY: {
    id: 'CLEANSE_ALLY',
    category: EFFECT_CATEGORY.UTILITY,
    name: 'Thanh tẩy đồng minh',
    desc: 'Xóa đốt/độc/chậm/kẹp chân/phá giáp/frail trên đồng minh gần.',
  },
  INVULNERABLE: {
    id: 'INVULNERABLE',
    category: EFFECT_CATEGORY.BUFF,
    name: 'Bất tử tạm',
    desc: 'Không nhận sát thương trong thời gian ngắn.',
  },
  THORNS_PASSIVE: {
    id: 'THORNS_PASSIVE',
    category: EFFECT_CATEGORY.BUFF,
    name: 'Gai phản',
    desc: 'Phản một phần sát thương về kẻ đánh (theo unit).',
  },
  FRAIL: {
    id: 'FRAIL',
    category: EFFECT_CATEGORY.DEBUFF,
    name: 'Dễ vỡ',
    desc: 'Nhận thêm sát thương (nhân frailMul).',
  },
};

export function effectCategoryLabel(cat) {
  return EFFECT_CATEGORY_LABELS[cat] || cat || '';
}

export function getEffect(id) {
  return EFFECTS[id] || null;
}
