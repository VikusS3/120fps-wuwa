import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Copy, 
  SlidersHorizontal, 
  Layers, 
  Cpu, 
  HardDrive, 
  Monitor,
  Flame
} from 'lucide-react';
import { EvaluationResult, UserHardwareInput } from '../lib/evaluation/types';
import { formatReportAsPlainText } from '../lib/evaluation/evaluator';

interface VerdictBannerProps {
  result: EvaluationResult;
  input: UserHardwareInput;
  onOpenEditModal: () => void;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ result, input, onOpenEditModal }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const reportText = formatReportAsPlainText(result, input);
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompatible = result.verdict === 'compatible';
  const isIncompatible = result.verdict === 'incompatible';

  const gpuReq = result.requirements.find(r => r.id === 'gpu');
  const cpuReq = result.requirements.find(r => r.id === 'cpu');
  const ramReq = result.requirements.find(r => r.id === 'ram');
  const screenReq = result.requirements.find(r => r.id === 'screen');

  // Estimación de resolución
  const gpuName = (input.gpuModel || '').toLowerCase();
  const isHighEnd4K = gpuName.includes('4080') || gpuName.includes('4090') || gpuName.includes('7900 xt');
  const isMid1440p = isHighEnd4K || gpuName.includes('4070') || gpuName.includes('3080') || gpuName.includes('7800 xt') || gpuName.includes('6800');

  return (
    <div className={`relative rounded-3xl border ${
      isCompatible 
        ? 'border-cyan-400/50 shadow-neon-strong bg-gradient-to-b from-[#04121d] via-[#050912] to-[#020306]' 
        : isIncompatible
          ? 'border-rose-500/40 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] bg-gradient-to-b from-[#180509] via-[#090508] to-[#020306]'
          : 'border-cyan-500/20 shadow-neon-card bg-[#06080e]'
    } p-6 sm:p-8 backdrop-blur-xl transition-all duration-300`}>

      {/* Main HUD Badge */}
      <div className="flex flex-col items-center text-center space-y-2 mb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full border text-xs font-display tracking-widest uppercase font-bold ${
          isCompatible 
            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/40 shadow-neon' 
            : isIncompatible
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/40'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isCompatible ? 'bg-cyan-400 animate-ping' : isIncompatible ? 'bg-rose-400' : 'bg-cyan-400'}`} />
          {isCompatible && 'ESTATUS OFICIAL: APTO 120 FPS'}
          {isIncompatible && 'ESTATUS OFICIAL: NO APTO'}
          {!isCompatible && !isIncompatible && 'ESPECIFICA TU PROCESADOR'}
        </div>

        <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white uppercase mt-1">
          {isCompatible && (
            <span>TU PC PUEDE ACTIVAR <span className="text-cyan-400">120 FPS</span></span>
          )}
          {isIncompatible && (
            <span>OPCIÓN DE 120 FPS <span className="text-rose-400">BLOQUEADA</span></span>
          )}
          {!isCompatible && !isIncompatible && (
            <span>COMPRUEBA TU <span className="text-cyan-400">PROCESADOR</span></span>
          )}
        </h2>

        <p className="text-sm font-gamer font-semibold text-slate-300 max-w-xl leading-relaxed">
          {result.verdictDescription}
        </p>
      </div>

      {/* 4 Interactive Hardware Slots (HUD Gamer Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Slot GPU */}
        <button
          type="button"
          onClick={onOpenEditModal}
          className="group text-left p-3.5 rounded-2xl bg-[#030508]/80 hover:bg-dark-800 border border-cyan-500/15 hover:border-cyan-400/60 transition-all shadow-inner relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <div className="flex items-center gap-1.5 font-display text-[11px] tracking-wider text-slate-400 group-hover:text-cyan-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>GPU</span>
            </div>
            {gpuReq?.status === 'confirmed_compatible' && <Check className="w-4 h-4 text-cyan-400" />}
            {gpuReq?.status === 'confirmed_incompatible' && <X className="w-4 h-4 text-rose-400" />}
            {gpuReq?.status === 'unknown' && <span className="text-xs font-display text-cyan-400">?</span>}
          </div>
          <p className="text-sm font-gamer font-bold text-white truncate" title={input.gpuModel || 'Seleccionar'}>
            {input.gpuModel ? input.gpuModel.replace(/NVIDIA |AMD |GeForce /g, '') : 'Elegir GPU'}
          </p>
          <span className="text-[10px] font-gamer text-cyan-500/70 uppercase">
            {input.gpuFormFactor === 'laptop' ? 'Laptop' : 'Escritorio'}
          </span>
        </button>

        {/* Slot CPU */}
        <button
          type="button"
          onClick={onOpenEditModal}
          className="group text-left p-3.5 rounded-2xl bg-[#030508]/80 hover:bg-dark-800 border border-cyan-500/15 hover:border-cyan-400/60 transition-all shadow-inner relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <div className="flex items-center gap-1.5 font-display text-[11px] tracking-wider text-slate-400 group-hover:text-cyan-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU</span>
            </div>
            {cpuReq?.status === 'confirmed_compatible' && <Check className="w-4 h-4 text-cyan-400" />}
            {cpuReq?.status === 'confirmed_incompatible' && <X className="w-4 h-4 text-rose-400" />}
            {cpuReq?.status === 'unknown' && <span className="text-xs font-display text-cyan-400">?</span>}
          </div>
          <p className="text-sm font-gamer font-bold text-white truncate" title={input.cpuModel || 'Seleccionar'}>
            {input.cpuModel ? input.cpuModel.replace(/Intel Core |AMD /g, '') : 'Elegir CPU'}
          </p>
          <span className="text-[10px] font-gamer text-cyan-500/70 uppercase">
            {input.cpuFormFactor === 'laptop' ? 'Laptop' : 'Escritorio'}
          </span>
        </button>

        {/* Slot RAM */}
        <button
          type="button"
          onClick={onOpenEditModal}
          className="group text-left p-3.5 rounded-2xl bg-[#030508]/80 hover:bg-dark-800 border border-cyan-500/15 hover:border-cyan-400/60 transition-all shadow-inner"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <div className="flex items-center gap-1.5 font-display text-[11px] tracking-wider text-slate-400 group-hover:text-cyan-300">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>RAM</span>
            </div>
            {ramReq?.status === 'confirmed_compatible' && <Check className="w-4 h-4 text-cyan-400" />}
            {ramReq?.status !== 'confirmed_compatible' && <span className="text-xs font-gamer text-cyan-400">8GB</span>}
          </div>
          <p className="text-sm font-gamer font-bold text-white">
            {input.ramGb} GB
          </p>
          <span className="text-[10px] font-gamer text-cyan-500/70 uppercase">
            {input.ramGb >= 16 ? 'Óptima' : 'Mínima'}
          </span>
        </button>

        {/* Slot Pantalla */}
        <button
          type="button"
          onClick={onOpenEditModal}
          className="group text-left p-3.5 rounded-2xl bg-[#030508]/80 hover:bg-dark-800 border border-cyan-500/15 hover:border-cyan-400/60 transition-all shadow-inner"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <div className="flex items-center gap-1.5 font-display text-[11px] tracking-wider text-slate-400 group-hover:text-cyan-300">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>HZ</span>
            </div>
            {screenReq?.status === 'confirmed_compatible' ? (
              <Check className="w-4 h-4 text-cyan-400" />
            ) : (
              <span className="text-xs font-gamer text-slate-500">60Hz</span>
            )}
          </div>
          <p className="text-sm font-gamer font-bold text-white">
            {input.screenRefreshRateHz} Hz
          </p>
          <span className="text-[10px] font-gamer text-cyan-500/70 uppercase">
            {input.screenRefreshRateHz >= 120 ? 'Gaming' : 'Estándar'}
          </span>
        </button>
      </div>

      {/* Resolution Tiers Compact Bar */}
      <div className="p-3.5 rounded-2xl bg-[#030508]/60 border border-cyan-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-6">
        <span className="font-display text-[11px] tracking-wider text-cyan-300 uppercase flex items-center gap-1.5 shrink-0">
          <Flame className="w-3.5 h-3.5 text-cyan-400" />
          Rendimiento por Resolución:
        </span>
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end w-full sm:w-auto font-gamer font-bold">
          <span className={`px-2.5 py-1 rounded-lg border text-xs ${isCompatible ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-dark-950 text-slate-500 border-slate-800'}`}>
            1080p: {isCompatible ? 'Fluido (120 FPS)' : 'Bloqueado'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border text-xs ${isCompatible && isMid1440p ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-dark-950 text-slate-500 border-slate-800'}`}>
            1440p: {isCompatible && isMid1440p ? 'Equilibrado' : 'Medio'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border text-xs ${isCompatible && isHighEnd4K ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-dark-950 text-slate-500 border-slate-800'}`}>
            4K: {isCompatible && isHighEnd4K ? 'Alto' : 'Muy exigente'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-cyan-500/10">
        <p className="text-xs font-gamer text-slate-400 text-center sm:text-left">
          Haz clic en cualquier componente para cambiarlo y ver el veredicto en tiempo real.
        </p>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenEditModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-display text-xs font-bold tracking-wider uppercase border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>AJUSTAR HARDWARE</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-black font-display text-xs font-black tracking-wider uppercase transition-all shadow-neon"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>¡COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-black" />
                <span>COMPARTIR</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
