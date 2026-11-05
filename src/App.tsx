import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VerdictBanner } from './components/VerdictBanner';
import { BraveShieldsBanner } from './components/BraveShieldsBanner';
import { FaqSection } from './components/FaqSection';
import { ManualEditModal } from './components/ManualEditModal';
import { SourcesSection } from './components/SourcesSection';
import { InspectionStatus } from './components/InspectionStatus';
import { runFullHardwareInspection, buildHardwareInput, isRamUnconfirmed } from './lib/detection';
import { DeviceHardwareProfile } from './lib/detection/types';
import { UserHardwareInput, EvaluationResult } from './lib/evaluation/types';
import { evaluateHardware } from './lib/evaluation/evaluator';
import { ChevronDown, ChevronUp, BookOpen, ShieldCheck, Cpu, AlertTriangle, RefreshCw, HardDrive } from 'lucide-react';

const DEFAULT_HARDWARE_INPUT: UserHardwareInput = {
  gpuModel: '',
  gpuFormFactor: 'desktop',
  cpuModel: '',
  cpuFormFactor: 'desktop',
  ramGb: 16,
  osName: 'Windows 10 / 11 (64-bit)',
  screenRefreshRateHz: 60
};

export const App: React.FC = () => {
  const [profile, setProfile] = useState<DeviceHardwareProfile | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showSources, setShowSources] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cpuSuggestionVisible, setCpuSuggestionVisible] = useState<boolean>(false);
  const [cpuConfirmed, setCpuConfirmed] = useState<boolean>(false);
  const [ramSuggestionVisible, setRamSuggestionVisible] = useState<boolean>(false);
  const [ramConfirmed, setRamConfirmed] = useState<boolean>(false);

  // Estado del hardware
  const [hardwareInput, setHardwareInput] = useState<UserHardwareInput>(DEFAULT_HARDWARE_INPUT);

  // Resultado de la evaluación
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Escaneo inicial
  const performHardwareScan = useCallback(async () => {
    setIsScanning(true);
    setScanError(null);
    try {
      const detected = await runFullHardwareInspection();
      setProfile(detected);

      const initialInput = buildHardwareInput(detected);
      setHardwareInput(initialInput);
      setEvaluation(evaluateHardware(initialInput));

      const inference = detected.cpu.inference;
      setCpuConfirmed(false);
      setCpuSuggestionVisible(!!inference);

      // RAM: sin adivinanzas. Si deviceMemory está capado o no existe,
      // se pide confirmación al usuario en lugar de inventar 16 GB.
      const ramUnconfirmed = isRamUnconfirmed(detected.ram);
      setRamConfirmed(!ramUnconfirmed);
      setRamSuggestionVisible(ramUnconfirmed);
    } catch (err) {
      console.error('Error durante la detección de hardware:', err);
      setProfile(null);
      setScanError(err instanceof Error ? err.message : 'Error desconocido al inspeccionar el dispositivo.');
      // Degradación elegante: se evalúa con los valores por defecto para que
      // el usuario pueda introducir sus componentes manualmente.
      setEvaluation(evaluateHardware(DEFAULT_HARDWARE_INPUT));
      setCpuSuggestionVisible(false);
      setRamSuggestionVisible(false);
      setRamConfirmed(false);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    performHardwareScan();
  }, [performHardwareScan]);

  const handleSaveHardware = (updated: UserHardwareInput) => {
    setHardwareInput(updated);
    setEvaluation(evaluateHardware(updated));
    // El usuario revisó manualmente sus componentes: las sugerencias quedan cubiertas.
    setCpuSuggestionVisible(false);
    setCpuConfirmed(true);
    setRamSuggestionVisible(false);
    setRamConfirmed(true);
  };

  const handleConfirmCpuSuggestion = () => {
    setCpuSuggestionVisible(false);
    setCpuConfirmed(true);
  };

  const handleConfirmRam = (gb: number) => {
    const next: UserHardwareInput = { ...hardwareInput, ramGb: gb };
    setHardwareInput(next);
    setEvaluation(evaluateHardware(next));
    setRamSuggestionVisible(false);
    setRamConfirmed(true);
  };

  const handleResetToDetected = () => {
    if (profile) {
      const resetInput = buildHardwareInput(profile);
      setHardwareInput(resetInput);
      setEvaluation(evaluateHardware(resetInput));

      const inference = profile.cpu.inference;
      setCpuConfirmed(false);
      setCpuSuggestionVisible(!!inference);

      const ramUnconfirmed = isRamUnconfirmed(profile.ram);
      setRamConfirmed(!ramUnconfirmed);
      setRamSuggestionVisible(ramUnconfirmed);
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
            ¿TU PC CORRE <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">120 FPS</span> EN WUWA?
          </h1>
          <p className="text-sm font-gamer font-semibold text-slate-400 max-w-md mx-auto">
            Diagnóstico instantáneo de GPU y CPU para desbloquear la opción oficial de 120 cuadros en Wuthering Waves.
          </p>
        </div>

        {/* Aviso no invasivo si Brave Shields bloquea la GPU */}
        {profile?.isShieldsBlocking && !hardwareInput.gpuModel && (
          <BraveShieldsBanner onOpenGpuModal={() => setIsEditModalOpen(true)} />
        )}

        {/* Error de inspección: se ofrece reintento y entrada manual */}
        {scanError && !isScanning && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-display font-bold text-amber-300 text-sm uppercase tracking-wide">
                  No se pudo inspeccionar tu hardware
                </p>
                <p className="text-xs font-gamer text-slate-300">
                  {scanError} Puedes reintentar el escaneo o introducir tus componentes manualmente:
                  la comparación seguirá funcionando.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={performHardwareScan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-display uppercase tracking-wider hover:bg-cyan-500/25 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar escaneo
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/40 text-slate-300 text-xs font-display uppercase tracking-wider hover:bg-slate-500/20 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5" />
                Introducir manualmente
              </button>
            </div>
          </div>
        )}

        {/* Confirmación de CPU inferida desde la iGPU */}
        {cpuSuggestionVisible && profile?.cpu.inference && !isScanning && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-display font-bold text-cyan-300 text-sm uppercase tracking-wide">
                  Procesador inferido desde tu gráfica integrada
                </p>
                <p className="text-xs font-gamer text-slate-300">
                  {profile.cpu.inference.notes}
                </p>
                <p className="text-xs font-gamer text-slate-400">
                  Fuente: <span className="text-slate-300">{profile.cpu.inference.sourceGpu}</span>
                  {' • '}Familia: <span className="text-slate-300">{profile.cpu.inference.family}</span>
                  {!profile.cpu.inference.decisive &&
                    ' • Selecciona tu modelo exacto en el formulario para afinar.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.cpu.inference.decisive && profile.cpu.inference.suggestedModel && (
                <button
                  onClick={handleConfirmCpuSuggestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 text-xs font-display uppercase tracking-wider hover:bg-cyan-500/30 transition-colors"
                >
                  Sí, es mi procesador
                </button>
              )}
              <button
                onClick={() => {
                  setCpuSuggestionVisible(false);
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/40 text-slate-300 text-xs font-display uppercase tracking-wider hover:bg-slate-500/20 transition-colors"
              >
                Cambiar
              </button>
            </div>
          </div>
        )}

        {/* CPU ilegible: sin inferencia posible, se ofrece entrada manual */}
        {profile && !profile.cpu.inference && !cpuConfirmed && !hardwareInput.cpuModel && !isScanning && !scanError && (
          <div className="rounded-xl border border-slate-500/30 bg-slate-500/10 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-display font-bold text-slate-200 text-sm uppercase tracking-wide">
                  No se pudo inferir tu procesador
                </p>
                <p className="text-xs font-gamer text-slate-400">
                  El navegador no expone el modelo de la CPU y la GPU detectada no permite
                  inferirlo (p. ej. tarjeta dedicada sin gráfica integrada visible).
                  Selecciónalo manualmente para completar la comparación.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/40 text-slate-300 text-xs font-display uppercase tracking-wider hover:bg-slate-500/20 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              Seleccionar CPU
            </button>
          </div>
        )}

        {/* RAM no legible: deviceMemory capado a 8 GB o API ausente */}
        {profile && ramSuggestionVisible && !isScanning && !scanError && (
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-display font-bold text-violet-300 text-sm uppercase tracking-wide">
                  Confirma la RAM de tu equipo
                </p>
                <p className="text-xs font-gamer text-slate-300">
                  Por privacidad, el navegador no expone la RAM real:{' '}
                  {profile.ram.isCappedByBrowser
                    ? 'deviceMemory está limitado a 8 GB (tu equipo puede tener 16 GB o más).'
                    : 'la API de memoria no está disponible en este navegador.'}
                  {' '}Selecciona cuánta RAM tienes:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[8, 16, 32, 64].map((gb) => (
                <button
                  key={gb}
                  onClick={() => handleConfirmRam(gb)}
                  className="px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/40 text-violet-200 text-xs font-display uppercase tracking-wider hover:bg-violet-500/25 transition-colors"
                >
                  {gb} GB
                </button>
              ))}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/40 text-slate-300 text-xs font-display uppercase tracking-wider hover:bg-slate-500/20 transition-colors"
              >
                Otra cantidad
              </button>
            </div>
          </div>
        )}

        {/* HUD Gamer Central Console */}
        {evaluation && (
          <VerdictBanner
            result={evaluation}
            input={hardwareInput}
            onOpenEditModal={() => setIsEditModalOpen(true)}
            cpuInference={profile?.cpu.inference ?? null}
            cpuConfirmed={cpuConfirmed}
            ramUnconfirmed={!!profile && !ramConfirmed && isRamUnconfirmed(profile.ram)}
          />
        )}

        {/* Panel de transparencia: qué APIs se leyeron y cómo */}
        {profile && <InspectionStatus profile={profile} isScanning={isScanning} />}

        {/* Sección Visible de FAQ para Concordancia con Schema JSON-LD */}
        <FaqSection />

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
