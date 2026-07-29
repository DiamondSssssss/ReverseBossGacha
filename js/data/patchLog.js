export const PATCH_LOGS = [
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
