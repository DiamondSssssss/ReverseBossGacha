/**
 * Procedural character sprites — mỗi quái / hero / bẫy có hình riêng (cache canvas).
 * Dùng chung setup UI + combat canvas.
 */

const SIZE = 64;
const cache = new Map();
const urlCache = new Map();

function makeCanvas() {
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  return c;
}

function shade(hex, amt) {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? n.split('').map((ch) => ch + ch).join('') : n;
  const num = parseInt(full, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

function eye(ctx, x, y, s = 3, pupil = '#1a1612') {
  ellipse(ctx, x, y, s, s * 1.1, '#fffef8');
  ellipse(ctx, x + 0.5, y + 0.5, s * 0.45, s * 0.5, pupil);
}

function outlineStroke(ctx) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(26,22,18,0.75)';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
}

/* ——— Kind painters (0..64 local coords) ——— */

const KINDS = {
  skeleton(ctx, c) {
    ellipse(ctx, 32, 38, 14, 16, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 38, 14, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    // skull
    ellipse(ctx, 32, 22, 12, 11, shade(c, 40));
    ctx.stroke();
    eye(ctx, 27, 21, 3.2);
    eye(ctx, 37, 21, 3.2);
    ctx.fillStyle = '#1a1612';
    ctx.fillRect(26, 28, 12, 2);
    // ribs
    ctx.strokeStyle = shade(c, 55);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(24, 36 + i * 5);
      ctx.quadraticCurveTo(32, 38 + i * 5, 40, 36 + i * 5);
      ctx.stroke();
    }
  },

  rat(ctx, c) {
    ellipse(ctx, 34, 40, 16, 10, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(34, 40, 16, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 18, 34, 9, 8, shade(c, -15));
    ctx.stroke();
    // ears
    ellipse(ctx, 12, 26, 4, 5, shade(c, 20));
    ellipse(ctx, 20, 24, 4, 5, shade(c, 20));
    eye(ctx, 15, 33, 2.5);
    // tail
    ctx.strokeStyle = shade(c, -30);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(48, 42);
    ctx.quadraticCurveTo(58, 30, 56, 18);
    ctx.stroke();
  },

  goblin(ctx, c) {
    // body
    ellipse(ctx, 32, 42, 13, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 42, 13, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 24, 11, 10, shade(c, 25));
    ctx.stroke();
    // ears
    ctx.fillStyle = shade(c, 10);
    ctx.beginPath();
    ctx.moveTo(18, 22);
    ctx.lineTo(8, 12);
    ctx.lineTo(20, 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(46, 22);
    ctx.lineTo(56, 12);
    ctx.lineTo(44, 18);
    ctx.fill();
    eye(ctx, 27, 24);
    eye(ctx, 37, 24);
    ctx.fillStyle = '#1a1612';
    ctx.beginPath();
    ctx.arc(32, 30, 3, 0, Math.PI);
    ctx.fill();
  },

  insect(ctx, c) {
    ellipse(ctx, 32, 36, 10, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 36, 10, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 18, 8, 7, shade(c, 30));
    // wings
    ctx.globalAlpha = 0.55;
    ellipse(ctx, 18, 30, 9, 5, '#fff8e1');
    ellipse(ctx, 46, 30, 9, 5, '#fff8e1');
    ctx.globalAlpha = 1;
    eye(ctx, 29, 17, 2.2);
    eye(ctx, 35, 17, 2.2);
    // legs
    ctx.strokeStyle = shade(c, -40);
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(32 + side * 8, 32 + i * 6);
        ctx.lineTo(32 + side * 18, 36 + i * 6);
        ctx.stroke();
      }
    }
  },

  slime(ctx, c) {
    ctx.beginPath();
    ctx.moveTo(14, 48);
    ctx.quadraticCurveTo(12, 22, 32, 16);
    ctx.quadraticCurveTo(52, 22, 50, 48);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    outlineStroke(ctx);
    ctx.stroke();
    // shine
    ctx.globalAlpha = 0.45;
    ellipse(ctx, 24, 28, 5, 7, '#fff');
    ctx.globalAlpha = 1;
    eye(ctx, 26, 34, 3.5);
    eye(ctx, 38, 34, 3.5);
    ctx.fillStyle = '#1a1612';
    ctx.fillRect(28, 42, 8, 2);
  },

  bat(ctx, c) {
    // wings
    ctx.fillStyle = shade(c, -20);
    ctx.beginPath();
    ctx.moveTo(32, 32);
    ctx.lineTo(6, 18);
    ctx.lineTo(10, 36);
    ctx.lineTo(20, 28);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(32, 32);
    ctx.lineTo(58, 18);
    ctx.lineTo(54, 36);
    ctx.lineTo(44, 28);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, 32, 34, 9, 10, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 34, 9, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    eye(ctx, 28, 32, 2.5, '#c62828');
    eye(ctx, 36, 32, 2.5, '#c62828');
  },

  imp(ctx, c) {
    ellipse(ctx, 32, 40, 12, 13, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 40, 12, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 22, 10, 9, shade(c, 20));
    // horns
    ctx.fillStyle = shade(c, -40);
    ctx.beginPath();
    ctx.moveTo(22, 18);
    ctx.lineTo(18, 6);
    ctx.lineTo(26, 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(46, 6);
    ctx.lineTo(38, 16);
    ctx.fill();
    eye(ctx, 28, 22);
    eye(ctx, 36, 22);
    // pebble / rock in hand
    ellipse(ctx, 46, 42, 5, 4, shade(c, 50));
  },

  wisp(ctx, c) {
    ctx.globalAlpha = 0.35;
    ellipse(ctx, 32, 34, 18, 20, c);
    ctx.globalAlpha = 0.7;
    ellipse(ctx, 32, 34, 12, 14, shade(c, 30));
    ctx.globalAlpha = 1;
    ellipse(ctx, 32, 34, 8, 9, '#fffef8');
    eye(ctx, 28, 32, 2.5, c);
    eye(ctx, 36, 32, 2.5, c);
    // trails
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 3; i++) {
      ellipse(ctx, 24 + i * 6, 52 + i * 2, 3, 5, c);
    }
    ctx.globalAlpha = 1;
  },

  mushroom(ctx, c) {
    ellipse(ctx, 32, 44, 11, 12, shade(c, -25));
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 44, 11, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    // cap
    ctx.beginPath();
    ctx.ellipse(32, 28, 18, 12, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(50, 30);
    ctx.quadraticCurveTo(32, 44, 14, 30);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 24, 24, 3, 2.5, '#fff');
    ellipse(ctx, 36, 22, 4, 3, '#fff');
    eye(ctx, 27, 42, 2.5);
    eye(ctx, 37, 42, 2.5);
  },

  knight(ctx, c) {
    // armor body
    ctx.fillStyle = c;
    ctx.fillRect(20, 28, 24, 26);
    outlineStroke(ctx);
    ctx.strokeRect(20, 28, 24, 26);
    // helmet
    ctx.beginPath();
    ctx.moveTo(18, 30);
    ctx.lineTo(32, 12);
    ctx.lineTo(46, 30);
    ctx.closePath();
    ctx.fillStyle = shade(c, 25);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1a1612';
    ctx.fillRect(26, 22, 12, 4);
    // shield
    ctx.fillStyle = shade(c, -20);
    ctx.fillRect(10, 34, 10, 14);
    ctx.strokeRect(10, 34, 10, 14);
  },

  pixie(ctx, c) {
    ctx.globalAlpha = 0.5;
    ellipse(ctx, 18, 28, 10, 6, '#fff9c4');
    ellipse(ctx, 46, 28, 10, 6, '#fff9c4');
    ctx.globalAlpha = 1;
    ellipse(ctx, 32, 38, 9, 12, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 38, 9, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 22, 8, 8, shade(c, 35));
    eye(ctx, 29, 22, 2);
    eye(ctx, 35, 22, 2);
    // sparkles
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(48, 16, 3, 3);
    ctx.fillRect(12, 20, 2, 2);
  },

  blot(ctx, c) {
    ctx.beginPath();
    ctx.moveTo(16, 28);
    ctx.quadraticCurveTo(8, 40, 20, 50);
    ctx.quadraticCurveTo(32, 58, 44, 48);
    ctx.quadraticCurveTo(56, 36, 48, 22);
    ctx.quadraticCurveTo(36, 12, 16, 28);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    outlineStroke(ctx);
    ctx.stroke();
    eye(ctx, 28, 34, 3.5, '#eceff1');
    eye(ctx, 40, 32, 3, '#eceff1');
    // drip
    ellipse(ctx, 38, 54, 3, 5, c);
  },

  mimic(ctx, c) {
    ctx.fillStyle = c;
    ctx.fillRect(14, 28, 36, 24);
    outlineStroke(ctx);
    ctx.strokeRect(14, 28, 36, 24);
    ctx.fillStyle = shade(c, -30);
    ctx.fillRect(14, 38, 36, 4);
    // teeth
    ctx.fillStyle = '#fffef8';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(18 + i * 6, 38);
      ctx.lineTo(21 + i * 6, 44);
      ctx.lineTo(24 + i * 6, 38);
      ctx.fill();
    }
    eye(ctx, 24, 32, 3, '#c62828');
    eye(ctx, 40, 32, 3, '#c62828');
    // latch
    ellipse(ctx, 32, 40, 4, 3, '#ffd54f');
  },

  frog(ctx, c) {
    ellipse(ctx, 32, 40, 16, 12, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 40, 16, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 22, 26, 7, 7, shade(c, 20));
    ellipse(ctx, 42, 26, 7, 7, shade(c, 20));
    eye(ctx, 22, 26, 3.5);
    eye(ctx, 42, 26, 3.5);
    ctx.fillStyle = shade(c, -40);
    ctx.beginPath();
    ctx.ellipse(32, 44, 6, 3, 0, 0, Math.PI);
    ctx.fill();
  },

  doll(ctx, c) {
    ellipse(ctx, 32, 44, 12, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 44, 12, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 22, 11, 11, shade(c, 40));
    ctx.stroke();
    // yarn hair
    ctx.strokeStyle = shade(c, -20);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(32, 22, 12, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    eye(ctx, 27, 22, 2.5);
    eye(ctx, 37, 22, 2.5);
    ctx.strokeStyle = '#1a1612';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(27, 30);
    ctx.quadraticCurveTo(32, 34, 37, 30);
    ctx.stroke();
    // stitches
    ctx.strokeStyle = '#5d4037';
    ctx.beginPath();
    ctx.moveTo(26, 40);
    ctx.lineTo(30, 48);
    ctx.stroke();
  },

  eyeBall(ctx, c) {
    ellipse(ctx, 32, 34, 18, 16, shade(c, 40));
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 34, 18, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 34, 10, 10, c);
    ellipse(ctx, 32, 34, 5, 5, '#1a1612');
    ellipse(ctx, 34, 31, 2, 2, '#fff');
    // peduncle
    ctx.strokeStyle = shade(c, -30);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(32, 50);
    ctx.lineTo(32, 60);
    ctx.stroke();
  },

  trapSpike(ctx, c) {
    ctx.fillStyle = shade(c, -40);
    ctx.fillRect(10, 44, 44, 10);
    outlineStroke(ctx);
    ctx.strokeRect(10, 44, 44, 10);
    ctx.fillStyle = c;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(14 + i * 8, 44);
      ctx.lineTo(18 + i * 8, 18);
      ctx.lineTo(22 + i * 8, 44);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // warning
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('!', 30, 58);
  },

  trapOil(ctx, c) {
    ctx.beginPath();
    ctx.ellipse(32, 42, 22, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
    outlineStroke(ctx);
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ellipse(ctx, 24, 38, 6, 3, '#546e7a');
    ctx.globalAlpha = 1;
    // bubbles
    ellipse(ctx, 38, 36, 3, 3, shade(c, 40));
    ellipse(ctx, 28, 44, 2, 2, shade(c, 40));
    ctx.fillStyle = '#ff8a65';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('OIL', 22, 30);
  },

  lizard(ctx, c) {
    ellipse(ctx, 34, 38, 16, 10, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(34, 38, 16, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 16, 34, 8, 7, shade(c, 15));
    // crest
    ctx.fillStyle = shade(c, -30);
    ctx.beginPath();
    ctx.moveTo(12, 30);
    ctx.lineTo(8, 16);
    ctx.lineTo(18, 28);
    ctx.fill();
    eye(ctx, 14, 32, 2.5);
    // flame breath hint
    ctx.fillStyle = '#ffab40';
    ctx.beginPath();
    ctx.moveTo(8, 36);
    ctx.lineTo(0, 32);
    ctx.lineTo(8, 40);
    ctx.fill();
  },

  spider(ctx, c) {
    ellipse(ctx, 32, 36, 12, 10, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 36, 12, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 26, 7, 6, shade(c, 20));
    ctx.strokeStyle = shade(c, -30);
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const y = 28 + i * 5;
        ctx.beginPath();
        ctx.moveTo(32 + side * 10, y);
        ctx.lineTo(32 + side * 24, y - 4 + (i % 2) * 6);
        ctx.stroke();
      }
    }
    eye(ctx, 29, 25, 2);
    eye(ctx, 35, 25, 2);
  },

  wraith(ctx, c) {
    ctx.beginPath();
    ctx.moveTo(18, 52);
    ctx.quadraticCurveTo(14, 28, 32, 14);
    ctx.quadraticCurveTo(50, 28, 46, 52);
    ctx.quadraticCurveTo(38, 44, 32, 52);
    ctx.quadraticCurveTo(26, 44, 18, 52);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    outlineStroke(ctx);
    ctx.stroke();
    eye(ctx, 26, 28, 3, '#fff');
    eye(ctx, 38, 28, 3, '#fff');
    // bell / chain
    ellipse(ctx, 32, 44, 5, 4, '#ffd54f');
  },

  troll(ctx, c) {
    ellipse(ctx, 32, 40, 16, 16, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 40, 16, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 20, 13, 12, shade(c, 15));
    ctx.stroke();
    eye(ctx, 26, 20, 3.5);
    eye(ctx, 38, 20, 3.5);
    // club
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(46, 30, 8, 22);
    ellipse(ctx, 50, 28, 8, 7, '#8d6e63');
  },

  dancer(ctx, c) {
    ellipse(ctx, 32, 40, 10, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 40, 10, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 20, 8, 8, shade(c, 30));
    // blades
    ctx.strokeStyle = '#eceff1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, 50);
    ctx.lineTo(22, 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(52, 50);
    ctx.lineTo(42, 28);
    ctx.stroke();
    eye(ctx, 29, 20, 2);
    eye(ctx, 35, 20, 2);
  },

  archer(ctx, c) {
    ellipse(ctx, 32, 40, 11, 13, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 40, 11, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 22, 9, 9, shade(c, 20));
    // bow
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(48, 34, 12, -1.2, 1.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(48, 22);
    ctx.lineTo(48, 46);
    ctx.stroke();
    eye(ctx, 29, 22, 2);
    eye(ctx, 35, 22, 2);
  },

  cat(ctx, c) {
    ellipse(ctx, 34, 40, 14, 11, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(34, 40, 14, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 20, 30, 9, 8, shade(c, 15));
    // ears
    ctx.fillStyle = shade(c, -10);
    ctx.beginPath();
    ctx.moveTo(14, 26);
    ctx.lineTo(12, 14);
    ctx.lineTo(20, 24);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(26, 24);
    ctx.lineTo(28, 12);
    ctx.lineTo(22, 24);
    ctx.fill();
    eye(ctx, 17, 29, 2.5, '#ffeb3b');
    eye(ctx, 24, 29, 2.5, '#ffeb3b');
    // tail
    ctx.strokeStyle = c;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(46, 40);
    ctx.quadraticCurveTo(58, 28, 52, 16);
    ctx.stroke();
  },

  panther(ctx, c) {
    KINDS.cat(ctx, c);
    // darker stripes
    ctx.strokeStyle = shade(c, -50);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 34);
    ctx.lineTo(38, 42);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(34, 32);
    ctx.lineTo(42, 40);
    ctx.stroke();
  },

  golem(ctx, c) {
    ctx.fillStyle = c;
    // blocky body
    ctx.fillRect(18, 26, 28, 30);
    outlineStroke(ctx);
    ctx.strokeRect(18, 26, 28, 30);
    ctx.fillRect(22, 12, 20, 16);
    ctx.strokeRect(22, 12, 20, 16);
    // crystals
    ctx.fillStyle = shade(c, 60);
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(28, 18);
    ctx.lineTo(36, 18);
    ctx.fill();
    ctx.fillStyle = '#1a1612';
    ctx.fillRect(26, 18, 4, 4);
    ctx.fillRect(34, 18, 4, 4);
  },

  howler(ctx, c) {
    ellipse(ctx, 32, 38, 14, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 38, 14, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 20, 12, 10, shade(c, 10));
    // open maw
    ctx.fillStyle = '#1a1612';
    ctx.beginPath();
    ctx.ellipse(32, 24, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(26, 20, 3, 5);
    ctx.fillRect(35, 20, 3, 5);
    eye(ctx, 24, 16, 2.5);
    eye(ctx, 40, 16, 2.5);
  },

  plague(ctx, c) {
    ellipse(ctx, 32, 42, 12, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 42, 12, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    // plague mask
    ctx.fillStyle = shade(c, -20);
    ctx.beginPath();
    ctx.ellipse(32, 24, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(32, 28);
    ctx.lineTo(32, 44);
    ctx.lineTo(28, 40);
    ctx.closePath();
    ctx.fillStyle = '#5d4037';
    ctx.fill();
    eye(ctx, 26, 22, 2.5);
    eye(ctx, 38, 22, 2.5);
  },

  harpy(ctx, c) {
    // wings
    ctx.fillStyle = shade(c, -15);
    ctx.beginPath();
    ctx.moveTo(32, 30);
    ctx.lineTo(4, 20);
    ctx.lineTo(14, 40);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(32, 30);
    ctx.lineTo(60, 20);
    ctx.lineTo(50, 40);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, 32, 36, 10, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 36, 10, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 18, 8, 8, shade(c, 25));
    eye(ctx, 29, 18, 2);
    eye(ctx, 35, 18, 2);
    // talons
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(26, 50);
    ctx.lineTo(24, 58);
    ctx.moveTo(38, 50);
    ctx.lineTo(40, 58);
    ctx.stroke();
  },

  monk(ctx, c) {
    ellipse(ctx, 32, 42, 12, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 42, 12, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 22, 10, 10, shade(c, 30));
    // hood
    ctx.beginPath();
    ctx.moveTo(20, 24);
    ctx.quadraticCurveTo(32, 6, 44, 24);
    ctx.fillStyle = shade(c, -25);
    ctx.fill();
    eye(ctx, 28, 22, 2);
    eye(ctx, 36, 22, 2);
    // prayer beads
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 40, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();
  },

  dragon(ctx, c) {
    ellipse(ctx, 34, 38, 16, 12, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(34, 38, 16, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    // head
    ellipse(ctx, 14, 30, 10, 8, shade(c, 15));
    ctx.stroke();
    // wing
    ctx.fillStyle = shade(c, -25);
    ctx.beginPath();
    ctx.moveTo(32, 28);
    ctx.lineTo(48, 8);
    ctx.lineTo(52, 30);
    ctx.closePath();
    ctx.fill();
    // horns
    ctx.fillStyle = shade(c, -40);
    ctx.beginPath();
    ctx.moveTo(10, 24);
    ctx.lineTo(6, 10);
    ctx.lineTo(16, 22);
    ctx.fill();
    eye(ctx, 12, 28, 2.5, '#ffeb3b');
    // fire
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.moveTo(4, 32);
    ctx.lineTo(-4, 28);
    ctx.lineTo(4, 36);
    ctx.fill();
  },

  hydra(ctx, c) {
    ellipse(ctx, 32, 48, 16, 10, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 48, 16, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    // three necks/heads
    for (const [hx, hy] of [
      [18, 28],
      [32, 20],
      [46, 28],
    ]) {
      ctx.strokeStyle = shade(c, -20);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(32, 44);
      ctx.lineTo(hx, hy + 8);
      ctx.stroke();
      ellipse(ctx, hx, hy, 7, 6, shade(c, 10));
      outlineStroke(ctx);
      ctx.beginPath();
      ctx.ellipse(hx, hy, 7, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      eye(ctx, hx - 2, hy, 1.8, '#ffeb3b');
    }
  },

  leviathan(ctx, c) {
    // serpentine
    ctx.strokeStyle = c;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, 44);
    ctx.quadraticCurveTo(24, 16, 40, 36);
    ctx.quadraticCurveTo(52, 48, 58, 24);
    ctx.stroke();
    outlineStroke(ctx);
    ctx.lineWidth = 2;
    ctx.stroke();
    ellipse(ctx, 12, 42, 9, 8, shade(c, 20));
    eye(ctx, 10, 40, 2.5, '#81d4fa');
    // fins
    ctx.fillStyle = shade(c, -20);
    ctx.beginPath();
    ctx.moveTo(36, 28);
    ctx.lineTo(44, 12);
    ctx.lineTo(42, 34);
    ctx.fill();
  },

  behemoth(ctx, c) {
    // huge body
    ellipse(ctx, 32, 40, 20, 16, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 40, 20, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 18, 12, 11, shade(c, 15));
    ctx.stroke();
    // crown
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.moveTo(22, 14);
    ctx.lineTo(24, 4);
    ctx.lineTo(28, 12);
    ctx.lineTo(32, 2);
    ctx.lineTo(36, 12);
    ctx.lineTo(40, 4);
    ctx.lineTo(42, 14);
    ctx.closePath();
    ctx.fill();
    eye(ctx, 27, 18, 3);
    eye(ctx, 37, 18, 3);
  },

  hand(ctx, c) {
    // mud hand
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(18, 28);
    ctx.lineTo(26, 22);
    ctx.lineTo(32, 28);
    ctx.lineTo(38, 18);
    ctx.lineTo(44, 28);
    ctx.lineTo(50, 24);
    ctx.lineTo(48, 50);
    ctx.closePath();
    ctx.fill();
    outlineStroke(ctx);
    ctx.stroke();
    eye(ctx, 30, 36, 3);
  },

  scarab(ctx, c) {
    ellipse(ctx, 32, 36, 14, 12, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 36, 14, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    // shell line
    ctx.beginPath();
    ctx.moveTo(32, 24);
    ctx.lineTo(32, 48);
    ctx.stroke();
    ellipse(ctx, 32, 22, 6, 5, shade(c, -20));
    eye(ctx, 28, 22, 1.8);
    eye(ctx, 36, 22, 1.8);
    // coin glint
    ellipse(ctx, 40, 30, 4, 4, '#fff59d');
  },

  // Heroes
  heroMage(ctx, c) {
    // robe
    ctx.beginPath();
    ctx.moveTo(18, 54);
    ctx.lineTo(22, 28);
    ctx.lineTo(42, 28);
    ctx.lineTo(46, 54);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    outlineStroke(ctx);
    ctx.stroke();
    ellipse(ctx, 32, 20, 9, 9, shade(c, 40));
    ctx.stroke();
    // hat
    ctx.fillStyle = shade(c, -20);
    ctx.beginPath();
    ctx.moveTo(20, 18);
    ctx.lineTo(32, 2);
    ctx.lineTo(44, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // staff
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(48, 56);
    ctx.lineTo(52, 12);
    ctx.stroke();
    ellipse(ctx, 52, 10, 5, 5, '#ffd54f');
    eye(ctx, 29, 20, 2);
    eye(ctx, 35, 20, 2);
  },

  heroWarrior(ctx, c) {
    ctx.fillStyle = c;
    ctx.fillRect(22, 28, 20, 26);
    outlineStroke(ctx);
    ctx.strokeRect(22, 28, 20, 26);
    ellipse(ctx, 32, 20, 9, 9, shade(c, 35));
    ctx.stroke();
    // helmet crest
    ctx.fillStyle = shade(c, -30);
    ctx.fillRect(30, 6, 4, 12);
    // sword
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(48, 16, 4, 28);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(46, 42, 8, 6);
    // shield
    ctx.fillStyle = shade(c, -15);
    ctx.beginPath();
    ctx.moveTo(12, 30);
    ctx.lineTo(20, 30);
    ctx.lineTo(20, 48);
    ctx.lineTo(16, 52);
    ctx.lineTo(12, 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    eye(ctx, 29, 20, 2);
    eye(ctx, 35, 20, 2);
  },

  heroRogue(ctx, c) {
    ellipse(ctx, 32, 40, 10, 14, c);
    outlineStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(32, 40, 10, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, 32, 20, 8, 8, shade(c, 30));
    // hood
    ctx.beginPath();
    ctx.moveTo(22, 22);
    ctx.quadraticCurveTo(32, 8, 42, 22);
    ctx.fillStyle = shade(c, -35);
    ctx.fill();
    // mask
    ctx.fillStyle = '#1a1612';
    ctx.fillRect(25, 20, 14, 5);
    // daggers
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(12, 28, 3, 18);
    ctx.fillRect(49, 28, 3, 18);
    eye(ctx, 28, 18, 1.8, '#fff');
    eye(ctx, 36, 18, 1.8, '#fff');
  },
};

/** @type {Record<string, string>} */
const MONSTER_KIND = {
  bone_pile: 'skeleton',
  news_rat: 'rat',
  goblin_bait: 'goblin',
  mute_mite: 'insect',
  candle_bug: 'insect',
  moss_slug: 'slime',
  squeak_bat: 'bat',
  pebble_imp: 'imp',
  dust_wisp: 'wisp',
  fungus_spore: 'mushroom',
  tin_knight: 'knight',
  pickpocket_pixie: 'pixie',
  ink_blot: 'blot',
  crate_mimic_baby: 'mimic',
  spark_moth: 'insect',
  mud_hand: 'hand',
  echo_frog: 'frog',
  nail_sprite: 'pixie',
  rag_doll: 'doll',
  coin_scarab: 'scarab',
  thorn_seed: 'mushroom',
  cinder_puff: 'wisp',
  bucket_crab: 'scarab',
  loom_spiderling: 'spider',
  chalk_ghost: 'wraith',
  bolt_beetle: 'insect',
  cork_golem_shard: 'golem',
  whisper_moth: 'insect',
  slime_sticky: 'slime',
  ward_eye: 'eyeBall',
  spike_trap: 'trapSpike',
  poison_toad: 'frog',
  mirror_shade: 'wraith',
  chain_ghoul: 'wraith',
  ember_lizard: 'lizard',
  web_widow: 'spider',
  oil_slick: 'trapOil',
  bell_wraith: 'wraith',
  ash_hound: 'howler',
  glass_sentry: 'eyeBall',
  bramble_boar: 'troll',
  mist_lamprey: 'lizard',
  cinder_trap: 'trapSpike',
  loom_matriarch: 'spider',
  frost_imp: 'imp',
  brute_troll: 'troll',
  blade_dancer: 'dancer',
  stone_archer: 'archer',
  hex_cat: 'cat',
  barnacle_brute: 'troll',
  lantern_keeper: 'monk',
  bone_captain: 'skeleton',
  gale_archer: 'archer',
  rune_ogre: 'troll',
  venom_dancer: 'dancer',
  cipher_owl: 'bat',
  reef_guardian: 'golem',
  shadow_panther: 'panther',
  crystal_golem: 'golem',
  iron_howler: 'howler',
  plague_doctor: 'plague',
  obsidian_guard: 'knight',
  storm_harpy: 'harpy',
  grave_monk: 'monk',
  basalt_colossus: 'behemoth',
  night_reaver: 'panther',
  arc_sphinx: 'cat',
  mire_serpent: 'hydra',
  umbra_seer: 'eyeBall',
  dragon_01: 'dragon',
  abyss_hydra: 'hydra',
  void_wraith: 'wraith',
  tide_leviathan: 'leviathan',
  crown_behemoth: 'behemoth',
  solar_phoenix: 'harpy',
  frost_tyrant: 'golem',
  chaos_chimera: 'hydra',
  eclipse_serpent: 'leviathan',
  storm_colossus: 'behemoth',
  venom_empress: 'plague',
  mirror_paladin: 'knight',
  cinder_wyrm: 'dragon',
  night_oracle: 'wraith',
  void_sovereign: 'wraith',
  blood_idol: 'behemoth',
  doom_bell: 'monk',
  ash_apocalypse: 'hydra',
  chronos_fang: 'panther',
  moss_nurse: 'mushroom',
  salve_sprite: 'pixie',
  vita_toad: 'frog',
  bloom_dryad: 'wisp',
  sanctum_angel: 'monk',
};

const HERO_KIND = {
  hero_mage_01: 'heroMage',
  hero_mage_02: 'heroMage',
  hero_mage_03: 'heroMage',
  hero_mage_04: 'heroMage',
  hero_mage_05: 'heroMage',
  hero_mage_06: 'heroMage',
  hero_mage_07: 'heroMage',
  hero_warrior_01: 'heroWarrior',
  hero_warrior_02: 'heroWarrior',
  hero_warrior_03: 'heroWarrior',
  hero_warrior_04: 'heroWarrior',
  hero_warrior_05: 'heroWarrior',
  hero_warrior_06: 'heroWarrior',
  hero_warrior_07: 'heroWarrior',
  hero_warrior_08: 'heroWarrior',
  hero_warrior_09: 'heroWarrior',
  hero_warrior_10: 'heroWarrior',
  hero_warrior_11: 'heroWarrior',
  hero_rogue_01: 'heroRogue',
  hero_rogue_02: 'heroRogue',
  hero_rogue_03: 'heroRogue',
  hero_rogue_04: 'heroRogue',
  hero_rogue_05: 'heroRogue',
  hero_rogue_06: 'heroRogue',
  hero_rogue_07: 'heroRogue',
  hero_healer_01: 'heroMage',
  hero_healer_02: 'heroMage',
  hero_healer_03: 'heroMage',
  hero_healer_04: 'heroMage',
  hero_healer_05: 'heroMage',
};

function paintBackground(ctx, rarity) {
  const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  if (rarity >= 6) {
    g.addColorStop(0, 'rgba(239,83,80,0.4)');
    g.addColorStop(0.55, 'rgba(123,31,162,0.2)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
  } else if (rarity >= 5) {
    g.addColorStop(0, 'rgba(255,213,79,0.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
  } else if (rarity >= 4) {
    g.addColorStop(0, 'rgba(171,71,188,0.28)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
  } else {
    g.addColorStop(0, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

/**
 * @param {string} id
 * @param {string} color
 * @param {number} [rarity]
 */
export function getMonsterSprite(id, color = '#66bb6a', rarity = 1) {
  const key = `m:${id}:${color}:${rarity}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d');
  paintBackground(ctx, rarity);
  const kind = MONSTER_KIND[id] || 'goblin';
  const fn = KINDS[kind] || KINDS.goblin;
  fn(ctx, color);
  // rarity stars corner
  if (rarity >= 1) {
    ctx.fillStyle = rarity >= 4 ? '#ffd54f' : rarity >= 2 ? '#81c784' : '#a1887f';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('★'.repeat(Math.min(rarity, 5)), 2, 62);
  }
  cache.set(key, canvas);
  return canvas;
}

/** Sprite chấm hỏi — quái chưa mở khóa */
export function getLockedMonsterSprite(rarity = 1) {
  const key = `locked:${rarity}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d');
  paintBackground(ctx, rarity);

  // silhouette blob
  ctx.fillStyle = 'rgba(26,22,18,0.55)';
  ctx.beginPath();
  ctx.ellipse(32, 36, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(247,241,230,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // big ?
  ctx.fillStyle = rarity >= 6 ? '#ef5350' : rarity >= 5 ? '#ffd54f' : rarity >= 4 ? '#ce93d8' : '#f7f1e6';
  ctx.font = 'bold 36px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 32, 34);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = rarity >= 4 ? '#ffd54f' : rarity >= 2 ? '#81c784' : '#a1887f';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('★'.repeat(Math.min(rarity, 5)), 2, 62);

  cache.set(key, canvas);
  return canvas;
}

/**
 * @param {boolean} unlocked
 * @param {string} id
 * @param {string} color
 * @param {number} rarity
 */
export function monsterDisplayUrl(unlocked, id, color, rarity) {
  if (!unlocked) return getSpriteDataUrl(getLockedMonsterSprite(rarity || 1));
  return monsterSpriteUrl(id, color, rarity);
}

/**
 * @param {string} id
 * @param {string} heroClass
 * @param {string} color
 */
export function getHeroSprite(id, heroClass = 'WARRIOR', color = '#ef9a9a') {
  const key = `h:${id}:${color}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d');
  paintBackground(ctx, 3);
  const kind =
    HERO_KIND[id] ||
    (heroClass === 'MAGE' ? 'heroMage' : heroClass === 'ROGUE' ? 'heroRogue' : 'heroWarrior');
  const fn = KINDS[kind] || KINDS.heroWarrior;
  fn(ctx, color);
  cache.set(key, canvas);
  return canvas;
}

export function getSpriteDataUrl(canvas) {
  const key = canvas.__urlKey || (canvas.__urlKey = `u${Math.random()}`);
  if (urlCache.has(key)) return urlCache.get(key);
  const url = canvas.toDataURL('image/png');
  urlCache.set(key, url);
  return url;
}

export function monsterSpriteUrl(id, color, rarity) {
  return getSpriteDataUrl(getMonsterSprite(id, color, rarity));
}

export function heroSpriteUrl(id, heroClass, color) {
  return getSpriteDataUrl(getHeroSprite(id, heroClass, color));
}

/**
 * Draw sprite centered at world position with pose animation.
 * pose: idle | run | attack | cast | defend | flee | hurt | death
 * @returns {{ x: number, y: number, w: number, h: number }} tâm + kích thước đã vẽ (để gắn HP bar)
 */
export function drawSpriteAt(ctx, sprite, x, y, anim = {}) {
  const {
    size = 40,
    facing = 1,
    bob = 0,
    flash = 0,
    alpha = 1,
    squash = 1,
    pose = 'idle',
    poseT = 0,
    lungeX = 0,
    lungeY = 0,
    tint = null,
    shake = 0,
  } = anim;

  let sx = squash;
  let sy = 1 / Math.max(0.5, squash);
  let rot = 0;
  let ox = lungeX;
  let oy = bob + lungeY;
  let a = alpha;

  switch (pose) {
    case 'run': {
      const cycle = Math.sin(poseT * Math.PI * 2);
      sx = 1 + cycle * 0.08;
      sy = 1 - cycle * 0.08;
      // không dịch oy — bob đã lo trên combat; tránh lệch HP
      break;
    }
    case 'attack': {
      const t = Math.max(0, Math.min(1, poseT));
      sx = 1 + t * 0.18;
      sy = 1 - t * 0.1;
      break;
    }
    case 'cast': {
      const pulse = 0.5 + 0.5 * Math.sin(poseT * Math.PI);
      sx = 1 - poseT * 0.04;
      sy = 1 + poseT * 0.12;
      ctx.save();
      ctx.globalAlpha = 0.35 * pulse * a;
      ctx.strokeStyle = tint || '#ce93d8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, size * (0.55 + poseT * 0.25), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'defend': {
      sx = 0.92;
      sy = 1.08;
      break;
    }
    case 'flee': {
      const cycle = Math.sin(poseT * Math.PI * 2);
      sx = 1.1 + cycle * 0.1;
      sy = 0.9 - cycle * 0.05;
      break;
    }
    case 'hurt': {
      sx = 1.08;
      sy = 0.92;
      break;
    }
    case 'death': {
      a = 0.35;
      sy = 0.7;
      sx = 1.2;
      break;
    }
    default:
      break;
  }

  const flashMul = flash > 0 ? 1.1 : 1;
  const flashH = flash > 0 ? 0.92 : 1;
  // Luôn dương — flip bằng scale, tránh drawImage width âm lệch tâm
  const drawW = size * flashMul * Math.abs(sx);
  const drawH = size * flashH * Math.abs(sy);
  const vx = x + ox;
  const vy = y + oy;
  const face = facing < 0 ? -1 : 1;

  ctx.save();
  ctx.globalAlpha = a;
  if (flash > 0) {
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 12;
  }
  if (pose === 'flee') {
    ctx.shadowColor = '#ffeb3b';
    ctx.shadowBlur = 8;
  }
  if (pose === 'defend') {
    ctx.strokeStyle = 'rgba(129,212,250,0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(vx, vy, size * 0.58, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.translate(vx, vy);
  if (rot) ctx.rotate(rot);
  if (face < 0) ctx.scale(-1, 1);
  ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  return { x: vx, y: vy, w: drawW, h: drawH };
}

/** @deprecated dùng return của drawSpriteAt */
export function spriteVisualOffset(anim = {}) {
  const {
    bob = 0,
    pose = 'idle',
    poseT = 0,
    lungeX = 0,
    lungeY = 0,
    shake = 0,
  } = anim;

  let ox = lungeX;
  let oy = bob + lungeY;

  switch (pose) {
    case 'run': {
      const cycle = Math.sin(poseT * Math.PI * 2);
      oy += Math.abs(cycle) * 2;
      break;
    }
    case 'cast': {
      oy -= poseT * 4;
      break;
    }
    case 'hurt': {
      ox += shake;
      break;
    }
    default:
      break;
  }

  return { ox, oy };
}
