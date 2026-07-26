import {
  loadState,
  saveState,
  resetState,
  inventoryCopy,
} from './core/storage.js';
import { createRunState } from './core/dungeon.js';
import { loadoutFingerprint } from './core/loadout.js';
import { evaluateAchievements } from './core/achievements.js';
import { initAuth, onAuthChange } from './core/auth.js';
import { renderHub } from './ui/hub.js';
import { renderGacha } from './ui/gachaUI.js';
import { renderCollection } from './ui/collection.js';
import { renderScout, renderSetup } from './ui/setup.js';
import { renderCombat, renderReward, stopCombatIfAny, getCombatEngine } from './ui/combat.js';
import { renderAchievements, announceUnlocks } from './ui/achievementsUI.js';
import { renderLeaderboard } from './ui/leaderboardUI.js';
import { startGuidedTour, showTipBanner } from './ui/tutorial.js';
import { renderAccountBar } from './ui/authUI.js';

const state = loadState();
let run = null;
let inventory = null;
let lastReward = null;
let currentScreen = 'hub';

const screens = {
  hub: document.getElementById('screen-hub'),
  gacha: document.getElementById('screen-gacha'),
  collection: document.getElementById('screen-collection'),
  leaderboard: document.getElementById('screen-leaderboard'),
  achievements: document.getElementById('screen-achievements'),
  scout: document.getElementById('screen-scout'),
  setup: document.getElementById('screen-setup'),
  combat: document.getElementById('screen-combat'),
  reward: document.getElementById('screen-reward'),
};

const navDock = document.getElementById('nav-dock');
const resourcesEl = document.getElementById('resources');
const accountEl = document.getElementById('account-slot');
const topLbBtn = document.getElementById('btn-top-lb');
const toastEl = document.getElementById('toast');
const tipSlot = document.getElementById('tip-slot');
const modalEl = document.getElementById('modal');
let toastTimer = 0;

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function refreshChrome() {
  resourcesEl.innerHTML = `
    <div class="res-cell soul"><span class="lbl">Linh hồn</span><span class="val">${state.souls}</span></div>
    <div class="res-cell gold"><span class="lbl">Vàng</span><span class="val">${state.gold}</span></div>
    <div class="res-cell gem"><span class="lbl">Gem</span><span class="val">${state.gems}</span></div>
  `;
  refreshAccount();
}

function refreshAccount() {
  renderAccountBar({
    accountEl,
    modalEl,
    state,
    toast,
    refreshChrome,
    onSaveLoaded: () => {
      run = null;
      inventory = null;
      refreshChrome();
      if (currentScreen === 'hub') renderScreen('hub');
      else go(currentScreen);
    },
  });
}

function startRun() {
  run = createRunState(state);
  inventory = inventoryCopy(state);
  lastReward = null;
}

/** Áp loadout → inventory session (chỉ quái mang vào xếp trận). */
function applyLoadout(loadout) {
  if (!run) return;
  const clean = { ...loadout };
  const nextKey = loadoutFingerprint(clean);
  const changed = run.appliedLoadoutKey !== nextKey;

  run.loadout = clean;
  run.loadoutReady = true;
  run.appliedLoadoutKey = nextKey;

  if (changed) {
    run.map.placements = [];
    run.selectedMonsterId = null;
    inventory = { ...clean };
    return;
  }

  // Giữ board nếu loadout không đổi — trừ lại số đã xếp
  inventory = { ...clean };
  for (const p of run.map.placements || []) {
    if (inventory[p.monsterId] > 0) {
      inventory[p.monsterId] -= 1;
      if (inventory[p.monsterId] <= 0) delete inventory[p.monsterId];
    }
  }
}

/** Nếu vào setup mà inventory vẫn là cả kho → thu về loadout. */
function ensureLoadoutInventory() {
  if (!run?.loadout || !inventory) return;
  if (run.loadoutReady) return;
  const load = run.loadout;
  const next = { ...load };
  for (const p of run.map.placements || []) {
    if (next[p.monsterId] > 0) {
      next[p.monsterId] -= 1;
      if (next[p.monsterId] <= 0) delete next[p.monsterId];
    }
  }
  inventory = next;
  run.loadoutReady = true;
}

function announceAchievements(unlocks) {
  announceUnlocks(unlocks, { toast, modalEl });
  refreshChrome();
}

function maybeStartTutorial() {
  if (state.tutorialDone) return;
  startGuidedTour(bag, {
    onDone: () => {
      state.tutorialDone = true;
      saveState(state);
      const unlocked = evaluateAchievements(state);
      announceAchievements(unlocked);
      refreshChrome();
      getCombatEngine()?.setPaused?.(false);
      if (currentScreen === 'hub') renderScreen('hub');
    },
  });
}

const bag = {
  get state() {
    return state;
  },
  get run() {
    return run;
  },
  get inventory() {
    return inventory;
  },
  get lastReward() {
    return lastReward;
  },
  set lastReward(v) {
    lastReward = v;
  },
  currentScreen: () => currentScreen,
  go,
  toast,
  refreshChrome,
  startRun,
  applyLoadout,
  ensureLoadoutInventory,
  announceAchievements,
  maybeStartTutorial,
  setCombatPaused: (on) => getCombatEngine()?.setPaused?.(!!on),
  startTutorial: () =>
    startGuidedTour(bag, {
      onDone: () => {
        if (!state.tutorialDone) {
          state.tutorialDone = true;
          saveState(state);
          evaluateAchievements(state);
        }
        getCombatEngine()?.setPaused?.(false);
        toast('Xong hướng dẫn tận tay');
        refreshChrome();
      },
    }),
  reset() {
    const fresh = resetState();
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, fresh);
    run = null;
    inventory = null;
  },
};

window.__RBG_BAG__ = bag;

function cleanupScreen(name) {
  const el = screens[name];
  if (el && typeof el._cleanup === 'function') {
    el._cleanup();
    el._cleanup = null;
  }
}

function go(name) {
  if (currentScreen === 'combat' && name !== 'combat') {
    stopCombatIfAny();
    cleanupScreen('combat');
  }

  currentScreen = name;
  Object.entries(screens).forEach(([key, el]) => {
    if (el) el.classList.toggle('active', key === name);
  });

  navDock.querySelectorAll('button').forEach((btn) => {
    const n = btn.getAttribute('data-nav');
    btn.classList.toggle(
      'active',
      n === name ||
        (name === 'setup' && n === 'scout') ||
        (name === 'reward' && n === 'hub')
    );
  });

  if (topLbBtn) {
    topLbBtn.classList.toggle('active', name === 'leaderboard');
  }

  navDock.style.display =
    name === 'combat' || name === 'reward' || name === 'setup' ? 'none' : '';

  const playFit = name === 'setup' || name === 'combat' || name === 'scout' || name === 'reward';
  document.documentElement.classList.toggle('play-fit', playFit);
  document.body.classList.toggle('play-fit', playFit);

  tipSlot.innerHTML = '';
  if (!playFit) {
    showTipBanner(tipSlot, name, state, {
      onDismiss: () => saveState(state),
    });
  }

  refreshChrome();
  renderScreen(name);

  if (name === 'combat') {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
}

function renderScreen(name) {
  const root = screens[name];
  if (!root) return;
  switch (name) {
    case 'hub':
      renderHub(root, bag);
      break;
    case 'gacha':
      renderGacha(root, bag);
      break;
    case 'collection':
      renderCollection(root, bag);
      break;
    case 'leaderboard':
      renderLeaderboard(root, { ...bag, modalEl });
      break;
    case 'achievements':
      renderAchievements(root, bag);
      break;
    case 'scout':
      if (!run) startRun();
      renderScout(root, bag);
      break;
    case 'setup':
      if (!run) startRun();
      if (!inventory) inventory = inventoryCopy(state);
      ensureLoadoutInventory();
      renderSetup(root, bag);
      break;
    case 'combat':
      renderCombat(root, bag);
      break;
    case 'reward':
      renderReward(root, bag);
      break;
    default:
      break;
  }
}

navDock.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-nav]');
  if (!btn) return;
  const name = btn.getAttribute('data-nav');
  if (name === 'scout') startRun();
  go(name);
});

topLbBtn?.addEventListener('click', () => go('leaderboard'));

if (!state.ownedEver?.length) {
  state.ownedEver = Object.keys(state.inventory || {});
}

saveState(state);
refreshChrome();
go('hub');

(async () => {
  await initAuth();
  refreshAccount();
  onAuthChange(() => refreshAccount());
  maybeStartTutorial();
})();
