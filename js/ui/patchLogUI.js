import { PATCH_LOGS, latestPatchLog } from '../data/patchLog.js?v=117';

function patchCardHtml(entry, featured = false) {
  return `
    <article class="patch-card ${featured ? 'featured' : ''}">
      <div class="patch-card-top">
        <div>
          <p class="section-label" style="margin:0">${entry.version} · ${entry.date}</p>
          <h3>${entry.title}</h3>
        </div>
        ${featured ? '<span class="patch-badge">Mới</span>' : ''}
      </div>
      <p class="patch-summary">${entry.summary}</p>
      <div class="patch-block">
        <strong>Điểm chính</strong>
        <ul>
          ${(entry.highlights || []).map((x) => `<li>${x}</li>`).join('')}
        </ul>
      </div>
      <div class="patch-block">
        <strong>Người chơi sẽ thấy gì</strong>
        <ul>
          ${(entry.playerImpact || []).map((x) => `<li>${x}</li>`).join('')}
        </ul>
      </div>
    </article>
  `;
}

export function renderPatchLog(root, ctx) {
  const { go } = ctx;
  const latest = latestPatchLog();

  root.innerHTML = `
    <div class="patchlog-page">
      <div class="patchlog-head">
        <div>
          <p class="section-label" style="margin:0">Patch Log / Update</p>
          <h2>Lịch sử cập nhật</h2>
          <p class="muted">Tổng hợp ngắn gọn những gì đã đổi để người chơi biết nên đọc, thử và chú ý điều gì.</p>
        </div>
        <button type="button" class="ghost" id="btn-patchlog-hub">Về sảnh</button>
      </div>
      ${latest ? `<section class="patchlog-feature">${patchCardHtml(latest, true)}</section>` : ''}
      <section class="patchlog-list">
        ${(PATCH_LOGS || [])
          .slice(latest ? 1 : 0)
          .map((entry) => patchCardHtml(entry, false))
          .join('')}
      </section>
    </div>
  `;

  root.querySelector('#btn-patchlog-hub')?.addEventListener('click', () => go('hub'));
}
