import { OfficialSource, GeneralRequirements } from './types';

export const OFFICIAL_SOURCES: Record<string, OfficialSource> = {
  'kuro-v1-2': {
    id: 'kuro-v1-2',
    title: 'Wuthering Waves Version 1.2 "In the Turquoise Moonglow" Patch Notes & Feature Update',
    shortLabel: 'Notas Parche v1.2 (Lanzamiento 120 FPS)',
    url: 'https://wutheringwaves.kurogames.com/en/main/news/detail/1149',
    publicationDate: '2024-08-15',
    gameVersion: '1.2',
    type: 'patch_notes',
    notes: 'Introdujo por primera vez el soporte nativo de 120 FPS en el cliente de PC, especificando la lista inicial estricta de GPUs compatibles (familias RTX 30/40 y RX 6000/7000) y requisitos de CPU de gama alta.'
  },
  'kuro-v2-1': {
    id: 'kuro-v2-1',
    title: 'Wuthering Waves Version 2.1 Update Details & Optimizations',
    shortLabel: 'Notas Parche v2.1',
    url: 'https://wutheringwaves.kurogames.com/en/main/news/detail/2154',
    publicationDate: '2025-01-23',
    gameVersion: '2.1',
    type: 'patch_notes',
    notes: 'Ampliación de optimizaciones gráficas y corrección de bloqueos en la detección de hardware para GPUs de portátiles.'
  },
  'kuro-v2-3': {
    id: 'kuro-v2-3',
    title: 'Version 2.3 "Fiery Arpeggio of Summer Reunion" Client Expansion',
    shortLabel: 'Anuncio Parche v2.3',
    url: 'https://wutheringwaves.gg/version-2-3-fiery-arpeggio-of-summer-reunion-patch-notes/',
    publicationDate: '2025-05-15',
    gameVersion: '2.3',
    type: 'official_announcement',
    notes: 'Lanzamiento y ajustes de compatibilidad gráfica junto con expansiones de plataforma.'
  },
  'kuro-v2-4': {
    id: 'kuro-v2-4',
    title: 'Wuthering Waves Version 2.4 Performance & Device Whitelist',
    shortLabel: 'Notas Parche v2.4',
    url: 'https://wutheringwaves.kurogames.com/en/main/news/detail/2801',
    publicationDate: '2025-07-10',
    gameVersion: '2.4',
    type: 'patch_notes',
    notes: 'Ampliación oficial del soporte de hardware para la opción de 120 FPS en PC y dispositivos portátiles de alto rendimiento.'
  },
  'kuro-system-reqs': {
    id: 'kuro-system-reqs',
    title: 'Wuthering Waves Official PC System Requirements',
    shortLabel: 'Requisitos de Sistema Oficiales PC',
    url: 'https://wutheringwaves.kurogames.com/es/main/news/detail/5272',
    publicationDate: '2024-05-20',
    gameVersion: '3.6 / Actual',
    type: 'system_requirements',
    notes: 'Requisitos mínimos y recomendados de base para el juego (Windows 10/11 64-bit, 16 GB RAM recomendados para alta tasa de cuadros, SSD obligatorio).'
  }
};

export const GENERAL_REQUIREMENTS: GeneralRequirements = {
  minRamGb: 8,
  recommendedRamGb: 16,
  supportedOS: ['Windows 10 64-bit', 'Windows 11 64-bit'],
  minScreenRefreshRate: 120
};

export const DATABASE_METADATA = {
  version: '2.4.1',
  lastVerifiedDate: '2026-10-28',
  authoritativeNotice: 'Base de datos verificada contra notas de lanzamiento oficiales de Kuro Games. Los modelos no listados expresamente se mantienen en estado "pendiente de revisión" por rigor técnico.'
};
