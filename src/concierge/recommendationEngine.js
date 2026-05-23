const { SERVICES } = require("../knowledge");

const PRACTICE_IDS = [
  "earthflow",
  "bars",
  "mukaino",
  "breath",
  "five",
  "five_fire",
  "five_bamboo"
];

/** Emotion → practice affinity (0–5) */
const EMOTION_WEIGHTS = {
  fatigue: { five: 4, five_fire: 3, five_bamboo: 3, earthflow: 3, bars: 4, breath: 3, mukaino: 2 },
  anxiety: { breath: 5, bars: 5, earthflow: 4, five: 2, mukaino: 2, five_fire: 1, five_bamboo: 2 },
  body_tension: { five: 4, five_bamboo: 5, five_fire: 4, mukaino: 4, bars: 3, earthflow: 2, breath: 2 },
  no_energy: { earthflow: 4, mukaino: 4, five: 3, breath: 3, bars: 3, five_fire: 2, five_bamboo: 2 },
  emotional_exhaustion: { breath: 5, bars: 4, earthflow: 4, five: 3, five_fire: 2, five_bamboo: 2, mukaino: 2 },
  want_relax: { five: 5, bars: 4, earthflow: 4, breath: 4, five_fire: 3, five_bamboo: 3, mukaino: 2 },
  want_peace: { breath: 5, bars: 5, earthflow: 4, five: 2, mukaino: 2, five_fire: 1, five_bamboo: 2 }
};

/** Outcome → practice affinity */
const OUTCOME_WEIGHTS = {
  deep_relax: { five: 5, five_fire: 4, bars: 4, breath: 4, five_bamboo: 3, earthflow: 3, mukaino: 1 },
  recovery: { five: 5, five_fire: 4, five_bamboo: 4, earthflow: 4, breath: 3, bars: 3, mukaino: 3 },
  body_lightness: { five_bamboo: 5, five: 4, mukaino: 4, five_fire: 3, bars: 2, earthflow: 2, breath: 2 },
  calm: { breath: 5, bars: 5, earthflow: 4, five: 2, mukaino: 2, five_fire: 1, five_bamboo: 2 },
  recharge: { earthflow: 5, breath: 4, five: 4, mukaino: 3, bars: 3, five_fire: 3, five_bamboo: 2 },
  more_energy: { earthflow: 5, mukaino: 4, breath: 3, five: 3, bars: 2, five_fire: 2, five_bamboo: 2 }
};

const DEFAULT_TOP = ["earthflow", "bars", "five"];

function getServiceMeta(practiceId) {
  return SERVICES.find((s) => s.id === practiceId);
}

/**
 * @returns {{ practiceId: string, score: number, alternatives: string[] }}
 */
function recommendPractice(emotionId, outcomeId) {
  const scores = {};

  for (const id of PRACTICE_IDS) {
    const e = EMOTION_WEIGHTS[emotionId]?.[id] || 1;
    const o = OUTCOME_WEIGHTS[outcomeId]?.[id] || 1;
    scores[id] = e * 2 + o * 2;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const practiceId = ranked[0]?.[0] || DEFAULT_TOP[0];
  const alternatives = ranked.slice(1, 4).map(([id]) => id);

  return {
    practiceId,
    score: ranked[0]?.[1] || 0,
    alternatives
  };
}

module.exports = {
  recommendPractice,
  getServiceMeta,
  PRACTICE_IDS
};
