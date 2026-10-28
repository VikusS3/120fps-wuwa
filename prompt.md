# Proyecto: Wuthering Waves 120 FPS Hardware Checker

## Rol

Actúa como un ingeniero de software full-stack senior, especialista en hardware de PC, APIs del navegador, compatibilidad de videojuegos, diseño de interfaces y verificación de fuentes oficiales.

Debes investigar, diseñar e implementar una aplicación web funcional que analice el hardware que un usuario puede exponer desde su navegador y determine si su PC o laptop cumple con los requisitos publicados por Kuro Games para utilizar la opción de 120 FPS en Wuthering Waves.

No entregues únicamente una propuesta, una maqueta, una landing page o pseudocódigo. Inspecciona el repositorio, define la arquitectura adecuada, implementa la aplicación, ejecuta las comprobaciones disponibles y documenta las limitaciones reales.

## 1. Objetivo del producto

Crear una web con una interfaz moderna, preferiblemente en español, que permita al usuario:

1. Abrir la página y comenzar un análisis de su dispositivo.
2. Recopilar automáticamente la información técnica disponible sin instalar nada.
3. Identificar los componentes que no pueden detectarse de manera fiable desde el navegador.
4. Permitir que el usuario complete o corrija los datos faltantes.
5. Comparar el hardware identificado con una base de datos verificable de compatibilidad oficial de Wuthering Waves a 120 FPS.
6. Mostrar un veredicto comprensible, explicar cada coincidencia o incompatibilidad y proporcionar las fuentes consultadas.

La aplicación debe estar diseñada para PC de escritorio y laptops. No debe afirmar que un dispositivo es compatible únicamente por tener una GPU potente o pertenecer a una familia reciente.

## 2. Investigación obligatoria

Antes de implementar la lógica de compatibilidad:

- Investiga las notas oficiales de Kuro Games relacionadas con la disponibilidad de 120 FPS.
- Revisa los anuncios de ampliación de compatibilidad, incluidos los correspondientes a las versiones 1.2, 2.1, 2.3, 2.4 y las actualizaciones posteriores que resulten pertinentes.
- Investiga si existen listas oficiales más recientes que modifiquen o sustituyan los requisitos anteriores.
- Comprueba las diferencias entre GPU de escritorio, GPU móviles, CPU de escritorio y CPU móviles.
- Identifica los modelos expresamente admitidos, las excepciones, los requisitos combinados de CPU y GPU y cualquier condición adicional.
- Distingue los requisitos generales del juego de los requisitos específicos de la función de 120 FPS.
- Registra qué afirmaciones provienen de fuentes oficiales y cuáles son únicamente referencias de terceros.

Fuentes iniciales:

- Web oficial: https://wutheringwaves.kurogames.com/
- Notas de la versión 2.1: https://wutheringwaves.kurogames.com/en/main/news/detail/2154
- Notas de la versión 2.4: https://wutheringwaves.kurogames.com/en/main/news/detail/2801
- Anuncio de la versión 2.3: https://wutheringwaves.gg/version-2-3-fiery-arpeggio-of-summer-reunion-patch-notes/
- Requisitos generales de la versión 3.6: https://wutheringwaves.kurogames.com/es/main/news/detail/5272

Estas URL son puntos de partida, no una garantía de que contengan la lista más reciente. Busca y verifica anuncios posteriores antes de declarar que la base de datos está actualizada.

No inventes modelos compatibles, equivalencias de hardware, requisitos de procesador ni reglas que no puedas justificar.

Si no puedes confirmar un dato, márcalo como desconocido o pendiente de verificación.

## 3. Base de datos de compatibilidad

Diseña una base de datos mantenible y separada del código de la interfaz.

Debe permitir almacenar:

- Identificador y versión de la regla.
- Fabricante del componente.
- Tipo de componente: GPU o CPU.
- Familia y modelo exacto.
- Tipo de equipo: escritorio o laptop.
- Variantes móviles reconocidas oficialmente.
- Estado: confirmado, no confirmado o pendiente de revisión.
- Condiciones adicionales.
- URL de la fuente oficial.
- Fecha de publicación de la fuente, si está disponible.
- Fecha de última verificación.
- Observaciones y excepciones.
- Historial de cambios de la regla.

No interpretes expresiones como «RTX 3060 o superior» como una autorización para admitir automáticamente todas las tarjetas con un número mayor. La base debe representar las familias y excepciones explícitamente verificadas.

No declares que una CPU es incompatible simplemente porque no aparezca en una lista histórica si no se ha verificado que esa lista siga siendo exhaustiva y vigente.

Si la desarrolladora amplía la compatibilidad, la base debe poder actualizarse sin reescribir toda la aplicación.

Implementa pruebas unitarias para los modelos de ejemplo encontrados en las fuentes, separando las reglas históricas de las reglas vigentes.

## 4. Detección del hardware desde el navegador

Investiga las capacidades reales de las APIs web y utiliza únicamente las que aporten información útil.

Puedes evaluar:

- `navigator.userAgentData`, cuando esté disponible.
- `navigator.userAgent` como alternativa limitada.
- `navigator.platform`, teniendo en cuenta su carácter no concluyente.
- `navigator.deviceMemory`, si el navegador la expone.
- `navigator.hardwareConcurrency`, como estimación del paralelismo disponible y no como identificación exacta del CPU.
- WebGL y WebGPU, si están disponibles, para obtener únicamente los datos técnicos que sus APIs permitan consultar.
- `screen.width`, `screen.height` y `devicePixelRatio`.
- `screen.refreshRate` solo si existe soporte real; no inventes esta propiedad si no está disponible.
- Las APIs de pantalla disponibles para consultar el modo de visualización cuando corresponda.

Para GPU, investiga el uso de WebGL mediante `WEBGL_debug_renderer_info` y la disponibilidad de WebGPU. Ten presente que estos mecanismos pueden estar bloqueados, ofrecer nombres genéricos, revelar un adaptador virtual o no identificar la GPU física exacta.

No supongas que el adaptador expuesto por WebGPU es necesariamente la GPU que ejecutará el juego.

No uses `navigator.hardwareConcurrency` como si fuera el número exacto de núcleos físicos.

No interpretes la memoria reportada por el navegador como la RAM física exacta.

No afirmes que conoces el modelo exacto del procesador si no has obtenido evidencia suficiente.

No solicites permisos innecesarios ni envíes automáticamente información del dispositivo a un servidor.

Si una API no está disponible, la aplicación debe continuar funcionando con el resto de la información.

## 5. Flujo de análisis

Implementa un flujo de análisis en fases:

### Fase A: inspección automática

- Detectar el sistema operativo probable.
- Obtener los datos accesibles de la pantalla.
- Obtener información técnica disponible de los adaptadores gráficos.
- Recopilar las estimaciones de memoria y paralelismo disponibles.
- Registrar qué propiedades son exactas, aproximadas, inferidas o desconocidas.

### Fase B: revisión del usuario

Mostrar los datos obtenidos y permitir que el usuario confirme o corrija:

- Modelo de GPU.
- Si es una GPU de escritorio o de laptop.
- Modelo exacto del CPU.
- Si el procesador pertenece a una laptop o a un equipo de escritorio.
- RAM instalada.
- Frecuencia de actualización del monitor, si se conoce.
- Sistema operativo y versión.
- Modelo de equipo, cuando ayude a identificar variantes móviles.

Ofrecer selectores con búsqueda y una opción «No lo sé».

Cuando una GPU integrada y una dedicada puedan coexistir, solicitar que el usuario identifique la GPU dedicada si es posible.

No obligues al usuario a completar campos que no sean necesarios para determinar el criterio oficial que se está comprobando.

### Fase C: evaluación

Evaluar cada requisito por separado.

Estados internos recomendados:

- `confirmed_compatible`
- `confirmed_incompatible`
- `unknown`
- `not_applicable`
- `outdated_rule`

El resultado global solo podrá ser positivo si se han verificado todos los requisitos obligatorios según la regla oficial vigente.

Si faltan datos importantes, mostrar «No se puede determinar».

Si el equipo incumple un requisito obligatorio expresamente documentado, mostrar «No cumple la lista oficial de compatibilidad».

Explicar siempre qué componentes se han identificado y cuáles no se han podido verificar.

## 6. Interpretación del resultado

Diseña tres resultados principales:

### Resultado 1: Compatible según la lista oficial

Mostrar cuando todos los componentes y condiciones obligatorios estén verificados.

Texto orientativo:

«Tu hardware coincide con los requisitos oficiales identificados para la opción de 120 FPS de Wuthering Waves».

Añadir una advertencia visible:

«Esto no garantiza mantener 120 FPS estables en todas las situaciones. El rendimiento real depende también de la resolución, configuración gráfica, temperaturas, consumo energético, controladores y versión del juego».

### Resultado 2: No compatible según la lista oficial

Mostrar únicamente cuando exista una incompatibilidad demostrable respecto de una regla oficial vigente.

Indicar el componente que no cumple y mostrar la fuente de la regla.

No recomendar cambiar componentes sin explicar primero qué requisito no se satisface.

### Resultado 3: No se puede determinar

Utilizar cuando los nombres de hardware sean ambiguos, la detección esté bloqueada, falte información o no exista una regla oficial suficientemente clara.

Explicar al usuario cómo consultar su CPU y GPU desde Windows y cómo introducir los modelos manualmente.

Nunca convertir un resultado desconocido en un resultado negativo o positivo por conveniencia.

## 7. Diseño de interfaz

Crea una interfaz moderna, de alta calidad, inspirada en herramientas de diagnóstico de hardware y videojuegos, sin copiar recursos protegidos de Kuro Games.

Requisitos:

- Diseño dark-only.
- Interfaz responsive y accesible.
- Jerarquía visual clara.
- Animaciones discretas durante el análisis.
- Indicadores de progreso reales.
- Tarjetas para CPU, GPU, RAM, sistema operativo y pantalla.
- Estado individual de cada requisito.
- Resultado global claramente visible.
- Apartado de fuentes oficiales.
- Fecha de actualización de la base de compatibilidad.
- Botón para volver a analizar.
- Botón para corregir manualmente los componentes.
- Opción para copiar o exportar el resultado como texto.
- Tratamiento adecuado para dispositivos sin WebGL o WebGPU.
- Mensajes de error comprensibles.

No muestres porcentajes de compatibilidad inventados ni puntuaciones de rendimiento sin una metodología verificable.

No utilices barras de progreso falsas ni simules que estás leyendo componentes que el navegador no puede detectar.

## 8. Seguridad y privacidad

La primera versión debe funcionar preferiblemente en el cliente, sin cuentas ni base de datos de usuarios.

- No recopilar identificadores personales innecesarios.
- No enviar automáticamente el inventario de hardware a terceros.
- No ejecutar comandos del sistema desde el navegador.
- No descargar ni ejecutar archivos sin consentimiento explícito.
- No pedir permisos de administrador.
- No instalar extensiones de navegador.
- No prometer un escaneo profundo desde una web convencional.

Si para una detección exacta de CPU o GPU es necesario crear un programa auxiliar para Windows, no lo simules.

Presenta esta funcionalidad como una posible segunda fase y diseña una integración explícita, segura, documentada y con consentimiento del usuario. Cualquier programa auxiliar debe tener su propio análisis de seguridad y no debe ejecutar código arbitrario enviado por la web.

## 9. Arquitectura y herramientas

Inspecciona primero el repositorio existente.

- Si el proyecto ya tiene una arquitectura, respétala cuando sea adecuada.
- Si está vacío, elige una arquitectura ligera y mantenible.
- Prioriza TypeScript.
- Puedes utilizar React con Vite o Astro con una isla interactiva de React, según lo que mejor se adapte al proyecto.
- Utiliza pnpm, no npm.
- Evita servicios de pago y dependencias innecesarias.
- Separa los datos de compatibilidad, la detección del hardware, el motor de evaluación y los componentes de interfaz.
- No añadas un backend si no aporta una necesidad real.
- No incorpores credenciales ni secretos al cliente.

Posible organización:

- `src/data/compatibility/`: datos de CPU, GPU y fuentes.
- `src/lib/detection/`: funciones de detección del navegador.
- `src/lib/evaluation/`: motor de reglas y clasificación.
- `src/components/`: interfaz y componentes reutilizables.
- `src/pages/` o la estructura equivalente del framework elegido.
- `tests/`: pruebas unitarias.
- `docs/`: investigación, metodología, fuentes y limitaciones.

Adapta estos nombres a la arquitectura real del repositorio.

## 10. Pruebas obligatorias

Incluye pruebas para:

- GPU compatible y CPU compatible.
- GPU incompatible según una regla vigente.
- CPU incompatible según una regla vigente.
- GPU conocida y CPU desconocida.
- CPU conocida y GPU desconocida.
- Hardware cuyo modelo exacto no se pueda identificar.
- Variante de laptop frente a escritorio.
- GPU integrada frente a dedicada.
- Reglas históricas frente a reglas vigentes.
- Datos oficiales incompletos o desactualizados.
- APIs de navegador no disponibles.
- Propiedades de hardware bloqueadas por privacidad.
- Dispositivo con pantalla de 60 Hz.
- Usuario que introduce datos manualmente.
- Casos límite con nombres similares de GPU o CPU.

Las pruebas no deben depender de que el agente tenga físicamente todos los componentes.

No afirmes que una prueba se ha ejecutado si no se ha ejecutado realmente.

## 11. Entregables

Completa las siguientes tareas:

1. Investigación documentada de la compatibilidad oficial.
2. Base de datos inicial con fuentes y fechas de verificación.
3. Aplicación web funcional.
4. Detección automática con degradación elegante cuando falten APIs.
5. Formulario de confirmación manual.
6. Motor de evaluación independiente de la interfaz.
7. Resultados explicados y verificables.
8. Pruebas unitarias.
9. README con instrucciones de instalación, desarrollo y compilación.
10. Documento de limitaciones técnicas y metodología.
11. Registro de los modelos y reglas que sigan pendientes de verificación.

## 12. Criterios de aceptación

El proyecto solo estará terminado cuando:

- La aplicación compile correctamente.
- Las pruebas disponibles pasen.
- La interfaz funcione aunque no se pueda identificar el hardware automáticamente.
- La clasificación esté basada en datos documentados.
- Las fuentes sean accesibles y estén asociadas a las reglas correspondientes.
- El usuario pueda entender por qué recibió un resultado.
- La aplicación no afirme que ha escaneado componentes que no pudo detectar.
- La compatibilidad con la opción de 120 FPS no se presente como una garantía de rendimiento sostenido.
- Las reglas históricas no se presenten como actuales sin verificación.
- El README explique las limitaciones reales de la detección en navegador.

## Instrucción final

Comienza inspeccionando el repositorio y verificando las fuentes oficiales. Después implementa el proyecto de extremo a extremo, ejecuta las pruebas y corrige los problemas encontrados.

Si no puedes verificar un requisito o modelo, documenta la incertidumbre y crea un mecanismo para actualizarlo. No inventes datos para completar la base.

Al finalizar, presenta un resumen de la arquitectura, las funcionalidades implementadas, las pruebas ejecutadas, las fuentes utilizadas y las limitaciones que todavía existan.
