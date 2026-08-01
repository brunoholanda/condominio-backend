import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

import type { ResidentResponseDto } from '../../application/dto/resident-response.dto';
import type { ReportContext } from '../../application/ports/residents-report-generator';
import { ResidentsReportGenerator } from '../../application/ports/residents-report-generator';
import { ResidentsReportLayout } from './residents-report-layout';

/** The extra bottom margin is the strip reserved for the page footer. */
const PAGE_MARGINS = { top: 40, bottom: 64, left: 40, right: 40 } as const;

/** Draws the report with PDFKit and collects the stream into a single buffer. */
@Injectable()
export class PdfKitResidentsReportGenerator extends ResidentsReportGenerator {
  generate(residents: ResidentResponseDto[], context: ReportContext): Promise<Buffer> {
    const generatedAt = new Date();
    const doc = new PDFDocument({
      size: 'A4',
      margins: { ...PAGE_MARGINS },
      // Pages are only numbered once the total is known, at the end.
      bufferPages: true,
      autoFirstPage: false,
      info: {
        Title: 'Cadastro de moradores',
        Author: 'Condomínio Porto Imperial',
        Subject: 'Documento confidencial com dados pessoais (Lei 13.709/2018)',
        CreationDate: generatedAt,
      },
    });

    const chunks: Buffer[] = [];
    const completed = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    new ResidentsReportLayout(doc).draw(residents, { ...context, generatedAt });
    doc.end();

    return completed;
  }
}
