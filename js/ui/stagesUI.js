import { MAX_STAGE } from '../data/constants.js?v=102';
import { getStageMap } from '../data/maps.js?v=102';
import {
  frontierForMode,
  hardModifiersForLevel,
  personalBestCost,
  stageAccess,
} from '../data/hardMode.js?v=102';
import { fetchStageRecords } from '../core/stageRecords.js?v=102';

let activeMode = 'normal';

function holderLabel(rec) {
  if (!rec) return '';
  const name = rec.displayName || rec.username || '?';
  return `Kỉ lục: ${name} · Pool ${rec.bestCost}`;
}

export function renderStages(root, ctx) {
  const { state, go, toast, startRun } = ctx;
  const mode = activeMode === 'hard' ? 'hard' : 'normal';
  const frontier = frontierForMode(state, mode);
  const clearedAll = frontier > MAX_STAGE;

  root.innerHTML = `
    <div class="stages-page">
      <div class="stages-head">
        <div>
          <p class="section-label">Chọn ải</p>
          <h2 style="margin:0 0 6px;font-family:Fraunces,serif">Cổng hầm</h2>
          <p class="muted" style="margin:0">Thường và Khó tách tiến độ. Replay chỉ ải đã thắng đúng mode.</p>
        </div>
        <button type="button" class="ghost" id="btn-stages-hub">Về sảnh</button>
      </div>
      <div class="stages-tabs" role="tablist">
        <button type="button" class="stages-tab ${mode === 'normal' ? 'active' : ''}" data-mode="normal">Thường · ${Math.min(frontierForMode(state, 'normal'), MAX_STAGE)}/${MAX_STAGE}</button>
        <button type="button" class="stages-tab ${mode === 'hard' ? 'active' : ''}" data-mode="hard">Khó · ${Math.min(frontierForMode(state, 'hard'), MAX_STAGE)}/${MAX_STAGE}</button>
      </div>
      ${
        mode === 'hard'
          ? `<p class="stages-hard-tip muted">Khó: Hero mạnh hơn, Cap/kho thấp hơn, quái yếu hơn một chút. Kỉ lục = pool cost thấp nhất lúc vào trận.</p>`
          : `<p class="stages-hard-tip muted">Kỉ lục trên thẻ = người giữ pool mang theo thấp nhất (đăng nhập mới nộp server).</p>`
      }
      <div class="stages-grid" id="stages-grid">
        ${Array.from({ length: MAX_STAGE }, (_, i) => {
          const stage = i + 1;
          const access = stageAccess(state, mode, stage);
          const mapName = getStageMap(stage)?.name || `Ải ${stage}`;
          const mine = personalBestCost(state, mode, stage);
          const hardHint =
            mode === 'hard' && (access === 'frontier' || access === 'cleared')
              ? hardModifiersForLevel(stage).rules
              : '';
          let badge = 'Khóa';
          if (access === 'frontier') badge = clearedAll ? 'Xong' : 'Đang cày';
          if (access === 'cleared') badge = 'Replay';
          return `
            <button type="button" class="stage-card access-${access}" data-stage="${stage}" ${
              access === 'locked' ? 'disabled' : ''
            }>
              <div class="stage-card-top">
                <strong>Ải ${stage}</strong>
                <span class="stage-badge">${badge}</span>
              </div>
              <div class="meta">${mapName}</div>
              ${hardHint ? `<div class="stage-hard-rules">${hardHint}</div>` : ''}
              <div class="stage-record" data-record-for="${stage}">${
                mine != null ? `Bạn: Pool ${mine}` : access === 'locked' ? '' : 'Chưa có kỉ lục'
              }</div>
            </button>`;
        }).join('')}
      </div>
    </div>
  `;

  root.querySelector('#btn-stages-hub').onclick = () => go('hub');
  root.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.onclick = () => {
      activeMode = btn.getAttribute('data-mode') === 'hard' ? 'hard' : 'normal';
      renderStages(root, ctx);
    };
  });
  root.querySelectorAll('.stage-card[data-stage]').forEach((btn) => {
    btn.onclick = () => {
      const stage = Number(btn.getAttribute('data-stage'));
      const access = stageAccess(state, mode, stage);
      if (access === 'locked') {
        toast?.('Chưa mở ải này');
        return;
      }
      startRun?.({ mode, level: stage });
      go('scout');
    };
  });

  fetchStageRecords(mode)
    .then((records) => {
      if (!root.isConnected) return;
      // Tránh race khi đổi tab Thường/Khó trước khi fetch xong
      if (activeMode !== mode) return;
      root.querySelectorAll('[data-record-for]').forEach((el) => {
        const stage = el.getAttribute('data-record-for');
        const rec = records[stage] || records[Number(stage)];
        const mine = personalBestCost(state, mode, Number(stage));
        const parts = [];
        if (rec) parts.push(holderLabel(rec));
        if (mine != null) parts.push(`Bạn: ${mine}`);
        if (!parts.length) {
          const access = stageAccess(state, mode, Number(stage));
          el.textContent = access === 'locked' ? '' : 'Chưa có kỉ lục';
          return;
        }
        el.textContent = parts.join(' · ');
      });
    })
    .catch(() => {
      /* offline / guest — giữ personal best local */
    });
}

