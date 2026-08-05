/**
 * Mascara e-mail para o desafio de reserva: só o dono da caixa reconhece o destino.
 * Ex.: joao.silva@gmail.com → jo***@gm***.com
 */
export function maskEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const at = normalized.indexOf('@');

  if (at <= 0 || at === normalized.length - 1) {
    return '***@***.***';
  }

  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const [domainName, ...tldParts] = domain.split('.');
  const tld = tldParts.join('.') || '***';

  const maskLocal =
    local.length <= 2 ? `${local[0] ?? '*'}***` : `${local.slice(0, 2)}***`;
  const maskDomain =
    !domainName || domainName.length <= 2
      ? `${domainName?.[0] ?? '*'}***`
      : `${domainName.slice(0, 2)}***`;

  return `${maskLocal}@${maskDomain}.${tld}`;
}
