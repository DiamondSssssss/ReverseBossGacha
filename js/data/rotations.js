export const ROTATIONS = [
  {
    id: 'week_fireline_2026_07',
    name: 'Luân phiên tuần: Hành lang Lửa',
    blurb: 'Biến thể nhanh của thử thách cũ, ép bạn giữ slot thông minh và không spam chiêu boss.',
    startAt: '2026-07-27T00:00:00+07:00',
    endAt: '2026-08-31T23:59:59+07:00',
    entries: [
      {
        id: 'fireline_ch02',
        challengeId: 2,
        name: 'Lò Dầu: Giữ Tuyến',
        blurb: 'Giảm unit sân, tăng áp lực đầu trận, thưởng event riêng cho lần clear đầu.',
        overrides: {
          constraints: {
            maxUnits: 8,
            noBossSpells: true,
          },
          objectives: [
            { type: 'max_units_placed', max: 8, label: 'Không đặt quá 8 unit' },
            { type: 'treasure_ratio', min: 0.4, label: 'Giữ kho >=40%' },
            { type: 'no_boss_spells', label: 'Không dùng chiêu boss' },
          ],
        },
        reward: {
          eventReward: { souls: 80, gems: 2 },
          badgeLabel: 'Ấn tuần: Giữ Tuyến',
        },
      },
      {
        id: 'fireline_ch04',
        challengeId: 4,
        name: 'Đấu Trường Trống: Không Thở',
        blurb: 'Loadout khóa như cũ nhưng wave đòi phản ứng nhanh hơn.',
        overrides: {
          constraints: {
            noBossSpells: true,
            maxUnits: 9,
          },
          objectives: [
            { type: 'treasure_ratio', min: 0.5, label: 'Giữ kho >=50%' },
            { type: 'no_boss_spells', label: 'Không dùng chiêu boss' },
          ],
        },
        reward: {
          eventReward: { souls: 90, gems: 2 },
          badgeLabel: 'Ấn tuần: Phản Xạ',
        },
      },
    ],
  },
];
