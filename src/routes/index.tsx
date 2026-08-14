import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Zap, 
  Activity, 
  Ruler, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  ArrowRight
} from "lucide-react";
import { 
  calculateVoltageDrop, 
  findSectionByAmpacity, 
  CABLE_SECTIONS, 
  Material 
} from "@/lib/electrical-utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "Dimensionador Elétrico | Profissional",
    meta: [
      { name: "description", content: "Dimensionamento de condutores e comandos elétricos por ampacity e queda de tensão." },
      { property: "og:title", content: "Dimensionador Elétrico | Comandos e Condutores" },
    ]
  })
});

function Index() {
  const [current, setCurrent] = useState<number>(10);
  const [length, setLength] = useState<number>(20);
  const [voltage, setVoltage] = useState<number>(220);
  const [phases, setPhases] = useState<1 | 3>(1);
  const [material, setMaterial] = useState<Material>("copper");
  const [maxVoltageDrop, setMaxVoltageDrop] = useState<number>(4);

  const results = useMemo(() => {
    const sectionByAmpacity = findSectionByAmpacity(material, current);
    
    if (!sectionByAmpacity) return null;

    let finalSection = sectionByAmpacity;
    let vDrop = calculateVoltageDrop(material, length, current, finalSection, voltage, phases);

    // Iteratively increase section until voltage drop is within limits
    const availableSections = CABLE_SECTIONS.filter(s => s >= sectionByAmpacity);
    for (const s of availableSections) {
      finalSection = s;
      vDrop = calculateVoltageDrop(material, length, current, finalSection, voltage, phases);
      if (vDrop <= maxVoltageDrop) break;
    }

    return {
      section: finalSection,
      voltageDrop: vDrop,
      ampacityLimit: sectionByAmpacity,
      isLimitedByVoltageDrop: finalSection > sectionByAmpacity
    };
  }, [current, length, voltage, phases, material, maxVoltageDrop]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white py-12 px-6 shadow-lg border-b-4 border-amber-500">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="bg-amber-500 p-4 rounded-2xl shadow-inner">
            <Zap size={48} className="text-slate-900 fill-slate-900" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              Dimensionador <span className="text-amber-500 text-glow">Pro</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg mt-1">
              Comandos Elétricos & Condutores • NBR 5410
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-[-40px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Inputs Section */}
          <div className="md:col-span-7 space-y-6">
            <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <Activity className="text-amber-500" />
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-700">Parâmetros de Entrada</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                {/* Current Input */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase flex justify-between">
                    Corrente do Projeto (A)
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">{current}A</span>
                  </label>
                  <input 
                    type="range" min="1" max="150" value={current} 
                    onChange={(e) => setCurrent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>1A</span>
                    <span>150A</span>
                  </div>
                </div>

                {/* Length Input */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase flex justify-between">
                    Comprimento do Trecho (m)
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">{length}m</span>
                  </label>
                  <input 
                    type="range" min="1" max="500" value={length} 
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>1m</span>
                    <span>500m</span>
                  </div>
                </div>

                {/* Grid for Selects */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Tensão (V)</label>
                    <select 
                      value={voltage} 
                      onChange={(e) => setVoltage(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    >
                      <option value={127}>127V</option>
                      <option value={220}>220V</option>
                      <option value={380}>380V</option>
                      <option value={440}>440V</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Fases</label>
                    <select 
                      value={phases} 
                      onChange={(e) => setPhases(Number(e.target.value) as 1 | 3)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    >
                      <option value={1}>Monofásico</option>
                      <option value={3}>Trifásico</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Material</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setMaterial('copper')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${material === 'copper' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
                      >
                        Cobre
                      </button>
                      <button 
                        onClick={() => setMaterial('aluminum')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${material === 'aluminum' ? 'bg-white shadow-sm text-slate-600' : 'text-slate-500'}`}
                      >
                        Alumínio
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Queda Máx (%)</label>
                    <select 
                      value={maxVoltageDrop} 
                      onChange={(e) => setMaxVoltageDrop(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    >
                      <option value={1}>1% (Crítico)</option>
                      <option value={3}>3% (Força)</option>
                      <option value={4}>4% (Padrão)</option>
                      <option value={5}>5% (Ilum.)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Results Section */}
          <div className="md:col-span-5">
            <div className="sticky top-6 space-y-6">
              <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border-b-8 border-amber-500">
                <div className="absolute top-[-20px] right-[-20px] text-white/5 pointer-events-none">
                  <Zap size={160} />
                </div>
                
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                  <Ruler className="text-amber-500" />
                  <h2 className="text-xl font-bold uppercase tracking-wider">Resultado Final</h2>
                </div>

                {results ? (
                  <div className="space-y-8 relative z-10">
                    <div className="text-center bg-white/5 py-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2">Seção do Condutor</p>
                      <h3 className="text-6xl font-black">{results.section}</h3>
                      <p className="text-2xl font-bold text-slate-400">mm²</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-amber-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase">Queda de Tensão</span>
                        </div>
                        <span className={`font-black ${results.voltageDrop > maxVoltageDrop ? 'text-red-500' : 'text-green-400'}`}>
                          {results.voltageDrop.toFixed(2)}%
                        </span>
                      </div>
                      
                      <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-amber-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase">Critério Limitante</span>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-500 px-2 py-1 rounded">
                          {results.isLimitedByVoltageDrop ? 'Queda de Tensão' : 'Ampacidade'}
                        </span>
                      </div>
                    </div>

                    {results.isLimitedByVoltageDrop && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                        <ShieldAlert className="text-amber-500 shrink-0" />
                        <p className="text-[11px] text-amber-200/80 font-medium leading-relaxed">
                          A seção foi aumentada de {results.ampacityLimit}mm² para {results.section}mm² para atender ao limite de queda de tensão de {maxVoltageDrop}%.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 italic">
                    <Info className="mx-auto mb-4 opacity-20" size={48} />
                    <p>Valores fora da escala padrão.</p>
                  </div>
                )}
              </section>

              {/* Tips/Secondary Section */}
              <section className="bg-amber-50 p-6 rounded-3xl border border-amber-200">
                <h4 className="font-bold text-slate-700 text-sm uppercase mb-4 flex items-center gap-2">
                  <Info size={16} className="text-amber-600" />
                  Dica de Comandos
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3 text-xs text-slate-600 bg-white/50 p-3 rounded-xl">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                    <p>Para motores, considere uma queda de tensão máxima de 7% durante a partida.</p>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-600 bg-white/50 p-3 rounded-xl">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                    <p>Use disjuntores com curva D para cargas altamente indutivas (motores).</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        .text-glow {
          text-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
        }
        input[type='range']::-webkit-slider-thumb {
          border: 4px solid white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}
