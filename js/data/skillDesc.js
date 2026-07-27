/**
 * Mô tả chiêu / bị động — tiếng Việt + số liệu khớp combatEngine / skills.js.
 * Dùng cho tip quái & chip kỹ năng.
 */

export const PASSIVE_INFO = {
  NONE: {
    name: 'Không',
    desc: 'Không bị động — chỉ dựa vào máu và ATK cơ bản.',
  },
  TAUNT: {
    name: 'Khiêu khích',
    desc: 'Hero ưu tiên nhắm đánh con này trước (điểm target tăng mạnh).',
  },
  AURA_TAUNT: {
    name: 'Aura khiêu khích',
    desc: 'Hero đang đánh trong bán kính aura (~2.2 ô, hoặc auraRadius) bị kéo sang đánh con này.',
  },
  AURA_STUN: {
    name: 'Aura choáng',
    desc: 'Mỗi 4.5 giây: choáng 0.55 giây mọi Hero trong bán kính aura (~2.2 ô / auraRadius).',
  },
  SLOW_AURA: {
    name: 'Aura làm chậm',
    desc: 'Hero đứng gần: tốc độ còn 62% (làm mới mỗi ~0.45 giây) trong bán kính aura.',
  },
  HEAL_AURA: {
    name: 'Aura hồi máu',
    desc: 'Hồi liên tục đồng minh gần: ~2.8%/2★4%/3★5.5%/4★7%/5★9% maxHp mỗi giây (bán kính aura).',
  },
  HEAL_PULSE: {
    name: 'Xung hồi máu',
    desc: 'Mỗi 2.4 giây: hồi một đợt ≈ 6–20% maxHp đồng minh (theo rarity), bán kính aura ×1.15.',
  },
  ANTI_HEAL_AURA: {
    name: 'Aura cắt hồi',
    desc: 'Hero trong aura chỉ còn nhận hồi: 1★55% / 3★42% / 4★32% / 5★22% (bán kính ~auraRadius).',
  },
  HEAL_CUT_ON_HIT: {
    name: 'Vết cắt hồi',
    desc: 'Đánh trúng: Hero chỉ còn nhận 40% hồi trong 4 giây (5★: còn 20% trong 5.5 giây).',
  },
  HEAL_CUT_BOLT: {
    name: 'Tia cắt hồi',
    desc: 'Bắn trúng cắt hồi như Vết cắt hồi + splash 35% sát thương trong 1.5 ô quanh mục tiêu.',
  },
  BONE_PILE: {
    name: 'Đống xương',
    desc: 'Chết: để lại vùng chậm 8 giây — Hero trong 1.6 ô còn 20% tốc độ.',
  },
  SLIME_EXPLODE_SILENCE: {
    name: 'Nổ câm',
    desc: 'Chết: Pháp sư trong 2.2 ô bị câm chú (mất chiêu mạnh, ATK còn ~35%) đến hết trận.',
  },
  SELF_DESTRUCT: {
    name: 'Tự nổ',
    desc: 'Chết: nổ bán kính 2.0 ô (4★+: 2.4). Sát thương ≈ 0.45×(22/28/35% maxHp Hero theo rarity) + 0.8×ATK.',
  },
  REVIVE: {
    name: 'Sống lại',
    desc: 'Chết lần đầu: hồi 40% maxHp + khiên 15% maxHp trong 2.5 giây. Vẫn chiếm cost đến khi chết hẳn.',
  },
  STUN_ON_HIT: {
    name: 'Choáng khi đánh',
    desc: 'Mỗi đòn đánh trúng: choáng mục tiêu 0.85 giây.',
  },
  POISON_ON_HIT: {
    name: 'Độc khi đánh',
    desc: 'Đánh trúng: độc 9 máu/giây trong 4 giây (tổng ~36). Làm mới thời gian nếu đánh lại.',
  },
  BURN_ON_HIT: {
    name: 'Đốt khi đánh',
    desc: 'Đánh trúng: đốt 10 máu/giây trong 3.2 giây (5★: 14/giây). Tổng ~32–45.',
  },
  SILENCE_ON_HIT: {
    name: 'Câm chú',
    desc: 'Đánh trúng Pháp sư: câm đến hết trận — tắt chiêu mạnh/AoE, ATK cơ bản còn ~35%.',
  },
  KNOCK_BACK_ROOM: {
    name: 'Đẩy lùi',
    desc: 'Đánh trúng: đẩy Hero lùi 2 ô về phía cổng (nếu ô đích không bị chặn).',
  },
  REVEAL: {
    name: 'Soi hình',
    desc: 'Đơn vị tàng hình trong tầm đánh bị lộ hình ngay (quái soi Hero / Hero soi quái).',
  },
  BURST_FIRST_HIT: {
    name: 'Đòn mở đầu',
    desc: 'Đòn đánh đầu tiên trong trận: ×2 ATK. Các đòn sau bình thường.',
  },
  WATER_BUFF: {
    name: 'Buff nước',
    desc: 'Ô nước (~): +40% ATK & HP. Cạn: −30% ATK, −15% HP/giáp, chậm nhẹ.',
  },
  DARK_BUFF: {
    name: 'Buff tối',
    desc: 'Ô tối (d): +100% ATK. Ngoài tối: −35% ATK. Chết: choáng kẻ hạ 0.8 giây.',
  },
  FIRE_BUFF: {
    name: 'Buff lửa',
    desc: 'Ô lửa (f): +45% ATK, +20% HP. Ô nước/băng: −45% ATK. Sàn khác: −25% ATK.',
  },
  ICE_BUFF: {
    name: 'Buff băng',
    desc: 'Ô băng (i): +40% ATK, +20% HP. Ô lửa: −45% ATK. Sàn khác: −25% ATK, chậm nhẹ.',
  },
  POISON_BUFF: {
    name: 'Buff độc',
    desc: 'Ô độc (p): +40% ATK, +15% HP. Ngoài độc: −28% ATK, giáp yếu hơn.',
  },
  AURA_WATER_ALLY: {
    name: 'Aura thủy đồng',
    desc: 'Đứng ô nước: buff quái nước trong tầm (+20% ATK, +12% giáp). Sai ô: tắt aura + bản thân yếu.',
  },
  AURA_FIRE_ALLY: {
    name: 'Aura hỏa đồng',
    desc: 'Đứng ô lửa: buff quái lửa trong tầm. Sai ô: tắt aura + nerf bản thân.',
  },
  AURA_ICE_ALLY: {
    name: 'Aura băng đồng',
    desc: 'Đứng ô băng: buff quái băng trong tầm. Sai ô: tắt aura + nerf bản thân.',
  },
  AURA_POISON_ALLY: {
    name: 'Aura độc đồng',
    desc: 'Đứng ô độc: buff quái độc trong tầm. Sai ô: tắt aura + nerf bản thân.',
  },
  AURA_DARK_ALLY: {
    name: 'Aura ám đồng',
    desc: 'Đứng ô tối: buff quái tối trong tầm. Sai ô: tắt aura + nerf bản thân.',
  },
  POTION_POISON: {
    name: 'Bình độc văng',
    desc: 'Đặt xuống → sau ~1s nổ: độc Heroes trong bán kính (~14 máu/giây ×4.5s). Own ×1.',
  },
  POTION_HEAL: {
    name: 'Bình hồi văng',
    desc: 'Đặt xuống → sau ~1s nổ: hồi ~30% maxHp quái trong vùng. Own ×1.',
  },
  POTION_RAGE: {
    name: 'Bình cuồng văng',
    desc: 'Đặt xuống → sau ~1s nổ: quái trong vùng ATK ×1.35 trong 4s. Own ×1.',
  },
  RAINBOW_MAP_HEAL: {
    name: 'Cầu vồng hồi',
    desc: 'Hồi nhẹ mọi quái trên map. Drawback: thuế Kho 5 HP/s + hồi nhỏ Heroes gần.',
  },
  RAINBOW_MAP_ATK: {
    name: 'Cầu vồng nộ',
    desc: 'Buff ATK toàn map (+28%). Drawback: ally nhận ~×1.35 dame; tự câm định kỳ; atkSpeed chậm.',
  },
  RAINBOW_MAP_SHIELD: {
    name: 'Cầu vồng khiên',
    desc: 'Pulse khiên toàn map. Drawback: chết → shockwave hại ally; gần như không đánh.',
  },
  ANTI_WARRIOR_BURST: {
    name: 'Nghiền chiến sĩ',
    desc: 'Đánh trúng Hero class Chiến sĩ (WARRIOR): sát thương ×2.2 ATK mỗi đòn (không chỉ đòn đầu).',
  },
  BUFF_IN_LOW_CEILING_ROOM: {
    name: 'Sợ trần cao',
    desc: 'Ô trần thấp (l) hoặc tối (d): +200% ATK. Ô trần cao (h): −50% ATK. Sàn khác: −20% ATK.',
  },
  FROST_BOLT: {
    name: 'Băng tiễn',
    desc: 'Bắn tầm xa: đóng băng mục tiêu 1.4 giây (đứng yên / không hành động).',
  },
  RANGED_FROST: {
    name: 'Tầm xa băng',
    desc: 'Bắn tầm xa: đóng băng mục tiêu 1.15 giây.',
  },
  RANGED_POISON: {
    name: 'Tầm xa độc',
    desc: 'Bắn tầm xa: độc 9 máu/giây trong 4 giây (tổng ~36).',
  },
  RANGED_BURN: {
    name: 'Tầm xa lửa',
    desc: 'Bắn tầm xa: đốt 10 máu/giây trong 3.2 giây (5★: 14/giây).',
  },
  RANGED_VOLLEY: {
    name: 'Volley',
    desc: 'Bắn chính + splash 55% sát thương cho Hero khác trong 1.6 ô quanh mục tiêu.',
  },
  TRAP_SPIKE: {
    name: 'Bẫy gai',
    desc: 'Hero giẫm: nhận 100% ATK bẫy rồi bẫy biến mất.',
  },
  TRAP_SLOW: {
    name: 'Bẫy dầu',
    desc: 'Giẫm: 45% ATK + tốc độ còn 40% trong 3.5 giây. Bẫy biến mất.',
  },
  TRAP_BURN: {
    name: 'Bẫy lửa',
    desc: 'Giẫm: 55% ATK + đốt 14 máu/giây trong 4 giây (tổng ~56). Bẫy biến mất.',
  },
  TRAP_POISON: {
    name: 'Bẫy độc',
    desc: 'Giẫm: 40% ATK + độc 11 máu/giây trong 5 giây (tổng ~55). Bẫy biến mất.',
  },
  TRAP_FREEZE: {
    name: 'Bẫy đóng băng',
    desc: 'Giẫm: 35% ATK + đóng băng 1.6 giây. Bẫy biến mất.',
  },
  TRAP_STUN: {
    name: 'Bẫy choáng',
    desc: 'Giẫm: 50% ATK + choáng 1.3 giây. Bẫy biến mất.',
  },
  SHIELD: {
    name: 'Khiên',
    desc: 'Khi máu ≤45%: tạo khiên hấp thụ = 26% maxHp trong 3 giây. Hồi chiêu 11 giây.',
  },
  SHIELD_BREAK: {
    name: 'Phá khiên',
    desc: 'Đánh trúng: xóa ngay toàn bộ lớp khiên đang bảo vệ mục tiêu.',
  },
  STEALTH: {
    name: 'Tàng hình',
    desc: 'Ẩn mình — địch khó nhắm từ xa. Đánh hoặc bị Soi hình → lộ.',
  },
  BACKSTAB: {
    name: 'Lén đâm',
    desc: 'Đòn từ tàng hình hoặc phía sau: ×1.5 ATK.',
  },
  MYTHIC_SELF_DRAIN: {
    name: 'Tự hút (Mythic)',
    desc: 'Tự mất 4% maxHp mỗi giây khi còn sống.',
  },
  MYTHIC_TREASURE_TAX: {
    name: 'Thuế kho (Mythic)',
    desc: 'Khi còn sống: Kho mất 3 HP/giây. Có heal pulse hỗ trợ đồng minh.',
  },
  MYTHIC_ALLY_SLOW: {
    name: 'Trói đồng minh (Mythic)',
    desc: 'Đánh trúng Mage → câm. Đồng minh gần: ATK ×0.82 và atkSpeed ×0.85.',
  },
  MYTHIC_DEATH_CURSE: {
    name: 'Nguyền chết (Mythic)',
    desc: 'Chết: đồng minh trong 2.4 ô mất 20% maxHp. Tag anti-warrior: vs Chiến sĩ ×2.2 ATK khi còn sống.',
  },
  MYTHIC_GLASS: {
    name: 'Thủy tinh (Mythic)',
    desc: 'Nhận sát thương ×~1.8 (phòng thủ ×0.55). ATK/tốc cao đổi lấy máu mỏng.',
  },
  MYTHIC_INFERNO: {
    name: 'Địa ngục (Mythic)',
    desc: 'Không đứng ô lửa: tự cháy 1% maxHp/giây. Gần Hero: đốt 12 máu/giây ×2 giây (theo nhịp).',
  },
  MYTHIC_TOXIN: {
    name: 'Độc vương (Mythic)',
    desc: 'Độc tầm xa mạnh. Drawback: đồng minh trong 2.2 ô mất 4 HP/giây; Hero trong tầm dính độc 10/giây ×2.5 giây.',
  },
  MYTHIC_STASIS: {
    name: 'Đóng băng thời gian (Mythic)',
    desc: 'Đánh trúng: choáng 1.4 giây. Bản thân khóa nhịp tấn công ~1.8 giây sau mỗi choáng.',
  },
  DEF_SHRED: {
    name: 'Phá giáp',
    desc: 'Đánh trúng: phòng thủ mục tiêu ×0.65 trong 4.5 giây (nhận thêm ~54% sát thương).',
  },
  ROOT_ON_HIT: {
    name: 'Kẹp chân',
    desc: 'Đánh trúng: kẹp chân 1.35 giây — không chạy nhưng vẫn đánh được.',
  },
  ROOT_AURA: {
    name: 'Aura kẹp chân',
    desc: 'Mỗi ~3.8 giây: kẹp chân Hero trong bán kính aura ~1.1 giây.',
  },
  CHARM_ON_HIT: {
    name: 'Mê hoặc',
    desc: 'Đánh trúng: mê hoặc Hero ~2 giây — bỏ kho / đánh nhầm đồng minh.',
  },
  FRAIL_ON_HIT: {
    name: 'Dễ vỡ',
    desc: 'Đánh trúng: mục tiêu nhận ×1.22 sát thương trong 3.8 giây.',
  },
  CLEANSE_ALLY: {
    name: 'Thanh tẩy',
    desc: 'Định kỳ xóa đốt/độc/chậm/kẹp chân/phá giáp trên đồng minh gần.',
  },
  CD_REDUCTION: {
    name: 'Giảm hồi chiêu',
    desc: 'Aura rút ngắn CD khiên/khiêu khích của đồng minh gần (~30%).',
  },
  INVULNERABLE_PROC: {
    name: 'Bất tử tạm',
    desc: 'Khi máu ≤30%: bất tử 1.6 giây. Hồi chiêu 14 giây.',
  },
  THORNS_PASSIVE: {
    name: 'Gai phản',
    desc: 'Phản ~18–22% sát thương về Hero đánh trúng.',
  },
  MYTHIC_BLOOD_TITHE: {
    name: 'Hiến tế máu (Mythic)',
    desc: 'Mỗi đòn: hiến tế 1 đồng minh gần. Dame ×(1+0.35×cost nạn nhân), tối đa ×3.5. Không còn ally → ATK ×0.25.',
  },
};

export const SKILL_INFO = {
  SHIELD: PASSIVE_INFO.SHIELD,
  SHIELD_BREAK: PASSIVE_INFO.SHIELD_BREAK,
  TAUNT_SELF: {
    name: 'Khiêu khích chủ động',
    desc: 'Ép Hero trong 3.2 ô phải đánh mình trong 2.4 giây. Hồi chiêu 12 giây.',
  },
  STEALTH: PASSIVE_INFO.STEALTH,
  REVEAL: PASSIVE_INFO.REVEAL,
  BACKSTAB: PASSIVE_INFO.BACKSTAB,
  STUN_ON_HIT: PASSIVE_INFO.STUN_ON_HIT,
  HEAL_ALLY: {
    name: 'Hồi đồng đội',
    desc: 'Hồi ~10–20% maxHp (có soft-cap) đồng minh thiếu máu trong tầm. CD ~3.0–3.4 giây.',
  },
  HERO_AURA_ATK: {
    name: 'Aura chiến kỳ',
    desc: 'Hero gần được buff công khoảng ×1.22 khi đứng trong aura.',
  },
  HERO_AURA_SHIELD: {
    name: 'Aura hộ ấn',
    desc: 'Mỗi ~5 giây, Hero gần nhận một lớp khiên nhỏ (~12% máu tối đa).',
  },
  HERO_AURA_SPEED: {
    name: 'Aura phong hành',
    desc: 'Hero gần được buff tốc chạy khoảng ×1.28 khi ở trong aura.',
  },
  HEAL_CUT: {
    name: 'Aura cắt hồi',
    desc: 'Giảm hồi máu địch đứng gần (hệ số tùy Hero, thường còn 20–50% hồi).',
  },
  HEAL_CUT_HIT: {
    name: 'Vết cắt hồi',
    desc: 'Đánh trúng: giảm hồi địch còn 20–40% trong 4–5.5 giây (theo rarity/Hero).',
  },
  DEF_SHRED: PASSIVE_INFO.DEF_SHRED,
  ROOT_ON_HIT: PASSIVE_INFO.ROOT_ON_HIT,
  CHARM_ON_HIT: PASSIVE_INFO.CHARM_ON_HIT,
  FRAIL_ON_HIT: PASSIVE_INFO.FRAIL_ON_HIT,
  CLEANSE_ALLY: PASSIVE_INFO.CLEANSE_ALLY,
  CD_REDUCTION: PASSIVE_INFO.CD_REDUCTION,
  INVULNERABLE_PROC: PASSIVE_INFO.INVULNERABLE_PROC,
  THORNS_PASSIVE: PASSIVE_INFO.THORNS_PASSIVE,
  SELF_DESTRUCT: PASSIVE_INFO.SELF_DESTRUCT,
  REVIVE: PASSIVE_INFO.REVIVE,
  BURN_ON_HIT: PASSIVE_INFO.BURN_ON_HIT,
  POISON_ON_HIT: PASSIVE_INFO.POISON_ON_HIT,
  FREEZE: {
    name: 'Đóng băng',
    desc: 'Đóng băng mục tiêu ~1.15–1.4 giây (FROST_BOLT = 1.4 giây).',
  },
  FROST_BOLT: PASSIVE_INFO.FROST_BOLT,
  AOE_FIRE: {
    name: 'Hỏa vực',
    desc: 'Sát thương lan theo aoeRadius + đốt DoT (10–14 máu/giây ×3.2 giây).',
  },
  AOE_FROST: {
    name: 'Băng vực',
    desc: 'Sát thương lan theo aoeRadius; có thể kèm đóng băng nếu có FREEZE.',
  },
  PIERCE: {
    name: 'Xuyên giáp',
    desc: 'Bỏ qua một phần phòng thủ: nhân def còn tối thiểu ×0.55.',
  },
  LIFESTEAL: {
    name: 'Hút máu',
    desc: 'Một phần sát thương gây ra hóa thành máu bản thân.',
  },
  BERSERK: {
    name: 'Cuồng nộ',
    desc: 'Dưới 50% máu: ATK tăng dần (×1.3 → khoảng ×2.0 khi gần chết).',
  },
  SLOW_AURA_ALLY: {
    name: 'Sương chậm',
    desc: 'Sau khi hồi máu đồng đội, làm chậm quái gần đó.',
  },
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
  // Tag anti_warrior không có passive riêng — vẫn hiện số
  if (
    m.tags?.includes('anti_warrior') &&
    m.passive !== 'ANTI_WARRIOR_BURST' &&
    m.passive !== 'MYTHIC_DEATH_CURSE'
  ) {
    bits.push({
      name: PASSIVE_INFO.ANTI_WARRIOR_BURST.name,
      desc: PASSIVE_INFO.ANTI_WARRIOR_BURST.desc,
    });
  }
  if (m.auraRadius != null && bits.length) {
    // Gắn bán kính thật nếu unit có auraRadius tùy chỉnh
    const auraPassives = new Set([
      'AURA_STUN',
      'AURA_TAUNT',
      'SLOW_AURA',
      'HEAL_AURA',
      'HEAL_PULSE',
      'ANTI_HEAL_AURA',
    ]);
    if (auraPassives.has(m.passive)) {
      const bit = bits.find((b) => b.name === (PASSIVE_INFO[m.passive] || {}).name);
      if (bit && !bit.desc.includes(`bán kính ${m.auraRadius}`)) {
        bit.desc += ` Bán kính unit: ${m.auraRadius} ô.`;
      }
    }
  }
  return bits;
}
