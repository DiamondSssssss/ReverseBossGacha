/** First-time tutorial + contextual coach tips */

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Chào Sếp Tổng!',
    body: 'Bạn không phải Hero — bạn là <strong>chủ hầm ngục</strong>. Hero AI sẽ xông vào cướp kho báu. Nhiệm vụ: xếp quái, bẫy, và phép để chặn chúng.',
  },
  {
    id: 'economy',
    title: 'Tay trắng bắt đầu',
    body: 'Bạn bắt đầu với <strong>0 Linh Hồn · 0 Vàng · 0 Gem</strong> — không ai phát sẵn.<ul class="tut-list"><li><strong>Linh Hồn</strong> — thắng/thua ải (dùng để quay Gacha)</li><li><strong>Vàng</strong> — thắng ải (nâng cấp phòng)</li><li><strong>Gem</strong> — mở Ấn chương / thành tựu</li></ul>Dùng vài quái tạp binh có sẵn để đánh ải đầu, kiếm vốn rồi mới quay.',
  },
  {
    id: 'loop',
    title: 'Vòng chơi 4 bước',
    body: '<ol class="tut-list"><li><strong>Trinh sát</strong> — xem Hero sắp tới & địa hình phòng</li><li><strong>Xếp trận</strong> — thả quái trong giới hạn Cost</li><li><strong>Chiến đấu</strong> — bấm START, dùng phép hỗ trợ</li><li><strong>Thu hoạch</strong> — nhận LH/Vàng → Gacha thêm quái</li></ol>',
  },
  {
    id: 'cost',
    title: 'Cost & quái cùi',
    body: 'Phòng nhỏ <strong>không đủ Cost</strong> để spam quái 5★. Quái 1★–3★ vẫn quan trọng: Silence Pháp sư, phát hiện Đạo tặc, làm chậm, đẩy lùi…',
  },
  {
    id: 'counter',
    title: 'Tam giác khắc chế',
    body: '<ul class="tut-list"><li><strong>Pháp sư (AoE)</strong> → sợ Silence / áp sát</li><li><strong>Chiến sĩ (tank)</strong> → sợ Boss 5★ burst</li><li><strong>Đạo tặc (tàng hình)</strong> → sợ Mắt thần & Bẫy</li></ul>Phá đảo ở <strong>ải 20</strong> — theo dõi ở mục Ấn chương.',
  },
];

export const SCREEN_TIPS = {
  hub: 'Linh Hồn/Vàng = thắng ải. Gem = Ấn chương. Mới vào = 0 tiền — vào ải đầu để kiếm vốn.',
  gacha: 'Cần Linh Hồn để quay (100 LH/lần). Chưa có? Về Sảnh → Vào ải thắng trận.',
  collection: 'Kho: xem chỉ số & passive. Đọc mô tả trước khi xếp trận!',
  scout: 'Trinh sát: nhớ class Hero rồi chọn quái khắc chế. Thắng ải = Linh Hồn + Vàng.',
  setup: 'Chọn quái ở khay dưới → chạm ô trống để thả. Chạm lại để gỡ. Không vượt Cost Cap.',
  combat: 'Giữ kho báu! Thắng cuộc mới nhận Linh Hồn & Vàng.',
  reward: 'Đây là cách kiếm nguyên liệu chính: thắng ải → LH + Vàng.',
  achievements: 'Gem chủ yếu lấy từ Ấn chương. Mở khóa = nhận thưởng.',
};

/**
 * @param {HTMLElement} modalEl - #modal backdrop
 * @param {object} opts
 */
export function showTutorial(modalEl, { onDone, startIndex = 0 } = {}) {
  let i = startIndex;

  function paint() {
    const step = TUTORIAL_STEPS[i];
    const isLast = i >= TUTORIAL_STEPS.length - 1;
    modalEl.classList.add('show');
    modalEl.innerHTML = `
      <div class="modal tutorial-modal" role="dialog" aria-labelledby="tut-title">
        <div class="tut-progress">${i + 1} / ${TUTORIAL_STEPS.length}</div>
        <h2 id="tut-title">${step.title}</h2>
        <div class="tut-body">${step.body}</div>
        <div class="row" style="margin-top:16px;justify-content:space-between">
          <button type="button" class="ghost" id="tut-skip">Bỏ qua</button>
          <div class="row">
            ${i > 0 ? '<button type="button" id="tut-prev">Quay lại</button>' : ''}
            <button type="button" class="primary" id="tut-next">${isLast ? 'Bắt đầu chơi!' : 'Tiếp theo'}</button>
          </div>
        </div>
      </div>`;

    modalEl.querySelector('#tut-skip').onclick = () => finish();
    modalEl.querySelector('#tut-next').onclick = () => {
      if (isLast) finish();
      else {
        i += 1;
        paint();
      }
    };
    const prev = modalEl.querySelector('#tut-prev');
    if (prev) {
      prev.onclick = () => {
        i -= 1;
        paint();
      };
    }
  }

  function finish() {
    modalEl.classList.remove('show');
    modalEl.innerHTML = '';
    onDone?.();
  }

  paint();
}

export function showTipBanner(container, screen, state, { onDismiss } = {}) {
  if (!container) return;
  const tip = SCREEN_TIPS[screen];
  if (!tip) {
    container.innerHTML = '';
    return;
  }
  const dismissed = state.tipsDismissed?.[screen];
  if (dismissed) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="tip-banner" role="note">
      <div class="tip-text">${tip}</div>
      <button type="button" class="tip-close" aria-label="Đóng">✕</button>
    </div>`;
  container.querySelector('.tip-close').onclick = () => {
    if (!state.tipsDismissed) state.tipsDismissed = {};
    state.tipsDismissed[screen] = true;
    onDismiss?.();
    container.innerHTML = '';
  };
}
