import {
  CHALLENGES,
  ensureChallengeProgress,
  isChallengeUnlocked,
  unlockHintChallenge,
  titleName,
  syncChallengeUnlocks,
} from '../core/challenge.js?v=121';
import { saveState } from '../core/storage.js?v=121';
import { CHALLENGE_TITLES } from '../data/challenges.js?v=121';

export function renderChallenges(root, ctx) {
  const { state, go, toast, startChallenge } = ctx;
  ensureChallengeProgress(state);
  syncChallengeUnlocks(state);

  const titlesHtml = (state.titles || [])
    .map((id) => {
      const active = state.equippedTitle === id;
      return `<button type="button" class="boss-spell ${active ? 'selected' : ''}" data-title="${id}">${titleName(id)}</button>`;
    })
    .join('');

  root.innerHTML = `
    <div class="hub-layout" style="padding:12px">
      <div>
        <p class="section-label">Chế độ Thử Thách</p>
        <h2 style="margin:0 0 8px;font-family:Fraunces,serif">10 ải puzzle</h2>
        <p class="muted" style="margin:0 0 16px">Mở từ ải thường ≥30. Mỗi màn chủ đề riêng, wave dài, thưởng Title độc bản.</p>
        <div class="boss-picker" id="ch-list">
          ${CHALLENGES.map((c) => {
            const unlocked = isChallengeUnlocked(state, c.id);
            const cleared = !!state.challengeProgress.cleared?.[c.id];
            return `
              <button type="button" class="boss-card ${unlocked ? '' : 'locked'}" data-ch="${c.id}" ${unlocked ? '' : 'disabled'}>
                <div class="boss-card-top">
                  <strong>CH${c.id}. ${c.name}</strong>
                  ${cleared ? '<span class="boss-badge">Xong</span>' : ''}
                  ${!unlocked ? '<span class="boss-badge lock">Khóa</span>' : ''}
                </div>
                <div class="meta">${c.blurb}</div>
                ${!unlocked ? `<div class="boss-lock-hint">${unlockHintChallenge(c, state)}</div>` : ''}
                <div class="boss-spells">
                  <span class="boss-spell">${(c.wave?.squads || []).reduce((n, s) => n + (s.ids?.length || 0), 0) || c.wave?.ids?.length || 0} hero · Cap ${c.costCap || '—'}</span>
                  <span class="boss-spell">${CHALLENGE_TITLES[c.reward?.titleId]?.name || ''}</span>
                </div>
              </button>`;
          }).join('')}
        </div>
      </div>
      <div class="hub-side">
        <p class="section-label">Title đã có</p>
        <div class="boss-spells" id="title-picker">${titlesHtml || '<span class="muted">Chưa có Title</span>'}</div>
        <p class="muted" style="margin-top:12px;font-size:0.8rem">Title đang đeo: <strong>${titleName(state.equippedTitle) || '—'}</strong></p>
        <button type="button" class="ghost" id="btn-ch-hub" style="margin-top:16px">Về sảnh</button>
      </div>
    </div>
  `;

  root.querySelector('#btn-ch-hub').onclick = () => go('hub');
  root.querySelectorAll('[data-ch]').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.getAttribute('data-ch'));
      if (!isChallengeUnlocked(state, id)) {
        toast?.('Chưa mở thử thách này');
        return;
      }
      startChallenge?.(id);
      go('scout');
    };
  });
  root.querySelectorAll('[data-title]').forEach((btn) => {
    btn.onclick = () => {
      state.equippedTitle = btn.getAttribute('data-title');
      saveState(state);
      renderChallenges(root, ctx);
    };
  });
}

