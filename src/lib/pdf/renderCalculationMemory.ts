import { registerCalculationFont } from "./calculationFont";
import { NAVY, SLATE, LIGHT, BORDER, hexToRgb } from "./pdfTheme";
import type { jsPDF } from "jspdf";
import type { autoTable as AutoTable } from "jspdf-autotable";
import type { CalculationInputs, CalculationResults, CompanyProfile } from "@/types";
import { buildCalculationMemory, serviceTechnicalRows, technicalNumber } from "./calculationMemory";

const mathematicalText = (text: string) =>
  text
    .replace(/sqrt\(1 - cos²\(phi\)\)/g, "√(1 − cos²(φ))")
    .replace(/sqrt\(3\)/g, "√3")
    .replace(/sqrt\(([^()]+)\)/g, "√($1)")
    .replace(/\bphi\b/g, "φ")
    .replace(/\beta\b/g, "η")
    .replace(/\brho\b/g, "ρ")
    .replace(/ x /g, " × ")
    .replace(/>=/g, "≥")
    .replace(/<=/g, "≤");

/** Print layout only. All calculation content comes from the recorded inputs/results. */
export function renderCalculationMemory(
  doc: jsPDF,
  autoTable: typeof AutoTable,
  request: {
    currentInputs: CalculationInputs;
    currentResults: CalculationResults;
    companyProfile: CompanyProfile;
  },
) {
  registerCalculationFont(doc);
  const { currentInputs: inputs, currentResults: results, companyProfile: company } = request;
  const ink = NAVY;
  const muted = SLATE;
  const accent = hexToRgb(company.brandColor);
  const border = BORDER;
  const pale = LIGHT;
  const name = company.companyName.trim() || "Dimensionador Expert";
  let y = 18;
  const font = (size: number, bold = false, color = ink, family = "helvetica") => {
    doc.setFont(family, bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const fit = (text: string, x: number, baseline: number, width: number, size = 9) => {
    font(size);
    doc.setFontSize(Math.min(size, (size * width) / Math.max(width, doc.getTextWidth(text))));
    doc.text(text, x, baseline);
  };
  const continuation = () => {
    fit(name, 16, 12, 120, 8);
    font(8, true, accent);
    doc.text("MEMÓRIA DE CÁLCULO", 194, 12, { align: "right" });
    doc.setDrawColor(...border);
    doc.setLineWidth(0.25);
    doc.line(16, 17, 194, 17);
  };
  const page = () => {
    doc.addPage();
    continuation();
    y = 27;
  };
  const space = (height: number) => {
    if (y + height > 276) page();
  };
  const heading = (number: string, title: string) => {
    space(45);
    doc.setFillColor(...accent);
    doc.roundedRect(16, y - 4, 10, 10, 2, 2, "F");
    font(9, true, [255, 255, 255]);
    doc.text(number, 21, y + 2.5, { align: "center" });
    font(12, true);
    doc.text(title, 30, y + 2.5);
    y += 13;
  };
  const paragraph = (text: string, small = false) => {
    font(small ? 8 : 9.5, false, muted, "CalculationSans");
    const printable = mathematicalText(text);
    const lines: string[] = doc.splitTextToSize(printable, 174);
    for (const line of lines) {
      space(5);
      font(small ? 8 : 9.5, false, muted, "CalculationSans");
      doc.text(line, 18, y);
      y += small ? 4 : 5;
    }
    y += 3;
  };
  const equation = (text: string) => {
    // Keep each formula and its numeric application together; explanatory prose follows separately.
    const parts = text.split(/\. (?=[A-ZÀ-Ú])/);
    const expression = mathematicalText(parts.shift()!);
    font(9, false, ink, "CalculationSans");
    const lines: string[] = doc.splitTextToSize(expression, 164);
    const height = 12 + lines.length * 4.8;
    space(height + 4);
    doc.setFillColor(...pale);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.2);
    doc.roundedRect(16, y, 178, height, 2, 2, "FD");
    doc.setFillColor(...accent);
    doc.rect(16, y + 2, 0.8, height - 4, "F");
    font(6.8, true, accent);
    doc.text("FÓRMULA E APLICAÇÃO", 21, y + 6);
    font(9, false, ink, "CalculationSans");
    doc.text(lines, 21, y + 12, { lineHeightFactor: 1.5 });
    y += height + 5;
    if (parts.length) paragraph(parts.join(". "), true);
  };
  const equationPattern =
    /^(In =|Ib =|F =|Icorr =|Iz,tabela|Na seção final:|Estimativa resistiva:|Sdv =|Verificação da seção final:|dv =|dv% =|Scc >=|Com k =|Sfinal =|Verificação por corrente:|K1 e K2:|K3 \(estrela\):|Relé térmico dentro)/;

  // Brand line: a compact real logo or app monogram, never a placeholder.
  doc.setFillColor(...accent);
  doc.roundedRect(16, 12, 18, 18, 3, 3, "F");
  let logo = false;
  if (company.logoDataUrl) {
    try {
      const image = doc.getImageProperties(company.logoDataUrl);
      const scale = Math.min(16 / image.width, 16 / image.height);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(16, 12, 18, 18, 3, 3, "F");
      doc.addImage(
        company.logoDataUrl,
        company.logoDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG",
        25 - (image.width * scale) / 2,
        21 - (image.height * scale) / 2,
        image.width * scale,
        image.height * scale,
      );
      logo = true;
    } catch {
      /* The monogram remains available when a saved logo cannot be decoded. */
    }
  }
  if (!logo) {
    font(12, true, [255, 255, 255]);
    doc.text("DE", 25, 23, { align: "center" });
  }
  fit(name, 39, 18, 116, 10);
  const identity = [company.responsibleName, company.professionalRegistration]
    .filter(Boolean)
    .join(" | ");
  if (identity) fit(identity, 39, 24, 116, 8);
  const contact = [company.email, company.phone].filter(Boolean).join(" | ");
  if (contact) fit(contact, 39, 29, 116, 7.5);
  font(8, false, muted);
  doc.text(new Date().toLocaleDateString("pt-BR"), 194, 18, { align: "right" });
  font(7, true, accent);
  doc.text("DOCUMENTO TÉCNICO", 194, 24, { align: "right" });
  font(24, true);
  doc.text("Memória de cálculo", 16, 46);
  font(10, false, muted);
  doc.text("Dimensionamento elétrico • Fórmulas, critérios e resultados", 16, 54);
  doc.setDrawColor(...border);
  doc.line(16, 61, 194, 61);

  const cards = [
    ["SEÇÃO FINAL", `${technicalNumber(results.finalCableSection, 1)} mm²`],
    [
      "CORRENTE DE PROJETO",
      `${technicalNumber(results.nominalCurrent * (inputs.serviceFactor ?? 1))} A`,
    ],
    ["QUEDA DE TENSÃO", `${technicalNumber(results.voltageDropCalculated)}%`],
  ];
  cards.forEach(([label, value], index) => {
    const x = 16 + index * 61;
    doc.setFillColor(...pale);
    doc.roundedRect(x, 68, 56, 24, 2, 2, "F");
    font(7, true, accent);
    doc.text(label!, x + 4, 75);
    font(17, true);
    doc.text(value!, x + 4, 85);
  });
  y = 104;
  heading("01", "Dados do motor e condições de instalação");
  autoTable(doc, {
    startY: y,
    body: serviceTechnicalRows(inputs, results),
    theme: "plain",
    margin: { left: 16, right: 16, top: 27, bottom: 22 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.6, textColor: ink },
    columnStyles: {
      0: { cellWidth: 64, fontStyle: "bold", textColor: muted },
      1: { cellWidth: 114 },
    },
    alternateRowStyles: { fillColor: LIGHT },
    didDrawPage: (table) => {
      if (table.pageNumber > 1) continuation();
    },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9;
  const sections = buildCalculationMemory(inputs, results);
  // Keep the assumptions not represented in the motor table close to the input data.
  sections[0]!.lines.slice(2).forEach((line) => paragraph(line, true));
  // The first page is the service summary; start the detailed derivation on a new page.
  page();
  sections.slice(1).forEach((section, index) => {
    if (index === 6) {
      // Keep the references together when they fit on a page.
      font(8);
      const height = section.lines.reduce(
        (total, line) => total + doc.splitTextToSize(line, 174).length * 4 + 3,
        17,
      );
      space(Math.min(height, 249));
    }
    heading(String(index + 2).padStart(2, "0"), section.title.replace(/^\d+\.\s*/, ""));
    if (index === 0) {
      paragraph(
        "Símbolos: √3 = raiz quadrada de 3 (aproximadamente 1,732); cos(φ) = fator de potência; φ (fi) = ângulo do fator de potência; η (éta) = rendimento do motor. P = potência em watts; V = tensão em volts; In = corrente nominal em amperes.",
      );
    }
    section.lines.forEach((line) =>
      equationPattern.test(line) ? equation(line) : paragraph(line, index === 6),
    );
    y += 4;
  });
  const pages = doc.getNumberOfPages();
  for (let n = 1; n <= pages; n++) {
    doc.setPage(n);
    doc.setDrawColor(...border);
    doc.line(16, 283, 194, 283);
    fit("Dimensionador Expert | Memória de cálculo", 16, 289, 125, 7.5);
    font(7.5, false, muted);
    doc.text(`${n} / ${pages}`, 194, 289, { align: "right" });
  }
}
