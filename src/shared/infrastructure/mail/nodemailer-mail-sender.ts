import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

import type { EnvironmentVariables } from '../../../config/environment';
import type { MailMessage } from '../../application/ports/mail-sender';
import { MailSender } from '../../application/ports/mail-sender';

@Injectable()
export class NodemailerMailSender extends MailSender {
  private readonly logger = new Logger(NodemailerMailSender.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super();

    this.from = config.get('MAIL_FROM', { infer: true });
    this.transporter = createTransport({
      host: config.get('SMTP_HOST', { infer: true }),
      port: config.get('SMTP_PORT', { infer: true }),
      secure: config.get('SMTP_SECURE', { infer: true }),
      auth: {
        user: config.get('SMTP_USER', { infer: true }),
        pass: config.get('SMTP_PASS', { infer: true }),
      },
    });
  }

  async send(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({ from: this.from, ...message });

    // Nem assunto nem corpo vão para o log: eles carregam o código de acesso.
    this.logger.log(`E-mail enviado para ${message.to}.`);
  }
}
