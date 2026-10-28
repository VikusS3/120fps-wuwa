import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: '¿Por qué no me aparece la opción de 120 FPS en Wuthering Waves?',
    answer: 'Kuro Games implementó un whitelist estricto de hardware en el cliente de PC. Si tu tarjeta gráfica o procesador no coinciden con los modelos oficialmente aprobados (mínimo serie RTX 3060 / RX 6700 XT y CPU moderna de 8 hilos), el juego oculta deliberadamente el selector de 120 FPS en el menú de gráficos.'
  },
  {
    question: '¿Qué tarjetas gráficas soportan 120 FPS en Wuthering Waves?',
    answer: 'Oficialmente se admiten las tarjetas NVIDIA GeForce RTX Serie 30 (a partir de RTX 3060), RTX Serie 40 (a partir de RTX 4050 Laptop), AMD Radeon RX Serie 6000 (a partir de RX 6700 XT) y AMD Radeon RX Serie 7000 (a partir de RX 7600), tanto en versiones de sobremesa como en variantes para laptops gaming.'
  },
  {
    question: '¿Cumplir con los requisitos garantiza 120 FPS estables?',
    answer: 'No. Cumplir los requisitos desbloquea la opción dentro del juego, pero mantener 120 FPS constantes depende de tu resolución (1080p, 1440p o 4K), el uso de escalado DLSS/FSR, las temperaturas de tu equipo y la configuración de gráficos en el menú.'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="rounded-2xl border border-cyan-500/15 bg-dark-900/60 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/10">
        <HelpCircle className="w-4 h-4 text-cyan-400" />
        <h3 className="font-display text-xs tracking-wider text-white uppercase font-bold">
          Preguntas Frecuentes sobre 120 FPS (FAQ)
        </h3>
      </div>

      <div className="space-y-2">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className="rounded-xl border border-cyan-500/10 bg-[#030508]/80 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 text-xs font-gamer font-bold text-slate-200 hover:text-cyan-300 transition-colors"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-3.5 pt-1 text-xs font-gamer text-slate-400 border-t border-cyan-500/5 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
