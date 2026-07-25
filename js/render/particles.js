/**
 * Particle system — combat VFX (hit, death, spells, drain, aura).
 */

export class ParticleSystem {
  constructor() {
    /** @type {Array<object>} */
    this.list = [];
  }

  clear() {
    this.list.length = 0;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {object} opts
   */
  emit(x, y, opts = {}) {
    const {
      count = 8,
      color = '#fff',
      colors = null,
      speed = 60,
      life = 0.55,
      size = 3,
      gravity = 40,
      spread = Math.PI * 2,
      angle = -Math.PI / 2,
      shape = 'circle', // circle | square | star | spark
      fade = true,
    } = opts;

    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const spd = speed * (0.4 + Math.random() * 0.9);
      const c = colors ? colors[(Math.random() * colors.length) | 0] : color;
      this.list.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life,
        ttl: life * (0.7 + Math.random() * 0.5),
        size: size * (0.6 + Math.random() * 0.8),
        color: c,
        gravity,
        shape,
        fade,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 8,
      });
    }
  }

  burst(x, y, color) {
    this.emit(x, y, { count: 14, color, speed: 90, life: 0.5, size: 3.5, gravity: 50 });
  }

  hit(x, y, color) {
    this.emit(x, y, {
      count: 7,
      color,
      speed: 70,
      life: 0.28,
      size: 2.5,
      gravity: 20,
      spread: Math.PI * 0.9,
      angle: -Math.PI / 2,
      shape: 'spark',
    });
  }

  death(x, y, color) {
    this.emit(x, y, {
      count: 18,
      color,
      colors: [color, '#fff', '#ffe082'],
      speed: 110,
      life: 0.7,
      size: 4,
      gravity: 60,
    });
  }

  magic(x, y, color = '#ce93d8') {
    this.emit(x, y, {
      count: 10,
      color,
      speed: 40,
      life: 0.8,
      size: 2.8,
      gravity: -25,
      shape: 'star',
    });
  }

  frost(x, y) {
    this.emit(x, y, {
      count: 6,
      colors: ['#e1f5fe', '#81d4fa', '#fff'],
      speed: 35,
      life: 0.9,
      size: 2.5,
      gravity: 15,
      shape: 'square',
    });
  }

  heal(x, y) {
    this.emit(x, y, {
      count: 8,
      colors: ['#69f0ae', '#b9f6ca', '#fff'],
      speed: 45,
      life: 0.75,
      size: 3,
      gravity: -50,
      shape: 'star',
    });
  }

  gold(x, y) {
    this.emit(x, y, {
      count: 5,
      colors: ['#ffd54f', '#ffb300', '#fff8e1'],
      speed: 50,
      life: 0.6,
      size: 2.5,
      gravity: -30,
      shape: 'square',
    });
  }

  bone(x, y) {
    this.emit(x, y, {
      count: 10,
      colors: ['#c8b89a', '#efebe9', '#a1887f'],
      speed: 55,
      life: 1.0,
      size: 3,
      gravity: 70,
      shape: 'square',
    });
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.ttl -= dt;
      if (p.ttl <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      p.vx *= 0.98;
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    for (const p of this.list) {
      const a = p.fade ? Math.max(0, p.ttl / p.life) : 1;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const s = p.size;
      if (p.shape === 'square') {
        ctx.fillRect(-s, -s, s * 2, s * 2);
      } else if (p.shape === 'star') {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(ang) * s, Math.sin(ang) * s);
          ctx.lineTo(Math.cos(ang + Math.PI / 4) * s * 0.35, Math.sin(ang + Math.PI / 4) * s * 0.35);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.fillRect(-s * 0.3, -s * 1.4, s * 0.6, s * 2.8);
        ctx.fillRect(-s * 1.4, -s * 0.3, s * 2.8, s * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
