/**
 * audioEngine.js
 * 
 * Creates and manages the Web Audio API graph for real-time microphone analysis.
 * Pipeline: Microphone → MediaStreamSource → AnalyserNode → (no destination)
 *                                                  ↓
 *                                            Meyda Analyzer
 */
import Meyda from 'meyda';

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.analyserNode = null;
    this.sourceNode = null;
    this.meydaAnalyzer = null;
    this.stream = null;
    this.isRunning = false;
    this.onFeatures = null;

    // AnalyserNode config
    this.fftSize = 2048;
    this.smoothingTimeConstant = 0.8;

    // Buffers for visualization
    this.frequencyData = null;
    this.timeDomainData = null;
  }

  /**
   * Request microphone access and initialize the audio pipeline.
   * @param {Function} onFeatures - Callback receiving Meyda feature frames
   * @returns {Promise<void>}
   */
  async start(onFeatures) {
    if (this.isRunning) return;

    this.onFeatures = onFeatures;

    // Request mic
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    // Create AudioContext
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 44100,
    });

    // Create source from mic stream
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);

    // Create AnalyserNode for visualization data
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.fftSize;
    this.analyserNode.smoothingTimeConstant = this.smoothingTimeConstant;

    // Connect source → analyser (NOT to destination — avoids feedback)
    this.sourceNode.connect(this.analyserNode);

    // Allocate typed arrays for visualization
    this.frequencyData = new Float32Array(this.analyserNode.frequencyBinCount);
    this.timeDomainData = new Float32Array(this.analyserNode.fftSize);

    // Initialize Meyda analyzer
    this.meydaAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext: this.audioContext,
      source: this.sourceNode,
      bufferSize: 512,
      featureExtractors: [
        'rms',
        'energy',
        'spectralCentroid',
        'spectralRolloff',
        'spectralFlatness',
        'spectralSpread',
        'zcr',
      ],
      callback: (features) => {
        if (this.onFeatures && features) {
          this.onFeatures(features);
        }
      },
    });

    this.meydaAnalyzer.start();
    this.isRunning = true;
  }

  /**
   * Get current frequency domain data (for spectrum visualizer).
   * @returns {Float32Array}
   */
  getFrequencyData() {
    if (this.analyserNode && this.frequencyData) {
      this.analyserNode.getFloatFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
  }

  /**
   * Get current time domain data (for waveform visualizer).
   * @returns {Float32Array}
   */
  getTimeDomainData() {
    if (this.analyserNode && this.timeDomainData) {
      this.analyserNode.getFloatTimeDomainData(this.timeDomainData);
    }
    return this.timeDomainData;
  }

  /**
   * Get the sample rate of the audio context.
   */
  getSampleRate() {
    return this.audioContext ? this.audioContext.sampleRate : 44100;
  }

  /**
   * Stop analysis and release all resources.
   */
  stop() {
    if (this.meydaAnalyzer) {
      this.meydaAnalyzer.stop();
      this.meydaAnalyzer = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.frequencyData = null;
    this.timeDomainData = null;
    this.isRunning = false;
    this.onFeatures = null;
  }
}
