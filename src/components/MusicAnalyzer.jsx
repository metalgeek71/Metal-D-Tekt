import React from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer.js';
import MetalMeter from './MetalMeter.jsx';
import SpectralVisualizer from './SpectralVisualizer.jsx';
import StatusBar from './StatusBar.jsx';

export default function MusicAnalyzer() {
  const {
    isListening, error, features, genreScores, dominant,
    bpm, bpmValid, frequencyData, timeDomainData, start, stop,
  } = useAudioAnalyzer();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-5 animate-fade-in-up">
      {/* Error state */}
      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-950/20">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Start / Stop button */}
      <div className="flex justify-center py-4">
        {!isListening ? (
          <button id="start-btn" onClick={start} className="btn-ember text-base sm:text-lg px-8 py-4">
            🎤 Start Analyzing
          </button>
        ) : (
          <button id="stop-btn" onClick={stop} className="btn-ember btn-stop text-sm px-6 py-3">
            ■ Stop
          </button>
        )}
      </div>

      {/* Live analysis UI — only visible when listening */}
      {isListening && (
        <div className="space-y-4 animate-fade-in-up">
          <StatusBar bpm={bpm} bpmValid={bpmValid} features={features} isListening={isListening} />
          <SpectralVisualizer frequencyData={frequencyData} timeDomainData={timeDomainData} />
          <MetalMeter scores={genreScores} dominant={dominant} />

          {/* Feature debug (collapsed by default) */}
          <details className="glass-card p-4 text-[11px]">
            <summary className="cursor-pointer text-chrome-dim tracking-wider uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              Raw Features
            </summary>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-chrome-dim font-mono">
              {features && Object.entries(features).map(([k, v]) => (
                <div key={k}>
                  <span className="text-chrome-dim/50">{k}: </span>
                  <span className="text-chrome">{typeof v === 'number' ? v.toFixed(4) : String(v)}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Idle hint */}
      {!isListening && !error && (
        <p className="text-center text-sm text-chrome-dim/50 mt-2">
          Play metal through your speakers and hit <strong className="text-chrome-dim">Start Analyzing</strong> to decode the sub-genre.
        </p>
      )}
    </div>
  );
}
