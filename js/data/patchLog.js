export const PATCH_LOGS = [
  {
    id: 'v118-mythic-skins-hard-bosses',
    version: 'v118',
    date: '29/07/2026',
    title: 'Skin Mythic & Boss mới cho Ải Khó',
    summary:
      '6 skin Mythic mở khóa bằng chiến thắng ải khó, 7 boss hero mới cho các ải 5–35 mode Khó cùng đội hình được thiết kế lại.',
    highlights: [
      '6 skin Mythic cao cấp với VFX riêng (voidOrbit, bloodMoon, bellStorm, ashPyre, chronoRing, sacrificeFlame) — mở bằng cách mang con đó trong loadout và thắng ải Khó tương ứng.',
      'Thêm 7 boss hero mới cho ải Khó 5, 10, 15, 20, 25, 30, 35 — mỗi boss có kỹ năng và AI riêng thay vì dùng hero thường.',
      'Đội hình ải boss được thiết kế lại theo kiểu boss-fight: ít quân nhưng boss trụ cột hơn, sát thương và kỹ năng đặc biệt hơn.',
      'Hard mode giờ có mốc thưởng rõ ràng: thắng ải càng cao, skin Mythic càng độc.',
    ],
    playerImpact: [
      'Người chơi có lý do cụ thể để leo từng ải Khó thay vì chỉ chơi cho xong.',
      'Skin Mythic là phần thưởng mỹ thuật duy nhất chỉ lấy được từ Hard Mode.',
    ],
  },
  {
    id: 'v117-monster-skins-vfx',
    version: 'v117',
    date: '29/07/2026',
    title: 'Ra mắt skin quái, tiến độ mastery và VFX skin hiếm',
    summary:
      'Kho quái giờ có hệ skin thật sự: mở khóa bằng chơi game, trang bị trong collection, hiển thị xuyên suốt setup/combat và một số skin hiếm có VFX riêng trong trận.',
    highlights: [
      'Thêm catalog skin riêng cho quái và save state lưu skin đã mở, skin đang mặc cùng tiến độ mastery cơ bản.',
      'Collection có nút Skin, modal preview, badge đếm skin và bộ lọc để soi quái còn skin khóa.',
      'Thêm nguồn mở skin V1 từ mastery, mốc ải Thường, mốc ải Khó và số ấn chương đã mở.',
      'Skin hiếm giờ có VFX combat-time nhẹ như vòng rune tím, quầng lửa, bóng đuôi và tia vàng xoay quanh quái.',
      'Hub có thêm panel theo dõi tiến độ skin và Patch Log được cập nhật để người chơi biết đợt skin này gồm những gì.',
    ],
    playerImpact: [
      'Người chơi có thêm một vòng lặp sưu tầm dài hơi mà không làm thay đổi cân bằng chỉ số.',
      'Dùng một con quái đủ lâu sẽ thấy rõ phần thưởng mỹ thuật thay vì chỉ tăng level hoặc số lượng sở hữu.',
      'Một số skin hiếm nhìn nổi bật hơn trong combat nhưng vẫn giữ readability của bàn đấu.',
    ],
  },
  {
    id: 'v114-hard-ai-ui',
    version: 'v114',
    date: '29/07/2026',
    title: 'Đại tu Hard Mode, AI và giao diện đọc trận',
    summary:
      'Hard Mode giờ là một chế độ giải đố riêng với map, wave, AI và tín hiệu UI rõ ràng hơn thay vì chỉ là bản kéo dài của mode Thường.',
    highlights: [
      'Thêm 60 map Hard riêng 42×8 với choke, đường vòng, buff tranh chấp, nguyên tố và penalty zone.',
      'Wave Hard tách riêng khỏi mode Thường; mỗi ải có nhịp spawn độc lập và đội hình trộn chiến thuật hơn.',
      'Hero AI được nâng cấp sâu: target priority, movement style, trigger, phản ứng môi trường và hành vi bảo kê / flank / rush rõ hơn.',
      'Monster AI được nâng cấp tương xứng: quái biết giữ ô mạnh, canh lớp support, bắt carry, trừng phạt hero đang hút Kho.',
      'Tooltip / panel mô tả được viết lại theo kiểu Vai trò - Mối nguy - Khắc chế để người chơi đỡ bị overwhelm.',
      'Panel mô tả quái ở màn xếp trận đã chuyển sang cột phải trên desktop/laptop để không che danh sách quái.',
    ],
    playerImpact: [
      'Hard Mode khó hơn do buộc đọc map, đọc wave và đổi đội hình thật sự.',
      'Người chơi sẽ đọc ý đồ AI nhanh hơn thay vì phải đoán từ chỉ số hoặc thua rồi mới hiểu.',
      'Màn chuẩn bị rõ ràng hơn: ít chữ thừa, tập trung vào thứ nguy hiểm nhất và cách khắc chế.',
    ],
  },
];

export function latestPatchLog() {
  return PATCH_LOGS[0] || null;
}
