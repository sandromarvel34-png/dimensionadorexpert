import React, { useMemo } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

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
  title,
}) => {
  const html = useMemo(() => {
    try {
      if (!children) return "";
      return katex.renderToString(children, {
        displayMode,
        throwOnError: false,
        output: "html",
      });
    } catch (e) {
      console.error("KaTeX rendering error:", e);
      return typeof children === "string" ? children : "";
    }
  }, [children, displayMode]);

  return (
    <div
      className={cn(
        "w-full bg-slate-950 text-white rounded-[16px] p-5 md:p-7 space-y-5 overflow-hidden border border-slate-800 shadow-sm relative",
        className,
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 select-none pointer-events-none">
        <span className="text-8xl font-serif">∑</span>
      </div>

      {title && (
        <h4 className="text-[11px] font-semibold uppercase text-blue-300 tracking-[0.14em] mb-3">
          {title}
        </h4>
      )}

      <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar py-3 flex justify-center items-center min-h-[88px]">
        <div
          className="katex-formula text-base md:text-xl lg:text-2xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {legend && legend.length > 0 && (
        <div className="pt-6 border-t border-slate-800/50">
          <p className="text-xs font-semibold text-slate-500 mb-3">Onde:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
            {legend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1">
                <span
                  className="italic text-primary font-bold text-sm min-w-[30px] inline-flex items-center"
                  dangerouslySetInnerHTML={{
                    __html: item.symbol
                      ? katex.renderToString(item.symbol, { throwOnError: false, output: "html" })
                      : "",
                  }}
                />
                <span className="text-xs text-slate-400 font-medium">= {item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
