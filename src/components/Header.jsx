import React from 'react';

/**
 * IndustrialLogo — SVG logo with metallic gradients, rivets, and hazard accents.
 * Renders "METAL D-TEKT" in a brushed-steel industrial style.
 */
function IndustrialLogo() {
  return (
    <svg
      viewBox="0 0 520 100"
      className="w-full max-w-[520px] h-auto mx-auto"
      aria-label="Metal D-Tekt logo"
      role="img"
    >
      <defs>
        {/* Brushed steel gradient for "METAL" */}
        <linearGradient id="steelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="25%" stopColor="#a0a0a0" />
          <stop offset="50%" stopColor="#d4d4d4" />
          <stop offset="75%" stopColor="#888888" />
          <stop offset="100%" stopColor="#b0b0b0" />
        </linearGradient>

        {/* Hot ember gradient for "D-TEKT" */}
        <linearGradient id="emberGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffaa33" />
          <stop offset="40%" stopColor="#ff4500" />
          <stop offset="100%" stopColor="#cc2200" />
        </linearGradient>

        {/* Glow filter for ember text */}
        <filter id="emberGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feFlood floodColor="#ff4500" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle bevel/emboss for metallic depth */}
        <filter id="metalBevel" x="-2%" y="-2%" width="104%" height="104%">
          <feOffset in="SourceAlpha" dx="0" dy="1" result="offTop" />
          <feFlood floodColor="#ffffff" floodOpacity="0.15" result="lightColor" />
          <feComposite in="lightColor" in2="offTop" operator="in" result="topLight" />
          <feOffset in="SourceAlpha" dx="0" dy="-1" result="offBot" />
          <feFlood floodColor="#000000" floodOpacity="0.4" result="darkColor" />
          <feComposite in="darkColor" in2="offBot" operator="in" result="botShadow" />
          <feMerge>
            <feMergeNode in="botShadow" />
            <feMergeNode in="topLight" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Brushed-metal texture pattern */}
        <pattern id="brushed" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="0" y1="2" x2="4" y2="2" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* ── Decorative top bar ── */}
      <rect x="20" y="4" width="480" height="2" rx="1" fill="url(#steelGrad)" opacity="0.2" />

      {/* ── Rivet left ── */}
      <circle cx="14" cy="50" r="5" fill="#333" stroke="#555" strokeWidth="1" />
      <circle cx="14" cy="50" r="2" fill="#222" />

      {/* ── Rivet right ── */}
      <circle cx="506" cy="50" r="5" fill="#333" stroke="#555" strokeWidth="1" />
      <circle cx="506" cy="50" r="2" fill="#222" />

      {/* ── "METAL" — brushed steel ── */}
      <text
        x="30"
        y="68"
        fontSize="56"
        fontFamily="'Orbitron', sans-serif"
        fontWeight="900"
        letterSpacing="6"
        fill="url(#steelGrad)"
        filter="url(#metalBevel)"
      >
        METAL
      </text>
      {/* Brushed overlay on METAL */}
      <text
        x="30"
        y="68"
        fontSize="56"
        fontFamily="'Orbitron', sans-serif"
        fontWeight="900"
        letterSpacing="6"
        fill="url(#brushed)"
      >
        METAL
      </text>

      {/* ── "D-TEKT" — hot ember ── */}
      <text
        x="280"
        y="68"
        fontSize="56"
        fontFamily="'Orbitron', sans-serif"
        fontWeight="900"
        letterSpacing="6"
        fill="url(#emberGrad)"
        filter="url(#emberGlow)"
      >
        D-TEKT
      </text>

      {/* ── Decorative bottom bar ── */}
      <rect x="20" y="82" width="480" height="1" rx="0.5" fill="url(#steelGrad)" opacity="0.15" />

      {/* ── Hazard stripe accent (left) ── */}
      <g opacity="0.25">
        <rect x="30" y="86" width="6" height="4" fill="#ff4500" transform="skewX(-20)" />
        <rect x="40" y="86" width="6" height="4" fill="#ff4500" transform="skewX(-20)" />
        <rect x="50" y="86" width="6" height="4" fill="#ff4500" transform="skewX(-20)" />
      </g>

      {/* ── Hazard stripe accent (right) ── */}
      <g opacity="0.25">
        <rect x="460" y="86" width="6" height="4" fill="#ff4500" transform="skewX(-20)" />
        <rect x="470" y="86" width="6" height="4" fill="#ff4500" transform="skewX(-20)" />
        <rect x="480" y="86" width="6" height="4" fill="#ff4500" transform="skewX(-20)" />
      </g>
    </svg>
  );
}

export default function Header() {
  return (
    <header className="text-center pt-8 pb-4 px-4">
      {/* Decorative top line */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-ember opacity-50" />
        <div className="w-2 h-2 rotate-45 bg-ember opacity-60" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-ember opacity-50" />
      </div>

      {/* SVG Logo */}
      <div className="px-2 sm:px-0">
        <IndustrialLogo />
      </div>

      {/* Tagline */}
      <p
        className="mt-4 text-sm sm:text-base tracking-[0.3em] uppercase text-chrome-dim"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Real-Time Sub-Genre Classification
      </p>

      {/* Bottom accent */}
      <div className="mt-6 mx-auto w-48 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent" />
    </header>
  );
}
