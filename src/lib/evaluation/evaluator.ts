import { matchGpuRule, matchCpuRule } from '../detection/normalizer';
import { OFFICIAL_SOURCES, GENERAL_REQUIREMENTS } from '../../data/compatibility/sources';
import { OfficialSource } from '../../data/compatibility/types';
import { 
  UserHardwareInput, 
  EvaluationResult, 
  RequirementEvaluation, 
  OverallVerdict 
} from './types';

const PERFORMANCE_DISCLAIMER = 
  'Aviso técnico importante: El cumplimiento de la lista de compatibilidad oficial permite desbloquear el selector de 120 FPS en el menú de ajustes de Wuthering Waves, pero NO garantiza mantener 120 FPS estables en todas las situaciones de juego. La tasa de fotogramas real depende de la resolución seleccionada, configuración gráfica, DLSS/FSR, temperaturas térmicas, límites de consumo de energía, controladores gráficos actualizados y optimizaciones del parche.';

export function evaluateHardware(input: UserHardwareInput): EvaluationResult {
  const requirements: RequirementEvaluation[] = [];
  const sourcesMap = new Map<string, OfficialSource>();

  // Helper para añadir fuentes únicas
  const addSource = (sourceId?: string) => {
    if (sourceId && OFFICIAL_SOURCES[sourceId]) {
      sourcesMap.set(sourceId, OFFICIAL_SOURCES[sourceId]);
    }
  };

  // ==========================================
  // 1. EVALUAR TARJETA GRÁFICA (GPU)
  // ==========================================
  const rawGpu = input.gpuModel?.trim() || '';
  let gpuEval: RequirementEvaluation;

  if (!rawGpu || rawGpu.toLowerCase() === 'no lo sé' || rawGpu.toLowerCase() === 'no detectada') {
    gpuEval = {
      id: 'gpu',
      name: 'Tarjeta Gráfica (GPU)',
      status: 'unknown',
      userValue: rawGpu || 'Sin especificar',
      isMandatory: true,
      message: 'No se ha indicado el modelo de GPU. Es un requisito obligatorio para desbloquear 120 FPS.',
      notes: 'Consulta el Administrador de Dispositivos o dxdiag en Windows para ver tu tarjeta de video.'
    };
  } else {
    const gpuRule = matchGpuRule(rawGpu);
    if (!gpuRule) {
      gpuEval = {
        id: 'gpu',
        name: 'Tarjeta Gráfica (GPU)',
        status: 'unknown',
        userValue: rawGpu,
        isMandatory: true,
        message: `El modelo "${rawGpu}" no figura de forma explícita en las notas oficiales de 120 FPS de Kuro Games o requiere verificación.`,
        notes: 'Kuro Games utiliza una whitelist estricta. Si tu GPU es muy reciente o poco común, el juego podría no habilitar el toggle nativo.'
      };
    } else {
      addSource(gpuRule.sourceId);

      // Verificar compatibilidad de factor de forma (Laptop vs Desktop)
      const formFactorMatches = 
        gpuRule.formFactor === 'all' || 
        input.gpuFormFactor === 'all' || 
        gpuRule.formFactor === input.gpuFormFactor;

      if (gpuRule.isCompatible120Fps && formFactorMatches) {
        gpuEval = {
          id: 'gpu',
          name: 'Tarjeta Gráfica (GPU)',
          status: 'confirmed_compatible',
          userValue: `${gpuRule.model} (${input.gpuFormFactor === 'laptop' ? 'Laptop' : 'Escritorio'})`,
          isMandatory: true,
          message: `Compatible. Verificada en la lista oficial para la opción de 120 FPS (${gpuRule.family}).`,
          officialSource: OFFICIAL_SOURCES[gpuRule.sourceId],
          notes: gpuRule.notes
        };
      } else if (!gpuRule.isCompatible120Fps) {
        gpuEval = {
          id: 'gpu',
          name: 'Tarjeta Gráfica (GPU)',
          status: 'confirmed_incompatible',
          userValue: `${gpuRule.model} (${input.gpuFormFactor === 'laptop' ? 'Laptop' : 'Escritorio'})`,
          isMandatory: true,
          message: `Incompatible para 120 FPS. Este modelo no forma parte de la lista admitida de Kuro Games para la opción de 120 cuadros.`,
          officialSource: OFFICIAL_SOURCES[gpuRule.sourceId],
          notes: gpuRule.notes || 'El menú de ajustes de Wuthering Waves mantendrá la opción bloqueada u oculta para esta gráfica.'
        };
      } else {
        // Conflicto de factor de forma
        gpuEval = {
          id: 'gpu',
          name: 'Tarjeta Gráfica (GPU)',
          status: 'confirmed_incompatible',
          userValue: `${gpuRule.model} (${input.gpuFormFactor})`,
          isMandatory: true,
          message: `Incompatibilidad de factor de forma: La regla oficial para ${gpuRule.model} aplica exclusivamente a equipos de ${gpuRule.formFactor}.`,
          officialSource: OFFICIAL_SOURCES[gpuRule.sourceId]
        };
      }
    }
  }
  requirements.push(gpuEval);

  // ==========================================
  // 2. EVALUAR PROCESADOR (CPU)
  // ==========================================
  const rawCpu = input.cpuModel?.trim() || '';
  let cpuEval: RequirementEvaluation;

  if (!rawCpu || rawCpu.toLowerCase().includes('no detectable') || rawCpu.toLowerCase() === 'no lo sé') {
    cpuEval = {
      id: 'cpu',
      name: 'Procesador (CPU)',
      status: 'unknown',
      userValue: rawCpu || 'Sin especificar',
      isMandatory: true,
      message: 'No se ha indicado el modelo exacto de procesador.',
      notes: 'El navegador no puede leer el modelo de tu CPU por seguridad. Selecciónalo en el selector manual para completar el análisis.'
    };
  } else {
    const cpuRule = matchCpuRule(rawCpu);
    if (!cpuRule) {
      cpuEval = {
        id: 'cpu',
        name: 'Procesador (CPU)',
        status: 'unknown',
        userValue: rawCpu,
        isMandatory: true,
        message: `El procesador "${rawCpu}" no cuenta con verificación oficial concluyente en las notas de Kuro Games.`,
        notes: 'Kuro Games exige procesadores modernos (Intel 12ª gen o superior / AMD Ryzen 5000/7000 o superior).'
      };
    } else {
      addSource(cpuRule.sourceId);

      const formFactorMatches = 
        cpuRule.formFactor === 'all' || 
        input.cpuFormFactor === 'all' || 
        cpuRule.formFactor === input.cpuFormFactor;

      if (cpuRule.isCompatible120Fps && formFactorMatches) {
        cpuEval = {
          id: 'cpu',
          name: 'Procesador (CPU)',
          status: 'confirmed_compatible',
          userValue: `${cpuRule.model} (${input.cpuFormFactor === 'laptop' ? 'Laptop' : 'Escritorio'})`,
          isMandatory: true,
          message: `Compatible. Cumple con la gama de procesadores admitidos oficialmente para 120 FPS (${cpuRule.family}).`,
          officialSource: OFFICIAL_SOURCES[cpuRule.sourceId],
          notes: cpuRule.notes
        };
      } else if (!cpuRule.isCompatible120Fps) {
        cpuEval = {
          id: 'cpu',
          name: 'Procesador (CPU)',
          status: 'confirmed_incompatible',
          userValue: `${cpuRule.model} (${input.cpuFormFactor === 'laptop' ? 'Laptop' : 'Escritorio'})`,
          isMandatory: true,
          message: `Incompatible según el historial de requisitos de Kuro Games. Este procesador se sitúa por debajo del umbral de CPU para el whitelist de 120 FPS.`,
          officialSource: OFFICIAL_SOURCES[cpuRule.sourceId],
          notes: cpuRule.notes
        };
      } else {
        cpuEval = {
          id: 'cpu',
          name: 'Procesador (CPU)',
          status: 'confirmed_incompatible',
          userValue: `${cpuRule.model} (${input.cpuFormFactor})`,
          isMandatory: true,
          message: `Incompatibilidad de factor de forma: La regla para ${cpuRule.model} aplica a equipos de ${cpuRule.formFactor}.`,
          officialSource: OFFICIAL_SOURCES[cpuRule.sourceId]
        };
      }
    }
  }
  requirements.push(cpuEval);

  // ==========================================
  // 3. EVALUAR MEMORIA RAM
  // ==========================================
  addSource('kuro-system-reqs');
  const ramGb = input.ramGb || 0;
  let ramEval: RequirementEvaluation;

  if (ramGb >= GENERAL_REQUIREMENTS.recommendedRamGb) {
    ramEval = {
      id: 'ram',
      name: 'Memoria RAM',
      status: 'confirmed_compatible',
      userValue: `${ramGb} GB`,
      isMandatory: false,
      message: `Cumple holgadamente el requisito recomendado de 16 GB para fluidez alta.`,
      officialSource: OFFICIAL_SOURCES['kuro-system-reqs']
    };
  } else if (ramGb >= GENERAL_REQUIREMENTS.minRamGb) {
    ramEval = {
      id: 'ram',
      name: 'Memoria RAM',
      status: 'unknown',
      userValue: `${ramGb} GB`,
      isMandatory: false,
      message: `Memoria suficiente para ejecutar el juego (${ramGb} GB), pero se recomiendan 16 GB o más para tasas de 120 FPS sin microtirones.`,
      officialSource: OFFICIAL_SOURCES['kuro-system-reqs']
    };
  } else if (ramGb === 0) {
    ramEval = {
      id: 'ram',
      name: 'Memoria RAM',
      status: 'unknown',
      userValue: 'Sin especificar',
      isMandatory: false,
      message: 'No se pudo estimar la RAM de tu equipo. Se recomienda disponer de 16 GB para jugar a 120 FPS.'
    };
  } else {
    ramEval = {
      id: 'ram',
      name: 'Memoria RAM',
      status: 'confirmed_incompatible',
      userValue: `${ramGb} GB`,
      isMandatory: false,
      message: `Insuficiente. Wuthering Waves requiere un mínimo absoluto de 8 GB de RAM.`,
      officialSource: OFFICIAL_SOURCES['kuro-system-reqs']
    };
  }
  requirements.push(ramEval);

  // ==========================================
  // 4. EVALUAR SISTEMA OPERATIVO
  // ==========================================
  const osName = input.osName?.toLowerCase() || '';
  let osEval: RequirementEvaluation;

  if (osName.includes('windows 10') || osName.includes('windows 11')) {
    osEval = {
      id: 'os',
      name: 'Sistema Operativo',
      status: 'confirmed_compatible',
      userValue: input.osName,
      isMandatory: true,
      message: 'Compatible. Plataforma oficial de PC para Wuthering Waves (64-bit).',
      officialSource: OFFICIAL_SOURCES['kuro-system-reqs']
    };
  } else if (osName.includes('windows')) {
    osEval = {
      id: 'os',
      name: 'Sistema Operativo',
      status: 'confirmed_incompatible',
      userValue: input.osName,
      isMandatory: true,
      message: 'Incompatible. Kuro Games requiere Windows 10 (64-bit) o Windows 11.',
      officialSource: OFFICIAL_SOURCES['kuro-system-reqs']
    };
  } else if (!osName || osName === 'desconocido') {
    osEval = {
      id: 'os',
      name: 'Sistema Operativo',
      status: 'unknown',
      userValue: input.osName || 'Desconocido',
      isMandatory: true,
      message: 'No se pudo determinar la versión de Windows.'
    };
  } else {
    osEval = {
      id: 'os',
      name: 'Sistema Operativo',
      status: 'confirmed_incompatible',
      userValue: input.osName,
      isMandatory: true,
      message: `El cliente oficial de PC no es nativo para ${input.osName}. Requiere Windows 10/11 64-bit.`
    };
  }
  requirements.push(osEval);

  // ==========================================
  // 5. EVALUAR PANTALLA Y FRECUENCIA (HZ)
  // ==========================================
  const hz = input.screenRefreshRateHz || 60;
  let screenEval: RequirementEvaluation;

  if (hz >= 120) {
    screenEval = {
      id: 'screen',
      name: 'Tasa de Refresco del Monitor',
      status: 'confirmed_compatible',
      userValue: `${hz} Hz`,
      isMandatory: false,
      message: `Monitor de alta tasa de refresco (${hz} Hz). Podrás apreciar físicamente la fluidez de 120 FPS.`
    };
  } else {
    screenEval = {
      id: 'screen',
      name: 'Tasa de Refresco del Monitor',
      status: 'not_applicable',
      userValue: `${hz} Hz`,
      isMandatory: false,
      message: `Monitor estándar (${hz} Hz). El juego podrá desbloquear la opción en el menú si tu GPU y CPU son compatibles, pero tu pantalla solo proyectará un máximo de ${hz} cuadros por segundo.`
    };
  }
  requirements.push(screenEval);

  // ==========================================
  // CÁLCULO DEL VEREDICTO GLOBAL
  // ==========================================
  let verdict: OverallVerdict = 'cannot_determine';
  let verdictTitle = '';
  let verdictDescription = '';

  const mandatoryReqs = requirements.filter(r => r.isMandatory);
  const hasIncompatibleMandatory = mandatoryReqs.some(r => r.status === 'confirmed_incompatible');
  const allMandatoryCompatible = mandatoryReqs.every(r => r.status === 'confirmed_compatible');

  if (hasIncompatibleMandatory) {
    verdict = 'incompatible';
    verdictTitle = 'No cumple la lista oficial de compatibilidad para 120 FPS';
    const failedList = mandatoryReqs
      .filter(r => r.status === 'confirmed_incompatible')
      .map(r => r.name)
      .join(', ');
    verdictDescription = `Uno o más componentes obligatorios (${failedList}) no cumplen con los requisitos específicos fijados por Kuro Games. La opción de 120 FPS permanecerá desactivada u oculta en el cliente.`;
  } else if (allMandatoryCompatible) {
    verdict = 'compatible';
    verdictTitle = 'Compatible según la lista oficial';
    verdictDescription = 'Tu hardware coincide con los requisitos oficiales identificados para habilitar la opción de 120 FPS de Wuthering Waves en PC.';
  } else {
    verdict = 'cannot_determine';
    verdictTitle = 'No se puede determinar la compatibilidad';
    const unknownList = mandatoryReqs
      .filter(r => r.status === 'unknown')
      .map(r => r.name)
      .join(', ');
    verdictDescription = `Falta información técnica obligatoria (${unknownList}) o no existe una regla oficial suficientemente contrastada en las notas de Kuro Games para tus componentes.`;
  }

  return {
    verdict,
    verdictTitle,
    verdictDescription,
    performanceDisclaimer: PERFORMANCE_DISCLAIMER,
    requirements,
    consultedSources: Array.from(sourcesMap.values()),
    evaluatedAt: new Date().toISOString(),
    canCopyReport: true
  };
}

/**
 * Genera un reporte formateado en texto plano para exportar o copiar al portapapeles.
 */
export function formatReportAsPlainText(result: EvaluationResult, input: UserHardwareInput): string {
  const lines: string[] = [];
  lines.push('====================================================');
  lines.push('  WUTHERING WAVES - REPORTE DE COMPATIBILIDAD 120 FPS');
  lines.push('====================================================');
  lines.push(`Fecha de análisis: ${new Date(result.evaluatedAt).toLocaleString()}`);
  lines.push(`Veredicto global: ${result.verdictTitle.toUpperCase()}`);
  lines.push(`Detalle: ${result.verdictDescription}`);
  lines.push('');
  lines.push('---------------- ESPECIFICACIONES EVALUADAS ----------------');
  lines.push(`GPU: ${input.gpuModel || 'No especificada'} (${input.gpuFormFactor})`);
  lines.push(`CPU: ${input.cpuModel || 'No especificado'} (${input.cpuFormFactor})`);
  lines.push(`RAM: ${input.ramGb} GB`);
  lines.push(`SO: ${input.osName}`);
  lines.push(`Pantalla: ${input.screenRefreshRateHz} Hz`);
  lines.push('');
  lines.push('---------------- ESTADO POR REQUISITO ----------------');
  result.requirements.forEach(req => {
    const symbol = req.status === 'confirmed_compatible' ? '[✓ CUMPLE]' 
      : req.status === 'confirmed_incompatible' ? '[✗ NO CUMPLE]'
      : req.status === 'not_applicable' ? '[- INFO]'
      : '[? DESCONOCIDO]';
    lines.push(`${symbol} ${req.name}: ${req.userValue}`);
    lines.push(`   ${req.message}`);
    if (req.officialSource) {
      lines.push(`   Fuente: ${req.officialSource.shortLabel} (${req.officialSource.url})`);
    }
  });
  lines.push('');
  lines.push('---------------- AVISO TÉCNICO DE RENDIMIENTO ----------------');
  lines.push(result.performanceDisclaimer);
  lines.push('');
  lines.push('---------------- FUENTES OFICIALES CONSULTADAS ----------------');
  result.consultedSources.forEach(s => {
    lines.push(`• ${s.title}`);
    lines.push(`  URL: ${s.url}`);
    lines.push(`  Versión de juego: ${s.gameVersion} | Fecha: ${s.publicationDate}`);
  });
  lines.push('====================================================');

  return lines.join('\n');
}
