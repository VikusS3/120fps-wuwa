import React from 'react';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';
import { OFFICIAL_SOURCES, DATABASE_METADATA } from '../data/compatibility/sources';

export const SourcesSection: React.FC = () => {
  const sourcesList = Object.values(OFFICIAL_SOURCES);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">
            Base de Datos y Fuentes Oficiales Verificadas
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>Última revisión: <strong className="text-slate-200">{DATABASE_METADATA.lastVerifiedDate}</strong></span>
          <span>•</span>
          <span>Versión: <strong className="text-cyan-400">{DATABASE_METADATA.version}</strong></span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {DATABASE_METADATA.authoritativeNotice}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {sourcesList.map((source) => (
          <div 
            key={source.id} 
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  WuWa v{source.gameVersion}
                </span>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {source.publicationDate}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 mb-2">
                {source.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {source.notes}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/40 flex items-center justify-end">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium transition-colors"
              >
                <span>Ver comunicado oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
