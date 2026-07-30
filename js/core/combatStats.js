const TERRAIN_NAMES = {
  NORMAL: 'Đất thường',
  WATER: 'Vùng nước',
  LOW_CEILING: 'Trần thấp',
  DARK: 'Vùng tối',
  HIGH: 'Gò cao',
  FIRE: 'Nền lửa',
  ICE: 'Nền băng',
  POISON: 'Nền độc',
  OIL: 'Vệt dầu',
};

function ensureEntry(store, unit, side) {
  const id = unit?.templateId || unit?.id;
  if (!id) return null;
  if (!store[id]) {
    store[id] = {
      id,
      name: unit.name || id,
      side,
      className: unit.class || null,
      cost: unit.cost || 0,
      tags: [...(unit.tags || [])],
      terrain: unit.terrain || 'NORMAL',
      damageDone: 0,
      damageTaken: 0,
      healingDone: 0,
      kills: 0,
      deaths: 0,
      drains: 0,
      drainTime: 0,
      spawned: 0,
      deployed: 0,
      appliedStatuses: {},
      terrainTime: {},
    };
  }
  return store[id];
}

function addStatusCounts(target, statuses) {
  if (!target || !Array.isArray(statuses)) return;
  for (const key of statuses) {
    if (!key) continue;
    target.appliedStatuses[key] = (target.appliedStatuses[key] || 0) + 1;
  }
}

export class CombatStatsTracker {
  constructor(run, map) {
    this.run = run;
    this.map = map;
    this.heroStats = {};
    this.monsterStats = {};
    this.spells = [];
    this.damageEvents = [];
    this.treasureTimeline = [];
    this.costTimeline = [];
    this.drainEvents = [];
    this.waveEvents = [];
    this.terrainTotals = { hero: {}, monster: {} };
    this.summaryCache = null;
    this.signals = {
      earlyFullCostAt: null,
      firstTreasureHitAt: null,
      peakDrainPerSec: 0,
      treasureDamageTaken: 0,
      treasureShieldAbsorbed: 0,
      monsterDeathsEarly: 0,
      drainTicks: 0,
      rangedHeroDamage: 0,
      meleeHeroDamage: 0,
    };
  }

  ensureHero(unit) {
    return ensureEntry(this.heroStats, unit, 'hero');
  }

  ensureMonster(unit) {
    return ensureEntry(this.monsterStats, unit, 'monster');
  }

  recordMonsterSpawn(unit, meta = {}) {
    const entry = this.ensureMonster(unit);
    if (!entry) return;
    entry.spawned += 1;
    if (meta.deployedInCombat) entry.deployed += 1;
    if (unit.terrain) entry.terrain = unit.terrain;
  }

  recordHeroSpawn(unit, meta = {}) {
    const entry = this.ensureHero(unit);
    if (!entry) return;
    entry.spawned += 1;
    entry.waveIndex = meta.waveIndex || unit.waveIndex || 1;
  }

  recordDeploy(unit, time) {
    const entry = this.ensureMonster(unit);
    if (!entry) return;
    entry.deployed += 1;
    entry.lastDeployAt = time;
  }

  recordSpell(spellId, spell, time) {
    this.spells.push({
      id: spellId,
      name: spell?.name || spellId,
      kind: spell?.kind || spellId,
      time,
    });
  }

  recordDamage(attacker, target, amount, meta = {}) {
    const dealt = Math.max(0, Math.round(amount || 0));
    if (!dealt || !attacker || !target) return;
    const atkStore = meta.attackerSide === 'hero' ? this.heroStats : this.monsterStats;
    const defStore = meta.targetSide === 'hero' ? this.heroStats : this.monsterStats;
    const atk = ensureEntry(atkStore, attacker, meta.attackerSide);
    const def = ensureEntry(defStore, target, meta.targetSide);
    if (atk) atk.damageDone += dealt;
    if (def) def.damageTaken += dealt;
    if (meta.attackerSide === 'hero') {
      if (attacker.class === 'ARCHER' || attacker.class === 'MAGE' || attacker.class === 'SUPPORT') {
        this.signals.rangedHeroDamage += dealt;
      } else {
        this.signals.meleeHeroDamage += dealt;
      }
    }
    this.damageEvents.push({
      time: meta.time || 0,
      attackerId: attacker.templateId || attacker.id,
      targetId: target.templateId || target.id,
      attackerName: attacker.name,
      targetName: target.name,
      attackerSide: meta.attackerSide,
      targetSide: meta.targetSide,
      amount: dealt,
      source: meta.source || 'attack',
    });
  }

  recordHeal(source, target, amount, meta = {}) {
    const healed = Math.max(0, Math.round(amount || 0));
    if (!healed || !source) return;
    const atkStore = meta.sourceSide === 'hero' ? this.heroStats : this.monsterStats;
    const atk = ensureEntry(atkStore, source, meta.sourceSide);
    if (atk) atk.healingDone += healed;
    if (target) {
      const defStore = meta.targetSide === 'hero' ? this.heroStats : this.monsterStats;
      ensureEntry(defStore, target, meta.targetSide);
    }
  }

  recordStatus(source, target, statuses, meta = {}) {
    const store = meta.sourceSide === 'hero' ? this.heroStats : this.monsterStats;
    addStatusCounts(ensureEntry(store, source, meta.sourceSide), statuses);
    if (target) {
      const tStore = meta.targetSide === 'hero' ? this.heroStats : this.monsterStats;
      ensureEntry(tStore, target, meta.targetSide);
    }
  }

  recordTreasureDrain(hero, amount, time, meta = {}) {
    const drained = Math.max(0, amount || 0);
    if (!drained) return;
    const entry = this.ensureHero(hero);
    if (entry) {
      entry.drains += drained;
      entry.drainTime += meta.dt || 0;
    }
    this.drainEvents.push({
      time,
      heroId: hero?.templateId || hero?.id,
      heroName: hero?.name || 'Hero',
      heroClass: hero?.class || '',
      amount: drained,
    });
    this.signals.treasureDamageTaken += drained;
    this.signals.drainTicks += 1;
    const dps = meta.dt ? drained / Math.max(0.0001, meta.dt) : drained;
    if (dps > this.signals.peakDrainPerSec) this.signals.peakDrainPerSec = dps;
    if (this.signals.firstTreasureHitAt == null) this.signals.firstTreasureHitAt = time;
  }

  recordTreasureShield(absorbed) {
    const value = Math.max(0, absorbed || 0);
    if (!value) return;
    this.signals.treasureShieldAbsorbed += value;
  }

  recordTreasureTax(source, amount, time) {
    const taxed = Math.max(0, amount || 0);
    if (!taxed) return;
    this.signals.treasureDamageTaken += taxed;
    if (this.signals.firstTreasureHitAt == null) this.signals.firstTreasureHitAt = time;
    this.drainEvents.push({
      time,
      heroId: null,
      heroName: source?.name || 'Hiệu ứng',
      heroClass: source?.passive || 'effect',
      amount: taxed,
    });
  }

  recordDeath(unit, meta = {}) {
    const store = meta.side === 'hero' ? this.heroStats : this.monsterStats;
    const entry = ensureEntry(store, unit, meta.side);
    if (!entry) return;
    entry.deaths += 1;
    if (meta.side === 'monster' && (meta.time || 0) <= 12) {
      this.signals.monsterDeathsEarly += 1;
    }
    if (meta.killer) {
      const kStore = meta.killerSide === 'hero' ? this.heroStats : this.monsterStats;
      const killer = ensureEntry(kStore, meta.killer, meta.killerSide);
      if (killer) killer.kills += 1;
    }
  }

  recordWaveUnlock(waveIndex, time) {
    this.waveEvents.push({ type: 'unlock', waveIndex, time });
  }

  recordWaveSpawn(waveIndex, time, hero) {
    this.waveEvents.push({
      type: 'spawn',
      waveIndex,
      time,
      heroName: hero?.name || 'Hero',
    });
  }

  recordSnapshot(time, snap) {
    if (!snap) return;
    const treasureRatio =
      snap.treasureMax > 0 ? snap.treasureHp / Math.max(1, snap.treasureMax) : 0;
    this.treasureTimeline.push({
      time,
      hp: snap.treasureHp,
      maxHp: snap.treasureMax,
      ratio: treasureRatio,
      heroesAlive: snap.heroesAlive,
    });
    this.costTimeline.push({
      time,
      used: snap.costUsed,
      cap: snap.costCap,
      ratio: snap.costCap > 0 ? snap.costUsed / snap.costCap : 0,
    });
    if (
      this.signals.earlyFullCostAt == null &&
      snap.costCap > 0 &&
      snap.costUsed >= snap.costCap
    ) {
      this.signals.earlyFullCostAt = time;
    }
  }

  recordTerrainPresence(side, unit, terrain, dt) {
    if (!unit || !terrain || !dt) return;
    const totals = this.terrainTotals[side] || (this.terrainTotals[side] = {});
    totals[terrain] = (totals[terrain] || 0) + dt;
    const store = side === 'hero' ? this.heroStats : this.monsterStats;
    const entry = ensureEntry(store, unit, side);
    if (!entry) return;
    entry.terrainTime[terrain] = (entry.terrainTime[terrain] || 0) + dt;
  }

  finalize(result, engine) {
    if (this.summaryCache) return this.summaryCache;
    const heroes = Object.values(this.heroStats);
    const monsters = Object.values(this.monsterStats);
    const realMonsters = monsters.filter((entry) => entry.id !== 'boss_effect');
    const topThreatHero =
      heroes
        .slice()
        .sort(
          (a, b) =>
            (b.drains * 5 + b.damageDone + b.kills * 40) -
            (a.drains * 5 + a.damageDone + a.kills * 40)
        )[0] || null;
    const topMonster =
      realMonsters
        .slice()
        .sort(
          (a, b) =>
            (b.damageDone + b.healingDone * 0.65 + b.kills * 40) -
            (a.damageDone + a.healingDone * 0.65 + a.kills * 40)
        )[0] || null;
    const topHeroTerrain = Object.entries(this.terrainTotals.hero)
      .sort((a, b) => b[1] - a[1])[0];
    const topMonsterTerrain = Object.entries(this.terrainTotals.monster)
      .sort((a, b) => b[1] - a[1])[0];
    const spellCounts = {};
    for (const item of this.spells) {
      const bucket = spellCounts[item.id] || { ...item, casts: 0 };
      bucket.casts += 1;
      spellCounts[item.id] = bucket;
    }
    const topSpell =
      Object.values(spellCounts).sort((a, b) => b.casts - a.casts || a.time - b.time)[0] || null;
    const lowestTreasure =
      this.treasureTimeline.reduce((low, item) => {
        if (!low || item.ratio < low.ratio) return item;
        return low;
      }, null) || null;
    const biggestDrain =
      this.drainEvents.slice().sort((a, b) => b.amount - a.amount)[0] || null;
    const rangedShare =
      this.signals.rangedHeroDamage /
      Math.max(1, this.signals.rangedHeroDamage + this.signals.meleeHeroDamage);
    this.summaryCache = {
      result,
      elapsed: engine?.time || 0,
      treasureHp: engine?.treasureHp || 0,
      treasureMax: engine?.treasureMax || 0,
      topThreatHero,
      topMonster,
      topSpell,
      biggestDrain,
      lowestTreasure,
      topHeroTerrain: topHeroTerrain
        ? { id: topHeroTerrain[0], name: TERRAIN_NAMES[topHeroTerrain[0]] || topHeroTerrain[0], seconds: topHeroTerrain[1] }
        : null,
      topMonsterTerrain: topMonsterTerrain
        ? {
            id: topMonsterTerrain[0],
            name: TERRAIN_NAMES[topMonsterTerrain[0]] || topMonsterTerrain[0],
            seconds: topMonsterTerrain[1],
          }
        : null,
      signals: {
        ...this.signals,
        rangedShare,
      },
      spells: [...this.spells],
      heroes,
      monsters,
    };
    return this.summaryCache;
  }
}
