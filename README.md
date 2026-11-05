# Wuthering Waves 120 FPS Hardware Checker

Aplicación web moderna, determinista y orientada a la privacidad para verificar si el hardware de tu PC o Laptop cumple con los requisitos oficiales publicados por **Kuro Games** para habilitar la opción gráfica nativa de **120 FPS** en *Wuthering Waves*.

![Licencia MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-2.1-729b1b?logo=vitest)
![pnpm](https://img.shields.io/badge/pnpm-11-f69220?logo=pnpm)

---

## 🎯 Características Principales

1. **Inspección Automática No Invasiva:**
   - Detecta la GPU mediante WebGL (`WEBGL_debug_renderer_info`), WebGPU (adaptador de alto rendimiento) y la clasifica con [@pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu) (benchmarks autoalojados, sin CDNs de terceros).
   - Inferencia de la familia de CPU a partir de la gráfica integrada (iGPU), siempre etiquetada como *inferida* y confirmada por el usuario antes de completar la comparación.
   - Detecta el sistema operativo (`navigator.userAgentData`).
   - Mide de forma pasiva la tasa de refresco del monitor (Hz) con `requestAnimationFrame`.
   - Clasifica con honestidad cada dato como *Exacto*, *Aproximado*, *Inferido* o *Desconocido*.

2. **Privacidad Total (100% Client-Side):**
   - Sin servidores intermedios, sin base de datos en la nube y sin telemetría de usuario.
   - Tus componentes nunca se envían a ningún servidor externo.

3. **Base de Datos Desacoplada y Verificable:**
   - Listas oficiales de compatibilidad de Kuro Games extraídas de los parches 1.2, 2.1, 2.3, 2.4 y notas de soporte técnico.
   - Cada regla incluye su enlace directo a la fuente oficial, fecha de verificación y notas técnicas.
   - Separación estricta entre requisitos generales (60 FPS) y el whitelist de 120 FPS.

4. **Ajuste Manual Rápido:**
   - Selector interactivo con autocompletado para GPU y CPU (con soporte de variantes de sobremesa y portátiles).
   - Guía integrada para consultar tus especificaciones en Windows vía `dxdiag` o Administrador de Tareas.

5. **Exportación y Verificación:**
   - Generación de informe en texto plano para compartir o copiar al portapapeles.
   - Advertencia visible y realista sobre rendimiento: *desbloquear la opción en el menú no garantiza mantener 120 FPS estables sin optimizar ajustes gráficos*.

---

## 🏗️ Arquitectura del Proyecto

```
120fps-wuwa/
├── src/
│   ├── data/
│   │   └── compatibility/       # Base de datos de compatibilidad, reglas y fuentes oficiales
│   │       ├── types.ts         # Modelos de reglas, fuentes y requerimientos
│   │       ├── sources.ts       # Registro de comunicados oficiales y notas de parche
│   │       ├── gpuDatabase.ts   # Catálogo verificado de GPUs (RTX 30/40, RX 6000/7000, etc.)
│   │       └── cpuDatabase.ts   # Catálogo verificado de CPUs (Intel 12ª-14ª/Ultra, Ryzen 5000-9000)
│   ├── lib/
│   │   ├── detection/           # Detección pasiva en navegador y normalizador de hardware
│   │   │   ├── normalizer.ts    # Limpieza de cadenas ANGLE (paréntesis anidados (R)/(TM)) y matching con reglas
│   │   │   ├── gpuDetector.ts   # Pipeline multi-candidato WebGL/WebGPU/detect-gpu y adaptadores virtuales
│   │   │   ├── cpuInferencer.ts # Inferencia de familia de CPU desde la iGPU (multi-candidata, decisiva / ambigua)
│   │   │   ├── prefill.ts       # Valores iniciales del formulario (sin adivinanzas de RAM, CPU solo si decisiva)
│   │   │   ├── systemDetector.ts# Detección de OS, deviceMemory y hardwareConcurrency
│   │   │   └── screenDetector.ts# Muestreo de tasa de refresco (Hz) y resolución
│   │   └── evaluation/          # Motor determinista de evaluación de requisitos
│   │       ├── types.ts         # Estados internos y modelo del veredicto
│   │       └── evaluator.ts     # Lógica de reglas, cálculo de veredicto y formateador de texto
│   ├── components/              # Componentes de la interfaz de usuario en modo oscuro
│   │   ├── Header.tsx           # Barra superior con estado y botón de re-escaneo
│   │   ├── VerdictBanner.tsx    # Veredicto principal, aviso de rendimiento y copia de reporte
│   │   ├── HardwareCard.tsx     # Tarjeta individual por componente con badges de certeza
│   │   ├── ManualEditModal.tsx  # Modal de selección y corrección manual con guía de Windows
│   │   ├── InspectionStatus.tsx # Panel de transparencia: APIs leídas, inferencias y candidatas de GPU
│   │   └── SourcesSection.tsx   # Desglose de fuentes oficiales consultadas
│   ├── App.tsx                  # Orquestador principal y flujo en 3 fases
│   └── main.tsx                 # Punto de entrada de React
├── scripts/
│   └── copy-gpu-benchmarks.mjs  # Autoaloja los benchmarks d-*.json de @pmndrs/detect-gpu en public/
├── tests/                       # Suite de pruebas automatizadas con Vitest
│   ├── database.test.ts         # Pruebas de integridad referencial de fuentes y reglas
│   ├── normalizer.test.ts       # Limpieza ANGLE anidada, alias (R)/(TM), inferencia e inferFormFactor
│   ├── cpuInferencer.test.ts    # Reglas iGPU → CPU: multi-candidata, decisividad y nuevas iGPU (Arc/740M/840M)
│   ├── prefill.test.ts          # Prefill del formulario: RAM sin adivinanzas y CPU solo si decisiva
│   ├── gpuDetector.test.ts      # Helpers puros: software/virtual/opaco y selección de candidata
│   └── evaluator.test.ts        # Veredictos, laptops vs desktop, CPU inferida con factor 'all'
├── docs/                        # Documentación técnica extendida
│   ├── investigacion_fuentes.md # Metodología y recopilación de notas de Kuro Games
│   └── limitaciones_tecnicas.md # Límites del sandbox web y consideraciones de seguridad
├── package.json
└── vite.config.ts
```

---

## 🚀 Requisitos e Instalación

### Requisitos previos
- **Node.js** v18 o superior (probado en v22.19.0).
- **pnpm** v9 o superior (probado en v11.24.0).

### Instalación de dependencias
```bash
pnpm install
```

Si pnpm te solicita aprobar la ejecución de scripts para dependencias de empaquetado (como esbuild):
```bash
pnpm approve-builds --all
```

---

## 💻 Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo local en `http://localhost:5173` |
| `pnpm test` | Ejecuta la suite completa de pruebas unitarias con Vitest |
| `pnpm test:watch` | Ejecuta las pruebas en modo interactivo con recarga en caliente |
| `pnpm build` | Compila el proyecto con TypeScript y empaqueta los assets para producción (`dist/`) |
| `pnpm preview` | Previsualiza localmente el build de producción |

---

## ☁️ Despliegue en Vercel

El proyecto incluye la configuración nativa en `vercel.json` y `package.json`:

### Opción A: Vercel Dashboard (Con GitHub)
1. Sube este repositorio a GitHub.
2. Ve a [Vercel](https://vercel.com) e importa el repositorio.
3. Vercel detectará automáticamente Vite y `pnpm`. Pulsa **Deploy**.

### Opción B: Vercel CLI
```bash
# 1. Instalar Vercel CLI (si no lo tienes)
pnpm add -g vercel

# 2. Desplegar
vercel
```

---

## 🧪 Pruebas Unitarias

La suite incluye 72 pruebas automatizadas que cubren:
- Casos de GPU compatible y CPU compatible (`confirmed_compatible`).
- Casos de GPU incompatible según la lista de Kuro Games (ej. GTX 1060).
- Casos de CPU incompatible según los umbrales vigentes (ej. Ryzen 5 2600).
- Manejo de componentes desconocidos (`cannot_determine`).
- Detección de variantes de Laptop frente a Desktop (sin falsos positivos por "13th Gen").
- Detección de GPUs integradas frente a dedicadas.
- Normalización de cadenas ANGLE con paréntesis anidados `(R)`/`(TM)` (causa raíz del fallo histórico de detección en Intel/AMD).
- Inferencia de CPU desde iGPU: decisividad, sugerencias resolubles en la base y exclusiones (Vega discreta, GPU dedicada).
- Inferencia multi-candidata: la iGPU se evalúa aunque gane la dedicada (Optimus), incluida la segunda GPU detectada.
- Nuevas reglas iGPU verificadas: Intel Arc integrada → Core Ultra (decisiva), Radeon 740M → Phoenix, Radeon 840M/860M → Ryzen AI 300 (no decisivas), 610M y Arc discretas excluidas por ambigüedad.
- Prefill compartido escaneo/reset: la RAM capada a 8 GB nunca se convierte en 16 (sin adivinanzas) y se marca `Sin confirmar`; la CPU solo se pre-rellena con inferencia decisiva.
- CPU inferida con factor de forma `all` (etiqueta "Escritorio o Laptop", nunca "Escritorio").
- Selección de la mejor candidata de GPU (descarta software/virtual, prioriza dedicada y whitelist).
- Monitores estándar de 60 Hz (aviso informativo sin bloquear la compatibilidad del juego).
- Integridad referencial de todas las reglas frente al catálogo de fuentes oficiales.

Para ejecutar los tests:
```bash
pnpm test
```

---

## ⚠️ Descargo de Responsabilidad

*Wuthering Waves* y sus respectivos logotipos son marcas comerciales o registradas de **Kuro Games**. Esta aplicación es una herramienta comunitaria independiente con fines informativos y de diagnóstico, sin afiliación oficial con Kuro Games.
