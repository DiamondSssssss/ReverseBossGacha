/**
 * A* pathfinding + LOS helpers for single-stage maps.
 * blocked: Set of "col,row"
 */

function key(c, r) {
  return `${c},${r}`;
}

function heuristic(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

/**
 * @param {{col:number,row:number}} start
 * @param {{col:number,row:number}} goal
 * @param {number} cols
 * @param {number} rows
 * @param {Set<string>} blocked
 * @returns {{col:number,row:number}[]|null}
 */
export function findPath(start, goal, cols, rows, blocked = new Set()) {
  const gk = key(goal.col, goal.row);
  if (blocked.has(gk)) return null;
  if (
    start.col < 0 ||
    start.row < 0 ||
    start.col >= cols ||
    start.row >= rows ||
    goal.col < 0 ||
    goal.row < 0 ||
    goal.col >= cols ||
    goal.row >= rows
  ) {
    return null;
  }

  const sk = key(start.col, start.row);
  if (sk === gk) return [{ col: start.col, row: start.row }];

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  const open = [{ col: start.col, row: start.row, f: 0 }];
  const came = new Map();
  const gScore = new Map([[sk, 0]]);
  const inOpen = new Set([sk]);

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift();
    const ck = key(cur.col, cur.row);
    inOpen.delete(ck);

    if (cur.col === goal.col && cur.row === goal.row) {
      const path = [];
      let k = ck;
      while (k) {
        const [c, r] = k.split(',').map(Number);
        path.push({ col: c, row: r });
        k = came.get(k);
      }
      path.reverse();
      return path;
    }

    for (const [dc, dr] of dirs) {
      const nc = cur.col + dc;
      const nr = cur.row + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const nk = key(nc, nr);
      if (blocked.has(nk) && nk !== gk) continue;
      const tentative = (gScore.get(ck) ?? Infinity) + 1;
      if (tentative >= (gScore.get(nk) ?? Infinity)) continue;
      came.set(nk, ck);
      gScore.set(nk, tentative);
      const f = tentative + heuristic({ col: nc, row: nr }, goal);
      if (!inOpen.has(nk)) {
        open.push({ col: nc, row: nr, f });
        inOpen.add(nk);
      }
    }
  }
  return null;
}

/** Build blocked set from compiled map (+ optional extra cells) */
export function buildBlockedFromMap(map, extras = []) {
  const blocked = new Set(map.blocked);
  for (const e of extras) {
    if (typeof e === 'string') blocked.add(e);
    else if (e && e.col != null) blocked.add(key(e.col, e.row));
  }
  return blocked;
}

/**
 * Path away from a threat cell (maximize distance greedily via BFS frontier).
 */
export function findPathAway(start, threat, cols, rows, blocked = new Set(), maxSteps = 6) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  let best = { col: start.col, row: start.row };
  let bestScore = -Infinity;

  const q = [{ col: start.col, row: start.row, steps: 0 }];
  const seen = new Set([key(start.col, start.row)]);

  while (q.length) {
    const cur = q.shift();
    const score =
      Math.hypot(cur.col - threat.col, cur.row - threat.row) + cur.steps * 0.1;
    if (score > bestScore) {
      bestScore = score;
      best = { col: cur.col, row: cur.row };
    }
    if (cur.steps >= maxSteps) continue;
    for (const [dc, dr] of dirs) {
      const nc = cur.col + dc;
      const nr = cur.row + dr;
      const k = key(nc, nr);
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      if (blocked.has(k) || seen.has(k)) continue;
      seen.add(k);
      q.push({ col: nc, row: nr, steps: cur.steps + 1 });
    }
  }

  if (best.col === start.col && best.row === start.row) return null;
  return findPath(start, best, cols, rows, blocked);
}

/** Grid line-of-sight (Bresenham); walls block */
export function los(a, b, blocked) {
  let x0 = a.col;
  let y0 = a.row;
  const x1 = b.col;
  const y1 = b.row;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (x0 === x1 && y0 === y1) return true;
    // don't count start cell as blocking
    if (!(x0 === a.col && y0 === a.row) && blocked.has(key(x0, y0))) return false;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** @deprecated multi-room strip helper — kept for any leftover refs */
export function roomOriginX(roomIndex, roomWidth, gap = 24) {
  return roomIndex * (roomWidth + gap);
}

export function worldToCell(x, y, cellSize, originX = 0, originY = 40) {
  const col = Math.floor((x - originX) / cellSize);
  const row = Math.floor((y - originY) / cellSize);
  return { col, row };
}

export function cellCenterWorld(col, row, cellSize, originX = 0, originY = 40) {
  return {
    x: originX + col * cellSize + cellSize / 2,
    y: originY + row * cellSize + cellSize / 2,
  };
}
