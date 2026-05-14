import React from 'react';
import Header from './components/Header.jsx';
import MusicAnalyzer from './components/MusicAnalyzer.jsx';

export default function App() {
  return (
    <div className="min-h-dvh bg-void flex flex-col items-center pb-12">
      <Header />
      <main className="w-full flex-1 mt-4">
        <MusicAnalyzer />
      </main>
      <footer className="mt-12 text-center text-[10px] text-chrome-dim/30 tracking-wider uppercase" style={{ fontFamily: 'var(--font-display)' }}>
        Metal D-Tekt v1.0 — Spectral Analysis Engine
      </footer>
    </div>
  );
}
