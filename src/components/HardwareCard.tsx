import React from 'react';
import { 
  XCircle, 
  AlertCircle, 
  Edit3, 
  Monitor, 
  Cpu, 
  Layers, 
  HardDrive, 
  Laptop,
  Check
} from 'lucide-react';
import { RequirementEvaluation } from '../lib/evaluation/types';

interface HardwareCardProps {
  requirement: RequirementEvaluation;
  iconType: 'gpu' | 'cpu' | 'ram' | 'os' | 'screen';
  confidenceLabel?: string;
  sourceApi?: string;
  onEdit: () => void;
}

export const HardwareCard: React.FC<HardwareCardProps> = ({
  requirement,
  iconType,
  confidenceLabel,
  onEdit
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'gpu':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'ram':
        return <HardDrive className="w-5 h-5 text-blue-400" />;
      case 'os':
        return <Laptop className="w-5 h-5 text-cyan-300" />;
      case 'screen':
        return <Monitor className="w-5 h-5 text-teal-300" />;
    }
  };

  const getStatus = () => {
    switch (requirement.status) {
      case 'confirmed_compatible':
        return {
          pill: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          label: 'Apto',
          icon: <Check className="w-3.5 h-3.5 text-cyan-400" />
        };
      case 'confirmed_incompatible':
        return {
          pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          label: 'No Apto',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'not_applicable':
        return {
          pill: 'bg-slate-800 text-slate-400 border-slate-700',
          label: 'Info',
          icon: null
        };
      case 'unknown':
      default:
        return {
          pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          label: 'Elegir',
          icon: <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
        };
    }
  };

  const status = getStatus();

  return (
    <div className="rounded-2xl border border-cyan-500/10 bg-dark-900/80 hover:bg-dark-850 hover:border-cyan-500/25 p-5 transition-all duration-200 flex flex-col justify-between group shadow-neon-card">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-dark-950 border border-cyan-500/10 text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
              {getIcon()}
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {requirement.name}
              </span>
              {confidenceLabel && (
                <span className="block text-[10px] text-cyan-500/70 font-mono">
                  {confidenceLabel}
                </span>
              )}
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.pill}`}>
            {status.icon}
            <span>{status.label}</span>
          </span>
        </div>

        {/* Value Display */}
        <div className="mt-2 py-2 px-3 rounded-xl bg-dark-950/80 border border-cyan-500/10 flex items-center justify-between">
          <span className="text-sm font-bold text-white truncate pr-2" title={requirement.userValue}>
            {requirement.userValue}
          </span>
          <button
            onClick={onEdit}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors shrink-0 px-2 py-0.5 rounded-md hover:bg-cyan-950/40"
          >
            <Edit3 className="w-3 h-3" />
            <span>Cambiar</span>
          </button>
        </div>

        {/* Clean Message */}
        <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
          {requirement.message}
        </p>
      </div>
    </div>
  );
};
