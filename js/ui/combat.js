import { SPELLS, REWARDS, RARITY_COLORS, MAX_STAGE } from '../data/constants.js?v=77';
import { MONSTER_BY_ID } from '../data/monsters.js?v=77';
import { bossSpells, getBoss, syncUnlockedBosses } from '../data/dungeonBosses.js?v=77';
import { CombatEngine } from '../core/combatEngine.js?v=77';
import { saveState } from '../core/storage.js?v=77';
import { evaluateAchievements, isGameCleared } from '../core/achievements.js?v=77';
import { monsterSpriteUrl } from '../render/sprites.js?v=77';
import { bindMonsterTips, hideMonsterTip } from './monsterTip.js?v=77';

let engine = null;

function shortName(name) {
  if (!name) return '?';
  const parts = String(name).split(/\s+/);
  return parts.slice(-2).join(' ');
}

function handHtml(hand, selectedId, freeCost) {
  const entries = Object.entries(hand || {}).filter(([, n]) => n > 0);
  if (!entries.length) {
    return `<p class="deploy-empty muted">Tay bài trống — đã thả hết / không mang dư.</p>`;
  }
  return entries
    .map(([id, n]) => {
      const m = MONSTER_BY_ID[id];
      if (!m) return '';
      const tooCostly = m.cost > freeCost;
      const selected = selectedId === id;
      return `
        <button type="button" class="deploy-card ${selected ? 'selected' : ''} ${tooCostly ? 'too-costly' : ''}"
          data-deploy="${id}" title="${m.name} · C${m.cost}${tooCostly ? ' · Thiếu slot' : ''}">
          <img src="${monsterSpriteUrl(id, m.color, m.rarity)}" alt="" width="36" height="36" />
          <span class="deploy-meta">
            <strong>${shortName(m.name)}</strong>
            <span style="color:${RARITY_COLORS[m.rarity] || '#666'}">C${m.cost} · ×${n}</span>
          </span>
        </button>`;
    })
    .join('');
}

export function renderCombat(root, ctx) {
  const { run, state, go, toast, refreshChrome, announceAchievements } = ctx;
  if (!run) {
    root.innerHTML = `<p class="muted">Chưa có run.</p>`;
    return;
  }

  if (engine) {
    engine.stop();
    engine = null;
  }

  const boss = getBoss(state.selectedBossId);
  const spells = bossSpells(boss.id);
  const initialHand = { ...(run.deployHand || {}) };

  root.innerHTML = `
    <div class="combat-wrap">
      <div class="combat-head">
        <div>
          <h2>Chiến đấu · ${boss.name}</h2>
          <p class="combat-legend">Kéo map xem trận · Chọn quái → chạm thả · Cost ≤ Cap</p>
        </div>
        <div class="combat-head-right">
          <div class="speed-row" id="speed-row" role="group" aria-label="Tốc độ">
            <button type="button" class="speed-btn" data-speed="0.5">×0.5</button>
            <button type="button" class="speed-btn active" data-speed="1">×1</button>
            <button type="button" class="speed-btn" data-speed="2">×2</button>
            <button type="button" class="speed-btn" data-speed="3">×3</button>
          </div>
          <span class="muted" id="combat-status">Đang đánh…</span>
        </div>
      </div>
      <canvas id="combat-canvas"></canvas>
      <div class="combat-intent" id="combat-intent">Đợi Hero vào từ Cổng…</div>
      <div class="combat-hud">
        <div class="stat" id="hud-treasure">Kho báu<b>—</b></div>
        <div class="stat" id="hud-cost">Cost sân<b>—</b></div>
        <div class="stat" id="hud-wave">Hero còn<b>—</b></div>
      </div>
      <div class="deploy-row">
        <div class="deploy-label">Tay bài <span id="deploy-hint" class="muted"></span></div>
        <div class="deploy-hand" id="deploy-hand">${handHtml(initialHand, null, 0)}</div>
      </div>
      <div class="spell-row" id="spell-row">
        ${spells
          .map(
            (s) => `
          <button type="button" class="spell-btn" data-spell="${s.id}">
            ${s.name}
            <small>${s.desc}</small>
          </button>`
          )
          .join('')}
      </div>
      <div class="combat-cam-row">
        <button type="button" class="cam-btn" id="btn-cam-gate" title="Nhìn về Cổng">Về Cổng</button>
        <button type="button" class="cam-btn" id="btn-cam-treasure" title="Nhìn về Kho">Về Kho</button>
        <span class="muted cam-hint">Kéo map để xem</span>
      </div>
      <div class="combat-controls">
        <button type="button" id="btn-pause">Tạm dừng</button>
        <button type="button" id="btn-abort">Bỏ chạy</button>
      </div>
    </div>
  `;

  const canvas = root.querySelector('#combat-canvas');
  const hudT = root.querySelector('#hud-treasure');
  const hudCost = root.querySelector('#hud-cost');
  const hudW = root.querySelector('#hud-wave');
  const status = root.querySelector('#combat-status');
  const intentEl = root.querySelector('#combat-intent');
  const handEl = root.querySelector('#deploy-hand');
  const hintEl = root.querySelector('#deploy-hint');
  const spellBtns = [...root.querySelectorAll('.spell-btn')];
  const btnPause = root.querySelector('#btn-pause');
  const speedRow = root.querySelector('#speed-row');

  let lastHandKey = '';

  function refreshHand(snap) {
    const key = `${JSON.stringify(snap.hand)}|${snap.selectedDeployId}|${snap.freeCost}|${snap.result || ''}`;
    if (key === lastHandKey) return;
    lastHandKey = key;
    handEl.innerHTML = handHtml(snap.hand, snap.selectedDeployId, snap.freeCost);
    hintEl.textContent = snap.selectedDeployId
      ? '· chạm ô trên map'
      : snap.freeCost > 0
        ? `· slot trống ${snap.freeCost}`
        : '· chờ quái chết để mở slot';
    handEl.querySelectorAll('[data-deploy]').forEach((btn) => {
      btn.onclick = () => {
        if (!engine || engine.result) return;
        const id = btn.getAttribute('data-deploy');
        engine.setSelectedDeploy(id);
        if (engine.selectedDeployId) {
          const m = MONSTER_BY_ID[id];
          toast(m ? `Thả: ${m.name} (C${m.cost})` : 'Đã chọn');
        }
      };
    });
    bindMonsterTips(
      handEl,
      '[data-deploy]',
      (el) => el.getAttribute('data-deploy'),
      state,
      (el) =>
        el.classList.contains('too-costly')
          ? { note: 'Thiếu slot Cost — chờ quái chết' }
          : undefined
    );
  }

  function onEnd(result) {
    const killed = run.wave.length;
    let souls = 0;
    let gold = 0;

    if (result === 'win') {
      souls =
        REWARDS.WIN_SOULS_BASE +
        killed * REWARDS.PER_HERO_SOULS +
        run.level * 20;
      gold =
        REWARDS.WIN_GOLD_BASE + killed * REWARDS.PER_HERO_GOLD + run.level * 10;
      state.souls += souls;
      state.gold += gold;
      state.stats.wins += 1;
      const beforeClear = !isGameCleared(state);
      state.dungeonLevel += 1;
      const clearedJustNow = beforeClear && isGameCleared(state);
      const beforeBosses = new Set(state.unlockedBosses || []);
      syncUnlockedBosses(state);
      const newBosses = (state.unlockedBosses || []).filter((id) => !beforeBosses.has(id));
      saveState(state);
      const unlocked = evaluateAchievements(state);
      announceAchievements?.(unlocked);
      if (newBosses.length) {
        const names = newBosses.map((id) => getBoss(id).name).join(', ');
        toast?.(`Mở boss: ${names}`);
      }
      refreshChrome();
      ctx.lastReward = {
        result: 'win',
        souls,
        gold,
        clearedJustNow,
        dungeonLevel: state.dungeonLevel,
      };
      go('reward');
    } else {
      souls = REWARDS.LOSE_SOULS;
      const defeated = (engine?.heroes || []).filter((h) => !h.alive).length;
      gold = defeated * (REWARDS.LOSE_PER_HERO_GOLD ?? REWARDS.PER_HERO_GOLD);
      state.souls += souls;
      if (gold > 0) state.gold += gold;
      state.stats.losses += 1;
      saveState(state);
      evaluateAchievements(state);
      refreshChrome();
      ctx.lastReward = {
        result: 'lose',
        souls,
        gold,
        heroesDefeated: defeated,
      };
      go('reward');
    }
  }

  engine = new CombatEngine(run, canvas, {
    monsterUpgrades: state.monsterUpgrades || {},
    bossId: boss.id,
    hand: initialHand,
    onUpdate(snap) {
      const shieldTxt =
        snap.treasureShield > 0 ? ` · Khiên ${Math.ceil(snap.treasureShield)}` : '';
      hudT.innerHTML = `Kho báu<b>${Math.ceil(snap.treasureHp)}/${snap.treasureMax}${shieldTxt}</b>`;
      hudCost.innerHTML = `Cost sân<b>${snap.costUsed}/${snap.costCap}</b>`;
      if (snap.freeCost > 0 && Object.values(snap.hand || {}).some((n) => n > 0)) {
        hudCost.classList.add('can-deploy');
      } else {
        hudCost.classList.remove('can-deploy');
      }
      hudW.innerHTML = `Hero còn<b>${snap.heroesAlive}/${snap.heroesTotal}</b>`;
      if (snap.draining) {
        hudT.classList.add('danger');
      } else {
        hudT.classList.remove('danger');
      }
      if (snap.focusName) {
        intentEl.innerHTML = `<b style="color:${snap.focusIntentColor || '#333'}">${snap.focusIntent}</b> — ${snap.focusName} <span class="muted">(${snap.focusClass})</span>`;
      } else if (snap.nextSpawnIn > 0) {
        intentEl.textContent = `Hero vào Cổng sau ${snap.nextSpawnIn.toFixed(1)}s…`;
      } else {
        intentEl.textContent = 'Đợi Hero vào từ Cổng…';
      }

      refreshHand(snap);

      for (const btn of spellBtns) {
        const id = btn.getAttribute('data-spell');
        const spell = SPELLS[id];
        const cd = snap.spellCd[id] || 0;
        btn.disabled = cd > 0 || !!snap.result;
        const small = btn.querySelector('small');
        if (small) {
          small.textContent = cd > 0 ? `CD ${cd.toFixed(1)}s` : spell?.desc || '';
        }
      }

      if (snap.result) {
        /* keep end status */
      } else if (snap.selectedDeployId) status.textContent = 'Chạm map thả quái';
      else if (snap.globalSlow) status.textContent = 'Sương Chậm!';
      else if (snap.monsterRage) status.textContent = 'Trống Chiến!';
      else if (snap.treasureShield > 0) status.textContent = 'Khiên Kho!';
      else if (snap.draining) status.textContent = 'Hero đang rút Kho!';
      else status.textContent = `×${Number(snap.speedMul || 1).toFixed(snap.speedMul < 1 ? 1 : 0)}`;
    },
    onWin() {
      status.textContent = 'Thắng!';
      onEnd('win');
    },
    onLose() {
      status.textContent = 'Thua…';
      onEnd('lose');
    },
  });

  engine.start();

  // Layout ổn định sau paint → scale map đúng chiều cao
  requestAnimationFrame(() => {
    engine?._resize();
    requestAnimationFrame(() => engine?._resize());
  });

  function cast(id) {
    if (!engine.castSpell(id)) {
      toast('Đang cooldown');
      return;
    }
    state.stats.spellsCast = (state.stats.spellsCast || 0) + 1;
    saveState(state);
    const unlocked = evaluateAchievements(state);
    announceAchievements?.(unlocked);
  }

  for (const btn of spellBtns) {
    btn.onclick = () => cast(btn.getAttribute('data-spell'));
  }

  root.querySelector('#btn-cam-gate').onclick = () => engine?.focusGate();
  root.querySelector('#btn-cam-treasure').onclick = () => engine?.focusTreasure();

  // Drag to pan; tap (no drag) deploys if a card is selected
  const PAN_THRESH = 6;
  let panPtr = null;

  function ptrPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top, clientX: src.clientX };
  }

  function onPanStart(e) {
    if (!engine || engine.result) return;
    if (e.button != null && e.button !== 0) return;
    const p = ptrPos(e);
    panPtr = { startX: p.x, startY: p.y, lastX: p.x, dragged: false };
    if (e.pointerId != null) canvas.setPointerCapture?.(e.pointerId);
  }

  function onPanMove(e) {
    if (!panPtr || !engine) return;
    const p = ptrPos(e);
    const dx = p.x - panPtr.lastX;
    const total = Math.hypot(p.x - panPtr.startX, p.y - panPtr.startY);
    if (total >= PAN_THRESH) panPtr.dragged = true;
    if (panPtr.dragged) {
      const scale = engine.drawScale || 1;
      engine.panCamera(-dx / scale);
      e.preventDefault?.();
    }
    panPtr.lastX = p.x;
  }

  function onPanEnd(e) {
    if (!panPtr || !engine) {
      panPtr = null;
      return;
    }
    const wasDrag = panPtr.dragged;
    const p = ptrPos(e);
    panPtr = null;
    if (wasDrag || engine.result) return;
    const id = engine.selectedDeployId;
    if (!id) return;
    const cell = engine.screenToCell(p.x, p.y);
    if (!cell) {
      toast('Ngoài map');
      return;
    }
    const res = engine.deployMonster(id, cell.col, cell.row);
    if (!res.ok) {
      toast(res.reason || 'Không thả được');
      return;
    }
    if (!(engine.hand[id] > 0)) {
      engine.selectedDeployId = null;
    }
    engine.hooks.onUpdate?.(engine.snapshot());
  }

  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', onPanStart);
  canvas.addEventListener('pointermove', onPanMove);
  canvas.addEventListener('pointerup', onPanEnd);
  canvas.addEventListener('pointercancel', () => {
    panPtr = null;
  });
  canvas.addEventListener('pointerdown', () => {
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointerup', () => {
    canvas.style.cursor = 'grab';
  });

  speedRow.querySelectorAll('.speed-btn').forEach((btn) => {
    btn.onclick = () => {
      const mul = Number(btn.getAttribute('data-speed')) || 1;
      engine.setSpeedMul(mul);
      speedRow.querySelectorAll('.speed-btn').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
    };
  });

  let paused = false;
  btnPause.onclick = () => {
    paused = !paused;
    engine.setPaused(paused);
    btnPause.textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
  };

  // Đồng bộ nếu tutorial / code khác gọi setPaused
  const _setPaused = engine.setPaused.bind(engine);
  engine.setPaused = (p) => {
    paused = !!p;
    _setPaused(paused);
    btnPause.textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
  };

  root.querySelector('#btn-abort').onclick = () => {
    engine.stop();
    state.stats.losses += 1;
    const consol = Math.floor(REWARDS.LOSE_SOULS / 2);
    state.souls += consol;
    saveState(state);
    toast(consol ? `Đã bỏ chạy · +${consol} LH` : 'Đã bỏ chạy');
    go('hub');
  };

  const onResize = () => engine && engine._resize();
  window.addEventListener('resize', onResize, { passive: true });
  root._cleanup = () => {
    window.removeEventListener('resize', onResize);
    if (engine) {
      engine.stop();
      engine = null;
    }
  };
}

export function renderReward(root, ctx) {
  const { lastReward, go, state, startRun } = ctx;
  const r = lastReward || { result: 'win', souls: 0, gold: 0 };
  const win = r.result === 'win';
  const stageClass = r.clearedJustNow ? 'clear' : win ? '' : 'lose';
  const mark = r.clearedJustNow ? String(MAX_STAGE) : win ? 'OK' : '…';
  const replayLabel = win ? 'Vào ải tiếp' : 'Chơi lại';

  root.innerHTML = `
    <div class="reward-stage ${stageClass}">
      <div class="seal-mark">${mark}</div>
      <h2>${r.clearedJustNow ? 'Phá đảo' : win ? 'Chiến thắng' : 'Thất thủ'}</h2>
      <p class="muted">${
        r.clearedJustNow
          ? `Thắng ải ${MAX_STAGE}. Tiếp tục sưu tầm ấn chương còn lại.`
          : win
            ? `Tiến độ: ải ${Math.min(state.dungeonLevel, MAX_STAGE)}/${MAX_STAGE}`
            : r.heroesDefeated
              ? `Kho báu bị rút — nhưng đã hạ/đẩy ${r.heroesDefeated} Hero.`
              : 'Kho báu bị rút — nhận Linh Hồn an ủi.'
      }</p>
      <div class="big-num">+${r.souls} LH</div>
      ${r.gold ? `<div class="muted">+${r.gold} Vàng</div>` : ''}
      <div class="reward-actions">
        <button type="button" class="primary big" id="btn-replay">${replayLabel}</button>
        <button type="button" id="btn-to-gacha">Quay Gacha</button>
        <button type="button" id="btn-to-ach">Ấn chương</button>
        <button type="button" class="ghost" id="btn-to-hub">Về sảnh</button>
      </div>
    </div>
  `;

  root.querySelector('#btn-replay').onclick = () => {
    if (typeof startRun === 'function') startRun();
    go('scout');
  };
  root.querySelector('#btn-to-gacha').onclick = () => go('gacha');
  root.querySelector('#btn-to-ach').onclick = () => go('achievements');
  root.querySelector('#btn-to-hub').onclick = () => go('hub');
}

export function stopCombatIfAny() {
  if (engine) {
    engine.stop();
    engine = null;
  }
}

export function getCombatEngine() {
  return engine;
}
