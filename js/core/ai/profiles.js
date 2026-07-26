/** Hero AI profiles — keyed by hero template id */

export const HERO_PROFILES = {
  hero_mage_01: {
    archetype: 'mage',
    idealRange: 3.0,
    kiteBelow: 1.6,
    aoePrefer: true,
    engageBias: 0.4,
  },
  hero_mage_02: {
    archetype: 'mage',
    idealRange: 2.8,
    kiteBelow: 1.5,
    preferFreeze: true,
    aoePrefer: true,
    engageBias: 0.35,
  },
  hero_mage_03: {
    archetype: 'mage',
    idealRange: 3.2,
    kiteBelow: 1.7,
    engageBias: 0.5,
  },
  hero_mage_04: {
    archetype: 'mage',
    idealRange: 2.6,
    kiteBelow: 1.4,
    aoePrefer: true,
    clusterSeek: true,
    engageBias: 0.3,
  },
  hero_mage_05: {
    archetype: 'mage',
    idealRange: 3.4,
    kiteBelow: 1.8,
    preferHighAtk: true,
    engageBias: 0.45,
  },
  hero_warrior_01: {
    archetype: 'warrior',
    engageBias: 1.2,
    holdFight: true,
    shieldAt: 0.45,
  },
  hero_warrior_02: {
    archetype: 'warrior',
    engageBias: 1.5,
    holdFight: true,
    tauntSelf: true,
    shieldAt: 0.5,
  },
  hero_warrior_03: {
    archetype: 'warrior',
    engageBias: 1.0,
    preferLowHp: true,
    shieldAt: 0.35,
  },
  hero_warrior_04: {
    archetype: 'warrior',
    engageBias: 1.3,
    holdFight: true,
    tauntSelf: true,
    shieldAt: 0.4,
  },
  hero_warrior_05: {
    archetype: 'warrior',
    engageBias: 1.6,
    holdFight: true,
    siege: true,
    tauntSelf: true,
  },
  hero_warrior_06: {
    archetype: 'warrior',
    engageBias: 1.35,
    holdFight: true,
    preferLowHp: true,
    shieldAt: 0.4,
  },
  hero_warrior_07: {
    archetype: 'warrior',
    engageBias: 1.55,
    holdFight: true,
    tauntSelf: true,
    shieldAt: 0.5,
  },
  hero_warrior_08: {
    archetype: 'warrior',
    engageBias: 1.4,
    holdFight: true,
    preferLowHp: true,
    tauntSelf: true,
    shieldAt: 0.35,
  },
  hero_healer_01: {
    archetype: 'healer',
    idealRange: 2.6,
    kiteBelow: 1.4,
    engageBias: 0.25,
    healPriority: true,
  },
  hero_healer_02: {
    archetype: 'healer',
    idealRange: 2.8,
    kiteBelow: 1.5,
    engageBias: 0.2,
    healPriority: true,
    shieldAt: 0.4,
  },
  hero_healer_03: {
    archetype: 'healer',
    idealRange: 3.0,
    kiteBelow: 1.6,
    engageBias: 0.15,
    healPriority: true,
  },
  hero_rogue_01: {
    archetype: 'rogue',
    stealthRush: true,
    skipFightIfClear: true,
    engageBias: 0.25,
  },
  hero_rogue_02: {
    archetype: 'rogue',
    stealthRush: true,
    skipFightIfClear: true,
    engageBias: 0.2,
  },
  hero_rogue_03: {
    archetype: 'rogue',
    brawler: true,
    engageBias: 0.9,
    preferBackstab: true,
  },
  hero_rogue_04: {
    archetype: 'rogue',
    stealthRush: true,
    skipFightIfClear: true,
    engageBias: 0.15,
  },
  hero_rogue_05: {
    archetype: 'rogue',
    rangedStealth: true,
    idealRange: 2.6,
    engageBias: 0.4,
    skipFightIfClear: true,
  },
};

export function getHeroProfile(heroId, heroClass) {
  if (HERO_PROFILES[heroId]) return HERO_PROFILES[heroId];
  if (heroClass === 'MAGE') {
    return { archetype: 'mage', idealRange: 3, kiteBelow: 1.5, engageBias: 0.4 };
  }
  if (heroClass === 'HEALER') {
    return { archetype: 'healer', idealRange: 2.8, kiteBelow: 1.5, engageBias: 0.2, healPriority: true };
  }
  if (heroClass === 'ROGUE') {
    return { archetype: 'rogue', stealthRush: true, engageBias: 0.3 };
  }
  return { archetype: 'warrior', engageBias: 1.1, holdFight: true };
}
