import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Zap, 
  Plus,
  ArrowRight,
  Calculator,
  ShieldCheck,
  FileText,
  Search,
  Sliders,
  ChevronRight
} from "lucide-react";
import { 
  calculateMotorCurrent,
  pickThermalRelay,
  pickCeil,
  MOTOR_BREAKERS,
  findSectionByAmpacity,
  calculateVoltageDrop,
  MIN_SECTION_POWER,
  CABLE_SECTIONS
} from "@/lib/electrical-utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "Calculadora Elétrica Pro | Dimensione. Confira. Decida.",
    meta: [
      { name: "description", content: "Dimensionamento profissional de condutores e comandos elétricos industriais." },
    ]
  })
});

function Index() {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');

  return (
    <div className="min-h-screen bg-[#14181C] text-[#E8E6E1] font-sans">
      <div className="fixed inset-0 bg-[radial-gradient(1200px_600px_at_90%_-10%,_rgba(242,183,5,0.06),_transparent)] pointer-events-none" />
      
      <div className="relative max-w-[1220px] mx-auto px-6 py-8">
        {view === 'dashboard' ? (
          <Dashboard setView={setView} />
        ) : (
          <Wizard setView={setView} />
        )}
      </div>
    </div>
  );
}

function Dashboard({ setView }: { setView: (v: 'dashboard' | 'wizard') => void }) {
  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#212930] border border-[#2A323A] flex items-center justify-center">
            <Zap className="text-[#F2B705]" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Calculadora Elétrica Pro</h1>
            <p className="text-sm text-[#8B95A1] font-mono mt-1">DIMENSIONE. CONFIRA. DECIDA.</p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full border border-[#F2B705]/30 bg-[#F2B705]/10 text-[#F2B705] text-xs font-mono tracking-widest uppercase">
          Acesso Vitalício
        </div>
      </header>

      <section className="bg-[#1B2126] border border-[#2A323A] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">⚡ Novo Dimensionamento</h2>
        <p className="text-[#8B95A1] max-w-lg mb-8">Encontre rapidamente o condutor, proteção e componentes ideais para sua aplicação.</p>
        <button 
          onClick={() => setView('wizard')}
          className="bg-[#F2B705] text-[#14181C] px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#D9A304] transition-colors"
        >
          <Plus size={20} /> + Novo dimensionamento
        </button>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-6">Meus dimensionamentos</h3>
        <div className="border border-[#2A323A] rounded-xl p-8 text-center text-[#8B95A1]">
          Nenhum dimensionamento realizado ainda.
        </div>
      </section>
    </div>
  );
}

function Wizard({ setView }: { setView: (v: 'dashboard' | 'wizard') => void }) {
  const [step, setStep] = useState(1);
  const [cv, setCv] = useState(10);
  const [voltage, setVoltage] = useState(380);
  const [distance, setDistance] = useState(20);
  const [maxDrop, setMaxDrop] = useState(4);

  const results = useMemo(() => {
    const In = calculateMotorCurrent(cv, voltage);
    const thermalRelay = pickThermalRelay(In);
    const breaker = pickCeil(MOTOR_BREAKERS, In * 1.25);
    const sectionByAmpacity = findSectionByAmpacity('copper', In);
    let finalSection = Math.max(sectionByAmpacity, MIN_SECTION_POWER);
    let vDrop = calculateVoltageDrop('copper', distance, In, finalSection, voltage, 3);
    const availableSections = CABLE_SECTIONS.filter(s => s >= finalSection);
    for (const s of availableSections) {
      finalSection = s;
      vDrop = calculateVoltageDrop('copper', distance, In, finalSection, voltage, 3);
      if (vDrop <= maxDrop) break;
    }
    return { In, thermalRelay, breaker, section: finalSection, vDrop };
  }, [cv, voltage, distance, maxDrop]);

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => setView('dashboard')} className="text-[#8B95A1] hover:text-white mb-8 flex items-center gap-1 text-sm">
        ← Voltar
      </button>

      <div className="flex gap-4 mb-8 text-sm font-mono text-[#8B95A1]">
        {['Carga', 'Circuito', 'Proteção', 'Resultado'].map((s, i) => (
          <div key={s} className={step === i + 1 ? 'text-[#F2B705]' : ''}>{i + 1}. {s}</div>
        ))}
      </div>

      <div className="bg-[#1B2126] border border-[#2A323A] rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Configuração da Carga</h2>
            <div className="space-y-2">
              <label className="text-xs uppercase text-[#8B95A1] font-mono">Potência (CV)</label>
              <input type="number" value={cv} onChange={e => setCv(Number(e.target.value))} className="w-full bg-[#212930] p-3 rounded-lg border border-[#2A323A]" />
            </div>
            <button onClick={() => setStep(2)} className="bg-[#F2B705] text-[#14181C] px-6 py-2 rounded-lg font-bold">Próximo</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Dados do Circuito</h2>
            <div className="space-y-2">
              <label className="text-xs uppercase text-[#8B95A1] font-mono">Distância (m)</label>
              <input type="number" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full bg-[#212930] p-3 rounded-lg border border-[#2A323A]" />
            </div>
            <button onClick={() => setStep(4)} className="bg-[#F2B705] text-[#14181C] px-6 py-2 rounded-lg font-bold">Calcular Resultado</button>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Dimensionamento Concluído</h2>
            <div className="bg-[#10141A] p-6 rounded-xl border border-[#2A323A]">
              <span className="text-xs text-[#8B95A1] uppercase font-mono">Condutor Dimensionado</span>
              <div className="text-5xl font-bold text-[#F2B705] my-4">{results.section}mm²</div>
              <p className="text-sm text-[#8B95A1]">Seção final considera o maior resultado entre capacidade de corrente e queda de tensão.</p>
            </div>
            <button onClick={() => setView('dashboard')} className="w-full border border-[#2A323A] py-3 rounded-lg font-bold hover:bg-[#212930]">Novo Dimensionamento</button>
          </div>
        )}
      </div>
    </div>
  );
}
