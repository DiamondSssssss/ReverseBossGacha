export const MONSTER_SKINS = {
  news_rat: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#8d6e63' },
      },
    },
    {
      id: 'plague',
      name: 'Chuột Dịch Bệnh',
      unlock: { type: 'mastery_wins', value: 8 },
      visual: {
        palette: { primary: '#556b2f', eye: '#c62828' },
        decals: ['scar', 'moss'],
        aura: 'swamp',
      },
    },
  ],
  goblin_bait: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#66bb6a' },
      },
    },
    {
      id: 'banner',
      name: 'Nghi Binh Cờ Hiệu',
      unlock: { type: 'mastery_deployments', value: 18 },
      visual: {
        palette: { primary: '#43a047', accent: '#fdd835' },
        decals: ['warPaint', 'banner'],
      },
    },
  ],
  bone_pile: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#c8b89a' },
      },
    },
    {
      id: 'ossuary',
      name: 'Động Mộ',
      unlock: { type: 'stage_reached', value: 10 },
      visual: {
        palette: { primary: '#d7ccc8', accent: '#8e24aa' },
        decals: ['runes'],
        aura: 'violet',
        vfx: 'violetRunes',
      },
    },
  ],
  candle_bug: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#ffcc80' },
      },
    },
    {
      id: 'festival',
      name: 'Đèn Lễ Hội',
      unlock: { type: 'achievement_total', value: 8 },
      visual: {
        palette: { primary: '#ffb74d', accent: '#ff7043', eye: '#4e342e' },
        decals: ['lantern', 'halo'],
        aura: 'ember',
        vfx: 'emberHalo',
      },
    },
  ],
  moss_slug: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#689f38' },
      },
    },
    {
      id: 'bloom',
      name: 'Sên Nở Hoa',
      unlock: { type: 'mastery_deployments', value: 22 },
      visual: {
        palette: { primary: '#7cb342', accent: '#f48fb1' },
        decals: ['flowers'],
        aura: 'bloom',
      },
    },
  ],
  squeak_bat: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#5d4037' },
      },
    },
    {
      id: 'night',
      name: 'Cánh Đêm',
      unlock: { type: 'hard_stage_reached', value: 5 },
      visual: {
        palette: { primary: '#263238', accent: '#7e57c2', eye: '#ff5252' },
        decals: ['shadowVeil'],
        aura: 'shadow',
        vfx: 'shadowTrail',
      },
    },
  ],
  pebble_imp: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#90a4ae' },
      },
    },
    {
      id: 'gold',
      name: 'Tiểu Quỷ Đất Vàng',
      unlock: { type: 'mastery_wins', value: 12 },
      visual: {
        palette: { primary: '#f9a825', accent: '#6d4c41' },
        decals: ['coins'],
      },
    },
  ],
  rag_doll: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#e57373' },
      },
    },
    {
      id: 'stitches',
      name: 'Vá May Quân Huân',
      unlock: { type: 'mastery_wins', value: 15 },
      visual: {
        palette: { primary: '#8d6e63', accent: '#ef5350' },
        decals: ['scar', 'crown'],
      },
    },
  ],
  coin_scarab: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#ffd54f' },
      },
    },
    {
      id: 'vault',
      name: 'Kẻ Kho Bạc',
      unlock: { type: 'mastery_deployments', value: 25 },
      visual: {
        palette: { primary: '#ffca28', accent: '#6d4c41' },
        decals: ['coins', 'crown'],
        vfx: 'goldSpark',
      },
    },
  ],
  void_sovereign: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#311b92' },
      },
    },
    {
      id: 'astral_throne',
      name: 'Ngai Sao Hư Không',
      unlock: { type: 'hard_win_with_loadout', level: 5 },
      visual: {
        palette: { primary: '#4527a0', accent: '#b388ff', eye: '#f3e5f5' },
        decals: ['voidCrown', 'runes'],
        aura: 'violet',
        vfx: 'voidOrbit',
      },
    },
  ],
  blood_idol: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#b71c1c' },
      },
    },
    {
      id: 'crimson_sanctum',
      name: 'Điện Máu Tế',
      unlock: { type: 'hard_win_with_loadout', level: 10 },
      visual: {
        palette: { primary: '#c62828', accent: '#ff8a80', eye: '#fff5f5' },
        decals: ['bloodSpikes', 'crown'],
        aura: 'ember',
        vfx: 'bloodMoon',
      },
    },
  ],
  doom_bell: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#6a1b9a' },
      },
    },
    {
      id: 'requiem_archon',
      name: 'Đại Chuông Cầu Hồn',
      unlock: { type: 'hard_win_with_loadout', level: 15 },
      visual: {
        palette: { primary: '#8e24aa', accent: '#d1c4e9', eye: '#fff8e1' },
        decals: ['bell', 'runes'],
        aura: 'violet',
        vfx: 'bellStorm',
      },
    },
  ],
  ash_apocalypse: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#bf360c' },
      },
    },
    {
      id: 'world_pyre',
      name: 'Hỏa Tận Thế',
      unlock: { type: 'hard_win_with_loadout', level: 20 },
      visual: {
        palette: { primary: '#d84315', accent: '#ffcc80', eye: '#fff3e0' },
        decals: ['ashCracks', 'crown'],
        aura: 'ember',
        vfx: 'ashPyre',
      },
    },
  ],
  chronos_fang: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#00bcd4' },
      },
    },
    {
      id: 'paradox_hunt',
      name: 'Kẻ Săn Nghịch Thời',
      unlock: { type: 'hard_win_with_loadout', level: 25 },
      visual: {
        palette: { primary: '#26c6da', accent: '#80deea', eye: '#e0f7fa' },
        decals: ['chronoClock', 'scar'],
        aura: 'shadow',
        vfx: 'chronoRing',
      },
    },
  ],
  blood_tithe_wraith: [
    {
      id: 'base',
      name: 'Mặc Định',
      unlockedByDefault: true,
      visual: {
        palette: { primary: '#880e4f' },
      },
    },
    {
      id: 'scarlet_dirge',
      name: 'Ai Ca Huyết Khế',
      unlock: { type: 'hard_win_with_loadout', level: 30 },
      visual: {
        palette: { primary: '#ad1457', accent: '#f48fb1', eye: '#fff1f6' },
        decals: ['soulChains', 'voidCrown'],
        aura: 'violet',
        vfx: 'sacrificeFlame',
      },
    },
  ],
};
