import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface PublicQrPdfInput {
  condominiumName: string;
  targetLabel: string;
  publicUrl: string;
}

/**
 * Printable A4 sheet: framed QR Code pointing to a public condo URL,
 * with the building name in the footer.
 */
@Injectable()
export class PdfKitPublicQrGenerator {
  async generate(input: PublicQrPdfInput): Promise<Buffer> {
    const qrPng = await QRCode.toBuffer(input.publicUrl, {
      type: 'png',
      width: 720,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1a1a1a', light: '#ffffff' },
    });

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 48, bottom: 48, left: 48, right: 48 },
      info: {
        Title: `QR Code — ${input.condominiumName}`,
        Author: input.condominiumName,
        Subject: input.targetLabel,
        CreationDate: new Date(),
      },
    });

    const chunks: Buffer[] = [];
    const completed = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    this.draw(doc, input, qrPng);
    doc.end();

    return completed;
  }

  private draw(
    doc: PDFKit.PDFDocument,
    input: PublicQrPdfInput,
    qrPng: Buffer,
  ): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 36;
    const frameInset = 12;

    // Outer moldura
    doc
      .lineWidth(2.5)
      .strokeColor('#1f3a5f')
      .rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)
      .stroke();

    // Inner moldura
    doc
      .lineWidth(0.8)
      .strokeColor('#b8944a')
      .rect(
        margin + frameInset,
        margin + frameInset,
        pageWidth - (margin + frameInset) * 2,
        pageHeight - (margin + frameInset) * 2,
      )
      .stroke();

    const contentTop = margin + frameInset + 36;
    const contentWidth = pageWidth - (margin + frameInset) * 2 - 48;
    const contentLeft = (pageWidth - contentWidth) / 2;

    doc
      .fillColor('#1f3a5f')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text('Acesse pelo QR Code', contentLeft, contentTop, {
        width: contentWidth,
        align: 'center',
      });

    doc
      .fillColor('#5a6570')
      .font('Helvetica')
      .fontSize(12)
      .text(input.targetLabel, contentLeft, contentTop + 28, {
        width: contentWidth,
        align: 'center',
      });

    const qrSize = 280;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = contentTop + 70;

    // Soft plate behind the QR
    doc
      .lineWidth(1)
      .strokeColor('#d0d5dd')
      .roundedRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 8)
      .stroke();

    doc.image(qrPng, qrX, qrY, { width: qrSize, height: qrSize });

    doc
      .fillColor('#5a6570')
      .font('Helvetica')
      .fontSize(9)
      .text(input.publicUrl, contentLeft, qrY + qrSize + 28, {
        width: contentWidth,
        align: 'center',
      });

    // Footer with condominium / building name
    const footerY = pageHeight - margin - frameInset - 48;
    const footerLeft = margin + frameInset + 24;
    const footerWidth = pageWidth - (margin + frameInset + 24) * 2;

    doc
      .moveTo(footerLeft, footerY)
      .lineTo(footerLeft + footerWidth, footerY)
      .lineWidth(0.8)
      .strokeColor('#b8944a')
      .stroke();

    doc
      .fillColor('#1f3a5f')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(input.condominiumName, footerLeft, footerY + 14, {
        width: footerWidth,
        align: 'center',
        lineBreak: false,
        ellipsis: true,
      });

    doc
      .fillColor('#8a93a0')
      .font('Helvetica')
      .fontSize(9)
      .text('Condomínio / prédio', footerLeft, footerY + 34, {
        width: footerWidth,
        align: 'center',
      });
  }
}
