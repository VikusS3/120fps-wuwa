import React, { useState } from 'react';
import { X, HelpCircle, Save, RotateCcw } from 'lucide-react';
import { UserHardwareInput } from '../lib/evaluation/types';
import { FormFactor } from '../data/compatibility/types';
import { POPULAR_CPUS, POPULAR_GPUS } from '../data/compatibility/hardwareOptions';
import { SearchableSelect } from './SearchableSelect';

interface ManualEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInput: UserHardwareInput;
  onSave: (updated: UserHardwareInput) => void;
  onResetToDetected: () => void;
}

export const ManualEditModal: React.FC<ManualEditModalProps> = ({
  isOpen,
  onClose,
  currentInput,
  onSave,
  onResetToDetected
}) => {
  if (!isOpen) return null;

  const [gpuModel, setGpuModel] = useState(currentInput.gpuModel);
  const [gpuFormFactor, setGpuFormFactor] = useState<FormFactor>(currentInput.gpuFormFactor);
  const [cpuModel, setCpuModel] = useState(currentInput.cpuModel);
  const [cpuFormFactor, setCpuFormFactor] = useState<FormFactor>(currentInput.cpuFormFactor);
  const [ramGb, setRamGb] = useState<number>(currentInput.ramGb);
  const [screenRefreshRateHz, setScreenRefreshRateHz] = useState<number>(currentInput.screenRefreshRateHz);
  const [showWindowsHelp, setShowWindowsHelp] = useState(false);

  const handleSave = () => {
    onSave({
      gpuModel: gpuModel.trim(),
      gpuFormFactor,
      cpuModel: cpuModel.trim(),
      cpuFormFactor,
      ramGb,
      osName: currentInput.osName || 'Windows 10 / 11 (64-bit)',
      screenRefreshRateHz
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#070a10] border border-cyan-500/30 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-neon-strong overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/10 flex items-center justify-between bg-dark-950/80">
          <div>
            <h2 className="text-base font-bold text-white">
              Ajustar Componentes de Hardware
            </h2>
            <p className="text-xs text-slate-400">
              Escribe o busca tu modelo exacto para verificar la compatibilidad de Kuro Games.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Tarjeta Gráfica con SearchableSelect */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">1. Gráfica</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGpuFormFactor('desktop')}
                  className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                    gpuFormFactor === 'desktop' 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                      : 'bg-dark-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Escritorio
                </button>
                <button
                  type="button"
                  onClick={() => setGpuFormFactor('laptop')}
                  className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                    gpuFormFactor === 'laptop' 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                      : 'bg-dark-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Laptop
                </button>
              </div>
            </div>

            <SearchableSelect
              label="Tarjeta Gráfica (GPU)"
              value={gpuModel}
              onChange={(val) => setGpuModel(val)}
              options={POPULAR_GPUS}
              placeholder="Buscar o escribir GPU (ej. RTX 4060, Vega 8...)"
            />
          </div>

          {/* Procesador con SearchableSelect */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">2. Procesador</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCpuFormFactor('desktop')}
                  className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                    cpuFormFactor === 'desktop' 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                      : 'bg-dark-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Escritorio
                </button>
                <button
                  type="button"
                  onClick={() => setCpuFormFactor('laptop')}
                  className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                    cpuFormFactor === 'laptop' 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                      : 'bg-dark-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Laptop
                </button>
              </div>
            </div>

            <SearchableSelect
              label="Procesador (CPU)"
              value={cpuModel}
              onChange={(val) => setCpuModel(val)}
              options={POPULAR_CPUS}
              placeholder="Buscar o escribir CPU (ej. AMD Ryzen 5 3500U, i7-13700H...)"
            />
          </div>

          {/* RAM y Frecuencia Monitor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Memoria RAM
              </label>
              <select
                value={ramGb}
                onChange={(e) => setRamGb(Number(e.target.value))}
                className="w-full bg-[#030508] border border-cyan-500/20 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none text-xs transition-colors"
              >
                <option value={16}>16 GB (Recomendado)</option>
                <option value={8}>8 GB (Mínimo)</option>
                <option value={32}>32 GB</option>
                <option value={64}>64 GB</option>
                <option value={4}>4 GB</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Monitor (Hz)
              </label>
              <select
                value={screenRefreshRateHz}
                onChange={(e) => setScreenRefreshRateHz(Number(e.target.value))}
                className="w-full bg-[#030508] border border-cyan-500/20 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none text-xs transition-colors"
              >
                <option value={144}>144 Hz (Gaming)</option>
                <option value={120}>120 Hz (Gaming)</option>
                <option value={165}>165 Hz (Gaming)</option>
                <option value={240}>240 Hz o más</option>
                <option value={60}>60 Hz (Estándar)</option>
                <option value={75}>75 Hz</option>
              </select>
            </div>
          </div>

          {/* Guía rápida de Windows */}
          <div className="pt-2 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setShowWindowsHelp(!showWindowsHelp)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>¿Cómo ver tus componentes en Windows?</span>
            </button>

            {showWindowsHelp && (
              <div className="mt-2.5 p-3 rounded-xl bg-dark-950 border border-cyan-500/10 text-xs text-slate-300 space-y-1">
                <p>
                  Abre el <strong>Administrador de tareas</strong> (<kbd className="px-1 py-0.5 rounded bg-dark-800 text-cyan-300 font-mono text-[10px]">Ctrl + Shift + Esc</kbd>) &gt; pestaña <strong>Rendimiento</strong>. Allí verás tu modelo exacto de CPU y GPU.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-500/10 flex items-center justify-between bg-dark-950/80">
          <button
            type="button"
            onClick={onResetToDetected}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-dark-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-black font-extrabold text-xs transition-all shadow-neon"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Analizar Hardware</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
