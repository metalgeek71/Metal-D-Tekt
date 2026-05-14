/**
 * bpmDetector.js
 * 
 * Lightweight onset-energy BPM estimator.
 * Uses rolling energy buffer with peak detection and inter-onset interval analysis.
 */

export class BPMDetector {
  constructor(sampleRate = 44100, bufferSize = 512) {
    this.sampleRate = sampleRate;
    this.bufferSize = bufferSize;

    // Rolling energy buffer (~4 seconds of frames at ~86 fps for 512-sample buffers)
    this.maxFrames = Math.ceil((4 * sampleRate) / bufferSize);
    this.energyBuffer = [];
    this.timestamps = [];

    // Peak detection
    this.onsetTimes = [];
    this.lastOnsetTime = 0;
    this.minOnsetInterval = 0.2; // 300 BPM max

    // Smoothed output
    this.currentBPM = 0;
    this.smoothingAlpha = 0.08;

    // Frame counter for timing
    this.frameCount = 0;
  }

  /**
   * Process a new energy value from the audio frame.
   * @param {number} energy - RMS or energy value from Meyda
   * @returns {number} Current smoothed BPM estimate
   */
  process(energy) {
    const now = performance.now() / 1000; // seconds

    // Add to rolling buffer
    this.energyBuffer.push(energy);
    this.timestamps.push(now);

    // Trim to max length
    if (this.energyBuffer.length > this.maxFrames) {
      this.energyBuffer.shift();
      this.timestamps.shift();
    }

    // Need at least 20 frames for stats
    if (this.energyBuffer.length < 20) {
      return this.currentBPM;
    }

    // Calculate mean and standard deviation
    const mean = this.energyBuffer.reduce((a, b) => a + b, 0) / this.energyBuffer.length;
    let variance = 0;
    for (let i = 0; i < this.energyBuffer.length; i++) {
      variance += (this.energyBuffer[i] - mean) ** 2;
    }
    variance /= this.energyBuffer.length;
    const stdDev = Math.sqrt(variance);

    // Adaptive threshold for onset detection (stricter)
    const threshold = mean + 1.5 * stdDev;

    // Check if current frame is an onset
    const isOnset = energy > threshold && (now - this.lastOnsetTime) > this.minOnsetInterval;

    if (isOnset) {
      this.lastOnsetTime = now;
      this.onsetTimes.push(now);

      // Keep recent onsets (increased to 12 seconds for better stability)
      while (this.onsetTimes.length > 1 && (now - this.onsetTimes[0]) > 12) {
        this.onsetTimes.shift();
      }
    }

    // Calculate BPM from inter-onset intervals
    if (this.onsetTimes.length >= 4) {
      const intervals = [];
      // Calculate intervals between adjacent onsets
      for (let i = 1; i < this.onsetTimes.length; i++) {
        intervals.push(this.onsetTimes[i] - this.onsetTimes[i - 1]);
      }

      // Sort and take the median interval to filter outliers
      intervals.sort((a, b) => a - b);
      const medianIdx = Math.floor(intervals.length / 2);
      const medianInterval = intervals[medianIdx];

      if (medianInterval > 0) {
        let rawBPM = 60 / medianInterval;

        // Smart octave correction: try to align with established BPM
        if (this.currentBPM > 0) {
          // If the new BPM is roughly half the current, double it
          while (rawBPM < this.currentBPM * 0.65) rawBPM *= 2;
          // If the new BPM is roughly double the current, halve it
          while (rawBPM > this.currentBPM * 1.6) rawBPM /= 2;
        } else {
          // Initial bounds
          while (rawBPM > 200) rawBPM /= 2;
          while (rawBPM < 60) rawBPM *= 2;
        }

        // Clamp to absolute bounds for metal (usually 60-240)
        rawBPM = Math.max(60, Math.min(240, rawBPM));

        // Heavier exponential smoothing for stability
        if (this.currentBPM === 0) {
          this.currentBPM = rawBPM;
        } else {
          // Use smaller alpha (slower adaptation) once locked in
          const alpha = 0.03; 
          this.currentBPM = alpha * rawBPM + (1 - alpha) * this.currentBPM;
        }
      }
    }

    return this.currentBPM;
  }

  /**
   * Get the current BPM estimate.
   */
  getBPM() {
    return Math.round(this.currentBPM);
  }

  /**
   * Check if we have a valid BPM reading.
   */
  isValid() {
    return this.onsetTimes.length >= 3 && this.currentBPM > 0;
  }

  /**
   * Reset the detector state.
   */
  reset() {
    this.energyBuffer = [];
    this.timestamps = [];
    this.onsetTimes = [];
    this.lastOnsetTime = 0;
    this.currentBPM = 0;
    this.frameCount = 0;
  }
}
