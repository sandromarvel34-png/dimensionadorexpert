import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Technical Data Constants
const contatores = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 105, 150, 170, 210, 250, 300];
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

  const [results, setResults] = useState<any>(null);

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
    const In = potencia * fatores[tensao];
    const termico = pickTermico(In);
    const disjuntor = pickCeil(disjuntores, In * 1.25);
    const caboAmpacidade = pickCaboByAmp(In);
    const rho = 0.0178;
    const cosphi = 0.86;
    const S = (100 * Math.sqrt(3) * rho * distancia * In * cosphi) / (quedaAdm * tensao);
    const caboQuedaTensao = pickCaboBySection(S);
    const caboMinimoNBR = cabos.find(c => c.mm === SECAO_MINIMA_FORCA)!;
    const caboFinal = [caboAmpacidade, caboQuedaTensao, caboMinimoNBR].reduce((a, b) => {
      if (!a || !b) return a || b;
      return b.mm > a.mm ? b : a;
    });

    const materials: any[] = [];
    const brands = marca === "comparar" ? ["weg", "siemens", "schneider"] : [marca];

    const addContator = (label: string, amps: number, baseWEG: number) => {
      const rating = pickCeil(contatores, amps) || contatores[contatores.length - 1];
      const idx = contatores.indexOf(rating) / (contatores.length - 1);
      brands.forEach(b => {
        materials.push({
          item: marca === "comparar" ? `${label} (${nomeMarca[b]})` : label,
          desc: `${rating} A AC-3 · ${modelosContator[b as keyof typeof modelosContator](rating)} — ${nomeMarca[b]}`,
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

    addLinha("Relé térmico", `ajuste ${termico.min}–${termico.max} A`, 65, linhaReleTermico);
    addLinha("Disjuntor motor", `${disjuntor} A`, 95, linhaDisjuntorMotor);

    const conds: Record<string, number> = { direta: 4, reversao: 5, estrelaTriangulo: 7, compensada: 6, softstarter: 4, inversor: 4 };
    const metrosCabo = distancia * (conds[tipoPartida] || 4) * quantidade;

    materials.push(
      { item: "Botoeira", desc: tipoPartida === "reversao" ? "reversora" : "liga/desliga", qtd: quantidade, un: "un", preco: tipoPartida === "reversao" ? 65 : 32 },
      { item: "Sinaleiro", desc: "liga/desliga", qtd: quantidade * 2, un: "un", preco: 16 },
      { item: "Cabo flexível", desc: `${caboFinal.mm} mm²`, qtd: metrosCabo, un: "m", preco: caboFinal.precoM },
      { item: "Kit Trilho DIN", desc: "fixação", qtd: quantidade, un: "kit", preco: 55 },
      { item: "Bornes e terminais", desc: "identificação", qtd: quantidade, un: "kit", preco: 28 }
    );

    materials.push({ item: "Gabinete elétrico", desc: `Padrão ${padrao}`, qtd: 1, un: "un", preco: paineis[padrao as keyof typeof paineis].preco });
    if (padrao === "premium") materials.push({ item: "Emergência + Fechadura", desc: "Premium", qtd: 1, un: "un", preco: 120 });

    const horasBase: Record<string, number> = { direta: 3, reversao: 4, estrelaTriangulo: 6, compensada: 6.5, softstarter: 4, inversor: 4.5 };
    const hMontagem = horasBase[tipoPartida] * (1 + (quantidade - 1) * 0.6);
    const hCabo = metrosCabo / 20;
    const hAcab = { basico: 0, padrao: 1, premium: 2 }[padrao as keyof typeof paineis];
    const horasTotais = Math.round((hMontagem + hCabo + hAcab) * 10) / 10;

    setResults({
      In, termico, disjuntor, caboAmpacidade, caboQuedaTensao, caboFinal,
      materials, horasTotais, valorHora
    });
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
  const totalMaoObra = results ? results.horasTotais * results.valorHora : 0;

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#F2B705" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8h3M8 12h3M8 16h3M15 8v8" /><circle cx="17" cy="16" r="1.4" fill="#F2B705" stroke="none" /></svg>
          </div>
          <div>
            <h1>Calculadora de Materiais e Orçamento</h1>
            <span>COMANDOS ELÉTRICOS INDUSTRIAIS</span>
          </div>
        </div>
        <div className="badge">ORÇAMENTO AUTOMÁTICO</div>
      </header>

      <div className="grid">
        <div className="sidebar">
          <div className="card">
            <h3>Dados da proposta</h3>
            {['propNumero', 'cliNome', 'cliDoc', 'cliContato', 'tecNome', 'propLocal'].map(field => (
              <div className="field" key={field}>
                <label>{field === 'propNumero' ? 'Nº da proposta' : field === 'cliNome' ? 'Cliente' : field === 'cliDoc' ? 'CNPJ/CPF' : field === 'cliContato' ? 'Contato' : field === 'tecNome' ? 'Técnico' : 'Local'}</label>
                <input type="text" id={field} value={(formData as any)[field]} onChange={handleChange} />
              </div>
            ))}
            <div className="field">
              <label>Data</label>
              <input type="date" id="propData" value={formData.propData} onChange={handleChange} />
            </div>
          </div>

          <div className="card">
            <h3>Parâmetros técnicos</h3>
            <div className="field">
              <label>Tipo de partida</label>
              <select id="tipoPartida" value={formData.tipoPartida} onChange={handleChange}>
                <option value="direta">Partida Direta</option>
                <option value="reversao">Partida com Reversão</option>
                <option value="estrelaTriangulo">Estrela-Triângulo</option>
                <option value="compensada">Chave Compensada</option>
                <option value="softstarter">Soft-Starter</option>
                <option value="inversor">Inversor de Frequência</option>
              </select>
            </div>
            <div className="field">
              <label>Marca de referência</label>
              <select id="marca" value={formData.marca} onChange={handleChange}>
                <option value="weg">WEG</option>
                <option value="siemens">Siemens</option>
                <option value="schneider">Schneider</option>
                <option value="comparar">Comparar as 3</option>
              </select>
            </div>
            <div className="field">
              <label>Potência (CV)</label>
              <input type="number" id="potencia" value={formData.potencia} onChange={handleChange} min="0.5" step="0.5" />
            </div>
            <div className="field">
              <label>Tensão (V)</label>
              <select id="tensao" value={formData.tensao} onChange={handleChange}>
                <option value="220">220 V</option>
                <option value="380">380 V</option>
                <option value="440">440 V</option>
              </select>
            </div>
            <div className="field">
              <label>Qtd. motores</label>
              <input type="number" id="quantidade" value={formData.quantidade} onChange={handleChange} min="1" />
            </div>
            <div className="field">
              <label>Distância (m)</label>
              <input type="number" id="distancia" value={formData.distancia} onChange={handleChange} min="1" />
            </div>
            <div className="field">
              <label>Queda Adm. (%)</label>
              <input type="number" id="quedaAdm" value={formData.quedaAdm} onChange={handleChange} min="1" step="0.5" />
            </div>
            <div className="field">
              <label>Padrão do painel</label>
              <select id="padrao" value={formData.padrao} onChange={handleChange}>
                <option value="basico">Básico</option>
                <option value="padrao">Padrão</option>
                <option value="premium">Premium</option>
              </select>
              <div className="hint">{paineis[formData.padrao as keyof typeof paineis].hint}</div>
            </div>
            <div className="field">
              <label>Valor da hora (R$/h)</label>
              <input type="number" id="valorHora" value={formData.valorHora} onChange={handleChange} min="0" step="5" />
            </div>
            <button className="btn" onClick={calculate}>Calcular orçamento</button>
            <button className="btn secondary" onClick={() => window.print()}>Imprimir / salvar em PDF</button>
          </div>
        </div>

        <div>
          <div className="readout">
            <div className="readout-main">
              <div className="rt-label">Corrente nominal estimada</div>
              <div className="rt-value">{results ? results.In.toFixed(1) : "—"}<small>A</small></div>
              <div className="rt-sub">{results ? `Motor de ${formData.potencia} CV em ${formData.tensao} V.` : "Preencha os dados e calcule."}</div>
            </div>
            <div className="readout-diagram">
              <svg viewBox="0 0 150 90" width="150" height="90">
                <rect x="4" y="4" width="142" height="82" rx="6" fill="none" stroke="#2A323A" stroke-width="1.4" />
                <rect x="20" y="20" width="18" height="18" rx="2" fill="none" stroke="#F2B705" stroke-width="1.6" />
                <circle cx="100" cy="29" r="12" fill="none" stroke="#B87333" stroke-width="1.6" />
                <text x="100" y="33" text-anchor="middle" font-size="11" fill="#B87333" font-family="ui-monospace,monospace">M</text>
              </svg>
              <div className="diagram-caption">{formData.tipoPartida.toUpperCase()}</div>
            </div>
          </div>

          {results && (
            <>
              <div className="specs">
                <div className="spec"><div className="k">Relé térmico</div><div className="v"><em>{results.termico?.min}–{results.termico?.max} A</em></div></div>
                <div className="spec"><div className="k">Disjuntor motor</div><div className="v"><em>{results.disjuntor} A</em></div></div>
                <div className="spec highlight"><div className="k">Bitola adotada</div><div className="v"><em>{results.caboFinal?.mm} mm²</em></div></div>
              </div>

              <div className="card">
                <h3>Lista de materiais e orçamento</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Item / modelo</th>
                      <th style={{ textAlign: 'right' }}>Qtd.</th>
                      <th style={{ textAlign: 'right' }}>Un.</th>
                      <th style={{ textAlign: 'right' }}>Preço (R$)</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.materials.map((m: any, i: number) => (
                      <tr key={i}>
                        <td className="item">{m.item}<span className="desc">{m.desc}</span></td>
                        <td className="num">{m.qtd}</td>
                        <td className="num">{m.un}</td>
                        <td className="num">
                          <input
                            className="price-input"
                            type="number"
                            value={m.preco}
                            onChange={(e) => updateMaterialPrice(i, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="num">R$ {(m.qtd * m.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <h3>Resumo Financeiro</h3>
                <div className="totals">
                  <div className="row"><span>Materiais</span><span>{fmt(totalMateriais)}</span></div>
                  <div className="row"><span>Mão de obra ({results.horasTotais}h)</span><span>{fmt(totalMaoObra)}</span></div>
                  <div className="grand"><span>Total geral</span><span>{fmt(totalMateriais + totalMaoObra)}</span></div>
                </div>
              </div>
            </>
          )}

          <div className="disclaimer">
            <strong>Notas técnicas:</strong> Bitola calculada por ampacidade (NBR 5410), queda de tensão e seção mínima (2,5 mm²). Valores e marcas são referências editáveis.
          </div>
        </div>
      </div>
    </div>
  );
}
