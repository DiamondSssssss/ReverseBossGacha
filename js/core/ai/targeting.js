/** Target scoring for heroes & monsters */

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function hasFlag(value, flag) {
  return Array.isArray(value) ? value.includes(flag) : value === flag;
}

function monsterThreatScore(monster) {
  let score = 0;
  score += (monster.atk || 0) * 1.25;
  score += (monster.rangeCells || monster.range || 0) * 30;
  score += monster.isBoss ? 180 : 0;
  if (
    monster.passive === 'HEAL_AURA' ||
    monster.passive === 'HEAL_PULSE' ||
    monster.passive === 'ANTI_HEAL_AURA' ||
    monster.passive === 'REVEAL' ||
    monster.passive === 'SLOW_AURA'
  ) {
    score += 110;
  }
  if (monster.tags?.includes('support')) score += 80;
  if (monster.tags?.includes('boss')) score += 120;
  return score;
}

function nearbyMonsterCount(monster, monsters, radius) {
  let n = 0;
  for (const other of monsters || []) {
    if (!other?.alive || other.isTrap || other.id === monster.id) continue;
    if (dist(monster, other) <= radius) n++;
  }
  return n;
}

/**
 * Score monster for a hero (lower = better target)
 */
export function scoreMonsterForHero(hero, monster, profile, cellSize, monsters = [], map = null) {
  if (!monster.alive || monster.isTrap) return Infinity;
  // Quái tàng hình: hero không lock được trừ khi sát gần / đã lộ / taunt / có REVEAL
  if (monster.stealth && !monster.revealed) {
    const d = dist(hero, monster);
    const revealRange = hero.effectiveRange ?? hero.range ?? cellSize * 3;
    const canReveal =
      (hero.skills || []).includes('REVEAL') && d <= revealRange;
    if (monster.passive !== 'TAUNT' && d > cellSize * 0.9 && !canReveal) return Infinity;
  }
  let score = dist(hero, monster);

  if (monster.passive === 'TAUNT') score -= cellSize * 4.5;

  if (profile.preferLowHp) {
    score += (monster.hp / monster.maxHp) * cellSize * 2;
  }
  if (profile.preferHighAtk) {
    score -= (monster.atk / 40) * cellSize;
  }
  if (profile.preferFreeze && monster.frozenUntil) {
    score += cellSize; // already frozen — less priority
  }
  if (profile.preferStealth && monster.stealth) {
    score -= cellSize * 1.2;
  }
  if (profile.clusterSeek) {
    // prefer denser packs — approximated by atk as proxy for worth
    score -= cellSize * 0.3;
  }
  // Mage soft-avoid silence carriers when not silenced yet
  if (
    hero.class === 'MAGE' &&
    !hero.silenced &&
    (monster.passive === 'SILENCE_ON_HIT' || monster.passive === 'SLIME_EXPLODE_SILENCE')
  ) {
    score += cellSize * 0.8;
  }
  // Stealth rush: deprioritize fighting unless very close / taunt
  if (profile.stealthRush && hero.stealth && !hero.revealed) {
    if (monster.passive !== 'TAUNT') score += cellSize * 3;
  }

  const behavior = hero.ai_behavior || {};
  switch (behavior.targetPriority) {
    case 'NEAREST':
      break;
    case 'TREASURE_RUSH':
      if (monster.passive !== 'TAUNT') score += cellSize * 2.1;
      break;
    case 'BACKLINE_DIVE':
    case 'HIGH_THREAT': {
      const threat = monsterThreatScore(monster);
      score -= (threat / 120) * cellSize;
      if ((monster.rangeCells || monster.range || 0) > cellSize * 0.04) score -= cellSize * 1.1;
      if (monsterThreatScore(monster) < 80) score += cellSize * 0.7;
      break;
    }
    case 'LOWEST_HP_ALLOY':
      score += (monster.hp / Math.max(1, monster.maxHp || monster.hp || 1)) * cellSize * 3.4;
      break;
    case 'CROWD_DENSEST': {
      const dense = nearbyMonsterCount(monster, monsters, cellSize * 1.9);
      score -= dense * cellSize * 0.85;
      break;
    }
    case 'AOE_BUFF_CARRIER': {
      const key = `${Math.floor(monster.x / cellSize)},${Math.max(0, Math.floor((monster.y - (map?.originY || 0)) / cellSize))}`;
      const buffs = map?.buffIndex?.[key] || [];
      if (buffs.some((b) => b.side === 'monster' || b.side === 'both')) score -= cellSize * 2.2;
      if (monster.passive === 'HEAL_AURA' || monster.passive === 'SLOW_AURA') score -= cellSize * 1.4;
      break;
    }
    default:
      break;
  }

  const triggers = behavior.skillTrigger || [];
  if (hasFlag(triggers, 'INTERRUPT_CHANNEL')) {
    if (monster.isBoss) score -= cellSize * 1.8;
    if (monsterThreatScore(monster) > 120) score -= cellSize * 1.1;
  }
  if (hasFlag(triggers, 'ON_CROWD_ENTER')) {
    const dense = nearbyMonsterCount(monster, monsters, cellSize * 1.7);
    if (dense >= 2) score -= cellSize * 0.8;
  }

  const env = behavior.environmentalReaction || [];
  if (hasFlag(env, 'HAZARD_EXPLOITER') && map) {
    const col = Math.max(0, Math.min(map.cols - 1, monster.col ?? Math.floor(monster.x / cellSize)));
    const row = Math.max(0, Math.min(map.rows - 1, monster.row ?? 0));
    const key = `${col},${row}`;
    const terrain = map.terrain?.[key];
    if (map.hazard?.has(key)) score -= cellSize * 1.6;
    if (terrain === 'FIRE' || terrain === 'POISON' || terrain === 'OIL') score -= cellSize * 0.9;
  }
  return score;
}

/**
 * Score hero for a monster (lower = better)
 */
export function scoreHeroForMonster(monster, hero, ai, ctx = null) {
  if (!hero.alive || hero.spawnProtect > 0 || hero.inStasis) return Infinity;
  if (hero.stealth && !hero.revealed && monster.passive !== 'REVEAL') {
    return Infinity;
  }
  let score = dist(monster, hero);
  const prefer = ai?.prefer || [];
  if (prefer.includes(hero.class)) score -= 80;
  if (ai?.role === 'anti_mage' && hero.class === 'MAGE') score -= 120;
  if (ai?.role === 'anti_rogue' && hero.class === 'ROGUE') score -= 100;
  if (ai?.role === 'anti_warrior' || monster.passive === 'ANTI_WARRIOR_BURST') {
    if (hero.class === 'WARRIOR') score -= 110;
  }
  // Prefer heroes draining treasure
  if (hero.draining) score -= 60;
  if (ai?.flankDive) {
    if (['MAGE', 'ARCHER', 'HEALER', 'SCOUT', 'HEXER'].includes(hero.class)) score -= 90;
    if ((hero.hp || 0) / Math.max(1, hero.maxHp || hero.hp || 1) < 0.55) score -= 45;
  }
  if (ai?.disruptor) {
    if (hero.skills?.includes('HEAL_ALLY') || hero.skills?.includes('SHIELD_ALLY')) score -= 80;
    if (hero.skills?.includes('REVEAL')) score -= 55;
    if (hero.ai_behavior?.supportFocus || hero.ai_behavior?.visionRole) score -= 35;
  }
  if (ai?.executeLowHp) {
    score += (hero.hp / Math.max(1, hero.maxHp || hero.hp || 1)) * 80;
  }
  if (ai?.treasurePunish && hero.draining) score -= 160;
  if (ai?.guardBreaker && ['WARRIOR', 'TANK', 'BOSS'].includes(hero.class)) score -= 75;
  if (ai?.antiSupport && ['HEALER', 'HEXER', 'SCOUT'].includes(hero.class)) score -= 70;
  if (ctx?.heroes?.some((h) => h.alive && h.draining) && hero.draining) score -= 30;
  return score;
}

export { dist };
