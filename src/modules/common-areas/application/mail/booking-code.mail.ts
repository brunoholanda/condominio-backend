import type { MailMessage } from '../../../../shared/application/ports/mail-sender';

export interface BookingCodeMailProps {
  to: string;
  name: string;
  condoName: string;
  code: string;
  expiresInMinutes: number;
}

export function buildBookingCodeMail({
  to,
  name,
  condoName,
  code,
  expiresInMinutes,
}: BookingCodeMailProps): MailMessage {
  const firstName = name.split(' ')[0] ?? name;
  const validity = `O código vale por ${expiresInMinutes} minutos e só pode ser usado uma vez.`;

  return {
    to,
    subject: `${code} é o seu código para reservar áreas comuns - ${condoName}`,
    text: [
      `Olá, ${firstName}.`,
      '',
      `Seu código para acessar as reservas de áreas comuns em ${condoName} é: ${code}`,
      '',
      validity,
      '',
      'Se não foi você, ignore este e-mail.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2933; line-height: 1.6;">
        <p>Olá, ${firstName}.</p>
        <p>Use o código abaixo para acessar as reservas de áreas comuns em <strong>${condoName}</strong>:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0; color: #0f172a;">
          ${code}
        </p>
        <p>${validity}</p>
        <p style="color: #52606d; font-size: 13px;">Se não foi você, ignore este e-mail.</p>
      </div>
    `,
  };
}
