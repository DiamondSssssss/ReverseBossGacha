/**
 * Mô tả chiêu / bị động — tiếng Việt, ngắn, dễ hiểu cho người chơi.
 * Dùng cho tip quái & chip kỹ năng.
 */

export const PASSIVE_INFO = {
  NONE: { name: 'Không', desc: 'Không có bị động đặc biệt — chỉ dựa vào máu và sát thương.' },
  TAUNT: { name: 'Khiêu khích', desc: 'Hero gần đó ưu tiên đánh con này trước thay vì đồng minh khác.' },
  AURA_TAUNT: {
    name: 'Aura khiêu khích',
    desc: 'Hero đang đánh nhau trong vùng sẽ bị kéo sang đánh con này.',
  },
  AURA_STUN: {
    name: 'Aura choáng',
    desc: 'Định kỳ làm choáng ngắn mọi Hero trong vùng quanh nó.',
  },
  SLOW_AURA: {
    name: 'Aura làm chậm',
    desc: 'Hero đứng gần bị giảm tốc độ di chuyển liên tục.',
  },
  HEAL_AURA: {
    name: 'Aura hồi máu',
    desc: 'Liên tục hồi một ít máu cho quái đồng minh đứng gần.',
  },
  HEAL_PULSE: {
    name: 'Xung hồi máu',
    desc: 'Mỗi vài giây bung một đợt hồi máu mạnh cho đồng minh quanh nó.',
  },
  ANTI_HEAL_AURA: {
    name: 'Aura cắt hồi',
    desc: 'Hero đứng gần nhận hồi máu kém đi rõ rệt (healer địch kém hiệu quả).',
  },
  HEAL_CUT_ON_HIT: {
    name: 'Vết cắt hồi',
    desc: 'Đánh trúng → Hero bị giảm hồi máu trong vài giây.',
  },
  HEAL_CUT_BOLT: {
    name: 'Tia cắt hồi',
    desc: 'Bắn tầm trung — gây sát thương nhẹ và cắt hồi máu trong vùng nhỏ.',
  },
  BONE_PILE: {
    name: 'Đống xương',
    desc: 'Chết để lại vùng xương làm chậm mạnh Hero đi qua trong vài giây.',
  },
  SLIME_EXPLODE_SILENCE: {
    name: 'Nổ câm',
    desc: 'Chết nổ nhầy — Pháp sư gần đó bị câm chú trong lúc ngắn.',
  },
  SELF_DESTRUCT: {
    name: 'Tự nổ',
    desc: 'Khi chết (hoặc máu quá thấp) nổ gây sát thương quanh chỗ đứng.',
  },
  REVIVE: {
    name: 'Sống lại',
    desc: 'Chết lần đầu sẽ sống lại với một phần máu. Vẫn chiếm ô cost cho đến khi chết hẳn.',
  },
  STUN_ON_HIT: { name: 'Choáng khi đánh', desc: 'Mỗi đòn đánh có thể làm choáng ngắn mục tiêu.' },
  POISON_ON_HIT: { name: 'Độc khi đánh', desc: 'Đánh trúng gây độc — trừ máu dần theo thời gian.' },
  BURN_ON_HIT: { name: 'Đốt khi đánh', desc: 'Đánh trúng gây cháy — trừ máu dần theo thời gian.' },
  SILENCE_ON_HIT: { name: 'Câm chú', desc: 'Đánh trúng Pháp sư → chúng bị câm, không niệm chiêu mạnh.' },
  KNOCK_BACK_ROOM: { name: 'Đẩy lùi', desc: 'Đánh trúng đẩy Hero lùi về phía cổng.' },
  REVEAL: { name: 'Soi hình', desc: 'Làm lộ Hero đang tàng hình trong tầm nhìn.' },
  BURST_FIRST_HIT: {
    name: 'Đòn mở đầu',
    desc: 'Đòn đánh đầu tiên gây gấp đôi sát thương.',
  },
  WATER_BUFF: { name: 'Buff nước', desc: 'Đứng trên ô nước: mạnh hơn rõ (máu/công).' },
  DARK_BUFF: { name: 'Buff tối', desc: 'Đứng trên ô tối: sát thương tăng mạnh.' },
  FIRE_BUFF: { name: 'Buff lửa', desc: 'Đứng trên ô lửa: máu và công tăng.' },
  ICE_BUFF: { name: 'Buff băng', desc: 'Đứng trên ô băng: máu và công tăng.' },
  POISON_BUFF: { name: 'Buff độc', desc: 'Đứng trên ô độc: máu và công tăng.' },
  ANTI_WARRIOR_BURST: {
    name: 'Nghiền chiến sĩ',
    desc: 'Gây sát thương cực mạnh khi đánh Chiến sĩ / Warrior.',
  },
  BUFF_IN_LOW_CEILING_ROOM: {
    name: 'Sợ trần cao',
    desc: 'Ô trần thấp/tối: công tăng rất mạnh. Ô trần cao: công giảm.',
  },
  FROST_BOLT: { name: 'Băng tiễn', desc: 'Bắn tầm xa — đóng băng ngắn mục tiêu.' },
  RANGED_FROST: { name: 'Tầm xa băng', desc: 'Bắn tầm xa gây đóng băng / làm chậm bằng lạnh.' },
  RANGED_POISON: { name: 'Tầm xa độc', desc: 'Bắn tầm xa gây độc theo thời gian.' },
  RANGED_BURN: { name: 'Tầm xa lửa', desc: 'Bắn tầm xa gây cháy theo thời gian.' },
  RANGED_VOLLEY: { name: 'Volley', desc: 'Bắn loạt — sát thương chính + splash nhẹ quanh mục tiêu.' },
  TRAP_SPIKE: { name: 'Bẫy gai', desc: 'Bẫy cố định — Hero bước lên nhận sát thương lớn.' },
  TRAP_SLOW: { name: 'Bẫy dầu', desc: 'Bẫy làm chậm mạnh + sát thương nhẹ khi giẫm.' },
  TRAP_BURN: { name: 'Bẫy lửa', desc: 'Bẫy đốt cháy Hero khi giẫm phải.' },
  TRAP_POISON: { name: 'Bẫy độc', desc: 'Bẫy gây độc khi Hero giẫm phải.' },
  TRAP_FREEZE: { name: 'Bẫy đóng băng', desc: 'Bẫy đóng băng Hero trong lúc ngắn.' },
  TRAP_STUN: { name: 'Bẫy choáng', desc: 'Bẫy làm choáng Hero khi giẫm.' },
  SHIELD: {
    name: 'Khiên',
    desc: 'Khi máu thấp, tạo lớp khiên hấp thụ sát thương trong vài giây.',
  },
  SHIELD_BREAK: {
    name: 'Phá khiên',
    desc: 'Đánh trúng phá ngay lớp khiên đang bảo vệ mục tiêu.',
  },
  STEALTH: {
    name: 'Tàng hình',
    desc: 'Ẩn mình — địch khó nhắm từ xa. Đánh hoặc bị phát hiện sẽ lộ hình.',
  },
  BACKSTAB: {
    name: 'Lén đâm',
    desc: 'Đòn từ tàng hình / phía sau gây thêm sát thương.',
  },
  MYTHIC_SELF_DRAIN: {
    name: 'Tự hút (Mythic)',
    desc: 'Công rất cao nhưng tự mất máu theo thời gian.',
  },
  MYTHIC_TREASURE_TAX: {
    name: 'Thuế kho (Mythic)',
    desc: 'Tank/hồi mạnh nhưng “thuế” tài nguyên — có nhược điểm Mythic.',
  },
  MYTHIC_ALLY_SLOW: {
    name: 'Trói đồng minh (Mythic)',
    desc: 'Khắc Pháp sư mạnh nhưng làm chậm cả đồng minh gần đó.',
  },
  MYTHIC_DEATH_CURSE: {
    name: 'Nguyền chết (Mythic)',
    desc: 'Chết gây sát thương % máu tối đa lên đồng minh quanh nó.',
  },
  MYTHIC_GLASS: {
    name: 'Thủy tinh (Mythic)',
    desc: 'Sát thương cực cao nhưng rất mỏng máu.',
  },
  MYTHIC_INFERNO: {
    name: 'Địa ngục (Mythic)',
    desc: 'Pháo lửa mạnh — tự cháy nếu không đứng đúng địa hình lửa.',
  },
  MYTHIC_TOXIN: {
    name: 'Độc vương (Mythic)',
    desc: 'Độc tầm xa cực mạnh — drawback làm hại nhẹ đồng minh gần.',
  },
  MYTHIC_STASIS: {
    name: 'Đóng băng thời gian (Mythic)',
    desc: 'Choáng dài khi đánh, nhưng bản thân cũng bị khóa nhịp ngắn.',
  },
};

export const SKILL_INFO = {
  SHIELD: PASSIVE_INFO.SHIELD,
  SHIELD_BREAK: PASSIVE_INFO.SHIELD_BREAK,
  TAUNT_SELF: {
    name: 'Khiêu khích chủ động',
    desc: 'Ép địch quanh nó phải đánh mình trong vài giây (hồi chiêu).',
  },
  STEALTH: PASSIVE_INFO.STEALTH,
  BACKSTAB: PASSIVE_INFO.BACKSTAB,
  STUN_ON_HIT: PASSIVE_INFO.STUN_ON_HIT,
  HEAL_ALLY: { name: 'Hồi đồng đội', desc: 'Hồi máu cho đồng minh bị thương trong tầm.' },
  HEAL_CUT: { name: 'Aura cắt hồi', desc: 'Giảm hồi máu địch đứng gần.' },
  HEAL_CUT_HIT: { name: 'Vết cắt hồi', desc: 'Đánh trúng giảm hồi máu địch vài giây.' },
  DEF_SHRED: { name: 'Phá giáp', desc: 'Đánh trúng làm địch nhận nhiều sát thương hơn.' },
  SELF_DESTRUCT: PASSIVE_INFO.SELF_DESTRUCT,
  REVIVE: PASSIVE_INFO.REVIVE,
  BURN_ON_HIT: PASSIVE_INFO.BURN_ON_HIT,
  POISON_ON_HIT: PASSIVE_INFO.POISON_ON_HIT,
  FREEZE: { name: 'Đóng băng', desc: 'Đóng băng mục tiêu trong lúc ngắn.' },
  FROST_BOLT: PASSIVE_INFO.FROST_BOLT,
  AOE_FIRE: { name: 'Hỏa vực', desc: 'Gây sát thương lan vùng lửa.' },
  AOE_FROST: { name: 'Băng vực', desc: 'Gây sát thương lan vùng lạnh.' },
  PIERCE: { name: 'Xuyên giáp', desc: 'Bỏ qua một phần phòng thủ địch.' },
  LIFESTEAL: { name: 'Hút máu', desc: 'Một phần sát thương hóa thành máu bản thân.' },
  BERSERK: { name: 'Cuồng nộ', desc: 'Máu thấp thì sát thương càng cao.' },
  SLOW_AURA_ALLY: { name: 'Sương chậm', desc: 'Sau khi hồi máu, làm chậm quái gần đó.' },
};

/** Ghép mô tả bị động + kỹ năng phụ cho tip */
export function describeMonsterKit(m) {
  const bits = [];
  const p = PASSIVE_INFO[m.passive];
  if (p && m.passive !== 'NONE') {
    bits.push({ name: p.name, desc: p.desc });
  }
  const skills = m.skills || [];
  for (const s of skills) {
    if (s === m.passive) continue;
    const info = SKILL_INFO[s] || PASSIVE_INFO[s];
    if (info && !bits.some((b) => b.name === info.name)) {
      bits.push({ name: info.name, desc: info.desc });
    }
  }
  if (m.stealth && !skills.includes('STEALTH')) {
    bits.push({ name: PASSIVE_INFO.STEALTH.name, desc: PASSIVE_INFO.STEALTH.desc });
  }
  return bits;
}
