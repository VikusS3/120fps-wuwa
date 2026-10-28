import React from 'react';
import { Zap } from 'lucide-react';
import { EvaluationResult, UserHardwareInput } from '../lib/evaluation/types';

interface ExperienceTiersProps {
  result: EvaluationResult;
  input: UserHardwareInput;
}

export const ExperienceTiers: React.FC<ExperienceTiersProps> = ({ result, input }) => {
  const isCompatible = result.verdict === 'compatible';
  const gpuName = (input.gpuModel || '').toLowerCase();

  // Estimación sencilla según categoría de tarjeta gráfica
  const isHighEnd4K = gpuName.includes('4080') || gpuName.includes('4090') || gpuName.includes('7900 xt');
  const isMid1440p = isHighEnd4K || gpuName.includes('4070') || gpuName.includes('3080') || gpuName.includes('7800 xt') || gpuName.includes('6800');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Rendimiento Esperado en 120 FPS
          </h3>
          <p className="text-xs text-slate-400">
            Estimación de resolución recomendada para disfrutar de combates fluidos sin caídas bruscas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tier 1080p */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isCompatible 
            ? 'bg-dark-900/90 border-cyan-500/30 shadow-neon-card' 
            : 'bg-dark-950/60 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-300">1080p (Full HD)</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompatible ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
              {isCompatible ? 'Óptimo' : 'No elegible'}
            </span>
          </div>
          <p className="text-sm font-bold text-white mb-1">Fluidez Máxima</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            120 FPS estables con respuesta inmediata para parries y esquivas en jefes como Holo Mephis.
          </p>
        </div>

        {/* Tier 1440p */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isCompatible && isMid1440p
            ? 'bg-dark-900/90 border-cyan-500/30 shadow-neon-card' 
            : 'bg-dark-950/60 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-300">1440p (2K QHD)</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompatible && isMid1440p ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
              {isCompatible && isMid1440p ? 'Recomendado' : 'Ajustes medios'}
            </span>
          </div>
          <p className="text-sm font-bold text-white mb-1">Equilibrio Gráfico</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gran nitidez visual y 120 FPS activando DLSS o FSR en modo Calidad en mundo abierto.
          </p>
        </div>

        {/* Tier 4K */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isCompatible && isHighEnd4K
            ? 'bg-dark-900/90 border-cyan-500/30 shadow-neon-card' 
            : 'bg-dark-950/60 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-300">4K (Ultra HD)</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompatible && isHighEnd4K ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
              {isCompatible && isHighEnd4K ? 'Gama Alta' : 'Muy exigente'}
            </span>
          </div>
          <p className="text-sm font-bold text-white mb-1">Máxima Fidelidad</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Para monitores 4K con GPUs entusiastas (RTX 4080/4090 o RX 7900 XTX) y sombras optimizadas.
          </p>
        </div>
      </div>
    </div>
  );
};
