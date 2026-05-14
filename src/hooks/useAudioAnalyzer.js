/**
 * useAudioAnalyzer.js
 * 
 * Custom React hook that orchestrates the full audio analysis pipeline:
 * AudioEngine → FeatureExtractor → GenreMath → UI state
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioEngine } from '../lib/audioEngine.js';
import { FeatureExtractor } from '../lib/featureExtractor.js';
import { classifyGenre } from '../lib/genreMath.js';

export function useAudioAnalyzer() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [features, setFeatures] = useState(null);
  const [genreScores, setGenreScores] = useState(null);
  const [dominant, setDominant] = useState(null);
  const [bpm, setBpm] = useState(0);
  const [bpmValid, setBpmValid] = useState(false);
  const [frequencyData, setFrequencyData] = useState(null);
  const [timeDomainData, setTimeDomainData] = useState(null);

  const engineRef = useRef(null);
  const extractorRef = useRef(null);
  const animFrameRef = useRef(null);
  const latestFeaturesRef = useRef(null);
  const previousScoresRef = useRef(null);

  /**
   * Start the analysis pipeline.
   */
  const start = useCallback(async () => {
    setError(null);

    try {
      const engine = new AudioEngine();
      const extractor = new FeatureExtractor();

      engineRef.current = engine;
      extractorRef.current = extractor;

      // Meyda callback — fires every buffer frame
      await engine.start((meydaFeatures) => {
        latestFeaturesRef.current = meydaFeatures;
      });

      setIsListening(true);

      // Start the render loop
      const renderLoop = () => {
        if (!engineRef.current?.isRunning) return;

        const rawFeatures = latestFeaturesRef.current;
        if (rawFeatures && extractorRef.current) {
          // Get frequency data for visualizer + harmonic analysis
          const freqData = engineRef.current.getFrequencyData();
          const tdData = engineRef.current.getTimeDomainData();

          // Process through feature extractor
          const processed = extractorRef.current.process(rawFeatures, freqData);

          // Classify genre
          const result = classifyGenre(processed, previousScoresRef.current);
          previousScoresRef.current = result.scores;

          // Update state (batched by React)
          setFeatures(processed);
          setGenreScores(result.scores);
          setDominant(result.dominant);
          setBpm(processed.bpm);
          setBpmValid(processed.bpmValid);

          // Clone typed arrays for visualization (they get overwritten)
          if (freqData) setFrequencyData(new Float32Array(freqData));
          if (tdData) setTimeDomainData(new Float32Array(tdData));
        }

        animFrameRef.current = requestAnimationFrame(renderLoop);
      };

      animFrameRef.current = requestAnimationFrame(renderLoop);
    } catch (err) {
      console.error('Audio analysis error:', err);

      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Failed to start audio analysis: ${err.message}`);
      }

      setIsListening(false);
    }
  }, []);

  /**
   * Stop the analysis pipeline.
   */
  const stop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }

    if (extractorRef.current) {
      extractorRef.current.reset();
      extractorRef.current = null;
    }

    latestFeaturesRef.current = null;
    previousScoresRef.current = null;

    setIsListening(false);
    setFeatures(null);
    setGenreScores(null);
    setDominant(null);
    setBpm(0);
    setBpmValid(false);
    setFrequencyData(null);
    setTimeDomainData(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    error,
    features,
    genreScores,
    dominant,
    bpm,
    bpmValid,
    frequencyData,
    timeDomainData,
    start,
    stop,
  };
}
