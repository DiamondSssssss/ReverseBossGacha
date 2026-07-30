function pct(n) {
  return `${Math.round((n || 0) * 100)}%`;
}

function round1(n) {
  return Math.round((n || 0) * 10) / 10;
}

function shortTerrain(terrain) {
  if (!terrain) return null;
  return {
    NORMAL: 'đất thường',
    WATER: 'nước',
    LOW_CEILING: 'trần thấp',
    DARK: 'bóng tối',
    HIGH: 'gò cao',
    FIRE: 'nền lửa',
    ICE: 'nền băng',
    POISON: 'nền độc',
    OIL: 'vệt dầu',
  }[terrain] || terrain.toLowerCase();
}

function buildTips(summary) {
  const tips = [];
  const signals = summary.signals || {};
  if (signals.rangedShare >= 0.48) {
    tips.push('Thiếu anti-ranged: áp lực chính đến từ hero đánh xa.');
  }
  if ((summary.biggestDrain?.amount || 0) >= 14 || signals.peakDrainPerSec >= 16) {
    tips.push('Thiếu tanker frontline hoặc chặn cửa kho: hero đã chạm kho quá lâu.');
  }
  if (
    signals.earlyFullCostAt != null &&
    signals.earlyFullCostAt <= 8 &&
    signals.monsterDeathsEarly >= 3
  ) {
    tips.push('Cost bị dồn quá sớm: tuyến đầu gãy trước khi wave ổn định.');
  }
  if ((summary.topMonster?.damageDone || 0) < 25 && summary.result === 'lose') {
    tips.push('Đội hình thiếu mũi sát thương rõ ràng, nên giữ ít slot cho unit chủ lực.');
  }
  if (summary.topHeroTerrain?.id && summary.topHeroTerrain.seconds >= 8) {
    tips.push(`Hero hưởng lợi nhiều từ ô ${summary.topHeroTerrain.name.toLowerCase()}; cân nhắc đổi điểm chặn hoặc tận dụng địa hình phản khắc.`);
  }
  if (!tips.length) {
    tips.push('Đội hình đang khá cân bằng; nên tối ưu vị trí đặt quái và thời điểm dùng chiêu boss.');
  }
  return tips.slice(0, 4);
}

function buildFactors(summary) {
  const out = [];
  if (summary.biggestDrain) {
    out.push({
      kind: 'drain',
      title: 'Điểm vỡ ở kho báu',
      detail: `${summary.biggestDrain.heroName} gây đợt rút kho lớn nhất (${round1(summary.biggestDrain.amount)} HP).`,
    });
  }
  if (summary.topHeroTerrain?.id && summary.topHeroTerrain.id !== 'NORMAL') {
    out.push({
      kind: 'terrain',
      title: 'Địa hình phía Hero',
      detail: `Hero đứng nhiều nhất trên ${summary.topHeroTerrain.name.toLowerCase()} (${round1(summary.topHeroTerrain.seconds)}s).`,
    });
  }
  if (summary.topMonsterTerrain?.id && summary.topMonsterTerrain.id !== 'NORMAL') {
    out.push({
      kind: 'terrain',
      title: 'Địa hình phía Quái',
      detail: `Quái của bạn hoạt động nhiều nhất trên ${summary.topMonsterTerrain.name.toLowerCase()} (${round1(summary.topMonsterTerrain.seconds)}s).`,
    });
  }
  if (summary.topSpell) {
    out.push({
      kind: 'spell',
      title: 'Chiêu boss nổi bật',
      detail: `${summary.topSpell.name} được dùng để xoay nhịp giao tranh.`,
    });
  }
  if (summary.lowestTreasure) {
    out.push({
      kind: 'treasure',
      title: 'Lúc kho nguy cấp nhất',
      detail: `Kho còn thấp nhất ${pct(summary.lowestTreasure.ratio)} ở mốc ${round1(summary.lowestTreasure.time)}s.`,
    });
  }
  return out.slice(0, 4);
}

export function buildBattleReport(run, engine) {
  const summary = engine?.getBattleSummary?.() || null;
  if (!summary) return null;
  const hero = summary.topThreatHero;
  const monster = summary.topMonster;
  const report = {
    result: summary.result,
    mode: run?.mode || 'normal',
    level: run?.level || 1,
    challengeId: run?.challengeId || null,
    elapsed: round1(summary.elapsed),
    treasureRatio:
      summary.treasureMax > 0 ? summary.treasureHp / Math.max(1, summary.treasureMax) : 0,
    topThreatHero: hero
      ? {
          id: hero.id,
          name: hero.name,
          className: hero.className || 'Hero',
          damageDone: Math.round(hero.damageDone || 0),
          drains: round1(hero.drains || 0),
          kills: hero.kills || 0,
          terrain: shortTerrain(hero.terrain),
        }
      : null,
    topMonster: monster
      ? {
          id: monster.id,
          name: monster.name,
          damageDone: Math.round(monster.damageDone || 0),
          healingDone: Math.round(monster.healingDone || 0),
          kills: monster.kills || 0,
          deployed: monster.deployed || 0,
          terrain: shortTerrain(monster.terrain),
        }
      : null,
    decisiveFactors: buildFactors(summary),
    coachTips: buildTips(summary),
    raw: summary,
  };
  return report;
}
