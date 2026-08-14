import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Zap, 
  Activity, 
  Ruler, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Package,
  FileText,
  Truck,
  ArrowRight
} from "lucide-react";
import { 
  calculateVoltageDrop, 
  findSectionByAmpacity, 
  calculateMotorCurrent,
  pickThermalRelay,
  pickCeil,
  MOTOR_BREAKERS,
  CABLE_SECTIONS,
  CABLES,
  MIN_SECTION_POWER,
  Material,
  StartType,
  Brand
} from "@/lib/electrical-utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "Calculadora de Materiais e Orçamento | Industrial",
    meta: [
      { name: "description", content: "Dimensionamento profissional de condutores e comandos elétricos industriais." },
      { property: "og:title", content: "Calculadora de Materiais e Orçamento | Industrial" },
    ]
  })
});

function Index() {
  const [cv, setCv] = useState<number>(10);
  const [length, setLength] = useState<number>(20);
  const [voltage, setVoltage] = useState<number>(380);
  const [maxVoltageDrop, setMaxVoltageDrop] = useState<number>(4);
  const [startType, setStartType] = useState<StartType>("direta");
  const [brand, setBrand] = useState<Brand>("weg");
  const [quantity, setQuantity] = useState<number>(1);
  const [hourlyRate, setHourlyRate] = useState<number>(150);

  const results = useMemo(() => {
    const In = calculateMotorCurrent(cv, voltage);
    const thermalRelay = pickThermalRelay(In);
    const breaker = pickCeil(MOTOR_BREAKERS, In * 1.25);
    
    // Sizing conductor
    const sectionByAmpacity = findSectionByAmpacity('copper', In);
    let finalSection = sectionByAmpacity;
    
    // NBR 5410 Minimum for power circuits
    if (finalSection < MIN_SECTION_POWER) finalSection = MIN_SECTION_POWER;

    let vDrop = calculateVoltageDrop('copper', length, In, finalSection, voltage, 3);

    // Iteratively increase section if voltage drop exceeds limit
    const availableSections = CABLE_SECTIONS.filter(s => s >= finalSection);
    for (const s of availableSections) {
      finalSection = s;
      vDrop = calculateVoltageDrop('copper', length, In, finalSection, voltage, 3);
      if (vDrop <= maxVoltageDrop) break;
    }

    // Material list logic (simplified from base file)
    const baseItems = [
      { name: "Disjuntor Motor", spec: `${breaker}A`, qtd: quantity },
      { name: "Relé Térmico", spec: `${thermalRelay.min}-${thermalRelay.max}A`, qtd: quantity },
      { name: "Cabo Flexível", spec: `${finalSection}mm²`, qtd: length * 4 * quantity }, // 4 wires avg
    ];

    return {
      In,
      thermalRelay,
      breaker,
      section: finalSection,
      voltageDrop: vDrop,
      isLimitedByVoltageDrop: finalSection > sectionByAmpacity && finalSection > MIN_SECTION_POWER,
      items: baseItems
    };
  }, [cv, length, voltage, maxVoltageDrop, quantity]);

  return (
    <div className="min-h-screen bg-[#14181C] text-[#E8E6E1] font-sans selection:bg-amber-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(1200px_600px_at_90%_-10%,_rgba(242,183,5,0.06),_transparent)] pointer-events-none" />

      <div className="relative max-w-[1220px] mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-[#2A323A]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#212930] border border-[#2A323A] flex items-center justify-center shadow-lg">
              <Zap size={24} className="text-[#F2B705]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight uppercase">Calculadora de Materiais</h1>
              <span className="block text-[11px] text-[#8B95A1] font-mono tracking-wider mt-0.5">COMANDOS ELÉTRICOS INDUSTRIAIS</span>
            </div>
          </div>
          <div className="hidden sm:block px-3 py-1 rounded-full border border-[#F2B705]/30 bg-[#F2B705]/10 text-[#F2B705] text-[10px] font-mono tracking-widest uppercase">
            Orçamento Automático
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          
          {/* Sidebar - Inputs */}
          <aside className="space-y-4 sticky top-8">
            <div className="bg-[#1B2126] border border-[#2A323A] rounded-xl p-6 shadow-xl">
              <h3 className="text-[11px] font-mono font-bold text-[#B87333] uppercase tracking-widest mb-6 border-b border-[#2A323A] pb-3">Parâmetros Técnicos</h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] text-[#8B95A1] font-mono uppercase tracking-wider">Potência do Motor (CV)</label>
                  <input 
                    type="number" value={cv} onChange={(e) => setCv(Number(e.target.value))}
                    className="w-full bg-[#212930] border border-[#2A323A] text-white px-4 py-2.5 rounded-lg focus:border-[#F2B705] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-[#8B95A1] font-mono uppercase tracking-wider">Tensão (V)</label>
                  <select 
                    value={voltage} onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full bg-[#212930] border border-[#2A323A] text-white px-4 py-2.5 rounded-lg focus:border-[#F2B705] outline-none transition-colors appearance-none"
                  >
                    <option value={220}>220 V</option>
                    <option value={380}>380 V</option>
                    <option value={440}>440 V</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-[#8B95A1] font-mono uppercase tracking-wider">Distância Painel-Motor (m)</label>
                  <input 
                    type="number" value={length} onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full bg-[#212930] border border-[#2A323A] text-white px-4 py-2.5 rounded-lg focus:border-[#F2B705] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-[#8B95A1] font-mono uppercase tracking-wider">Queda Adm. (%)</label>
                  <input 
                    type="number" value={maxVoltageDrop} onChange={(e) => setMaxVoltageDrop(Number(e.target.value))}
                    className="w-full bg-[#212930] border border-[#2A323A] text-white px-4 py-2.5 rounded-lg focus:border-[#F2B705] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] text-[#8B95A1] font-mono uppercase tracking-wider">Qtd. Comandos</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#212930] border border-[#2A323A] text-white px-4 py-2.5 rounded-lg focus:border-[#F2B705] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#2A323A] rounded-xl overflow-hidden bg-[#1B2126] shadow-2xl">
              <div className="p-8 border-b md:border-b-0 md:border-r border-[#2A323A]">
                <span className="text-[11px] font-mono text-[#8B95A1] uppercase tracking-widest">Corrente Nominal (In)</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-6xl font-mono font-bold text-[#F2B705] drop-shadow-[0_0_20px_rgba(242,183,5,0.2)]">
                    {results.In.toFixed(1)}
                  </h2>
                  <span className="text-2xl font-mono text-[#8B95A1]">A</span>
                </div>
                <p className="mt-4 text-xs text-[#8B95A1] leading-relaxed">
                  Referência para motor de {cv} CV em {voltage}V.
                </p>
              </div>
              <div className="p-8 bg-[#10141A] flex flex-col justify-center items-center text-center">
                <div className="w-full max-w-[200px] border border-[#2A323A] rounded-lg p-4 flex flex-col items-center gap-4">
                  <Zap size={32} className="text-[#F2B705]" />
                  <div className="h-0.5 w-12 bg-[#2A323A]" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#B87333] flex items-center justify-center text-[#B87333] font-mono text-sm">M</div>
                </div>
                <span className="text-[10px] font-mono text-[#B87333] mt-4 uppercase tracking-widest">Esquema Simplificado</span>
              </div>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#1B2126] border border-[#2A323A] rounded-lg p-4">
                <span className="text-[10px] font-mono text-[#8B95A1] uppercase tracking-widest">Relé Térmico</span>
                <div className="text-lg font-mono font-bold mt-2 text-amber-600">{results.thermalRelay.min}-{results.thermalRelay.max}A</div>
              </div>
              <div className="bg-[#1B2126] border border-[#2A323A] rounded-lg p-4">
                <span className="text-[10px] font-mono text-[#8B95A1] uppercase tracking-widest">Disjuntor Motor</span>
                <div className="text-lg font-mono font-bold mt-2 text-amber-600">{results.breaker}A</div>
              </div>
              <div className="bg-[#1B2126] border border-[#2A323A] rounded-lg p-4 border-amber-500/40">
                <span className="text-[10px] font-mono text-[#8B95A1] uppercase tracking-widest">Bitola Adotada</span>
                <div className="text-lg font-mono font-bold mt-2 text-[#F2B705]">{results.section}mm²</div>
              </div>
              <div className="bg-[#1B2126] border border-[#2A323A] rounded-lg p-4">
                <span className="text-[10px] font-mono text-[#8B95A1] uppercase tracking-widest">Queda Tensão</span>
                <div className={`text-lg font-mono font-bold mt-2 ${results.voltageDrop > maxVoltageDrop ? 'text-red-500' : 'text-[#3FA796]'}`}>
                  {results.voltageDrop.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-[#1B2126] border border-[#2A323A] rounded-xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-[#2A323A] flex items-center justify-between">
                <h3 className="text-[11px] font-mono font-bold text-[#B87333] uppercase tracking-widest">Lista de Materiais Sugerida</h3>
                <FileText size={16} className="text-[#8B95A1]" />
              </div>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#10141A]">
                    <th className="px-6 py-4 font-mono text-[10px] text-[#8B95A1] uppercase tracking-wider">Item / Especificação</th>
                    <th className="px-6 py-4 font-mono text-[10px] text-[#8B95A1] uppercase tracking-wider text-right">Qtd.</th>
                    <th className="px-6 py-4 font-mono text-[10px] text-[#8B95A1] uppercase tracking-wider text-right">Preço Unit. (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A323A]">
                  {results.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#E8E6E1]">{item.name}</div>
                        <div className="text-[11px] text-[#8B95A1] mt-0.5">{item.spec}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-amber-500">{item.qtd}</td>
                      <td className="px-6 py-4 text-right font-mono text-[#8B95A1]">--</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Warnings / Info */}
            <div className="bg-[#212930] border border-[#2A323A] rounded-xl p-5 flex gap-4">
              <Info className="text-[#8B95A1] shrink-0 mt-0.5" size={18} />
              <div className="text-[11px] text-[#8B95A1] leading-relaxed space-y-2">
                <p>
                  <strong className="text-[#E8E6E1]">Critério de dimensionamento:</strong> A bitola final de <span className="text-[#F2B705]">{results.section}mm²</span> foi obtida comparando ampacidade (NBR 5410), queda de tensão ({maxVoltageDrop}%) e seção mínima normativa.
                </p>
                {results.isLimitedByVoltageDrop && (
                  <p className="text-amber-500/80 font-bold">
                    ⚠️ A seção foi aumentada devido ao critério de queda de tensão pela distância de {length}m.
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
