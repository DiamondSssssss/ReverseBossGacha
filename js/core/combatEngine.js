import { COMBAT, SPELLS } from '../data/constants.js';
import { MONSTER_BY_ID } from '../data/monsters.js';
import { findPath, roomOriginX } from './pathfinding.js';

const CELL = COMBAT.CELL_SIZE;
const GAP = 28;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function cellCenter(roomIndex, col, row, roomWidth) {
  const ox = roomOriginX(roomIndex, roomWidth, GAP);
  return {
    x: ox + col * CELL + CELL / 2,
    y: row * CELL + CELL / 2 + 40,
  };
}

function roomIndexFromX(x, roomCount, roomWidth) {
  const stride = roomWidth + GAP;
  let idx = Math.floor(x / stride);
  return Math.max(0, Math.min(roomCount - 1, idx));
}

function applyMonsterStats(template, terrain) {
  const stats = { ...template.stats };
  let atkMul = 1;
  let hpMul = 1;

  switch (template.passive) {
    case 'BUFF_IN_LOW_CEILING_ROOM':
      if (terrain === 'HIGH') atkMul = 0.5;
      else if (terrain === 'LOW_CEILING' || terrain === 'DARK') atkMul = 3;
      break;
    case 'WATER_BUFF':
      if (terrain === 'WATER') {
        atkMul = 1.4;
        hpMul = 1.4;
      }
      break;
    case 'DARK_BUFF':
      if (terrain === 'DARK') atkMul = 2;
      break;
    default:
      break;
  }

  return {
    hp: Math.round(stats.hp * hpMul),
    maxHp: Math.round(stats.hp * hpMul),
    atk: Math.round(stats.atk * atkMul),
    speed: stats.speed,
    range: stats.range * CELL,
    atkSpeed: stats.atkSpeed,
  };
}

export class CombatEngine {
  /**
   * @param {object} run - dungeon run with rooms + placements + wave
   * @param {HTMLCanvasElement} canvas
   * @param {object} hooks - { onWin, onLose, onUpdate }
   */
  constructor(run, canvas, hooks = {}) {
    this.run = run;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hooks = hooks;
    this.roomWidth = COMBAT.GRID_COLS * CELL;
    this.roomHeight = COMBAT.GRID_ROWS * CELL + 80;
    this.totalWidth =
      run.rooms.length * this.roomWidth + (run.rooms.length - 1) * GAP + 120;
    this.running = false;
    this.paused = false;
    this.time = 0;
    this.lastTs = 0;
    this.raf = 0;
    this.treasureHp = COMBAT.TREASURE_HP;
    this.treasureMax = COMBAT.TREASURE_HP;
    this.result = null;
    this.floatTexts = [];
    this.zones = []; // slow zones {x,y,r,factor,ttl}
    this.globalSlowUntil = 0;
    this.spellCd = { slow_wave: 0, heal_monsters: 0 };
    this.cameraX = 0;

    this.monsters = [];
    this.heroes = [];
    this._spawnMonsters();
    this._queueHeroes();
    this._resize();
  }

  _spawnMonsters() {
    this.run.rooms.forEach((room, ri) => {
      room.placements.forEach((p) => {
        const tpl = MONSTER_BY_ID[p.monsterId];
        if (!tpl) return;
        const st = applyMonsterStats(tpl, room.terrain);
        const pos = cellCenter(ri, p.col, p.row, this.roomWidth);
        this.monsters.push({
          id: uid(),
          templateId: tpl.id,
          name: tpl.name,
          color: tpl.color,
          passive: tpl.passive,
          rarity: tpl.rarity,
          roomIndex: ri,
          terrain: room.terrain,
          col: p.col,
          row: p.row,
          x: pos.x,
          y: pos.y,
          ...st,
          atkCd: 0,
          alive: true,
          firstHitDone: false,
          isTrap: tpl.tags?.includes('trap') && tpl.stats.speed === 0,
        });
      });
    });
  }

  _queueHeroes() {
    this.spawnQueue = this.run.wave.map((h) => ({ ...h, spawned: false }));
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const wrap = this.canvas.closest('.combat-wrap') || this.canvas.parentElement;
    const cssW = wrap ? wrap.clientWidth : window.innerWidth;
    // Chiều cao còn lại trong combat-wrap (đã trừ HUD/nút)
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

  castSpell(spellId) {
    if (this.spellCd[spellId] > 0 || this.result) return false;
    const spell = SPELLS[spellId];
    if (!spell) return false;

    if (spellId === 'slow_wave') {
      this.globalSlowUntil = this.time + spell.duration;
      this._float(this.viewW / 2 + this.cameraX, 30, 'Sương Chậm!', '#81d4fa');
    } else if (spellId === 'heal_monsters') {
      this.monsters.forEach((m) => {
        if (!m.alive) return;
        m.hp = Math.min(m.maxHp, m.hp + m.maxHp * spell.healRatio);
      });
      this._float(this.viewW / 2 + this.cameraX, 30, 'Huyết Ấn!', '#ef9a9a');
    }
    this.spellCd[spellId] = spell.cooldown;
    this.hooks.onUpdate?.(this.snapshot());
    return true;
  }

  snapshot() {
    return {
      time: this.time,
      treasureHp: this.treasureHp,
      treasureMax: this.treasureMax,
      heroesAlive: this.heroes.filter((h) => h.alive).length,
      heroesTotal: this.run.wave.length,
      monstersAlive: this.monsters.filter((m) => m.alive).length,
      spellCd: { ...this.spellCd },
      result: this.result,
      globalSlow: this.time < this.globalSlowUntil,
    };
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
    this.floatTexts = this.floatTexts.filter((f) => {
      f.ttl -= dt;
      f.y -= 20 * dt;
      return f.ttl > 0;
    });

    this._spawnHeroes();
    this._updateHeroes(dt);
    this._updateMonsters(dt);
    this._checkEnd();
    this.hooks.onUpdate?.(this.snapshot());
  }

  _spawnHeroes() {
    for (const h of this.spawnQueue) {
      if (h.spawned) continue;
      if (this.time < h.spawnDelay) continue;
      h.spawned = true;
      const start = cellCenter(0, 0, Math.floor(COMBAT.GRID_ROWS / 2), this.roomWidth);
      // spawn slightly left of first room
      this.heroes.push({
        id: uid(),
        templateId: h.id,
        name: h.name,
        class: h.class,
        color: h.color,
        skills: h.skills || [],
        maxHp: h.maxHp || h.hp,
        hp: h.maxHp || h.hp,
        atk: h.atk,
        baseSpeed: h.speed,
        speed: h.speed,
        range: h.range * CELL,
        atkSpeed: h.atkSpeed,
        aoeRadius: (h.aoeRadius || 0) * CELL,
        stealth: !!h.stealth,
        revealed: false,
        silenced: false,
        stunnedUntil: 0,
        frozenUntil: 0,
        slowFactor: 1,
        x: start.x - CELL * 1.5,
        y: start.y,
        roomIndex: 0,
        atkCd: 0,
        alive: true,
        panicking: false,
        path: null,
        pathIdx: 0,
        draining: false,
      });
    }
  }

  _goalForHero(hero) {
    if (hero.panicking) {
      return { roomIndex: 0, col: 0, row: Math.floor(COMBAT.GRID_ROWS / 2) };
    }
    // treasure = last room, rightmost
    const last = this.run.rooms.length - 1;
    return {
      roomIndex: last,
      col: COMBAT.GRID_COLS - 1,
      row: Math.floor(COMBAT.GRID_ROWS / 2),
    };
  }

  _rebuildPath(hero) {
    const goal = this._goalForHero(hero);
    // Multi-room: path within current room toward exit / goal
    const room = this.run.rooms[hero.roomIndex];
    const localCol = Math.max(
      0,
      Math.min(COMBAT.GRID_COLS - 1, Math.floor(((hero.x - roomOriginX(hero.roomIndex, this.roomWidth, GAP)) / CELL)))
    );
    const localRow = Math.max(
      0,
      Math.min(COMBAT.GRID_ROWS - 1, Math.floor((hero.y - 40) / CELL))
    );

    let targetCol;
    let targetRow = goal.row;
    if (hero.panicking) {
      targetCol = hero.roomIndex === 0 ? 0 : 0;
    } else if (hero.roomIndex < goal.roomIndex) {
      targetCol = COMBAT.GRID_COLS - 1;
    } else if (hero.roomIndex > goal.roomIndex) {
      targetCol = 0;
    } else {
      targetCol = goal.col;
      targetRow = goal.row;
    }

    const path = findPath(
      { col: localCol, row: localRow },
      { col: targetCol, row: targetRow },
      room.cols,
      room.rows,
      new Set()
    );
    hero.path = path || [{ col: targetCol, row: targetRow }];
    hero.pathIdx = 0;
  }

  _updateHeroes(dt) {
    for (const hero of this.heroes) {
      if (!hero.alive) continue;

      // panic check
      if (!hero.panicking && hero.hp / hero.maxHp <= COMBAT.PANIC_HP_RATIO) {
        hero.panicking = true;
        hero.path = null;
        this._float(hero.x, hero.y, 'Hoảng loạn!', '#ffeb3b');
      }

      hero.roomIndex = roomIndexFromX(hero.x, this.run.rooms.length, this.roomWidth);

      // status
      const stunned = this.time < hero.stunnedUntil;
      const frozen = this.time < hero.frozenUntil;
      if (stunned || frozen) continue;

      // trap check
      for (const m of this.monsters) {
        if (!m.alive || !m.isTrap) continue;
        if (dist(hero, m) < CELL * 0.6) {
          hero.hp -= m.atk;
          m.hp = 0;
          m.alive = false;
          this._float(hero.x, hero.y - 10, `Bẫy -${m.atk}`, '#ff7043');
          this._onMonsterDeath(m, hero);
        }
      }

      // taunt target
      let target = this._pickMonsterTarget(hero);
      const canFight = target && dist(hero, target) <= hero.range;

      if (canFight && !hero.panicking) {
        hero.atkCd -= dt;
        if (hero.atkCd <= 0) {
          this._heroAttack(hero, target);
          hero.atkCd = 1 / hero.atkSpeed;
        }
      } else {
        // move
        if (!hero.path || hero.pathIdx >= hero.path.length) this._rebuildPath(hero);
        const node = hero.path[hero.pathIdx];
        if (node) {
          const dest = cellCenter(hero.roomIndex, node.col, node.row, this.roomWidth);
          // if moving to next room edge
          if (!hero.panicking && node.col === COMBAT.GRID_COLS - 1 && hero.roomIndex < this.run.rooms.length - 1) {
            // after reaching, advance room
          }
          let speedMul = hero.slowFactor;
          if (this.time < this.globalSlowUntil) speedMul *= SPELLS.slow_wave.slowFactor;
          for (const z of this.zones) {
            if (dist(hero, z) < z.r) speedMul *= z.factor;
          }
          // frost aura from monsters
          for (const m of this.monsters) {
            if (!m.alive || m.passive !== 'SLOW_AURA') continue;
            if (dist(hero, m) < CELL * 2.2) speedMul *= 0.65;
          }

          const spd = hero.baseSpeed * CELL * 0.9 * speedMul;
          const dx = dest.x - hero.x;
          const dy = dest.y - hero.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 4) {
            hero.pathIdx++;
            // cross to next/prev room
            if (!hero.panicking && node.col >= COMBAT.GRID_COLS - 1 && hero.roomIndex < this.run.rooms.length - 1) {
              hero.roomIndex++;
              hero.x = roomOriginX(hero.roomIndex, this.roomWidth, GAP) + CELL / 2;
              hero.path = null;
            } else if (hero.panicking && node.col <= 0 && hero.roomIndex > 0) {
              hero.roomIndex--;
              hero.x =
                roomOriginX(hero.roomIndex, this.roomWidth, GAP) +
                (COMBAT.GRID_COLS - 1) * CELL +
                CELL / 2;
              hero.path = null;
            } else if (
              !hero.panicking &&
              hero.roomIndex === this.run.rooms.length - 1 &&
              node.col >= COMBAT.GRID_COLS - 1
            ) {
              hero.draining = true;
            } else if (hero.panicking && hero.roomIndex === 0 && node.col <= 0) {
              // escaped — remove as "fled" (counts as neutralized for win)
              hero.alive = false;
              hero.fled = true;
              this._float(hero.x, hero.y, 'Bỏ chạy!', '#ffeb3b');
            }
          } else {
            hero.x += (dx / d) * spd * dt;
            hero.y += (dy / d) * spd * dt;
          }
        }
      }

      if (hero.draining && hero.alive && !hero.panicking) {
        this.treasureHp -= 18 * dt;
        if (this.treasureHp <= 0) {
          this.treasureHp = 0;
        }
      }

      if (hero.hp <= 0) {
        hero.alive = false;
        this._float(hero.x, hero.y, 'Hạ!', '#fff');
      }
    }

    // follow camera to first living hero or treasure
    const focus = this.heroes.find((h) => h.alive) || null;
    if (focus) {
      this.cameraX = Math.max(0, focus.x - this.viewW * 0.35);
    }
  }

  _pickMonsterTarget(hero) {
    let best = null;
    let bestD = Infinity;
    for (const m of this.monsters) {
      if (!m.alive) continue;
      if (m.isTrap) continue;
      // stealth: skip monsters that don't reveal, unless revealed
      if (hero.stealth && !hero.revealed) {
        if (m.passive !== 'REVEAL' && m.passive !== 'TRAP_SPIKE') {
          // still can be hit by reveal eyes in range
          if (m.passive === 'REVEAL' && dist(hero, m) < m.range) {
            hero.revealed = true;
          } else {
            continue;
          }
        }
      }
      // taunt priority
      const d = dist(hero, m);
      const tauntBonus = m.passive === 'TAUNT' ? -200 : 0;
      const score = d + tauntBonus;
      if (score < bestD) {
        bestD = score;
        best = m;
      }
    }
    // reveal check separate
    for (const m of this.monsters) {
      if (!m.alive) continue;
      if (m.passive === 'REVEAL' && dist(hero, m) < m.range) {
        hero.revealed = true;
      }
    }
    return best;
  }

  _heroAttack(hero, target) {
    if (hero.silenced && hero.class === 'MAGE') {
      // melee poke only
      target.hp -= Math.round(hero.atk * 0.35);
      this._float(target.x, target.y, 'Câm!', '#b39ddb');
      return;
    }
    let dmg = hero.atk;
    if (hero.class === 'MAGE' && hero.aoeRadius > 0) {
      for (const m of this.monsters) {
        if (!m.alive || m.isTrap) continue;
        if (dist(target, m) <= hero.aoeRadius) {
          m.hp -= dmg;
          if (m.hp <= 0) {
            m.alive = false;
            this._onMonsterDeath(m, hero);
          }
        }
      }
      if (hero.skills.includes('FREEZE') && !hero.silenced) {
        target.frozenUntil = this.time + 1.2;
      }
      this._float(target.x, target.y, `AoE ${dmg}`, '#ce93d8');
    } else {
      if (hero.skills?.includes?.('BACKSTAB') || (hero.stealth && !hero.revealed)) {
        dmg = Math.round(dmg * 1.5);
      }
      target.hp -= dmg;
      this._float(target.x, target.y, `-${dmg}`, '#ef9a9a');
      if (target.hp <= 0) {
        target.alive = false;
        this._onMonsterDeath(target, hero);
      }
    }
  }

  _onMonsterDeath(m, killerHero) {
    if (m.passive === 'BONE_PILE') {
      this.zones.push({
        x: m.x,
        y: m.y,
        r: CELL * 1.6,
        factor: 0.2,
        ttl: 8,
      });
      this._float(m.x, m.y, 'Xương!', '#c8b89a');
    }
    if (m.passive === 'SLIME_EXPLODE_SILENCE') {
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (dist(h, m) < CELL * 2.2 && h.class === 'MAGE') {
          h.silenced = true;
          this._float(h.x, h.y, 'Silence!', '#26a69a');
        }
      }
    }
    if (m.passive === 'VOID_FEAR' || (m.passive === 'DARK_BUFF' && m.hp <= 0)) {
      // minor fear = short stun
      if (killerHero) {
        killerHero.stunnedUntil = this.time + 0.8;
      }
    }
  }

  _updateMonsters(dt) {
    for (const m of this.monsters) {
      if (!m.alive || m.isTrap) continue;
      m.atkCd -= dt;

      let target = null;
      let bestD = Infinity;
      for (const h of this.heroes) {
        if (!h.alive) continue;
        if (h.stealth && !h.revealed && m.passive !== 'REVEAL') continue;
        const d = dist(m, h);
        if (d < bestD) {
          bestD = d;
          target = h;
        }
      }
      if (!target) continue;

      if (bestD <= m.range) {
        if (m.atkCd <= 0) {
          this._monsterAttack(m, target);
          m.atkCd = 1 / m.atkSpeed;
        }
      } else if (!m.isTrap && m.speed > 0) {
        // light chase within room
        const spd = m.speed * CELL * 0.5;
        const dx = target.x - m.x;
        const dy = target.y - m.y;
        const d = Math.hypot(dx, dy) || 1;
        // stay roughly in own room
        const ox = roomOriginX(m.roomIndex, this.roomWidth, GAP);
        const nx = m.x + (dx / d) * spd * dt;
        if (nx > ox && nx < ox + this.roomWidth) m.x = nx;
        m.y += (dy / d) * spd * dt * 0.5;
      }
    }
  }

  _monsterAttack(m, hero) {
    let dmg = m.atk;
    if (m.passive === 'BURST_FIRST_HIT' && !m.firstHitDone) {
      dmg *= 2;
      m.firstHitDone = true;
    }
    if (m.passive === 'ANTI_WARRIOR_BURST' && hero.class === 'WARRIOR') {
      dmg = Math.round(dmg * 2.2);
    }
    if (m.passive === 'SILENCE_ON_HIT' && hero.class === 'MAGE') {
      hero.silenced = true;
      this._float(hero.x, hero.y, 'Silence!', '#7e57c2');
    }
    if (m.passive === 'KNOCK_BACK_ROOM' && hero.roomIndex > 0) {
      hero.roomIndex -= 1;
      hero.x =
        roomOriginX(hero.roomIndex, this.roomWidth, GAP) +
        (COMBAT.GRID_COLS - 1) * CELL +
        CELL / 2;
      hero.path = null;
      hero.draining = false;
      this._float(hero.x, hero.y, 'Giật lùi!', '#8d6e63');
    }

    hero.hp -= dmg;
    this._float(hero.x, hero.y - 8, `-${dmg}`, m.color);
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

  draw() {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    ctx.clearRect(0, 0, w, h);

    // background
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2a2218');
    g.addColorStop(1, '#14110e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // rooms
    this.run.rooms.forEach((room, ri) => {
      const ox = roomOriginX(ri, this.roomWidth, GAP);
      const terrainColors = {
        NORMAL: '#3a3228',
        WATER: '#243a38',
        LOW_CEILING: '#3d2a24',
        DARK: '#1c1814',
        HIGH: '#353028',
      };
      ctx.fillStyle = terrainColors[room.terrain] || '#2a3344';
      ctx.fillRect(ox, 32, this.roomWidth, COMBAT.GRID_ROWS * CELL + 16);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeRect(ox, 32, this.roomWidth, COMBAT.GRID_ROWS * CELL + 16);

      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let c = 0; c <= COMBAT.GRID_COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(ox + c * CELL, 40);
        ctx.lineTo(ox + c * CELL, 40 + COMBAT.GRID_ROWS * CELL);
        ctx.stroke();
      }
      for (let r = 0; r <= COMBAT.GRID_ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(ox, 40 + r * CELL);
        ctx.lineTo(ox + this.roomWidth, 40 + r * CELL);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText(`${room.name}`, ox + 6, 24);
    });

    // gate label
    ctx.fillStyle = '#81c784';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('CỔNG', -50, 20);

    // treasure
    const tox = roomOriginX(this.run.rooms.length - 1, this.roomWidth, GAP) + this.roomWidth + 10;
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(tox, 60, 40, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText('KHO', tox + 8, 55);
    ctx.fillStyle = '#ff8a80';
    ctx.fillRect(tox, 108, 40, 6);
    ctx.fillStyle = '#69f0ae';
    ctx.fillRect(tox, 108, 40 * (this.treasureHp / this.treasureMax), 6);

    // zones
    for (const z of this.zones) {
      ctx.fillStyle = 'rgba(200,184,154,0.25)';
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // monsters
    for (const m of this.monsters) {
      if (!m.alive) continue;
      ctx.fillStyle = m.color;
      if (m.isTrap) {
        ctx.fillRect(m.x - 10, m.y - 10, 20, 20);
      } else {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 14 + m.rarity, 0, Math.PI * 2);
        ctx.fill();
      }
      // hp bar
      const ratio = m.hp / m.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(m.x - 16, m.y - 24, 32, 4);
      ctx.fillStyle = '#66bb6a';
      ctx.fillRect(m.x - 16, m.y - 24, 32 * ratio, 4);
    }

    // heroes
    for (const h of this.heroes) {
      if (!h.alive) continue;
      ctx.globalAlpha = h.stealth && !h.revealed ? 0.35 : 1;
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y - 14);
      ctx.lineTo(h.x + 12, h.y + 12);
      ctx.lineTo(h.x - 12, h.y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      const ratio = h.hp / h.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(h.x - 16, h.y - 26, 32, 4);
      ctx.fillStyle = '#ef5350';
      ctx.fillRect(h.x - 16, h.y - 26, 32 * ratio, 4);
      if (h.silenced) {
        ctx.fillStyle = '#b39ddb';
        ctx.font = '9px sans-serif';
        ctx.fillText('SIL', h.x - 8, h.y + 24);
      }
    }

    // floats
    for (const f of this.floatTexts) {
      ctx.globalAlpha = Math.min(1, f.ttl);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}
