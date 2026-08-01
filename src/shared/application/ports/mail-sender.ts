export interface MailMessage {
  to: string;
  subject: string;
  /** Versão em texto puro, para clientes que não renderizam HTML. */
  text: string;
  html: string;
}

/**
 * Porta de saída para o envio de e-mails. A aplicação decide o que dizer; qual
 * servidor entrega a mensagem é problema da infraestrutura.
 */
export abstract class MailSender {
  abstract send(message: MailMessage): Promise<void>;
}
