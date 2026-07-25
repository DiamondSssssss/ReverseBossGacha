import { GACHA, RARITY_COLORS, RARITY_LABELS } from '../data/constants.js';
import { tryPull } from '../core/gacha.js';
import { evaluateAchievements } from '../core/achievements.js';

export function renderGacha(root, ctx) {
  const { state, toast, refreshChrome, announceAchievements } = ctx;
  const pityPct = Math.min(100, (state.pityCounter / GACHA.PITY_THRESHOLD) * 100);

  root.innerHTML = `
    <div class="gacha-hero">
      <p class="section-label" style="margin-top:0">Gacha</p>
      <h2>Quay ấn quái</h2>
      <p class="muted">Dùng <strong>Linh Hồn</strong> (thắng ải mới có). Pity ${GACHA.PITY_THRESHOLD} → chắc Boss 5★.</p>
      ${
        state.souls < GACHA.PULL_COST_SOULS
          ? `<p class="economy-zero" style="margin-top:10px">Chưa đủ Linh Hồn (${state.souls}/${GACHA.PULL_COST_SOULS}). Về Sảnh → Mở cổng ải để kiếm.</p>`
          : ''
      }
    </div>
    <div class="gacha-stage"><div class="gacha-orb" id="gacha-orb"></div></div>
    <div class="pity-wrap">
      <div class="row spread">
        <span><strong>Pity</strong> ${state.pityCounter}/${GACHA.PITY_THRESHOLD}</span>
        <span class="muted">${GACHA.PULL_COST_SOULS} / lần</span>
      </div>
      <div class="pity-bar"><span style="width:${pityPct}%"></span></div>
    </div>
    <div class="pull-actions">
      <button type="button" class="primary" id="btn-pull1">Quay ×1</button>
      <button type="button" id="btn-pull10">Quay ×10</button>
    </div>
    <div class="pull-results" id="pull-results"></div>
  `;

  const orb = root.querySelector('#gacha-orb');
  const resultsEl = root.querySelector('#pull-results');

  function showResults(results) {
    resultsEl.innerHTML = results
      .map((r, i) => {
        const m = r.monster;
        const stars = '★'.repeat(m.rarity);
        return `
          <div class="pull-card r${m.rarity}" style="animation-delay:${i * 0.05}s;border-color:${RARITY_COLORS[m.rarity]}">
            <div class="stars" style="color:${m.rarity === 5 ? '#e6b84a' : RARITY_COLORS[m.rarity]}">${stars}</div>
            <div style="font-weight:700;font-family:var(--font-display)">${m.name}</div>
            <div class="muted" style="font-size:0.75rem">${RARITY_LABELS[m.rarity]}${r.pityHit ? ' · Pity' : ''}</div>
          </div>`;
      })
      .join('');
  }

  function doPull(count) {
    const res = tryPull(state, count);
    if (res.error) {
      toast(res.error);
      return;
    }
    orb.classList.remove('spin');
    void orb.offsetWidth;
    orb.classList.add('spin');
    showResults(res.results);
    const unlocked = evaluateAchievements(state);
    announceAchievements?.(unlocked);
    refreshChrome();
    if (res.results.some((r) => r.monster.rarity === 5)) toast('Boss xuất hiện!');
  }

  root.querySelector('#btn-pull1').onclick = () => doPull(1);
  root.querySelector('#btn-pull10').onclick = () => doPull(10);
}
