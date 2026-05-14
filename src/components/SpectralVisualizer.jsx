import React, { useRef, useEffect, useState, useCallback } from 'react';

const MODES = ['spectrum', 'waveform'];

export default function SpectralVisualizer({ frequencyData, timeDomainData }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const [mode, setMode] = useState('spectrum');
  const [dimensions, setDimensions] = useState({ width: 600, height: 200 });

  // Track latest data via refs (avoid re-renders from rAF)
  const freqRef = useRef(frequencyData);
  const tdRef = useRef(timeDomainData);

  useEffect(() => { freqRef.current = frequencyData; }, [frequencyData]);
  useEffect(() => { tdRef.current = timeDomainData; }, [timeDomainData]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const height = Math.max(150, Math.min(220, width * 0.35));
        setDimensions({ width, height });
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Drawing loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, width, height);

    // ── Grid overlay ──
    ctx.strokeStyle = 'rgba(192, 192, 192, 0.05)';
    ctx.lineWidth = 1;
    const gridSpacing = 30 * dpr;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (mode === 'spectrum') {
      drawSpectrum(ctx, width, height, dpr);
    } else {
      drawWaveform(ctx, width, height, dpr);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [mode]);

  function drawSpectrum(ctx, width, height, dpr) {
    const data = freqRef.current;
    if (!data || data.length === 0) {
      drawIdleText(ctx, width, height, dpr);
      return;
    }

    const binCount = data.length;
    // Use only lower ~70% of spectrum (most musical content)
    const usableBins = Math.floor(binCount * 0.7);
    const barWidth = width / usableBins;

    for (let i = 0; i < usableBins; i++) {
      // Convert dB to 0-1 range (typical range: -100 to 0 dB)
      const dB = data[i];
      const normalized = Math.max(0, (dB + 100) / 100);
      const barHeight = normalized * height * 0.9;

      // Color gradient based on frequency
      const hue = 15 + (i / usableBins) * 30; // orange-red range
      const saturation = 80 + normalized * 20;
      const lightness = 30 + normalized * 35;

      const x = i * barWidth;
      const y = height - barHeight;

      // Bar gradient
      const grad = ctx.createLinearGradient(x, height, x, y);
      grad.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness * 0.4}%, 0.6)`);
      grad.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.85)`);
      grad.addColorStop(1, `hsla(${hue + 10}, ${saturation}%, ${lightness + 15}%, 1)`);

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, Math.max(barWidth - 1 * dpr, 1), barHeight);

      // Glow on top of each bar
      if (normalized > 0.5) {
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
        ctx.shadowBlur = 8 * dpr;
        ctx.fillRect(x, y, Math.max(barWidth - 1 * dpr, 1), 2 * dpr);
        ctx.shadowBlur = 0;
      }
    }
  }

  function drawWaveform(ctx, width, height, dpr) {
    const data = tdRef.current;
    if (!data || data.length === 0) {
      drawIdleText(ctx, width, height, dpr);
      return;
    }

    const midY = height / 2;
    const step = data.length / width;

    // Glow trail
    ctx.shadowColor = 'rgba(255, 69, 0, 0.4)';
    ctx.shadowBlur = 10 * dpr;
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const idx = Math.floor(x * step);
      const sample = data[idx] || 0;
      const y = midY + sample * midY * 0.9;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Secondary dimmer trace
    ctx.strokeStyle = 'rgba(255, 106, 51, 0.3)';
    ctx.lineWidth = 4 * dpr;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const idx = Math.floor(x * step);
      const sample = data[idx] || 0;
      const y = midY + sample * midY * 0.9;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Center line
    ctx.strokeStyle = 'rgba(192, 192, 192, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
  }

  function drawIdleText(ctx, width, height, dpr) {
    ctx.fillStyle = 'rgba(192, 192, 192, 0.15)';
    ctx.font = `${12 * dpr}px 'Orbitron', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AWAITING SIGNAL...', width / 2, height / 2);
  }

  // Start/stop animation
  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div className="glass-card p-4 sm:p-5">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-ember rounded-full" />
          <h2
            className="text-sm tracking-[0.2em] uppercase text-chrome-dim font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {mode === 'spectrum' ? 'Spectrum' : 'Waveform'}
          </h2>
        </div>
        <button
          id="visualizer-mode-toggle"
          onClick={() => setMode((m) => (m === 'spectrum' ? 'waveform' : 'spectrum'))}
          className="text-[10px] px-3 py-1.5 rounded-md bg-steel-light/50 text-chrome-dim hover:text-chrome hover:bg-steel-light transition-all tracking-wider uppercase border border-chrome-dim/10"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {mode === 'spectrum' ? '〰 Waveform' : '📊 Spectrum'}
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden bg-void/50 border border-chrome-dim/5">
        <canvas
          ref={canvasRef}
          width={dimensions.width * (window.devicePixelRatio || 1)}
          height={dimensions.height * (window.devicePixelRatio || 1)}
          style={{ width: dimensions.width, height: dimensions.height, display: 'block' }}
        />
      </div>
    </div>
  );
}
