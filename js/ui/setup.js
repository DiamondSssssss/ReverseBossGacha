import {
  TERRAIN_HINTS,
  TERRAIN_LABELS,
  RARITY_COLORS,
  HERO_CLASS_LABELS,
} from '../data/constants.js?v=122';
import { MONSTER_BY_ID, MONSTERS } from '../data/monsters.js?v=122';
import { monsterScaleForLevel } from '../data/heroes.js?v=122';
import { terrainAt, isPlaceable } from '../data/maps.js?v=122';
import { findPath, buildBlockedFromMap } from '../core/pathfinding.js?v=122';
import {
  mapUsedCost,
  placeMonster,
  removePlacement,
  totalPlacements,
} from '../core/dungeon.js?v=122';
import {
  loadoutMaxPoolCost,
  loadoutPoolCost,
  loadoutUnitCount,
  loadoutTypeCount,
  loadoutPoolMultForLevel,
  sanitizeLoadout,
  suggestLoadout,
  tryAddToLoadout,
  tryRemoveFromLoadout,
} from '../core/loadout.js?v=122';
import { monsterSpriteUrl, heroSpriteUrl } from '../render/sprites.js?v=122';
import { attachSetupBoardFx } from './setupBoardFx.js?v=122';
import { playGhostWalk } from './setupPreview.js?v=122';
import { saveState } from '../core/storage.js?v=122';
import {
  hideMonsterTip,
  monsterTipHtml,
} from './monsterTip.js?v=122';
import {
  displayMonsterStats,
} from '../core/monsterUpgrade.js?v=122';
import {
  validateChallengeLoadout,
  tryAddChallengeLoadout,
  sanitizeChallengeLoadout,
  suggestChallengeLoadout,
  challengeHardBlockReason,
  challengeConstraintSummary,
  monsterStageLevelForRun,
  monsterUpgradeLevelForRun,
  monsterStatMulForRun,
} from '../core/challenge.js?v=122';
import {
  hardRarityBlockReason,
  hardRaritySummary,
  sanitizeHardLoadout,
  suggestHardLoadout,
  tryAddHardLoadout,
  validateHardLoadout,
} from '../data/hardMode.js?v=122';
import {
  addMonsterDeployments,
  getEquippedMonsterAppearance,
} from '../core/monsterSkins.js?v=122';

function shortName(name) {
  if (!name) return '?';
  const parts = name.split(/\s+/);
  return parts.slice(-2).join(' ');
}

function heroRoleCue(h) {
  const ai = h.ai_behavior || {};
  switch (ai.movementStyle) {
    case 'STEALTH_AMBUSH':
    case 'FLANKING':
      return 'Lách sườn / đâm tuyến sau';
    case 'KITING':
    case 'KEEP_DISTANCE':
      return 'Giữ khoảng cách / thả diều';
    case 'TANK_WALL':
      return 'Tank giữ choke';
    case 'SUICIDE_CHARGE':
      return 'Cảm tử mở giao tranh';
    case 'BULL_RUSH':
    case 'CHARGER':
      return 'Lao thẳng phá tuyến';
    case 'ZONING_ORBIT':
      return 'Đi vòng chiếm ô mạnh';
    default:
      return HERO_CLASS_LABELS[h.class] || h.class;
  }
}

function heroDangerCue(h) {
  const ai = h.ai_behavior || {};
  switch (ai.targetPriority) {
    case 'TREASURE_RUSH':
      return 'Thấy khe hở là lao vào Kho';
    case 'BACKLINE_DIVE':
    case 'HIGH_THREAT':
      return 'Ưu tiên dí carry / support';
    case 'LOWEST_HP_ALLOY':
      return 'Săn mục tiêu thấp máu';
    case 'CROWD_DENSEST':
      return 'Thích xả vào cụm đông';
    case 'AOE_BUFF_CARRIER':
      return 'Bám vùng buff / bảo kê lõi';
    default:
      return h.stealth ? 'Có thể lẻn qua tuyến đầu' : 'Gây áp lực lane trực diện';
  }
}

function heroCounterCue(h) {
  const ai = h.ai_behavior || {};
  if (h.skills?.includes('REVEAL')) return 'Khắc chế: tránh phụ thuộc tàng hình';
  if (h.skills?.includes('HEAL_ALLY') || h.skills?.includes('SHIELD_ALLY')) {
    return 'Khắc chế: focus support / anti-heal';
  }
  if (h.skills?.includes('STASIS_REVIVE') || h.skills?.includes('REVIVE')) {
    return 'Khắc chế: giữ burst cho nhịp sống lại';
  }
  if (ai.movementStyle === 'STEALTH_AMBUSH' || h.stealth) return 'Khắc chế: reveal / taunt / bẫy';
  if (ai.movementStyle === 'KITING' || ai.movementStyle === 'KEEP_DISTANCE') {
    return 'Khắc chế: gap-close / silence';
  }
  if (ai.movementStyle === 'TANK_WALL') return 'Khắc chế: DoT / phá khiên / anti-heal';
  if (ai.movementStyle === 'SUICIDE_CHARGE') return 'Khắc chế: giết sớm từ xa / kéo lệch cụm';
  return 'Khắc chế: chặn đúng lane và đổi mục tiêu sớm';
}

function stageWarningCues(run) {
  const cues = [];
  const classes = [...new Set(run.wave.map((h) => h.class))];
  const stealth = run.wave.some((h) => h.stealth || h.ai_behavior?.movementStyle === 'STEALTH_AMBUSH');
  const supportHeavy = run.wave.some((h) => h.skills?.includes('HEAL_ALLY') || h.skills?.includes('SHIELD_ALLY'));
  const treasureRush = run.wave.some((h) => h.ai_behavior?.targetPriority === 'TREASURE_RUSH');
  const crowdBurst = run.wave.some((h) => h.ai_behavior?.targetPriority === 'CROWD_DENSEST');

  if (stealth) cues.push('Có sát thủ lách sườn — canh lane phụ, reveal và taunt.');
  if (supportHeavy) cues.push('Có support/healer — đừng để giao tranh kéo dài miễn phí.');
  if (treasureRush) cues.push('Có hero lao Kho — phải giữ choke và không bỏ lane trống.');
  if (crowdBurst) cues.push('Có AoE trừng phạt cụm đông — đừng dồn quái một cục.');
  if (classes.includes('TANK') || classes.includes('WARRIOR')) cues.push('Tuyến đầu khá dày — chuẩn bị DoT, phá khiên hoặc anti-heal.');
  if (classes.includes('MAGE') && !crowdBurst) cues.push('Có phép tầm xa — silence hoặc áp sát sớm sẽ lời.');
  if (classes.includes('ARCHER')) cues.push('Có tầm xa giữ góc — cần gap-close hoặc ép chúng đổi vị trí.');

  return [...new Set(cues)].slice(0, 3);
}

/** Cap gốc cho pool loadout (map.costCap là Cap sân = 3×). */
function loadoutRefCap(map) {
  return Math.max(1, Number(map.refCostCap) || Number(map.costCap) || 1);
}

const BUFF_KIND_VI = {
  ATK_UP: 'tăng công',
  DEF_UP: 'tăng giáp (nhận ít dame hơn)',
  SPEED_UP: 'tăng tốc',
  SPEED_DOWN: 'giảm tốc',
  HEAL_TICK: 'hồi máu dần',
  REVEAL_AURA: 'soi tàng hình',
  SILENCE_ZONE: 'câm chú',
  DEF_SHRED_ZONE: 'xé giáp',
  HEAL_CUT_ZONE: 'cắt hồi',
  FIRE_ZONE: 'vùng lửa',
  ICE_ZONE: 'vùng băng',
  POISON_ZONE: 'vùng độc',
};

function formatBuffLine(b) {
  const kind = BUFF_KIND_VI[b.kind] || b.kind;
  const pct =
    typeof b.value === 'number' && b.value !== 1 && !String(b.kind).includes('HEAL')
      ? ` ×${b.value}`
      : '';
  if (b.side === 'monster') {
    return `▲ Buff QUÁI (${kind}${pct}): đặt quái đứng trên ô này mới được — rời ô thì mất`;
  }
  if (b.side === 'hero') {
    return `! Buff HERO (${kind}${pct}): hero đi/đứng lên ô này trong trận mới được — bạn không đặt được hero`;
  }
  return `◆ Buff CHUNG (${kind}${pct}): ai đang đứng trên ô đều hưởng`;
}

function cellTooltip(map, col, row, ch) {
  if (ch === '#' || ch === 'o') return ch === 'o' ? 'Chướng ngại' : 'Tường';
  if (ch === 'G') return 'Cổng — Hero vào đây';
  if (ch === 'T') return 'Kho báu';
  if (ch === 'x' || map.noPlace?.has(`${col},${row}`)) {
    const buffs = map.buffIndex[`${col},${row}`] || [];
    const parts = ['Hành lang — không đặt quái'];
    for (const b of buffs) parts.push(formatBuffLine(b));
    return parts.join(' · ');
  }
  const terrain = terrainAt(map, col, row);
  const buffs = map.buffIndex[`${col},${row}`] || [];
  const parts = [TERRAIN_LABELS[terrain] || TERRAIN_HINTS[terrain] || 'Sàn'];
  for (const b of buffs) parts.push(formatBuffLine(b));
  if (terrain === 'WATER') {
    parts.push(
      'Ô nước (~): quái Buff nước đứng đây +40% ATK/HP — cạn bị −30% ATK; Hero đi qua bị chậm'
    );
  } else if (terrain === 'DARK') {
    parts.push(
      'Ô tối (d): quái Buff tối đứng đây +100% ATK — ngoài tối −35% ATK; Hero giảm tầm'
    );
  } else if (terrain === 'FIRE') {
    parts.push(
      'Ô lửa (f): quái Buff lửa đứng đây +45% ATK — nước/băng bị nerf nặng; Hero có thể bị đốt'
    );
  } else if (terrain === 'ICE') {
    parts.push(
      'Ô băng (i): quái Buff băng đứng đây +40% ATK — lửa bị nerf; Hero bị chậm'
    );
  } else if (terrain === 'POISON') {
    parts.push(
      'Ô độc (p): quái Buff độc đứng đây +40% ATK — ngoài độc bị yếu; Hero có thể nhiễm độc'
    );
  } else if (terrain === 'OIL') {
    parts.push(
      'Ô dầu (q): Hero chậm — lửa/sét kích hoạt combo nguy hiểm; quái hệ lửa hưởng lợi'
    );
  } else if (terrain === 'LOW_CEILING') {
    parts.push(
      'Ô trần thấp (l): quái Sợ trần cao đứng đây +200% ATK — trần cao bị −50%'
    );
  } else if (terrain === 'HIGH') {
    parts.push('Ô trần cao (h): quái Sợ trần cao đứng đây −50% ATK');
  }
  return parts.join(' · ');
}

function hintPath(map) {
  const start = map.gate[0];
  const goal = map.treasure[0];
  const blocked = buildBlockedFromMap(map);
  for (const t of map.treasure) blocked.delete(`${t.col},${t.row}`);
  for (const g of map.gate) blocked.delete(`${g.col},${g.row}`);
  return findPath(start, goal, map.cols, map.rows, blocked) || [];
}

/** HTML: đội hình hero (thứ tự + ô cổng + chỉ số) */
function heroFormationHtml(wave) {
  const march = [...wave]
    .sort((a, b) => (a.formation?.order || 0) - (b.formation?.order || 0))
    .map((h) => {
      const f = h.formation || {};
      const t = (f.spawnAt ?? h.spawnDelay ?? 0).toFixed(1);
      return `
        <div class="formation-slot ${h.class}">
          <span class="formation-order">#${f.order || '?'}</span>
          <img class="formation-sprite" src="${heroSpriteUrl(h.id, h.class, h.color)}" alt="" width="48" height="48" />
          <div class="formation-meta">
            <strong>${h.name}</strong>
            <span class="formation-cls">${HERO_CLASS_LABELS[h.class] || h.class}${h.stealth ? ' · Tàng hình' : ''}</span>
            <span class="formation-role">${heroRoleCue(h)}</span>
            <span class="formation-stats"><b>Nguy</b> ${heroDangerCue(h)}</span>
            <span class="formation-stats"><b>Khắc</b> ${heroCounterCue(h)}</span>
            <span class="formation-stats">HP ${h.maxHp || h.hp} · ATK ${h.atk} · SPD ${h.speed}</span>
            <span class="formation-gate">Cổng (${f.col ?? '?'},${f.row ?? '?'}) · vào sau ${t}s</span>
          </div>
        </div>`;
    })
    .join('');

  return `
    <div class="hero-formation">
      <div class="hero-formation-head">
        <h3>Đội hình & chi tiết Hero</h3>
        <p class="muted">Thứ tự vào · chỉ số · ô cổng — đọc rồi chọn loadout quái bên dưới.</p>
      </div>
      <div class="formation-march" aria-label="Đội hình Hero">${march}</div>
    </div>`;
}

/** Mini map với marker đội hình hero tại cổng */
function scoutMapPreviewHtml(map, wave, pathHint) {
  const pathSet = new Set(pathHint.map((p) => `${p.col},${p.row}`));
  const heroesByCell = {};
  for (const h of wave) {
    const f = h.formation;
    if (!f) continue;
    const key = `${f.col},${f.row}`;
    if (!heroesByCell[key]) heroesByCell[key] = [];
    heroesByCell[key].push(h);
  }

  const cells = [];
  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      const ch = map.tiles[row][col];
      const key = `${col},${row}`;
      const terrain = terrainAt(map, col, row);
      const isWall = ch === '#' || ch === 'o';
      const isNoPlace = ch === 'x' || map.noPlace?.has(key);
      const heroesHere = heroesByCell[key] || [];
      let cls = 'scout-cell';
      if (isWall) cls += ' wall';
      else if (ch === 'G') cls += ' gate';
      else if (ch === 'T') cls += ' treasure';
      else {
        cls += ` terrain-${terrain}`;
        if (isNoPlace) cls += ' no-place';
      }
      if (pathSet.has(key) && !isWall) cls += ' path';
      if (heroesHere.length) cls += ' has-hero';

      const marks =
        heroesHere.length > 0
          ? `<span class="scout-hero-stack">${heroesHere
              .map(
                (h) =>
                  `<span class="scout-hero-dot ${h.class}" title="#${h.formation.order} ${h.name}">${h.formation.order}</span>`
              )
              .join('')}</span>`
          : ch === 'G'
            ? '<span class="scout-mark">G</span>'
            : ch === 'T'
              ? '<span class="scout-mark">T</span>'
              : isNoPlace
                ? '<span class="scout-mark noplace">×</span>'
                : '';

      cells.push(`<div class="${cls}" style="grid-column:${col + 1};grid-row:${row + 1}">${marks}</div>`);
    }
  }

  return `
    <div class="scout-map-preview">
      <div class="scout-map-grid" style="grid-template-columns:repeat(${map.cols},1fr);grid-template-rows:repeat(${map.rows},1fr);aspect-ratio:${map.cols}/${map.rows}">
        ${cells.join('')}
      </div>
      <p class="muted scout-map-cap">Số trên cổng = thứ tự Hero vào · đường mờ = path gợi ý tới Kho</p>
    </div>`;
}

function ownedList(inventory) {
  return MONSTERS.filter((m) => (inventory[m.id] || 0) > 0).sort(
    (a, b) => b.rarity - a.rarity || a.cost - b.cost || a.name.localeCompare(b.name, 'vi')
  );
}

export function renderScout(root, ctx) {
  const { run, go, state, toast, applyLoadout } = ctx;
  if (!run) {
    root.innerHTML = `<p class="muted">Chưa có run. Quay lại Hub.</p>`;
    return;
  }

  const map = run.map;
  const pathHint = hintPath(map);
  const poolMult = map.poolMult || loadoutPoolMultForLevel(run.level);
  const vault =
    run.mode === 'challenge' && run.challengeVault
      ? run.challengeVault
      : state.inventory || {};
  const lockLoadout = !!(run.lockLoadout || run.challenge?.lockLoadout);

  if (lockLoadout && run.challenge?.forcedLoadout) {
    run.loadout = { ...run.challenge.forcedLoadout };
  } else if (!run.loadout) {
    run.loadout = sanitizeLoadout(
      state.lastLoadout,
      vault,
      loadoutRefCap(map),
      run.level,
      poolMult
    );
    if (run.mode === 'hard' && run.hardRarityLimits) {
      run.loadout = sanitizeHardLoadout(run.hardRarityLimits, run.loadout);
    }
    if (!loadoutUnitCount(run.loadout)) {
      run.loadout =
        run.mode === 'challenge' && run.challenge
          ? suggestChallengeLoadout(run.challenge, vault, loadoutRefCap(map), run.level, poolMult)
          : run.mode === 'hard' && run.hardRarityLimits
            ? suggestHardLoadout(run.hardRarityLimits, vault, loadoutRefCap(map), run.level, poolMult)
            : suggestLoadout(vault, loadoutRefCap(map), run.level, poolMult);
    }
  } else if (!lockLoadout) {
    run.loadout = sanitizeLoadout(run.loadout, vault, loadoutRefCap(map), run.level, poolMult);
    if (run.mode === 'challenge' && run.challenge) {
      run.loadout = sanitizeChallengeLoadout(run.challenge, run.loadout);
    } else if (run.mode === 'hard' && run.hardRarityLimits) {
      run.loadout = sanitizeHardLoadout(run.hardRarityLimits, run.loadout);
    }
  }

  let filterRole = 'all';

  const classes = [...new Set(run.wave.map((h) => h.class))];
  const tips = [];
  if (run.waveTip) tips.push(run.waveTip);
  if (map.tip) tips.push(map.tip);
  if (run.mode === 'challenge' && run.challenge) {
    tips.unshift(`Thử Thách CH${run.challengeId}: ${run.challenge.blurb}`);
    tips.unshift(`Giới hạn: ${challengeConstraintSummary(run.challenge)}`);
    for (const o of run.challenge.objectives || []) {
      if (o.label) tips.push(`Điều kiện: ${o.label}`);
    }
  } else if (run.mode === 'hard' && run.hardRules) {
    tips.unshift(`Khó: ${run.hardRules}`);
    if (run.hardRarityLimits) {
      tips.unshift(`Giới hạn mang theo: ${hardRaritySummary(run.hardRarityLimits)}`);
    }
    if (run.isReplay) tips.unshift('Replay — thắng không tăng tiến độ, thưởng giảm');
  } else if (run.isReplay) {
    tips.unshift('Replay — thắng không tăng tiến độ, thưởng giảm');
  }
  tips.push(...stageWarningCues(run));

  function loadoutPanelHtml() {
    const loadout = run.loadout || {};
    const isChallenge = run.mode === 'challenge' && run.challenge;
    const isHard = run.mode === 'hard' && run.hardRarityLimits;
    const stageLv = monsterStageLevelForRun(run);
    const statMul = monsterStatMulForRun(run);
    const stageLabel = isChallenge
      ? `CH${run.challengeId} · base`
      : `${run.mode === 'hard' ? 'Khó' : 'Thường'} · Ải ${stageLv}`;
    const pool = loadoutPoolCost(loadout);
    const refCap = loadoutRefCap(map);
    // Pool mult theo map — không nhầm stageLv (scale) với boss-fight pool
    const maxPool = loadoutMaxPoolCost(refCap, isChallenge ? 1 : run.level, poolMult);
    const units = loadoutUnitCount(loadout);
    const types = loadoutTypeCount(loadout);
    const placeCap = map.costCap;
    const owned = ownedList(vault).filter((m) => {
      if (filterRole === 'all') return true;
      const tags = m.tags || [];
      if (filterRole === 'trap') return tags.includes('trap') || tags.includes('potion');
      if (filterRole === 'utility') {
        return tags.some((t) => ['utility', 'silence', 'detect', 'slow', 'potion', 'aura', 'rainbow'].includes(t));
      }
      if (filterRole === 'dps') return tags.includes('dps') || tags.includes('boss');
      if (filterRole === 'tank') return tags.includes('tank') || tags.includes('tankette');
      return true;
    });

    const loadoutChips = Object.entries(loadout)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => {
        const m = MONSTER_BY_ID[id];
        if (!m) return '';
        const upLv = monsterUpgradeLevelForRun(run, state, id);
        const st = displayMonsterStats(m, upLv, stageLv, statMul);
        return `
          <button type="button" class="loadout-chip" data-remove="${id}" data-mid="${id}">
            <img src="${monsterSpriteUrl(id, m.color, m.rarity, getEquippedMonsterAppearance(state, id, m))}" alt="" width="36" height="36" />
            <span class="loadout-chip-meta">
              <strong>${shortName(m.name)}</strong>
              <span>C${m.cost} · ×${n}${upLv ? ` · ↑${upLv}` : ''}</span>
              <span class="pick-stats">HP ${st.hp} · ATK ${st.atk} <em class="stat-stage">${stageLabel}</em></span>
            </span>
            <span class="loadout-chip-x">−</span>
          </button>`;
      })
      .join('');

    const poolCards = owned
      .map((m) => {
        const have = vault[m.id] || 0;
        const inLoad = loadout[m.id] || 0;
        const left = have - inLoad;
        const hardBan = isChallenge
          ? challengeHardBlockReason(run.challenge, m)
          : isHard
            ? hardRarityBlockReason(run.hardRarityLimits, m)
            : null;
        const trial = isChallenge
          ? tryAddChallengeLoadout(run.challenge, loadout, vault, m.id, refCap, run.level, poolMult)
          : isHard
            ? tryAddHardLoadout(
                run.hardRarityLimits,
                loadout,
                vault,
                m.id,
                refCap,
                run.level,
                poolMult
              )
            : tryAddToLoadout(loadout, vault, m.id, refCap, run.level);
        const blocked = !!hardBan || (left > 0 && !trial.ok && trial.reason !== 'Hết số lượng trong kho');
        const full = left <= 0 || !!hardBan;
        const upLv = monsterUpgradeLevelForRun(run, state, m.id);
        const st = displayMonsterStats(m, upLv, stageLv, statMul);
        const banTitle = hardBan || (blocked ? trial.reason : '');
        return `
          <button type="button" class="loadout-pick ${full || blocked ? 'is-full' : ''} ${hardBan ? 'is-banned' : ''}" data-add="${m.id}" data-mid="${m.id}" ${full || blocked ? 'aria-disabled="true"' : ''} title="${banTitle || ''}">
            <img src="${monsterSpriteUrl(m.id, m.color, m.rarity, getEquippedMonsterAppearance(state, m.id, m))}" alt="" width="44" height="44" />
            <span class="stars" style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)}</span>
            <strong>${shortName(m.name)}</strong>
            <span class="muted">C${m.cost} · kho ×${have}${inLoad ? ` · +${inLoad}` : ''}${upLv ? ` · ↑${upLv}` : ''}</span>
            <span class="pick-stats">HP ${st.hp} · ATK ${st.atk} <em class="stat-stage">${stageLabel}</em></span>
            ${
              hardBan
                ? `<span class="pick-stats ban">${hardBan}</span>`
                : `<span class="pick-stats dim">SPD ${Number(st.speed).toFixed(2)} · RNG ${st.range} · gốc ${st.baseHp}/${st.baseAtk}</span>`
            }
          </button>`;
      })
      .join('');

    const stageBanner = isChallenge
      ? `Thử Thách — HP/ATK quái & hero đều <strong>catalog base</strong> (không scale ải / không nâng quái).`
      : `Chỉ số HP/ATK đang hiện theo <strong>ải ${stageLv}</strong> (×${monsterScaleForLevel(stageLv).toFixed(2)}) — đúng như trong trận.`;

    return {
      units,
      html: `
        <div class="loadout-head">
          <div>
            <p class="section-label" style="margin:0">${isChallenge ? 'Loadout Thử Thách' : 'Loadout của bạn'}</p>
            <h3 style="margin:2px 0 0;font-size:1.05rem">${
              lockLoadout ? 'Loadout bắt buộc (không đổi)' : 'Chọn quái mang vào xếp trận'
            }</h3>
            <p class="muted" style="margin:4px 0 0;font-size:0.75rem">
              Pool mang theo <strong>${pool}/${maxPool}</strong>
              · Cap sân <strong>${placeCap}</strong>
              · <strong>${types}</strong> loại
              · ${units} quái
            </p>
            <p class="muted" style="margin:4px 0 0;font-size:0.72rem">
              ${
                isChallenge
                  ? `Thử Thách: Cap gốc ${refCap} (cố định) · Pool ${poolMult}× = ${maxPool} · Sân ≤ ${placeCap}.`
                  : `Pool mang ${poolMult}× Cap gốc — trên sân chỉ ≤ Cap ${placeCap}; phần dư thả khi có slot.`
              }
            </p>
            ${
              isChallenge
                ? `<p class="muted" style="margin:4px 0 0;font-size:0.72rem;color:var(--seal-deep)">Giới hạn: ${challengeConstraintSummary(run.challenge)}</p>`
                : isHard
                  ? `<p class="muted" style="margin:4px 0 0;font-size:0.72rem;color:var(--seal-deep)">Giới hạn Khó: ${hardRaritySummary(run.hardRarityLimits)}</p>`
                  : ''
            }
            <p class="stat-stage-banner">${stageBanner}</p>
          </div>
          <div class="loadout-tools">
            ${
              lockLoadout
                ? ''
                : `<button type="button" class="ghost" id="btn-loadout-suggest">Gợi ý</button>
            <button type="button" class="ghost" id="btn-loadout-clear">Xóa</button>`
            }
          </div>
        </div>

        <div class="loadout-selected" id="loadout-selected">
          ${loadoutChips || '<p class="muted loadout-empty">Chưa chọn quái — chạm kho bên dưới để thêm.</p>'}
        </div>

        <div class="loadout-filters">
          <button type="button" class="filter-chip ${filterRole === 'all' ? 'active' : ''}" data-lrole="all">Tất cả</button>
          <button type="button" class="filter-chip ${filterRole === 'utility' ? 'active' : ''}" data-lrole="utility">Utility</button>
          <button type="button" class="filter-chip ${filterRole === 'trap' ? 'active' : ''}" data-lrole="trap">Bẫy</button>
          <button type="button" class="filter-chip ${filterRole === 'tank' ? 'active' : ''}" data-lrole="tank">Tank</button>
          <button type="button" class="filter-chip ${filterRole === 'dps' ? 'active' : ''}" data-lrole="dps">DPS</button>
        </div>

        <div class="loadout-pool">
          ${
            lockLoadout
              ? '<p class="muted">Màn này giao loadout sẵn — chỉ xếp trận với bộ bài trên.</p>'
              : poolCards || '<p class="muted">Kho trống — quay Gacha trước.</p>'
          }
        </div>

        <div class="unit-stat-panel loadout-stat-panel sticky-stat" id="loadout-stat-panel">
          <p class="muted" style="margin:0;font-size:0.75rem">Chạm / hover thẻ quái để xem mô tả chi tiết.</p>
        </div>
      `,
    };
  }

  function bindLoadout() {
    const panel = root.querySelector('#loadout-panel');
    if (!panel) return;
    const statPanel = panel.querySelector('#loadout-stat-panel');

    let lastPickId = '';

    function showPickInfo(el) {
      const id = el?.getAttribute?.('data-mid');
      if (!id || !statPanel) return;
      // Giữ tip cuối — không clear khi rời thẻ (tránh panel co/giãn → chớp hover)
      if (id === lastPickId && statPanel.classList.contains('has-unit')) return;
      lastPickId = id;
      const stageLv = monsterStageLevelForRun(run);
      const upLv = monsterUpgradeLevelForRun(run, state, id);
      // Tip: truyền stageLevel + tắt fallback dungeonLevel bằng upgrade override qua options
      statPanel.innerHTML = monsterTipHtml(id, state, {
        stageLevel: stageLv,
        upgradeLevel: upLv,
        statMul: monsterStatMulForRun(run),
        challengeMode: run.mode === 'challenge',
        challengeId: run.challengeId,
      });
      statPanel.classList.add('has-unit');
    }

    // Event delegation — chỉ cập nhật khi vào thẻ mới, không tắt khi rời thẻ
    panel.onpointerover = (e) => {
      const el = e.target.closest?.('[data-mid]');
      if (!el || !panel.contains(el)) return;
      showPickInfo(el);
    };
    panel.onpointerout = null;

    panel.querySelectorAll('[data-add]').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (lockLoadout) {
          toast('Loadout bị khóa trong thử thách này');
          return;
        }
        if (btn.classList.contains('is-full') || btn.getAttribute('aria-disabled') === 'true') {
          const why = btn.getAttribute('title');
          if (why) toast(why);
          return;
        }
        showPickInfo(btn);
        const id = btn.getAttribute('data-add');
        const refCap = loadoutRefCap(map);
        const res =
          run.mode === 'challenge' && run.challenge
            ? tryAddChallengeLoadout(
                run.challenge,
                run.loadout,
                vault,
                id,
                refCap,
                run.level,
                poolMult
              )
            : run.mode === 'hard' && run.hardRarityLimits
              ? tryAddHardLoadout(
                  run.hardRarityLimits,
                  run.loadout,
                  vault,
                  id,
                  refCap,
                  run.level,
                  poolMult
                )
              : tryAddToLoadout(run.loadout, vault, id, refCap, run.level, poolMult);
        if (!res.ok) {
          toast(res.reason);
          return;
        }
        run.loadout = res.loadout;
        btn.blur();
        refreshLoadout();
      };
    });

    panel.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (lockLoadout) {
          toast('Loadout bị khóa trong thử thách này');
          return;
        }
        const id = btn.getAttribute('data-remove');
        if (run.challenge?.forcedLoadout?.[id] && (run.loadout[id] || 0) <= run.challenge.forcedLoadout[id]) {
          toast('Không bỏ được quái bắt buộc');
          return;
        }
        showPickInfo(btn);
        const res = tryRemoveFromLoadout(run.loadout, id);
        if (res.ok) {
          run.loadout = res.loadout;
          btn.blur();
          refreshLoadout();
        }
      };
    });

    panel.querySelectorAll('[data-lrole]').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        filterRole = btn.getAttribute('data-lrole');
        refreshLoadout();
      };
    });

    const suggestBtn = panel.querySelector('#btn-loadout-suggest');
    if (suggestBtn) {
      suggestBtn.onclick = (e) => {
        e.preventDefault();
        const refCap = loadoutRefCap(map);
        run.loadout =
          run.mode === 'challenge' && run.challenge
            ? suggestChallengeLoadout(run.challenge, vault, refCap, run.level, poolMult)
            : run.mode === 'hard' && run.hardRarityLimits
              ? suggestHardLoadout(run.hardRarityLimits, vault, refCap, run.level, poolMult)
              : suggestLoadout(vault, refCap, run.level, poolMult);
        refreshLoadout();
        toast('Đã gợi ý loadout');
      };
    }

    const clearBtn = panel.querySelector('#btn-loadout-clear');
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        if (run.challenge?.forcedLoadout) {
          run.loadout = { ...run.challenge.forcedLoadout };
        } else {
          run.loadout = {};
        }
        refreshLoadout();
      };
    }
  }

  function refreshLoadout() {
    const page = root.querySelector('.scout-page');
    const pool = root.querySelector('.loadout-pool');
    const keepPageScroll = page ? page.scrollTop : 0;
    const keepPoolScroll = pool ? pool.scrollTop : 0;
    const { html, units } = loadoutPanelHtml();
    const panel = root.querySelector('#loadout-panel');
    if (panel) panel.innerHTML = html;

    const setupBtn = root.querySelector('#btn-to-setup');
    if (setupBtn) setupBtn.disabled = units < 1;

    bindLoadout();

    const restore = () => {
      if (page) page.scrollTop = keepPageScroll;
      const nextPool = root.querySelector('.loadout-pool');
      if (nextPool) nextPool.scrollTop = keepPoolScroll;
    };
    restore();
    requestAnimationFrame(restore);
  }

  // Shell một lần — phần trên không bị vẽ lại khi chọn quái
  const first = loadoutPanelHtml();
  const scoutKicker =
    run.mode === 'challenge'
      ? `Thử Thách CH${run.challengeId} · Trinh sát`
      : `${run.mode === 'hard' ? 'Khó' : 'Thường'} · Ải ${run.level}${
          run.isReplay ? ' · Replay' : ''
        } · Trinh sát`;
  root.innerHTML = `
    <div class="scout-page">
      <div class="scout-lead">
        <div class="kicker">${scoutKicker}</div>
        <h2>${map.name}</h2>
        <p class="wave-theme"><strong>${run.waveTheme || 'Wave Hero'}</strong></p>
        <p class="muted">${
          run.mode === 'challenge'
            ? 'Thử Thách: Cap cố định theo ải · chọn loadout theo giới hạn ★/loại → xếp trận.'
            : run.mode === 'hard'
              ? `Chế độ Khó${run.hardRules ? ` — ${run.hardRules}` : ''}. Loadout theo Cost → xếp trận.`
              : 'Xem địch → chọn <b>loadout</b> (không giới hạn loại, chỉ giới hạn Cost) → xếp trận.'
        }</p>
      </div>
      <div class="flow-legend scout-flow">
        <span class="flow-gate">CỔNG</span>
        <span class="flow-arr">→</span>
        <span><strong>${map.name}</strong> (${map.cols}×${map.rows})</span>
        <span class="flow-arr">→</span>
        <span class="flow-treasure">KHO</span>
      </div>
      <div class="counter-box">
        <h3>Khắc chế & địa hình</h3>
        <div class="counter-tips">
          ${tips.map((t) => `<span>${t}</span>`).join('') || '<span>Cân utility + DPS</span>'}
        </div>
      </div>

      <p class="section-label">Địch (${run.wave.length} Hero)</p>
      ${heroFormationHtml(run.wave)}
      ${scoutMapPreviewHtml(map, run.wave, pathHint)}

      <div class="loadout-panel" id="loadout-panel">${first.html}</div>

      <div class="row scout-actions">
        <button type="button" class="primary" id="btn-to-setup" style="flex:1" ${first.units < 1 ? 'disabled' : ''}>
          Xếp trận với loadout này
        </button>
        <button type="button" id="btn-back-hub">Sảnh</button>
      </div>
    </div>
  `;

  bindLoadout();
  root._cleanup = () => hideMonsterTip(true);

  root.querySelector('#btn-to-setup').onclick = () => {
    hideMonsterTip(true);
    let clean = sanitizeLoadout(run.loadout, vault, loadoutRefCap(map), run.level, poolMult);
    if (run.mode === 'challenge' && run.challenge) {
      if (lockLoadout && run.challenge.forcedLoadout) {
        clean = { ...run.challenge.forcedLoadout };
      } else {
        clean = sanitizeChallengeLoadout(run.challenge, clean);
      }
      const check = validateChallengeLoadout(run.challenge, clean, []);
      const blocking = (check.errors || []).filter(
        (e) => !e.startsWith('Cần ≥') && !e.includes('unit trên sân')
      );
      if (blocking.length) {
        toast(blocking[0]);
        return;
      }
    } else if (run.mode === 'hard' && run.hardRarityLimits) {
      clean = sanitizeHardLoadout(run.hardRarityLimits, clean);
      const check = validateHardLoadout(run.hardRarityLimits, clean);
      if (!check.ok && check.errors.length) {
        toast(check.errors[0]);
        return;
      }
    }
    if (!loadoutUnitCount(clean)) {
      toast('Chọn ít nhất 1 quái vào loadout');
      return;
    }
    run.loadout = clean;
    // Không ghi đè lastLoadout ải thường bằng bản thử thách đã cắt
    if (run.mode !== 'challenge') {
      state.lastLoadout = { ...clean };
      saveState(state);
    }
    applyLoadout?.(clean);
    go('setup');
  };

  root.querySelector('#btn-back-hub').onclick = () => {
    hideMonsterTip(true);
    go('hub');
  };
}

export function renderSetup(root, ctx) {
  const { run, go, toast, inventory, state } = ctx;
  if (!run) {
    root.innerHTML = `<p class="muted">Chưa có run.</p>`;
    return;
  }

  // Bảo đảm inventory session = loadout (tránh mang cả kho)
  if (run.loadout && inventory && ctx.ensureLoadoutInventory) {
    ctx.ensureLoadoutInventory();
  }

  const map = run.map;
  let selectedId = run.selectedMonsterId;
  /** @type {null | {col:number,row:number,kind:string,color?:string,costText?:string}} */
  let fxPulse = null;
  let disposeFx = null;
  let bobTimer = 0;
  let cancelGhost = null;
  let showPath = true;
  /** @type {null | {fromCol:number,fromRow:number}} */
  let draggingBoard = null;
  let pathCache = hintPath(map);

  function stopFx() {
    disposeFx?.();
    disposeFx = null;
    clearInterval(bobTimer);
    bobTimer = 0;
    cancelGhost?.();
    cancelGhost = null;
  }

  function tryPlace(col, row, monsterId) {
    const res = placeMonster(run, 0, monsterId, col, row, inventory);
    if (!res.ok) {
      toast(res.reason);
      const el = root.querySelector(`.grid-cell[data-col="${col}"][data-row="${row}"]`);
      el?.classList.add('shake');
      setTimeout(() => el?.classList.remove('shake'), 380);
      return false;
    }
    const m = MONSTER_BY_ID[monsterId];
    fxPulse = { col, row, kind: 'place', color: m?.color, costText: `−${m?.cost ?? '?'}` };
    return true;
  }

  function paint() {
    hideMonsterTip(true);
    stopFx();
    pathCache = hintPath(map);
    const used = mapUsedCost(map);
    const selected = selectedId ? MONSTER_BY_ID[selectedId] : null;
    const ghostSrc = selected
      ? monsterSpriteUrl(
          selected.id,
          selected.color,
          selected.rarity,
          getEquippedMonsterAppearance(state, selected.id, selected)
        )
      : '';
    const pathHint = showPath
      ? new Set(pathCache.map((p) => `${p.col},${p.row}`))
      : new Set();
    const costPct = Math.min(100, Math.round((used / map.costCap) * 100));
    const costHot = used / map.costCap >= 0.85;

    const cells = [];
    for (let row = 0; row < map.rows; row++) {
      for (let col = 0; col < map.cols; col++) {
        const ch = map.tiles[row][col];
        const key = `${col},${row}`;
        const terrain = terrainAt(map, col, row);
        const isWall = ch === '#' || ch === 'o';
        const isGate = ch === 'G';
        const isTreasure = ch === 'T';
        const buffs = map.buffIndex[key] || [];
        const buffClass = buffs.some((b) => b.side === 'monster')
          ? 'buff-monster'
          : buffs.some((b) => b.side === 'hero')
            ? 'buff-hero'
            : buffs.length
              ? 'buff-both'
              : '';
        const tip = cellTooltip(map, col, row, ch);
        const pathIdx = pathCache.findIndex((p) => p.col === col && p.row === row);
        const pathCls = pathHint.has(key) ? 'path-hint' : '';
        const pathOrd =
          showPath && pathIdx >= 0
            ? `<span class="path-ord" aria-hidden="true"></span>`
            : '';

        if (isWall) {
          cells.push(`
            <div class="grid-cell wall-cell ${ch === 'o' ? 'obstacle-cell' : ''}" data-col="${col}" data-row="${row}" title="${tip}">
              <span class="cell-wall-face"></span>
            </div>`);
          continue;
        }

        const p = map.placements.find((x) => x.col === col && x.row === row);
        if (p) {
          const m = MONSTER_BY_ID[p.monsterId];
          const trap = m?.tags?.includes('trap');
          const src = monsterSpriteUrl(
            p.monsterId,
            m?.color || '#ccc',
            m?.rarity || 1,
            getEquippedMonsterAppearance(state, p.monsterId, m)
          );
          const just =
            fxPulse && fxPulse.col === col && fxPulse.row === row
              ? fxPulse.kind === 'place'
                ? 'just-placed'
                : 'just-removed'
              : '';
          cells.push(`
            <button type="button" class="grid-cell filled terrain-${terrain} ${buffClass} ${pathCls} ${trap ? 'is-trap' : ''} ${just}" data-col="${col}" data-row="${row}" data-filled="1" data-mid="${p.monsterId}" draggable="true" style="--m:${m?.color || '#cfc5b2'}" title="${m?.name || ''} · ${tip}" aria-label="${m?.name || 'quái'}">
              <span class="cell-glow"></span>
              ${pathOrd}
              <img class="cell-sprite" src="${src}" alt="" width="36" height="36" draggable="false" />
              <span class="cell-name">${shortName(m?.name)}</span>
              <span class="cell-cost">C${m?.cost ?? '?'}</span>
            </button>`);
        } else {
          const locked = isGate || isTreasure;
          const noPlace = ch === 'x' || map.noPlace?.has(key);
          const placeable = !locked && isPlaceable(map, col, row);
          const canDrop =
            selected && placeable ? 'can-drop' : selected && !placeable ? 'no-drop' : '';
          const dim = selected && !placeable && !locked ? 'dim-cell' : '';
          cells.push(`
            <button type="button" class="grid-cell empty terrain-${terrain} ${buffClass} ${pathCls} ${canDrop} ${dim} ${isGate ? 'edge-in' : ''} ${isTreasure ? 'edge-out' : ''} ${locked ? 'locked-cell' : ''} ${noPlace ? 'no-place-cell' : ''}" data-col="${col}" data-row="${row}" data-placeable="${placeable ? 1 : 0}" title="${tip}" aria-label="Ô ${col},${row}" ${locked ? 'disabled' : ''}>
              ${pathOrd}
              ${
                isGate
                  ? '<span class="cell-mark">G</span>'
                  : isTreasure
                    ? '<span class="cell-mark">T</span>'
                    : noPlace
                      ? '<span class="cell-mark noplace">×</span>'
                    : selected && placeable
                      ? `<img class="ghost-sprite" src="${ghostSrc}" alt="" width="32" height="32" draggable="false" />`
                      : placeable
                        ? '<span class="cell-plus">+</span>'
                        : ''
              }
              ${buffClass === 'buff-monster' ? '<span class="buff-ico mon" title="Buff quái: đặt quái đứng trên ô này">▲</span>' : ''}
              ${buffClass === 'buff-hero' ? '<span class="buff-ico hero" title="Buff hero: hero đi/đứng lên ô này trong trận">!</span>' : ''}
              ${buffClass === 'buff-both' ? '<span class="buff-ico both" title="Buff chung: ai đứng trên ô đều hưởng">◆</span>' : ''}
            </button>`);
        }
      }
    }

    const tray = Object.entries(inventory)
      .filter(([, c]) => c > 0)
      .map(([id, count]) => {
        const m = MONSTER_BY_ID[id];
        if (!m) return '';
        const trap = m.tags?.includes('trap');
        const src = monsterSpriteUrl(
          id,
          m.color,
          m.rarity,
          getEquippedMonsterAppearance(state, id, m)
        );
        const upLv = monsterUpgradeLevelForRun(run, state, id);
        const stageLv = monsterStageLevelForRun(run);
        const statMul = monsterStatMulForRun(run);
        const stageLabel =
          run.mode === 'challenge'
            ? `CH${run.challengeId} · base`
            : `${run.mode === 'hard' ? 'K' : 'T'}${stageLv}`;
        const st = displayMonsterStats(m, upLv, stageLv, statMul);
        return `
          <button type="button" class="tray-item ${selectedId === id ? 'selected' : ''}" data-mid="${id}" draggable="true">
            <img class="tray-sprite" src="${src}" alt="" width="40" height="40" draggable="false" />
            <div style="color:${RARITY_COLORS[m.rarity]}">${'★'.repeat(m.rarity)}</div>
            <div>${shortName(m.name)}</div>
            <div class="muted">C${m.cost} · ×${count}${trap ? ' · Bẫy' : ''}</div>
            <div class="pick-stats">HP ${st.hp} · ATK ${st.atk}</div>
            <div class="pick-stats dim"><em class="stat-stage">${stageLabel}</em></div>
          </button>`;
      })
      .join('');

    const enemyPills = [...run.wave]
      .sort((a, b) => (a.formation?.order || 0) - (b.formation?.order || 0))
      .map(
        (h) => `
        <span class="enemy-pill ${h.class}" title="${h.name} · (${h.formation?.col},${h.formation?.row}) · ${h.spawnDelay?.toFixed?.(1)}s">
          <b>#${h.formation?.order}</b>
          <img src="${heroSpriteUrl(h.id, h.class, h.color)}" alt="" width="20" height="20" />
        </span>`
      )
      .join('');

    root.innerHTML = `
      <div class="setup-layout setup-v2">
        <div class="setup-top">
          <div class="setup-top-left">
            <span class="setup-kicker">${
              run.mode === 'challenge'
                ? `CH${run.challengeId}`
                : `${run.mode === 'hard' ? 'Khó' : 'Thường'} · Ải ${run.level}${
                    run.isReplay ? ' · Replay' : ''
                  }`
            } · Xếp trận</span>
            <h2>${map.name}</h2>
          </div>
          <button type="button" class="ghost" id="btn-scout">← Trinh sát</button>
        </div>

        <div class="enemy-formation-bar compact" aria-label="Đội hình Hero">
          <span class="enemy-formation-title">Địch</span>
          ${enemyPills}
        </div>

        <div class="room-board map-board interactive-board board-hero">
          <div class="board-chrome">
            <div class="cost-ring ${costHot ? 'hot' : ''}" title="Cost đã dùng">
              <svg viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15.5" class="cost-bg" pathLength="100" />
                <circle cx="18" cy="18" r="15.5" class="cost-fg" pathLength="100" style="stroke-dasharray:${costPct} 100" />
              </svg>
              <span class="cost-num">${used}<small>/${map.costCap}</small></span>
            </div>
            <div class="board-tools">
              <button type="button" class="tool-btn ${showPath ? 'on' : ''}" id="btn-toggle-path" title="Hiện path Hero">Path</button>
              <button type="button" class="tool-btn" id="btn-ghost-walk" title="Xem Hero đi thử">Thử đường</button>
            </div>
            <p class="board-tip muted" id="board-tip">${selected ? `Thả ${selected.name} · kéo từ khay hoặc chạm ô` : 'Chọn / kéo quái · hover ô để xem địa hình'}</p>
          </div>
          <div class="board-stage single-map">
              <div class="grid-board map-grid" style="--cols:${map.cols};--rows:${map.rows};grid-template-columns:repeat(${map.cols},minmax(0,1fr));grid-template-rows:repeat(${map.rows},minmax(0,1fr));aspect-ratio:${map.cols}/${map.rows}">${cells.join('')}</div>
          </div>
          <div class="map-legend-mini" aria-hidden="true">
            <span class="leg wall"></span>Tường
            <span class="leg water"></span>Nước
            <span class="leg dark"></span>Tối
            <span class="leg bm"></span>▲ Đặt quái để buff
            <span class="leg bh"></span>! Hero đi vào để buff
          </div>
        </div>

        <div class="setup-tray-bar sticky-tray">
          <div class="tray-loadout-hint muted">
            Khay còn lại sẽ thả trong trận · Cap sân ${used}/${map.costCap}
            · Loadout ${Object.keys(run.loadout || {}).length} loại — ← Trinh sát để đổi
          </div>
          <div class="monster-tray">${tray || '<span class="muted">Đã xếp hết / trống — START nếu đã có quái trên sân, hoặc về Trinh sát</span>'}</div>
        </div>

        <div class="setup-footer">
          <button type="button" id="btn-clear">Xóa</button>
          <button type="button" class="primary" id="btn-start">START</button>
        </div>
      </div>
    `;

    const boardEl = root.querySelector('.room-board');
    disposeFx = attachSetupBoardFx(boardEl, { path: showPath ? pathCache : [] });
    boardEl._setupFx?.setPath(showPath ? pathCache : []);

    if (fxPulse) {
      const cell = root.querySelector(
        `.grid-cell[data-col="${fxPulse.col}"][data-row="${fxPulse.row}"]`
      );
      if (cell && boardEl._setupFx) {
          boardEl._setupFx.burstAtCell(
            cell,
            fxPulse.color || selected?.color || '#9a6b2a',
            fxPulse.kind
          );
        if (fxPulse.costText) {
          boardEl._setupFx.floatCost(cell, fxPulse.costText, '#2f6f5e');
        }
      }
      fxPulse = null;
    }

    const sprites = root.querySelectorAll('.cell-sprite');
    bobTimer = window.setInterval(() => {
      sprites.forEach((img, i) => {
        if (img.closest('.just-placed')) return;
        const t = performance.now() / 1000;
        img.style.transform = `translateY(${Math.sin(t * 3.2 + i * 0.7) * 1.5}px)`;
      });
    }, 50);

    const tipEl = root.querySelector('#board-tip');
    const defaultBoardTip = selected
      ? `Thả ${selected.name} · kéo từ khay hoặc chạm ô`
      : 'Chọn / kéo quái · hover ô để xem địa hình';

    // Tray select + drag
    root.querySelectorAll('.tray-item').forEach((el) => {
      el.onclick = () => {
        selectedId = el.getAttribute('data-mid');
        run.selectedMonsterId = selectedId;
        paint();
        requestAnimationFrame(() => {
          root.querySelector('.room-board')?._setupFx?.sparkleSelect(
            MONSTER_BY_ID[selectedId]?.color
          );
        });
      };
      el.ondragstart = (e) => {
        selectedId = el.getAttribute('data-mid');
        run.selectedMonsterId = selectedId;
        e.dataTransfer.setData('text/monster', selectedId);
        e.dataTransfer.setData('text/plain', selectedId);
        e.dataTransfer.effectAllowed = 'copy';
        el.classList.add('dragging');
      };
      el.ondragend = () => el.classList.remove('dragging');
    });

    // Board cells
    root.querySelectorAll('.grid-cell').forEach((el) => {
      const col = Number(el.getAttribute('data-col'));
      const row = Number(el.getAttribute('data-row'));

      el.onpointerenter = () => {
        el.classList.add('hover-preview');
        if (tipEl) tipEl.textContent = el.getAttribute('title') || defaultBoardTip;
        if (showPath && pathHint.has(`${col},${row}`)) {
          el.classList.add('path-hot');
        }
      };
      el.onpointerleave = () => {
        el.classList.remove('hover-preview', 'path-hot');
        if (tipEl) tipEl.textContent = defaultBoardTip;
      };

      if (el.classList.contains('wall-cell') || el.disabled) return;

      el.onclick = () => {
        const existing = map.placements.find((p) => p.col === col && p.row === row);
        if (existing) {
          const mid = existing.monsterId;
          removePlacement(run, 0, col, row, inventory);
          fxPulse = { col, row, kind: 'remove', color: MONSTER_BY_ID[mid]?.color };
          paint();
          return;
        }
        if (!selectedId) {
          toast('Chọn hoặc kéo quái từ khay');
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 380);
          return;
        }
        if (tryPlace(col, row, selectedId)) paint();
      };

      el.ondragover = (e) => {
        if (el.getAttribute('data-placeable') === '1' || el.getAttribute('data-filled') === '1') {
          e.preventDefault();
          el.classList.add('drag-over');
        }
      };
      el.ondragleave = () => el.classList.remove('drag-over');
      el.ondrop = (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const mid = e.dataTransfer.getData('text/monster') || e.dataTransfer.getData('text/plain');
        const from = e.dataTransfer.getData('text/from-cell');
        if (from) {
          const [fc, fr] = from.split(',').map(Number);
          const existing = map.placements.find((p) => p.col === fc && p.row === fr);
          if (!existing) return;
          // move / swap
          const target = map.placements.find((p) => p.col === col && p.row === row);
          if (fc === col && fr === row) return;
          if (target) {
            // swap
            existing.col = col;
            existing.row = row;
            target.col = fc;
            target.row = fr;
            fxPulse = { col, row, kind: 'place', color: MONSTER_BY_ID[existing.monsterId]?.color };
            paint();
            return;
          }
          if (!isPlaceable(map, col, row) || map.tiles[row][col] === 'G' || map.tiles[row][col] === 'T') {
            toast('Ô không đặt được');
            return;
          }
          existing.col = col;
          existing.row = row;
          fxPulse = { col, row, kind: 'place', color: MONSTER_BY_ID[existing.monsterId]?.color };
          paint();
          return;
        }
        if (mid && el.getAttribute('data-placeable') === '1') {
          selectedId = mid;
          run.selectedMonsterId = mid;
          if (tryPlace(col, row, mid)) paint();
        }
      };

      if (el.getAttribute('data-filled') === '1') {
        el.ondragstart = (e) => {
          e.dataTransfer.setData('text/from-cell', `${col},${row}`);
          e.dataTransfer.effectAllowed = 'move';
          el.classList.add('dragging');
          draggingBoard = { fromCol: col, fromRow: row };
        };
        el.ondragend = () => {
          el.classList.remove('dragging');
          draggingBoard = null;
        };
      }
    });

    root.querySelector('#btn-toggle-path').onclick = () => {
      showPath = !showPath;
      paint();
    };

    root.querySelector('#btn-ghost-walk').onclick = () => {
      cancelGhost?.();
      const hero = run.wave[0];
      if (!hero || !pathCache.length) {
        toast('Không có path tới Kho');
        return;
      }
      cancelGhost = playGhostWalk(boardEl, pathCache, hero);
      toast(`${hero.name} đi thử đường…`);
    };

    root.querySelector('#btn-scout').onclick = () => {
      hideMonsterTip(true);
      stopFx();
      go('scout');
    };
    root.querySelector('#btn-clear').onclick = () => {
      [...map.placements].forEach((p) => {
        removePlacement(run, 0, p.col, p.row, inventory);
      });
      boardEl._setupFx?.sparkleSelect('#90a4ae');
      paint();
    };
    root.querySelector('#btn-start').onclick = () => {
      if (totalPlacements(run) === 0) {
        toast('Hãy thả ít nhất 1 quái!');
        return;
      }
      if (run.mode === 'challenge' && run.challenge) {
        const check = validateChallengeLoadout(
          run.challenge,
          run.loadout,
          run.map.placements || []
        );
        if (!check.ok) {
          toast(check.errors[0] || 'Loadout không hợp lệ');
          return;
        }
      }
      // Phần còn trong khay → tay bài thả trong trận
      run.deployHand = { ...inventory };
      addMonsterDeployments(
        state,
        (run.map.placements || []).map((p) => ({ monsterId: p.monsterId, count: 1 }))
      );
      saveState(state);
      hideMonsterTip(true);
      stopFx();
      go('combat');
    };
  }

  paint();

  root._cleanup = () => {
    hideMonsterTip(true);
    stopFx();
  };
}

