/** Combat skill effects for heroes */

export function ensureHeroSkillState(hero, time) {
  if (hero.shieldHp == null) hero.shieldHp = 0;
  if (hero.shieldUntil == null) hero.shieldUntil = 0;
  if (hero.tauntUntil == null) hero.tauntUntil = 0;
  if (hero.outOfCombat == null) hero.outOfCombat = 0;
  if (hero.lastCombatTime == null) hero.lastCombatTime = time;
}

export function applyIncomingDamage(hero, dmg, time) {
  ensureHeroSkillState(hero, time);
  if (hero.shieldHp > 0 && time < hero.shieldUntil) {
    const absorbed = Math.min(hero.shieldHp, dmg);
    hero.shieldHp -= absorbed;
    dmg -= absorbed;
  }
  return Math.max(0, dmg);
}

export function tryActivateShield(hero, profile, time) {
  ensureHeroSkillState(hero, time);
  if (!hero.skills?.includes('SHIELD')) return false;
  if (hero.shieldCdUntil && time < hero.shieldCdUntil) return false;
  const threshold = profile.shieldAt ?? 0.4;
  if (hero.hp / hero.maxHp > threshold) return false;
  hero.shieldHp = Math.round(hero.maxHp * 0.28);
  hero.shieldUntil = time + 3.2;
  hero.shieldCdUntil = time + 10;
  return true;
}

export function tryTauntSelf(hero, profile, time, monsters, cellSize, floatFn) {
  ensureHeroSkillState(hero, time);
  if (!hero.skills?.includes('TAUNT_SELF') && !profile.tauntSelf) return false;
  if (hero.tauntCdUntil && time < hero.tauntCdUntil) return false;
  if (hero.intent !== 'fighting') return false;
  hero.tauntUntil = time + 2.5;
  hero.tauntCdUntil = time + 12;
  // Mark nearby monsters to prefer this hero
  for (const m of monsters) {
    if (!m.alive) continue;
    const d = Math.hypot(m.x - hero.x, m.y - hero.y);
    if (d < cellSize * 3.5) {
      m.forcedTargetId = hero.id;
      m.forcedTargetUntil = time + 2.5;
    }
  }
  floatFn?.(hero.x, hero.y, 'Khiêu khích!', '#ffcc80');
  return true;
}

export function computeHeroAttackDamage(hero, target, time) {
  let dmg = hero.atk;
  const skills = hero.skills || [];
  const isAoe =
    skills.includes('AOE_FIRE') ||
    skills.includes('AOE_FROST') ||
    (hero.class === 'MAGE' && hero.aoeRadius > 0);

  if (hero.silenced && hero.class === 'MAGE') {
    return { dmg: Math.round(hero.atk * 0.35), silenced: true, isAoe: false };
  }

  // Backstab: from behind (hero facing toward target's back) or stealthed
  if (skills.includes('BACKSTAB') || (hero.stealth && !hero.revealed)) {
    const approachingFromBehind =
      (hero.facing >= 0 && target.x >= hero.x) ||
      (hero.facing < 0 && target.x < hero.x);
    if (approachingFromBehind || (hero.stealth && !hero.revealed)) {
      dmg = Math.round(dmg * 1.5);
    }
  }

  // Berserk: càng thấp máu càng mạnh (dưới 50% HP)
  if (skills.includes('BERSERK') || hero.class === 'BERSERKER') {
    const ratio = Math.max(0, Math.min(1, hero.hp / Math.max(1, hero.maxHp)));
    if (ratio < 0.5) {
      const mul = 1.3 + (0.5 - ratio) * 1.4; // ~1.3 → 2.0
      dmg = Math.round(dmg * mul);
    }
  }

  return { dmg, silenced: false, isAoe, freeze: skills.includes('FREEZE') };
}

export function tickStealthRegen(hero, profile, time, dt) {
  if (!hero.stealth && !hero.skills?.includes('STEALTH')) return;
  if (hero.intent === 'fighting') {
    hero.lastCombatTime = time;
    return;
  }
  if (hero.revealed && time - (hero.lastCombatTime || 0) > 3.5) {
    hero.revealed = false;
  }
}

/**
 * Healer hồi máu hero đồng minh gần nhất (thiếu máu nhất).
 * @returns {boolean} có heal không
 */
export function tryHealAlly(hero, allies, time, floatFn, particles) {
  ensureHeroSkillState(hero, time);
  if (!hero.skills?.includes('HEAL_ALLY') && hero.class !== 'HEALER') return false;
  if (hero.silenced) return false;
  if (hero.healCdUntil && time < hero.healCdUntil) return false;

  let best = null;
  let bestMissing = 0;
  for (const a of allies) {
    if (!a.alive || a === hero) continue;
    const missing = a.maxHp - a.hp;
    if (missing < a.maxHp * 0.12) continue;
    const d = Math.hypot(a.x - hero.x, a.y - hero.y);
    if (d > (hero.range || 2.8) * 44 * 1.15) continue;
    if (missing > bestMissing) {
      bestMissing = missing;
      best = a;
    }
  }
  if (!best) return false;

  const eliteHeal = ['hero_healer_04', 'hero_healer_05'].includes(hero.templateId || hero.id);
  const ratio = hero.class === 'HEALER' ? (eliteHeal ? 0.28 : 0.18) : 0.12;
  const raw = Math.round(best.maxHp * ratio);
  const mul = Math.max(0, Number(best.healRecvMul) ?? 1);
  const amount = Math.max(0, Math.round(raw * mul));
  hero.healCdUntil = time + (eliteHeal ? 2.6 : 3.2);
  if (amount <= 0) {
    floatFn?.(best.x, best.y - 10, 'Giảm hồi!', '#a1887f');
    return true;
  }
  best.hp = Math.min(best.maxHp, best.hp + amount);
  floatFn?.(best.x, best.y - 10, mul < 0.99 ? `+${amount}↓` : `+${amount}`, mul < 0.99 ? '#a1887f' : '#81c784');
  particles?.heal?.(best.x, best.y - 8);
  return true;
}

/** Hero HEAL_CUT_HIT — đánh trúng quái → giảm hồi nhận. */
export function applyHealCutOnHit(attacker, target, time) {
  const skills = attacker.skills || [];
  if (!skills.includes('HEAL_CUT_HIT') && attacker.passive !== 'HEAL_CUT_ON_HIT') return;
  const dur = attacker.rarity >= 5 || attacker.class === 'HEXER' ? 5.5 : 4;
  const factor =
    attacker.rarity >= 5 || attacker.id?.includes('hex_05') || attacker.templateId === 'hero_hex_05'
      ? 0.2
      : attacker.rarity >= 4 || attacker.templateId === 'hero_hex_04'
        ? 0.3
        : 0.4;
  target.healCutUntil = Math.max(target.healCutUntil || 0, time + dur);
  target.healCutFactor = Math.min(target.healCutFactor ?? 1, factor);
}
