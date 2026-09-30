import { createClientOnlyFn } from '@tanstack/react-start';
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

const sectionLabel = (doc: any, title: string, y: number, subtitle?: string) => {
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

const addHeader = (
  doc: any,
  title: string,
  subtitle: string,
  rightLines: string[],
) => {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setFillColor(...BLUE);
  doc.rect(0, 35, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DIMENSIONADOR EXPERT', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(subtitle, 14, 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(title, 196, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  rightLines.forEach((line, index) => doc.text(line, 196, 20 + index * 5, { align: 'right' }));
};

const addContinuationHeader = (doc: any, title: string) => {
  doc.setTextColor(...SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`DIMENSIONADOR EXPERT - ${title}`, 14, 10);
  doc.setDrawColor(...BORDER);
  doc.line(14, 13, 196, 13);
};

const addClientBlock = (doc: any, autoTable: any, data: ProposalPdfData, y: number) => {
  y = sectionLabel(doc, 'Cliente e responsavel', y);
  autoTable(doc, {
    startY: y,
    body: [
      ['Cliente', data.clientData.name || '-'],
      ['CPF/CNPJ', data.clientData.doc || '-'],
      ['Contato', [data.clientData.phone, data.clientData.email].filter(Boolean).join(' | ') || '-'],
      ['Responsavel', data.commercialData.technicianName || '-'],
      ['Empresa executora', data.commercialData.executingCompany || '-'],
    ],
    theme: 'plain',
    margin: { left: 14, right: 14 },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.2, textColor: NAVY },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold', textColor: SLATE },
      1: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: LIGHT },
  });
  return (doc as any).lastAutoTable.finalY + 7;
};

const addServiceDescription = (doc: any, description: string, y: number) => {
  if (!description) return y;

  y = sectionLabel(doc, 'Descricao do servico', y);
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  const lines = doc.splitTextToSize(description, 174);
  const h = Math.max(16, lines.length * 4.1 + 7);
  doc.roundedRect(14, y, 182, h, 2, 2, 'FD');
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(lines, 18, y + 6);
  return y + h + 7;
};

const addSignature = (doc: any, data: ProposalPdfData, y: number) => {
  if (y > 248) {
    doc.addPage();
    y = 24;
  }

  doc.setDrawColor(...BORDER);
  doc.line(14, y, 196, y);
  const signatureY = y + 14;

  doc.setDrawColor(...NAVY);
  doc.line(132, signatureY, 196, signatureY);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(data.commercialData.technicianName || 'Responsavel pelo servico', 164, signatureY + 4, { align: 'center' });

  if (data.commercialData.executingCompany) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE);
    doc.setFontSize(6.5);
    doc.text(data.commercialData.executingCompany, 164, signatureY + 8, { align: 'center' });
  }
};

const addFooters = (doc: any, label: string) => {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.line(14, 286, 196, 286);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE);
    doc.text(`Dimensionador Expert | ${label}`, 14, 291);
    doc.text(`Pagina ${page} de ${pageCount}`, 196, 291, { align: 'right' });
  }
};

export const generateCommercialProposalPdf = createClientOnlyFn(async (data: ProposalPdfData) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const date = new Date().toLocaleDateString('pt-BR');

  doc.setProperties({
    title: 'Proposta Comercial - Dimensionador Expert',
    subject: 'Proposta comercial de servicos e materiais',
    author: data.commercialData.executingCompany || data.commercialData.technicianName || 'Dimensionador Expert',
    creator: 'Dimensionador Expert',
  });

  const totalMaterials = data.items.reduce(
    (sum, item) => sum + safeNumber(item.qtd) * safeNumber(item.price),
    0,
  );
  const totalLabor = safeNumber(data.labor.hours) * safeNumber(data.labor.rate);
  const grandTotal =
    totalMaterials +
    totalLabor +
    safeNumber(data.costs.travel) +
    safeNumber(data.costs.others) -
    safeNumber(data.costs.discount);

  addHeader(
    doc,
    'PROPOSTA COMERCIAL',
    'SERVICOS E MATERIAIS',
    [date, `Validade: ${data.costs.validity || 30} dias`],
  );

  let y = 46;
  y = addClientBlock(doc, autoTable, data, y);
  y = addServiceDescription(doc, data.commercialData.serviceDescription, y);

  y = sectionLabel(doc, 'Materiais e servicos', y, 'Itens previstos para execucao do servico.');

  autoTable(doc, {
    startY: y,
    head: [['Descricao', 'Qtd.', 'Un.', 'Valor unit.', 'Total']],
    body: data.items.map(item => {
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
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, cellPadding: 2.8 },
    styles: { font: 'helvetica', fontSize: 7.2, cellPadding: 2.4, lineColor: BORDER, lineWidth: 0.2, textColor: NAVY, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 92 },
      1: { cellWidth: 16, halign: 'right' },
      2: { cellWidth: 13, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 33, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: LIGHT },
    didDrawPage: (tableData: any) => {
      if (tableData.pageNumber > 1) addContinuationHeader(doc, 'PROPOSTA COMERCIAL');
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  if (y > 225) {
    doc.addPage();
    addContinuationHeader(doc, 'PROPOSTA COMERCIAL');
    y = 21;
  }

  y = sectionLabel(doc, 'Resumo comercial', y);
  autoTable(doc, {
    startY: y,
    body: [
      ['Materiais', money(totalMaterials)],
      ['Mao de obra e servicos', money(totalLabor)],
      ['Deslocamento', money(safeNumber(data.costs.travel))],
      ['Outros custos', money(safeNumber(data.costs.others))],
      ['Desconto', `- ${money(safeNumber(data.costs.discount))}`],
      ['TOTAL GERAL', money(grandTotal)],
    ],
    theme: 'grid',
    margin: { left: 98, right: 14 },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.8, lineColor: BORDER, lineWidth: 0.2, textColor: NAVY },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { halign: 'right', cellWidth: 43 } },
    didParseCell: (hook: any) => {
      if (hook.row.index === 5) {
        hook.cell.styles.fillColor = BLUE;
        hook.cell.styles.textColor = [255, 255, 255];
        hook.cell.styles.fontStyle = 'bold';
        hook.cell.styles.fontSize = 10;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  if (data.observations.trim()) {
    if (y > 245) {
      doc.addPage();
      addContinuationHeader(doc, 'PROPOSTA COMERCIAL');
      y = 21;
    }
    y = sectionLabel(doc, 'Condicoes e observacoes', y);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(data.observations.trim(), 182);
    doc.text(lines, 14, y);
    y += lines.length * 4 + 6;
  }

  doc.setTextColor(...SLATE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const commercialNote =
    'Os materiais e servicos descritos nesta proposta correspondem ao escopo apresentado. ' +
    'Alteracoes solicitadas pelo cliente ou condicoes de campo nao previstas poderao exigir revisao dos valores e prazos.';
  doc.text(doc.splitTextToSize(commercialNote, 112), 14, y);

  addSignature(doc, data, y + 13);
  addFooters(doc, 'Proposta Comercial');

  const clientPart = filenamePart(data.clientData.name || 'cliente');
  const datePart = new Date().toISOString().slice(0, 10);
  doc.save(`proposta-comercial-${clientPart}-${datePart}.pdf`);
});

export const generateDescriptiveMemorialPdf = createClientOnlyFn(async (data: ProposalPdfData) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const date = new Date().toLocaleDateString('pt-BR');

  doc.setProperties({
    title: 'Memorial Descritivo - Dimensionador Expert',
    subject: 'Memorial descritivo do servico',
    author: data.commercialData.executingCompany || data.commercialData.technicianName || 'Dimensionador Expert',
    creator: 'Dimensionador Expert',
  });

  addHeader(
    doc,
    'MEMORIAL DESCRITIVO',
    'DESCRICAO TECNICA DO SERVICO',
    [date],
  );

  let y = 46;
  y = addClientBlock(doc, autoTable, data, y);
  y = addServiceDescription(doc, data.commercialData.serviceDescription, y);

  y = sectionLabel(doc, 'Dados da instalacao', y, 'Caracteristicas principais consideradas para execucao.');
  autoTable(doc, {
    startY: y,
    body: [
      ['Carga', `${data.currentInputs.power} ${data.currentInputs.powerUnit}`, 'Alimentacao', `${data.currentInputs.voltage} V - ${data.currentInputs.phase === 'trifasico' ? 'trifasico' : 'monofasico'}`],
      ['Acionamento', starterLabel(data.currentInputs.starterType), 'Distancia aproximada', `${data.currentInputs.distance} m`],
      ['Metodo de instalacao', data.currentInputs.installationMethod || '-', 'Fabricante de referencia', data.selectedManufacturer],
      ['Condutores de fase', `Cu/PVC 70 C - ${data.currentResults.finalCableSection} mm2`, 'Queda de tensao prevista', `${data.currentResults.voltageDropCalculated.toFixed(2)} %`],
    ],
    theme: 'grid',
    margin: { left: 14, right: 14 },
    styles: { font: 'helvetica', fontSize: 7.8, cellPadding: 2.5, lineColor: BORDER, lineWidth: 0.2, textColor: NAVY },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: SLATE, fillColor: LIGHT, cellWidth: 34 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', textColor: SLATE, fillColor: LIGHT, cellWidth: 34 },
      3: { cellWidth: 62 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  if (y > 235) {
    doc.addPage();
    addContinuationHeader(doc, 'MEMORIAL DESCRITIVO');
    y = 21;
  }

  y = sectionLabel(doc, 'Materiais e equipamentos previstos', y, 'Relacao tecnica sem valores comerciais.');
  autoTable(doc, {
    startY: y,
    head: [['Descricao', 'Qtd.', 'Un.']],
    body: data.items.map(item => [item.desc || '-', safeNumber(item.qtd).toLocaleString('pt-BR'), item.unit || 'un']),
    theme: 'grid',
    margin: { left: 14, right: 14, top: 20, bottom: 17 },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, cellPadding: 2.8 },
    styles: { font: 'helvetica', fontSize: 7.4, cellPadding: 2.5, lineColor: BORDER, lineWidth: 0.2, textColor: NAVY },
    columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 20, halign: 'right' }, 2: { cellWidth: 16, halign: 'center' } },
    alternateRowStyles: { fillColor: LIGHT },
    didDrawPage: (tableData: any) => {
      if (tableData.pageNumber > 1) addContinuationHeader(doc, 'MEMORIAL DESCRITIVO');
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  if (y > 220) {
    doc.addPage();
    addContinuationHeader(doc, 'MEMORIAL DESCRITIVO');
    y = 21;
  }

  y = sectionLabel(doc, 'Criterios de execucao', y);
  const executionItems = [
    'Montagem e instalacao conforme o escopo descrito e as condicoes verificadas no local.',
    'Identificacao dos condutores e componentes, organizacao do painel e conexoes eletricas.',
    'Conferencia de aperto, continuidade e conexoes antes da energizacao.',
    'Testes funcionais do circuito de comando e do acionamento previstos no servico.',
    'Ajustes e parametrizacoes aplicaveis aos equipamentos incluidos no escopo.',
  ];

  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  executionItems.forEach((item, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${item}`, 176);
    doc.text(lines, 16, y);
    y += lines.length * 4 + 2;
  });

  y += 3;
  y = sectionLabel(doc, 'Observacoes tecnicas', y);
  const technicalNote =
    'As especificacoes indicadas neste memorial correspondem ao escopo e aos dados informados para o servico. ' +
    'A execucao deve considerar as condicoes encontradas em campo e a documentacao tecnica dos equipamentos instalados.';
  doc.setTextColor(...SLATE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(doc.splitTextToSize(technicalNote, 182), 14, y);

  addSignature(doc, data, y + 16);
  addFooters(doc, 'Memorial Descritivo');

  const clientPart = filenamePart(data.clientData.name || 'cliente');
  const datePart = new Date().toISOString().slice(0, 10);
  doc.save(`memorial-descritivo-${clientPart}-${datePart}.pdf`);
});
