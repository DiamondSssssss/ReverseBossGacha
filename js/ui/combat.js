import { SPELLS, REWARDS } from '../data/constants.js';
import { CombatEngine } from '../core/combatEngine.js';
import { saveState } from '../core/storage.js';
import { evaluateAchievements, isGameCleared } from '../core/achievements.js';

let engine = null;

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

  root.innerHTML = `
    <div class="combat-wrap">
      <div class="combat-head">
        <div>
          <h2>Chiến đấu</h2>
          <p class="combat-legend">▲ Hero · ● Quái · ■ Bẫy · Cổng → Kho</p>
        </div>
        <div class="combat-head-right">
          <div class="speed-row" id="speed-row" role="group" aria-label="Tốc độ">
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
        <div class="stat" id="hud-wave">Hero còn<b>—</b></div>
      </div>
      <div class="spell-row">
        <button type="button" id="spell-slow">
          ${SPELLS.slow_wave.name}
          <small>${SPELLS.slow_wave.desc}</small>
        </button>
        <button type="button" id="spell-heal">
          ${SPELLS.heal_monsters.name}
          <small>${SPELLS.heal_monsters.desc}</small>
        </button>
      </div>
      <div class="combat-controls">
        <button type="button" id="btn-pause">Tạm dừng</button>
        <button type="button" id="btn-abort">Bỏ chạy</button>
      </div>
    </div>
  `;

  const canvas = root.querySelector('#combat-canvas');
  const hudT = root.querySelector('#hud-treasure');
  const hudW = root.querySelector('#hud-wave');
  const status = root.querySelector('#combat-status');
  const intentEl = root.querySelector('#combat-intent');
  const btnSlow = root.querySelector('#spell-slow');
  const btnHeal = root.querySelector('#spell-heal');
  const btnPause = root.querySelector('#btn-pause');
  const speedRow = root.querySelector('#speed-row');

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
      saveState(state);
      const unlocked = evaluateAchievements(state);
      announceAchievements?.(unlocked);
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
      state.souls += souls;
      state.stats.losses += 1;
      saveState(state);
      evaluateAchievements(state);
      refreshChrome();
      ctx.lastReward = { result: 'lose', souls, gold: 0 };
      go('reward');
    }
  }

  engine = new CombatEngine(run, canvas, {
    onUpdate(snap) {
      hudT.innerHTML = `Kho báu<b>${Math.ceil(snap.treasureHp)}/${snap.treasureMax}</b>`;
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
      btnSlow.disabled = snap.spellCd.slow_wave > 0 || !!snap.result;
      btnHeal.disabled = snap.spellCd.heal_monsters > 0 || !!snap.result;
      if (snap.spellCd.slow_wave > 0) {
        btnSlow.querySelector('small').textContent = `CD ${snap.spellCd.slow_wave.toFixed(1)}s`;
      } else {
        btnSlow.querySelector('small').textContent = SPELLS.slow_wave.desc;
      }
      if (snap.spellCd.heal_monsters > 0) {
        btnHeal.querySelector('small').textContent = `CD ${snap.spellCd.heal_monsters.toFixed(1)}s`;
      } else {
        btnHeal.querySelector('small').textContent = SPELLS.heal_monsters.desc;
      }
      if (snap.result) {
        /* keep end status */
      } else if (snap.globalSlow) status.textContent = 'Sương Chậm!';
      else if (snap.draining) status.textContent = 'Hero đang rút Kho!';
      else status.textContent = `×${snap.speedMul || 1}`;
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

  btnSlow.onclick = () => cast('slow_wave');
  btnHeal.onclick = () => cast('heal_monsters');

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

  root.querySelector('#btn-abort').onclick = () => {
    engine.stop();
    state.stats.losses += 1;
    saveState(state);
    toast('Đã bỏ chạy');
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
  const { lastReward, go, state } = ctx;
  const r = lastReward || { result: 'win', souls: 0, gold: 0 };
  const win = r.result === 'win';
  const stageClass = r.clearedJustNow ? 'clear' : win ? '' : 'lose';
  const mark = r.clearedJustNow ? '20' : win ? 'OK' : '…';

  root.innerHTML = `
    <div class="reward-stage ${stageClass}">
      <div class="seal-mark">${mark}</div>
      <h2>${r.clearedJustNow ? 'Phá đảo' : win ? 'Chiến thắng' : 'Thất thủ'}</h2>
      <p class="muted">${
        r.clearedJustNow
          ? 'Thắng ải 20. Tiếp tục sưu tầm ấn chương còn lại.'
          : win
            ? `Tiến độ: ải ${Math.min(state.dungeonLevel, 20)}/20`
            : 'Kho báu bị rút — nhận Linh Hồn an ủi.'
      }</p>
      <div class="big-num">+${r.souls} LH</div>
      ${r.gold ? `<div class="muted">+${r.gold} Vàng</div>` : ''}
      <div class="reward-actions">
        <button type="button" class="primary" id="btn-to-gacha">Quay Gacha</button>
        <button type="button" id="btn-to-ach">Ấn chương</button>
        <button type="button" class="ghost" id="btn-to-hub">Về sảnh</button>
      </div>
    </div>
  `;

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
