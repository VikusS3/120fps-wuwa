import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { HardwareOption } from '../data/compatibility/hardwareOptions';

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: HardwareOption[];
  placeholder: string;
  label: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
        {label}
      </label>

      {/* Input principal / Trigger */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#030508] border border-cyan-500/20 hover:border-cyan-500/40 focus-within:border-cyan-400 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all shadow-inner"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={isOpen ? searchTerm : value}
            placeholder={value || placeholder}
            onChange={handleCustomInput}
            onFocus={() => {
              setIsOpen(true);
              setSearchTerm(value);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown flotante */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-[#070a10] border border-cyan-500/30 shadow-neon-strong p-1.5 text-xs">
          {/* Opción personalizada directa si escribió algo que no coincide exacto */}
          {searchTerm.trim() && !options.some(o => o.label.toLowerCase() === searchTerm.toLowerCase()) && (
            <button
              type="button"
              onClick={() => handleSelect(searchTerm)}
              className="w-full text-left px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold mb-1 flex items-center justify-between"
            >
              <span>Usar valor escrito: "{searchTerm}"</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                Personalizado
              </span>
            </button>
          )}

          {/* Opciones filtradas */}
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const isSelected = value.toLowerCase() === item.label.toLowerCase();
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelect(item.label)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold' 
                      : 'text-slate-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-medium text-slate-100">{item.label}</span>
                    <span className="block text-[10px] text-cyan-500/70 font-mono">{item.category}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-slate-500 text-xs">
              No se encontraron coincidencias predefinidas. Pulsa Enter o usa el valor personalizado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
