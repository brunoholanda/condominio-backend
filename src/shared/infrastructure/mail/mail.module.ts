import { Module } from '@nestjs/common';

import { MailSender } from '../../application/ports/mail-sender';
import { NodemailerMailSender } from './nodemailer-mail-sender';

@Module({
  providers: [{ provide: MailSender, useClass: NodemailerMailSender }],
  exports: [MailSender],
})
export class MailModule {}
