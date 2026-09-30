import { createClientOnlyFn } from '@tanstack/react-start';
import type { CalculationInputs, CalculationResults, CompanyProfile } from '@/types';

export interface ProposalPdfItem {
  id: string;
  desc: string;
  qtd: number;
  unit?: string;
  price: number | string;
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
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const safeNumber = (value: number | string | undefined) => {
  const parsed = typeof value === 'number' ? value : Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const filenamePart = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.slice(1) : '2563EB';
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
};

const starterLabel = (starter: CalculationInputs['starterType']) => {
  if (starter === 'direta') return 'Partida direta';
  if (starter === 'reversao') return 'Partida com reversao';
  if (starter === 'estrelaTriangulo') return 'Partida estrela-triangulo';
  if (starter === 'softStarter') return 'Partida por soft-starter';
  return 'Acionamento por inversor de frequencia';
};

const companyName = (profile: CompanyProfile) => profile.companyName.trim() || 'Empresa / Profissional';

const responsibleName = (data: ProposalPdfData) =>
  data.companyProfile.responsibleName.trim() ||
  data.commercialData.technicianName.trim() ||
  'Responsavel pelo servico';

const companyContactLine = (profile: CompanyProfile) =>
  [profile.phone, profile.email, profile.website].filter(Boolean).join(' | ');

const drawLogo = (doc: any, profile: CompanyProfile) => {
  if (!profile.logoDataUrl) return false;
  try {
    const props = doc.getImageProperties(profile.logoDataUrl);
    const maxW = 38;
    const maxH = 15;
    const ratio = props.width / props.height;
    let width = maxW;
    let height = width / ratio;
    if (height > maxH) {
      height = maxH;
      width = height * ratio;
    }
    doc.addImage(profile.logoDataUrl, undefined, 14, 8.5, width, height, undefined, 'FAST');
    return true;
  } catch {
    return false;
  }
};

const addBrandedHeader = (
  doc: any,
  data: ProposalPdfData,
  title: string,
  subtitle: string,
  rightLines: string[],
) => {
  const brand = hexToRgb(data.companyProfile.brandColor);

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 37, 'F');
  doc.setFillColor(...brand);
  doc.rect(0, 35, 210, 2, 'F');

  const hasLogo = drawLogo(doc, data.companyProfile);
  const textX = hasLogo ? 57 : 14;

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(hasLogo ? 13 : 18);
  doc.text(companyName(data.companyProfile).toUpperCase(), textX, 14);

  const identityLine = [
    data.companyProfile.document,
    data.companyProfile.professionalRegistration,
  ].filter(Boolean).join(' | ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(203, 213, 225);
  if (identityLine) doc.text(identityLine, textX, 19);
  const contact = companyContactLine(data.companyProfile);
  if (contact) doc.text(contact, textX, 24);
  if (data.companyProfile.cityState) doc.text(data.companyProfile.cityState, textX, 29);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(title, 196, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(203, 213, 225);
  doc.text(subtitle, 196, 18, { align: 'right' });
  rightLines.forEach((line, index) => doc.text(line, 196, 24 + index * 5, { align: 'right' }));
};

const addContinuationHeader = (doc: any, data: ProposalPdfData, title: string) => {
  const brand = hexToRgb(data.companyProfile.brandColor);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`${companyName(data.companyProfile)} | ${title}`, 14, 10);
  doc.setDrawColor(...brand);
  doc.line(14, 13, 196, 13);
};

const sectionLabel = (
  doc: any,
  profile: CompanyProfile,
  title: string,
  y: number,
  subtitle?: string,
) => {
  const brand = hexToRgb(profile.brandColor);
  doc.setTextColor(...brand);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(title.toUpperCase(), 14, y);

  if (subtitle) {
    doc.setTextColor(...SLATE);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(subtitle, 14, y + 4);
    return y + 8;
  }
  return y + 4;
};

const addClientBlock = (doc: any, autoTable: any, data: ProposalPdfData, y: number) => {
  y = sectionLabel(doc, data.companyProfile, 'Cliente', y);
  autoTable(doc, {
    startY: y,
    body: [
      ['Cliente', data.clientData.name || '-'],
      ['CPF/CNPJ', data.clientData.doc || '-'],
      ['Contato', [data.clientData.phone, data.clientData.email].filter(Boolean).join(' | ') || '-'],
    ],
    theme: 'plain',
    margin: { left: 14, right: 14 },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.2, textColor: NAVY },
    columnStyles: {
      0: { cellWidth: 31, fontStyle: 'bold', textColor: SLATE },
      1: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: LIGHT },
  });
  return (doc as any).lastAutoTable.finalY + 7;
};

const addServiceDescription = (doc: any, data: ProposalPdfData, y: number, title = 'Escopo do servico') => {
  if (!data.commercialData.serviceDescription.trim()) return y;
  const brand = hexToRgb(data.companyProfile.brandColor);
  y = sectionLabel(doc, data.companyProfile, title, y);
  const lines = doc.splitTextToSize(data.commercialData.serviceDescription.trim(), 174);
  const h = Math.max(16, lines.length * 4.1 + 7);
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, y, 182, h, 2, 2, 'FD');
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(lines, 18, y + 6);
  doc.setDrawColor(...brand);
  doc.line(14, y, 14, y + h);
  return y + h + 7;
};

const addSignatureBlock = (doc: any, data: ProposalPdfData, y: number, includeClient = false) => {
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(responsibleName(data), 50, signatureY + 4, { align: 'center' });
    doc.text(data.clientData.name || 'Cliente / Contratante', 160, signatureY + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE);
    doc.setFontSize(6.5);
    doc.text('Responsavel pelo servico', 50, signatureY + 8, { align: 'center' });
    doc.text('Aceite do cliente', 160, signatureY + 8, { align: 'center' });
    return;
  }

  doc.setDrawColor(...NAVY);
  doc.line(126, signatureY, 196, signatureY);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(responsibleName(data), 161, signatureY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE);
  doc.setFontSize(6.5);
  doc.text(data.companyProfile.professionalRegistration || 'Responsavel pelo servico', 161, signatureY + 8, { align: 'center' });
};

const addFooters = (doc: any, data: ProposalPdfData, label: string) => {
  const brand = hexToRgb(data.companyProfile.brandColor);
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.line(14, 286, 196, 286);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(...SLATE);
    doc.text(`${companyName(data.companyProfile)} | ${label}`, 14, 291);
    doc.setTextColor(...brand);
    doc.text(`Pagina ${page} de ${pageCount}`, 196, 291, { align: 'right' });
  }
};

const addNumberedSection = (
  doc: any,
  data: ProposalPdfData,
  number: number,
  title: string,
  text: string,
  y: number,
) => {
  if (y > 255) {
    doc.addPage();
    addContinuationHeader(doc, data, 'MEMORIAL DESCRITIVO');
    y = 21;
  }

  const brand = hexToRgb(data.companyProfile.brandColor);
  doc.setFillColor(...brand);
  doc.roundedRect(14, y - 3, 8, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(String(number), 18, y + 2.3, { align: 'center' });

  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, 26, y + 2);

  const lines = doc.splitTextToSize(text, 170);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text(lines, 26, y + 8);
  return y + 10 + lines.length * 4.2 + 5;
};

export const generateCommercialProposalPdf = createClientOnlyFn(async (data: ProposalPdfData) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const brand = hexToRgb(data.companyProfile.brandColor);
  const date = new Date().toLocaleDateString('pt-BR');

  doc.setProperties({
    title: `Proposta Comercial - ${companyName(data.companyProfile)}`,
    subject: 'Proposta comercial de servicos e materiais',
    author: companyName(data.companyProfile),
    creator: 'Dimensionador Expert',
  });

  const totalMaterials = data.items.reduce((sum, item) => sum + safeNumber(item.qtd) * safeNumber(item.price), 0);
  const totalLabor = safeNumber(data.labor.hours) * safeNumber(data.labor.rate);
  const grandTotal =
    totalMaterials + totalLabor + safeNumber(data.costs.travel) + safeNumber(data.costs.others) - safeNumber(data.costs.discount);

  addBrandedHeader(doc, data, 'PROPOSTA COMERCIAL', 'SERVICOS E MATERIAIS', [date, `Validade: ${data.costs.validity || 30} dias`]);

  let y = 46;
  y = addClientBlock(doc, autoTable, data, y);
  y = addServiceDescription(doc, data, y);

  y = sectionLabel(doc, data.companyProfile, 'Materiais e servicos', y, 'Itens previstos para execucao do escopo apresentado.');
  autoTable(doc, {
    startY: y,
    head: [['Descricao', 'Qtd.', 'Un.', 'Valor unit.', 'Total']],
    body: data.items.map(item => {
      const price = safeNumber(item.price);
      return [item.desc || '-', safeNumber(item.qtd).toLocaleString('pt-BR'), item.unit || 'un', money(price), money(safeNumber(item.qtd) * price)];
    }),
    theme: 'grid',
    margin: { left: 14, right: 14, top: 20, bottom: 17 },
    headStyles: { fillColor: brand, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, cellPadding: 2.8 },
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
      if (tableData.pageNumber > 1) addContinuationHeader(doc, data, 'PROPOSTA COMERCIAL');
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  if (y > 225) {
    doc.addPage();
    addContinuationHeader(doc, data, 'PROPOSTA COMERCIAL');
    y = 21;
  }

  y = sectionLabel(doc, data.companyProfile, 'Investimento', y);
  autoTable(doc, {
    startY: y,
    body: [
      ['Materiais', money(totalMaterials)],
      ['Mao de obra e servicos', money(totalLabor)],
      ['Deslocamento', money(safeNumber(data.costs.travel))],
      ['Outros custos', money(safeNumber(data.costs.others))],
      ['Desconto', `- ${money(safeNumber(data.costs.discount))}`],
      ['TOTAL', money(grandTotal)],
    ],
    theme: 'grid',
    margin: { left: 98, right: 14 },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.8, lineColor: BORDER, lineWidth: 0.2, textColor: NAVY },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { halign: 'right', cellWidth: 43 } },
    didParseCell: (hook: any) => {
      if (hook.row.index === 5) {
        hook.cell.styles.fillColor = brand;
        hook.cell.styles.textColor = [255, 255, 255];
        hook.cell.styles.fontStyle = 'bold';
        hook.cell.styles.fontSize = 10;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  if (data.observations.trim()) {
    if (y > 244) {
      doc.addPage();
      addContinuationHeader(doc, data, 'PROPOSTA COMERCIAL');
      y = 21;
    }
    y = sectionLabel(doc, data.companyProfile, 'Condicoes comerciais e observacoes', y);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(data.observations.trim(), 182);
    doc.text(lines, 14, y);
    y += lines.length * 4 + 7;
  }

  doc.setTextColor(...SLATE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const note =
    'Esta proposta refere-se ao escopo descrito. Alteracoes solicitadas, servicos adicionais ou condicoes de campo nao previstas poderao resultar em revisao de valores e prazos.';
  doc.text(doc.splitTextToSize(note, 182), 14, y);

  addSignatureBlock(doc, data, y + 13, true);
  addFooters(doc, data, 'Proposta Comercial');

  const clientPart = filenamePart(data.clientData.name || 'cliente');
  doc.save(`proposta-comercial-${clientPart}-${new Date().toISOString().slice(0, 10)}.pdf`);
});

export const generateDescriptiveMemorialPdf = createClientOnlyFn(async (data: ProposalPdfData) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const date = new Date().toLocaleDateString('pt-BR');

  doc.setProperties({
    title: `Memorial Descritivo - ${companyName(data.companyProfile)}`,
    subject: 'Memorial descritivo do servico eletrico',
    author: companyName(data.companyProfile),
    creator: 'Dimensionador Expert',
  });

  addBrandedHeader(doc, data, 'MEMORIAL DESCRITIVO', 'DESCRICAO TECNICA DO SERVICO', [date]);

  let y = 46;
  y = addClientBlock(doc, autoTable, data, y);

  const objectText = data.commercialData.serviceDescription.trim() ||
    `Execucao de servico eletrico para alimentacao e acionamento de carga de ${data.currentInputs.power} ${data.currentInputs.powerUnit}, conforme caracteristicas tecnicas descritas neste memorial.`;
  y = addNumberedSection(doc, data, 1, 'Objeto', objectText, y);

  const systemText =
    `O servico considera carga de ${data.currentInputs.power} ${data.currentInputs.powerUnit}, alimentada em ${data.currentInputs.voltage} V, ` +
    `sistema ${data.currentInputs.phase === 'trifasico' ? 'trifasico' : 'monofasico'}, com ${starterLabel(data.currentInputs.starterType).toLowerCase()}. ` +
    `A distancia aproximada entre alimentacao e carga informada para o projeto e de ${data.currentInputs.distance} m.`;
  y = addNumberedSection(doc, data, 2, 'Caracterizacao do sistema', systemText, y);

  const conductorText =
    `Os condutores de potencia previstos sao de cobre, isolacao PVC 70 C, classe de tensao 0,6/1 kV, com secao final de ${data.currentResults.finalCableSection} mm2 para os condutores de fase. ` +
    `O metodo de instalacao considerado e ${data.currentInputs.installationMethod || 'o informado no levantamento'}. A queda de tensao estimada para a configuracao selecionada e de ${data.currentResults.voltageDropCalculated.toFixed(2)}%.`;
  y = addNumberedSection(doc, data, 3, 'Condutores e instalacao', conductorText, y);

  const commandText =
    data.currentInputs.starterType === 'inversor'
      ? 'O acionamento sera realizado por inversor de frequencia dimensionado para a corrente da carga, incluindo parametrizacao funcional, conexoes de potencia e comando e testes de operacao.'
      : data.currentInputs.starterType === 'softStarter'
        ? 'O acionamento sera realizado por soft-starter dimensionada para a corrente da carga, incluindo conexoes, configuracao dos parametros de partida e testes de operacao.'
        : `O comando sera montado para ${starterLabel(data.currentInputs.starterType).toLowerCase()}, incluindo os dispositivos de manobra, comando, sinalizacao e intertravamento aplicaveis ao circuito.`;
  y = addNumberedSection(doc, data, 4, 'Sistema de acionamento e comando', commandText, y);

  if (y > 225) {
    doc.addPage();
    addContinuationHeader(doc, data, 'MEMORIAL DESCRITIVO');
    y = 21;
  }

  y = sectionLabel(doc, data.companyProfile, '5. Materiais e equipamentos principais', y, 'Relacao tecnica prevista, sem valores comerciais.');
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
      if (tableData.pageNumber > 1) addContinuationHeader(doc, data, 'MEMORIAL DESCRITIVO');
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  const executionText =
    'A execucao contempla montagem e fixacao dos componentes, lancamento e identificacao dos condutores, terminacoes, conexoes eletricas, organizacao interna do painel e conferencias de montagem antes da energizacao.';
  y = addNumberedSection(doc, data, 6, 'Procedimentos de execucao', executionText, y);

  const testText =
    'Antes da entrega serao realizados, conforme aplicabilidade ao escopo, verificacao visual, conferencia de aperto e conexoes, continuidade dos circuitos, testes do circuito de comando, sequencia de funcionamento, sinalizacao e teste funcional do acionamento.';
  y = addNumberedSection(doc, data, 7, 'Testes e comissionamento', testText, y);

  const deliveryText =
    'Ao final do servico, o sistema devera ser entregue em condicao operacional dentro do escopo contratado. Eventuais alteracoes decorrentes de condicoes nao identificadas previamente deverao ser registradas e acordadas antes de sua execucao.';
  y = addNumberedSection(doc, data, 8, 'Entrega e consideracoes finais', deliveryText, y);

  if (data.observations.trim()) {
    y = addNumberedSection(doc, data, 9, 'Observacoes especificas', data.observations.trim(), y);
  }

  addSignatureBlock(doc, data, y + 5, false);
  addFooters(doc, data, 'Memorial Descritivo');

  const clientPart = filenamePart(data.clientData.name || 'cliente');
  doc.save(`memorial-descritivo-${clientPart}-${new Date().toISOString().slice(0, 10)}.pdf`);
});
