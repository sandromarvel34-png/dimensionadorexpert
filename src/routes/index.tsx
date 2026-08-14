import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Technical Data Constants
const contatores: number[] = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 105, 150, 170, 210, 250, 300];
const termicos = [
  { min: 0.4, max: 0.63 }, { min: 0.63, max: 1 }, { min: 1, max: 1.6 }, { min: 1.6, max: 2.5 },
  { min: 2.5, max: 4 }, { min: 4, max: 6 }, { min: 5.5, max: 8 }, { min: 7, max: 10 }, { min: 9, max: 13 },
  { min: 12, max: 18 }, { min: 17, max: 25 }, { min: 23, max: 32 }, { min: 30, max: 40 }, { min: 37, max: 50 },
  { min: 48, max: 65 }, { min: 55, max: 70 }, { min: 63, max: 80 }, { min: 70, max: 104 }
];
const disjuntores = [4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 225];
const cabos = [
  { mm: 1.5, amp: 17.5, precoM: 1.8 }, { mm: 2.5, amp: 24, precoM: 2.8 }, { mm: 4, amp: 32, precoM: 4.5 },
  { mm: 6, amp: 41, precoM: 6.8 }, { mm: 10, amp: 57, precoM: 11.5 }, { mm: 16, amp: 76, precoM: 18 },
  { mm: 25, amp: 101, precoM: 28 }, { mm: 35, amp: 125, precoM: 40 }, { mm: 50, amp: 151, precoM: 58 },
  { mm: 70, amp: 192, precoM: 82 }, { mm: 95, amp: 232, precoM: 112 }
];

const paineis = {
  basico: { label: "Básico", ip: "IP54", preco: 180, hint: "Embutir · IP54 · sem etiquetas/sinalização extra · uso interno protegido" },
  padrao: { label: "Padrão", ip: "IP54/IP55", preco: 320, hint: "Sobrepor · IP54/55 · borne seccionável · etiquetas de identificação" },
  premium: { label: "Premium", ip: "IP65", preco: 560, hint: "Inox/epóxi · IP65 · fechadura + emergência · prensa-cabos vedado" }
};

const modelosContator = {
  weg: (r: number) => "CWM" + (r < 10 ? "0" + r : r),
  siemens: (r: number) => ({ 9: "3RT2016", 12: "3RT2017", 18: "3RT2018", 25: "3RT2026", 32: "3RT2027", 40: "3RT2035", 50: "3RT2036", 65: "3RT2037", 80: "3RT2038", 95: "3RT2045", 105: "3RT2046" }[r] || "linha 3RT1 — consultar catálogo"),
  schneider: (r: number) => (r <= 32 ? "LC1D" + r : (r <= 80 ? "LC1E" + r : "linha TeSys F — consultar catálogo"))
};

const nomeMarca: Record<string, string> = { weg: "WEG", siemens: "Siemens", schneider: "Schneider" };
const linhaReleTermico: Record<string, string> = { weg: "RW27", siemens: "3RU2", schneider: "LRD" };
const linhaDisjuntorMotor: Record<string, string> = { weg: "MPW", siemens: "3RV2", schneider: "GV2ME/GV3ME" };
const linhaSoft: Record<string, string> = { weg: "SSW", siemens: "SIRIUS 3RW", schneider: "Altistart ATS" };
const linhaInversor: Record<string, string> = { weg: "CFW", siemens: "SINAMICS G120", schneider: "Altivar ATV" };

const SECAO_MINIMA_FORCA = 2.5;

export const Route = createFileRoute("/")({
  component: CalculatorComponent,
});

function CalculatorComponent() {
  const [view, setView] = useState<'dashboard' | 'wizard' | 'results'>('dashboard');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propNumero: "0001",
    propData: new Date().toISOString().split('T')[0],
    cliNome: "",
    cliDoc: "",
    cliContato: "",
    tecNome: "",
    propLocal: "",
    tipoPartida: "direta",
    marca: "weg",
    potencia: 10,
    tensao: 380,
    quantidade: 1,
    distancia: 20,
    quedaAdm: 4,
    padrao: "padrao",
    valorHora: 150
  });

  const [horasEstimadas, setHorasEstimadas] = useState(0);
  const [valorHoraTabela, setValorHoraTabela] = useState(150);
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('calc_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (res: any) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      name: formData.cliNome || "Sem nome",
      potencia: formData.potencia,
      tensao: formData.tensao,
      cabo: res.caboFinal?.mm,
      marca: formData.marca,
      tipoPartida: formData.tipoPartida
    };
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('calc_history', JSON.stringify(newHistory));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: id === 'potencia' || id === 'tensao' || id === 'quantidade' || id === 'distancia' || id === 'quedaAdm' || id === 'valorHora' ? parseFloat(value) : value }));
  };

  const pickCeil = (arr: number[], target: number) => {
    for (const v of arr) { if (v >= target) return v; }
    return arr[arr.length - 1];
  };

  const pickTermico = (target: number) => {
    for (const r of termicos) { if (target >= r.min && target <= r.max) return r; }
    return termicos[termicos.length - 1];
  };

  const pickCaboBySection = (target: number) => {
    for (const c of cabos) { if (c.mm >= target) return c; }
    return cabos[cabos.length - 1];
  };

  const pickCaboByAmp = (target: number) => {
    for (const c of cabos) { if (c.amp >= target) return c; }
    return cabos[cabos.length - 1];
  };

  const precoRef = (baseWEG: number, indice: number, brand: string) => {
    const mult: Record<string, number> = { weg: 1, siemens: 1.75, schneider: 1.5 };
    return Math.round(baseWEG * (1 + indice * 1.8) * (mult[brand] || 1));
  };

  const calculate = () => {
    const { potencia, tensao, distancia, quedaAdm, tipoPartida, marca, quantidade, padrao, valorHora } = formData;
    const fatores: Record<number, number> = { 220: 2.639, 380: 1.529, 440: 1.320 };
    const In = potencia * (fatores[tensao] || 1.529);
    const termico = pickTermico(In);
    const disjuntor = pickCeil(disjuntores, In * 1.25);
    const caboAmpacidade = pickCaboByAmp(In);
    const rho = 0.0178;
    const cosphi = 0.86;
    const S = (100 * Math.sqrt(3) * rho * distancia * In * cosphi) / (quedaAdm * tensao);
    const caboQuedaTensao = pickCaboBySection(S);
    const caboMinimoNBR = cabos.find(c => c.mm === SECAO_MINIMA_FORCA) || cabos[1];
    const caboFinal = [caboAmpacidade, caboQuedaTensao, caboMinimoNBR].reduce((a, b) => {
      if (!a || !b) return a || b;
      return b.mm > a.mm ? b : a;
    });

    const materials: any[] = [];
    const brands = marca === "comparar" ? ["weg", "siemens", "schneider"] : [marca];

    const addContator = (label: string, amps: number, baseWEG: number) => {
      const pickedRating = pickCeil(contatores, amps);
      const rating = (pickedRating !== undefined ? pickedRating : contatores[contatores.length - 1]) as number;
      const foundIdx = contatores.indexOf(rating);
      const denominator = contatores.length - 1;
      const idx = (foundIdx === -1 ? denominator : foundIdx) / denominator;
      brands.forEach(b => {
        const brandKey = b as keyof typeof modelosContator;
        const brandName = (nomeMarca[b] || b) as string;
        materials.push({
          item: marca === "comparar" ? `${label} (${brandName})` : label,
          desc: `${rating} A AC-3 · ${modelosContator[brandKey](rating)} — ${brandName}`,
          qtd: quantidade, un: "un", preco: precoRef(baseWEG, idx, b)
        });
      });
    };

    const addLinha = (label: string, desc: string, baseWEG: number, map: any) => {
      brands.forEach(b => {
        materials.push({
          item: marca === "comparar" ? `${label} (${nomeMarca[b]})` : label,
          desc: `${desc} · linha ${map[b]} — ${nomeMarca[b]}`,
          qtd: quantidade, un: "un", preco: precoRef(baseWEG, 0.4, b)
        });
      });
    };

    if (tipoPartida === "direta") addContator("Contator", In * 1.15, 85);
    else if (tipoPartida === "reversao") {
      addContator("Contator (linha)", In * 1.15, 85);
      addContator("Contator (reversão)", In * 1.15, 85);
      materials.push({ item: "Bloco de intertravamento mecânico", desc: "compatível", qtd: quantidade, un: "un", preco: 45 });
    } else if (tipoPartida === "estrelaTriangulo") {
      addContator("Contator (linha)", In * 1.15, 85);
      addContator("Contator (triângulo)", In * 1.15, 85);
      addContator("Contator (estrela)", (In / 1.73) * 1.15, 70);
      materials.push({ item: "Relé de tempo", desc: "Y/Δ", qtd: quantidade, un: "un", preco: 75 });
    } else if (tipoPartida === "compensada") {
      materials.push({ item: "Autotransformador", desc: `${In.toFixed(1)} A`, qtd: quantidade, un: "un", preco: 420 });
      addContator("Contator (rede)", In * 1.15, 85);
      addContator("Contator (partida)", In * 1.15, 85);
      materials.push({ item: "Relé de tempo", desc: "0,1-30s", qtd: quantidade, un: "un", preco: 75 });
    } else if (tipoPartida === "softstarter") {
      addLinha("Soft-starter", `${In.toFixed(1)} A`, 750, linhaSoft);
      addContator("Contator bypass", In * 1.15, 70);
    } else if (tipoPartida === "inversor") {
      addLinha("Inversor", `${In.toFixed(1)} A`, 850, linhaInversor);
      materials.push({ item: "Reator de linha", desc: "opcional", qtd: quantidade, un: "un", preco: 180 });
    }

    addLinha("Relé térmico", `ajuste ${termico?.min}–${termico?.max} A`, 65, linhaReleTermico);
    addLinha("Disjuntor motor", `${disjuntor} A`, 95, linhaDisjuntorMotor);

    const conds: Record<string, number> = { direta: 4, reversao: 5, estrelaTriangulo: 7, compensada: 6, softstarter: 4, inversor: 4 };
    const metrosCabo = distancia * (conds[tipoPartida] || 4) * quantidade;

    materials.push(
      { item: "Botoeira", desc: tipoPartida === "reversao" ? "reversora" : "liga/desliga", qtd: quantidade, un: "un", preco: tipoPartida === "reversao" ? 65 : 32 },
      { item: "Sinaleiro", desc: "liga/desliga", qtd: quantidade * 2, un: "un", preco: 16 },
      { item: "Cabo flexível", desc: `${caboFinal?.mm} mm²`, qtd: metrosCabo, un: "m", preco: caboFinal?.precoM || 0 },
      { item: "Kit Trilho DIN", desc: "fixação", qtd: quantidade, un: "kit", preco: 55 },
      { item: "Bornes e terminais", desc: "identificação", qtd: quantidade, un: "kit", preco: 28 }
    );

    const painel = paineis[padrao as keyof typeof paineis];
    materials.push({ item: "Gabinete elétrico", desc: `Padrão ${padrao}`, qtd: 1, un: "un", preco: painel ? painel.preco : 0 });
    if (padrao === "premium") materials.push({ item: "Emergência + Fechadura", desc: "Premium", qtd: 1, un: "un", preco: 120 });

    const horasBase: Record<string, number> = { direta: 3, reversao: 4, estrelaTriangulo: 6, compensada: 6.5, softstarter: 4, inversor: 4.5 };
    const hMontagem = (horasBase[tipoPartida] || 3) * (1 + (quantidade - 1) * 0.6);
    const hCabo = metrosCabo / 20;
    const hAcab = (paineis[padrao as keyof typeof paineis] ? { basico: 0, padrao: 1, premium: 2 }[padrao as keyof typeof paineis] : 1) || 0;
    const horasTotais = Math.round((hMontagem + hCabo + hAcab) * 10) / 10;

    setHorasEstimadas(horasTotais);
    setValorHoraTabela(valorHora);

    const res = {
      In, termico, disjuntor, caboAmpacidade, caboQuedaTensao, caboFinal,
      materials, horasTotais, valorHora
    };
    setResults(res);
    saveToHistory(res);
    setView('results');
  };

  const updateMaterialPrice = (index: number, newPrice: number) => {
    setResults((prev: any) => {
      const newMaterials = [...prev.materials];
      newMaterials[index].preco = newPrice;
      return { ...prev, materials: newMaterials };
    });
  };

  const fmt = (n: number) => "R$ " + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalMateriais = results ? results.materials.reduce((acc: number, m: any) => acc + (m.qtd * m.preco), 0) : 0;
  const totalMaoObra = horasEstimadas * valorHoraTabela;

  return (
    <div className="wrap">
      <div className="print-only">
        <h2>Proposta Comercial — Comandos Elétricos Industriais</h2>
        <div className="pgrid">
          <div><strong>Proposta nº:</strong> {formData.propNumero || "—"}</div>
          <div><strong>Data:</strong> {formData.propData || "—"}</div>
          <div><strong>Cliente:</strong> {formData.cliNome || "—"}</div>
          <div><strong>CNPJ/CPF:</strong> {formData.cliDoc || "—"}</div>
          <div><strong>Contato:</strong> {formData.cliContato || "—"}</div>
          <div><strong>Técnico responsável:</strong> {formData.tecNome || "—"}</div>
        </div>
      </div>

      <header className="top">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#F2B705" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8h3M8 12h3M8 16h3M15 8v8" /><circle cx="17" cy="16" r="1.4" fill="#F2B705" stroke="none" /></svg>
          </div>
          <div>
            <h1>Calculadora Elétrica Pro</h1>
            <span>Dimensione. Confira. Decida.</span>
          </div>
        </div>
        <div className="badge">ACESSO VITALÍCIO</div>
      </header>

      {view === 'dashboard' && (
        <div className="dashboard">
          <section className="dashboard-hero">
            <h2>⚡ Novo Dimensionamento</h2>
            <p>Encontre rapidamente o condutor, proteção e componentes ideais para sua aplicação.</p>
            <button className="btn-large" onClick={() => { setView('wizard'); setStep(1); }}>
              + Novo dimensionamento
            </button>
            
            <div className="info-cards">
              <div className="info-card"><i>🔌</i> Condutor dimensionado</div>
              <div className="info-card"><i>📐</i> Queda de tensão</div>
              <div className="info-card"><i>🛡️</i> Proteção recomendada</div>
              <div className="info-card"><i>⚙️</i> Contator / Relé</div>
              <div className="info-card"><i>🏭</i> Catálogo WEG/Siemens/Schneider</div>
              <div className="info-card"><i>📄</i> Exportação PDF</div>
            </div>
          </section>

          <section className="card">
            <h3>Meus dimensionamentos</h3>
            {history.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>
                Nenhum dimensionamento salvo ainda.
              </p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Carga</th>
                    <th>Condutor</th>
                    <th>Marca</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.name}</td>
                      <td>{item.potencia} CV / {item.tensao}V</td>
                      <td>{item.cabo} mm²</td>
                      <td>{nomeMarca[item.marca] || item.marca}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn secondary" style={{ width: 'auto', padding: '4px 12px', margin: 0 }} onClick={() => {
                          setFormData(prev => ({ ...prev, cliNome: item.name, potencia: item.potencia, tensao: item.tensao, marca: item.marca, tipoPartida: item.tipoPartida }));
                          calculate();
                        }}>Abrir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {view === 'wizard' && (
        <div className="wizard">
          <div className="wizard-steps">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
              <div className="step-circle">1</div>
              Carga
            </div>
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              Circuito
            </div>
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              Proteção
            </div>
            <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
              <div className="step-circle">4</div>
              Resultado
            </div>
          </div>

          <div className="card">
            {step === 1 && (
              <div className="step-content">
                <h3>Etapa 1 — Carga e Motor</h3>
                <div className="client-grid">
                  <div className="field">
                    <label>Nome do Cliente</label>
                    <input type="text" id="cliNome" value={formData.cliNome} onChange={handleChange} placeholder="Ex: Indústria XYZ" />
                  </div>
                  <div className="field">
                    <label>Potência do Motor (CV)</label>
                    <input type="number" id="potencia" value={formData.potencia} onChange={handleChange} min="0.5" step="0.5" />
                    <div className="hint">Potência nominal do motor em Cavalos-Vapor.</div>
                  </div>
                  <div className="field">
                    <label>Tensão de Trabalho (V)</label>
                    <select id="tensao" value={formData.tensao} onChange={handleChange}>
                      <option value="220">220 V</option>
                      <option value="380">380 V</option>
                      <option value="440">440 V</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Quantidade de Motores</label>
                    <input type="number" id="quantidade" value={formData.quantidade} onChange={handleChange} min="1" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <h3>Etapa 2 — Parâmetros do Circuito</h3>
                <div className="client-grid">
                  <div className="field">
                    <label>Distância do Circuito (m)</label>
                    <input type="number" id="distancia" value={formData.distancia} onChange={handleChange} min="1" />
                    <div className="hint">Distância considerada no cálculo de queda de tensão.</div>
                  </div>
                  <div className="field">
                    <label>Queda de Tensão Admitida (%)</label>
                    <input type="number" id="quedaAdm" value={formData.quedaAdm} onChange={handleChange} min="1" step="0.5" />
                    <div className="hint">Limite máximo de queda de tensão permitido (NBR 5410).</div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <h3>Etapa 3 — Proteção e Fabricante</h3>
                <div className="client-grid">
                  <div className="field">
                    <label>Tipo de Partida</label>
                    <select id="tipoPartida" value={formData.tipoPartida} onChange={handleChange}>
                      <option value="direta">Partida Direta</option>
                      <option value="reversao">Partida com Reversão</option>
                      <option value="estrelaTriangulo">Estrela-Triângulo</option>
                      <option value="softstarter">Soft-Starter</option>
                      <option value="inversor">Inversor de Frequência</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Fabricante Preferencial</label>
                    <select id="marca" value={formData.marca} onChange={handleChange}>
                      <option value="weg">WEG</option>
                      <option value="siemens">Siemens</option>
                      <option value="schneider">Schneider</option>
                      <option value="comparar">Todos (Comparativo)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Padrão do Painel</label>
                    <select id="padrao" value={formData.padrao} onChange={handleChange}>
                      <option value="basico">Básico</option>
                      <option value="padrao">Padrão</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Valor da Hora Técnica (R$)</label>
                    <input type="number" id="valorHora" value={formData.valorHora} onChange={handleChange} min="0" step="5" />
                  </div>
                </div>
              </div>
            )}

            <div className="wizard-footer">
              {step > 1 ? (
                <button className="btn secondary" onClick={() => setStep(step - 1)}>Anterior</button>
              ) : (
                <button className="btn secondary" onClick={() => setView('dashboard')}>Cancelar</button>
              )}
              
              {step < 3 ? (
                <button className="btn" onClick={() => setStep(step + 1)}>Próximo</button>
              ) : (
                <button className="btn" onClick={calculate}>Gerar Solução</button>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'results' && results && (
        <div className="results-view">
          <div className="result-main-card">
            <h2>CONDUTOR DIMENSIONADO</h2>
            <div className="value">{results.caboFinal ? `${results.caboFinal.mm} mm²` : "—"}</div>
            <div className="badge-status">🟢 Dimensionamento concluído</div>
            <div className="rt-sub" style={{ marginTop: '20px' }}>
              A seção final considera o maior resultado entre capacidade de corrente, queda de tensão e norma NBR 5410.
            </div>
            <button className="btn secondary" style={{ width: 'auto', marginTop: '20px' }} onClick={() => {
              const el = document.getElementById('calc-memory');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>Ver memória de cálculo</button>
          </div>

          <div className="info-cards" style={{ marginBottom: '30px' }}>
            <div className="info-card">
              <h3>🔌 Condutor</h3>
              <div className="v">{results.caboFinal?.mm} mm²</div>
              <div className="hint">Material compatível</div>
            </div>
            <div className="info-card">
              <h3>🛡️ Disjuntor</h3>
              <div className="v">{results.disjuntor} A</div>
              <div className="hint">Proteção recomendada</div>
            </div>
            <div className="info-card">
              <h3>⚙️ Contator</h3>
              <div className="v">{results.In > 0 ? "Compatível" : "—"}</div>
              <div className="hint">Manobra de carga</div>
            </div>
            <div className="info-card">
              <h3>🌡️ Relé Térmico</h3>
              <div className="v">{results.termico ? `${results.termico.min}–${results.termico.max} A` : "—"}</div>
              <div className="hint">Faixa de ajuste</div>
            </div>
          </div>

          <div className="card">
            <h3>Solução recomendada por fabricante</h3>
            <table>
              <thead>
                <tr>
                  <th>Componente</th>
                  <th>WEG</th>
                  <th>Siemens</th>
                  <th>Schneider</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="item">Contator</td>
                  <td>{modelosContator.weg(pickCeil(contatores, results.In * 1.15))}</td>
                  <td>{modelosContator.siemens(pickCeil(contatores, results.In * 1.15))}</td>
                  <td>{modelosContator.schneider(pickCeil(contatores, results.In * 1.15))}</td>
                </tr>
                <tr>
                  <td className="item">Relé Térmico</td>
                  <td>{linhaReleTermico.weg}</td>
                  <td>{linhaReleTermico.siemens}</td>
                  <td>{linhaReleTermico.schneider}</td>
                </tr>
                <tr>
                  <td className="item">Disjuntor Motor</td>
                  <td>{linhaDisjuntorMotor.weg}</td>
                  <td>{linhaDisjuntorMotor.siemens}</td>
                  <td>{linhaDisjuntorMotor.schneider}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="calc-memory" className="card">
            <h3>Memória de cálculo</h3>
            <div className="disclaimer">
              <strong>1. Corrente de Projeto:</strong><br />
              In = (Potência em CV × fator) / Tensão<br />
              In = ({formData.potencia} × {(results.In / formData.potencia).toFixed(3)}) / {formData.tensao}<br />
              <strong>Resultado: {results.In.toFixed(2)} A</strong>
            </div>
            <div className="disclaimer" style={{ marginTop: '10px' }}>
              <strong>2. Critério 1 — Capacidade de Corrente:</strong><br />
              Seção mínima para {results.In.toFixed(2)} A: {results.caboAmpacidade.mm} mm²<br />
              Capacidade do cabo: {results.caboAmpacidade.amp} A
            </div>
            <div className="disclaimer" style={{ marginTop: '10px' }}>
              <strong>3. Critério 2 — Queda de Tensão:</strong><br />
              Distância: {formData.distancia}m | Tensão: {formData.tensao}V<br />
              Queda calculada: {formData.quedaAdm}% | Seção necessária: {results.caboQuedaTensao.mm} mm²
            </div>
            <div className="disclaimer" style={{ marginTop: '10px', background: 'var(--panel)' }}>
              <strong>4. Seleção Final:</strong><br />
              Capacidade de corrente: {results.caboAmpacidade.mm} mm²<br />
              Queda de tensão: {results.caboQuedaTensao.mm} mm²<br />
              Seção mínima NBR 5410: {SECAO_MINIMA_FORCA} mm²<br />
              <strong>CONDUTOR FINAL ADOTADO: {results.caboFinal.mm} mm²</strong>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="btn secondary" onClick={() => setView('wizard')}>Voltar e Ajustar</button>
            <button className="btn" onClick={() => window.print()}>Exportar Proposta</button>
          </div>
        </div>
      )}

          <div className="disclaimer">
            <strong>Sobre os valores e modelos:</strong>
            <ul>
              <li>A corrente do motor é estimada por fórmula técnica com cos φ e rendimento médios — confira sempre a placa do motor.</li>
              <li>A bitola do cabo é calculada por três critérios — ampacidade, queda de tensão e seção mínima de 2,5 mm² para circuitos de força (Tabela 6.1 da NBR 5410) — e a maior das três é a indicada.</li>
              <li>Os modelos WEG, Siemens e Schneider indicados seguem a nomenclatura pública das linhas CWM, SIRIUS (3RT) e TeSys (LC1D/LC1E/LC1F). Para correntes muito altas ou linhas específicas, o código exato deve ser confirmado no catálogo do fabricante antes da compra.</li>
              <li>Preços de materiais e o valor da hora técnica são referências de mercado, totalmente editáveis — ajuste conforme seu fornecedor, região e o tempo real observado em campo.</li>
            </ul>
          </div>
          <div id="printFooter" className="print-only">
            <div className="local">{formData.propLocal}, {formData.propData}</div>
            <div className="assinaturas">
              <div><div className="linha">&nbsp;</div><span>{formData.tecNome || "—"}</span><br />Técnico Responsável</div>
              <div><div className="linha">&nbsp;</div><span>{formData.cliNome || "—"}</span><br />Cliente</div>
            </div>
          </div>
    </div>
  );
}
