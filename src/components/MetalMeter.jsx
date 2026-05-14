import React from 'react';
import { getGenreMeta } from '../lib/genreMath.js';

const COLOR_MAP = {
  yellow: { text: 'text-yellow-300', bg: 'bg-yellow-900/20', from: '#ffd700', to: '#ffaa00', shadow: 'rgba(255,215,0,0.25)' },
  orange: { text: 'text-orange-300', bg: 'bg-orange-900/20', from: '#ff8c00', to: '#cc5500', shadow: 'rgba(255,140,0,0.25)' },
  red: { text: 'text-red-400', bg: 'bg-red-900/20', from: '#dc143c', to: '#8b0000', shadow: 'rgba(220,20,60,0.25)' },
  green: { text: 'text-green-300', bg: 'bg-green-900/20', from: '#32cd32', to: '#006400', shadow: 'rgba(50,205,50,0.25)' },
  blue: { text: 'text-blue-300', bg: 'bg-blue-900/20', from: '#1e90ff', to: '#00008b', shadow: 'rgba(30,144,255,0.25)' },
  indigo: { text: 'text-indigo-300', bg: 'bg-indigo-900/20', from: '#7b68ee', to: '#4a3aad', shadow: 'rgba(123,104,238,0.25)' },
  purple: { text: 'text-purple-300', bg: 'bg-purple-900/20', from: '#9370db', to: '#4b0082', shadow: 'rgba(147,112,219,0.25)' },
  fuchsia: { text: 'text-fuchsia-300', bg: 'bg-fuchsia-900/20', from: '#ff00ff', to: '#8b008b', shadow: 'rgba(255,0,255,0.25)' },
  pink: { text: 'text-pink-300', bg: 'bg-pink-900/20', from: '#ff69b4', to: '#c71585', shadow: 'rgba(255,105,180,0.25)' },
  rose: { text: 'text-rose-300', bg: 'bg-rose-900/20', from: '#ff1493', to: '#8b0000', shadow: 'rgba(255,20,147,0.25)' },
  stone: { text: 'text-stone-300', bg: 'bg-stone-900/20', from: '#a8a29e', to: '#57534e', shadow: 'rgba(168,162,158,0.25)' },
  gray: { text: 'text-gray-300', bg: 'bg-gray-900/20', from: '#9ca3af', to: '#374151', shadow: 'rgba(156,163,175,0.25)' },
  slate: { text: 'text-slate-300', bg: 'bg-slate-900/20', from: '#94a3b8', to: '#334155', shadow: 'rgba(148,163,184,0.25)' },
};

export default function MetalMeter({ scores, dominant }) {
  // Extract top 5 genres
  const topGenres = React.useMemo(() => {
    if (!scores) return [];
    
    // Convert scores object to array of { key, score }
    const scoreArray = Object.entries(scores).map(([key, score]) => ({ key, score }));
    
    // Sort descending by score
    scoreArray.sort((a, b) => b.score - a.score);
    
    // Return top 5
    return scoreArray.slice(0, 5);
  }, [scores]);

  return (
    <div className="glass-card p-5 sm:p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-ember/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      {/* Section title */}
      <div className="flex items-center gap-3 mb-6 relative">
        <div className="w-1.5 h-6 bg-gradient-to-b from-ember to-red-700 rounded-full shadow-[0_0_8px_rgba(255,69,0,0.5)]" />
        <h2
          className="text-sm tracking-[0.2em] uppercase text-chrome font-semibold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Top 5 Sub-Genres detected
        </h2>
      </div>

      {/* Genre bars */}
      <div className="space-y-5 relative">
        {topGenres.length === 0 && (
          <div className="text-center py-6 text-chrome-dim text-sm italic">
            Waiting for audio signal...
          </div>
        )}
        
        {topGenres.map(({ key, score }, index) => {
          const meta = getGenreMeta(key);
          const colorTheme = COLOR_MAP[meta.color] || COLOR_MAP.red;
          const isDominant = index === 0;

          return (
            <div
              key={key}
              id={`genre-bar-${key}`}
              className={`transition-all duration-500 ${isDominant ? 'scale-[1.02] opacity-100' : 'opacity-80'}`}
              style={{ transformOrigin: 'left center' }}
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`text-lg sm:text-xl drop-shadow-md ${isDominant ? 'animate-bounce' : ''}`} role="img" aria-label={meta.label}>
                    {meta.emoji}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold tracking-wider uppercase ${colorTheme.text} drop-shadow-sm`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {meta.label}
                  </span>
                  {isDominant && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-ember/10 text-ember font-bold tracking-widest uppercase border border-ember/30 shadow-[0_0_5px_rgba(255,69,0,0.2)]">
                      Dominant
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm sm:text-base font-black tabular-nums ${colorTheme.text}`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {score > 0 ? `${score.toFixed(1)}%` : '—'}
                </span>
              </div>

              {/* Bar track */}
              <div className={`relative h-3 sm:h-3.5 rounded-full overflow-hidden ${colorTheme.bg} border border-white/5`}>
                {/* Filled bar */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${isDominant ? 'bar-shimmer' : ''}`}
                  style={{ 
                    width: `${Math.max(score, 1)}%`,
                    background: `linear-gradient(90deg, ${colorTheme.from}, ${colorTheme.to}, ${colorTheme.from})`,
                    backgroundSize: '200% 100%',
                    boxShadow: isDominant ? `0 0 12px ${colorTheme.shadow}` : 'none'
                  }}
                />
                {/* Subtle grid overlay on track */}
                <div
                  className="absolute inset-0 opacity-[0.15]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.5) 8px, rgba(255,255,255,0.5) 9px)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
