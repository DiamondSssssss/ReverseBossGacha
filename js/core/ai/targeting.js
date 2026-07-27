/** Target scoring for heroes & monsters */

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Score monster for a hero (lower = better target)
 */
export function scoreMonsterForHero(hero, monster, profile, cellSize) {
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
  return score;
}

/**
 * Score hero for a monster (lower = better)
 */
export function scoreHeroForMonster(monster, hero, ai) {
  if (!hero.alive || hero.spawnProtect > 0) return Infinity;
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
  return score;
}

export { dist };
