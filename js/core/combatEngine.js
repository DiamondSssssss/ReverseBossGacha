import { COMBAT, SPELLS, HERO_CLASS_LABELS } from '../data/constants.js?v=121';
import { MONSTER_BY_ID } from '../data/monsters.js?v=121';
import { terrainAt, isPlaceable } from '../data/maps.js?v=121';
import { bossSpells, DEFAULT_BOSS_ID, getBoss } from '../data/dungeonBosses.js?v=121';
import { mapUsedCost } from './dungeon.js?v=121';
import { buildBlockedFromMap, cellCenterWorld } from './pathfinding.js?v=121';
import { ParticleSystem } from '../render/particles.js?v=121';
import { getEquippedMonsterAppearance } from './monsterSkins.js?v=121';
import {
  getMonsterSprite,
  getHeroSprite,
  drawSpriteAt,
} from '../render/sprites.js?v=121';
import { tickHeroBrain, heroSpeedMultiplier, rebuildHeroPath, rebuildKitePath } from './ai/heroBrain.js?v=121';
import { tickMonsterBrain, inferMonsterAi } from './ai/monsterBrain.js?v=121';
import {
  computeHeroAttackDamage,
  applyIncomingDamage,
  applyHealCutOnHit,
  applyOnHitStatuses,
  applyBurn,
  applyPoison,
  computeBurnDps,
  computePoisonDps,
  dotKitHitMul,
  applyFreeze,
  applyStun,
  applySlow,
  applyDefShred,
  applyRoot,
  applyCharm,
  applyFrail,
  applyInvulnerable,
  applyThornsPassive,
  applyCdReduction,
  cleanseAlliesInRadius,
  isRooted,
  applyShieldBreak,
  activeShieldHp,
  tickStatusDots,
  tickStealthRegen,
  TRAP_EFFECTS,
  isTrapPassive,
  statusTelegraphColor,
  auraRadiusCells,
  tryActivateMonsterShield,
  tryMonsterTauntSelf,
  ensureHeroSkillState,
  tryEnterStasisRevive,
  tickStasisRevive,
} from './ai/skills.js?v=121';
import { getTileModifiers, spawnMonsterStats, elementAuraActive, elementAuraTag } from './ai/tileModifiers.js?v=121';
import { dist } from './ai/targeting.js?v=121';
import { getHeroProfile } from './ai/profiles.js?v=121';
import {
  patternForHero,
  patternForMonster,
  beginAttack,
  tickAttack,
  ensureAttackState,
  resolveDisplayAnim,
} from './ai/attackPatterns.js?v=121';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function shortLabel(name) {
  if (!name) return '?';
  const parts = String(name).split(/\s+/);
  return parts.slice(-2).join(' ');
}

function intentLabel(intent) {
  switch (intent) {
    case 'entering':
      return { text: 'VÀO CỔNG', color: '#81c784' };
    case 'fighting':
      return { text: 'ĐÁNH', color: '#ef5350' };
    case 'draining':
      return { text: 'RÚT KHO', color: '#ffd54f' };
    case 'fleeing':
      return { text: 'BỎ CHẠY', color: '#ffeb3b' };
    case 'stunned':
      return { text: 'CHOÁNG', color: '#90a4ae' };
    case 'frozen':
      return { text: 'ĐÓNG BĂNG', color: '#81d4fa' };
    case 'stasis':
      return { text: 'NGỦ ĐÔNG', color: '#4fc3f7' };
    case 'kiting':
      return { text: 'KITE', color: '#ce93d8' };
    case 'moving':
    default:
      return { text: '→ KHO', color: '#81c784' };
  }
}

const TERRAIN_COLORS = {
  NORMAL: '#3a3228',
  WATER: '#1e3a38',
  LOW_CEILING: '#3d2a24',
  DARK: '#1a1612',
  HIGH: '#353028',
  FIRE: '#4a2818',
  ICE: '#1a3040',
  POISON: '#2a3820',
  OIL: '#3a3018',
};

export class CombatEngine {
  constructor(run, canvas, hooks = {}) {
    this.run = run;
    this.map = run.map;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hooks = hooks;

    this.CELL = this.map.cellSize || COMBAT.CELL_SIZE;
    this.originY = 40;
    this.mapWidth = this.map.cols * this.CELL;
    this.mapHeight = this.map.rows * this.CELL;
    this.totalWidth = this.mapWidth + 100;

    this.running = false;
    this.paused = false;
    this.time = 0;
    this.lastTs = 0;
    this.raf = 0;
    this.treasureHp = COMBAT.TREASURE_HP;
    this.treasureMax = COMBAT.TREASURE_HP;
    if (run.treasureHpOverride || run.map?.treasureHp) {
      const th = run.treasureHpOverride || run.map.treasureHp;
      this.treasureHp = th;
      this.treasureMax = th;
    }
    this.challengeStats = {
      tithes: 0,
      heroDeaths: 0,
      spellsCast: 0,
      usedPotion: false,
      maxUnits: 0,
      highTileTime: 0,
      bossDrained: false,
      roguesKilledBeforeDrain: 0,
      anyHeroDrained: false,
    };
    this.result = null;
    this.floatTexts = [];
    this.vfx = [];
    this.particles = new ParticleSystem();
    this.zones = [];
    this.globalSlowUntil = 0;
    this.globalSlowFactor = 0.55;
    this.treasureShield = 0;
    this.treasureShieldUntil = 0;
    this.monsterRageUntil = 0;
    this.monsterRageMul = 1;
    this.monsterReflectUntil = 0;
    this.monsterReflectRatio = 0;
    this.bossId = this.hooks.bossId || DEFAULT_BOSS_ID;
    this.spellCd = Object.fromEntries(bossSpells(this.bossId).map((s) => [s.id, 0]));
    /** Tay bài thả trong trận (còn lại sau xếp trận) */
    this.hand = { ...(this.hooks.hand || this.run.deployHand || {}) };
    this.costCap = this.map.costCap;
    this.costUsed = 0;
    this.selectedDeployId = null;
    this.cameraX = COMBAT.CAMERA_MIN_X;
    this.drawScale = 1;
    this.drawOffsetY = 40;
    this.speedMul = 1;
    /** Manual pan — no auto-follow */
    this._camUserLocked = false;

    this.monsters = [];
    this.heroes = [];
    this._waveUnlocked = { 1: 0 };
    this._spawnMonsters();
    this._queueHeroes();
    this._resize();
  }

  _cellCenter(col, row) {
    return cellCenterWorld(col, row, this.CELL, 0, this.originY);
  }

  _unitCell(unit) {
    return {
      col: Math.max(0, Math.min(this.map.cols - 1, Math.floor(unit.x / this.CELL))),
      row: Math.max(
        0,
        Math.min(this.map.rows - 1, Math.floor((unit.y - this.originY) / this.CELL))
      ),
    };
  }

  _damageHero(hero, raw, color = '#ff7043', text = null) {
    if (!hero?.alive || hero.inStasis) return 0;
    let dmg = Math.max(0, Math.round(raw));
    if (hero.frailUntil && this.time < hero.frailUntil) {
      dmg = Math.round(dmg * (hero.frailMul || 1.25));
    }
    dmg = applyIncomingDamage(hero, Math.round(dmg / (hero.tileDefMul || 1)), this.time);
    if (dmg <= 0) return 0;
    hero.hp -= dmg;
    this._float(hero.x, hero.y - 8, text || `-${dmg}`, color);
    this.particles.burst(hero.x, hero.y, color);
    if (hero.hp <= 0) {
      this._processHeroDeath(hero);
    } else {
      this._propagateSoulLink(hero, dmg, color);
    }
    return dmg;
  }

  _propagateSoulLink(source, dealt, color = '#7b6ba8') {
    if (!source?.alive || source._soulLinkBusy) return;
    if (!source.soulLinkUntil || this.time >= source.soulLinkUntil) return;
    const ids = source.soulLinkIds || [];
    if (!ids.length) return;
    const ratio = source.soulLinkRatio || 0.35;
    source._soulLinkBusy = true;
    for (const id of ids) {
      if (id === source.id) continue;
      const other = this.heroes.find((h) => h.id === id && h.alive);
      if (!other || other._soulLinkBusy) continue;
      const share = Math.max(1, Math.round(dealt * ratio));
      other._soulLinkBusy = true;
      other.hp -= share;
      other.flash = 0.15;
      this._float(other.x, other.y - 10, `-${share}`, color);
      this.particles.magic(other.x, other.y - 6, color);
      if (other.hp <= 0) {
        other.alive = false;
        this._float(other.x, other.y, 'Hạ!', color);
      }
      other._soulLinkBusy = false;
    }
    source._soulLinkBusy = false;
  }

  _pullHeroToward(hero, targetX, cells = 2) {
    if (!hero?.alive) return;
    const cell = this._unitCell(hero);
    const step = Math.max(1, Math.round(cells));
    const towardTreasure = targetX >= hero.x;
    const newCol = towardTreasure
      ? Math.min(this.map.cols - 1, cell.col + step)
      : Math.max(0, cell.col - step);
    const dest = this._cellCenter(newCol, cell.row);
    if (!this.map.blocked.has(`${newCol},${cell.row}`)) {
      hero.x = dest.x;
      hero.path = null;
      hero.draining = false;
    }
  }

  _frontHeroes(count = 2) {
    return this.heroes
      .filter((h) => h.alive)
      .sort((a, b) => b.x - a.x)
      .slice(0, count);
  }

  _backlineHeroes(count = 2) {
    return this.heroes
      .filter((h) => h.alive)
      .sort((a, b) => a.x - b.x)
      .slice(0, count);
  }

  _heroClusterAnchor(radiusCells = 2.2) {
    const seed = this._frontHeroes(1)[0];
    if (!seed) return null;
    const radius = this.CELL * radiusCells;
    const group = this.heroes.filter((h) => h.alive && dist(h, seed) <= radius);
    if (!group.length) return seed;
    const sum = group.reduce((acc, h) => ({ x: acc.x + h.x, y: acc.y + h.y }), { x: 0, y: 0 });
    return { x: sum.x / group.length, y: sum.y / group.length, group };
  }

  _grantMonsterShield(monster, ratio, duration) {
    if (!monster?.alive) return;
    const amount = Math.max(1, Math.round(monster.maxHp * ratio));
    monster.shieldHp = Math.max(monster.shieldHp || 0, amount);
    monster.shieldUntil = Math.max(monster.shieldUntil || 0, this.time + duration);
  }

  _dynamicBlocked() {
    const extra = [];
    for (const m of this.monsters) {
      if (!m.alive || !m.ai?.blocksPath) continue;
      extra.push(`${m.col},${m.row}`);
    }
    return extra;
  }

  _brainCtx() {
    return {
      time: this.time,
      dt: 0,
      map: this.map,
      cellSize: this.CELL,
      monsters: this.monsters,
      heroes: this.heroes,
      blockedExtra: [],
      dynamicBlocked: this._dynamicBlocked(),
      globalSlowUntil: this.globalSlowUntil,
      globalSlowFactor: this.globalSlowFactor,
      zones: this.zones,
      originY: this.originY,
      blocked: buildBlockedFromMap(this.map, this._dynamicBlocked()),
      combat: this,
      terrainAt: (c, r) => terrainAt(this.map, c, r),
    };
  }

  _spawnMonsters() {
    for (const p of this.map.placements) {
      this._spawnOneMonster(p.monsterId, p.col, p.row, { fromSetup: true });
    }
    this.costUsed = mapUsedCost(this.map);
  }

  /**
   * Tạo 1 quái trên sân. Không trừ hand / cost (caller lo).
   * @returns {object|null} unit
   */
  _spawnOneMonster(monsterId, col, row, { fromSetup = false } = {}) {
    const tpl = MONSTER_BY_ID[monsterId];
    if (!tpl) return null;
    const appearance = this.hooks.state
      ? getEquippedMonsterAppearance(this.hooks.state, monsterId, tpl)
      : null;
    const upgrades = this.run?.mode === 'challenge' ? {} : this.hooks.monsterUpgrades || {};
    const terrain = terrainAt(this.map, col, row);
    const upLv = Number(upgrades[monsterId]) || 0;
    // Challenge: catalog base (stageLevel 0 → không scale ải; monsterStatMul = 1)
    const stageLevel =
      this.run?.mode === 'challenge' ? 0 : Number(this.run?.level) || 1;
    const st = spawnMonsterStats(tpl, terrain, upLv, stageLevel);
    const statMul = Number(this.run?.monsterStatMul);
    if (Number.isFinite(statMul) && statMul > 0 && statMul !== 1) {
      st.baseHp = Math.max(1, Math.round((st.baseHp || st.hp) * statMul));
      st.hp = Math.max(1, Math.round(st.hp * statMul));
      st.maxHp = Math.max(1, Math.round(st.maxHp * statMul));
      st.baseAtk = Math.max(1, Math.round(st.baseAtk * statMul));
      st.atk = Math.max(1, Math.round(st.atk * statMul));
    }
    const pos = this._cellCenter(col, row);
    const ai = inferMonsterAi(tpl);
    const stealthed =
      !!tpl.stealth ||
      (Array.isArray(tpl.skills) && tpl.skills.includes('STEALTH')) ||
      (tpl.tags || []).includes('assassin');
    const unit = {
      id: uid(),
      templateId: tpl.id,
      name: tpl.name,
      color: appearance?.color || tpl.color,
      skinId: appearance?.skinId || 'base',
      appearance,
      passive: tpl.passive,
      skills: Array.isArray(tpl.skills) ? [...tpl.skills] : [],
      rarity: tpl.rarity,
      tags: tpl.tags || [],
      drawback: tpl.drawback || '',
      stealth: stealthed,
      revealed: false,
      hasRevived: false,
      terrain,
      col,
      row,
      homeX: pos.x,
      homeY: pos.y,
      x: pos.x,
      y: pos.y,
      ...st,
      cost: tpl.cost,
      range: st.rangeCells * this.CELL,
      baseAtk: st.baseAtk,
      atkCd: 0,
      alive: true,
      firstHitDone: false,
      isTrap:
        isTrapPassive(tpl.passive) ||
        (tpl.tags?.includes('trap') && tpl.stats.speed === 0) ||
        (tpl.tags?.includes('potion') && tpl.stats.speed === 0) ||
        ai.role === 'trap',
      auraRadius: tpl.auraRadius ?? null,
      ai,
      flash: 0,
      bobPhase: Math.random() * Math.PI * 2,
      tileAtkMul: 1,
      tileDefMul: 1,
      deployedInCombat: !fromSetup,
      fuseUntil: String(tpl.passive || '').startsWith('POTION_')
        ? (fromSetup ? 1.0 : this.time + 1.0)
        : undefined,
    };
    unit._baseAtkSpeed = unit.atkSpeed;
    if (
      tpl.passive === 'THORNS_PASSIVE' ||
      (tpl.skills || []).includes('THORNS_PASSIVE')
    ) {
      applyThornsPassive(unit, tpl.rarity >= 4 ? 0.22 : 0.18);
    }
    this.monsters.push(unit);
    return unit;
  }

  /** Cost đang chiếm bởi quái còn sống */
  aliveCost() {
    let sum = 0;
    for (const m of this.monsters) {
      if (!m.alive) continue;
      sum += m.cost || MONSTER_BY_ID[m.templateId]?.cost || 0;
    }
    return sum;
  }

  freeCost() {
    return Math.max(0, this.costCap - this.aliveCost());
  }

  _cellOccupied(col, row) {
    for (const m of this.monsters) {
      if (!m.alive) continue;
      const c = this._unitCell(m);
      if (c.col === col && c.row === row) return true;
    }
    return false;
  }

  canDeploy(monsterId, col, row) {
    if (this.result) return { ok: false, reason: 'Trận đã kết thúc' };
    const tpl = MONSTER_BY_ID[monsterId];
    if (!tpl) return { ok: false, reason: 'Quái không tồn tại' };
    if (!(this.hand[monsterId] > 0)) return { ok: false, reason: 'Không còn trong tay' };
    if (!isPlaceable(this.map, col, row)) {
      return { ok: false, reason: 'Ô không đặt được' };
    }
    if (this._cellOccupied(col, row)) return { ok: false, reason: 'Ô đã có quái' };
    const used = this.aliveCost();
    if (used + tpl.cost > this.costCap) {
      return {
        ok: false,
        reason: `Thiếu slot Cost (${used}/${this.costCap} · cần ${tpl.cost})`,
      };
    }
    return { ok: true };
  }

  /**
   * Thả quái từ tay bài trong trận (Clash-style).
   * @returns {{ ok: boolean, reason?: string }}
   */
  deployMonster(monsterId, col, row) {
    const check = this.canDeploy(monsterId, col, row);
    if (!check.ok) return check;
    const tpl = MONSTER_BY_ID[monsterId];
    const unit = this._spawnOneMonster(monsterId, col, row, { fromSetup: false });
    if (!unit) return { ok: false, reason: 'Không tạo được quái' };
    this.hand[monsterId] -= 1;
    if (this.hand[monsterId] <= 0) delete this.hand[monsterId];
    this.costUsed = this.aliveCost();
    this.particles.burst(unit.x, unit.y, unit.color || '#66bb6a');
    this._float(unit.x, unit.y - 12, `+${tpl.name}`, unit.color || '#81c784');
    this.hooks.onMonsterDeployed?.(monsterId);
    this.hooks.onUpdate?.(this.snapshot());
    return { ok: true };
  }

  setSelectedDeploy(monsterId) {
    if (monsterId && !(this.hand[monsterId] > 0)) {
      this.selectedDeployId = null;
      return false;
    }
    this.selectedDeployId =
      this.selectedDeployId === monsterId ? null : monsterId || null;
    this.hooks.onUpdate?.(this.snapshot());
    return true;
  }

  /** CSS pixel trên canvas → ô map (hoặc null) */
  screenToCell(cssX, cssY) {
    const scale = this.drawScale || 1;
    const worldX = cssX / scale + this.cameraX;
    const worldY = (cssY - (this.drawOffsetY || 0)) / scale;
    const col = Math.floor(worldX / this.CELL);
    const row = Math.floor((worldY - this.originY) / this.CELL);
    if (col < 0 || row < 0 || col >= this.map.cols || row >= this.map.rows) {
      return null;
    }
    return { col, row };
  }

  _queueHeroes() {
    this.spawnQueue = this.run.wave.map((h) => ({ ...h, spawned: false }));
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const wrap = this.canvas.closest('.combat-wrap') || this.canvas.parentElement;
    const cssW = wrap ? wrap.clientWidth : window.innerWidth;
    let cssH = 220;
    if (wrap) {
      const used = [...wrap.children].reduce((sum, el) => {
        if (el === this.canvas) return sum;
        return sum + el.getBoundingClientRect().height;
      }, 0);
      const gap = 6 * Math.max(0, wrap.children.length - 1);
      cssH = Math.max(160, wrap.clientHeight - used - gap);
    }
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.floor(cssW * dpr);
    this.canvas.height = Math.floor(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewW = cssW;
    this.viewH = cssH;
    this._updateDrawLayout();
  }

  _updateDrawLayout() {
    const contentH = this.map.rows * this.CELL + 96;
    const marginT = 36;
    const marginB = 28;
    const avail = Math.max(120, this.viewH - marginT - marginB);
    this.drawScale = Math.min(2.2, Math.max(0.85, avail / contentH));
    const scaledH = contentH * this.drawScale;
    this.drawOffsetY = marginT + Math.max(0, (avail - scaledH) / 2);
  }

  _viewWorldW() {
    return this.viewW / (this.drawScale || 1);
  }

  _cameraBounds() {
    const viewW = this._viewWorldW();
    const minCam = COMBAT.CAMERA_MIN_X;
    const maxCam = Math.max(minCam, this.totalWidth - viewW + 40);
    return { minCam, maxCam, viewW };
  }

  clampCameraX(x) {
    const { minCam, maxCam } = this._cameraBounds();
    return Math.max(minCam, Math.min(maxCam, x));
  }

  /** Pan camera by world-delta (positive dx → look right) */
  panCamera(dxWorld) {
    this._camUserLocked = true;
    this.cameraX = this.clampCameraX(this.cameraX + dxWorld);
  }

  /** Jump camera so gate is visible */
  focusGate() {
    this._camUserLocked = true;
    const { viewW } = this._cameraBounds();
    const gateX = (this.map.gate[0]?.col ?? 0) * this.CELL;
    this.cameraX = this.clampCameraX(gateX - viewW * 0.25);
  }

  /** Jump camera so treasure is visible */
  focusTreasure() {
    this._camUserLocked = true;
    const { viewW } = this._cameraBounds();
    const tx =
      (this.map.treasure[0]?.col ?? this.map.cols - 1) * this.CELL + this.CELL * 0.5;
    this.cameraX = this.clampCameraX(tx - viewW * 0.65);
  }

  start() {
    this.running = true;
    this.paused = false;
    this.lastTs = performance.now();
    const loop = (ts) => {
      if (!this.running) return;
      if (this.paused || document.hidden) {
        this.lastTs = ts;
        this.raf = requestAnimationFrame(loop);
        return;
      }
      let dt = (ts - this.lastTs) / 1000;
      this.lastTs = ts;
      if (dt > COMBAT.TICK_CAP_MS / 1000) dt = COMBAT.TICK_CAP_MS / 1000;
      dt *= COMBAT.BASE_TIME_SCALE * (this.speedMul || 1);
      this.update(dt);
      this.draw();
      if (this.running) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  setPaused(p) {
    this.paused = p;
  }

  setSpeedMul(mul) {
    const n = Number(mul);
    this.speedMul = Number.isFinite(n) ? Math.max(0.5, Math.min(3, n)) : 1;
    this.hooks.onUpdate?.(this.snapshot());
  }

  castSpell(spellId) {
    if (this.run?.noBossSpells || this.run?.challenge?.constraints?.noBossSpells) {
      return false;
    }
    if (!(spellId in this.spellCd) || this.spellCd[spellId] > 0 || this.result) {
      return false;
    }
    const spell = SPELLS[spellId];
    if (!spell) return false;

    const bannerX = this.viewW / 2 + this.cameraX;
    const kind = spell.kind || spellId;

    if (kind === 'slow_chip') {
      this.globalSlowUntil = this.time + spell.duration;
      this.globalSlowFactor = spell.slowFactor || 0.55;
      this._float(bannerX, 30, `${spell.name}!`, '#81d4fa');
      for (const h of this.heroes) {
        if (!h.alive) continue;
        this.particles.frost(h.x, h.y);
        this._damageHero(h, h.maxHp * (spell.damageRatio || 0), '#81d4fa');
      }
    } else if (kind === 'cleanse_heal') {
      this.monsters.forEach((m) => {
        if (!m.alive) return;
        this._applyHealTo(m, m.maxHp * spell.healRatio, { quiet: true });
        m.burnUntil = 0;
        m.poisonUntil = 0;
        m.slowUntil = 0;
        m.slowFactor = 1;
        m.defShredUntil = 0;
        this.particles.heal(m.x, m.y - 8);
      });
      this._float(bannerX, 30, `${spell.name}!`, '#ef9a9a');
    } else if (kind === 'reflect_aura') {
      this.monsterReflectUntil = this.time + (spell.duration || 5);
      this.monsterReflectRatio = spell.reflectRatio || 0.35;
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        this.particles.magic(m.x, m.y - 8, '#ef9a9a');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ef9a9a');
    } else if (kind === 'treasure_barrier') {
      this.treasureShield = spell.shieldHp;
      this.treasureShieldUntil = this.time + spell.duration;
      this._float(bannerX, 30, `${spell.name}!`, '#ffd54f');
      this.particles.burst(this.mapWidth * 0.85, this.originY + this.mapHeight * 0.5, '#ffd54f');
      const nearTreasure = [...this.monsters]
        .filter((m) => m.alive && !m.isTrap)
        .sort((a, b) => b.x - a.x)
        .slice(0, spell.allyCount || 3);
      for (const m of nearTreasure) {
        this._grantMonsterShield(m, spell.allyShieldRatio || 0.16, spell.duration || 5);
        this.particles.magic(m.x, m.y - 8, '#ffd54f');
      }
    } else if (kind === 'knock_strike') {
      const cells = spell.cells || 2;
      for (const h of this.heroes) {
        if (!h.alive) continue;
        const cell = this._unitCell(h);
        const newCol = Math.max(0, cell.col - cells);
        const dest = this._cellCenter(newCol, cell.row);
        if (!this.map.blocked.has(`${newCol},${cell.row}`)) {
          h.x = dest.x;
          h.path = null;
          h.draining = false;
          this.particles.burst(h.x, h.y, '#8d6e63');
        }
        this._damageHero(h, spell.damage || 0, '#8d6e63');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#8d6e63');
    } else if (kind === 'poison_healcut') {
      for (const h of this.heroes) {
        if (!h.alive) continue;
        h.poisonUntil = this.time + spell.duration;
        h.poisonDps = spell.dps;
        h.healCutUntil = this.time + spell.duration;
        h.healCutFactor = spell.healCutFactor || 0.55;
        this.particles.burst(h.x, h.y, '#66bb6a');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#66bb6a');
    } else if (kind === 'rage_haste') {
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        m.rageUntil = this.time + spell.duration;
        m.rageMul = spell.atkMul || 1.3;
        m.hasteUntil = this.time + spell.duration;
        m.hasteMul = spell.atkSpeedMul || 1.15;
        this.particles.burst(m.x, m.y, '#ef5350');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ef5350');
    } else if (kind === 'reveal_mark') {
      for (const h of this.heroes) {
        if (!h.alive) continue;
        h.revealed = true;
        h.silenced = true;
        h.tempSilenceUntil = this.time + spell.duration;
        applyDefShred(h, this.time, { factor: spell.defShredFactor || 0.82, duration: spell.duration });
        this.particles.magic(h.x, h.y - 8, '#ce93d8');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ce93d8');
    } else if (kind === 'cluster_blast') {
      const anchor = this._heroClusterAnchor(spell.radius || 2.2);
      if (!anchor) return false;
      const radius = this.CELL * (spell.radius || 2.2);
      this.particles.burst(anchor.x, anchor.y, '#90a4ae');
      for (const h of this.heroes) {
        if (!h.alive || Math.hypot(h.x - anchor.x, h.y - anchor.y) > radius) continue;
        this._damageHero(h, h.maxHp * (spell.damageRatio || 0) + (spell.damageFlat || 0), '#90a4ae');
        if (spell.stunDuration) applyStun(h, this.time, spell.stunDuration);
      }
      this._float(anchor.x, anchor.y - 20, spell.name, '#90a4ae');
      this._float(bannerX, 30, `${spell.name}!`, '#90a4ae');
    } else if (kind === 'ember_field') {
      const anchor = this._heroClusterAnchor(spell.radius || 2.1);
      if (!anchor) return false;
      this.zones.push({
        x: anchor.x,
        y: anchor.y,
        r: this.CELL * (spell.radius || 2.1),
        factor: 0.9,
        ttl: spell.duration || 4,
        burnDps: spell.dps || 12,
        color: '#ff7043',
      });
      this.particles.burst(anchor.x, anchor.y, '#ff7043');
      this._float(bannerX, 30, `${spell.name}!`, '#ff7043');
    } else if (kind === 'knock_burn') {
      const cells = spell.cells || 2;
      for (const h of this.heroes) {
        if (!h.alive) continue;
        const cell = this._unitCell(h);
        const newCol = Math.max(0, cell.col - cells);
        const dest = this._cellCenter(newCol, cell.row);
        if (!this.map.blocked.has(`${newCol},${cell.row}`)) {
          h.x = dest.x;
          h.path = null;
          h.draining = false;
        }
        applyBurn(h, this.time, { dps: spell.dps || 12, duration: spell.duration || 3.5 });
        this.particles.burst(h.x, h.y, '#ff7043');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ff7043');
    } else if (kind === 'front_freeze') {
      for (const h of this._frontHeroes(spell.count || 2)) {
        applyFreeze(h, this.time, spell.freezeDuration || 1.4);
        applySlow(h, this.time, { factor: spell.slowFactor || 0.7, duration: spell.slowDuration || 3 });
        this.particles.frost(h.x, h.y);
      }
      this._float(bannerX, 30, `${spell.name}!`, '#81d4fa');
    } else if (kind === 'soul_link') {
      const linked = this._frontHeroes(spell.count || 3);
      const ids = linked.map((h) => h.id);
      for (const h of linked) {
        h.soulLinkUntil = this.time + (spell.duration || 5);
        h.soulLinkRatio = spell.shareRatio || 0.4;
        h.soulLinkIds = ids;
        this.particles.magic(h.x, h.y - 8, '#7b6ba8');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#7b6ba8');
    } else if (kind === 'gravity_yank') {
      const treasure = this.map.treasure?.[0];
      const center = treasure
        ? this._cellCenter(treasure.col, treasure.row)
        : { x: this.mapWidth * 0.85, y: this.originY + this.mapHeight * 0.5 };
      for (const h of this.heroes) {
        if (!h.alive) continue;
        this._pullHeroToward(h, center.x, spell.cells || 2);
        applyRoot(h, this.time, spell.rootDuration || 1.1);
        this.particles.burst(h.x, h.y, '#7b6ba8');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#7b6ba8');
    } else if (kind === 'drain_pulse') {
      for (const h of this._backlineHeroes(spell.heroCount || 3)) {
        this._damageHero(h, h.maxHp * (spell.damageRatio || 0.16), '#ab47bc');
      }
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        this._applyHealTo(m, m.maxHp * (spell.healRatio || 0.1), { quiet: true });
        this.particles.heal(m.x, m.y - 6);
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ab47bc');
    } else if (kind === 'acid_rain') {
      const anchor = this._heroClusterAnchor(spell.radius || 2);
      if (!anchor) return false;
      const radius = this.CELL * (spell.radius || 2);
      for (const h of this.heroes) {
        if (!h.alive || Math.hypot(h.x - anchor.x, h.y - anchor.y) > radius) continue;
        this._damageHero(h, h.maxHp * (spell.damageRatio || 0.12), '#7cb342');
        applyPoison(h, this.time, { dps: spell.dps || 14, duration: spell.duration || 4 });
      }
      this.particles.burst(anchor.x, anchor.y, '#7cb342');
      this._float(bannerX, 30, `${spell.name}!`, '#7cb342');
    } else if (kind === 'backline_silence') {
      for (const h of this._backlineHeroes(spell.count || 2)) {
        h.silenced = true;
        h.tempSilenceUntil = this.time + (spell.duration || 3);
        applySlow(h, this.time, { factor: spell.slowFactor || 0.6, duration: spell.slowDuration || 3 });
        this.particles.magic(h.x, h.y - 8, '#ba68c8');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ba68c8');
    } else if (kind === 'backline_sap') {
      for (const h of this._backlineHeroes(spell.count || 2)) {
        h.silenced = true;
        h.tempSilenceUntil = this.time + (spell.duration || 3.5);
        h.atkDebuffUntil = this.time + (spell.duration || 3.5);
        h.atkDebuffFactor = spell.atkFactor || 0.55;
        h.rangeCutUntil = this.time + (spell.duration || 3.5);
        h.rangeCutFactor = spell.rangeFactor || 0.5;
        h.revealed = true;
        this.particles.magic(h.x, h.y - 8, '#557c46');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#557c46');
    } else if (kind === 'monster_barrier') {
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        this._grantMonsterShield(m, spell.shieldRatio || 0.18, spell.duration || 5.5);
        this.particles.magic(m.x, m.y - 8, '#ffd54f');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ffd54f');
    } else if (kind === 'treasure_bombard') {
      const treasure = this.map.treasure?.[0];
      if (!treasure) return false;
      const center = this._cellCenter(treasure.col, treasure.row);
      const radius = this.CELL * (spell.radius || 2.8);
      for (const h of this.heroes) {
        if (!h.alive || Math.hypot(h.x - center.x, h.y - center.y) > radius) continue;
        this._damageHero(
          h,
          h.maxHp * (spell.damageRatio || 0.16) + (spell.damageFlat || 20),
          '#8d6e63'
        );
      }
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        this._applyHealTo(m, m.maxHp * (spell.healRatio || 0.08), { quiet: true });
      }
      this.particles.burst(center.x, center.y, '#8d6e63');
      this._float(bannerX, 30, `${spell.name}!`, '#8d6e63');
    } else if (kind === 'treasure_crush') {
      const treasure = this.map.treasure?.[0];
      if (!treasure) return false;
      const center = this._cellCenter(treasure.col, treasure.row);
      const radius = this.CELL * (spell.radius || 2.8);
      for (const h of this.heroes) {
        if (!h.alive || Math.hypot(h.x - center.x, h.y - center.y) > radius) continue;
        this._pullHeroToward(h, center.x, spell.pullCells || 1);
        this._damageHero(
          h,
          h.maxHp * (spell.damageRatio || 0.14) + (spell.damageFlat || 18),
          '#6a645d'
        );
        applyStun(h, this.time, spell.stunDuration || 0.7);
        h.atkDebuffUntil = this.time + (spell.debuffDuration || 4);
        h.atkDebuffFactor = spell.atkFactor || 0.7;
        this.particles.burst(h.x, h.y, '#6a645d');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#6a645d');
    } else if (kind === 'doom_march') {
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        m.rageUntil = this.time + spell.duration;
        m.rageMul = spell.atkMul || 1.22;
        m.hasteUntil = this.time + spell.duration;
        m.hasteMul = spell.atkSpeedMul || 1.18;
        m.moveBuffUntil = this.time + spell.duration;
        m.moveBuffMul = spell.speedMul || 1.12;
        this.particles.burst(m.x, m.y, '#ef5350');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#ef5350');
    } else if (kind === 'chain_bolt') {
      const hops = spell.hops || 4;
      const jumpR = this.CELL * (spell.jumpRadius || 3.2);
      let current = this._frontHeroes(1)[0];
      if (!current) return false;
      const hit = new Set();
      for (let i = 0; i < hops && current; i++) {
        hit.add(current.id);
        const dmg =
          current.maxHp * (spell.damageRatio || 0.1) + (spell.damageFlat || 10) * (1 - i * 0.12);
        this._damageHero(current, dmg, '#a13d54');
        if (spell.frailDuration) {
          current.frailUntil = this.time + spell.frailDuration;
          current.frailMul = spell.frailMul || 1.2;
        }
        this.particles.magic(current.x, current.y - 8, '#a13d54');
        let next = null;
        let best = Infinity;
        for (const h of this.heroes) {
          if (!h.alive || hit.has(h.id)) continue;
          const d = dist(current, h);
          if (d <= jumpR && d < best) {
            best = d;
            next = h;
          }
        }
        if (next) this._beam(current, next, '#a13d54');
        current = next;
      }
      this._float(bannerX, 30, `${spell.name}!`, '#a13d54');
    } else if (kind === 'panic_bell') {
      for (const h of this.heroes) {
        if (!h.alive) continue;
        h.stunnedUntil = Math.max(h.stunnedUntil || 0, this.time + spell.duration);
        if (h.hp / Math.max(1, h.maxHp) <= (spell.executeThreshold || 0.55)) {
          this._damageHero(h, h.maxHp * (spell.damageRatio || 0.1), '#90a4ae');
        }
        this.particles.burst(h.x, h.y, '#90a4ae');
      }
      this._float(bannerX, 30, `${spell.name}!`, '#90a4ae');
    } else {
      return false;
    }

    this.spellCd[spellId] = spell.cooldown;
    if (this.challengeStats) this.challengeStats.spellsCast = (this.challengeStats.spellsCast || 0) + 1;
    this.hooks.onUpdate?.(this.snapshot());
    return true;
  }

  snapshot() {
    const focus = this.heroes.find((h) => h.alive) || null;
    const intent = focus ? intentLabel(focus.intent || 'moving') : null;
    const bosses = this.heroes.filter((h) => h.isBoss);
    const bossAlive = bosses.find((h) => h.alive) || null;
    const bossHero =
      bosses.length === 0
        ? null
        : {
            name: (bossAlive || bosses[0]).name,
            hp: bossAlive ? bossAlive.hp : 0,
            maxHp: (bossAlive || bosses[0]).maxHp,
            alive: !!bossAlive,
            color: (bossAlive || bosses[0]).color,
          };
    return {
      time: this.time,
      treasureHp: this.treasureHp,
      treasureMax: this.treasureMax,
      heroesAlive: this.heroes.filter((h) => h.alive).length,
      heroesTotal: this.run.wave.length,
      monstersAlive: this.monsters.filter((m) => m.alive).length,
      spellCd: { ...this.spellCd },
      spellIds: Object.keys(this.spellCd),
      bossId: this.bossId,
      bossName: getBoss(this.bossId).name,
      bossHero,
      result: this.result,
      globalSlow: this.time < this.globalSlowUntil,
      treasureShield: this.time < this.treasureShieldUntil ? this.treasureShield : 0,
      monsterRage: this.time < this.monsterRageUntil,
      focusName: focus?.name || '',
      focusClass: focus ? HERO_CLASS_LABELS[focus.class] || focus.class : '',
      focusIntent: intent?.text || '',
      focusIntentColor: intent?.color || '',
      draining: this.heroes.some((h) => h.alive && h.draining),
      speedMul: this.speedMul || 1,
      nextSpawnIn: this._nextSpawnIn(),
      mapName: this.map.name,
      costUsed: this.aliveCost(),
      costCap: this.costCap,
      freeCost: this.freeCost(),
      hand: { ...this.hand },
      selectedDeployId: this.selectedDeployId,
    };
  }

  _nextSpawnIn() {
    const pending = this.spawnQueue.find((h) => !h.spawned);
    if (!pending) return 0;
    return Math.max(0, pending.spawnDelay - this.time);
  }

  update(dt) {
    this.time += dt;
    Object.keys(this.spellCd).forEach((k) => {
      if (this.spellCd[k] > 0) this.spellCd[k] = Math.max(0, this.spellCd[k] - dt);
    });

    this.zones = this.zones.filter((z) => {
      z.ttl -= dt;
      return z.ttl > 0;
    });
    for (const z of this.zones) {
      if (!z.burnDps) continue;
      for (const h of this.heroes) {
        if (!h.alive || dist(h, z) > z.r) continue;
        applyBurn(h, this.time, { dps: z.burnDps, duration: Math.min(1.2, z.ttl + 0.2) });
      }
    }
    this.floatTexts = this.floatTexts.filter((f) => {
      f.ttl -= dt;
      f.y -= 20 * dt;
      return f.ttl > 0;
    });
    this.vfx = this.vfx.filter((v) => {
      v.ttl -= dt;
      return v.ttl > 0;
    });
    this.particles.update(dt);
    for (const m of this.monsters) if (m.flash > 0) m.flash -= dt;
    for (const h of this.heroes) if (h.flash > 0) h.flash -= dt;

    this._refreshHealRecvMuls();
      // Clear ephemeral buffs then re-apply auras before tile ATK resolve
    for (const m of this.monsters) {
      if (!m.alive) continue;
      m._elemAuraAtk = 1;
      m._elemAuraDef = 1;
      m._rainbowAtkMul = 1;
      m._rainbowAsMul = 1;
      m._rainbowFragile = 1;
      this._tickPotionFuse(m);
      this._tickElementAllyAura(m, dt);
      this._tickRainbowAuras(m, dt);
    }
    for (const h of this.heroes) {
      if (!h.alive) continue;
      h._allyAuraAtk = 1;
      h._allyAuraMoveSpeed = 1;
      this._tickHeroSupportAura(h, dt);
    }
    this._applyTileModifiers(dt);
    for (const h of this.heroes) {
      if (!h.alive) continue;
      h.atk = Math.round((h.baseAtk || h.atk) * (h._allyAuraAtk || 1));
      if (h._baseAtkSpeed) h.atkSpeed = h._baseAtkSpeed;
      if (h.tempSilenceUntil && this.time < h.tempSilenceUntil) h.silenced = true;
    }
    this._spawnHeroes();
    if (this.challengeStats) {
      const alive = this.monsters.filter((m) => m.alive).length;
      this.challengeStats.maxUnits = Math.max(this.challengeStats.maxUnits || 0, alive);
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        const cell = this._unitCell(m);
        const terr = terrainAt(this.map, cell.col, cell.row);
        if (terr === 'HIGH') this.challengeStats.highTileTime += dt;
      }
    }
    this._updateHeroes(dt);
    this._updateMonsters(dt);

    for (const m of this.monsters) {
      if (!m.alive || m.isTrap) continue;
      // DoT on monsters
      let mDot = tickStatusDots(m, this.time, dt);
      if (mDot > 0) {
        mDot = applyIncomingDamage(m, Math.round(mDot / (m.tileDefMul || 1)), this.time);
        m.hp -= mDot;
        this._applyDotVfx(m, dt, mDot);
        if (m.hp <= 0) {
          m.alive = false;
          this._onMonsterDeath(m, null);
          continue;
        }
      }
      const mCell = this._unitCell(m);
      const mKey = `${mCell.col},${mCell.row}`;
      if (this.map.hazard?.has(mKey)) {
        const hzDmg = 12 * dt;
        m.hp -= hzDmg;
        applyBurn(m, this.time, { dps: 16, duration: 2.4 });
        m._hazardVfxCd = (m._hazardVfxCd || 0) - dt;
        if (m._hazardVfxCd <= 0) {
          m._hazardVfxCd = 0.38;
          this.particles.burst(m.x, m.y - 4, '#ff7043');
          this._floatStatusOnce(m, 'hazard', 'GAI!', '#ff7043');
        }
        this._applyDotVfx(m, dt, hzDmg);
        if (m.hp <= 0) {
          m.alive = false;
          this._onMonsterDeath(m, null);
          continue;
        }
      }
      if (m.passive === 'SLOW_AURA') {
        const radius = auraRadiusCells(m) * this.CELL;
        for (const h of this.heroes) {
          if (!h.alive) continue;
          if (dist(h, m) <= radius) {
            applySlow(h, this.time, { factor: 0.62, duration: 0.45 });
          }
        }
        if (Math.random() < dt * 1.2) {
          this.particles.frost(m.x + (Math.random() - 0.5) * 12, m.y);
        }
      }
      if (m.passive === 'AURA_STUN') {
        const radius = auraRadiusCells(m) * this.CELL;
        m._auraStunCd = (m._auraStunCd || 0) - dt;
        if (m._auraStunCd <= 0) {
          for (const h of this.heroes) {
            if (!h.alive) continue;
            if (dist(h, m) <= radius) {
              applyStun(h, this.time, 0.55);
              this._floatStatusOnce(h, 'stun', 'CHOÁNG', '#ffe082');
            }
          }
          m._auraStunCd = 4.5;
        }
      }
      if (m.passive === 'AURA_TAUNT') {
        const radius = auraRadiusCells(m) * this.CELL;
        for (const h of this.heroes) {
          if (!h.alive) continue;
          if (dist(h, m) <= radius && h.intent === 'fighting') {
            h.fightTarget = m;
          }
        }
      }
      if (m.passive === 'ROOT_AURA') {
        const radius = auraRadiusCells(m) * this.CELL;
        m._rootAuraCd = (m._rootAuraCd || 0) - dt;
        if (m._rootAuraCd <= 0) {
          for (const h of this.heroes) {
            if (!h.alive) continue;
            if (dist(h, m) <= radius) {
              applyRoot(h, this.time, 1.1);
              this._floatStatusOnce(h, 'root', 'KẸP!', '#aed581');
            }
          }
          m._rootAuraCd = 3.8;
        }
      }
      if (m.passive === 'CLEANSE_ALLY' || m.skills?.includes('CLEANSE_ALLY')) {
        m._cleanseCd = (m._cleanseCd ?? 4.5) - dt;
        if (m._cleanseCd <= 0) {
          cleanseAlliesInRadius(
            m,
            this.monsters.filter((x) => !x.isTrap),
            this.CELL * (m.auraRadius || 2.4),
            this._float?.bind(this),
            this.particles
          );
          m._cleanseCd = 5.2;
        }
      }
      if (m.passive === 'CD_REDUCTION' || m.skills?.includes('CD_REDUCTION')) {
        m._cdAuraT = (m._cdAuraT || 0) - dt;
        if (m._cdAuraT <= 0) {
          const r = this.CELL * (m.auraRadius || 2.2);
          for (const ally of this.monsters) {
            if (!ally.alive || ally.isTrap || ally === m) continue;
            if (dist(m, ally) > r) continue;
            applyCdReduction(ally, this.time, { factor: 0.72, duration: 1.2 });
          }
          m._cdAuraT = 2.8;
        }
      }
      if (
        (m.passive === 'INVULNERABLE_PROC' || m.skills?.includes('INVULNERABLE_PROC')) &&
        m.hp / Math.max(1, m.maxHp) <= 0.3
      ) {
        if (!(m.invulnCdUntil && this.time < m.invulnCdUntil)) {
          applyInvulnerable(m, this.time, 1.6);
          m.invulnCdUntil = this.time + 14;
          this._float(m.x, m.y - 12, 'Bất tử!', '#fff59d');
        }
      }
      if (m.passive === 'HEAL_AURA' || m.passive === 'HEAL_PULSE') {
        this._tickMonsterHeal(m, dt);
      }
      if (m.tags?.includes('heal') && m.passive?.startsWith('MYTHIC_')) {
        this._tickMonsterHeal(m, dt);
      }
      this._tickMythicDrawbacks(m, dt);
    }
    for (const h of this.heroes) {
      if (!h.alive) continue;
      if (h.class === 'MAGE' && Math.random() < dt * 2) {
        this.particles.magic(h.x + (Math.random() - 0.5) * 10, h.y - 14, h.color);
      }
      if (h.skills?.includes('CLEANSE_ALLY')) {
        h._cleanseCd = (h._cleanseCd ?? 4.8) - dt;
        if (h._cleanseCd <= 0) {
          cleanseAlliesInRadius(
            h,
            this.heroes,
            this.CELL * 2.8,
            this._float?.bind(this),
            this.particles
          );
          h._cleanseCd = 5.5;
        }
      }
    }

    this._checkEnd();
    this.hooks.onUpdate?.(this.snapshot());
  }

  _applyTileModifiers(dt) {
    for (const h of this.heroes) {
      if (!h.alive) continue;
      const { col, row } = this._unitCell(h);
      const mod = getTileModifiers(this.map, col, row, 'hero', h);
      h.tileSpeedMul = mod.speedMul;
      h.effectiveRange = Math.max(this.CELL * 0.8, h.range + mod.rangeAdd * this.CELL);
      if (h.rangeCutUntil && this.time < h.rangeCutUntil) {
        h.effectiveRange *= h.rangeCutFactor || 0.55;
      }
      if (mod.healPerSec > 0 && !mod.healCut) {
        this._applyHealTo(h, mod.healPerSec * dt, { quiet: true });
      }
      h.tileHealCut = !!mod.healCut;
      if (mod.reveal) h.revealed = true;
      if (mod.silence) h.silenced = true;
      if (mod.defMul !== 1) h.tileDefMul = mod.defMul;
      else h.tileDefMul = 1;
      const terr = this.map.terrain[`${col},${row}`];
      if (terr === 'FIRE' && Math.random() < dt * 1.2) {
        applyBurn(h, this.time, { dps: 14, duration: 1.6 });
      }
      if (terr === 'POISON' && Math.random() < dt * 1.0) {
        applyPoison(h, this.time, { dps: 12, duration: 2.0 });
      }
    }
    for (const m of this.monsters) {
      if (!m.alive) continue;
      const { col, row } = this._unitCell(m);
      m.col = col;
      m.row = row;
      const mod = getTileModifiers(this.map, col, row, 'monster', m);
      m.tileAtkMul = mod.atkMul;
      m.tileDefMul = mod.defMul;
      m.tileSpeedMul = mod.speedMul;
      if (m.passive === 'MYTHIC_GLASS') {
        m.tileDefMul *= 0.55;
      }
      if (m.passive === 'MYTHIC_ALLY_SLOW') {
        // bản thân không bị chậm bởi aura của mình
      }
      let atkMul = mod.atkMul;
      if (this.time < this.monsterRageUntil) atkMul *= this.monsterRageMul;
      if (m.rageUntil && this.time < m.rageUntil) atkMul *= m.rageMul || 1.35;
      if (m._rainbowAtkMul) atkMul *= m._rainbowAtkMul;
      if (m._elemAuraAtk) atkMul *= m._elemAuraAtk;
      m.atk = Math.round((m.baseAtk || m.atk) * atkMul);
      if (m._baseAtkSpeed) m.atkSpeed = m._baseAtkSpeed;
      if (m._rainbowAsMul) m.atkSpeed = (m._baseAtkSpeed || m.atkSpeed) * m._rainbowAsMul;
      if (m.hasteUntil && this.time < m.hasteUntil) {
        m.atkSpeed *= m.hasteMul || 1.15;
      }
      if (m._elemAuraDef && m._elemAuraDef !== 1) m.tileDefMul *= m._elemAuraDef;
      if (m._rainbowFragile && m._rainbowFragile !== 1) m.tileDefMul *= m._rainbowFragile;
      if (mod.healPerSec > 0 && !mod.healCut) {
        this._applyHealTo(m, mod.healPerSec * dt, { quiet: true });
      }
      m.tileHealCut = !!mod.healCut;
      const terr = this.map.terrain[`${col},${row}`];
      if (terr === 'FIRE' && Math.random() < dt * 1.1) {
        applyBurn(m, this.time, { dps: 14, duration: 1.8 });
      }
      if (terr === 'POISON' && Math.random() < dt * 0.95) {
        applyPoison(m, this.time, { dps: 12, duration: 2.0 });
      }
    }

    // Ally slow from mythic doom bell
    for (const src of this.monsters) {
      if (!src.alive || src.passive !== 'MYTHIC_ALLY_SLOW') continue;
      const radius = (src.range || 3) * this.CELL * 0.85;
      for (const ally of this.monsters) {
        if (!ally.alive || ally === src || ally.isTrap) continue;
        if (dist(ally, src) > radius) continue;
        ally.atk = Math.round((ally.baseAtk || ally.atk) * (ally.tileAtkMul || 1) * 0.82);
        ally.atkSpeed = (ally._baseAtkSpeed || ally.atkSpeed) * 0.85;
      }
    }
  }

  _tickPotionFuse(m) {
    if (!m.alive || !String(m.passive || '').startsWith('POTION_')) return;
    if (m.fuseUntil == null) m.fuseUntil = this.time + 1;
    if (this.time < m.fuseUntil) {
      if (Math.random() < 0.08) {
        this.particles.magic?.(m.x, m.y - 6, m.color);
      }
      return;
    }
    if (m._potionFired) return;
    m._potionFired = true;
    const r = (m.range || this.CELL * 2.2);
    this.particles.burst(m.x, m.y, m.color || '#fff');
    if (m.passive === 'POTION_POISON') {
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (dist(h, m) > r) continue;
        const fromAtk = Math.max(36, computePoisonDps(m, { dedicated: true }));
        const fromHp = Math.round((h.maxHp || 0) * 0.04);
        const poisonDps = Math.max(fromAtk, fromHp);
        const burst = Math.round(m.atk * 0.9 + (h.maxHp || 0) * 0.1);
        let dmg = applyIncomingDamage(h, burst, this.time);
        dmg = Math.round(dmg / (h.tileDefMul || 1));
        h.hp -= dmg;
        applyPoison(h, this.time, { dps: poisonDps, duration: 6.5 });
        this._float(h.x, h.y - 10, `Độc -${dmg}`, '#9ccc65');
        this.particles.poison?.(h.x, h.y);
      }
      this._float(m.x, m.y - 12, 'NỔ ĐỘC!', m.color);
    } else if (m.passive === 'POTION_HEAL') {
      for (const ally of this.monsters) {
        if (!ally.alive || ally.isTrap) continue;
        if (dist(ally, m) > r) continue;
        const raw = ally.maxHp * 0.3;
        this._applyHealTo(ally, raw);
        this._float(ally.x, ally.y - 8, 'Hồi!', '#81c784');
      }
      this._float(m.x, m.y - 12, 'NỔ HỒI!', m.color);
    } else if (m.passive === 'POTION_RAGE') {
      for (const ally of this.monsters) {
        if (!ally.alive || ally.isTrap) continue;
        if (dist(ally, m) > r) continue;
        ally.rageUntil = this.time + 4;
        ally.rageMul = 1.35;
        this._float(ally.x, ally.y - 8, 'Cuồng!', '#ef5350');
      }
      this._float(m.x, m.y - 12, 'NỔ CUỒNG!', m.color);
    }
    m.hp = 0;
    m.alive = false;
    if (this.challengeStats) this.challengeStats.usedPotion = true;
    this._onMonsterDeath(m, null);
  }

  _tickHeroSupportAura(hero, dt) {
    if (!hero.alive) return;
    const skills = hero.skills || [];
    const radius = Math.max(this.CELL * 1.8, (hero.range || this.CELL * 3) * 0.9);
    if (skills.includes('HERO_AURA_ATK')) {
      for (const ally of this.heroes) {
        if (!ally.alive) continue;
        if (dist(ally, hero) > radius) continue;
        ally._allyAuraAtk = Math.max(ally._allyAuraAtk || 1, 1.22);
      }
    }
    if (skills.includes('HERO_AURA_SPEED')) {
      for (const ally of this.heroes) {
        if (!ally.alive) continue;
        if (dist(ally, hero) > radius) continue;
        ally._allyAuraMoveSpeed = Math.max(ally._allyAuraMoveSpeed || 1, 1.28);
      }
    }
    if (skills.includes('HERO_AURA_SHIELD')) {
      hero._shieldAuraCd = (hero._shieldAuraCd || 0) - dt;
      if (hero._shieldAuraCd <= 0) {
        for (const ally of this.heroes) {
          if (!ally.alive) continue;
          if (dist(ally, hero) > radius) continue;
          ally.shieldHp = Math.max(ally.shieldHp || 0, Math.round(ally.maxHp * 0.12));
          ally.shieldUntil = this.time + 3.6;
          this._float(ally.x, ally.y - 10, 'Khiên!', '#90caf9');
        }
        hero._shieldAuraCd = 5.2;
      }
    }
  }

  _tickElementAllyAura(m, dt) {
    if (!m.alive) return;
    const tag = elementAuraTag(m.passive);
    if (!tag) return;
    const cell = this._unitCell(m);
    const terr = terrainAt(this.map, cell.col, cell.row);
    if (!elementAuraActive(m.passive, terr)) return;
    const radius = auraRadiusCells(m) * this.CELL;
    for (const ally of this.monsters) {
      if (!ally.alive || ally === m || ally.isTrap) continue;
      if (!(ally.tags || []).includes(tag)) continue;
      if (dist(ally, m) > radius) continue;
      ally._elemAuraAtk = Math.max(ally._elemAuraAtk || 1, 1.2);
      ally._elemAuraDef = Math.max(ally._elemAuraDef || 1, 1.12);
      if (dt > 0 && Math.random() < dt * 0.35) {
        this._applyHealTo(ally, ally.maxHp * 0.008 * dt * 8, { quiet: true });
      }
    }
  }

  _tickRainbowAuras(m, dt) {
    if (!m.alive) return;
    if (m.passive === 'RAINBOW_MAP_HEAL') {
      for (const ally of this.monsters) {
        if (!ally.alive || ally.isTrap) continue;
        this._applyHealTo(ally, ally.maxHp * 0.012 * dt, { quiet: true });
      }
      // drawback: small heal to nearby heroes + treasure tax
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (dist(h, m) < this.CELL * 3.5) {
          this._applyHealTo(h, h.maxHp * 0.004 * dt, { quiet: true });
        }
      }
      if (this.treasureHp != null) {
        this.treasureHp = Math.max(0, this.treasureHp - 5 * dt);
      }
      m._rainbowAsMul = 0.7;
      return;
    }
    if (m.passive === 'RAINBOW_MAP_ATK') {
      for (const ally of this.monsters) {
        if (!ally.alive || ally.isTrap) continue;
        ally._rainbowAtkMul = 1.28;
        ally._rainbowFragile = 0.74;
      }
      m._rainbowAsMul = 0.55;
      m._silenceCd = (m._silenceCd || 0) - dt;
      if (m._silenceCd <= 0) {
        m.silenced = true;
        m._silenceUntil = this.time + 1.4;
        m._silenceCd = 7;
        this._float(m.x, m.y - 10, 'Tự câm', '#ce93d8');
      }
      if (m._silenceUntil && this.time >= m._silenceUntil) {
        m.silenced = false;
        m._silenceUntil = 0;
      }
      return;
    }
    if (m.passive === 'RAINBOW_MAP_SHIELD') {
      m._shieldPulse = (m._shieldPulse || 0) - dt;
      if (m._shieldPulse <= 0) {
        for (const ally of this.monsters) {
          if (!ally.alive || ally.isTrap) continue;
          ally.shieldHp = Math.max(ally.shieldHp || 0, Math.round(ally.maxHp * 0.12));
          ally.shieldUntil = this.time + 3.2;
        }
        m._shieldPulse = 5.5;
        this._float(m.x, m.y - 12, 'Khiên Cầu!', '#7c4dff');
      }
      m.atk = Math.max(1, Math.round((m.baseAtk || m.atk) * 0.15));
      m._rainbowAsMul = 0.4;
    }
  }

  _tickMythicDrawbacks(m, dt) {
    if (!m.alive) return;
    if (m.passive === 'MYTHIC_SELF_DRAIN') {
      const drain = m.maxHp * 0.04 * dt;
      m.hp -= drain;
      if (Math.random() < dt * 2) {
        this.particles.burst(m.x, m.y - 4, '#7e57c2');
      }
      if (m.hp <= 0) {
        m.alive = false;
        this._onMonsterDeath(m, null);
      }
      return;
    }
    if (m.passive === 'MYTHIC_TREASURE_TAX') {
      const tax = 3 * dt;
      if (this.treasureHp != null) {
        this.treasureHp = Math.max(0, this.treasureHp - tax);
      }
      if (Math.random() < dt * 1.5) {
        this.particles.burst(m.x, m.y - 8, '#e53935');
      }
    }
    if (m.passive === 'MYTHIC_INFERNO') {
      const cell = this._unitCell(m);
      const terr = terrainAt(this.map, cell.col, cell.row);
      if (terr !== 'FIRE') {
        m.hp -= m.maxHp * 0.01 * dt;
        if (Math.random() < dt * 2) this.particles.burn?.(m.x, m.y);
        if (m.hp <= 0) {
          m.alive = false;
          this._onMonsterDeath(m, null);
        }
      }
      // also apply burn on nearby heroes occasionally
      if (Math.random() < dt * 0.8) {
        const burnDps = computeBurnDps(m, { dedicated: true });
        for (const h of this.heroes) {
          if (!h.alive) continue;
          if (dist(h, m) < m.range * 0.9) applyBurn(h, this.time, { dps: burnDps, duration: 2.4 });
        }
      }
    }
    if (m.passive === 'MYTHIC_TOXIN') {
      const r = this.CELL * 2.2;
      // Drawback: %maxHp như mythic khác (không còn flat 4 HP/s)
      for (const ally of this.monsters) {
        if (!ally.alive || ally === m || ally.isTrap) continue;
        if (dist(ally, m) > r) continue;
        ally.hp -= Math.max(8, ally.maxHp * 0.012) * dt;
        if (ally.hp <= 0) {
          ally.alive = false;
          this._onMonsterDeath(ally, null);
        }
      }
      const poisonDps = computePoisonDps(m, { dedicated: true });
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (dist(h, m) < m.range) applyPoison(h, this.time, { dps: poisonDps, duration: 2.8 });
      }
    }
    if (m.passive === 'MYTHIC_STASIS') {
      if (m._stasisSelfLock && this.time < m._stasisSelfLock) {
        m.atkCd = Math.max(m.atkCd || 0, 0.3);
      }
    }
  }

  _waveBaseDelay(waveIndex) {
    const wi = waveIndex || 1;
    let min = Infinity;
    for (const h of this.spawnQueue) {
      if ((h.waveIndex || 1) !== wi) continue;
      min = Math.min(min, Number(h.spawnDelay) || 0);
    }
    return Number.isFinite(min) ? min : 0;
  }

  _isWaveCleared(waveIndex) {
    const wi = waveIndex || 1;
    const anyPending = this.spawnQueue.some(
      (h) => !h.spawned && (h.waveIndex || 1) === wi
    );
    if (anyPending) return false;
    return !this.heroes.some((h) => h.alive && (h.waveIndex || 1) === wi);
  }

  _unlockWaves() {
    if (!this._waveUnlocked) this._waveUnlocked = { 1: 0 };
    let maxWave = 1;
    for (const h of this.spawnQueue) {
      maxWave = Math.max(maxWave, h.waveIndex || 1);
    }
    for (let wi = 2; wi <= maxWave; wi++) {
      if (this._waveUnlocked[wi] != null) continue;
      if (!this._isWaveCleared(wi - 1)) break;
      this._waveUnlocked[wi] = this.time + 1.2;
      this._float(this.CELL * 2, 36, `Đợt ${wi} tiến vào!`, '#ffcc80');
    }
  }

  _spawnHeroes() {
    this._unlockWaves();
    for (const h of this.spawnQueue) {
      if (h.spawned) continue;
      const wi = h.waveIndex || 1;
      if (this._waveUnlocked?.[wi] == null) continue;
      const waveBase = this._waveBaseDelay(wi);
      const relative = Math.max(0, (Number(h.spawnDelay) || 0) - waveBase);
      const unlockAt = this._waveUnlocked[wi] ?? 0;
      if (this.time < unlockAt + relative) continue;

      h.spawned = true;
      const gate =
        h.formation?.col != null
          ? { col: h.formation.col, row: h.formation.row }
          : this.map.gate[Math.floor(Math.random() * this.map.gate.length)];
      const entry = this._cellCenter(gate.col, gate.row);
      const gateX = -28;
      this.heroes.push({
        id: uid(),
        templateId: h.id,
        name: h.name,
        class: h.class,
        color: h.color,
        skills: h.skills || [],
        waveIndex: wi,
        maxHp: h.maxHp || h.hp,
        hp: h.maxHp || h.hp,
        baseAtk: h.atk,
        atk: h.atk,
        baseSpeed: h.speed * 0.85,
        speed: h.speed * 0.85,
        range: h.range * this.CELL,
        effectiveRange: h.range * this.CELL,
        _baseAtkSpeed: h.atkSpeed * 0.9,
        atkSpeed: h.atkSpeed * 0.9,
        aoeRadius: (h.aoeRadius || 0) * this.CELL,
        stealth: !!h.stealth,
        isBoss: !!(h.isBoss || h.class === 'BOSS'),
        revealed: false,
        silenced: false,
        stunnedUntil: 0,
        frozenUntil: 0,
        slowFactor: 1,
        tileSpeedMul: 1,
        tileDefMul: 1,
        x: gateX,
        y: entry.y,
        atkCd: 0.4,
        alive: true,
        panicking: false,
        path: [{ col: gate.col, row: gate.row }],
        pathIdx: 0,
        draining: false,
        intent: 'entering',
        fightTarget: null,
        facing: 1,
        flash: 0.35,
        bobPhase: Math.random() * Math.PI * 2,
        spawnProtect: 0.55,
        hasRevived: false,
        inStasis: false,
        stasisUntil: 0,
      });
      this.particles.magic(gateX, entry.y, h.color);
      this.particles.burst(gateX, entry.y, '#81c784');
      this._float(gateX, entry.y - 24, `${h.name} vào!`, h.color);
      const viewW = this._viewWorldW();
      this.cameraX = Math.max(COMBAT.CAMERA_MIN_X, Math.min(0, gateX - viewW * 0.25));
    }
  }

  _processHeroDeath(hero) {
    if (!hero.alive || hero.hp > 0 || hero.inStasis) return;
    const canStasis =
      !hero.hasRevived &&
      (hero.skills?.includes('STASIS_REVIVE') || hero.tags?.includes('stasis_revive'));
    if (canStasis) {
      tryEnterStasisRevive(hero, this.time, this._float?.bind(this), this.particles);
      return;
    }
    const canRevive =
      !hero.hasRevived &&
      (hero.skills?.includes('REVIVE') || hero.tags?.includes('revive'));
    if (canRevive) {
      hero.hasRevived = true;
      hero.alive = true;
      hero.hp = Math.max(1, Math.round(hero.maxHp * 0.4));
      hero.shieldHp = Math.round(hero.maxHp * 0.2);
      hero.shieldUntil = this.time + 2.8;
      hero.panicking = false;
      hero.flash = 0.45;
      this.particles.magic(hero.x, hero.y - 8, '#fff59d');
      this._float(hero.x, hero.y - 14, 'Sống lại!', '#fff59d');
    } else if (hero.skills?.includes('SELF_DESTRUCT') && !hero._exploded) {
      hero._exploded = true;
      hero.alive = false;
      const r = this.CELL * 2.2;
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        if (dist(hero, m) > r) continue;
        let dmg = Math.max(10, Math.round(m.maxHp * 0.22 + hero.atk * 0.9));
        dmg = applyIncomingDamage(m, dmg, this.time);
        m.hp -= dmg;
        this._float(m.x, m.y - 8, `-${dmg}`, '#ff7043');
        if (m.hp <= 0) {
          m.alive = false;
          this._onMonsterDeath(m, hero);
        }
      }
      this.particles.burst(hero.x, hero.y, '#ff7043');
      this._float(hero.x, hero.y, 'NỔ!', '#ff7043');
    } else {
      hero.alive = false;
      this.particles.death(hero.x, hero.y, hero.color);
      this._float(hero.x, hero.y, 'Hạ!', '#fff');
      if (this.challengeStats) {
        this.challengeStats.heroDeaths = (this.challengeStats.heroDeaths || 0) + 1;
        if (
          (hero.class === 'ROGUE' || hero.skills?.includes('STEALTH')) &&
          !this.challengeStats.anyHeroDrained
        ) {
          this.challengeStats.roguesKilledBeforeDrain =
            (this.challengeStats.roguesKilledBeforeDrain || 0) + 1;
        }
      }
    }
  }

  _updateHeroes(dt) {
    const ctx = this._brainCtx();
    ctx.dt = dt;

    for (const hero of this.heroes) {
      if (!hero.alive) continue;
      ensureAttackState(hero);
      hero._time = this.time;
      if (hero.atkCd > 0) hero.atkCd -= dt;
      hero.animT = (hero.animT || 0) + dt * (hero.panicking ? 4 : 2.5);

      // Lethal từ frame trước (vd. Báo Bóng đánh khi hero đang choáng)
      this._processHeroDeath(hero);
      if (!hero.alive) continue;

      if (hero.inStasis) {
        tickStasisRevive(hero, this.time, dt, this._float?.bind(this), this.particles);
        hero.intent = 'stasis';
        hero.fightTarget = null;
        hero.telegraph = null;
        continue;
      }

      if (!hero.panicking && hero.hp / hero.maxHp <= COMBAT.PANIC_HP_RATIO) {
        hero.panicking = true;
        hero.path = null;
        this._float(hero.x, hero.y, 'Hoảng loạn!', '#ffeb3b');
      }

      const stunned = this.time < hero.stunnedUntil;
      const frozen = this.time < hero.frozenUntil;
      if (hero.panicking) hero.facing = -1;
      hero.fightTarget = null;
      hero.telegraph = null;

      // DoT / bẫy vẫn tick khi bị CC — tránh “bất tử” khi bị perma-stun
      for (const m of this.monsters) {
        if (!m.alive || !m.isTrap) continue;
        if (dist(hero, m) < this.CELL * 0.55) {
          this._triggerTrap(m, hero);
        }
      }

      let heroDot = tickStatusDots(hero, this.time, dt);
      if (heroDot > 0) {
        heroDot = applyIncomingDamage(
          hero,
          Math.round(heroDot / (hero.tileDefMul || 1)),
          this.time
        );
        hero.hp -= heroDot;
        this._applyDotVfx(hero, dt, heroDot);
      }

      const hz = this._unitCell(hero);
      if (this.map.hazard?.has(`${hz.col},${hz.row}`)) {
        const hzDmg = 10 * dt;
        hero.hp -= hzDmg;
        applyBurn(hero, this.time, { dps: 14, duration: 2.2 });
        hero._hazardVfxCd = (hero._hazardVfxCd || 0) - dt;
        if (hero._hazardVfxCd <= 0) {
          hero._hazardVfxCd = 0.4;
          this.particles.burn?.(hero.x, hero.y - 6);
          this._floatStatusOnce(hero, 'hazard', 'GAI!', '#ff7043');
        }
        this._applyDotVfx(hero, dt, hzDmg);
      }

      this._processHeroDeath(hero);
      if (!hero.alive) continue;

      if (stunned) {
        hero.intent = 'stunned';
        continue;
      }
      if (frozen) {
        hero.intent = 'frozen';
        continue;
      }

      // Charm: đánh đồng minh gần nhất hoặc đứng yên (không rút kho)
      if (hero.charmedUntil && this.time < hero.charmedUntil) {
        hero.intent = 'fighting';
        hero.draining = false;
        let ally = null;
        let best = Infinity;
        for (const o of this.heroes) {
          if (!o.alive || o === hero) continue;
          const d = dist(hero, o);
          if (d < best) {
            best = d;
            ally = o;
          }
        }
        if (ally && best < this.CELL * 4.5) {
          hero.fightTarget = ally;
          if (best <= (hero.effectiveRange || hero.range)) {
            hero._charmHitCd = (hero._charmHitCd || 0) - dt;
            if (hero._charmHitCd <= 0) {
              hero._charmHitCd = 1 / Math.max(0.4, hero.atkSpeed || 1);
              this._damageHero(ally, Math.round(hero.atk * 0.55), '#f48fb1', 'Mê!');
              this.particles.magic(ally.x, ally.y - 6, '#f48fb1');
            }
          } else if (!isRooted(hero, this.time)) {
            let spd = hero.speed * this.CELL * 0.35 * heroSpeedMultiplier(hero, ctx);
            const dx = ally.x - hero.x;
            const dy = ally.y - hero.y;
            const len = Math.hypot(dx, dy) || 1;
            hero.x += (dx / len) * spd * dt;
            hero.y += (dy / len) * spd * dt;
          }
        }
        this._processHeroDeath(hero);
        continue;
      }

      // Continue attack FSM even while deciding
      const atkBusy = this._tickUnitAttack(hero, dt, 'hero');

      if (hero.spawnProtect > 0) {
        hero.spawnProtect -= dt;
        hero.intent = 'entering';
        this._followPath(hero, dt, ctx);
        if (hero.pathIdx >= (hero.path?.length || 0)) {
          hero.spawnProtect = 0;
          hero.path = null;
        }
        this._processHeroDeath(hero);
        continue;
      }

      if (atkBusy) {
        hero.intent = 'fighting';
        const t = this.monsters.find((x) => x.id === hero.atkTargetId);
        if (t) hero.fightTarget = t;
        this._processHeroDeath(hero);
        continue;
      }

      // Monster TAUNT_SELF: ép hero tiến/đánh tank
      if (hero.forcedTargetId && this.time < (hero.forcedTargetUntil || 0)) {
        const forced = this.monsters.find(
          (x) => x.id === hero.forcedTargetId && x.alive && !x.isTrap
        );
        if (forced && !hero.panicking) {
          const dF = dist(hero, forced);
          const fr = hero.effectiveRange || hero.range;
          hero.intent = 'fighting';
          hero.fightTarget = forced;
          if (dF <= fr) {
            const profile = getHeroProfile(hero.templateId, hero.class);
            const pat = patternForHero(hero, profile);
            beginAttack(hero, forced, pat, this.time);
            if (hero.atkPhase === 'windup') hero.atkCd = 1 / hero.atkSpeed;
          } else {
            let spd = hero.speed * this.CELL * 0.42 * heroSpeedMultiplier(hero, ctx);
            if (hero.slowUntil && this.time < hero.slowUntil) spd *= hero.slowFactor ?? 0.55;
            const dx = forced.x - hero.x;
            const dy = forced.y - hero.y;
            const len = Math.hypot(dx, dy) || 1;
            hero.facing = dx >= 0 ? 1 : -1;
            hero.x += (dx / len) * spd * dt;
            hero.y += (dy / len) * spd * dt;
            hero.path = null;
          }
          this._processHeroDeath(hero);
          continue;
        }
      }

      const decision = tickHeroBrain(hero, ctx);
      const profile = decision.profile || getHeroProfile(hero.templateId, hero.class);

      if (decision.action === 'fight' && decision.target) {
        hero.intent = 'fighting';
        hero.fightTarget = decision.target;
        const pat = patternForHero(hero, profile);
        beginAttack(hero, decision.target, pat, this.time);
        if (hero.atkPhase === 'windup') {
          hero.atkCd = 1 / hero.atkSpeed;
        }
      } else if (decision.action === 'kite' && decision.target) {
        hero.intent = 'kiting';
        rebuildKitePath(hero, decision.target, ctx);
        this._followPath(hero, dt, ctx);
        if (dist(hero, decision.target) <= (hero.effectiveRange || hero.range)) {
          const pat = patternForHero(hero, profile);
          beginAttack(hero, decision.target, pat, this.time);
          if (hero.atkPhase === 'windup') hero.atkCd = 1 / hero.atkSpeed;
        }
      } else if (decision.action === 'flee' || hero.panicking) {
        hero.intent = 'fleeing';
        if (!hero.path || hero.pathIdx >= hero.path.length) rebuildHeroPath(hero, ctx);
        this._followPath(hero, dt, ctx);
        const cell = this._unitCell(hero);
        if (
          this.map.gate.some((g) => g.col === cell.col && g.row === cell.row) &&
          hero.x < this.CELL * 0.6
        ) {
          hero.alive = false;
          hero.fled = true;
          this._float(hero.x, hero.y, 'Bỏ chạy!', '#ffeb3b');
        }
      } else {
        hero.intent = 'moving';
        if (!hero.path || hero.pathIdx >= hero.path.length) rebuildHeroPath(hero, ctx);
        this._followPath(hero, dt, ctx);
        const cell = this._unitCell(hero);
        if (this.map.treasure.some((t) => t.col === cell.col && t.row === cell.row)) {
          hero.draining = true;
        }
      }

      if (hero.draining && hero.alive && !hero.panicking) {
        hero.intent = 'draining';
        this.challengeStats.anyHeroDrained = true;
        if (hero.isBoss || hero.class === 'BOSS') this.challengeStats.bossDrained = true;
        let drain = 18 * dt;
        if (this.treasureShield > 0 && this.time < this.treasureShieldUntil) {
          const absorb = Math.min(this.treasureShield, drain);
          this.treasureShield -= absorb;
          drain -= absorb;
        }
        this.treasureHp -= drain;
        if (this.treasureHp <= 0) this.treasureHp = 0;
        if (Math.random() < dt * 10) this.particles.gold(hero.x, hero.y - 6);
      }

      this._processHeroDeath(hero);
    }

    // Camera is player-controlled (pan / focus buttons). Keep clamped only.
    this.cameraX = this.clampCameraX(this.cameraX);
  }

  /** @returns {boolean} busy in attack */
  _tickUnitAttack(unit, dt, side) {
    const result = tickAttack(
      unit,
      dt,
      (id) => {
        if (side === 'hero') return this.monsters.find((m) => m.id === id && m.alive);
        return this.heroes.find((h) => h.id === id && h.alive);
      },
      (target, pattern) => {
        if (side === 'hero') this._heroAttack(unit, target, pattern);
        else this._monsterAttack(unit, target, pattern);
      }
    );
    if (result.telegraph && result.target) {
      const aoe =
        side === 'hero'
          ? unit.aoeRadius || this.CELL * 1.5
          : result.pattern?.aoe
            ? this.CELL * 2.2
            : this.CELL * 0.9;
      const tgColor =
        statusTelegraphColor(side === 'hero' ? unit.skills : unit.passive) ||
        unit.color ||
        '#fff';
      unit.telegraph = {
        x: result.target.x,
        y: result.target.y,
        r: aoe * 1.15,
        color: tgColor,
        pulse: true,
      };
    } else if (unit.atkPhase === 'idle') {
      unit.telegraph = null;
    }
    return result.busy;
  }

  _followPath(hero, dt, ctx) {
    if (isRooted(hero, this.time)) return;
    if (!hero.path || hero.pathIdx >= hero.path.length) return;
    const node = hero.path[hero.pathIdx];
    const dest = this._cellCenter(node.col, node.row);
    const speedMul = heroSpeedMultiplier(hero, ctx);
    const spd = hero.baseSpeed * this.CELL * 0.75 * speedMul;
    const dx = dest.x - hero.x;
    const dy = dest.y - hero.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 4) {
      hero.pathIdx++;
      hero.x = dest.x;
      hero.y = dest.y;
    } else {
      hero.x += (dx / d) * spd * dt;
      hero.y += (dy / d) * spd * dt;
      if (Math.abs(dx) > 1) hero.facing = dx >= 0 ? 1 : -1;
    }
  }

  _triggerTrap(m, hero) {
    const fx = TRAP_EFFECTS[m.passive] || TRAP_EFFECTS.TRAP_SPIKE;
    const fromAtk = Math.round(m.atk * (fx.dmgMul ?? 1));
    const fromHp = Math.round((hero.maxHp || hero.hp || 0) * (fx.hpRatio ?? 0));
    let raw = fromAtk + fromHp;
    let dmg = applyIncomingDamage(hero, raw, this.time);
    dmg = Math.round(dmg / (hero.tileDefMul || 1));
    hero.hp -= dmg;
    hero.flash = 0.25;
    const label =
      fx.kind === 'slow'
        ? 'Dầu!'
        : fx.kind === 'burn'
          ? 'Đốt!'
          : fx.kind === 'poison'
            ? 'Độc!'
            : fx.kind === 'freeze'
              ? 'Băng!'
              : fx.kind === 'stun'
                ? 'Choáng!'
                : `Bẫy -${dmg}`;
    this._float(hero.x, hero.y - 10, label, m.color || '#ff7043');
    this.particles.burst(m.x, m.y, m.color || '#ff7043');

    if (fx.kind === 'slow') applySlow(hero, this.time, { factor: fx.slowFactor, duration: fx.slowDur });
    if (fx.kind === 'burn') {
      const fromAtkDot = Math.max(fx.burnDps || 32, computeBurnDps(m, { dedicated: true }));
      const fromHpDot = Math.round((hero.maxHp || 0) * (fx.burnHpRatio || 0));
      const burnDps = Math.max(fromAtkDot, fromHpDot);
      applyBurn(hero, this.time, { dps: burnDps, duration: fx.burnDur });
      this.particles.burn?.(hero.x, hero.y);
      this._floatStatusOnce(hero, 'burn', 'ĐỐT', '#ff7043');
    }
    if (fx.kind === 'poison') {
      const fromAtkDot = Math.max(fx.poisonDps || 28, computePoisonDps(m, { dedicated: true }));
      const fromHpDot = Math.round((hero.maxHp || 0) * (fx.poisonHpRatio || 0));
      const poisonDps = Math.max(fromAtkDot, fromHpDot);
      applyPoison(hero, this.time, { dps: poisonDps, duration: fx.poisonDur });
      this.particles.poison?.(hero.x, hero.y);
      this._floatStatusOnce(hero, 'poison', 'ĐỘC', '#9ccc65');
    }
    if (fx.kind === 'freeze') {
      applyFreeze(hero, this.time, fx.freezeDur);
      this.particles.frost(hero.x, hero.y);
    }
    if (fx.kind === 'stun') {
      applyStun(hero, this.time, fx.stunDur);
      this.particles.stun?.(hero.x, hero.y);
    }

    if (fx.consume !== false) {
      m.hp = 0;
      m.alive = false;
      this._onMonsterDeath(m, hero);
    }
  }

  _floatStatusOnce(unit, key, text, color) {
    unit._statusFloatCd = unit._statusFloatCd || {};
    if (this.time < (unit._statusFloatCd[key] || 0)) return;
    unit._statusFloatCd[key] = this.time + 1.4;
    this._float(unit.x, unit.y - 14, text, color);
  }

  /** Particle + số nổi khi đang chịu DoT (đốt/độc). */
  _applyDotVfx(unit, dt, dotDmg) {
    if (dotDmg <= 0) return;
    const burning = unit.burnUntil && this.time < unit.burnUntil && unit.burnDps > 0;
    const poisoned = unit.poisonUntil && this.time < unit.poisonUntil && unit.poisonDps > 0;
    if (!burning && !poisoned) return;

    unit._dotAcc = (unit._dotAcc || 0) + dotDmg;
    unit._dotVfxCd = (unit._dotVfxCd || 0) - dt;
    if (unit._dotVfxCd <= 0) {
      unit._dotVfxCd = 0.26;
      const jx = (Math.random() - 0.5) * 10;
      const jy = (Math.random() - 0.5) * 6;
      if (burning) this.particles.burn?.(unit.x + jx, unit.y - 8 + jy);
      if (poisoned) this.particles.poison?.(unit.x + jx * 0.6, unit.y - 4 + jy);
    }

    unit._dotFloatCd = (unit._dotFloatCd || 0) - dt;
    if (unit._dotFloatCd <= 0 && unit._dotAcc >= 0.8) {
      const shown = Math.max(1, Math.round(unit._dotAcc));
      unit._dotAcc = 0;
      unit._dotFloatCd = 0.75;
      if (burning && poisoned) {
        this._float(unit.x, unit.y - 20, `-${shown}`, '#c5e1a5');
      } else if (burning) {
        this._float(unit.x, unit.y - 20, `-${shown}`, '#ff7043');
        this._floatStatusOnce(unit, 'burn', 'ĐỐT', '#ff7043');
      } else {
        this._float(unit.x, unit.y - 20, `-${shown}`, '#9ccc65');
        this._floatStatusOnce(unit, 'poison', 'ĐỘC', '#9ccc65');
      }
    }
  }

  _drawStatusAura(ctx, unit) {
    const burn = unit.burnUntil && this.time < unit.burnUntil && unit.burnDps > 0;
    const poison = unit.poisonUntil && this.time < unit.poisonUntil && unit.poisonDps > 0;
    if (!burn && !poison) return;
    const pulse = 0.32 + 0.22 * Math.sin(this.time * 7 + (unit.bobPhase || 0));
    ctx.save();
    if (burn) {
      ctx.strokeStyle = `rgba(255,112,67,${pulse})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, 15 + Math.sin(this.time * 5) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,87,34,${pulse * 0.18})`;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y - 4, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    if (poison) {
      ctx.strokeStyle = `rgba(156,204,101,${pulse * 0.95})`;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, 12 + Math.cos(this.time * 4) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  _heroAttack(hero, target, _pattern) {
    const elemColor =
      statusTelegraphColor(hero.skills) || hero.color || '#ef9a9a';
    this._beam(hero, target, elemColor);
    hero.flash = 0.18;
    this.particles.hit(target.x, target.y, elemColor);
    if (hero.class === 'MAGE') this.particles.magic(target.x, target.y, hero.color);

    const {
      dmg: rawDmg,
      silenced,
      isAoe,
      freeze,
      burn,
      poison,
      stun,
      defShred,
      pierce,
      lifesteal,
      frail,
      charm,
      root,
    } = computeHeroAttackDamage(hero, target, this.time);

    let dmg = rawDmg;

    if (hero.atkDebuffUntil && this.time < hero.atkDebuffUntil) {
      dmg = Math.round(dmg * (hero.atkDebuffFactor || 0.7));
    }

    const defMul = pierce
      ? Math.max(0.55, (target.tileDefMul || 1) * 0.55)
      : (target.tileDefMul || 1) *
        (target.defShredUntil && this.time < target.defShredUntil
          ? target.defShredFactor || 0.7
          : 1);

    let reflectBase = 0;

    if (silenced) {
      let dealt = Math.round(dmg / defMul);
      dealt = applyIncomingDamage(target, dealt, this.time);
      target.hp -= dealt;
      reflectBase = dealt;
      target.flash = 0.2;
      if (target.stealth) {
        target.revealed = true;
        target.lastCombatTime = this.time;
      }
      this._float(target.x, target.y, 'Câm!', '#b39ddb');
      if (target.hp <= 0) {
        target.alive = false;
        this._onMonsterDeath(target, hero);
      }
      if (reflectBase > 0 && this.time < this.monsterReflectUntil) {
        this._damageHero(
          hero,
          reflectBase * (this.monsterReflectRatio || 0.35),
          '#ef9a9a',
          'Phản!'
        );
        this._processHeroDeath(hero);
      }
      return;
    }

    const hitFlags = { freeze, burn, poison, stun, defShred, frail, charm, root };

    if (isAoe && hero.aoeRadius > 0) {
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        if (dist(target, m) <= hero.aoeRadius) {
          const mDef =
            (m.tileDefMul || 1) *
            (m.defShredUntil && this.time < m.defShredUntil ? m.defShredFactor || 0.7 : 1);
          let dealt = Math.round(dmg / (pierce ? Math.max(0.55, mDef * 0.55) : mDef));
          dealt = applyIncomingDamage(m, dealt, this.time);
          m.hp -= dealt;
          reflectBase += dealt;
          m.flash = 0.15;
          if (m.stealth) {
            m.revealed = true;
            m.lastCombatTime = this.time;
          }
          applyOnHitStatuses(hero, m, this.time, hitFlags);
          if (m.hp <= 0) {
            m.alive = false;
            this._onMonsterDeath(m, hero);
          }
        }
      }
      if (freeze && !hero.silenced) {
        this.particles.frost(target.x, target.y);
        this._floatStatusOnce(target, 'freeze', 'ĐÓNG BĂNG', '#81d4fa');
      }
      if (burn) {
        this.particles.burn?.(target.x, target.y);
        this._floatStatusOnce(target, 'burn', 'ĐỐT', '#ff7043');
      }
      this._float(target.x, target.y, `AoE ${dmg}`, '#ce93d8');
    } else {
      let dealt = Math.round(dmg / defMul);
      dealt = applyIncomingDamage(target, dealt, this.time);
      target.hp -= dealt;
      reflectBase = dealt;
      target.flash = 0.15;
      if (target.stealth) {
        target.revealed = true;
        target.lastCombatTime = this.time;
      }
      this._float(target.x, target.y, `-${dmg}`, '#ef9a9a');
      const applied = applyOnHitStatuses(hero, target, this.time, hitFlags);
      if (applied.includes('freeze')) {
        this.particles.frost(target.x, target.y);
        this._floatStatusOnce(target, 'freeze', 'ĐÓNG BĂNG', '#81d4fa');
      }
      if (applied.includes('burn')) {
        this.particles.burn?.(target.x, target.y);
        this._floatStatusOnce(target, 'burn', 'ĐỐT', '#ff7043');
      }
      if (applied.includes('poison')) {
        this.particles.poison?.(target.x, target.y);
        this._floatStatusOnce(target, 'poison', 'ĐỘC', '#9ccc65');
      }
      if (applied.includes('stun')) {
        this.particles.stun?.(target.x, target.y);
        this._floatStatusOnce(target, 'stun', 'CHOÁNG', '#ffe082');
      }
      if (target.hp <= 0) {
        target.alive = false;
        this._onMonsterDeath(target, hero);
      }
    }

    if (reflectBase > 0 && this.time < this.monsterReflectUntil) {
      this._damageHero(
        hero,
        reflectBase * (this.monsterReflectRatio || 0.35),
        '#ef9a9a',
        'Phản!'
      );
    }

    const thorns =
      (target.thornsRatio || 0) > 0
        ? target.thornsRatio
        : target.passive === 'THORNS_PASSIVE' || target.skills?.includes('THORNS_PASSIVE')
          ? 0.2
          : 0;
    if (reflectBase > 0 && thorns > 0 && hero.alive) {
      this._damageHero(hero, reflectBase * thorns, '#c5e1a5', 'Gai!');
    }

    if (lifesteal && dmg > 0) {
      const heal = Math.round(dmg * 0.18);
      hero.hp = Math.min(hero.maxHp, hero.hp + heal);
      if (heal > 0) this._float(hero.x, hero.y - 8, `+${heal}`, '#ef9a9a');
    }

    // Healer Sương Y slow pulse
    if (hero._justHealedSlow) {
      hero._justHealedSlow = false;
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        if (dist(hero, m) < (hero.range || 3) * this.CELL) {
          applySlow(m, this.time, { factor: 0.7, duration: 2.2 });
        }
      }
    }

    applyHealCutOnHit(hero, target, this.time);
    applyShieldBreak(hero, target, this.time, this._float?.bind(this));
    this._processHeroDeath(hero);
    if (hero.skills?.includes('HEAL_CUT_HIT') && target.alive) {
      this._float(target.x, target.y + 10, 'Vết!', '#7e57c2');
    }
  }

  _refreshHealRecvMuls() {
    for (const h of this.heroes) {
      if (!h.alive) continue;
      h.healRecvMul = 1;
    }
    for (const m of this.monsters) {
      if (!m.alive) continue;
      m.healRecvMul = 1;
    }

    // Quái aura giảm hồi Hero
    for (const m of this.monsters) {
      if (!m.alive || m.passive !== 'ANTI_HEAL_AURA') continue;
      const radius = auraRadiusCells(m) * this.CELL * 1.05;
      const factor =
        m.rarity >= 5 ? 0.22 : m.rarity >= 4 ? 0.32 : m.rarity >= 3 ? 0.42 : 0.55;
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (dist(h, m) > radius) continue;
        h.healRecvMul *= factor;
      }
    }

    // Hero Diệt hồi — aura giảm hồi quái
    for (const h of this.heroes) {
      if (!h.alive) continue;
      const profile = getHeroProfile(h.templateId, h.class);
      const hasCut =
        h.skills?.includes('HEAL_CUT') ||
        profile.antiHeal ||
        h.class === 'HEXER';
      if (!hasCut || h.silenced) continue;
      const radius = (h.range || 2.5) * this.CELL * 1.05;
      const factor =
        h.templateId === 'hero_hex_05'
          ? 0.2
          : h.templateId === 'hero_hex_04'
            ? 0.3
            : h.templateId === 'hero_hex_03'
              ? 0.4
              : 0.5;
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        if (dist(h, m) > radius) continue;
        m.healRecvMul *= factor;
      }
    }

    // Debuff vết thương (từ hit)
    for (const h of this.heroes) {
      if (!h.alive) continue;
      if (h.healCutUntil && this.time < h.healCutUntil) {
        h.healRecvMul *= h.healCutFactor ?? 0.4;
      }
    }
    for (const m of this.monsters) {
      if (!m.alive) continue;
      if (m.healCutUntil && this.time < m.healCutUntil) {
        m.healRecvMul *= m.healCutFactor ?? 0.4;
      }
    }
  }

  /**
   * Hồi máu có tính healRecvMul (giảm hồi / anti-heal).
   * @returns {number} lượng thực sự hồi
   */
  _applyHealTo(unit, rawAmount, { quiet = false } = {}) {
    if (!unit?.alive) return 0;
    if (unit.tileHealCut) return 0;
    const mul = Math.max(0, Number(unit.healRecvMul) ?? 1);
    const amount = Math.max(0, Math.round(Number(rawAmount) * mul));
    if (amount <= 0) {
      if (!quiet && mul < 0.99 && Math.random() < 0.15) {
        this._float(unit.x, unit.y - 8, 'Giảm hồi!', '#a1887f');
      }
      return 0;
    }
    unit.hp = Math.min(unit.maxHp, unit.hp + amount);
    return amount;
  }

  _tickMonsterHeal(m, dt) {
    const pulse = m.passive === 'HEAL_PULSE';
    if (pulse) {
      m._healPulseT = (m._healPulseT || 0) + dt;
      if (m._healPulseT < 2.4) return;
      m._healPulseT = 0;
    }
    const radius = auraRadiusCells(m) * this.CELL * (pulse ? 1.15 : 1);
    const base =
      m.rarity >= 5 ? 0.09 : m.rarity >= 4 ? 0.07 : m.rarity >= 3 ? 0.055 : m.rarity >= 2 ? 0.04 : 0.028;
    const ratio = pulse ? base * 2.2 : base * dt * 1.15;

    for (const ally of this.monsters) {
      if (!ally.alive || ally === m || ally.isTrap) continue;
      if (ally.hp >= ally.maxHp) continue;
      if (dist(ally, m) > radius) continue;
      const raw = Math.max(1, Math.round(ally.maxHp * ratio));
      const amount = this._applyHealTo(ally, raw, { quiet: !pulse });
      if (amount <= 0) continue;
      if (pulse || Math.random() < dt * 2.5) {
        this.particles.heal(ally.x, ally.y - 6);
      }
      if (pulse) {
        const cut = (ally.healRecvMul ?? 1) < 0.99;
        this._float(ally.x, ally.y - 8, cut ? `+${amount}↓` : `+${amount}`, cut ? '#a1887f' : '#81c784');
      }
    }
  }

  _onMonsterDeath(m, killerHero) {
    // Sống lại lần 1 — vẫn chiếm cost (alive = true trở lại)
    const canRevive =
      !m.hasRevived &&
      (m.passive === 'REVIVE' ||
        m.skills?.includes('REVIVE') ||
        m.tags?.includes('revive'));
    if (canRevive) {
      m.hasRevived = true;
      m.alive = true;
      m.hp = Math.max(1, Math.round(m.maxHp * 0.4));
      m.shieldHp = Math.round(m.maxHp * 0.15);
      m.shieldUntil = this.time + 2.5;
      m.stunnedUntil = 0;
      m.frozenUntil = 0;
      m.flash = 0.4;
      this.particles.magic(m.x, m.y - 8, '#fff59d');
      this._float(m.x, m.y - 14, 'Sống lại!', '#fff59d');
      this.costUsed = this.aliveCost();
      return;
    }

    this.particles.death(m.x, m.y, m.color || '#fff');

    // Tự nổ
    if (m.passive === 'SELF_DESTRUCT' || m.skills?.includes('SELF_DESTRUCT')) {
      const r = this.CELL * (m.rarity >= 4 ? 2.4 : 2.0);
      const ratio = m.rarity >= 5 ? 0.35 : m.rarity >= 3 ? 0.28 : 0.22;
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (dist(h, m) > r) continue;
        let dmg = Math.max(8, Math.round(h.maxHp * ratio * 0.45 + m.atk * 0.8));
        dmg = applyIncomingDamage(h, dmg, this.time);
        h.hp -= dmg;
        this._float(h.x, h.y - 8, `-${dmg}`, '#ff7043');
        this.particles.burst(h.x, h.y, '#ef5350');
        if (h.hp <= 0) {
          h.alive = false;
          this._float(h.x, h.y, 'Hạ!', '#ef5350');
        }
      }
      this._float(m.x, m.y, 'NỔ!', '#ff7043');
      this.particles.burst(m.x, m.y, '#ff7043');
    }

    const freed = m.cost || MONSTER_BY_ID[m.templateId]?.cost || 0;
    this.costUsed = this.aliveCost();
    if (freed > 0) {
      this._float(m.x, m.y + 14, `Slot +${freed}`, '#c8b89a');
    }
    if (m.passive === 'BONE_PILE') {
      this.zones.push({ x: m.x, y: m.y, r: this.CELL * 1.6, factor: 0.2, ttl: 8 });
      this.particles.bone(m.x, m.y);
      this._float(m.x, m.y, 'Xương!', '#c8b89a');
    }
    if (m.passive === 'SLIME_EXPLODE_SILENCE') {
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (dist(h, m) < this.CELL * 2.2 && h.class === 'MAGE') {
          h.silenced = true;
          this._float(h.x, h.y, 'Câm chú!', '#26a69a');
        }
      }
    }
    if (m.passive === 'DARK_BUFF' && killerHero) {
      killerHero.stunnedUntil = this.time + 0.8;
    }
    if (m.passive === 'MYTHIC_DEATH_CURSE') {
      const r = this.CELL * 2.4;
      for (const ally of this.monsters) {
        if (!ally.alive || ally === m || ally.isTrap) continue;
        if (dist(ally, m) > r) continue;
        const dmg = Math.max(1, Math.round(ally.maxHp * 0.2));
        ally.hp -= dmg;
        this._float(ally.x, ally.y - 8, `-${dmg}`, '#ff7043');
        this.particles.burst(ally.x, ally.y, '#bf360c');
        if (ally.hp <= 0) {
          ally.alive = false;
          this._onMonsterDeath(ally, killerHero);
        }
      }
      this._float(m.x, m.y, 'Nguyền!', '#bf360c');
    }
    if (m.passive === 'RAINBOW_MAP_SHIELD') {
      const r = this.CELL * 4;
      for (const ally of this.monsters) {
        if (!ally.alive || ally === m || ally.isTrap) continue;
        if (dist(ally, m) > r) continue;
        ally.shieldHp = 0;
        ally.shieldUntil = 0;
        const dmg = Math.max(1, Math.round(ally.maxHp * 0.18));
        ally.hp -= dmg;
        this._float(ally.x, ally.y - 8, `Vỡ -${dmg}`, '#7c4dff');
        this.particles.burst(ally.x, ally.y, '#7c4dff');
        if (ally.hp <= 0) {
          ally.alive = false;
          this._onMonsterDeath(ally, killerHero);
        }
      }
      this._float(m.x, m.y, 'Khiên vỡ!', '#7c4dff');
    }
  }

  /** Vẽ thanh máu + lớp khiên (xanh dương) phía trên */
  _drawHpBar(ctx, ax, barY, barW, unit, hpColor) {
    const ratio = Math.max(0, Math.min(1, unit.hp / Math.max(1, unit.maxHp)));
    const sh = activeShieldHp(unit, this.time);
    const shieldRatio = sh > 0 ? Math.min(1, sh / Math.max(1, unit.maxHp)) : 0;
    ctx.fillStyle = '#222';
    ctx.fillRect(ax - barW / 2, barY, barW, 5);
    if (shieldRatio > 0) {
      const total = Math.min(1, ratio + shieldRatio);
      ctx.fillStyle = '#81d4fa';
      ctx.fillRect(ax - barW / 2, barY, barW * total, 5);
    }
    ctx.fillStyle = hpColor;
    ctx.fillRect(ax - barW / 2, barY, barW * ratio, 5);
    if (shieldRatio > 0) {
      ctx.strokeStyle = 'rgba(129,212,250,0.9)';
      ctx.lineWidth = 1;
      ctx.strokeRect(ax - barW / 2, barY, barW * Math.min(1, ratio + shieldRatio), 5);
    }
  }

  _updateMonsters(dt) {
    const ctx = this._brainCtx();
    ctx.dt = dt;

    for (const m of this.monsters) {
      if (!m.alive || m.isTrap) continue;
      if (this.time < (m.stunnedUntil || 0) || this.time < (m.frozenUntil || 0)) {
        m.telegraph = null;
        continue;
      }
      ensureAttackState(m);
      ensureHeroSkillState(m, this.time);
      tickStealthRegen(m, null, this.time, dt);
      // Hero sát gần → lộ hình
      if (m.stealth && !m.revealed) {
        for (const h of this.heroes) {
          if (!h.alive) continue;
          if (dist(h, m) < this.CELL * 0.85) {
            m.revealed = true;
            m.lastCombatTime = this.time;
            this._float(m.x, m.y - 10, 'Lộ!', '#ce93d8');
            break;
          }
        }
      }
      if (tryActivateMonsterShield(m, this.time)) {
        this._float(m.x, m.y - 12, 'Khiên!', '#90caf9');
      }
      tryMonsterTauntSelf(
        m,
        this.time,
        this.heroes,
        this.CELL,
        this._float?.bind(this)
      );
      m._time = this.time;
      if (m.atkCd > 0) m.atkCd -= dt;
      m.animT = (m.animT || 0) + dt * 2.2;

      const atkBusy = this._tickUnitAttack(m, dt, 'monster');
      if (atkBusy) continue;

      const decision = tickMonsterBrain(m, ctx);
      if (decision.action === 'attack' && decision.target) {
        const pat = patternForMonster(m);
        if (beginAttack(m, decision.target, pat, this.time)) {
          m.atkCd = 1 / m.atkSpeed;
        }
      } else if (decision.action === 'chase' && decision.target) {
        if (isRooted(m, this.time)) continue;
        let spd = m.speed * this.CELL * 0.4 * (m.tileSpeedMul || 1);
        if (m.moveBuffUntil && this.time < m.moveBuffUntil) spd *= m.moveBuffMul || 1.1;
        if (m.stealth && !m.revealed) spd *= 1.4;
        if (m.slowUntil && this.time < m.slowUntil) spd *= m.slowFactor ?? 0.55;
        const dx = decision.target.x - m.x;
        const dy = decision.target.y - m.y;
        const d = Math.hypot(dx, dy) || 1;
        m.facing = dx >= 0 ? 1 : -1;
        this._moveMonster(m, (dx / d) * spd * dt, (dy / d) * spd * dt);
      } else if (decision.action === 'leash') {
        if (isRooted(m, this.time)) continue;
        const dx = m.homeX - m.x;
        const dy = m.homeY - m.y;
        const d = Math.hypot(dx, dy) || 1;
        let spd = m.speed * this.CELL * 0.35 * (m.tileSpeedMul || 1);
        if (m.moveBuffUntil && this.time < m.moveBuffUntil) spd *= m.moveBuffMul || 1.1;
        if (m.slowUntil && this.time < m.slowUntil) spd *= m.slowFactor ?? 0.55;
        this._moveMonster(m, (dx / d) * spd * dt, (dy / d) * spd * dt);
      }
    }
  }

  _moveMonster(m, dx, dy) {
    const nx = m.x + dx;
    const ny = m.y + dy;
    const col = Math.floor(nx / this.CELL);
    const row = Math.floor((ny - this.originY) / this.CELL);
    const key = `${col},${row}`;
    if (
      col >= 0 &&
      row >= 0 &&
      col < this.map.cols &&
      row < this.map.rows &&
      !this.map.blocked.has(key)
    ) {
      m.x = nx;
      m.y = ny;
    } else if (
      col >= 0 &&
      col < this.map.cols &&
      !this.map.blocked.has(`${col},${m.row}`)
    ) {
      m.x = nx;
    } else if (
      row >= 0 &&
      row < this.map.rows &&
      !this.map.blocked.has(`${m.col},${row}`)
    ) {
      m.y = ny;
    }
  }

  _monsterAttack(m, hero, pattern) {
    const elemColor =
      statusTelegraphColor(m.skills?.length ? m.skills : m.passive) || m.color || '#66bb6a';
    this._beam(m, hero, elemColor);
    m.flash = 0.16;
    this.particles.hit(hero.x, hero.y, elemColor);
    let dmg = m.atk;
    const hitMul = dotKitHitMul(m);
    if (hitMul < 1) dmg = Math.round(dmg * hitMul);

    // Mythic hiến tế — nuốt ally gần (ưu tiên cost thấp) để amplify đòn
    if (m.passive === 'MYTHIC_BLOOD_TITHE') {
      let victim = null;
      let bestScore = Infinity;
      for (const ally of this.monsters) {
        if (!ally.alive || ally === m || ally.isTrap) continue;
        if (ally.passive === 'MYTHIC_BLOOD_TITHE') continue;
        const d = dist(m, ally);
        if (d > this.CELL * 5.5) continue;
        const score = (ally.cost || 1) * 100 + d;
        if (score < bestScore) {
          bestScore = score;
          victim = ally;
        }
      }
      if (victim) {
        const cost = victim.cost || 1;
        const mul = Math.min(3.5, 1 + 0.35 * cost);
        dmg = Math.round(dmg * mul);
        this._float(victim.x, victim.y, `Hiến C${cost}!`, '#880e4f');
        this.particles.burst(victim.x, victim.y, '#880e4f');
        victim.hp = 0;
        victim.alive = false;
        this._onMonsterDeath(victim, null);
        this.challengeStats = this.challengeStats || {};
        this.challengeStats.tithes = (this.challengeStats.tithes || 0) + 1;
        this._float(m.x, m.y - 14, `×${mul.toFixed(2)}`, '#e91e63');
      } else {
        dmg = Math.round(dmg * 0.25);
        m._titheStarveUntil = this.time + 2;
        this._float(m.x, m.y - 12, 'Đói máu!', '#ce93d8');
      }
    }
    if (m._titheStarveUntil && this.time < m._titheStarveUntil && m.passive !== 'MYTHIC_BLOOD_TITHE') {
      /* noop */
    }

    if (m.passive === 'BURST_FIRST_HIT' && !m.firstHitDone) {
      dmg *= 2;
      m.firstHitDone = true;
    }
    // Backstab / đòn từ tàng hình
    const mSkills = m.skills || [];
    if (mSkills.includes('BACKSTAB') || (m.stealth && !m.revealed)) {
      const fromBehind =
        (m.facing >= 0 && hero.x >= m.x) || (m.facing < 0 && hero.x < m.x);
      if (fromBehind || (m.stealth && !m.revealed)) {
        dmg = Math.round(dmg * 1.5);
        this._float(hero.x, hero.y - 16, 'Lén đâm!', '#a5d6a7');
      }
    }
    if (m.stealth) {
      m.revealed = true;
      m.lastCombatTime = this.time;
    }
    m.lastCombatTime = this.time;
    if (
      (m.passive === 'ANTI_WARRIOR_BURST' || m.tags?.includes('anti_warrior')) &&
      hero.class === 'WARRIOR'
    ) {
      dmg = Math.round(dmg * 2.2);
    }
    if (
      (m.passive === 'SILENCE_ON_HIT' ||
        m.passive === 'MYTHIC_ALLY_SLOW' ||
        pattern?.kind === 'silence_cast') &&
      hero.class === 'MAGE'
    ) {
      hero.silenced = true;
      this._float(hero.x, hero.y, 'Silence!', '#7e57c2');
    }
    if (pattern?.aoe || m.passive === 'RANGED_VOLLEY') {
      const aoeR = m.passive === 'RANGED_VOLLEY' ? this.CELL * 1.6 : this.CELL * 2.2;
      for (const h of this.heroes) {
        if (!h.alive || h === hero) continue;
        if (dist(m, h) < aoeR) {
          let splash = Math.round(dmg * (m.passive === 'RANGED_VOLLEY' ? 0.55 : 0.45));
          splash = applyIncomingDamage(h, splash, this.time);
          splash = Math.round(splash / (h.tileDefMul || 1));
          h.hp -= splash;
          h.flash = 0.2;
          applyOnHitStatuses(m, h, this.time);
        }
      }
    }
    if (m.passive === 'KNOCK_BACK_ROOM' || m.ai?.role === 'knockbacker') {
      const cell = this._unitCell(hero);
      const newCol = Math.max(0, cell.col - 2);
      const dest = this._cellCenter(newCol, cell.row);
      if (!this.map.blocked.has(`${newCol},${cell.row}`)) {
        hero.x = dest.x;
        hero.path = null;
        hero.draining = false;
        this._float(hero.x, hero.y, 'Giật lùi!', '#8d6e63');
      }
    }

    dmg = applyIncomingDamage(hero, dmg, this.time);
    const heroDefMul =
      (hero.tileDefMul || 1) *
      (hero.defShredUntil && this.time < hero.defShredUntil
        ? hero.defShredFactor || 0.7
        : 1);
    dmg = Math.round(dmg / heroDefMul);
    if (hero.frailUntil && this.time < hero.frailUntil) {
      dmg = Math.round(dmg * (hero.frailMul || 1.25));
    }
    hero.hp -= dmg;
    hero.flash = 0.2;
    this._float(hero.x, hero.y, `-${dmg}`, '#ffab91');
    if (hero.alive && hero.hp > 0) this._propagateSoulLink(hero, dmg, '#7b6ba8');

    const applied = applyOnHitStatuses(m, hero, this.time);
    if (applied.includes('freeze')) {
      this.particles.frost(hero.x, hero.y);
      this._floatStatusOnce(hero, 'freeze', 'ĐÓNG BĂNG', '#81d4fa');
    }
    if (applied.includes('burn')) {
      this.particles.burn?.(hero.x, hero.y);
      this._floatStatusOnce(hero, 'burn', 'ĐỐT', '#ff7043');
    }
    if (applied.includes('poison')) {
      this.particles.poison?.(hero.x, hero.y);
      this._floatStatusOnce(hero, 'poison', 'ĐỘC', '#9ccc65');
    }
    if (applied.includes('stun')) {
      this.particles.stun?.(hero.x, hero.y);
      this._floatStatusOnce(hero, 'stun', 'CHOÁNG', '#ffe082');
    }

    if (m.passive === 'HEAL_CUT_ON_HIT') {
      applyHealCutOnHit(m, hero, this.time);
      this._float(hero.x, hero.y + 10, 'Giảm hồi!', '#a1887f');
    }
    if (m.passive === 'HEAL_CUT_BOLT') {
      applyHealCutOnHit(m, hero, this.time);
      const aoeR = this.CELL * 1.5;
      for (const h of this.heroes) {
        if (!h.alive || h === hero) continue;
        if (dist(m, h) > aoeR) continue;
        applyHealCutOnHit(m, h, this.time);
        let splash = Math.round(dmg * 0.35);
        splash = applyIncomingDamage(h, splash, this.time);
        h.hp -= splash;
        h.flash = 0.15;
      }
      this._float(hero.x, hero.y + 10, 'Cắt hồi!', '#a1887f');
      this.particles.magic(hero.x, hero.y - 6, '#8d6e63');
    }
    applyShieldBreak(m, hero, this.time, this._float?.bind(this));
    this._processHeroDeath(hero);
  }

  _checkEnd() {
    if (this.result) return;
    if (this.treasureHp <= 0) {
      this.result = 'lose';
      this.running = false;
      this.hooks.onLose?.(this.snapshot());
      return;
    }
    const allSpawned = this.spawnQueue.every((h) => h.spawned);
    const anyAlive = this.heroes.some((h) => h.alive);
    if (allSpawned && !anyAlive) {
      this.result = 'win';
      this.running = false;
      this.hooks.onWin?.(this.snapshot());
    }
  }

  _float(x, y, text, color) {
    this.floatTexts.push({ x, y, text, color, ttl: 0.9 });
  }

  _beam(from, to, color) {
    this.vfx.push({
      type: 'beam',
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      color,
      ttl: 0.22,
    });
  }

  draw() {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2a2218');
    g.addColorStop(1, '#14110e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    this._updateDrawLayout();
    const scale = this.drawScale;
    const offsetY = this.drawOffsetY;
    const CELL = this.CELL;
    const gridTop = this.originY;

    ctx.save();
    ctx.translate(0, offsetY);
    ctx.scale(scale, scale);
    ctx.translate(-this.cameraX, 0);

    // floor
    ctx.fillStyle = '#100e0c';
    ctx.fillRect(-80, gridTop + this.mapHeight + 6, this.totalWidth + 160, 36);

    // tiles
    for (let r = 0; r < this.map.rows; r++) {
      for (let c = 0; c < this.map.cols; c++) {
        const ch = this.map.tiles[r][c];
        const x = c * CELL;
        const y = gridTop + r * CELL;
        const key = `${c},${r}`;
        if (ch === '#' || ch === 'o') {
          ctx.fillStyle = ch === 'o' ? '#4a4038' : '#1a1612';
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
          continue;
        }
        const terrain = this.map.terrain[key] || 'NORMAL';
        ctx.fillStyle = TERRAIN_COLORS[terrain] || TERRAIN_COLORS.NORMAL;
        ctx.fillRect(x, y, CELL, CELL);

        const buffs = this.map.buffIndex[key] || [];
        for (const b of buffs) {
          if (b.kind === 'FIRE_ZONE') ctx.fillStyle = 'rgba(255,87,34,0.28)';
          else if (b.kind === 'ICE_ZONE') ctx.fillStyle = 'rgba(129,212,250,0.28)';
          else if (b.kind === 'POISON_ZONE') ctx.fillStyle = 'rgba(156,204,101,0.28)';
          else if (b.kind === 'DEF_SHRED_ZONE') ctx.fillStyle = 'rgba(171,71,188,0.25)';
          else if (b.kind === 'HEAL_CUT_ZONE') ctx.fillStyle = 'rgba(120,144,156,0.28)';
          else if (b.side === 'monster') ctx.fillStyle = 'rgba(102,187,106,0.22)';
          else if (b.side === 'hero') ctx.fillStyle = 'rgba(239,83,80,0.18)';
          else ctx.fillStyle = 'rgba(255,213,79,0.15)';
          ctx.fillRect(x, y, CELL, CELL);
        }

        if (ch === 'G') {
          ctx.fillStyle = 'rgba(129,199,132,0.35)';
          ctx.fillRect(x, y, CELL, CELL);
        }
        if (ch === 'T') {
          ctx.fillStyle = 'rgba(255,213,79,0.35)';
          ctx.fillRect(x, y, CELL, CELL);
        }
        if (ch === 'x' || this.map.noPlace?.has(key)) {
          ctx.fillStyle = 'rgba(90, 80, 70, 0.35)';
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = 'rgba(200,180,150,0.2)';
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
          ctx.setLineDash([]);
        }
        if (ch === '^' || this.map.hazard?.has(key)) {
          ctx.fillStyle = 'rgba(255,112,67,0.28)';
          ctx.fillRect(x, y, CELL, CELL);
          ctx.fillStyle = 'rgba(255,171,64,0.35)';
          ctx.beginPath();
          ctx.moveTo(x + CELL * 0.5, y + 6);
          ctx.lineTo(x + CELL - 6, y + CELL - 6);
          ctx.lineTo(x + 6, y + CELL - 6);
          ctx.closePath();
          ctx.fill();
        }
        if (ch === 'f' || terrain === 'FIRE') {
          ctx.fillStyle = 'rgba(255,87,34,0.2)';
          ctx.fillRect(x, y, CELL, CELL);
        }
        if (ch === 'i' || terrain === 'ICE') {
          ctx.fillStyle = 'rgba(129,212,250,0.22)';
          ctx.fillRect(x, y, CELL, CELL);
        }
        if (ch === 'p' || terrain === 'POISON') {
          ctx.fillStyle = 'rgba(156,204,101,0.22)';
          ctx.fillRect(x, y, CELL, CELL);
        }
        if (ch === 'q' || terrain === 'OIL') {
          ctx.fillStyle = 'rgba(180,140,60,0.28)';
          ctx.fillRect(x, y, CELL, CELL);
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText(this.map.name, 8, gridTop - 16);

    // Gate label
    ctx.fillStyle = '#81c784';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CỔNG', -36, gridTop - 8);

    // Treasure chest visual at first treasure cell
    const t0 = this.map.treasure[0];
    const tox = t0.col * CELL + CELL / 2;
    const toy = gridTop + t0.row * CELL + CELL / 2;
    const draining = this.heroes.some((hh) => hh.alive && hh.draining);
    ctx.fillStyle = draining ? '#ff8f00' : '#9a6b2a';
    ctx.fillRect(tox - 16, toy - 16, 32, 32);
    ctx.strokeStyle = '#ffd54f';
    ctx.strokeRect(tox - 16, toy - 16, 32, 32);
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KHO', tox, toy - 20);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(tox - 16, toy + 18, 32, 5);
    ctx.fillStyle = this.treasureHp / this.treasureMax < 0.35 ? '#ff5252' : '#69f0ae';
    ctx.fillRect(tox - 16, toy + 18, 32 * (this.treasureHp / this.treasureMax), 5);

    for (const h of this.heroes) {
      if (!h.alive || !h.draining) continue;
      ctx.strokeStyle = 'rgba(255,213,79,0.55)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(tox, toy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const z of this.zones) {
      const fill = z.color || 'rgba(200,184,154,0.28)';
      ctx.fillStyle = fill.startsWith('rgba') ? fill : `${fill}44`;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const v of this.vfx) {
      if (v.type !== 'beam') continue;
      ctx.globalAlpha = Math.min(1, v.ttl * 4);
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(v.x1, v.y1);
      ctx.lineTo(v.x2, v.y2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (const h of this.heroes) {
      if (!h.alive || h.intent !== 'fighting' || !h.fightTarget) continue;
      ctx.strokeStyle = 'rgba(239,83,80,0.25)';
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.effectiveRange || h.range, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Attack telegraphs
    for (const u of [...this.heroes, ...this.monsters]) {
      if (!u.alive || !u.telegraph) continue;
      const tg = u.telegraph;
      ctx.strokeStyle = tg.color || u.color || 'rgba(255,255,255,0.5)';
      ctx.globalAlpha = 0.4 + 0.35 * Math.sin(this.time * 10);
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Aura rings for support monsters
    for (const m of this.monsters) {
      if (!m.alive || m.isTrap) continue;
      const auraPassives = [
        'SLOW_AURA',
        'HEAL_AURA',
        'HEAL_PULSE',
        'ANTI_HEAL_AURA',
        'AURA_TAUNT',
        'AURA_STUN',
      ];
      if (!auraPassives.includes(m.passive)) continue;
      const r = auraRadiusCells(m) * this.CELL;
      const col =
        m.passive === 'HEAL_AURA' || m.passive === 'HEAL_PULSE'
          ? 'rgba(129,199,132,0.35)'
          : m.passive === 'ANTI_HEAL_AURA'
            ? 'rgba(161,136,127,0.4)'
            : m.passive === 'AURA_STUN'
              ? 'rgba(255,224,130,0.4)'
              : 'rgba(129,212,250,0.35)';
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.25 + 0.15 * Math.sin(this.time * 3 + (m.bobPhase || 0));
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (const m of this.monsters) {
      if (!m.alive) continue;
      const spr = getMonsterSprite(m.templateId, m.color, m.rarity, m.appearance);
      const bob = m.isTrap ? 0 : Math.sin(this.time * 4 + m.bobPhase) * 2.2;
      const size = m.isTrap ? CELL * 0.88 : CELL * 0.95 + m.rarity * 1.2;
      const poseInfo = resolveDisplayAnim(m);
      const chasing =
        m.atkPhase === 'idle' &&
        Math.hypot(m.x - (m.homeX || m.x), m.y - (m.homeY || m.y)) > 2;
      const pose = m.isTrap ? 'idle' : chasing && poseInfo.anim === 'idle' ? 'run' : poseInfo.anim;
      const poseT = poseInfo.animT ?? 0;
      const alpha = m.stealth && !m.revealed ? 0.4 : 1;
      const drawn = drawSpriteAt(ctx, spr, m.x, m.y, {
        size,
        facing: m.facing || 1,
        bob,
        flash: m.flash || 0,
        pose,
        poseT,
        lungeX: m.lungeX || 0,
        lungeY: m.lungeY || 0,
        tint: m.color,
        vfx: m.appearance?.vfx || null,
        vfxT: this.time + (m.bobPhase || 0),
        palette: m.appearance?.palette || null,
        alpha,
      });
      const ax = drawn.x;
      const ay = drawn.y;
      this._drawStatusAura(ctx, m);
      if (!(m.stealth && !m.revealed)) {
        const barW = Math.min(32, drawn.w * 0.7);
        const barY = ay - drawn.h / 2 - 7;
        this._drawHpBar(ctx, ax, barY, barW, m, '#66bb6a');
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 8px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(shortLabel(m.name), ax, ay + drawn.h / 2 + 9);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = 'rgba(165,214,167,0.7)';
        ctx.font = 'bold 8px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('…', ax, ay + drawn.h / 2 + 9);
        ctx.textAlign = 'left';
      }
    }

    for (const h of this.heroes) {
      if (!h.alive) continue;
      const spr = getHeroSprite(h.templateId, h.class, h.color);
      const bob = Math.sin(this.time * 5 + h.bobPhase) * 2.5;
      const alpha = h.inStasis ? 0.5 : h.stealth && !h.revealed ? 0.45 : 1;
      const poseInfo = resolveDisplayAnim(h);
      const size = CELL * 1.05;
      const poseT = poseInfo.animT ?? 0;
      const drawn = drawSpriteAt(ctx, spr, h.x, h.y, {
        size,
        facing: h.facing || 1,
        bob: h.inStasis ? 0 : bob,
        flash: h.flash || 0,
        alpha,
        pose: h.inStasis ? 'idle' : poseInfo.anim,
        poseT,
        lungeX: h.lungeX || 0,
        lungeY: h.lungeY || 0,
        tint: h.color,
      });
      const ax = drawn.x;
      const ay = drawn.y;
      this._drawStatusAura(ctx, h);
      const barW = Math.min(34, drawn.w * 0.72);
      const barY = ay - drawn.h / 2 - 9;
      const hpColor = h.hp / h.maxHp <= COMBAT.PANIC_HP_RATIO ? '#ffeb3b' : '#ef5350';
      this._drawHpBar(ctx, ax, barY, barW, h, hpColor);
      const badge = intentLabel(h.intent || 'moving');
      ctx.fillStyle = badge.color;
      ctx.font = 'bold 8px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(badge.text, ax, barY - 6);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 9px "Segoe UI", sans-serif';
      ctx.fillText(h.name, ax, ay + drawn.h / 2 + 10);
      ctx.textAlign = 'left';
    }

    this.particles.draw(ctx);
    for (const f of this.floatTexts) {
      ctx.globalAlpha = Math.min(1, f.ttl);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(6, 6, Math.min(320, w - 12), 34);
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText(`Ải · ${this.map.name}  ·  Cổng → Map → Kho`, 12, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Xanh=buff quái · Đỏ=buff hero · Tường chặn path', 12, 34);

    // minimap
    const mmW = Math.min(180, w - 16);
    const mmH = 28;
    const mmX = w - mmW - 8;
    const mmY = h - mmH - 8;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(mmX - 4, mmY - 4, mmW + 8, mmH + 8);
    const tw = this.map.cols;
    const th = this.map.rows;
    for (let r = 0; r < th; r++) {
      for (let c = 0; c < tw; c++) {
        const ch = this.map.tiles[r][c];
        const px = mmX + (c / tw) * mmW;
        const py = mmY + (r / th) * mmH;
        const cw = mmW / tw;
        const chh = mmH / th;
        if (ch === '#' || ch === 'o') ctx.fillStyle = '#111';
        else if (ch === '~') ctx.fillStyle = '#1e3a38';
        else if (ch === 'd') ctx.fillStyle = '#1a1612';
        else if (ch === 'l') ctx.fillStyle = '#3d2a24';
        else if (ch === 'h') ctx.fillStyle = '#353028';
        else if (ch === 'G') ctx.fillStyle = '#81c784';
        else if (ch === 'T') ctx.fillStyle = '#ffd54f';
        else ctx.fillStyle = '#3a3228';
        ctx.fillRect(px, py, cw + 0.5, chh + 0.5);
      }
    }
    for (const hh of this.heroes) {
      if (!hh.alive) continue;
      const px = mmX + (hh.x / this.mapWidth) * mmW;
      const py = mmY + ((hh.y - this.originY) / this.mapHeight) * mmH;
      ctx.fillStyle = hh.color;
      ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
  }
}

