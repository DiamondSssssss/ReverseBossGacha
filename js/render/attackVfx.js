function alphaFrom(v) {
  return Math.max(0, Math.min(1, v.ttl / Math.max(0.001, v.life || v.ttl || 1)));
}

export function createAttackVfx(from, to, pattern, opts = {}) {
  if (!from || !to || !pattern) return [];
  const color = opts.color || from.color || '#fff';
  const side = opts.side || 'monster';
  const kind = pattern.kind || 'attack';
  const list = [];

  if (
    kind === 'ranged_shot' ||
    kind === 'ranged_poke' ||
    kind === 'aoe_cast' ||
    kind === 'silence_cast' ||
    kind === 'boss_ranged'
  ) {
    list.push({
      type: 'projectile',
      x1: from.x,
      y1: from.y - 10,
      x2: to.x,
      y2: to.y - 8,
      color,
      life: kind === 'aoe_cast' ? 0.2 : 0.14,
      ttl: kind === 'aoe_cast' ? 0.2 : 0.14,
      radius: kind === 'aoe_cast' ? 6 : 4,
      trail: side === 'hero' ? '#f6e27a' : '#d9d0ff',
    });
    list.push({
      type: 'impact',
      x: to.x,
      y: to.y - 4,
      color,
      life: kind === 'aoe_cast' ? 0.22 : 0.15,
      ttl: kind === 'aoe_cast' ? 0.22 : 0.15,
      radius: kind === 'aoe_cast' ? 22 : 14,
      ring: true,
    });
    return list;
  }

  if (
    kind === 'melee_slash' ||
    kind === 'slow_swing' ||
    kind === 'quick_jab' ||
    kind === 'knock_hit' ||
    kind === 'backstab' ||
    kind === 'boss_cleave'
  ) {
    list.push({
      type: 'slash',
      x: to.x,
      y: to.y - 2,
      color,
      life: kind === 'boss_cleave' ? 0.22 : 0.14,
      ttl: kind === 'boss_cleave' ? 0.22 : 0.14,
      radius: kind === 'boss_cleave' ? 26 : 18,
      facing: from.facing || 1,
      heavy: kind === 'slow_swing' || kind === 'boss_cleave',
    });
    if (kind === 'boss_cleave') {
      list.push({
        type: 'impact',
        x: to.x,
        y: to.y,
        color,
        life: 0.18,
        ttl: 0.18,
        radius: 18,
        ring: true,
      });
    }
    return list;
  }

  if (kind === 'boss_slam' || kind === 'trap_burst') {
    list.push({
      type: 'impact',
      x: to.x,
      y: to.y,
      color,
      life: 0.22,
      ttl: 0.22,
      radius: kind === 'boss_slam' ? 24 : 16,
      ring: true,
    });
    return list;
  }

  list.push({
    type: 'beam',
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    color,
    life: 0.12,
    ttl: 0.12,
  });
  return list;
}

export function drawAttackVfx(ctx, v) {
  const a = alphaFrom(v);
  if (a <= 0) return;

  if (v.type === 'beam') {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = v.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(v.x1, v.y1);
    ctx.lineTo(v.x2, v.y2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (v.type === 'projectile') {
    const t = 1 - a;
    const x = v.x1 + (v.x2 - v.x1) * t;
    const y = v.y1 + (v.y2 - v.y1) * t - Math.sin(t * Math.PI) * 8;
    ctx.save();
    ctx.globalAlpha = Math.max(0.18, a);
    ctx.strokeStyle = v.trail || v.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(v.x1, v.y1);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.arc(x, y, v.radius || 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (v.type === 'slash') {
    const swing = 1 - a;
    const dir = v.facing >= 0 ? 1 : -1;
    const start = dir > 0 ? -0.95 + swing * 0.35 : Math.PI + 0.15 - swing * 0.35;
    const end = dir > 0 ? 0.25 + swing * 0.45 : Math.PI + 1.2 - swing * 0.45;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = v.color;
    ctx.lineWidth = v.heavy ? 5 : 3;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.radius || 16, start, end);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (v.type === 'impact') {
    const radius = (v.radius || 14) * (0.55 + (1 - a) * 0.7);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = v.color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(v.x, v.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    if (v.ring) {
      ctx.globalAlpha = a * 0.18;
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(v.x, v.y, radius * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
