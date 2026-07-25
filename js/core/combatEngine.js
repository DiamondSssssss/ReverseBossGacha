import { COMBAT, SPELLS, HERO_CLASS_LABELS } from '../data/constants.js';
import { MONSTER_BY_ID } from '../data/monsters.js';
import { findPath, roomOriginX } from './pathfinding.js';
import { ParticleSystem } from '../render/particles.js';
import {
  getMonsterSprite,
  getHeroSprite,
  drawSpriteAt,
} from '../render/sprites.js';

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
    case 'moving':
    default:
      return { text: '→ KHO', color: '#81c784' };
  }
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
    this.vfx = [];
    this.particles = new ParticleSystem();
    this.zones = []; // slow zones {x,y,r,factor,ttl}
    this.globalSlowUntil = 0;
    this.spellCd = { slow_wave: 0, heal_monsters: 0 };
    this.cameraX = 0;

    this.monsters = [];
    this.heroes = [];
    this.drawScale = 1;
    this.drawOffsetY = 40;
    this.speedMul = 1; // ×1 / ×2 / ×3 (nhân với BASE_TIME_SCALE)
    this.cameraX = COMBAT.CAMERA_MIN_X;
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
          flash: 0,
          bobPhase: Math.random() * Math.PI * 2,
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
    this._updateDrawLayout();
  }

  /** Scale map để lấp chiều cao canvas — không để dải mỏng trên đầu. */
  _updateDrawLayout() {
    const contentH = COMBAT.GRID_ROWS * CELL + 96; // nhãn + lưới + chân
    const marginT = 40;
    const marginB = 30;
    const avail = Math.max(120, this.viewH - marginT - marginB);
    this.drawScale = Math.min(2.75, Math.max(1, avail / contentH));
    const scaledH = contentH * this.drawScale;
    this.drawOffsetY = marginT + Math.max(0, (avail - scaledH) / 2);
  }

  /** Chiều ngang thế giới nhìn thấy trên màn (đã chia scale) */
  _viewWorldW() {
    return this.viewW / (this.drawScale || 1);
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

  /** @param {1|2|3} mul */
  setSpeedMul(mul) {
    this.speedMul = Math.max(1, Math.min(3, mul | 0));
    this.hooks.onUpdate?.(this.snapshot());
  }

  castSpell(spellId) {
    if (this.spellCd[spellId] > 0 || this.result) return false;
    const spell = SPELLS[spellId];
    if (!spell) return false;

    if (spellId === 'slow_wave') {
      this.globalSlowUntil = this.time + spell.duration;
      this._float(this.viewW / 2 + this.cameraX, 30, 'Sương Chậm!', '#81d4fa');
      for (const h of this.heroes) {
        if (h.alive) this.particles.frost(h.x, h.y);
      }
      for (let i = 0; i < 6; i++) {
        this.particles.frost(
          this.cameraX + (this.viewW * (i + 0.5)) / 6,
          60 + (i % 2) * 40
        );
      }
    } else if (spellId === 'heal_monsters') {
      this.monsters.forEach((m) => {
        if (!m.alive) return;
        m.hp = Math.min(m.maxHp, m.hp + m.maxHp * spell.healRatio);
        this.particles.heal(m.x, m.y - 8);
      });
      this._float(this.viewW / 2 + this.cameraX, 30, 'Huyết Ấn!', '#ef9a9a');
    }
    this.spellCd[spellId] = spell.cooldown;
    this.hooks.onUpdate?.(this.snapshot());
    return true;
  }

  snapshot() {
    const focus = this.heroes.find((h) => h.alive) || null;
    const intent = focus ? intentLabel(focus.intent || 'moving') : null;
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
      focusName: focus?.name || '',
      focusClass: focus ? HERO_CLASS_LABELS[focus.class] || focus.class : '',
      focusIntent: intent?.text || '',
      focusIntentColor: intent?.color || '',
      draining: this.heroes.some((h) => h.alive && h.draining),
      speedMul: this.speedMul || 1,
      nextSpawnIn: this._nextSpawnIn(),
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
    for (const m of this.monsters) {
      if (m.flash > 0) m.flash -= dt;
    }
    for (const h of this.heroes) {
      if (h.flash > 0) h.flash -= dt;
    }

    this._spawnHeroes();
    this._updateHeroes(dt);
    this._updateMonsters(dt);
    // ambient VFX
    for (const m of this.monsters) {
      if (!m.alive || m.isTrap) continue;
      if (m.passive === 'SLOW_AURA' && Math.random() < dt * 1.2) {
        this.particles.frost(m.x + (Math.random() - 0.5) * 12, m.y);
      } else if (m.passive === 'SILENCE_ON_HIT' && Math.random() < dt * 0.9) {
        this.particles.magic(m.x, m.y - 8, '#7e57c2');
      } else if ((m.passive === 'WATER_BUFF' || m.templateId === 'slime_sticky') && Math.random() < dt * 0.8) {
        this.particles.emit(m.x, m.y + 8, {
          count: 2,
          color: m.color,
          speed: 20,
          life: 0.5,
          size: 2,
          gravity: 30,
        });
      }
    }
    for (const h of this.heroes) {
      if (!h.alive) continue;
      if (h.class === 'MAGE' && Math.random() < dt * 2) {
        this.particles.magic(h.x + (Math.random() - 0.5) * 10, h.y - 14, h.color);
      }
    }
    this._checkEnd();
    this.hooks.onUpdate?.(this.snapshot());
  }

  _spawnHeroes() {
    for (const h of this.spawnQueue) {
      if (h.spawned) continue;
      if (this.time < h.spawnDelay) continue;
      h.spawned = true;
      const midRow = Math.floor(COMBAT.GRID_ROWS / 2);
      const entry = cellCenter(0, 0, midRow, this.roomWidth);
      // Xuất hiện trong Cổng (luôn nằm trong khung nhìn), rồi bước vào P1
      const gateX = -36;
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
        baseSpeed: h.speed * 0.85,
        speed: h.speed * 0.85,
        range: h.range * CELL,
        atkSpeed: h.atkSpeed * 0.9,
        aoeRadius: (h.aoeRadius || 0) * CELL,
        stealth: !!h.stealth,
        revealed: false,
        silenced: false,
        stunnedUntil: 0,
        frozenUntil: 0,
        slowFactor: 1,
        x: gateX,
        y: entry.y,
        roomIndex: 0,
        atkCd: 0.4,
        alive: true,
        panicking: false,
        path: [{ col: 0, row: midRow }],
        pathIdx: 0,
        draining: false,
        intent: 'entering',
        fightTarget: null,
        facing: 1,
        flash: 0.35,
        bobPhase: Math.random() * Math.PI * 2,
        spawnProtect: 0.6,
      });
      this.particles.magic(gateX, entry.y, h.color);
      this.particles.burst(gateX, entry.y, '#81c784');
      this._float(gateX, entry.y - 24, `${h.name} vào!`, h.color);
      // Camera kéo về cổng để thấy hero vào
      const viewW = this._viewWorldW();
      this.cameraX = Math.max(
        COMBAT.CAMERA_MIN_X,
        Math.min(0, gateX - viewW * 0.25)
      );
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

      hero.roomIndex = roomIndexFromX(
        Math.max(0, hero.x),
        this.run.rooms.length,
        this.roomWidth
      );

      // status
      const stunned = this.time < hero.stunnedUntil;
      const frozen = this.time < hero.frozenUntil;
      hero.facing = hero.panicking ? -1 : 1;
      hero.fightTarget = null;

      if (stunned) {
        hero.intent = 'stunned';
        continue;
      }
      if (frozen) {
        hero.intent = 'frozen';
        continue;
      }

      // Vừa từ Cổng bước vào — chỉ đi, chưa đánh / chưa dính bẫy
      if (hero.spawnProtect > 0) {
        hero.spawnProtect -= dt;
        hero.intent = 'entering';
        if (!hero.path || hero.pathIdx >= hero.path.length) {
          const midRow = Math.floor(COMBAT.GRID_ROWS / 2);
          hero.path = [{ col: 0, row: midRow }];
          hero.pathIdx = 0;
        }
        const node = hero.path[hero.pathIdx];
        if (node) {
          const dest = cellCenter(0, node.col, node.row, this.roomWidth);
          const spd = hero.baseSpeed * CELL * 0.75;
          const dx = dest.x - hero.x;
          const dy = dest.y - hero.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 5) {
            hero.pathIdx++;
            hero.x = dest.x;
            hero.y = dest.y;
            if (hero.pathIdx >= hero.path.length) {
              hero.spawnProtect = 0;
              hero.path = null;
              hero.intent = 'moving';
            }
          } else {
            hero.x += (dx / d) * spd * dt;
            hero.y += (dy / d) * spd * dt;
            hero.facing = 1;
          }
        }
        continue;
      }

      // trap check
      for (const m of this.monsters) {
        if (!m.alive || !m.isTrap) continue;
        if (dist(hero, m) < CELL * 0.6) {
          hero.hp -= m.atk;
          m.hp = 0;
          m.alive = false;
          this.particles.burst(m.x, m.y, m.color || '#ff7043');
          this.particles.hit(hero.x, hero.y, '#ff7043');
          this._float(hero.x, hero.y - 10, `Bẫy -${m.atk}`, '#ff7043');
          this._onMonsterDeath(m, hero);
        }
      }

      // taunt target
      let target = this._pickMonsterTarget(hero);
      const canFight = target && dist(hero, target) <= hero.range;

      if (canFight && !hero.panicking) {
        hero.intent = 'fighting';
        hero.fightTarget = target;
        hero.atkCd -= dt;
        if (hero.atkCd <= 0) {
          this._heroAttack(hero, target);
          hero.atkCd = 1 / hero.atkSpeed;
        }
      } else {
        hero.intent = hero.panicking ? 'fleeing' : 'moving';
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

          const spd = hero.baseSpeed * CELL * 0.75 * speedMul;
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
            if (Math.abs(dx) > 1) hero.facing = dx >= 0 ? 1 : -1;
          }
        }
      }

      if (hero.draining && hero.alive && !hero.panicking) {
        hero.intent = 'draining';
        this.treasureHp -= 18 * dt;
        if (this.treasureHp <= 0) {
          this.treasureHp = 0;
        }
        if (Math.random() < dt * 10) {
          this.particles.gold(hero.x, hero.y - 6);
        }
      }

      if (hero.hp <= 0) {
        hero.alive = false;
        this.particles.death(hero.x, hero.y, hero.color);
        this._float(hero.x, hero.y, 'Hạ!', '#fff');
      }
    }

    // Camera: luôn thấy Cổng khi hero gần cổng / chưa spawn hết
    const focus = this.heroes.find((h) => h.alive) || null;
    const viewW = this._viewWorldW();
    const minCam = COMBAT.CAMERA_MIN_X;
    const maxCam = Math.max(minCam, this.totalWidth - viewW + 40);
    if (focus) {
      this.cameraX = Math.max(minCam, Math.min(maxCam, focus.x - viewW * 0.32));
    } else if (!this.spawnQueue.every((h) => h.spawned)) {
      this.cameraX = minCam;
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
    this._beam(hero, target, hero.color || '#ef9a9a');
    hero.flash = 0.18;
    this.particles.hit(target.x, target.y, hero.color || '#ef9a9a');
    if (hero.class === 'MAGE') {
      this.particles.magic(target.x, target.y, hero.color);
    }
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
        this.particles.frost(target.x, target.y);
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
    this.particles.death(m.x, m.y, m.color || '#fff');
    if (m.passive === 'BONE_PILE') {
      this.zones.push({
        x: m.x,
        y: m.y,
        r: CELL * 1.6,
        factor: 0.2,
        ttl: 8,
      });
      this.particles.bone(m.x, m.y);
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
        if (h.spawnProtect > 0) continue;
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
        const spd = m.speed * CELL * 0.4;
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
    this._beam(m, hero, m.color || '#66bb6a');
    m.flash = 0.16;
    this.particles.hit(hero.x, hero.y, m.color || '#66bb6a');
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

    ctx.save();
    ctx.translate(0, offsetY);
    ctx.scale(scale, scale);
    ctx.translate(-this.cameraX, 0);

    const gridTop = 40;
    const gridH = COMBAT.GRID_ROWS * CELL;
    const roomPad = 10;

    // sàn dưới phòng
    ctx.fillStyle = '#100e0c';
    ctx.fillRect(-100, gridTop + gridH + 6, this.totalWidth + 200, 40);

    // rooms
    this.run.rooms.forEach((room, ri) => {
      const ox = roomOriginX(ri, this.roomWidth, GAP);
      const terrainColors = {
        NORMAL: '#3a3228',
        WATER: '#1e3a38',
        LOW_CEILING: '#3d2a24',
        DARK: '#1a1612',
        HIGH: '#353028',
      };
      ctx.fillStyle = terrainColors[room.terrain] || '#2a3344';
      ctx.fillRect(ox, gridTop - roomPad, this.roomWidth, gridH + roomPad * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(ox, gridTop - roomPad, this.roomWidth, gridH + roomPad * 2);

      // lane tint: left = entrance, right = exit
      ctx.fillStyle = 'rgba(129,199,132,0.08)';
      ctx.fillRect(ox, gridTop, CELL * 0.85, gridH);
      ctx.fillStyle = 'rgba(255,213,79,0.08)';
      ctx.fillRect(ox + this.roomWidth - CELL * 0.85, gridTop, CELL * 0.85, gridH);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= COMBAT.GRID_COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(ox + c * CELL, gridTop);
        ctx.lineTo(ox + c * CELL, gridTop + gridH);
        ctx.stroke();
      }
      for (let r = 0; r <= COMBAT.GRID_ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(ox, gridTop + r * CELL);
        ctx.lineTo(ox + this.roomWidth, gridTop + r * CELL);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.fillText(`P${ri + 1} ${room.name}`, ox + 6, gridTop - 14);

      if (ri < this.run.rooms.length - 1) {
        const mx = ox + this.roomWidth + GAP / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('→', mx - 6, gridTop + gridH / 2);
      }
    });

    // Gate portal (left)
    const gateX = -70;
    ctx.fillStyle = '#1b4332';
    ctx.fillRect(gateX, gridTop - roomPad, 60, gridH + roomPad * 2);
    ctx.strokeStyle = '#81c784';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(gateX, gridTop - roomPad, 60, gridH + roomPad * 2);
    ctx.fillStyle = '#81c784';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('CỔNG', gateX + 10, gridTop - 16);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(129,199,132,0.9)';
    ctx.fillText('Hero vào', gateX + 6, gridTop + gridH / 2);

    // Treasure — giữa chiều cao phòng
    const tox = roomOriginX(this.run.rooms.length - 1, this.roomWidth, GAP) + this.roomWidth + 16;
    const draining = this.heroes.some((hh) => hh.alive && hh.draining);
    const chestY = gridTop + gridH / 2 - 28;
    ctx.fillStyle = draining ? '#ff8f00' : '#9a6b2a';
    ctx.fillRect(tox, chestY, 56, 56);
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(tox, chestY, 56, 56);
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('KHO', tox + 14, chestY - 8);
    if (draining) {
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('ĐANG RÚT!', tox - 4, chestY + 72);
    }
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(tox, chestY + 60, 56, 8);
    ctx.fillStyle = this.treasureHp / this.treasureMax < 0.35 ? '#ff5252' : '#69f0ae';
    ctx.fillRect(tox, chestY + 60, 56 * (this.treasureHp / this.treasureMax), 8);

    // Drain beams from draining heroes to treasure
    for (const h of this.heroes) {
      if (!h.alive || !h.draining) continue;
      ctx.strokeStyle = 'rgba(255,213,79,0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(tox + 28, chestY + 28);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // zones
    for (const z of this.zones) {
      ctx.fillStyle = 'rgba(200,184,154,0.28)';
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,184,154,0.5)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '9px sans-serif';
      ctx.fillText('chậm', z.x - 12, z.y + 3);
    }

    // attack beams
    for (const v of this.vfx) {
      if (v.type !== 'beam') continue;
      ctx.globalAlpha = Math.min(1, v.ttl * 4);
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(v.x1, v.y1);
      ctx.lineTo(v.x2, v.y2);
      ctx.stroke();
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(v.x2, v.y2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // fight range rings + target lines for fighting heroes
    for (const h of this.heroes) {
      if (!h.alive || h.intent !== 'fighting' || !h.fightTarget) continue;
      ctx.strokeStyle = 'rgba(239,83,80,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(239,83,80,0.45)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(h.fightTarget.x, h.fightTarget.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // monsters — sprites
    for (const m of this.monsters) {
      if (!m.alive) continue;
      const spr = getMonsterSprite(m.templateId, m.color, m.rarity);
      const bob = m.isTrap ? 0 : Math.sin(this.time * 4 + m.bobPhase) * 2.2;
      const size = m.isTrap ? CELL * 0.88 : CELL * 0.95 + m.rarity * 1.5;
      drawSpriteAt(ctx, spr, m.x, m.y, {
        size,
        bob,
        flash: m.flash || 0,
        squash: m.flash > 0 ? 1.08 : 1,
      });

      const ratio = Math.max(0, m.hp / m.maxHp);
      const barY = m.y - size / 2 - 8 + bob;
      ctx.fillStyle = '#222';
      ctx.fillRect(m.x - 16, barY, 32, 4);
      ctx.fillStyle = '#66bb6a';
      ctx.fillRect(m.x - 16, barY, 32 * ratio, 4);

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = 'bold 9px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shortLabel(m.name), m.x, m.y + size / 2 + 10 + bob);
      if (m.isTrap) {
        ctx.fillStyle = '#ffcc80';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('BẪY', m.x, m.y + size / 2 + 20 + bob);
      }
      ctx.textAlign = 'left';
    }

    // heroes — sprites
    for (const h of this.heroes) {
      if (!h.alive) continue;
      const spr = getHeroSprite(h.templateId, h.class, h.color);
      const bob = Math.sin(this.time * 5 + h.bobPhase) * 2.5;
      const alpha = h.stealth && !h.revealed ? 0.45 : 1;
      drawSpriteAt(ctx, spr, h.x, h.y, {
        size: CELL * 1.08,
        facing: h.facing || 1,
        bob,
        flash: h.flash || 0,
        alpha,
        squash: h.intent === 'fighting' ? 1.06 : 1,
      });

      const ratio = Math.max(0, h.hp / h.maxHp);
      ctx.fillStyle = '#222';
      ctx.fillRect(h.x - 18, h.y - 30 + bob, 36, 5);
      ctx.fillStyle = ratio <= COMBAT.PANIC_HP_RATIO ? '#ffeb3b' : '#ef5350';
      ctx.fillRect(h.x - 18, h.y - 30 + bob, 36 * ratio, 5);

      const badge = intentLabel(h.intent || 'moving');
      ctx.fillStyle = badge.color;
      ctx.font = 'bold 9px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badge.text, h.x, h.y - 34 + bob);

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.fillText(h.name, h.x, h.y + 28 + bob);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '8px "Segoe UI", sans-serif';
      ctx.fillText(HERO_CLASS_LABELS[h.class] || h.class, h.x, h.y + 38 + bob);

      const tags = [];
      if (h.silenced) tags.push('Câm');
      if (h.stealth && !h.revealed) tags.push('Ẩn');
      if (h.panicking) tags.push('Sợ');
      if (tags.length) {
        ctx.fillStyle = '#b39ddb';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(tags.join('·'), h.x, h.y + 48 + bob);
      }
      ctx.textAlign = 'left';
    }

    // particles (world space)
    this.particles.draw(ctx);

    // floats
    for (const f of this.floatTexts) {
      ctx.globalAlpha = Math.min(1, f.ttl);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // Screen-space legend + minimap
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(6, 6, Math.min(300, w - 12), 34);
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText('Hero / Quái / Bẫy  ·  Cổng → Phòng → Kho', 12, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Chặn Hero trước khi chúng rút máu Kho', 12, 34);

    // minimap
    const mmW = Math.min(160, w - 16);
    const mmH = 18;
    const mmX = w - mmW - 8;
    const mmY = h - mmH - 8;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(mmX - 4, mmY - 4, mmW + 8, mmH + 8);
    const roomWmm = mmW / this.run.rooms.length;
    this.run.rooms.forEach((_, ri) => {
      ctx.fillStyle = ri % 2 ? '#3a3228' : '#2a3344';
      ctx.fillRect(mmX + ri * roomWmm, mmY, roomWmm - 1, mmH);
    });
    const viewWW = this._viewWorldW();
    const camRatio = this.cameraX / Math.max(1, this.totalWidth);
    const winRatio = viewWW / Math.max(1, this.totalWidth);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.strokeRect(mmX + camRatio * mmW, mmY, Math.max(8, winRatio * mmW), mmH);
    for (const hh of this.heroes) {
      if (!hh.alive) continue;
      const px = mmX + (hh.x / this.totalWidth) * mmW;
      ctx.fillStyle = hh.color;
      ctx.fillRect(px - 2, mmY + 4, 4, 10);
    }
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(mmX + mmW - 6, mmY + 3, 5, 12);
    ctx.fillStyle = '#81c784';
    ctx.fillRect(mmX, mmY + 3, 5, 12);
  }
}
