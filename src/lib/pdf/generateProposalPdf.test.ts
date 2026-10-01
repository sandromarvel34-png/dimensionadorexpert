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
import type { CalculationInputs } from "@/types";
vi.mock("@tanstack/react-start", () => ({ createClientOnlyFn: (fn: unknown) => fn }));
import {
  generateCommercialProposalPdf,
  generateDescriptiveMemorialPdf,
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

test("memorial identifica a corrente informada da placa", async () => {
  const data = fixture();
  data.currentInputs = { ...inputs, plateNominalCurrent: 18.5 };
  data.currentResults = CalculationEngine.performFullCalculation(data.currentInputs);
  docs.length = 0;
  await generateDescriptiveMemorialPdf({ data });
  expect(docs).toHaveLength(1);
  const text = vi
    .mocked(docs[0]!.text)
    .mock.calls.flatMap((call) => (Array.isArray(call[0]) ? call[0] : [call[0]]))
    .join(" ");
  expect(text).toContain("informada da placa");
  expect(text).toContain("18.50 A");
  mkdirSync("/tmp/dimensionador-pdf-qa", { recursive: true });
  writeFileSync(
    "/tmp/dimensionador-pdf-qa/memorial-placa.pdf",
    Buffer.from(docs[0]!.output("arraybuffer")),
  );
});
