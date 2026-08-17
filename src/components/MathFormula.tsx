import React, { useMemo } from 'react';
import katex from 'katex';
import { cn } from '@/lib/utils';

interface MathFormulaProps {
  children: string;
  className?: string;
  displayMode?: boolean;
  legend?: Array<{ symbol: string; label: string }>;
  title?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ 
  children, 
  className, 
  displayMode = true,
  legend,
  title
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX rendering error:', e);
      return children;
    }
  }, [children, displayMode]);

  return (
    <div className={cn(
      "w-full bg-slate-900 text-white rounded-xl p-6 md:p-8 space-y-6 overflow-hidden border border-slate-800 shadow-2xl relative",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 select-none pointer-events-none">
        <span className="text-8xl font-serif">∑</span>
      </div>

      {title && (
        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">
          {title}
        </h4>
      )}

      <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar py-4 flex justify-center items-center min-h-[100px]">
        <div 
          className="katex-formula text-base md:text-xl lg:text-2xl"
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      </div>

      {legend && legend.length > 0 && (
        <div className="pt-6 border-t border-slate-800/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Onde:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
            {legend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1">
                <span 
                  className="italic text-primary font-bold text-sm min-w-[30px] inline-flex items-center"
                  dangerouslySetInnerHTML={{ __html: katex.renderToString(item.symbol, { throwOnError: false }) }} 
                />
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                  = {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
