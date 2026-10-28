import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VerdictBanner } from './components/VerdictBanner';
import { ManualEditModal } from './components/ManualEditModal';
import { SourcesSection } from './components/SourcesSection';
import { runFullHardwareInspection } from './lib/detection';
import { DeviceHardwareProfile } from './lib/detection/types';
import { UserHardwareInput, EvaluationResult } from './lib/evaluation/types';
import { evaluateHardware } from './lib/evaluation/evaluator';
import { ChevronDown, ChevronUp, BookOpen, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<DeviceHardwareProfile | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showSources, setShowSources] = useState<boolean>(false);

  // Estado del hardware
  const [hardwareInput, setHardwareInput] = useState<UserHardwareInput>({
    gpuModel: '',
    gpuFormFactor: 'desktop',
    cpuModel: '',
    cpuFormFactor: 'desktop',
    ramGb: 16,
    osName: 'Windows 10 / 11 (64-bit)',
    screenRefreshRateHz: 60
  });

  // Resultado de la evaluación
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Escaneo inicial
  const performHardwareScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const detected = await runFullHardwareInspection();
      setProfile(detected);

      const isLaptopGpu = detected.gpu.model.value.toLowerCase().includes('laptop') || 
                          detected.gpu.rendererString.toLowerCase().includes('mobile');

      const initialInput: UserHardwareInput = {
        gpuModel: detected.gpu.model.value !== 'No detectada' ? detected.gpu.model.value : '',
        gpuFormFactor: isLaptopGpu ? 'laptop' : 'desktop',
        cpuModel: '',
        cpuFormFactor: isLaptopGpu ? 'laptop' : 'desktop',
        ramGb: detected.ram.estimatedGb.value >= 8 ? 16 : (detected.ram.estimatedGb.value || 8),
        osName: detected.os.osName.value !== 'Desconocido' ? detected.os.osName.value : 'Windows 10 / 11 (64-bit)',
        screenRefreshRateHz: detected.screen.estimatedRefreshRate.value || 60
      };

      setHardwareInput(initialInput);
      const evalResult = evaluateHardware(initialInput);
      setEvaluation(evalResult);
    } catch (err) {
      console.error('Error durante la detección de hardware:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    performHardwareScan();
  }, [performHardwareScan]);

  const handleSaveHardware = (updated: UserHardwareInput) => {
    setHardwareInput(updated);
    const evalResult = evaluateHardware(updated);
    setEvaluation(evalResult);
  };

  const handleResetToDetected = () => {
    if (profile) {
      const resetInput: UserHardwareInput = {
        gpuModel: profile.gpu.model.value !== 'No detectada' ? profile.gpu.model.value : '',
        gpuFormFactor: 'desktop',
        cpuModel: '',
        cpuFormFactor: 'desktop',
        ramGb: profile.ram.estimatedGb.value || 8,
        osName: profile.os.osName.value !== 'Desconocido' ? profile.os.osName.value : 'Windows 10 / 11 (64-bit)',
        screenRefreshRateHz: profile.screen.estimatedRefreshRate.value || 60
      };
      setHardwareInput(resetInput);
      setEvaluation(evaluateHardware(resetInput));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#020306] text-slate-100 font-gamer selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header onRecheck={performHardwareScan} isScanning={isScanning} />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 sm:px-6 w-full space-y-8 flex-1 flex flex-col justify-center">
        {/* Hero Gamer Heading */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-display tracking-widest uppercase">
            <span>KURO GAMES • PC WHITELIST CHECKER</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white uppercase">
            ¿TU PC CORRE <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">120 FPS</span>?
          </h1>
          <p className="text-sm font-gamer font-semibold text-slate-400 max-w-md mx-auto">
            Diagnóstico instantáneo de GPU y CPU para desbloquear la opción oficial de 120 cuadros en Wuthering Waves.
          </p>
        </div>

        {/* HUD Gamer Central Console */}
        {evaluation && (
          <VerdictBanner
            result={evaluation}
            input={hardwareInput}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        )}

        {/* Desplegable discreto de fuentes oficiales */}
        <div className="pt-2">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-2 text-xs font-display tracking-wider uppercase text-cyan-400/80 hover:text-cyan-300 transition-colors mx-auto py-2 px-4 rounded-full border border-cyan-500/20 hover:border-cyan-400/40 bg-[#030508]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showSources ? 'OCULTAR FUENTES OFICIALES' : 'VER NOTAS OFICIALES DE KURO GAMES'}</span>
            {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSources && (
            <div className="mt-6">
              <SourcesSection />
            </div>
          )}
        </div>
      </main>

      {/* Modal de Edición Manual */}
      <ManualEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentInput={hardwareInput}
        onSave={handleSaveHardware}
        onResetToDetected={handleResetToDetected}
      />

      {/* Footer Gamer Minimalista */}
      <footer className="border-t border-cyan-500/10 bg-[#010204] py-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 text-[11px] font-gamer text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>100% Client-side en tu navegador • Sin telemetría ni servidores</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
