export function createSpawnQueue(wave) {
  return (wave || []).map((h) => ({ ...h, spawned: false }));
}

export function waveBaseDelay(spawnQueue, waveIndex) {
  const wi = waveIndex || 1;
  let min = Infinity;
  for (const h of spawnQueue || []) {
    if ((h.waveIndex || 1) !== wi) continue;
    min = Math.min(min, Number(h.spawnDelay) || 0);
  }
  return Number.isFinite(min) ? min : 0;
}

export function isWaveCleared(spawnQueue, heroes, waveIndex) {
  const wi = waveIndex || 1;
  const anyPending = (spawnQueue || []).some((h) => !h.spawned && (h.waveIndex || 1) === wi);
  if (anyPending) return false;
  return !(heroes || []).some((h) => h.alive && (h.waveIndex || 1) === wi);
}

export function unlockWaves(engine) {
  if (!engine._waveUnlocked) engine._waveUnlocked = { 1: 0 };
  let maxWave = 1;
  for (const h of engine.spawnQueue || []) {
    maxWave = Math.max(maxWave, h.waveIndex || 1);
  }
  for (let wi = 2; wi <= maxWave; wi++) {
    if (engine._waveUnlocked[wi] != null) continue;
    if (!isWaveCleared(engine.spawnQueue, engine.heroes, wi - 1)) break;
    engine._waveUnlocked[wi] = engine.time + 1.2;
    engine.stats?.recordWaveUnlock(wi, engine.time);
    engine._float(engine.CELL * 2, 36, `Đợt ${wi} tiến vào!`, '#ffcc80');
  }
}
