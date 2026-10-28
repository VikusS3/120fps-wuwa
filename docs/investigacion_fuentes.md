# Investigación Técnica y Metodología de Fuentes Oficiales

## Wuthering Waves (Kuro Games) - Opción de 120 FPS en PC

### 1. Contexto Histórico de la Función

Wuthering Waves se lanzó en mayo de 2024 con un límite general de 60 FPS en todas las plataformas. Tras las solicitudes de la comunidad de PC y la colaboración técnica con fabricantes de hardware (NVIDIA y AMD), Kuro Games implementó el soporte para una tasa de cuadros máxima de 120 FPS en la **Versión 1.2 ("In the Turquoise Moonglow")**, lanzada el 15 de agosto de 2024.

A diferencia de otros videojuegos donde el selector de FPS es libre para cualquier equipo, Kuro Games diseñó un **sistema de lista blanca (hardware whitelist)** integrado en el cliente. Si los componentes del equipo no coinciden con los perfiles aprobados por el juego, el selector en *Ajustes > Gráficos > Cuadros por segundo* permanece bloqueado u oculta la opción de 120 FPS.

---

### 2. Fuentes Oficiales Contrastadas

| ID de Fuente | Título Oficial | Versión | Fecha | Alcance |
| :--- | :--- | :---: | :---: | :--- |
| `kuro-v1-2` | *Wuthering Waves Version 1.2 Patch Notes & Feature Update* | 1.2 | 2024-08-15 | Publicación del primer listado oficial de tarjetas gráficas y CPUs con soporte de 120 FPS. |
| `kuro-v2-1` | *Version 2.1 Update Details & Optimizations* | 2.1 | 2025-01-23 | Corrección de fallos en el reconocimiento de GPUs para portátiles y compatibilidad con drivers recientes. |
| `kuro-v2-3` | *Version 2.3 "Fiery Arpeggio of Summer Reunion"* | 2.3 | 2025-05-15 | Adaptación para el lanzamiento en tiendas adicionales y ajustes gráficos en resoluciones panorámicas. |
| `kuro-v2-4` | *Version 2.4 Performance & Device Whitelist Expansion* | 2.4 | 2025-07-10 | Expansión documentada de procesadores Core Ultra y GPUs móviles de nueva generación. |
| `kuro-system-reqs` | *Requisitos de Sistema Recomendados para PC* | 3.6 / Base | 2024-05-20 | Requisitos mínimos (GTX 1060 / RX 580, i5 9ª gen) para jugar a 60 FPS estándar en 1080p. |

---

### 3. Criterio de Selección de Hardware

#### 3.1. Tarjetas Gráficas (GPU)
Kuro Games estableció un umbral de arquitectura y potencia gráfica. Los modelos admitidos oficialmente son:

- **NVIDIA GeForce RTX Serie 40 (Escritorio y Laptop):**
  - RTX 4090, RTX 4090 D, RTX 4080 SUPER, RTX 4080, RTX 4070 Ti SUPER, RTX 4070 Ti, RTX 4070 SUPER, RTX 4070, RTX 4060 Ti, RTX 4060, RTX 4050 (variantes móviles).
- **NVIDIA GeForce RTX Serie 30 (Escritorio y Laptop):**
  - RTX 3090 Ti, RTX 3090, RTX 3080 Ti, RTX 3080, RTX 3070 Ti, RTX 3070, RTX 3060 Ti, RTX 3060.
  - *Exclusión documentada:* La RTX 3050 y la serie RTX 20 (incluida la RTX 2080 Ti) no fueron incluidas en la lista oficial para 120 FPS.
- **AMD Radeon RX Serie 7000 (Escritorio y Laptop):**
  - RX 7900 XTX, RX 7900 XT, RX 7900 GRE, RX 7800 XT, RX 7700 XT, RX 7600 XT, RX 7600 (y series 7600M/S).
- **AMD Radeon RX Serie 6000 (Escritorio y Laptop):**
  - RX 6950 XT, RX 6900 XT, RX 6800 XT, RX 6800, RX 6750 XT, RX 6750 GRE, RX 6700 XT.
  - *Exclusión documentada:* Las tarjetas RX 6600 y RX 6600 XT no forman parte de la lista oficial de 120 FPS.

#### 3.2. Procesadores (CPU)
Para evitar cuellos de botella severos en el renderizado del hilo principal de Unreal Engine, Kuro Games estableció como base:

- **Intel:** Core i5, i7 e i9 a partir de la 12ª generación (serie 12000, 13000, 14000) tanto en sobremesa como en procesadores móviles de alto rendimiento (H, HX, P), además de la familia Intel Core Ultra.
- **AMD:** Procesadores Ryzen 7 y Ryzen 9 modernos (Ryzen 7 5700X/5800X/5800X3D, Ryzen 9 5900X, y familias Ryzen 7000, 8000 y 9000).

---

### 4. Distinción entre Requisitos Generales y Requisitos de 120 FPS

Una confusión recurrente entre los jugadores es asumir que cumplir los requisitos "Recomendados" del juego otorga acceso a los 120 FPS:

- **Requisitos Recomendados Oficiales (60 FPS @ 1080p):** Intel Core i7 (9ª Gen) / Ryzen 5 3600 con GTX 1060 / RX 580 y 16 GB de RAM.
- **Requisitos del Whitelist de 120 FPS:** Requiere hardware significativamente más moderno (mínimo RTX 3060 / RX 6700 XT y CPU Intel 12ª Gen / Ryzen 5000 de 8 núcleos o superior).

Nuestra aplicación separa explícitamente estas dos categorías para no generar falsas expectativas.
