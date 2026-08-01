import type { MailMessage } from '../../../../shared/application/ports/mail-sender';

export interface LoginCodeMailProps {
  to: string;
  name: string;
  code: string;
  expiresInMinutes: number;
}

const SPAM_HINT =
  'Não encontrou este e-mail? Confira a caixa de spam ou lixo eletrônico e marque a mensagem como ' +
  '"não é spam" para receber os próximos códigos na caixa de entrada.';

const IGNORE_HINT =
  'Se não foi você que tentou entrar, ignore esta mensagem e troque a senha da sua conta: alguém ' +
  'digitou seu e-mail e sua senha no sistema.';

/**
 * O código vai em texto e em HTML porque muitos filtros de spam pontuam melhor
 * mensagens com as duas versões — e o operador pode estar em um cliente simples.
 */
export function buildLoginCodeMail({
  to,
  name,
  code,
  expiresInMinutes,
}: LoginCodeMailProps): MailMessage {
  const firstName = name.split(' ')[0] ?? name;
  const validity = `O código vale por ${expiresInMinutes} minutos e só pode ser usado uma vez.`;

  return {
    to,
    subject: `${code} é o seu código de acesso - App Condomínio`,
    text: [
      `Olá, ${firstName}.`,
      '',
      `Seu código para concluir o login na área restrita do condomínio é: ${code}`,
      '',
      validity,
      '',
      SPAM_HINT,
      '',
      IGNORE_HINT,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2933; line-height: 1.6;">
        <p>Olá, ${firstName}.</p>
        <p>Use o código abaixo para concluir o login na área restrita do condomínio:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0; color: #0f172a;">
          ${code}
        </p>
        <p>${validity}</p>
        <p style="background: #fff7e6; border-left: 4px solid #fa8c16; padding: 12px 16px;">
          ${SPAM_HINT}
        </p>
        <p style="color: #52606d; font-size: 13px;">${IGNORE_HINT}</p>
      </div>
    `,
  };
}
