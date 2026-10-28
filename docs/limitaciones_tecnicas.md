# Limitaciones Técnicas del Entorno Web y Metodología

## 1. El Sandbox del Navegador Web

Por diseño de seguridad y privacidad en la web moderna, los navegadores aíslan las aplicaciones web dentro de un entorno restringido (*sandbox*). Esto impide que una página web ejecute comandos del sistema operativo (como PowerShell, CMD, WMI o consultas de registro) o lea directamente los nombres de componentes físicos que no hayan sido expuestos deliberadamente por APIs estandarizadas del W3C/WHATWG.

Esta aplicación opera **100% en el lado del cliente**, sin servidores intermedios, sin rastreo de huella digital y sin recopilar telemetría de los usuarios.

---

## 2. Limitaciones de Detección por Componente

### 2.1. Procesador (CPU)
- **API disponible:** `navigator.hardwareConcurrency`.
- **Qué información aporta:** El número de hilos lógicos disponibles en el hilo del navegador (por ejemplo, 8, 16 o 24).
- **Limitaciones reales:** No revela el fabricante (Intel vs AMD), la microarquitectura, la generación ni el modelo comercial (ej. *i7-13700K* vs *Ryzen 7 7800X3D*).
- **Comportamiento de la aplicación:** Se clasifica honestamente como `unknown` (desconocido) durante la inspección automática y se solicita al usuario que seleccione su modelo en el formulario manual. **Nunca se simula una lectura mágica ni se inventa el procesador.**

### 2.2. Tarjeta Gráfica (GPU)
- **APIs disponibles:**
  - WebGL: `WEBGL_debug_renderer_info` (`UNMASKED_RENDERER_WEBGL` y `UNMASKED_VENDOR_WEBGL`).
  - WebGPU: `navigator.gpu.requestAdapter()`.
- **Limitaciones reales:**
  1. *Laptops con gráficos conmutables (Optimus / SmartAccess):* Si el navegador está ejecutándose sobre la gráfica integrada (Intel UHD o AMD Radeon 680M) para ahorrar batería, WebGL reportará únicamente esa iGPU, a pesar de que el portátil posea una GPU dedicada RTX 4060 para juegos.
  2. *Protección contra Fingerprinting:* Navegadores como Brave, Firefox (con `privacy.resistFingerprinting`) o perfiles anónimos bloquean la extensión `WEBGL_debug_renderer_info` o devuelven cadenas genéricas como `Mesa` o adaptadores virtuales (`Google SwiftShader`).
- **Comportamiento de la aplicación:** La aplicación limpia cadenas complejas de ANGLE/DirectX mediante un normalizador determinista y advierte al usuario si se detecta una GPU integrada o virtual, permitiéndole indicar manualmente su GPU dedicada.

### 2.3. Memoria RAM
- **API disponible:** `navigator.deviceMemory`.
- **Limitaciones reales:** Por especificación del W3C para mitigar ataques de temporización y rastreo entre sitios, el valor devuelto se redondea a potencias de dos y **está limitado artificialmente a un máximo de 8 GB** (valores: 0.25, 0.5, 1, 2, 4 u 8).
- **Comportamiento de la aplicación:** Se informa al usuario de que el valor detectado puede ser inferior a la RAM real física (por ejemplo, tener 16 o 32 GB instalados y ver reportado 8 GB) y se clasifica como `Aproximado`.

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
