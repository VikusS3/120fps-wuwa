import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { DeviceHardwareProfile } from '../lib/detection/types';

interface InspectionStatusProps {
  profile: DeviceHardwareProfile | null;
  isScanning: boolean;
}

export const InspectionStatus: React.FC<InspectionStatusProps> = ({ profile, isScanning }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isScanning) {
    return (
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
          <div>
            <h4 className="text-xs font-semibold text-cyan-200">Inspección de Hardware en Curso</h4>
            <p className="text-[11px] text-cyan-400/80">Consultando adaptadores gráficos WebGL/WebGPU y APIs de pantalla...</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
          Fase A
        </span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="text-xs font-semibold text-slate-300">
            Transparencia de Detección Web: APIs del Navegador
          </h4>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <span>{isExpanded ? 'Ocultar telemetría' : 'Ver telemetría del navegador'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">API Gráfica Utilizada:</span>
              <span className="font-semibold text-cyan-300">{profile.gpu.apiUsed}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cadena cruda: <code className="text-slate-400">{profile.gpu.rendererString}</code>
            </p>
            {profile.gpu.isVirtualRenderer && (
              <p className="text-[11px] text-rose-400 font-medium">
                ⚠️ Adaptador por software detectado (sin aceleración física directa).
              </p>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">navigator.deviceMemory:</span>
              <span className="font-semibold text-indigo-300">
                {profile.ram.estimatedGb.value ? `${profile.ram.estimatedGb.value} GB` : 'No expuesta'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {profile.ram.isCappedByBrowser 
                ? 'Limitada por el navegador a 8 GB para mitigar huella digital (fingerprinting).'
                : 'Lectura aproximada de la memoria física.'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">navigator.hardwareConcurrency:</span>
              <span className="font-semibold text-violet-300">
                {profile.cpu.coresOrThreads.value ? `${profile.cpu.coresOrThreads.value} hilos` : 'Bloqueado'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hilos lógicos reportados. El navegador no expone el modelo comercial de la CPU por razones de privacidad.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">Muestreo de Pantalla (RAF):</span>
              <span className="font-semibold text-teal-300">
                ~{profile.screen.estimatedRefreshRate.value} Hz ({profile.screen.width}x{profile.screen.height})
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Calculado mediante deltas de tiempo de 35 cuadros con requestAnimationFrame.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
