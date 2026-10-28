import { DetectedScreenInfo } from './types';

/**
 * Estima la frecuencia de actualización del monitor (Hz) analizando
 * los intervalos entre frames generados por requestAnimationFrame.
 * Toma 35 muestras consecutivas.
 */
export function estimateRefreshRate(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.requestAnimationFrame) {
      resolve(60);
      return;
    }

    const frameDeltas: number[] = [];
    let lastTime = performance.now();
    let frameCount = 0;
    const TARGET_FRAMES = 35;

    const sample = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Descartar el primer frame por ser irregular
      if (frameCount > 0 && delta > 0 && delta < 100) {
        frameDeltas.push(delta);
      }

      frameCount++;

      if (frameCount < TARGET_FRAMES) {
        window.requestAnimationFrame(sample);
      } else {
        if (frameDeltas.length === 0) {
          resolve(60);
          return;
        }

        // Mediana de los deltas para evitar picos
        frameDeltas.sort((a, b) => a - b);
        const medianDelta = frameDeltas[Math.floor(frameDeltas.length / 2)];
        const rawFps = 1000 / medianDelta;

        // Redondear a frecuencias estándar comunes
        let roundedHz = Math.round(rawFps);
        if (Math.abs(roundedHz - 60) <= 4) roundedHz = 60;
        else if (Math.abs(roundedHz - 75) <= 4) roundedHz = 75;
        else if (Math.abs(roundedHz - 120) <= 5) roundedHz = 120;
        else if (Math.abs(roundedHz - 144) <= 5) roundedHz = 144;
        else if (Math.abs(roundedHz - 165) <= 5) roundedHz = 165;
        else if (Math.abs(roundedHz - 240) <= 6) roundedHz = 240;
        else if (Math.abs(roundedHz - 360) <= 8) roundedHz = 360;

        resolve(roundedHz);
      }
    };

    window.requestAnimationFrame(sample);
  });
}

export async function detectScreen(): Promise<DetectedScreenInfo> {
  const width = typeof window !== 'undefined' ? (window.screen?.width || 1920) : 1920;
  const height = typeof window !== 'undefined' ? (window.screen?.height || 1080) : 1080;
  const pixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  let hz = 60;
  let confidence: 'approximate' | 'unknown' = 'unknown';

  try {
    hz = await estimateRefreshRate();
    confidence = 'approximate';
  } catch (err) {
    hz = 60;
  }

  return {
    width,
    height,
    pixelRatio,
    estimatedRefreshRate: {
      value: hz,
      confidence,
      sourceApi: 'requestAnimationFrame timestamp sampling',
      isReliable: true,
      notes: hz >= 120
        ? `Pantalla de ${hz} Hz detectada. Apta para mostrar los 120 FPS sin cuello de botella en el monitor.`
        : `Pantalla de ${hz} Hz detectada. Aunque el juego habilite 120 FPS, un monitor de ${hz} Hz solo puede mostrar físicamente hasta ${hz} imágenes por segundo.`
    }
  };
}
