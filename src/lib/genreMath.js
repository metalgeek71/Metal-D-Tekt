/**
 * genreMath.js
 * 
 * Weighted classification algorithm for metal sub-genre detection.
 * Includes all 24 genres from the Metal Family Tree.
 * 
 * Uses Spectral Centroid as the PRIMARY discriminative feature.
 */

export const GENRE_PROFILES = {
  earlyMetal: { label: 'Early Metal', emoji: '🎸', color: 'yellow', profile: { spectralCentroid: 0.35, spectralRolloff: 0.40, spectralFlatness: 0.35, spectralSpread: 0.45, rms: 0.60, zcr: 0.40, harmonicRatio: 0.60, rhythmicComplexity: 0.30 }, bpmRange: [90, 130] },
  originalHardRock: { label: 'Original Hard Rock', emoji: '🤘', color: 'orange', profile: { spectralCentroid: 0.40, spectralRolloff: 0.45, spectralFlatness: 0.30, spectralSpread: 0.50, rms: 0.65, zcr: 0.45, harmonicRatio: 0.65, rhythmicComplexity: 0.25 }, bpmRange: [100, 140] },
  shockRock: { label: 'Shock Rock', emoji: '🦇', color: 'purple', profile: { spectralCentroid: 0.45, spectralRolloff: 0.50, spectralFlatness: 0.35, spectralSpread: 0.50, rms: 0.65, zcr: 0.50, harmonicRatio: 0.55, rhythmicComplexity: 0.30 }, bpmRange: [100, 140] },
  earlyPunk: { label: 'Early Punk', emoji: '🧷', color: 'pink', profile: { spectralCentroid: 0.50, spectralRolloff: 0.55, spectralFlatness: 0.40, spectralSpread: 0.55, rms: 0.70, zcr: 0.60, harmonicRatio: 0.45, rhythmicComplexity: 0.20 }, bpmRange: [140, 180] },
  powerMetal: { label: 'Power Metal', emoji: '🗡️', color: 'yellow', profile: { spectralCentroid: 0.65, spectralRolloff: 0.70, spectralFlatness: 0.30, spectralSpread: 0.60, rms: 0.80, zcr: 0.60, harmonicRatio: 0.70, rhythmicComplexity: 0.40 }, bpmRange: [130, 180] },
  progressiveMetal: { label: 'Progressive Metal', emoji: '🌀', color: 'indigo', profile: { spectralCentroid: 0.55, spectralRolloff: 0.60, spectralFlatness: 0.35, spectralSpread: 0.55, rms: 0.70, zcr: 0.55, harmonicRatio: 0.60, rhythmicComplexity: 0.85 }, bpmRange: [80, 200] },
  glamMetal: { label: 'Glam Metal', emoji: '💄', color: 'fuchsia', profile: { spectralCentroid: 0.65, spectralRolloff: 0.65, spectralFlatness: 0.25, spectralSpread: 0.50, rms: 0.70, zcr: 0.50, harmonicRatio: 0.65, rhythmicComplexity: 0.25 }, bpmRange: [110, 140] },
  popMetal: { label: 'Pop Metal', emoji: '✨', color: 'rose', profile: { spectralCentroid: 0.60, spectralRolloff: 0.60, spectralFlatness: 0.20, spectralSpread: 0.45, rms: 0.65, zcr: 0.45, harmonicRatio: 0.70, rhythmicComplexity: 0.20 }, bpmRange: [100, 130] },
  stonerMetal: { label: 'Stoner Metal', emoji: '🌿', color: 'green', profile: { spectralCentroid: 0.25, spectralRolloff: 0.35, spectralFlatness: 0.45, spectralSpread: 0.40, rms: 0.75, zcr: 0.35, harmonicRatio: 0.45, rhythmicComplexity: 0.20 }, bpmRange: [60, 100] },
  originalHardcore: { label: 'Original Hardcore', emoji: '👊', color: 'red', profile: { spectralCentroid: 0.55, spectralRolloff: 0.60, spectralFlatness: 0.45, spectralSpread: 0.55, rms: 0.75, zcr: 0.65, harmonicRatio: 0.40, rhythmicComplexity: 0.25 }, bpmRange: [150, 200] },
  nwobhm: { label: 'NWOBHM', emoji: '🇬🇧', color: 'blue', profile: { spectralCentroid: 0.50, spectralRolloff: 0.55, spectralFlatness: 0.35, spectralSpread: 0.55, rms: 0.75, zcr: 0.55, harmonicRatio: 0.55, rhythmicComplexity: 0.35 }, bpmRange: [120, 160] },
  grunge: { label: 'Grunge', emoji: '🧥', color: 'stone', profile: { spectralCentroid: 0.40, spectralRolloff: 0.45, spectralFlatness: 0.40, spectralSpread: 0.50, rms: 0.65, zcr: 0.40, harmonicRatio: 0.50, rhythmicComplexity: 0.25 }, bpmRange: [90, 130] },
  gothMetal: { label: 'Goth Metal', emoji: '🦇', color: 'purple', profile: { spectralCentroid: 0.35, spectralRolloff: 0.40, spectralFlatness: 0.25, spectralSpread: 0.40, rms: 0.60, zcr: 0.35, harmonicRatio: 0.60, rhythmicComplexity: 0.25 }, bpmRange: [70, 110] },
  thrashMetal: { label: 'Thrash Metal', emoji: '🌪️', color: 'orange', profile: { spectralCentroid: 0.60, spectralRolloff: 0.65, spectralFlatness: 0.50, spectralSpread: 0.60, rms: 0.85, zcr: 0.70, harmonicRatio: 0.45, rhythmicComplexity: 0.50 }, bpmRange: [150, 220] },
  firstWaveBlackMetal: { label: 'First Wave Black Metal', emoji: '🕯️', color: 'gray', profile: { spectralCentroid: 0.55, spectralRolloff: 0.60, spectralFlatness: 0.60, spectralSpread: 0.65, rms: 0.75, zcr: 0.75, harmonicRatio: 0.35, rhythmicComplexity: 0.40 }, bpmRange: [130, 180] },
  norwegianBlackMetal: { label: 'Norwegian Black Metal', emoji: '❄️', color: 'slate', profile: { spectralCentroid: 0.70, spectralRolloff: 0.75, spectralFlatness: 0.75, spectralSpread: 0.70, rms: 0.80, zcr: 0.85, harmonicRatio: 0.25, rhythmicComplexity: 0.35 }, bpmRange: [140, 220] },
  deathMetal: { label: 'Death Metal', emoji: '💀', color: 'red', profile: { spectralCentroid: 0.45, spectralRolloff: 0.55, spectralFlatness: 0.70, spectralSpread: 0.65, rms: 0.90, zcr: 0.65, harmonicRatio: 0.30, rhythmicComplexity: 0.60 }, bpmRange: [140, 240] },
  grindcore: { label: 'Grindcore', emoji: '🐖', color: 'red', profile: { spectralCentroid: 0.60, spectralRolloff: 0.65, spectralFlatness: 0.80, spectralSpread: 0.75, rms: 0.95, zcr: 0.80, harmonicRatio: 0.20, rhythmicComplexity: 0.50 }, bpmRange: [180, 260] },
  swedishDeathMetal: { label: 'Swedish Death Metal', emoji: '🪚', color: 'orange', profile: { spectralCentroid: 0.50, spectralRolloff: 0.60, spectralFlatness: 0.65, spectralSpread: 0.65, rms: 0.85, zcr: 0.70, harmonicRatio: 0.40, rhythmicComplexity: 0.50 }, bpmRange: [130, 200] },
  metalcore: { label: 'Metalcore', emoji: '🥋', color: 'red', profile: { spectralCentroid: 0.55, spectralRolloff: 0.60, spectralFlatness: 0.55, spectralSpread: 0.60, rms: 0.85, zcr: 0.65, harmonicRatio: 0.45, rhythmicComplexity: 0.65 }, bpmRange: [120, 180] },
  hardAlternative: { label: 'Hard Alternative', emoji: '📻', color: 'blue', profile: { spectralCentroid: 0.45, spectralRolloff: 0.50, spectralFlatness: 0.35, spectralSpread: 0.50, rms: 0.70, zcr: 0.50, harmonicRatio: 0.55, rhythmicComplexity: 0.40 }, bpmRange: [90, 140] },
  nuMetal: { label: 'Nu Metal', emoji: '🧢', color: 'red', profile: { spectralCentroid: 0.40, spectralRolloff: 0.45, spectralFlatness: 0.45, spectralSpread: 0.55, rms: 0.80, zcr: 0.55, harmonicRatio: 0.50, rhythmicComplexity: 0.55 }, bpmRange: [90, 130] },
  nwoam: { label: 'NWOAM', emoji: '🦅', color: 'blue', profile: { spectralCentroid: 0.50, spectralRolloff: 0.55, spectralFlatness: 0.55, spectralSpread: 0.60, rms: 0.85, zcr: 0.65, harmonicRatio: 0.50, rhythmicComplexity: 0.60 }, bpmRange: [130, 180] },
  industrialMetal: { label: 'Industrial Metal', emoji: '⚙️', color: 'gray', profile: { spectralCentroid: 0.50, spectralRolloff: 0.55, spectralFlatness: 0.60, spectralSpread: 0.55, rms: 0.85, zcr: 0.60, harmonicRatio: 0.40, rhythmicComplexity: 0.40 }, bpmRange: [100, 140] },
};

const FEATURE_WEIGHTS = {
  spectralCentroid: 3.0,
  spectralFlatness: 1.5,
  spectralRolloff: 1.2,
  spectralSpread: 1.0,
  rms: 1.0,
  zcr: 1.3,
  harmonicRatio: 1.2,
  rhythmicComplexity: 2.0,
};

const BPM_PENALTY_WEIGHT = 1.8;
const OUTPUT_SMOOTHING = 0.12;

export function classifyGenre(features, previousScores = null) {
  const distances = {};

  for (const [genreKey, genre] of Object.entries(GENRE_PROFILES)) {
    let weightedDistSq = 0;
    let totalWeight = 0;

    for (const [featureKey, weight] of Object.entries(FEATURE_WEIGHTS)) {
      const liveValue = features[featureKey] || 0;
      const targetValue = genre.profile[featureKey];
      const diff = liveValue - targetValue;

      weightedDistSq += weight * diff * diff;
      totalWeight += weight;
    }

    let distance = Math.sqrt(weightedDistSq / totalWeight);

    if (features.bpmValid && features.bpm > 0) {
      const [bpmLow, bpmHigh] = genre.bpmRange;
      const bpm = features.bpm;

      if (bpm < bpmLow) {
        const penalty = (bpmLow - bpm) / bpmLow;
        distance += BPM_PENALTY_WEIGHT * penalty * 0.3;
      } else if (bpm > bpmHigh) {
        const penalty = (bpm - bpmHigh) / bpmHigh;
        distance += BPM_PENALTY_WEIGHT * penalty * 0.3;
      }
    }

    distances[genreKey] = distance;
  }

  const rawScores = {};
  let total = 0;

  for (const [genreKey, distance] of Object.entries(distances)) {
    // Inverse distance with nonlinear scaling for sharper differentiation
    // Increased power from 4 to 6 for 24 genres to make the top ones stand out more
    const score = 1 / (1 + Math.pow(distance, 6) * 100);
    rawScores[genreKey] = score;
    total += score;
  }

  const scores = {};
  const genreCount = Object.keys(GENRE_PROFILES).length;
  for (const [genreKey, score] of Object.entries(rawScores)) {
    scores[genreKey] = total > 0 ? (score / total) * 100 : (100 / genreCount);
  }

  if (previousScores) {
    for (const key of Object.keys(scores)) {
      scores[key] = OUTPUT_SMOOTHING * scores[key] + (1 - OUTPUT_SMOOTHING) * (previousScores[key] || (100 / genreCount));
    }

    const smoothedTotal = Object.values(scores).reduce((a, b) => a + b, 0);
    if (smoothedTotal > 0) {
      for (const key of Object.keys(scores)) {
        scores[key] = (scores[key] / smoothedTotal) * 100;
      }
    }
  }

  let dominant = Object.keys(scores)[0];
  let maxScore = 0;
  for (const [key, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominant = key;
    }
  }

  return { scores, dominant };
}

export function getGenreMeta(genreKey) {
  return GENRE_PROFILES[genreKey] || null;
}

export function getGenreKeys() {
  return Object.keys(GENRE_PROFILES);
}
