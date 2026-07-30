function factorHtml(item) {
  if (!item) return '';
  return `
    <article class="report-factor">
      <strong>${item.title}</strong>
      <p>${item.detail}</p>
    </article>
  `;
}

function tipsHtml(tips) {
  return (tips || [])
    .map((tip) => `<li>${tip}</li>`)
    .join('');
}

function cardHtml(title, unit, mode = 'hero') {
  if (!unit) {
    return `
      <article class="report-card">
        <p class="section-label">${title}</p>
        <strong>Chưa đủ dữ liệu</strong>
      </article>
    `;
  }
  const line2 =
    mode === 'hero'
      ? `${unit.className || 'Hero'} · DMG ${unit.damageDone} · Drain ${Math.round(unit.drains || 0)}`
      : `DMG ${unit.damageDone} · Hồi ${unit.healingDone || 0} · Hạ ${unit.kills || 0}`;
  return `
    <article class="report-card">
      <p class="section-label">${title}</p>
      <strong>${unit.name}</strong>
      <p class="muted">${line2}</p>
      ${unit.terrain ? `<p class="muted">Ô nổi bật: ${unit.terrain}</p>` : ''}
    </article>
  `;
}

export function renderBattleReport(root, ctx) {
  const { lastBattleReport, lastReward, go } = ctx;
  const report = lastBattleReport;
  if (!report) {
    root.innerHTML = `
      <div class="reward-stage">
        <h2>Không có battle report</h2>
        <p class="muted">Trận này chưa thu đủ dữ liệu phân tích.</p>
        <div class="reward-actions">
          <button type="button" class="primary big" id="btn-report-continue">Xem thưởng</button>
        </div>
      </div>
    `;
    root.querySelector('#btn-report-continue').onclick = () => go('reward');
    return;
  }
  const win = (lastReward?.result || report.result) === 'win';
  root.innerHTML = `
    <div class="battle-report-wrap">
      <div class="battle-report-head">
        <div class="seal-mark">${win ? 'BR' : 'WHY'}</div>
        <div>
          <h2>${win ? 'Battle Report' : 'Vì Sao Thua?'}</h2>
          <p class="muted">Kết thúc sau ${report.elapsed}s · Kho còn ${Math.round((report.treasureRatio || 0) * 100)}%</p>
        </div>
      </div>
      <div class="battle-report-grid">
        ${cardHtml('Hero nguy hiểm nhất', report.topThreatHero, 'hero')}
        ${cardHtml('Quái hiệu quả nhất', report.topMonster, 'monster')}
      </div>
      <section class="battle-report-section">
        <p class="section-label">Yếu tố quyết định</p>
        <div class="battle-report-factors">
          ${(report.decisiveFactors || []).map(factorHtml).join('') || '<p class="muted">Không có yếu tố nổi bật.</p>'}
        </div>
      </section>
      <section class="battle-report-section">
        <p class="section-label">Gợi ý ngắn</p>
        <ul class="battle-report-tips">
          ${tipsHtml(report.coachTips)}
        </ul>
      </section>
      <div class="reward-actions">
        <button type="button" class="primary big" id="btn-report-continue">Xem thưởng</button>
        <button type="button" class="ghost" id="btn-report-skip-hub">Về sảnh</button>
      </div>
    </div>
  `;
  root.querySelector('#btn-report-continue').onclick = () => go('reward');
  root.querySelector('#btn-report-skip-hub').onclick = () => go('hub');
}
