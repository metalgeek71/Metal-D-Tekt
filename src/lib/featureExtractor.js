/**
 * featureExtractor.js
 * 
 * Aggregates raw Meyda features + derived features into a normalized feature vector.
 * All features are temporally smoothed via exponential moving average.
 */

import { BPMDetector } from './bpmDetector.js';

export class FeatureExtractor {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate;
    this.nyquist = sampleRate / 2;
    this.bpmDetector = new BPMDetector(sampleRate, 512);

    // Smoothing factor for EMA
    this.alpha = 0.15;

    // Smoothed feature state
    this.smoothed = {
      spectralCentroid: 0,
      spectralRolloff: 0,
      spectralFlatness: 0,
      spectralSpread: 0,
      rms: 0,
      energy: 0,
      zcr: 0,
      harmonicRatio: 0,
    };

    // For rhythmic complexity estimation
    this.recentEnergies = [];
    this.maxRecentEnergies = 120; // ~2 seconds of frames
    this.rhythmicComplexity = 0;

    // Frame counter
    this.frameCount = 0;
  }

  /**
   * Process a raw Meyda feature frame and return normalized + smoothed features.
   * @param {Object} rawFeatures - Meyda feature object
   * @param {Float32Array} frequencyData - AnalyserNode frequency data (dB)
   * @returns {Object} Normalized feature vector
   */
  process(rawFeatures, frequencyData) {
    this.frameCount++;

    // ── Normalize raw features ──
    const normalized = {
      spectralCentroid: this._clamp((rawFeatures.spectralCentroid || 0) / (this.nyquist / 10), 0, 1),
      spectralRolloff: this._clamp((rawFeatures.spectralRolloff || 0) / this.nyquist, 0, 1),
      spectralFlatness: this._clamp(rawFeatures.spectralFlatness || 0, 0, 1),
      spectralSpread: this._clamp((rawFeatures.spectralSpread || 0) / 100, 0, 1),
      rms: this._clamp((rawFeatures.rms || 0) * 3, 0, 1),
      energy: this._clamp((rawFeatures.energy || 0) / 10, 0, 1),
      zcr: this._clamp((rawFeatures.zcr || 0) / 256, 0, 1),
    };

    // ── Compute harmonic ratio from frequency data ──
    if (frequencyData && frequencyData.length > 0) {
      normalized.harmonicRatio = this._computeHarmonicRatio(frequencyData);
    } else {
      normalized.harmonicRatio = 0;
    }

    // ── BPM Detection ──
    const bpm = this.bpmDetector.process(rawFeatures.rms || 0);

    // ── Rhythmic Complexity ──
    this.recentEnergies.push(rawFeatures.rms || 0);
    if (this.recentEnergies.length > this.maxRecentEnergies) {
      this.recentEnergies.shift();
    }
    const rc = this._computeRhythmicComplexity();

    // ── Apply EMA smoothing ──
    for (const key of Object.keys(normalized)) {
      this.smoothed[key] = this._ema(this.smoothed[key], normalized[key]);
    }
    this.rhythmicComplexity = this._ema(this.rhythmicComplexity, rc);

    return {
      spectralCentroid: this.smoothed.spectralCentroid,
      spectralRolloff: this.smoothed.spectralRolloff,
      spectralFlatness: this.smoothed.spectralFlatness,
      spectralSpread: this.smoothed.spectralSpread,
      rms: this.smoothed.rms,
      energy: this.smoothed.energy,
      zcr: this.smoothed.zcr,
      harmonicRatio: this.smoothed.harmonicRatio,
      rhythmicComplexity: this.rhythmicComplexity,
      bpm: bpm,
      bpmValid: this.bpmDetector.isValid(),
    };
  }

  /**
   * Estimate harmonic content by looking at peak-to-average ratio
   * in the frequency spectrum. Harmonic signals have pronounced peaks.
   */
  _computeHarmonicRatio(frequencyData) {
    const len = frequencyData.length;
    if (len === 0) return 0;

    // Convert dB to linear magnitude
    let totalEnergy = 0;
    let peakEnergy = 0;
    const magnitudes = new Float32Array(len);

    for (let i = 0; i < len; i++) {
      // frequencyData is in dB, convert to linear
      const linear = Math.pow(10, frequencyData[i] / 20);
      magnitudes[i] = linear;
      totalEnergy += linear;
    }

    if (totalEnergy === 0) return 0;

    const mean = totalEnergy / len;

    // Count bins that are significantly above average (peaks)
    for (let i = 0; i < len; i++) {
      if (magnitudes[i] > mean * 2) {
        peakEnergy += magnitudes[i];
      }
    }

    return this._clamp(peakEnergy / totalEnergy, 0, 1);
  }

  /**
   * Estimate rhythmic complexity from energy variability.
   * High variance in energy over time = more rhythmically complex.
   */
  _computeRhythmicComplexity() {
    if (this.recentEnergies.length < 10) return 0;

    const mean = this.recentEnergies.reduce((a, b) => a + b, 0) / this.recentEnergies.length;
    let variance = 0;
    let diffSum = 0;

    for (let i = 0; i < this.recentEnergies.length; i++) {
      variance += (this.recentEnergies[i] - mean) ** 2;
      if (i > 0) {
        diffSum += Math.abs(this.recentEnergies[i] - this.recentEnergies[i - 1]);
      }
    }

    variance /= this.recentEnergies.length;
    const stdDev = Math.sqrt(variance);
    const avgDiff = diffSum / (this.recentEnergies.length - 1);

    // Combine coefficient of variation + average absolute difference
    const cv = mean > 0 ? stdDev / mean : 0;
    const complexity = this._clamp((cv * 0.6 + avgDiff * 8) * 0.5, 0, 1);

    return complexity;
  }

  /**
   * Exponential moving average.
   */
  _ema(prev, curr) {
    return this.alpha * curr + (1 - this.alpha) * prev;
  }

  /**
   * Clamp value to [min, max].
   */
  _clamp(value, min, max) {
    if (isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Reset all state.
   */
  reset() {
    this.bpmDetector.reset();
    this.recentEnergies = [];
    this.rhythmicComplexity = 0;
    this.frameCount = 0;
    for (const key of Object.keys(this.smoothed)) {
      this.smoothed[key] = 0;
    }
  }
}
