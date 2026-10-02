import { afterEach, expect, test, vi } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import type { jsPDF } from "jspdf";
const docs = vi.hoisted(() => [] as jsPDF[]);
vi.mock("jspdf", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jspdf")>();
  return {
    ...actual,
    jsPDF: class extends actual.jsPDF {
      constructor(options?: ConstructorParameters<typeof actual.jsPDF>[0]) {
        super(options);
        vi.spyOn(this as jsPDF, "text");
        Object.defineProperty(this, "save", {
          value: () => {
            docs.push(this);
            return this;
          },
        });
      }
    },
  };
});
import { emptyCompany } from "../workspace/store";
import { CalculationEngine } from "../engine/CalculationEngine";
import { buildRequirementItems } from "../proposal/materials";
import type { CalculationInputs } from "@/types";
vi.mock("@tanstack/react-start", () => ({ createClientOnlyFn: (fn: unknown) => fn }));
import {
  generateCommercialProposalPdf,
  generateDescriptiveMemorialPdf,
  generateCalculationMemoryPdf,
  type ProposalPdfData,
} from "./generateProposalPdf";
const inputs: CalculationInputs = {
  dataSource: "manual",
  power: 5,
  powerUnit: "cv",
  voltage: 380,
  phase: "trifasico",
  distance: 40,
  starterType: "direta",
  installationMethod: "B1",
  maxVoltageDrop: 4,
  quantity: 1,
  powerFactor: 0.85,
  efficiency: 0.9,
};
const fixture = (long = false): ProposalPdfData => ({
  companyProfile: {
    ...emptyCompany(),
    companyName: "Empresa de instalações elétricas e manutenção industrial",
    responsibleName: "Responsável Técnico de Instalações Elétricas",
    email: "contato@exemplo.com",
    phone: "(11) 99999-9999",
  },
  clientData: {
    name: "Cliente de serviços elétricos e manutenção industrial com nome extenso",
    doc: "00.000.000/0001-00",
    phone: "",
    email: "",
  },
  commercialData: {
    serviceDescription: long
      ? "Instalação de circuitos, montagem e verificação dos comandos. ".repeat(250) +
        "FIM DO ESCOPO"
      : "Instalação de comandos elétricos.",
    technicianName: "",
    executingCompany: "",
  },
  observations: long
    ? "Condições de execução e fornecimento acordadas com o cliente. ".repeat(220) +
      "FIM DAS OBSERVACOES"
    : "Prazo a combinar.",
  items: Array.from({ length: long ? 90 : 3 }, (_, i) => ({
    id: String(i),
    desc: `Material ${i}: cabo e componente de comando com descrição detalhada`,
    qtd: 2,
    unit: "un",
    price: 10,
  })),
  labor: { hours: 5, rate: 100 },
  costs: { travel: 30, others: 0, discount: 10, validity: 30 },
  selectedManufacturer: "WEG",
  currentInputs: inputs,
  currentResults: CalculationEngine.performFullCalculation(inputs),
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
test("proposta inclui proteção de força e relé WEG com códigos do dimensionamento", async () => {
  const data = fixture();
  data.currentInputs = { ...inputs, voltage: 220, distance: 5 };
  data.currentResults = CalculationEngine.performFullCalculation(data.currentInputs);
  data.items = buildRequirementItems(data.currentResults, "WEG").map((item) => ({
    ...item,
    price: 10,
  }));
  docs.length = 0;
  await generateCommercialProposalPdf({ data });
  expect(docs).toHaveLength(1);
  const text = vi
    .mocked(docs[0]!.text)
    .mock.calls.flatMap((call) => (Array.isArray(call[0]) ? call[0] : [call[0]]))
    .join(" ");
  expect(text).toContain("MDWH-D16-3");
  expect(text).toContain("14110099");
  expect(text).toContain("RW27-1D3-U015");
  expect(text).toContain("10452384");
  mkdirSync("/tmp/dimensionador-pdf-qa", { recursive: true });
  writeFileSync(
    "/tmp/dimensionador-pdf-qa/protecao-5cv.pdf",
    Buffer.from(docs[0]!.output("arraybuffer")),
  );
});
test("gera proposta e memorial completos com textos extensos e paginação", async () => {
  mkdirSync("/tmp/dimensionador-pdf-qa", { recursive: true });
  docs.length = 0;
  for (const long of [false, true]) {
    const data = fixture(long);
    await generateCommercialProposalPdf({ data });
    await generateDescriptiveMemorialPdf({ data });
  }
  expect(docs).toHaveLength(4);
  docs.forEach((doc, i) =>
    writeFileSync(
      `/tmp/dimensionador-pdf-qa/document-${i}.pdf`,
      Buffer.from(doc.output("arraybuffer")),
    ),
  );
  expect(docs[2]!.getNumberOfPages()).toBeGreaterThan(5);
  expect(docs[3]!.getNumberOfPages()).toBeGreaterThan(5);
});
test("reserva janela antes de aguardar geração e informa popup bloqueado", async () => {
  const open = vi.fn(() => null);
  vi.stubGlobal("window", { open });
  const promise = generateCommercialProposalPdf({ data: fixture(), action: "print" });
  expect(open).toHaveBeenCalledWith("", "_blank");
  await expect(promise).rejects.toThrow("bloqueou");
});
test("fecha janela reservada se a validação falhar", async () => {
  const close = vi.fn();
  const target = { opener: {}, document: { title: "", body: { textContent: "" } }, close };
  vi.stubGlobal("window", { open: () => target });
  const data = fixture();
  data.costs.discount = 999999;
  await expect(generateCommercialProposalPdf({ data, action: "print" })).rejects.toThrow(
    "desconto",
  );
  expect(close).toHaveBeenCalled();
  expect(target.opener).toBeNull();
});

const pdfText = (doc: jsPDF) =>
  vi
    .mocked(doc.text)
    .mock.calls.flatMap((call) => (Array.isArray(call[0]) ? call[0] : [call[0]]))
    .join(" ");
test("memória de cálculo exporta fórmulas e valores para todas as partidas e monofásico", async () => {
  mkdirSync("/tmp/dimensionador-pdf-qa", { recursive: true });
  const scenarios: CalculationInputs[] = [
    ...(["direta", "reversao", "estrelaTriangulo", "softStarter", "inversor"] as const).map(
      (starterType) => ({ ...inputs, starterType }),
    ),
    { ...inputs, phase: "monofasico", voltage: 220 },
    { ...inputs, shortCircuitCurrentKA: 5, shortCircuitDurationSeconds: 0.2 },
    { ...inputs, power: 0.37, powerUnit: "kW", phase: "monofasico", voltage: 220 },
    { ...inputs, powerUnit: "hp" },
  ];
  for (const [index, currentInputs] of scenarios.entries()) {
    docs.length = 0;
    const currentResults = CalculationEngine.performFullCalculation(currentInputs);
    await generateCalculationMemoryPdf({
      currentInputs,
      currentResults,
      companyProfile: fixture().companyProfile,
    });
    const doc = docs[0]!;
    const text = pdfText(doc);
    expect(text).toContain("In = P /");
    expect(text).toContain("Ib = In x FS");
    expect(text).toContain("Icorr = Ib / F");
    expect(text).toContain("Iz,corr = Iz,tabela x F");
    expect(text).toContain("dv% = 100 x dv / V");
    expect(text).toContain("Sfinal = max");
    expect(text).toContain(
      currentResults.nominalCurrent.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
    expect(text).not.toMatch(/NaN|Infinity|undefined/);
    if (currentInputs.starterType === "estrelaTriangulo")
      expect(text).toContain("Iajuste = In / sqrt(3)");
    if (currentResults.shortCircuitCheckPerformed) expect(text).toContain("Com k = 115");
    else expect(text).toContain("Não realizada: Icc");
    writeFileSync(
      `/tmp/dimensionador-pdf-qa/memoria-${index}.pdf`,
      Buffer.from(doc.output("arraybuffer")),
    );
  }
});
test("memória e memorial identificam o motor de catálogo e preservam sua corrente", async () => {
  docs.length = 0;
  const data = fixture();
  data.currentInputs = {
    ...inputs,
    dataSource: "catalog",
    starterType: "estrelaTriangulo",
    motorCatalogData: {
      id: "motor-test",
      manufacturer: "WEG",
      line: "W22",
      speedType: "SINGLE",
      poles: "4",
      model: "W22 5 cv",
      nominalCurrent: 8.75,
      powerFactor: 0.85,
      efficiency: 0.9,
      power: 5,
      powerUnit: "cv",
      voltage: 380,
      rpm: 1730,
      frame: "100L",
      catalogReference: "Catálogo W22",
    },
  };
  data.currentResults = CalculationEngine.performFullCalculation(data.currentInputs);
  await generateCalculationMemoryPdf({
    currentInputs: data.currentInputs,
    currentResults: data.currentResults,
    companyProfile: data.companyProfile,
  });
  await generateDescriptiveMemorialPdf({ data });
  for (const doc of docs) {
    const text = pdfText(doc);
    expect(text).toContain("WEG W22 5 cv");
    expect(text).toContain("1730 rpm");
    expect(text).toContain("100L");
    expect(text).toContain("8,75 A");
    expect(text).toContain("estrela-triângulo");
    expect(text).toContain("40,00 m");
  }
  expect(pdfText(docs[0]!)).not.toContain("In = P /");
  writeFileSync(
    "/tmp/dimensionador-pdf-qa/memorial-motor-catalogo.pdf",
    Buffer.from(docs[1]!.output("arraybuffer")),
  );
});
test("memorial técnico independe dos valores comerciais", async () => {
  docs.length = 0;
  const data = fixture();
  data.costs.discount = 999999;
  await generateDescriptiveMemorialPdf({ data });
  const text = pdfText(docs[0]!);
  expect(text).toContain("Corrente de projeto (Ib)");
  expect(text).toContain("Disjuntor principal / capacidade do cabo");
  expect(text).not.toContain("999999");
  expect(text).not.toContain("INVESTIMENTO TOTAL");
});
