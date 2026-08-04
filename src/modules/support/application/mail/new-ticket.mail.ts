import type { MailMessage } from '../../../../shared/application/ports/mail-sender';
import type { TicketCategory } from '../../domain/enums/ticket-category';

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  PROBLEM: 'Problema',
  IMPROVEMENT: 'Melhoria',
};

export interface NewTicketMailProps {
  to: string;
  ticketId: string;
  category: TicketCategory;
  subject: string;
  body: string;
  authorName: string;
  authorEmail: string;
}

export function buildNewTicketMail({
  to,
  ticketId,
  category,
  subject,
  body,
  authorName,
  authorEmail,
}: NewTicketMailProps): MailMessage {
  const categoryLabel = CATEGORY_LABELS[category];
  const preview = [
    `Novo chamado (#${ticketId.slice(0, 8)})`,
    `Categoria: ${categoryLabel}`,
    `Assunto: ${subject}`,
    `Autor: ${authorName} <${authorEmail}>`,
    '',
    body,
  ].join('\n');

  return {
    to,
    subject: `[CondoGest] Novo chamado: ${subject}`,
    text: preview,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2933; line-height: 1.6;">
        <p><strong>Novo chamado aberto na plataforma CondoGest</strong></p>
        <p>
          <strong>Categoria:</strong> ${categoryLabel}<br/>
          <strong>Assunto:</strong> ${escapeHtml(subject)}<br/>
          <strong>Autor:</strong> ${escapeHtml(authorName)} &lt;${escapeHtml(authorEmail)}&gt;<br/>
          <strong>ID:</strong> ${ticketId}
        </p>
        <p style="white-space: pre-wrap; background: #f8fafc; padding: 12px 16px; border-radius: 8px;">
${escapeHtml(body)}
        </p>
      </div>
    `,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
