/**
 * Simple BFS pathfinding on a room grid.
 * Cells: walkable unless blocked (optional Set of "col,row").
 * Returns list of {col,row} from start to goal inclusive, or null.
 */
export function findPath(start, goal, cols, rows, blocked = new Set()) {
  const key = (c, r) => `${c},${r}`;
  if (blocked.has(key(goal.col, goal.row))) return null;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const q = [{ col: start.col, row: start.row }];
  const came = new Map();
  came.set(key(start.col, start.row), null);
  let found = false;

  while (q.length) {
    const cur = q.shift();
    if (cur.col === goal.col && cur.row === goal.row) {
      found = true;
      break;
    }
    for (const [dc, dr] of dirs) {
      const nc = cur.col + dc;
      const nr = cur.row + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const k = key(nc, nr);
      if (came.has(k) || blocked.has(k)) continue;
      came.set(k, key(cur.col, cur.row));
      q.push({ col: nc, row: nr });
    }
  }

  if (!found) return null;

  const path = [];
  let k = key(goal.col, goal.row);
  while (k) {
    const [c, r] = k.split(',').map(Number);
    path.push({ col: c, row: r });
    k = came.get(k);
  }
  path.reverse();
  return path;
}

/** World position helpers for multi-room dungeon strip */
export function roomOriginX(roomIndex, roomWidth, gap = 24) {
  return roomIndex * (roomWidth + gap);
}
