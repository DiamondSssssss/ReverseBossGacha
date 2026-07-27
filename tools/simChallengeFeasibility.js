/**
 * Offline feasibility check for Challenge Mode.
 * Run: node tools/simChallengeFeasibility.js
 */
import { CHALLENGES } from '../js/data/challenges.js';
import { MONSTERS, MONSTER_BY_ID } from '../js/data/monsters.js';
import { HERO_BY_ID } from '../js/data/heroes.js';
import {
  createChallengeRunState,
  challengeHardBlockReason,
  validateChallengeLoadout,
  suggestChallengeLoadout,
} from '../js/core/challenge.js';
import { loadoutMaxPoolCost, loadoutPoolCost } from '../js/core/loadout.js';
import { displayMonsterStats } from '../js/core/monsterUpgrade.js';

function makeRichInv() {
  const inv = {};
  for (const m of MONSTERS) inv[m.id] = 5;
  return inv;
}

function makeMidInv() {
  const inv = {};
  for (const m of MONSTERS) {
    if (m.rarity <= 4) inv[m.id] = 4;
    else if (m.rarity === 5) inv[m.id] = 1;
    else inv[m.id] = 0;
  }
  inv.blood_tithe_wraith = 1;
  for (const m of MONSTERS) {
    if (m.rarity === 6 && (m.tags || []).includes('tank')) inv[m.id] = 1;
  }
  return inv;
}

function heroStats(ch) {
  let hp = 0;
  let atk = 0;
  let n = 0;
  const byWave = {};
  for (const sq of ch.wave?.squads || []) {
    const wi = sq.wave || 1;
    byWave[wi] = (byWave[wi] || 0) + (sq.ids?.length || 0);
    for (const id of sq.ids || []) {
      const h = HERO_BY_ID[id];
      if (!h) continue;
      hp += h.hp || h.maxHp || 0;
      atk += h.atk || 0;
      n++;
    }
  }
  return { n, hp, atk, byWave };
}

function eligibleMonsters(ch, inv) {
  return MONSTERS.filter((m) => (inv[m.id] || 0) > 0 && !challengeHardBlockReason(ch, m));
}

function monCombat(m, scaleLevel, upLv = 2) {
  const st = displayMonsterStats(m, upLv, scaleLevel);
  return { hp: st.hp, atk: st.atk };
}

function greedyPlace(run, loadout) {
  const map = run.map;
  const scale = run.scaleLevel || 32;
  const cells = [];
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      const key = `${c},${r}`;
      if (map.blocked?.has?.(key)) continue;
      if (map.noPlace?.has?.(key)) continue;
      if (map.gate?.some((g) => g.col === c && g.row === r)) continue;
      if (map.treasure?.some((t) => t.col === c && t.row === r)) continue;
      if (map.walkable && map.walkable[r] && !map.walkable[r][c]) continue;
      cells.push({ c, r });
    }
  }
  cells.sort((a, b) => Math.abs(a.c - map.cols / 2) - Math.abs(b.c - map.cols / 2));

  const order = Object.entries(loadout || {})
    .flatMap(([id, n]) => Array(n).fill(id))
    .map((id) => {
      const m = MONSTER_BY_ID[id];
      const st = m ? monCombat(m, scale, 2) : { hp: 0, atk: 0 };
      return { id, cost: m?.cost || 1, m, hp: st.hp, atk: st.atk };
    })
    .sort((a, b) => b.cost - a.cost || b.hp - a.hp);

  let used = 0;
  const ids = [];
  let monHp = 0;
  let monAtk = 0;
  const maxU = run.challenge?.constraints?.maxUnits;
  for (const u of order) {
    if (maxU != null && ids.length >= maxU) break;
    if (used + u.cost > map.costCap) continue;
    if (ids.length >= cells.length) break;
    ids.push(u.id);
    used += u.cost;
    monHp += u.hp;
    monAtk += u.atk;
  }
  return { count: ids.length, ids, used, monHp, monAtk };
}

function estimateFeasibility(ch, inv) {
  const state = {
    inventory: inv,
    mapUpgrade: 20,
    dungeonLevel: 50,
    lastLoadout: {},
    challengeProgress: { unlocked: [], cleared: {}, bestTime: {} },
  };
  const run = createChallengeRunState(state, ch.id);
  const hs = heroStats(ch);
  const vault = run.challengeVault || inv;
  const pool = loadoutMaxPoolCost(run.map.refCostCap, ch.id, run.map.poolMult);
  const elig = eligibleMonsters(ch, vault);
  const scale = run.scaleLevel;

  let loadout = run.loadout || {};
  if (!ch.lockLoadout) {
    loadout = suggestChallengeLoadout(ch, vault, run.map.refCostCap, ch.id, run.map.poolMult);
  }
  const poolCost = loadoutPoolCost(loadout);
  const place = greedyPlace(run, loadout);
  const vLoad = validateChallengeLoadout(ch, loadout, []);
  const vPlace = validateChallengeLoadout(
    ch,
    loadout,
    place.ids.map((id, i) => ({ monsterId: id, col: i % 10, row: Math.floor(i / 10) + 1 }))
  );

  let heroDps = 0;
  let heroPush = 0;
  for (const sq of ch.wave?.squads || []) {
    for (const id of sq.ids || []) {
      const h = HERO_BY_ID[id];
      if (!h) continue;
      heroDps += (h.atk || 0) * (h.atkSpeed || 1) * 0.5;
      heroPush += h.speed || 1;
    }
  }
  const treasure = run.map.treasureHp || 120;
  const waves = Object.keys(hs.byWave).length || 1;
  const poolExtra = Math.max(0, poolCost - place.used);
  const reinforce = 1 + Math.min(1.2, poolExtra / Math.max(1, place.used)) * 0.55;
  // Treasure heuristic: leak only if wall clearly fails
  const wallEhp = (place.monHp * 1.2 + place.count * 140) * reinforce;
  const effectiveDps = heroDps * (0.4 + 0.18 * Math.min(waves, 3));
  const fightTime = 50 + waves * 26;
  const dmgToWall = effectiveDps * fightTime * 0.55;
  const spill = Math.max(0, dmgToWall - wallEhp);
  const leakRatio = spill > wallEhp * 0.15 ? Math.min(0.55, spill / Math.max(1, dmgToWall)) : 0.02;
  const leakDrain = hs.n * leakRatio * 5 * 2.2;
  const treasureLeft = treasure - Math.min(treasure * 0.9, spill * 0.05 + leakDrain);

  const issues = [];
  if (elig.length < 10 && !ch.lockLoadout) issues.push(`ít quái hợp lệ (${elig.length})`);
  if (poolCost <= 0) issues.push('loadout rỗng');
  if (poolCost > pool + 0.01) issues.push(`vượt pool ${poolCost}>${pool}`);
  if (ch.forcedLoadout) {
    const fc = loadoutPoolCost(ch.forcedLoadout);
    if (fc > pool) issues.push(`forced vượt pool ${fc}>${pool}`);
  }
  const hardErr = (vLoad.errors || []).filter(
    (e) => !e.startsWith('Cần ≥') && !e.includes('unit trên sân')
  );
  if (hardErr.length) issues.push(`loadout: ${hardErr.join('; ')}`);
  if ((vPlace.errors || []).some((e) => e.includes('unit trên sân'))) {
    issues.push('vượt maxUnits khi đặt');
  }
  if (place.count < 4) issues.push(`đặt quá ít (${place.count})`);
  if (place.used < run.map.costCap * 0.5) issues.push(`lấp cap kém ${place.used}/${run.map.costCap}`);

  const hpRatio = place.monHp / Math.max(1, hs.hp);
  if (hpRatio < 0.18) issues.push(`HP quái yếu (${place.monHp} vs hero ${hs.hp})`);
  if (hpRatio < 0.35 && treasureLeft < treasure * 0.35) {
    issues.push(`kho áp lực (~${Math.round(treasureLeft)}/${treasure})`);
  }

  if (ch.constraints?.minLowStarUnits) {
    const lowMax = ch.constraints.lowStarMaxRarity || 3;
    const low = Object.entries(loadout).reduce((s, [id, n]) => {
      const m = MONSTER_BY_ID[id];
      return s + (m && m.rarity <= lowMax ? n : 0);
    }, 0);
    if (low < ch.constraints.minLowStarUnits) {
      issues.push(`thiếu low-star ${low}/${ch.constraints.minLowStarUnits}`);
    }
  }
  if (ch.objectives?.some((o) => o.type === 'tithes')) {
    const fodder = Object.entries(loadout).reduce((s, [id, n]) => {
      const m = MONSTER_BY_ID[id];
      return s + (m && m.cost <= 2 && id !== 'blood_tithe_wraith' ? n : 0);
    }, 0);
    const need = ch.objectives.find((o) => o.type === 'tithes')?.min || 4;
    if (fodder < need) issues.push(`fodder hiến tế thiếu ${fodder}<${need}`);
  }

  // Objective: hero_deaths — need enough damage
  if (ch.objectives?.some((o) => o.type === 'hero_deaths')) {
    const need = ch.objectives.find((o) => o.type === 'hero_deaths')?.min || 3;
    const killPower = place.monAtk * fightTime * 0.4;
    if (killPower < hs.hp * (need / hs.n) * 0.5) {
      issues.push(`khó đủ kill ${need} hero (DPS mỏng)`);
    }
  }

  let verdict = 'OK';
  const fatal = issues.some(
    (i) =>
      i.includes('forced vượt') ||
      i.includes('loadout rỗng') ||
      i.startsWith('loadout:') ||
      i.includes('thiếu low-star') ||
      i.includes('fodder hiến tế')
  );
  if (fatal) verdict = 'IMPOSSIBLE';
  else if (issues.length >= 3) verdict = 'VERY_HARD';
  else if (issues.length >= 1) verdict = 'HARD';

  // Win chance heuristic 0-100
  const tRatio = Math.max(0, treasureLeft) / treasure;
  const fill = place.used / run.map.costCap;
  let score = 35 + hpRatio * 80 + tRatio * 40 + fill * 15 - issues.length * 8;
  score = Math.max(5, Math.min(92, Math.round(score)));

  return {
    id: ch.id,
    name: ch.name,
    verdict,
    issues,
    score,
    heroes: hs.n,
    waves,
    heroHp: hs.hp,
    scale,
    cap: run.map.costCap,
    pool,
    poolCost,
    placeUsed: place.used,
    placed: place.count,
    monHp: place.monHp,
    elig: elig.length,
    treasure,
    treasureLeftEst: Math.round(treasureLeft),
    bans: (ch.constraints?.banRoles || []).join(',') || '-',
  };
}

console.log('=== CHALLENGE FEASIBILITY (sau fix scaleLevel) ===\n');

for (const [label, inv] of [
  ['RICH', makeRichInv()],
  ['MID (~ải 35)', makeMidInv()],
]) {
  console.log(`-- ${label} --`);
  let ok = 0;
  let hard = 0;
  let bad = 0;
  for (const ch of CHALLENGES) {
    const r = estimateFeasibility(ch, inv);
    const mark =
      r.verdict === 'OK' ? '✓' : r.verdict === 'HARD' ? '~' : r.verdict === 'VERY_HARD' ? '!' : '✗';
    if (r.verdict === 'OK') ok++;
    else if (r.verdict === 'HARD') hard++;
    else bad++;
    console.log(
      `${mark} CH${r.id} ${r.name} [${r.verdict}] win~${r.score}% scale=${r.scale} ${r.heroes}h/${r.waves}w cap${r.cap} pool ${r.poolCost}/${r.pool} place ${r.placed}u/${r.placeUsed}c monHP ${r.monHp} heroHP ${r.heroHp} T~${r.treasureLeftEst}/${r.treasure}`
    );
    if (r.issues.length) console.log(`    → ${r.issues.join(' | ')}`);
  }
  console.log(`  summary: OK=${ok} HARD=${hard} BAD=${bad}\n`);
}

console.log('Ghi chú: heuristic combat (không phải playtest tay).');
console.log('IMPOSSIBLE = rule/loadout gãy. HARD/VERY_HARD = khó nhưng vẫn có đường thắng nếu chơi tốt.');
