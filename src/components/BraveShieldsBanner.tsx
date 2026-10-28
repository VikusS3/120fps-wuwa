import React, { useState } from 'react';
import { ShieldAlert, X, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface BraveShieldsBannerProps {
  onOpenGpuModal: () => void;
}

export const BraveShieldsBanner: React.FC<BraveShieldsBannerProps> = ({ onOpenGpuModal }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-dark-900 to-dark-950 p-4 shadow-neon-card animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-display text-xs font-bold text-amber-300 tracking-wider uppercase">
                Escudos de Brave Detectados
              </span>
              <span className="text-[10px] font-gamer font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Privacidad Activa
              </span>
            </div>
            <p className="text-xs font-gamer text-slate-300 leading-relaxed max-w-xl">
              Brave protege tu huella digital bloqueando el acceso a tu GPU física. Puedes seleccionar tu modelo abajo en 1 clic o pausar los escudos en el icono del león para autodetectar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={onOpenGpuModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-display text-xs font-bold uppercase transition-all shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Elegir mi GPU</span>
            <ChevronRight className="w-3 h-3" />
          </button>
          
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            title="Descartar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
