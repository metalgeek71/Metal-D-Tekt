import React, { useEffect, useState } from 'react';

export default function StatusBar({ bpm, bpmValid, features, isListening }) {
  const [bpmPulse, setBpmPulse] = useState(false);
  const [prevBpm, setPrevBpm] = useState(0);

  useEffect(() => {
    if (bpmValid && Math.abs(bpm - prevBpm) > 2) {
      setBpmPulse(true);
      setPrevBpm(bpm);
      const t = setTimeout(() => setBpmPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [bpm, bpmValid, prevBpm]);

  const centroidHz = features ? Math.round(features.spectralCentroid * 22050) : 0;

  return (
    <div className="glass-card px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-chrome-dim/30'}`} />
          <span className="text-[10px] tracking-[0.15em] uppercase text-chrome-dim" style={{ fontFamily: 'var(--font-display)' }}>
            {isListening ? 'LIVE' : 'IDLE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.15em] uppercase text-chrome-dim" style={{ fontFamily: 'var(--font-display)' }}>BPM</span>
          <span id="bpm-readout" className={`text-lg font-bold tabular-nums ${bpmValid ? 'text-ember' : 'text-chrome-dim/40'} ${bpmPulse ? 'animate-bpm-pulse' : ''}`} style={{ fontFamily: 'var(--font-display)' }}>
            {bpmValid ? Math.round(bpm) : '---'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.15em] uppercase text-chrome-dim" style={{ fontFamily: 'var(--font-display)' }}>Centroid</span>
          <span id="centroid-readout" className="text-sm font-semibold tabular-nums text-chrome" style={{ fontFamily: 'var(--font-display)' }}>
            {features ? `${centroidHz} Hz` : '— Hz'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.15em] uppercase text-chrome-dim" style={{ fontFamily: 'var(--font-display)' }}>Level</span>
          <div className="w-16 h-2 rounded-full bg-steel-light overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 transition-all duration-150" style={{ width: `${Math.min((features?.rms || 0) * 100, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
