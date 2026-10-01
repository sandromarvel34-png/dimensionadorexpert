import { proposalTotals } from "../proposal/validation";
import type { jsPDF } from "jspdf";
import type { autoTable as AutoTable, HookData } from "jspdf-autotable";
import { createClientOnlyFn } from "@tanstack/react-start";
import type { CalculationInputs, CalculationResults, CompanyProfile } from "@/types";

export interface ProposalPdfItem {
  id: string;
  desc: string;
  qtd: number;
  unit?: string;
  price: number | string;
}

export type PdfOutputAction = "save" | "print";

export interface ProposalPdfRequest {
  data: ProposalPdfData;
  action?: PdfOutputAction;
  printWindow?: Window | null;
}

export interface ProposalPdfData {
  companyProfile: CompanyProfile;
  clientData: {
    name: string;
    doc: string;
    phone: string;
    email: string;
  };
  commercialData: {
    serviceDescription: string;
    technicianName: string;
    executingCompany: string;
  };
  observations: string;
  items: ProposalPdfItem[];
  labor: {
    hours: number;
    rate: number;
  };
  costs: {
    travel: number;
    others: number;
    discount: number;
    validity: number;
  };
  selectedManufacturer: string;
  currentInputs: CalculationInputs;
  currentResults: CalculationResults;
}

const NAVY: [number, number, number] = [15, 23, 42];
const SLATE: [number, number, number] = [71, 85, 105];
const LIGHT: [number, number, number] = [248, 250, 252];
const BORDER: [number, number, number] = [226, 232, 240];

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const safeNumber = (value: number | string | undefined) => {
  const parsed = typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const filenamePart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.slice(1) : "2563EB";
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
};

const outputPdf = (
  doc: jsPDF,
  filename: string,
  action: PdfOutputAction = "save",
  printWindow?: Window | null,
) => {
  if (action === "save") {
    doc.save(filename);
    return;
  }

  // Open the finished A4 PDF in a dedicated browser tab so the user can
  // print the actual document instead of printing the application screen.
  try {
    if (typeof doc.autoPrint === "function") {
      doc.autoPrint({ variant: "non-conform" });
    }
  } catch {
    // Some PDF viewers ignore auto-print instructions; opening the PDF still
    // gives the user the native browser/PDF print control.
  }

  const blobUrl = doc.output("bloburl");
  if (printWindow && !printWindow.closed) {
    printWindow.location.replace(String(blobUrl));
    window.setTimeout(() => URL.revokeObjectURL(String(blobUrl)), 5 * 60 * 1000);
  }
  if (!printWindow || printWindow.closed) {
    throw new Error("O navegador bloqueou a janela de impressão. Permita pop-ups para este site.");
  }
};

const starterLabel = (starter: CalculationInputs["starterType"]) => {
  if (starter === "direta") return "Partida direta";
  if (starter === "reversao") return "Partida com reversao";
  if (starter === "estrelaTriangulo") return "Partida estrela-triangulo";
  if (starter === "softStarter") return "Partida por soft-starter";
  return "Acionamento por inversor de frequencia";
};

const companyName = (profile: CompanyProfile) =>
  profile.companyName.trim() || "Empresa / Profissional";

const responsibleName = (data: ProposalPdfData) =>
  data.companyProfile.responsibleName.trim() ||
  data.commercialData.technicianName.trim() ||
  "Responsavel pelo servico";

const companyContactLine = (profile: CompanyProfile) =>
  [profile.phone, profile.email, profile.website].filter(Boolean).join(" | ");

const drawLogo = (
  doc: jsPDF,
  profile: CompanyProfile,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
) => {
  if (!profile.logoDataUrl) return false;
  try {
    const props = doc.getImageProperties(profile.logoDataUrl);
    const ratio = props.width / props.height;
    let width = maxW;
    let height = width / ratio;
    if (height > maxH) {
      height = maxH;
      width = height * ratio;
    }
    const format = profile.logoDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
    doc.addImage(
      profile.logoDataUrl,
      format,
      x + (maxW - width) / 2,
      y + (maxH - height) / 2,
      width,
      height,
      undefined,
      "FAST",
    );
    return true;
  } catch {
    return false;
  }
};

const addBrandedHeader = (
  doc: jsPDF,
  data: ProposalPdfData,
  title: string,
  subtitle: string,
  rightLines: string[],
) => {
  const brand = hexToRgb(data.companyProfile.brandColor);
  const logoBackground = data.companyProfile.logoBackground || "light";
  const logoFill: [number, number, number] =
    logoBackground === "dark" ? NAVY : logoBackground === "brand" ? brand : LIGHT;

  // Clean, neutral header that works with light, dark or colored logos.
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 42, "F");
  doc.setFillColor(...brand);
  doc.rect(0, 0, 210, 2.2, "F");

  doc.setFillColor(...logoFill);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, 7, 38, 22, 2.5, 2.5, "FD");

  const hasLogo = drawLogo(doc, data.companyProfile, 16, 9, 34, 18);
  if (!hasLogo) {
    doc.setTextColor(...brand);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("LOGO", 33, 20, { align: "center" });
  }

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  fitText(doc, companyName(data.companyProfile), 58, 12, 70);

  const identityLine = [data.companyProfile.document, data.companyProfile.professionalRegistration]
    .filter(Boolean)
    .join(" | ");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...SLATE);
  if (identityLine) fitText(doc, identityLine, 58, 17, 70);
  const contact = companyContactLine(data.companyProfile);
  if (contact) fitText(doc, contact, 58, 22, 70);
  const location = [data.companyProfile.address, data.companyProfile.cityState]
    .filter(Boolean)
    .join(" - ");
  if (location) fitText(doc, location, 58, 27, 70);

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, 196, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...SLATE);
  doc.text(subtitle, 196, 17, { align: "right" });
  rightLines.forEach((line, index) => doc.text(line, 196, 23 + index * 5, { align: "right" }));

  doc.setDrawColor(...BORDER);
  doc.line(14, 36, 196, 36);
  doc.setDrawColor(...brand);
  doc.setLineWidth(0.7);
  doc.line(14, 39, 42, 39);
  doc.setLineWidth(0.2);
};

const addContinuationHeader = (doc: jsPDF, data: ProposalPdfData, title: string) => {
  const brand = hexToRgb(data.companyProfile.brandColor);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  fitText(doc, `${companyName(data.companyProfile)} | ${title}`, 14, 10, 182);
  doc.setDrawColor(...brand);
  doc.line(14, 13, 196, 13);
};

const sectionLabel = (
  doc: jsPDF,
  profile: CompanyProfile,
  title: string,
  y: number,
  subtitle?: string,
) => {
  const brand = hexToRgb(profile.brandColor);
  doc.setTextColor(...brand);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(title.toUpperCase(), 14, y);

  if (subtitle) {
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(subtitle, 14, y + 4);
    return y + 8;
  }
  return y + 4;
};

const addClientBlock = (
  doc: jsPDF,
  autoTable: typeof AutoTable,
  data: ProposalPdfData,
  y: number,
) => {
  y = sectionLabel(doc, data.companyProfile, "Cliente", y);
  autoTable(doc, {
    startY: y,
    body: [
      ["Cliente", data.clientData.name || "-"],
      ["CPF/CNPJ", data.clientData.doc || "-"],
      [
        "Contato",
        [data.clientData.phone, data.clientData.email].filter(Boolean).join(" | ") || "-",
      ],
    ],
    theme: "plain",
    margin: { left: 14, right: 14 },
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.2, textColor: NAVY },
    columnStyles: {
      0: { cellWidth: 31, fontStyle: "bold", textColor: SLATE },
      1: { cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: LIGHT },
  });
  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
};

const fitText = (doc: jsPDF, text: string, x: number, y: number, width: number) => {
  const size = doc.getFontSize();
  const ratio = width / Math.max(width, doc.getTextWidth(text));
  doc.setFontSize(size * ratio);
  doc.text(text, x, y);
  doc.setFontSize(size);
};

const ensureSpace = (
  doc: jsPDF,
  data: ProposalPdfData,
  y: number,
  height: number,
  title: string,
) => {
  if (y + height <= 277) return y;
  doc.addPage();
  addContinuationHeader(doc, data, title);
  return 22;
};

const paragraph = (
  doc: jsPDF,
  data: ProposalPdfData,
  text: string,
  y: number,
  title: string,
  x = 16,
  width = 178,
) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  const lines: string[] = doc.splitTextToSize(text, width);
  for (const line of lines) {
    y = ensureSpace(doc, data, y, 5, title);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    doc.text(line, x, y);
    y += 4.5;
  }
  return y + 5;
};

const addSignatureBlock = (doc: jsPDF, data: ProposalPdfData, y: number, includeClient = false) => {
  if (y > 244) {
    doc.addPage();
    y = 24;
  }

  doc.setDrawColor(...BORDER);
  doc.line(14, y, 196, y);
  const signatureY = y + 16;

  if (includeClient) {
    doc.setDrawColor(...NAVY);
    doc.line(14, signatureY, 86, signatureY);
    doc.line(124, signatureY, 196, signatureY);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    fitText(doc, responsibleName(data), 14, signatureY + 4, 72);
    fitText(doc, data.clientData.name || "Cliente / Contratante", 124, signatureY + 4, 72);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE);
    doc.setFontSize(6.5);
    doc.text("Responsavel pelo servico", 50, signatureY + 8, { align: "center" });
    doc.text("Aceite do cliente", 160, signatureY + 8, { align: "center" });
    return;
  }

  doc.setDrawColor(...NAVY);
  doc.line(126, signatureY, 196, signatureY);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  fitText(doc, responsibleName(data), 126, signatureY + 4, 70);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.setFontSize(6.5);
  fitText(
    doc,
    data.companyProfile.professionalRegistration || "Responsavel pelo servico",
    126,
    signatureY + 8,
    70,
  );
};

const addFooters = (doc: jsPDF, data: ProposalPdfData, label: string) => {
  const brand = hexToRgb(data.companyProfile.brandColor);
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.line(14, 286, 196, 286);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(...SLATE);
    fitText(doc, `${companyName(data.companyProfile)} | ${label}`, 14, 291, 150);
    doc.setTextColor(...brand);
    doc.text(`Pagina ${page} de ${pageCount}`, 196, 291, { align: "right" });
  }
};

const addNumberedSection = (
  doc: jsPDF,
  data: ProposalPdfData,
  number: number,
  title: string,
  text: string,
  y: number,
) => {
  y = ensureSpace(doc, data, y, 23, "MEMORIAL DESCRITIVO");

  const brand = hexToRgb(data.companyProfile.brandColor);
  doc.setFillColor(...brand);
  doc.roundedRect(14, y - 3, 8, 8, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(String(number), 18, y + 2.3, { align: "center" });

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, 26, y + 2);

  return paragraph(doc, data, text, y + 8, "MEMORIAL DESCRITIVO", 26, 170);
};

const commercialPdf = createClientOnlyFn(
  async ({ data, action = "save", printWindow }: ProposalPdfRequest) => {
    proposalTotals(data);
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = autoTableModule.default;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const brand = hexToRgb(data.companyProfile.brandColor);
    const date = new Date().toLocaleDateString("pt-BR");

    doc.setProperties({
      title: `Proposta Comercial - ${companyName(data.companyProfile)}`,
      subject: "Proposta comercial de servicos e materiais",
      author: companyName(data.companyProfile),
      creator: "Dimensionador Expert",
    });

    const {
      materials: totalMaterials,
      labor: totalLabor,
      total: grandTotal,
    } = proposalTotals(data);
    const hasCommercialValues =
      totalMaterials > 0 ||
      totalLabor > 0 ||
      safeNumber(data.costs.travel) > 0 ||
      safeNumber(data.costs.others) > 0 ||
      safeNumber(data.costs.discount) > 0;

    addBrandedHeader(doc, data, "PROPOSTA COMERCIAL", "SOLUCAO, ESCOPO E INVESTIMENTO", [
      date,
      `Validade: ${data.costs.validity || 30} dias`,
    ]);

    let y = 47;
    y = addClientBlock(doc, autoTable, data, y);

    // Executive presentation of the service.
    y = sectionLabel(doc, data.companyProfile, "Solucao proposta", y);
    const proposalText =
      data.commercialData.serviceDescription.trim() ||
      "Fornecimento de materiais e execucao dos servicos conforme levantamento e escopo acordado com o cliente.";
    y = paragraph(doc, data, proposalText, y + 3, "PROPOSTA COMERCIAL");
    y = ensureSpace(doc, data, y, 50, "PROPOSTA COMERCIAL");

    // Investment becomes the main commercial focal point.
    y = sectionLabel(doc, data.companyProfile, "Investimento", y);
    doc.setFillColor(...brand);
    doc.roundedRect(14, y, 72, 34, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("INVESTIMENTO TOTAL", 20, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(hasCommercialValues ? 18 : 15);
    doc.text(hasCommercialValues ? money(grandTotal) : "A DEFINIR", 20, y + 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(`Proposta valida por ${data.costs.validity || 30} dias`, 20, y + 29);

    autoTable(doc, {
      startY: y,
      body: [
        ["Materiais", totalMaterials > 0 ? money(totalMaterials) : "-"],
        ["Mao de obra e servicos", totalLabor > 0 ? money(totalLabor) : "-"],
        [
          "Deslocamento",
          safeNumber(data.costs.travel) > 0 ? money(safeNumber(data.costs.travel)) : "-",
        ],
        [
          "Outros custos",
          safeNumber(data.costs.others) > 0 ? money(safeNumber(data.costs.others)) : "-",
        ],
        [
          "Desconto",
          safeNumber(data.costs.discount) > 0 ? `- ${money(safeNumber(data.costs.discount))}` : "-",
        ],
      ],
      theme: "plain",
      margin: { left: 96, right: 14 },
      styles: { font: "helvetica", fontSize: 7.6, cellPadding: 2.1, textColor: NAVY },
      columnStyles: {
        0: { fontStyle: "bold", textColor: SLATE, cellWidth: 56 },
        1: { halign: "right", cellWidth: 44 },
      },
      alternateRowStyles: { fillColor: LIGHT },
    });
    y =
      Math.max(
        y + 34,
        (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY,
      ) + 10;

    // Commercial conditions stay on page 1.
    y = ensureSpace(doc, data, y, 20, "PROPOSTA COMERCIAL");
    y = sectionLabel(doc, data.companyProfile, "Condicoes comerciais", y);
    const conditions = [
      `Validade da proposta: ${data.costs.validity || 30} dias.`,
      "Materiais e servicos adicionais nao previstos no escopo serao submetidos a aprovacao antes da execucao.",
    ];
    if (data.observations.trim()) conditions.push(data.observations.trim());

    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    conditions.forEach((condition, index) => {
      y = paragraph(doc, data, `${index + 1}. ${condition}`, y, "PROPOSTA COMERCIAL");
    });

    y += 5;
    addSignatureBlock(doc, data, y, true);

    // Appendix with the detailed material/service list.
    doc.addPage();
    addContinuationHeader(doc, data, "PROPOSTA COMERCIAL");
    y = 22;
    y = sectionLabel(
      doc,
      data.companyProfile,
      "Anexo 1 - Relacao de materiais e servicos",
      y,
      "Detalhamento dos itens considerados na composicao desta proposta.",
    );

    autoTable(doc, {
      startY: y,
      head: [["Descricao", "Qtd.", "Un.", "Valor unit.", "Total"]],
      body: data.items.map((item) => {
        const price = safeNumber(item.price);
        const rowTotal = safeNumber(item.qtd) * price;
        return [
          item.desc || "-",
          safeNumber(item.qtd).toLocaleString("pt-BR"),
          item.unit || "un",
          price > 0 ? money(price) : "-",
          rowTotal > 0 ? money(rowTotal) : "-",
        ];
      }),
      theme: "grid",
      margin: { left: 14, right: 14, top: 20, bottom: 17 },
      headStyles: {
        fillColor: brand,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: 2.8,
      },
      styles: {
        font: "helvetica",
        fontSize: 7.2,
        cellPadding: 2.4,
        lineColor: BORDER,
        lineWidth: 0.2,
        textColor: NAVY,
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 92 },
        1: { cellWidth: 16, halign: "right" },
        2: { cellWidth: 13, halign: "center" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 33, halign: "right", fontStyle: "bold" },
      },
      alternateRowStyles: { fillColor: LIGHT },
      didDrawPage: (tableData: HookData) => {
        if (tableData.pageNumber > 1) addContinuationHeader(doc, data, "PROPOSTA COMERCIAL");
      },
    });

    addFooters(doc, data, "Proposta Comercial");

    const clientPart = filenamePart(data.clientData.name || "cliente");
    outputPdf(
      doc,
      `proposta-comercial-${clientPart}-${new Date().toISOString().slice(0, 10)}.pdf`,
      action,
      printWindow,
    );
  },
);

const memorialPdf = createClientOnlyFn(
  async ({ data, action = "save", printWindow }: ProposalPdfRequest) => {
    proposalTotals(data);
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = autoTableModule.default;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const date = new Date().toLocaleDateString("pt-BR");

    doc.setProperties({
      title: `Memorial Descritivo - ${companyName(data.companyProfile)}`,
      subject: "Memorial descritivo do servico eletrico",
      author: companyName(data.companyProfile),
      creator: "Dimensionador Expert",
    });

    addBrandedHeader(doc, data, "MEMORIAL DESCRITIVO", "DESCRICAO TECNICA DO SERVICO", [date]);

    let y = 46;
    y = addClientBlock(doc, autoTable, data, y);

    const objectText =
      data.commercialData.serviceDescription.trim() ||
      `Execucao de servico eletrico para alimentacao e acionamento de carga de ${data.currentInputs.power} ${data.currentInputs.powerUnit}, conforme caracteristicas tecnicas descritas neste memorial.`;
    y = addNumberedSection(doc, data, 1, "Objeto", objectText, y);

    const systemText =
      `O servico considera carga de ${data.currentInputs.power} ${data.currentInputs.powerUnit}, alimentada em ${data.currentInputs.voltage} V, ` +
      `sistema ${data.currentInputs.phase === "trifasico" ? "trifasico" : "monofasico"}, com ${starterLabel(data.currentInputs.starterType).toLowerCase()}. ` +
      `A distancia aproximada entre alimentacao e carga informada para o projeto e de ${data.currentInputs.distance} m.`;
    y = addNumberedSection(doc, data, 2, "Caracterizacao do sistema", systemText, y);

    const conductorText =
      `Os condutores de potencia previstos sao de cobre, isolacao PVC 70 C, classe de tensao 0,6/1 kV, com secao final de ${data.currentResults.finalCableSection} mm2 para os condutores de fase. ` +
      `O metodo de instalacao considerado e ${data.currentInputs.installationMethod || "o informado no levantamento"}. A queda de tensao estimada para a configuracao selecionada e de ${data.currentResults.voltageDropCalculated.toFixed(2)}%.`;
    y = addNumberedSection(doc, data, 3, "Condutores e instalacao", conductorText, y);

    const commandText =
      data.currentInputs.starterType === "inversor"
        ? "O acionamento sera realizado por inversor de frequencia dimensionado para a corrente da carga, incluindo parametrizacao funcional, conexoes de potencia e comando e testes de operacao."
        : data.currentInputs.starterType === "softStarter"
          ? "O acionamento sera realizado por soft-starter dimensionada para a corrente da carga, incluindo conexoes, configuracao dos parametros de partida e testes de operacao."
          : `O comando sera montado para ${starterLabel(data.currentInputs.starterType).toLowerCase()}, incluindo os dispositivos de manobra, comando, sinalizacao e intertravamento aplicaveis ao circuito.`;
    y = addNumberedSection(doc, data, 4, "Sistema de acionamento e comando", commandText, y);

    if (y > 225) {
      doc.addPage();
      addContinuationHeader(doc, data, "MEMORIAL DESCRITIVO");
      y = 21;
    }

    y = sectionLabel(
      doc,
      data.companyProfile,
      "5. Materiais e equipamentos principais",
      y,
      "Relacao tecnica prevista, sem valores comerciais.",
    );
    autoTable(doc, {
      startY: y,
      head: [["Descricao", "Qtd.", "Un."]],
      body: data.items.map((item) => [
        item.desc || "-",
        safeNumber(item.qtd).toLocaleString("pt-BR"),
        item.unit || "un",
      ]),
      theme: "grid",
      margin: { left: 14, right: 14, top: 20, bottom: 17 },
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: 2.8,
      },
      styles: {
        font: "helvetica",
        fontSize: 7.4,
        cellPadding: 2.5,
        lineColor: BORDER,
        lineWidth: 0.2,
        textColor: NAVY,
      },
      columnStyles: {
        0: { cellWidth: 146 },
        1: { cellWidth: 20, halign: "right" },
        2: { cellWidth: 16, halign: "center" },
      },
      alternateRowStyles: { fillColor: LIGHT },
      didDrawPage: (tableData: HookData) => {
        if (tableData.pageNumber > 1) addContinuationHeader(doc, data, "MEMORIAL DESCRITIVO");
      },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    const executionText =
      "A execucao contempla montagem e fixacao dos componentes, lancamento e identificacao dos condutores, terminacoes, conexoes eletricas, organizacao interna do painel e conferencias de montagem antes da energizacao.";
    y = addNumberedSection(doc, data, 6, "Procedimentos de execucao", executionText, y);

    const testText =
      "Antes da entrega serao realizados, conforme aplicabilidade ao escopo, verificacao visual, conferencia de aperto e conexoes, continuidade dos circuitos, testes do circuito de comando, sequencia de funcionamento, sinalizacao e teste funcional do acionamento.";
    y = addNumberedSection(doc, data, 7, "Testes e comissionamento", testText, y);

    const deliveryText =
      "Ao final do servico, o sistema devera ser entregue em condicao operacional dentro do escopo contratado. Eventuais alteracoes decorrentes de condicoes nao identificadas previamente deverao ser registradas e acordadas antes de sua execucao.";
    y = addNumberedSection(doc, data, 8, "Entrega e consideracoes finais", deliveryText, y);

    if (data.observations.trim()) {
      y = addNumberedSection(doc, data, 9, "Observacoes especificas", data.observations.trim(), y);
    }

    addSignatureBlock(doc, data, y + 5, false);
    addFooters(doc, data, "Memorial Descritivo");

    const clientPart = filenamePart(data.clientData.name || "cliente");
    outputPdf(
      doc,
      `memorial-descritivo-${clientPart}-${new Date().toISOString().slice(0, 10)}.pdf`,
      action,
      printWindow,
    );
  },
);

const prepareOutput = (
  generate: (request: ProposalPdfRequest) => Promise<void>,
  request: ProposalPdfRequest,
) => {
  // Reserve the viewer during the original click, before imports or other awaits.
  let printWindow: Window | null = null;
  if (request.action === "print") {
    printWindow = window.open("", "_blank");
    if (!printWindow)
      return Promise.reject(
        new Error("O navegador bloqueou a impressão. Permita pop-ups para este site."),
      );
    printWindow.opener = null;
    printWindow.document.title = "Preparando documento";
    printWindow.document.body.textContent = "Preparando documento para impressão...";
  }
  return generate({ ...request, printWindow }).catch((error: unknown) => {
    printWindow?.close();
    throw error;
  });
};
export const generateCommercialProposalPdf = createClientOnlyFn((request: ProposalPdfRequest) =>
  prepareOutput(commercialPdf, request),
);
export const generateDescriptiveMemorialPdf = createClientOnlyFn((request: ProposalPdfRequest) =>
  prepareOutput(memorialPdf, request),
);
