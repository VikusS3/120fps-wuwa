import React from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  onRecheck: () => void;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRecheck, isScanning }) => {
  return (
    <header className="border-b border-cyan-500/10 bg-[#020306]/80 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo con Orbitron */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center shadow-neon">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-display font-black text-sm tracking-wider text-white">
            WUWA<span className="text-cyan-400">120</span>
          </span>
        </div>

        {/* Scan Button Minimalista */}
        <button
          onClick={onRecheck}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-cyan-300 text-xs font-gamer font-bold tracking-wide border border-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'ESCANEANDO...' : 'RE-ESCANEAR'}</span>
        </button>
      </div>
    </header>
  );
};
