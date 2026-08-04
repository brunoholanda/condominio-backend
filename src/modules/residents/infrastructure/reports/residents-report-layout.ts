import type { ResidentResponseDto } from '../../application/dto/resident-response.dto';
import type { ReportContext } from '../../application/ports/residents-report-generator';
import { OCCUPANCY_TYPE_LABELS, PET_SPECIES_LABELS } from './report-labels';
import { reportFormat } from './report-format';

/**
 * Carimbo de confidencialidade em todas as páginas: fora do sistema o arquivo
 * perde qualquer proteção, e quem o receber precisa saber o que tem em mãos e
 * de onde ele saiu.
 */
const CONFIDENTIALITY_NOTE =
  'Documento confidencial — contém dados pessoais protegidos pela Lei 13.709/2018 (LGPD). Uso restrito ao controle e à organização ' +
  'do condomínio: não compartilhe com terceiros, guarde em local seguro e descarte quando cumprir a finalidade.';

const COLORS = {
  primary: '#0f2740',
  accent: '#b8944a',
  text: '#16222f',
  muted: '#5f7183',
  border: '#dbe2ea',
  band: '#eef2f7',
} as const;

const FONTS = { regular: 'Helvetica', bold: 'Helvetica-Bold' } as const;

const SIZES = {
  sectionTitle: 8.5,
  label: 7,
  value: 9.5,
  cell: 8.5,
  note: 8,
} as const;

const SECTION_BAND_HEIGHT = 14;
const SECTION_GAP = 8;
const LABEL_HEIGHT = 8.5;
const FIELD_GAP = 7;
const CELL_PADDING = 4;
const TABLE_HEADER_HEIGHT = 14;
const SIGNATURE_BOX_HEIGHT = 80;

interface Field {
  label: string;
  value: string;
  /** Spans the two columns — for values that need the whole width. */
  wide?: boolean;
}

interface Column {
  title: string;
  /** Share of the content width, from 0 to 1. */
  share: number;
}

/** Origem do documento: quem pediu e quando. */
interface ReportIssue extends ReportContext {
  generatedAt: Date;
}

/**
 * Draws the report: one page per resident, following the sections of the paper
 * form. Instantiated per document, so the drawing cursor is never shared.
 */
export class ResidentsReportLayout {
  private y = 0;
  private condominiumName = '';

  constructor(private readonly doc: PDFKit.PDFDocument) {}

  draw(residents: ResidentResponseDto[], issue: ReportIssue): void {
    this.condominiumName = issue.condominiumName;

    for (const resident of residents) {
      this.drawResidentPage(resident);
    }

    this.drawFooters(issue);
  }

  private get left(): number {
    return this.doc.page.margins.left;
  }

  private get contentWidth(): number {
    return this.doc.page.width - this.doc.page.margins.left - this.doc.page.margins.right;
  }

  private get pageBottom(): number {
    return this.doc.page.height - this.doc.page.margins.bottom;
  }

  private drawResidentPage(resident: ResidentResponseDto): void {
    this.doc.addPage();
    this.y = this.doc.page.margins.top;

    this.drawPageHeader(resident);
    this.drawIdentification(resident);
    this.drawContacts(resident);
    this.drawHouseholdMembers(resident);
    this.drawEmployees(resident);
    this.drawVehicles(resident);
    this.drawPets(resident);
    this.drawConsent(resident);
  }

  private drawPageHeader(resident: ResidentResponseDto): void {
    const { doc } = this;

    doc
      .font(FONTS.bold)
      .fontSize(7.5)
      .fillColor(COLORS.accent)
      .text(this.condominiumName.toUpperCase(), this.left, this.y, {
        width: this.contentWidth,
        characterSpacing: 1.2,
        lineBreak: false,
      });

    doc
      .font(FONTS.bold)
      .fontSize(15)
      .fillColor(COLORS.primary)
      .text('Ficha de cadastro de morador', this.left, this.y + 12, {
        width: this.contentWidth,
        lineBreak: false,
      });

    const summary = `Unidade ${resident.unit} · ${resident.fullName}`;

    doc
      .font(FONTS.regular)
      .fontSize(9.5)
      .fillColor(COLORS.muted)
      .text(summary, this.left, this.y + 30, { width: this.contentWidth, lineBreak: false });

    this.y += 42;
    this.drawRule();
    this.y += SECTION_GAP;
  }

  private drawIdentification(resident: ResidentResponseDto): void {
    this.drawSectionTitle('Identificação');
    this.drawFields([
      { label: 'Unidade / apartamento', value: resident.unit },
      { label: 'Vínculo com a unidade', value: OCCUPANCY_TYPE_LABELS[resident.occupancyType] },
      { label: 'Nome completo', value: resident.fullName, wide: true },
      { label: 'RG', value: reportFormat.text(resident.rg) },
      { label: 'CPF', value: reportFormat.cpf(resident.cpf) },
      { label: 'E-mail', value: reportFormat.text(resident.email), wide: true },
      { label: 'Telefone fixo', value: reportFormat.phone(resident.landlinePhone) },
      { label: 'Celular', value: reportFormat.phone(resident.mobilePhone) },
      { label: 'Data da mudança', value: reportFormat.date(resident.movedInAt) },
    ]);
  }

  private drawContacts(resident: ResidentResponseDto): void {
    const { emergencyContact, landlord } = resident;

    this.drawSectionTitle('Contatos');
    this.drawFields([
      { label: 'Emergência — nome', value: reportFormat.text(emergencyContact.name) },
      { label: 'Emergência — telefone', value: reportFormat.phone(emergencyContact.phone) },
      ...(landlord
        ? [
            { label: 'Proprietário / administradora', value: reportFormat.text(landlord.name) },
            { label: 'Telefone do proprietário', value: reportFormat.phone(landlord.phone) },
          ]
        : []),
    ]);
  }

  private drawHouseholdMembers(resident: ResidentResponseDto): void {
    this.drawSectionTitle('Moradores adicionais');
    this.drawTable(
      [
        { title: 'Nome completo', share: 0.5 },
        { title: 'RG', share: 0.25 },
        { title: 'Grau de parentesco', share: 0.25 },
      ],
      resident.householdMembers.map((member) => [
        member.fullName,
        reportFormat.text(member.rg),
        reportFormat.text(member.kinship),
      ]),
    );
  }

  private drawEmployees(resident: ResidentResponseDto): void {
    this.drawSectionTitle('Funcionários da unidade');
    this.drawTable(
      [
        { title: 'Nome completo', share: 0.34 },
        { title: 'RG', share: 0.18 },
        { title: 'Função', share: 0.22 },
        { title: 'Horário de trabalho', share: 0.26 },
      ],
      resident.employees.map((employee) => [
        employee.fullName,
        reportFormat.text(employee.rg),
        reportFormat.text(employee.role),
        reportFormat.text(employee.workSchedule),
      ]),
    );
  }

  private drawVehicles(resident: ResidentResponseDto): void {
    this.drawSectionTitle('Veículos');
    this.drawTable(
      [
        { title: 'Marca', share: 0.28 },
        { title: 'Modelo', share: 0.32 },
        { title: 'Cor', share: 0.2 },
        { title: 'Placa', share: 0.2 },
      ],
      resident.vehicles.map((vehicle) => [
        vehicle.brand,
        vehicle.model,
        vehicle.color,
        reportFormat.plate(vehicle.plate),
      ]),
    );
  }

  private drawPets(resident: ResidentResponseDto): void {
    this.drawSectionTitle('Animais de estimação');
    this.drawTable(
      [
        { title: 'Nome', share: 0.28 },
        { title: 'Espécie', share: 0.22 },
        { title: 'Raça', share: 0.28 },
        { title: 'Cor', share: 0.22 },
      ],
      resident.pets.map((pet) => [
        pet.name,
        PET_SPECIES_LABELS[pet.species],
        reportFormat.text(pet.breed),
        pet.color,
      ]),
    );
  }

  private drawConsent(resident: ResidentResponseDto): void {
    const { doc } = this;
    const consent = resident.dataUsageConsent
      ? 'O morador autorizou o tratamento dos dados deste formulário apenas para o controle e a organização do condomínio, ' +
        'declarando que as demais pessoas aqui informadas foram avisadas do cadastro. A autorização pode ser revogada junto à administração.'
      : 'O morador não autorizou o uso dos dados aqui informados.';

    this.drawSectionTitle('Autorização de uso dos dados');

    doc.font(FONTS.regular).fontSize(SIZES.note).fillColor(COLORS.muted);
    const consentHeight = doc.heightOfString(consent, { width: this.contentWidth });

    this.ensureSpace(consentHeight + SIGNATURE_BOX_HEIGHT);
    doc.text(consent, this.left, this.y, { width: this.contentWidth });
    this.y += consentHeight + 6;

    this.drawSignatureBox(resident);
  }

  private drawSignatureBox(resident: ResidentResponseDto): void {
    const { doc } = this;
    const boxTop = this.y;
    const signatureWidth = this.contentWidth * 0.55;
    const detailsLeft = this.left + signatureWidth + 16;
    const detailsWidth = this.contentWidth - signatureWidth - 16;

    doc
      .roundedRect(this.left, boxTop, this.contentWidth, SIGNATURE_BOX_HEIGHT, 4)
      .lineWidth(0.7)
      .strokeColor(COLORS.border)
      .stroke();

    this.drawSignatureImage(
      resident.signature,
      this.left + 12,
      boxTop + 8,
      signatureWidth - 24,
      44,
    );

    const baseline = boxTop + SIGNATURE_BOX_HEIGHT - 24;

    doc
      .moveTo(this.left + 12, baseline)
      .lineTo(this.left + signatureWidth - 12, baseline)
      .lineWidth(0.7)
      .strokeColor(COLORS.primary)
      .stroke();

    doc
      .font(FONTS.regular)
      .fontSize(SIZES.label)
      .fillColor(COLORS.muted)
      .text('Assinatura do morador', this.left + 12, baseline + 5, {
        width: signatureWidth - 24,
        align: 'center',
        lineBreak: false,
      });

    this.drawSignatureDetails(resident, detailsLeft, boxTop + 10, detailsWidth);

    this.y = boxTop + SIGNATURE_BOX_HEIGHT + SECTION_GAP;
  }

  private drawSignatureDetails(
    resident: ResidentResponseDto,
    x: number,
    top: number,
    width: number,
  ): void {
    const details: [string, string][] = [
      ['Assinado por', resident.fullName],
      ['CPF', reportFormat.cpf(resident.cpf)],
      ['Data e hora', reportFormat.dateTime(resident.signedAt)],
    ];

    details.forEach(([label, value], index) => {
      const y = top + index * 22;

      this.doc
        .font(FONTS.bold)
        .fontSize(SIZES.label)
        .fillColor(COLORS.muted)
        .text(label.toUpperCase(), x, y, { width, characterSpacing: 0.5, lineBreak: false });

      this.doc
        .font(FONTS.regular)
        .fontSize(SIZES.cell)
        .fillColor(COLORS.text)
        .text(value, x, y + 9, { width, lineBreak: false, ellipsis: true });
    });
  }

  /** A broken image must not cost the whole report, so the failure is printed instead. */
  private drawSignatureImage(
    dataUrl: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);

    try {
      this.doc.image(Buffer.from(base64, 'base64'), x, y, {
        fit: [width, height],
        align: 'center',
        valign: 'bottom',
      });
    } catch {
      this.doc
        .font(FONTS.regular)
        .fontSize(SIZES.note)
        .fillColor(COLORS.muted)
        .text('Assinatura indisponível', x, y + height / 2, {
          width,
          align: 'center',
          lineBreak: false,
        });
    }
  }

  private drawSectionTitle(title: string): void {
    const { doc } = this;

    this.ensureSpace(SECTION_BAND_HEIGHT + 40);

    doc.rect(this.left, this.y, this.contentWidth, SECTION_BAND_HEIGHT).fill(COLORS.band);
    doc.rect(this.left, this.y, 3, SECTION_BAND_HEIGHT).fill(COLORS.accent);

    doc
      .font(FONTS.bold)
      .fontSize(SIZES.sectionTitle)
      .fillColor(COLORS.primary)
      .text(title.toUpperCase(), this.left + 10, this.y + 4, {
        width: this.contentWidth - 20,
        characterSpacing: 0.8,
        lineBreak: false,
      });

    this.y += SECTION_BAND_HEIGHT + 6;
  }

  private drawFields(fields: Field[]): void {
    const gutter = 16;
    const columnWidth = (this.contentWidth - gutter) / 2;
    let index = 0;

    while (index < fields.length) {
      const field = fields[index];
      const next = fields[index + 1];
      const partner = field.wide || !next || next.wide ? undefined : next;
      const width = field.wide ? this.contentWidth : columnWidth;

      const height = Math.max(
        this.fieldHeight(field, width),
        partner ? this.fieldHeight(partner, columnWidth) : 0,
      );

      this.ensureSpace(height);
      this.drawField(field, this.left, width);

      if (partner) {
        this.drawField(partner, this.left + columnWidth + gutter, columnWidth);
      }

      this.y += height + FIELD_GAP;
      index += partner ? 2 : 1;
    }

    this.y += SECTION_GAP - FIELD_GAP;
  }

  private fieldHeight(field: Field, width: number): number {
    this.doc.font(FONTS.regular).fontSize(SIZES.value);

    return LABEL_HEIGHT + this.doc.heightOfString(field.value, { width });
  }

  private drawField(field: Field, x: number, width: number): void {
    this.doc
      .font(FONTS.bold)
      .fontSize(SIZES.label)
      .fillColor(COLORS.muted)
      .text(field.label.toUpperCase(), x, this.y, {
        width,
        characterSpacing: 0.5,
        lineBreak: false,
        ellipsis: true,
      });

    this.doc
      .font(FONTS.regular)
      .fontSize(SIZES.value)
      .fillColor(COLORS.text)
      .text(field.value, x, this.y + LABEL_HEIGHT, { width });
  }

  private drawTable(columns: Column[], rows: string[][]): void {
    if (rows.length === 0) {
      this.drawEmptyState();

      return;
    }

    const widths = columns.map((column) => column.share * this.contentWidth);

    this.drawTableHeader(columns, widths);

    for (const row of rows) {
      const height = this.rowHeight(row, widths);

      if (this.ensureSpace(height)) {
        this.drawTableHeader(columns, widths);
      }

      this.drawTableRow(row, widths, height);
    }

    this.y += SECTION_GAP;
  }

  private drawTableHeader(columns: Column[], widths: number[]): void {
    const { doc } = this;

    doc.rect(this.left, this.y, this.contentWidth, TABLE_HEADER_HEIGHT).fill(COLORS.band);
    doc.font(FONTS.bold).fontSize(SIZES.label).fillColor(COLORS.muted);

    let x = this.left;

    columns.forEach((column, index) => {
      doc.text(column.title.toUpperCase(), x + CELL_PADDING, this.y + 4, {
        width: (widths[index] ?? 0) - CELL_PADDING * 2,
        characterSpacing: 0.5,
        lineBreak: false,
        ellipsis: true,
      });

      x += widths[index] ?? 0;
    });

    this.y += TABLE_HEADER_HEIGHT;
  }

  private drawTableRow(row: string[], widths: number[], height: number): void {
    const { doc } = this;

    doc.font(FONTS.regular).fontSize(SIZES.cell).fillColor(COLORS.text);

    let x = this.left;

    row.forEach((cell, index) => {
      doc.text(cell, x + CELL_PADDING, this.y + CELL_PADDING, {
        width: (widths[index] ?? 0) - CELL_PADDING * 2,
      });

      x += widths[index] ?? 0;
    });

    this.y += height;

    doc
      .moveTo(this.left, this.y)
      .lineTo(this.left + this.contentWidth, this.y)
      .lineWidth(0.5)
      .strokeColor(COLORS.border)
      .stroke();
  }

  private rowHeight(row: string[], widths: number[]): number {
    this.doc.font(FONTS.regular).fontSize(SIZES.cell);

    const tallest = row.reduce((height, cell, index) => {
      const width = (widths[index] ?? 0) - CELL_PADDING * 2;

      return Math.max(height, this.doc.heightOfString(cell, { width }));
    }, 0);

    return tallest + CELL_PADDING * 2;
  }

  private drawEmptyState(): void {
    this.ensureSpace(16);

    this.doc
      .font(FONTS.regular)
      .fontSize(SIZES.note)
      .fillColor(COLORS.muted)
      .text('Nenhum registro informado.', this.left, this.y, {
        width: this.contentWidth,
        lineBreak: false,
      });

    this.y += 14 + SECTION_GAP;
  }

  private drawRule(): void {
    this.doc
      .moveTo(this.left, this.y)
      .lineTo(this.left + this.contentWidth, this.y)
      .lineWidth(0.7)
      .strokeColor(COLORS.border)
      .stroke();
  }

  /** Opens a new page when the next block does not fit. Returns whether it broke. */
  private ensureSpace(height: number): boolean {
    if (this.y + height <= this.pageBottom) {
      return false;
    }

    this.doc.addPage();
    this.y = this.doc.page.margins.top;

    return true;
  }

  private drawFooters({ generatedAt, requestedBy }: ReportIssue): void {
    const { doc } = this;
    const range = doc.bufferedPageRange();
    const origin = `${this.condominiumName} · Gerado em ${reportFormat.dateTime(generatedAt.toISOString())} por ${requestedBy}`;

    for (let index = 0; index < range.count; index += 1) {
      doc.switchToPage(range.start + index);

      // Footers live below the text area; without this PDFKit would paginate.
      doc.page.margins.bottom = 0;

      const y = doc.page.height - 30;
      const half = this.contentWidth / 2;

      doc
        .font(FONTS.bold)
        .fontSize(6.5)
        .fillColor(COLORS.muted)
        .text(CONFIDENTIALITY_NOTE, this.left, doc.page.height - 56, { width: this.contentWidth });

      doc
        .font(FONTS.regular)
        .fontSize(SIZES.label)
        .fillColor(COLORS.muted)
        .text(origin, this.left, y, { width: half * 1.4, lineBreak: false, ellipsis: true })
        .text(`Página ${index + 1} de ${range.count}`, this.left + half * 1.4, y, {
          width: this.contentWidth - half * 1.4,
          align: 'right',
          lineBreak: false,
        });
    }
  }
}
