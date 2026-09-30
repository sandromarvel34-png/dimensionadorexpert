import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculationInputs, CalculationResults } from '@/types';

export interface ProposalPdfItem {
  id: string;
  desc: string;
  qtd: number;
  unit?: string;
  price: number | string;
}

export interface ProposalPdfData {
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

const BLUE: [number, number, number] = [37, 99, 235];
const NAVY: [number, number, number] = [15, 23, 42];
const SLATE: [number, number, number] = [71, 85, 105];
const LIGHT: [number, number, number] = [248, 250, 252];
const BORDER: [number, number, number] = [226, 232, 240];

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const safeNumber = (value: number | string | undefined) => {
  const parsed = typeof value === 'number' ? value : Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sectionLabel = (
  doc: jsPDF,
  title: string,
  y: number,
  subtitle?: string,
) => {
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(title.toUpperCase(), 14, y);

  if (subtitle) {
    doc.setTextColor(...SLATE);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(subtitle, 14, y + 4);
    return y + 8;
  }

  return y + 4;
};

const addContinuationHeader = (doc: jsPDF) => {
  doc.setTextColor(...SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DIMENSIONADOR EXPERT - PROPOSTA TECNICA', 14, 10);
  doc.setDrawColor(...BORDER);
  doc.line(14, 13, 196, 13);
};

const limitingCriterionLabel = (criterion: CalculationResults['limitingCriterion']) => {
  if (criterion === 'ampacity') return 'Ampacidade';
  if (criterion === 'voltageDrop') return 'Queda de tensao';
  if (criterion === 'shortCircuit') return 'Curto-circuito';
  return 'Secao minima';
};

const starterLabel = (starter: CalculationInputs['starterType']) => {
  if (starter === 'direta') return 'Partida direta';
  if (starter === 'reversao') return 'Reversao';
  if (starter === 'estrelaTriangulo') return 'Estrela-triangulo';
  if (starter === 'softStarter') return 'Soft-starter';
  return 'Inversor de frequencia';
};

const filenamePart = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

export const generateProposalPdf = (data: ProposalPdfData) => {
  const {
    clientData,
    commercialData,
    observations,
    items,
    labor,
    costs,
    selectedManufacturer,
    currentInputs,
    currentResults,
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  doc.setProperties({
    title: 'Proposta Tecnica - Dimensionador Expert',
    subject: 'Memorial de dimensionamento e proposta comercial',
    author: commercialData.executingCompany || commercialData.technicianName || 'Dimensionador Expert',
    creator: 'Dimensionador Expert',
  });

  const totalMaterials = items.reduce(
    (sum, item) => sum + safeNumber(item.qtd) * safeNumber(item.price),
    0,
  );
  const totalLabor = safeNumber(labor.hours) * safeNumber(labor.rate);
  const grandTotal =
    totalMaterials +
    totalLabor +
    safeNumber(costs.travel) +
    safeNumber(costs.others) -
    safeNumber(costs.discount);

  const ib = currentResults.nominalCurrent * (currentInputs.serviceFactor || 1);
  const iCorr = currentResults.correctionFactors?.combined
    ? ib / currentResults.correctionFactors.combined
    : ib;

  // Header
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setFillColor(...BLUE);
  doc.rect(0, 35, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('DIMENSIONADOR EXPERT', 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('MEMORIAL DE DIMENSIONAMENTO E PROPOSTA TECNICA', 14, 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('PROPOSTA TECNICA', 196, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(new Date().toLocaleDateString('pt-BR'), 196, 21, { align: 'right' });
  doc.text(`Validade: ${costs.validity || 30} dias`, 196, 26, { align: 'right' });

  let y = 46;

  // Client and company
  y = sectionLabel(doc, 'Cliente e responsavel', y);
  const clientRows = [
    ['Cliente', clientData.name || '-'],
    ['CPF/CNPJ', clientData.doc || '-'],
    ['Contato', [clientData.phone, clientData.email].filter(Boolean).join(' | ') || '-'],
    ['Responsavel', commercialData.technicianName || '-'],
    ['Empresa executora', commercialData.executingCompany || '-'],
  ];

  autoTable(doc, {
    startY: y,
    body: clientRows,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.2, textColor: NAVY },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold', textColor: SLATE },
      1: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: LIGHT },
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  if (commercialData.serviceDescription) {
    y = sectionLabel(doc, 'Descricao do servico', y);
    doc.setFillColor(...LIGHT);
    doc.setDrawColor(...BORDER);
    const descriptionLines = doc.splitTextToSize(commercialData.serviceDescription, 174);
    const h = Math.max(16, descriptionLines.length * 4.1 + 7);
    doc.roundedRect(14, y, 182, h, 2, 2, 'FD');
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(descriptionLines, 18, y + 6);
    y += h + 7;
  }

  // Technical summary
  y = sectionLabel(doc, 'Resumo do dimensionamento', y, 'Principais dados utilizados e resultado final.');

  const technicalRows = [
    ['Potencia', `${currentInputs.power} ${currentInputs.powerUnit}`, 'Tensao', `${currentInputs.voltage} V`],
    ['Sistema', currentInputs.phase === 'trifasico' ? 'Trifasico' : 'Monofasico', 'Partida', starterLabel(currentInputs.starterType)],
    ['Distancia', `${currentInputs.distance} m`, 'Metodo', currentInputs.installationMethod || '-'],
    ['Corrente nominal', `${currentResults.nominalCurrent.toFixed(2)} A`, 'Corrente de projeto', `${ib.toFixed(2)} A`],
    ['Corrente corrigida', `${iCorr.toFixed(2)} A`, 'Fator combinado', currentResults.correctionFactors?.combined.toFixed(3) || '1,000'],
    ['Secao por ampacidade', `${currentResults.cableByAmpacity} mm2`, 'Secao por queda', `${currentResults.cableByVoltageDrop} mm2`],
    ['Secao final', `${currentResults.finalCableSection} mm2`, 'Queda calculada', `${currentResults.voltageDropCalculated.toFixed(2)} %`],
    ['Criterio limitante', limitingCriterionLabel(currentResults.limitingCriterion), 'Fabricante de referencia', selectedManufacturer],
  ];

  if (currentResults.shortCircuitCheckPerformed && currentInputs.shortCircuitCurrentKA) {
    technicalRows.push([
      'Icc informada',
      `${currentInputs.shortCircuitCurrentKA.toFixed(2)} kA`,
      'Secao por curto-circuito',
      `${currentResults.cableByShortCircuit || '-'} mm2`,
    ]);
  }

  autoTable(doc, {
    startY: y,
    body: technicalRows,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: 2.4,
      lineColor: BORDER,
      lineWidth: 0.2,
      textColor: NAVY,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: SLATE, fillColor: LIGHT, cellWidth: 34 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', textColor: SLATE, fillColor: LIGHT, cellWidth: 34 },
      3: { cellWidth: 62 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  if (y > 245) {
    doc.addPage();
    addContinuationHeader(doc);
    y = 21;
  }

  // Materials
  y = sectionLabel(doc, 'Materiais e equipamentos', y, 'Quantidades e valores informados na proposta.');

  autoTable(doc, {
    startY: y,
    head: [['Descricao', 'Qtd.', 'Un.', 'Valor unit.', 'Total']],
    body: items.map(item => {
      const price = safeNumber(item.price);
      return [
        item.desc || '-',
        safeNumber(item.qtd).toLocaleString('pt-BR'),
        item.unit || 'un',
        money(price),
        money(safeNumber(item.qtd) * price),
      ];
    }),
    theme: 'grid',
    margin: { left: 14, right: 14, top: 20, bottom: 17 },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.8,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 2.4,
      lineColor: BORDER,
      lineWidth: 0.2,
      textColor: NAVY,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 92 },
      1: { cellWidth: 16, halign: 'right' },
      2: { cellWidth: 13, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 33, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: LIGHT },
    didDrawPage: tableData => {
      if (tableData.pageNumber > 1) addContinuationHeader(doc);
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  if (y > 225) {
    doc.addPage();
    addContinuationHeader(doc);
    y = 21;
  }

  // Commercial summary
  y = sectionLabel(doc, 'Resumo comercial', y);

  autoTable(doc, {
    startY: y,
    body: [
      ['Materiais', money(totalMaterials)],
      [`Mao de obra (${safeNumber(labor.hours).toLocaleString('pt-BR')} h x ${money(safeNumber(labor.rate))})`, money(totalLabor)],
      ['Deslocamento', money(safeNumber(costs.travel))],
      ['Outros custos', money(safeNumber(costs.others))],
      ['Desconto', `- ${money(safeNumber(costs.discount))}`],
      ['TOTAL GERAL', money(grandTotal)],
    ],
    theme: 'grid',
    margin: { left: 98, right: 14 },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.8,
      lineColor: BORDER,
      lineWidth: 0.2,
      textColor: NAVY,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { halign: 'right', cellWidth: 43 },
    },
    didParseCell: hook => {
      if (hook.row.index === 5) {
        hook.cell.styles.fillColor = BLUE;
        hook.cell.styles.textColor = [255, 255, 255];
        hook.cell.styles.fontStyle = 'bold';
        hook.cell.styles.fontSize = 10;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  const notes = observations.trim();
  if (notes) {
    if (y > 245) {
      doc.addPage();
      addContinuationHeader(doc);
      y = 21;
    }
    y = sectionLabel(doc, 'Observacoes', y);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(notes, 182);
    doc.text(lines, 14, y);
    y += lines.length * 4 + 5;
  }

  // Technical limitations
  const limitations = currentResults.technicalLimitations || [];
  if (limitations.length > 0) {
    if (y > 225) {
      doc.addPage();
      addContinuationHeader(doc);
      y = 21;
    }
    y = sectionLabel(doc, 'Verificacoes complementares', y);
    doc.setTextColor(...SLATE);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    limitations.forEach((item, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${item}`, 178);
      if (y + lines.length * 3.7 > 273) {
        doc.addPage();
        addContinuationHeader(doc);
        y = 21;
      }
      doc.text(lines, 16, y);
      y += lines.length * 3.7 + 1.5;
    });
    y += 3;
  }

  if (y > 240) {
    doc.addPage();
    addContinuationHeader(doc);
    y = 21;
  }

  // Disclaimer and signature
  doc.setDrawColor(...BORDER);
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE);
  doc.setFontSize(7);
  const disclaimer =
    'Esta proposta utiliza os dados informados e os criterios configurados no Dimensionador Expert. ' +
    'A especificacao final deve ser conferida com as condicoes reais da instalacao, capacidade de interrupcao, ' +
    'coordenacao das protecoes, documentacao vigente dos fabricantes e responsabilidade tecnica aplicavel.';
  doc.text(doc.splitTextToSize(disclaimer, 112), 14, y);

  const signatureX = 132;
  const signatureY = y + 13;
  doc.setDrawColor(...NAVY);
  doc.line(signatureX, signatureY, 196, signatureY);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(commercialData.technicianName || 'Responsavel tecnico', 164, signatureY + 4, { align: 'center' });
  if (commercialData.executingCompany) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE);
    doc.setFontSize(6.5);
    doc.text(commercialData.executingCompany, 164, signatureY + 8, { align: 'center' });
  }

  // Footer all pages
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.line(14, 286, 196, 286);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE);
    doc.text('Dimensionador Expert | Academia do Eletricista', 14, 291);
    doc.text(`Pagina ${page} de ${pageCount}`, 196, 291, { align: 'right' });
  }

  const clientPart = filenamePart(clientData.name || 'cliente');
  const datePart = new Date().toISOString().slice(0, 10);
  doc.save(`proposta-dimensionador-expert-${clientPart}-${datePart}.pdf`);
};
