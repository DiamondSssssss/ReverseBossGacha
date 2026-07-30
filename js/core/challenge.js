import { CHALLENGES, CHALLENGE_BY_ID, CHALLENGE_TITLES, getChallenge, CHALLENGE_ROLE_TAGS } from '../data/challenges.js?v=131';
import { getChallengeMap } from '../data/mapsChallenge.js?v=131';
import { MONSTER_BY_ID } from '../data/monsters.js?v=131';
import { HERO_BY_ID, assignHeroFormation } from '../data/heroes.js?v=131';
import {
  placeMaxCost,
  sanitizeLoadout,
  suggestLoadout,
  tryAddToLoadout,
  LOADOUT_POOL_MULT,
} from './loadout.js?v=131';

export { getChallenge, CHALLENGES, CHALLENGE_TITLES };

/** HP/ATK quái Thử Thách = catalog base (không scale theo ải / không × mul). */
export const CHALLENGE_MONSTER_STAT_MUL = 1;

export function ensureChallengeProgress(state) {
  if (!state.challengeProgress) {
    state.challengeProgress = { unlocked: [], cleared: {}, bestTime: {} };
  }
  if (!Array.isArray(state.titles)) state.titles = [];
  if (state.equippedTitle === undefined) state.equippedTitle = null;
  return state.challengeProgress;
}

export function syncChallengeUnlocks(state) {
  ensureChallengeProgress(state);
  const set = new Set(state.challengeProgress.unlocked || []);
  const dl = state.dungeonLevel || 1;
  const cleared = state.challengeProgress.cleared || {};

  for (const c of CHALLENGES) {
    const u = c.unlock || {};
    let ok = true;
    if (u.dungeonLevel && dl < u.dungeonLevel) ok = false;
    if (u.clearPrev && c.id > 1 && !cleared[c.id - 1]) ok = false;
    if (c.id === 1 && dl >= (u.dungeonLevel || 5)) ok = true;
    if (ok) set.add(c.id);
    if (cleared[c.id]) set.add(c.id);
  }
  for (const c of CHALLENGES) {
    if (!cleared[c.id]) continue;
    const next = CHALLENGE_BY_ID[c.id + 1];
    if (!next) continue;
    const nu = next.unlock || {};
    if (nu.dungeonLevel && dl < nu.dungeonLevel) continue;
    set.add(next.id);
  }
  state.challengeProgress.unlocked = [...set].sort((a, b) => a - b);
  return state.challengeProgress.unlocked;
}

export function isChallengeUnlocked(state, challengeId) {
  ensureChallengeProgress(state);
  return (state.challengeProgress.unlocked || []).includes(challengeId);
}

export function unlockHintChallenge(c, state) {
  const u = c.unlock || {};
  if (isChallengeUnlocked(state, c.id)) return 'Đã mở';
  const parts = [];
  if (u.dungeonLevel) parts.push(`ải thường ≥${u.dungeonLevel}`);
  if (u.clearPrev) parts.push(`phá CH${c.id - 1}`);
  return parts.length ? `Mở khi: ${parts.join(' + ')}` : 'Khóa';
}

function buildChallengeWave(ch) {
  const list = [];
  let i = 0;

  const pushHero = (id, spawnDelay, waveIndex) => {
    const tpl = HERO_BY_ID[id];
    if (!tpl) return;
    list.push({
      ...tpl,
      templateId: tpl.id,
      id: `${tpl.id}_${i++}`,
      spawnDelay,
      waveIndex: waveIndex || 1,
      spawned: false,
    });
  };

  const squads = ch.wave?.squads;
  if (squads?.length) {
    for (const sq of squads) {
      const wi = sq.wave || 1;
      const gap = sq.gap ?? 1.4;
      let t = 0.5;
      for (const id of sq.ids || []) {
        pushHero(id, t, wi);
        t += gap;
      }
    }
    return list;
  }

  const ids = ch.wave?.ids || ['hero_warrior_01', 'hero_mage_01'];
  let t = 0.5;
  for (const id of ids) {
    pushHero(id, t, 1);
    t += 1.6;
  }
  return list;
}

/** Expand banRoles → tag list */
export function expandedBanTags(ch) {
  const cons = ch?.constraints || {};
  const tags = new Set(cons.banTags || []);
  for (const role of cons.banRoles || []) {
    const mapped = CHALLENGE_ROLE_TAGS[role] || [role];
    for (const t of mapped) tags.add(t);
  }
  return [...tags];
}

/** Lý do cứng — quái này không được mang vào thử thách (không phụ thuộc count). */
export function challengeHardBlockReason(ch, monster) {
  if (!ch || !monster) return 'Quái không tồn tại';
  const cons = ch.constraints || {};
  const isPotion = !!monster.tags?.includes('potion');
  const isTrap = !!monster.tags?.includes('trap');
  const mTags = monster.tags || [];

  const banTags = expandedBanTags(ch);
  if (banTags.length) {
    const hit = banTags.find((t) => mTags.includes(t));
    if (hit) {
      const role =
        Object.entries(CHALLENGE_ROLE_TAGS).find(([, arr]) => arr.includes(hit))?.[0] || hit;
      return `Thử thách cấm ${role}`;
    }
  }

  if (cons.banMythic && monster.rarity >= 6) return 'Thử thách cấm Mythic/Rainbow';
  if (cons.banLegendary && monster.rarity === 5 && !isPotion) return 'Thử thách cấm Legendary';
  if (cons.banRainbow && monster.rarity >= 7) return 'Thử thách cấm Rainbow';
  if (cons.maxRarity != null && monster.rarity > cons.maxRarity && !isPotion) {
    return `Thử thách chỉ ≤${cons.maxRarity}★`;
  }
  if (cons.banStealthMythic && monster.rarity >= 6 && (monster.stealth || monster.skills?.includes('STEALTH'))) {
    return 'Cấm stealth Mythic';
  }
  if (cons.banSilenceMythic && monster.rarity >= 6 && monster.passive === 'SILENCE_ON_HIT') {
    return 'Cấm silence Mythic';
  }
  if (
    cons.fillerMaxRarity != null &&
    monster.id !== cons.requireMonster &&
    !(ch.forcedLoadout && ch.forcedLoadout[monster.id]) &&
    monster.rarity > cons.fillerMaxRarity
  ) {
    return `Filler chỉ ≤${cons.fillerMaxRarity}★`;
  }
  if (cons.onlyLowCeilingOrCheap) {
    const ok =
      monster.passive === 'BUFF_IN_LOW_CEILING_ROOM' || (monster.cost || 0) <= 2;
    if (!ok) return 'Chỉ low-ceiling hoặc cost ≤2';
  }
  if (cons.allowTrap === false && isTrap) return 'Thử thách không cho bẫy';
  if (cons.allowPotion === false && isPotion) return 'Thử thách không cho potion';
  return null;
}

export function validateChallengeLoadout(ch, loadout, placements = []) {
  const cons = ch.constraints || {};
  const errors = [];
  const counts = { mythic: 0, legendary: 0, epic: 0, low: 0, units: 0, potion: 0 };
  const ids = new Set();

  function consider(id, n = 1) {
    const m = MONSTER_BY_ID[id];
    if (!m) return;
    ids.add(id);
    counts.units += n;
    if (m.rarity >= 6) counts.mythic += n;
    else if (m.rarity === 5) counts.legendary += n;
    else if (m.rarity === 4) counts.epic += n;
    if (m.rarity <= (cons.lowStarMaxRarity || 3)) counts.low += n;
    if (m.tags?.includes('potion')) counts.potion += n;

    const hard = challengeHardBlockReason(ch, m);
    if (hard) errors.push(hard);
  }

  for (const [id, n] of Object.entries(loadout || {})) {
    if (n > 0) consider(id, n);
  }
  for (const p of placements || []) consider(p.monsterId, 0);

  if (cons.maxMythic != null && counts.mythic > cons.maxMythic) {
    errors.push(`Tối đa ${cons.maxMythic} Mythic`);
  }
  if (cons.maxLegendary != null && counts.legendary > cons.maxLegendary) {
    errors.push(`Tối đa ${cons.maxLegendary} Legendary`);
  }
  if (cons.maxEpic != null && counts.epic > cons.maxEpic) {
    errors.push(`Tối đa ${cons.maxEpic} Epic 4★`);
  }
  if (cons.maxUnits != null && (placements?.length || 0) > cons.maxUnits) {
    errors.push(`Tối đa ${cons.maxUnits} unit trên sân`);
  }
  if (cons.minLowStarUnits != null && counts.low < cons.minLowStarUnits) {
    errors.push(`Cần ≥${cons.minLowStarUnits} unit ≤${cons.lowStarMaxRarity || 3}★`);
  }
  if (cons.requireMonster && !ids.has(cons.requireMonster) && !(loadout?.[cons.requireMonster] > 0)) {
    errors.push('Thiếu quái bắt buộc (Oan Hồn Hiến Tế)');
  }

  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

/** Thử thêm 1 copy — kiểm cap pool + constraint thử thách. */
export function tryAddChallengeLoadout(ch, loadout, inventory, monsterId, costCap, level, poolMult) {
  if (ch.lockLoadout) return { ok: false, reason: 'Loadout bị khóa trong thử thách này', loadout };
  const m = MONSTER_BY_ID[monsterId];
  const hard = challengeHardBlockReason(ch, m);
  if (hard) return { ok: false, reason: hard, loadout };

  const res = tryAddToLoadout(loadout, inventory, monsterId, costCap, level, poolMult);
  if (!res.ok) return res;

  const check = validateChallengeLoadout(ch, res.loadout, []);
  const soft = (check.errors || []).filter(
    (e) => !e.startsWith('Cần ≥') && !e.startsWith('Thiếu quái')
  );
  if (soft.length) return { ok: false, reason: soft[0], loadout };
  return res;
}

/** Cắt quái cấm / vượt quota khỏi loadout. */
export function sanitizeChallengeLoadout(ch, loadout) {
  if (ch.forcedLoadout && ch.lockLoadout) {
    return { ...ch.forcedLoadout };
  }
  const out = { ...(loadout || {}) };
  if (ch.forcedLoadout) {
    for (const [id, n] of Object.entries(ch.forcedLoadout)) {
      out[id] = Math.max(out[id] || 0, n);
    }
  }
  for (const id of Object.keys(out)) {
    const m = MONSTER_BY_ID[id];
    if (!m || challengeHardBlockReason(ch, m)) {
      // Giữ forced dù hard-block (forced là ngoại lệ yêu cầu)
      if (ch.forcedLoadout?.[id]) continue;
      delete out[id];
    }
  }
  const trimKind = (pred, maxKey) => {
    const cons = ch.constraints || {};
    const max = cons[maxKey];
    if (max == null) return;
    let count = 0;
    for (const [id, n] of Object.entries(out)) {
      const m = MONSTER_BY_ID[id];
      if (m && pred(m)) count += n;
    }
    while (count > max) {
      const id = Object.keys(out).find((k) => {
        if (ch.forcedLoadout?.[k]) return false;
        const m = MONSTER_BY_ID[k];
        return m && pred(m) && out[k] > 0;
      });
      if (!id) break;
      if (out[id] <= 1) delete out[id];
      else out[id] -= 1;
      count -= 1;
    }
  };
  trimKind((m) => m.rarity >= 6, 'maxMythic');
  trimKind((m) => m.rarity === 5 && !m.tags?.includes('potion'), 'maxLegendary');
  trimKind((m) => m.rarity === 4, 'maxEpic');
  return out;
}

export function suggestChallengeLoadout(ch, inventory, costCap, level, poolMult) {
  if (ch.forcedLoadout && ch.lockLoadout) return { ...ch.forcedLoadout };
  const filtered = {};
  for (const [id, n] of Object.entries(inventory || {})) {
    const m = MONSTER_BY_ID[id];
    if (!m || !(n > 0)) continue;
    if (challengeHardBlockReason(ch, m) && !ch.forcedLoadout?.[id]) continue;
    filtered[id] = n;
  }
  let loadout = {};
  if (ch.forcedLoadout) {
    loadout = { ...ch.forcedLoadout };
  }
  const req = ch.constraints?.requireMonster;
  if (req && (filtered[req] || 0) > 0) {
    loadout[req] = Math.max(loadout[req] || 0, 1);
  }

  // Fill pool: ưu tiên utility/trap rồi cost thấp để lấp đầy dưới constraint
  const ranked = Object.keys(filtered)
    .map((id) => MONSTER_BY_ID[id])
    .filter(Boolean)
    .sort((a, b) => {
      const score = (m) => {
        let s = 0;
        const tags = m.tags || [];
        if (tags.includes('trap') || tags.includes('detect')) s += 40;
        if (tags.includes('tank') || tags.includes('tankette')) s += 28;
        if (tags.includes('silence') || tags.includes('stun')) s += 22;
        if (tags.includes('utility')) s += 12;
        if (tags.includes('dps')) s += 10;
        s += (8 - m.cost) * 4;
        s -= m.rarity * 2; // tránh nhồi mythic sớm khi có maxMythic
        return s;
      };
      return score(b) - score(a) || a.cost - b.cost;
    });

  for (const m of ranked) {
    const have = filtered[m.id] || 0;
    for (let i = 0; i < have; i++) {
      if ((loadout[m.id] || 0) >= have) break;
      const res = tryAddChallengeLoadout(ch, loadout, filtered, m.id, costCap, level, poolMult);
      if (!res.ok) break;
      loadout = res.loadout;
    }
  }
  return sanitizeChallengeLoadout(ch, loadout);
}

/** Vault session: kho người chơi + quái forced (cho mượn nếu chưa sở hữu). */
export function buildChallengeVault(playerState, ch) {
  const vault = { ...(playerState.inventory || {}) };
  for (const [id, n] of Object.entries(ch.forcedLoadout || {})) {
    vault[id] = Math.max(vault[id] || 0, n);
  }
  return vault;
}

export function createChallengeRunState(playerState, challengeId) {
  const ch = getChallenge(challengeId);
  if (!ch) return null;
  const map = getChallengeMap(ch.mapId);
  if (!map) return null;

  // Cap/pool theo từng thử thách — không cộng mapUpgrade người chơi
  const refCap = Math.max(
    1,
    Number(ch.costCap) || Number(map.baseCostCap) || Number(map.costCap) || 8
  );
  const poolMult = Math.max(1, Number(ch.poolMult) || LOADOUT_POOL_MULT);
  map.refCostCap = refCap;
  map.costCap = placeMaxCost(refCap);
  map.upgradeLevel = 0;
  map.poolMult = poolMult;
  if (ch.treasureHp != null) map.treasureHp = ch.treasureHp;

  let wave = buildChallengeWave(ch);
  wave = assignHeroFormation(wave, map);

  const challengeVault = buildChallengeVault(playerState, ch);
  let loadout;
  if (ch.forcedLoadout && ch.lockLoadout) {
    loadout = { ...ch.forcedLoadout };
  } else if (ch.forcedLoadout) {
    loadout = sanitizeChallengeLoadout(ch, { ...ch.forcedLoadout });
    // Cho phép thêm từ vault nếu còn pool
    const suggested = suggestChallengeLoadout(ch, challengeVault, map.refCostCap, challengeId, poolMult);
    loadout = sanitizeLoadout(suggested, challengeVault, map.refCostCap, challengeId, poolMult);
    loadout = sanitizeChallengeLoadout(ch, loadout);
  } else {
    loadout = sanitizeLoadout(
      playerState.lastLoadout,
      challengeVault,
      map.refCostCap,
      challengeId,
      poolMult
    );
    loadout = sanitizeChallengeLoadout(ch, loadout);
    if (!Object.values(loadout || {}).some((n) => n > 0)) {
      loadout = suggestChallengeLoadout(ch, challengeVault, map.refCostCap, challengeId, poolMult);
    }
  }

  return {
    level: challengeId,
    /**
     * Quái + Hero: catalog base — không scale theo ải/chương.
     */
    scaleLevel: 0,
    monsterStatMul: CHALLENGE_MONSTER_STAT_MUL,
    mode: 'challenge',
    challengeId,
    challenge: ch,
    map,
    rooms: [map],
    wave,
    waveTheme: ch.wave?.theme || ch.name,
    waveTip: ch.wave?.tip || map.tip,
    selectedMonsterId: null,
    loadout,
    challengeVault,
    lockLoadout: !!ch.lockLoadout,
    loadoutReady: false,
    appliedLoadoutKey: null,
    noBossSpells: !!ch.constraints?.noBossSpells,
    treasureHpOverride: map.treasureHp,
  };
}

/**
 * Evaluate side objectives after combat ends (or fail mid-fight).
 */
export function evaluateChallengeResult(ch, engine, meta = {}) {
  const objs = ch.objectives || [];
  const failed = [];
  const passed = [];
  const treasureRatio =
    engine.treasureMax > 0 ? engine.treasureHp / engine.treasureMax : 0;
  const stats = engine.challengeStats || {};
  const time = engine.time || 0;

  for (const o of objs) {
    let ok = true;
    if (o.type === 'treasure_ratio') ok = treasureRatio >= (o.min || 0.5);
    if (o.type === 'time_limit') ok = time <= (o.max || 90);
    if (o.type === 'tithes') ok = (stats.tithes || 0) >= (o.min || 4);
    if (o.type === 'hero_deaths') ok = (stats.heroDeaths || 0) >= (o.min || 3);
    if (o.type === 'no_boss_spells') ok = !(stats.spellsCast > 0);
    if (o.type === 'no_potion') ok = !(stats.usedPotion);
    if (o.type === 'max_units_placed') ok = (stats.maxUnits || 0) <= (o.max || 6);
    if (o.type === 'high_tile_time') ok = (stats.highTileTime || 0) <= (o.max || 3);
    if (o.type === 'boss_no_drain') ok = !(stats.bossDrained);
    if (o.type === 'kill_rogue_before_drain') {
      ok = (stats.roguesKilledBeforeDrain || 0) >= (o.min || 1);
    }
    if (ok) passed.push(o);
    else failed.push(o);
  }

  const mainWin = meta.result === 'win' || engine.result === 'win';
  return {
    ok: mainWin && failed.length === 0,
    passed,
    failed,
    treasureRatio,
    time,
  };
}

export function grantChallengeReward(state, ch) {
  ensureChallengeProgress(state);
  const r = ch.reward || {};
  const already = !!state.challengeProgress.cleared[ch.id];
  // First clear: full souls/gems + title. Replay: keep title unlock only, no farm.
  if (!already) {
    if (r.souls) state.souls = (state.souls || 0) + r.souls;
    if (r.gems) state.gems = (state.gems || 0) + r.gems;
  }
  if (r.titleId && CHALLENGE_TITLES[r.titleId]) {
    if (!state.titles.includes(r.titleId)) state.titles.push(r.titleId);
    if (!state.equippedTitle) state.equippedTitle = r.titleId;
  }
  state.challengeProgress.cleared[ch.id] = true;
  syncChallengeUnlocks(state);
  return already ? { ...r, souls: 0, gems: 0, replay: true } : r;
}

export function titleName(titleId) {
  return CHALLENGE_TITLES[titleId]?.name || titleId || '';
}

/**
 * Thử Thách không scale theo ải — trả 0 để display/combat dùng catalog rồi × monsterStatMul.
 */
export function challengeMonsterScaleLevel() {
  return 0;
}

/** Stage level dùng để scale quái trong 1 run (0 = challenge / không scale ải). */
export function monsterStageLevelForRun(run) {
  if (!run) return 1;
  if (run.mode === 'challenge') return 0;
  return Math.max(1, Number(run.level) || 1);
}

/** Hệ số HP/ATK thêm (hard / challenge). */
export function monsterStatMulForRun(run) {
  const mul = Number(run?.monsterStatMul);
  if (Number.isFinite(mul) && mul > 0) return mul;
  return 1;
}

/** Thử Thách không dùng cấp nâng quái từ progress người chơi. */
export function monsterUpgradeLevelForRun(run, state, monsterId) {
  if (run?.mode === 'challenge') return 0;
  return Number(state?.monsterUpgrades?.[monsterId]) || 0;
}

export function challengeConstraintSummary(ch) {
  const cons = ch?.constraints || {};
  const parts = [];
  if (ch.lockLoadout) parts.push('loadout khóa');
  if (ch.forcedLoadout) parts.push('có loadout bắt buộc');
  for (const role of cons.banRoles || []) parts.push(`cấm ${role}`);
  for (const t of cons.banTags || []) parts.push(`cấm tag:${t}`);
  if (cons.maxRarity != null) parts.push(`≤${cons.maxRarity}★`);
  if (cons.banMythic) parts.push('cấm Mythic');
  if (cons.banLegendary) parts.push('cấm Legendary');
  if (cons.banRainbow) parts.push('cấm Rainbow');
  if (cons.maxMythic != null) parts.push(`≤${cons.maxMythic} Mythic`);
  if (cons.maxLegendary != null) parts.push(`≤${cons.maxLegendary} Legendary`);
  if (cons.maxEpic != null) parts.push(`≤${cons.maxEpic} Epic`);
  if (cons.maxUnits != null) parts.push(`≤${cons.maxUnits} unit sân`);
  if (cons.onlyLowCeilingOrCheap) parts.push('low-ceiling / cost≤2');
  if (cons.requireMonster) parts.push('bắt buộc Oan Hồn Hiến Tế');
  if (cons.fillerMaxRarity != null) parts.push(`filler ≤${cons.fillerMaxRarity}★`);
  if (cons.minLowStarUnits != null) parts.push(`≥${cons.minLowStarUnits} unit thấp ★`);
  if (cons.noBossSpells) parts.push('cấm chiêu boss');
  if (cons.allowPotion === false) parts.push('cấm potion');
  if (ch.costCap) parts.push(`Cap ${ch.costCap}`);
  if (ch.poolMult) parts.push(`Pool ×${ch.poolMult}`);
  return parts.join(' · ') || 'Không ràng buộc đặc biệt';
}

