# Limitaciones Técnicas del Entorno Web y Metodología

## 1. El Sandbox del Navegador Web

Por diseño de seguridad y privacidad en la web moderna, los navegadores aíslan las aplicaciones web dentro de un entorno restringido (*sandbox*). Esto impide que una página web ejecute comandos del sistema operativo (como PowerShell, CMD, WMI o consultas de registro) o lea directamente los nombres de componentes físicos que no hayan sido expuestos deliberadamente por APIs estandarizadas del W3C/WHATWG.

Esta aplicación opera **100% en el lado del cliente**, sin servidores intermedios, sin rastreo de huella digital y sin recopilar telemetría de los usuarios.

---

## 2. Limitaciones de Detección por Componente

### 2.1. Procesador (CPU)
- **API disponible:** `navigator.hardwareConcurrency`.
- **Qué información aporta:** El número de hilos lógicos disponibles en el hilo del navegador (por ejemplo, 8, 16 o 24).
- **Limitaciones reales:** No revela el fabricante (Intel vs AMD), la microarquitectura, la generación ni el modelo comercial (ej. *i7-13700K* vs *Ryzen 7 7800X3D*). Ninguna API web estándar lo expone por diseño.
- **Inferencia desde la iGPU (opcional y siempre confirmada):** las gráficas integradas son exclusivas de rangos cerrados de procesadores, lo que permite inferir la *familia* con certeza documentable (p. ej. Radeon 780M → Ryzen 7000/8000/9000; UHD 630 → Intel de 10ª generación o anterior; Intel Arc integrada → Core Ultra). El módulo `cpuInferencer.ts` evalúa **todas las fuentes observadas** —la GPU elegida, el resto de candidatas priorizando las integradas y la segunda GPU— porque en portátiles Optimus la dedicada gana la elección y ocultaría la iGPU que informa de la CPU. Después distingue dos casos:
  - **Decisiva (`decisive: true`):** el rango de generación es cerrado y se pre-rellena el modelo sugerido (`cpuFormFactor: 'all'`, ya que no se puede saber si es portátil o escritorio). El usuario debe confirmarlo mediante el banner *"Sí, es mi procesador"* antes de que cuente como verificado; hasta entonces se muestra como *Inferido / Sin confirmar*.
  - **No decisiva (`decisive: false`):** el rango es ambiguo (p. ej. Iris Xe abarca 11ª-13ª generación y cruza el umbral de 12ª; Radeon 740M existe en versiones U y G con distinto estatus) y solo se ofrece como guía: el usuario debe elegir su modelo exacto en el formulario.
- **Comportamiento de la aplicación:** si ninguna fuente permite inferir la CPU (p. ej. escritorio con tarjeta dedicada sin iGPU expuesta) se muestra un banner que explica el motivo y ofrece abrir el selector manual. **Nunca se simula una lectura mágica ni se inventa el procesador; toda inferencia es visible, etiquetada y requiere confirmación.**

### 2.2. Tarjeta Gráfica (GPU)
- **APIs disponibles:**
  - WebGL: `WEBGL_debug_renderer_info` (`UNMASKED_RENDERER_WEBGL` y `UNMASKED_VENDOR_WEBGL`) con `powerPreference: 'high-performance'`.
  - WebGPU: `navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })` y `GPUAdapterInfo` (`description`, `device`, `vendor`).
  - Clasificación externa: [`@pmndrs/detect-gpu`](https://github.com/pmndrs/detect-gpu) (`getGPUTier`) para limpiar cadenas ANGLE, desofuscar *renderers* enmascarados (Firefox/Safari) y obtener un nombre normalizado de GPU.
- **Pipeline multi-candidato:** cada cadena observada (detect-gpu, WebGL, WebGPU) se evalúa por separado como *candidata* y se elige la mejor mediante una puntuación determinista: se descartan adaptadores por software/virtual, se prioriza la GPU dedicada sobre la iGPU (portátiles Optimus) y las cadenas que coinciden con la whitelist oficial. La segunda gráfica detectada (iGPU + dedicada) se muestra en el panel de transparencia.
- **Benchmarks autoalojados:** los ficheros de benchmarks `d-*.json` de `@pmndrs/detect-gpu` se copian a `public/gpu-benchmarks/` mediante `scripts/copy-gpu-benchmarks.mjs` (se ejecuta en `postinstall` y en `build`). **En tiempo de ejecución no se realiza ninguna petición a CDNs ni servidores de terceros.**
- **Limitaciones reales:**
  1. *Laptops con gráficos conmutables (Optimus / SmartAccess):* Si el navegador está ejecutándose sobre la gráfica integrada (Intel UHD o AMD Radeon 680M) para ahorrar batería, WebGL reportará únicamente esa iGPU, a pesar de que el portátil posea una GPU dedicada RTX 4060 para juegos. La solicitud con `powerPreference: 'high-performance'` mitiga el problema pero no lo elimina.
  2. *Protección contra Fingerprinting:* Navegadores como Brave, Firefox (con `privacy.resistFingerprinting`) o perfiles anónimos bloquean la extensión `WEBGL_debug_renderer_info` o devuelven cadenas genéricas como `Mesa` o adaptadores virtuales (`Google SwiftShader`).
- **Comportamiento de la aplicación:** La aplicación limpia cadenas complejas de ANGLE/DirectX mediante un normalizador determinista (con manejo de paréntesis anidados `(R)`/`(TM)`) y advierte al usuario si se detecta una GPU integrada o virtual, permitiéndole indicar manualmente su GPU dedicada.

### 2.3. Memoria RAM
- **API disponible:** `navigator.deviceMemory`.
- **Limitaciones reales:** Por especificación del W3C para mitigar ataques de temporización y rastreo entre sitios, el valor devuelto se redondea a potencias de dos y **está limitado artificialmente a un máximo de 8 GB** (valores: 0.25, 0.5, 1, 2, 4 u 8). Un equipo con 16 o 32 GB reportará exactamente 8: **la RAM real no es legible desde la web**. En Firefox/Safari la API puede no existir (valor 0).
- **Comportamiento de la aplicación:** nunca se inventa un número (antes el código convertía a ciegas 8 → 16). Cuando `deviceMemory` está capado (= 8) o no existe (= 0), el valor se conserva tal cual, la ranura muestra *«≥8 GB · Sin confirmar»* y un banner pide al usuario indicar su RAM real (8/16/32/64 GB u otra cantidad). Solo después de esa confirmación se evalúa como definitiva. La RAM no es un requisito obligatorio del veredicto, así que esta duda nunca bloquea el resultado global.

### 2.4. Pantalla y Tasa de Refresco (Hz)
- **APIs disponibles:** `screen.width`, `screen.height`, `window.devicePixelRatio`, y muestreo pasivo con `window.requestAnimationFrame`.
- **Limitaciones reales:** No existe una propiedad estándar universal `screen.refreshRate` implementada en todos los navegadores.
- **Comportamiento de la aplicación:** Se calculan los intervalos de tiempo entre 35 fotogramas consecutivos de renderizado en el navegador para calcular la mediana de frecuencia de refresco, redondeando a frecuencias comunes (60, 75, 120, 144, 165, 240 Hz). Si la pantalla es de 60 Hz, se marca como advertencia informativa sin invalidar la compatibilidad de la GPU/CPU con el juego.

---

## 3. Estados Internos del Evaluador

Para cumplir con rigor técnico y no emitir juicios arbitrarios, el motor de evaluación implementa los siguientes estados deterministas:

| Estado | Significado Técnico |
| :--- | :--- |
| `confirmed_compatible` | El componente coincide exactamente con un modelo de la lista oficial verificada de Kuro Games. |
| `confirmed_incompatible` | El componente se encuentra por debajo de la arquitectura o generación base admitida oficialmente. |
| `unknown` | El modelo no se pudo identificar o requiere confirmación manual del usuario. |
| `not_applicable` | El componente aporta información contextual (ej. monitor de 60 Hz) pero no impide que el juego desbloquee la opción. |
| `outdated_rule` | Regla histórica que ha sido reemplazada por un comunicado oficial posterior. |
