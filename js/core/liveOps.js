import { CHALLENGE_TITLES, CHALLENGE_BY_ID } from '../data/challenges.js?v=135';
import { ROTATIONS } from '../data/rotations.js?v=135';

export function ensureLiveOpsProgress(state) {
  if (!state.liveOpsProgress || typeof state.liveOpsProgress !== 'object') {
    state.liveOpsProgress = { rotations: {} };
  }
  if (!state.liveOpsProgress.rotations || typeof state.liveOpsProgress.rotations !== 'object') {
    state.liveOpsProgress.rotations = {};
  }
  return state.liveOpsProgress;
}

export function getCurrentRotation(now = Date.now()) {
  return (
    ROTATIONS.find((rotation) => {
      const start = Date.parse(rotation.startAt || 0);
      const end = Date.parse(rotation.endAt || 0);
      return now >= start && now <= end;
    }) || null
  );
}

export function getRotationEntries(rotation) {
  if (!rotation?.entries) return [];
  return rotation.entries
    .map((entry) => {
      const base = CHALLENGE_BY_ID[entry.challengeId];
      if (!base) return null;
      return {
        ...entry,
        baseChallenge: base,
      };
    })
    .filter(Boolean);
}

export function rotationEntryStatus(state, rotationId, entryId) {
  ensureLiveOpsProgress(state);
  return !!state.liveOpsProgress.rotations?.[rotationId]?.cleared?.[entryId];
}

export function buildRotationChallenge(entry) {
  const base = entry?.baseChallenge || CHALLENGE_BY_ID[entry?.challengeId];
  if (!base) return null;
  const overrides = entry.overrides || {};
  const reward = entry.reward || {};
  const merged = {
    ...base,
    ...overrides,
    name: entry.name || base.name,
    blurb: entry.blurb || base.blurb,
    reward: {
      ...base.reward,
      ...reward.baseReward,
    },
    constraints: {
      ...(base.constraints || {}),
      ...(overrides.constraints || {}),
    },
    objectives: overrides.objectives || base.objectives,
    wave: {
      ...(base.wave || {}),
      ...(overrides.wave || {}),
    },
    rotationMeta: {
      rotationId: entry.rotationId,
      entryId: entry.id,
      eventReward: reward.eventReward || null,
      badgeLabel: reward.badgeLabel || null,
    },
  };
  return merged;
}

export function grantRotationReward(state, run) {
  const meta = run?.rotationMeta;
  if (!meta?.rotationId || !meta.entryId) return { ok: false };
  ensureLiveOpsProgress(state);
  const bucket =
    state.liveOpsProgress.rotations[meta.rotationId] ||
    (state.liveOpsProgress.rotations[meta.rotationId] = { cleared: {} });
  if (bucket.cleared[meta.entryId]) {
    return { ok: true, replay: true, souls: 0, gems: 0, badgeLabel: meta.badgeLabel || null };
  }
  bucket.cleared[meta.entryId] = {
    at: Date.now(),
  };
  const reward = meta.eventReward || {};
  if (reward.souls) state.souls = (state.souls || 0) + reward.souls;
  if (reward.gems) state.gems = (state.gems || 0) + reward.gems;
  if (reward.titleId && CHALLENGE_TITLES[reward.titleId]) {
    if (!state.titles.includes(reward.titleId)) state.titles.push(reward.titleId);
  }
  return {
    ok: true,
    replay: false,
    souls: reward.souls || 0,
    gems: reward.gems || 0,
    titleId: reward.titleId || null,
    titleName: reward.titleId ? CHALLENGE_TITLES[reward.titleId]?.name || '' : '',
    badgeLabel: meta.badgeLabel || null,
  };
}
