import { ACHIEVEMENTS, CATEGORY_LABELS } from '../data/achievements.js?v=56';
import { achievementProgress, isGameCleared } from '../core/achievements.js?v=56';
import { showTutorial } from './tutorial.js?v=56';

function rewardText(r = {}) {
  const parts = [];
  if (r.souls) parts.push(`+${r.souls} LH`);
  if (r.gold) parts.push(`+${r.gold} vàng`);
  if (r.gems) parts.push(`+${r.gems} gem`);
  return parts.join(' · ') || '—';
}

function mark(title) {
  const letters = title.replace(/[^A-Za-zÀ-ỹ0-9]/g, '');
  return (letters.slice(0, 2) || '??').toUpperCase();
}

export function renderAchievements(root, ctx) {
  const { state, toast } = ctx;
  const prog = achievementProgress(state);
  const cleared = isGameCleared(state);

  const byCat = {};
  for (const a of ACHIEVEMENTS) {
    if (!byCat[a.category]) byCat[a.category] = [];
    byCat[a.category].push(a);
  }

  const sections = Object.entries(byCat)
    .map(([cat, list]) => {
      const cards = list
        .map((a) => {
          const done = !!state.achievements?.[a.id]?.unlocked;
          return `
            <article class="ach-card ${done ? 'done' : ''}">
              <div class="ach-icon">${mark(a.title)}</div>
              <div class="ach-body">
                <div class="ach-title">${a.title}${done ? ' · Đạt' : ''}</div>
                <div class="ach-desc">${a.desc}</div>
                <div class="ach-reward">${rewardText(a.reward)}</div>
              </div>
            </article>`;
        })
        .join('');
      return `
        <p class="ach-cat">${CATEGORY_LABELS[cat] || cat}</p>
        <div class="ach-list">${cards}</div>`;
    })
    .join('');

  root.innerHTML = `
    <div class="ach-hero">
      <div class="row spread">
        <div>
          <p class="section-label" style="margin:0">Sưu tầm</p>
          <h2>Ấn chương</h2>
        </div>
        <button type="button" class="ghost" id="btn-replay-tut">Hướng dẫn</button>
      </div>
      <p class="muted">Phá đảo khi thắng ải 40. Thưởng cộng ngay khi mở khóa.</p>
    </div>
    <div class="ach-summary">
      <div class="row spread">
        <div>
          <strong style="font-family:var(--font-display);font-size:1.3rem">${prog.done}/${prog.total}</strong>
          <span class="muted"> ấn</span>
        </div>
        <div class="${cleared ? 'cleared-badge' : 'muted'}">${cleared ? 'Phá đảo' : 'Mốc: ải 40'}</div>
      </div>
      <div class="pity-bar" style="margin-top:10px"><span style="width:${prog.pct}%"></span></div>
    </div>
    ${sections}
  `;

  root.querySelector('#btn-replay-tut').onclick = () => {
    if (ctx.startTutorial) ctx.startTutorial();
    else {
      showTutorial(document.getElementById('modal'), {
        onDone: () => toast('Xong hướng dẫn'),
      });
    }
  };
}

export function announceUnlocks(unlocks, { toast, modalEl } = {}) {
  if (!unlocks?.length) return;
  if (unlocks.length === 1) {
    const a = unlocks[0];
    toast?.(`Ấn mới: ${a.title} — ${rewardText(a.reward)}`);
    return;
  }
  toast?.(`Mở ${unlocks.length} ấn chương mới!`);
  if (!modalEl) return;
  modalEl.classList.add('show');
  modalEl.innerHTML = `
    <div class="modal">
      <h2>Ấn chương mới</h2>
      <div class="ach-list" style="margin-top:12px">
        ${unlocks
          .map(
            (a) => `
          <article class="ach-card done">
            <div class="ach-icon">${mark(a.title)}</div>
            <div class="ach-body">
              <div class="ach-title">${a.title}</div>
              <div class="ach-reward">${rewardText(a.reward)}</div>
            </div>
          </article>`
          )
          .join('')}
      </div>
      <button type="button" class="primary" id="ach-ok" style="width:100%;margin-top:14px">Tuyệt</button>
    </div>`;
  modalEl.querySelector('#ach-ok').onclick = () => {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
  };
}
