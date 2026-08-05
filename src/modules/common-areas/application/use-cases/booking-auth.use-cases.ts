import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import {
  AuthenticationError,
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { MailSender } from '../../../../shared/application/ports/mail-sender';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { LoginCode } from '../../../auth/domain/value-objects/login-code';
import { PasswordHasher } from '../../../auth/domain/services/password-hasher';
import { GetCondominiumBySlugUseCase } from '../../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { ResidentRepository } from '../../../residents/domain/repositories/resident.repository';
import { BookingAuthChallenge } from '../../domain/entities/booking-auth-challenge';
import { BookingAuthChallengeRepository } from '../../domain/repositories/booking-auth-challenge.repository';
import { buildBookingCodeMail } from '../mail/booking-code.mail';
import { maskEmail } from '../utils/mask-email';
import { ResidentBookingAccessTokenService } from '../services/resident-booking-access-token.service';

export interface BookingAuthStartResult {
  challengeId: string;
  emailHint: string;
  expiresInSeconds: number;
}

export interface BookingAuthConfirmResult {
  accessToken: string;
  expiresInSeconds: number;
  fullName: string;
  unitNumber: string;
  emailHint: string;
}

export interface BookingAuthMeResult {
  residentId: string;
  fullName: string;
  unitNumber: string;
  emailHint: string;
  condominiumName: string;
}

@Injectable()
export class BookingAuthUseCases {
  constructor(
    private readonly getBySlug: GetCondominiumBySlugUseCase,
    private readonly residents: ResidentRepository,
    private readonly challenges: BookingAuthChallengeRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly mail: MailSender,
    private readonly tokens: ResidentBookingAccessTokenService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  private get ttlSeconds(): number {
    return this.config.get('LOGIN_CODE_TTL_SECONDS', { infer: true }) ?? 600;
  }

  async start(slug: string, rawCpf: string): Promise<BookingAuthStartResult> {
    const condo = await this.getBySlug.getOrFail(slug);
    const cpf = Cpf.create(rawCpf);
    const resident = await this.residents.findByCpf(cpf.value, condo.id);

    if (!resident) {
      throw new BusinessRuleError(
        'Não encontramos um cadastro de morador com este CPF neste condomínio.',
      );
    }

    await this.challenges.discardActiveForResident(resident.id, condo.id);

    const code = LoginCode.random();
    const challenge = BookingAuthChallenge.issue({
      condominiumId: condo.id,
      residentId: resident.id,
      codeHash: await this.passwordHasher.hash(code.value),
      ttlSeconds: this.ttlSeconds,
    });
    await this.challenges.save(challenge);

    const snapshot = resident.toSnapshot();
    await this.mail.send(
      buildBookingCodeMail({
        to: snapshot.email,
        name: snapshot.fullName,
        condoName: condo.name,
        code: code.value,
        expiresInMinutes: Math.ceil(this.ttlSeconds / 60),
      }),
    );

    return {
      challengeId: challenge.id,
      emailHint: maskEmail(snapshot.email),
      expiresInSeconds: this.ttlSeconds,
    };
  }

  async confirm(slug: string, challengeId: string, rawCode: string): Promise<BookingAuthConfirmResult> {
    const condo = await this.getBySlug.getOrFail(slug);
    const challenge = await this.challenges.findById(challengeId);

    if (!challenge || challenge.condominiumId !== condo.id) {
      throw new ResourceNotFoundError('Desafio de verificação não encontrado.');
    }

    challenge.ensureUsable();
    const code = LoginCode.create(rawCode);
    const ok = await this.passwordHasher.compare(code.value, challenge.codeHash);

    if (!ok) {
      await this.challenges.save(challenge.registerFailure());
      throw new AuthenticationError('Código inválido. Confira o e-mail e tente novamente.');
    }

    await this.challenges.save(challenge.consume());

    const resident = await this.residents.findById(challenge.residentId, condo.id);

    if (!resident) {
      throw new BusinessRuleError('Cadastro de morador não encontrado.');
    }

    const snapshot = resident.toSnapshot();
    const signed = await this.tokens.sign({
      sub: resident.id,
      condominiumId: condo.id,
      fullName: snapshot.fullName,
      unitNumber: snapshot.unit,
    });

    return {
      accessToken: signed.accessToken,
      expiresInSeconds: signed.expiresInSeconds,
      fullName: snapshot.fullName,
      unitNumber: snapshot.unit,
      emailHint: maskEmail(snapshot.email),
    };
  }

  async resend(slug: string, challengeId: string): Promise<BookingAuthStartResult> {
    const condo = await this.getBySlug.getOrFail(slug);
    const challenge = await this.challenges.findById(challengeId);

    if (!challenge || challenge.condominiumId !== condo.id) {
      throw new ResourceNotFoundError('Desafio de verificação não encontrado.');
    }

    if (challenge.toSnapshot().consumedAt) {
      throw new BusinessRuleError('Este código já foi utilizado. Informe o CPF novamente.');
    }

    const resident = await this.residents.findById(challenge.residentId, condo.id);

    if (!resident) {
      throw new BusinessRuleError('Cadastro de morador não encontrado.');
    }

    const code = LoginCode.random();
    const renewed = challenge.renew(
      await this.passwordHasher.hash(code.value),
      this.ttlSeconds,
    );
    await this.challenges.save(renewed);

    const snapshot = resident.toSnapshot();
    await this.mail.send(
      buildBookingCodeMail({
        to: snapshot.email,
        name: snapshot.fullName,
        condoName: condo.name,
        code: code.value,
        expiresInMinutes: Math.ceil(this.ttlSeconds / 60),
      }),
    );

    return {
      challengeId: renewed.id,
      emailHint: maskEmail(snapshot.email),
      expiresInSeconds: this.ttlSeconds,
    };
  }

  async me(slug: string, residentId: string): Promise<BookingAuthMeResult> {
    const condo = await this.getBySlug.getOrFail(slug);
    const resident = await this.residents.findById(residentId, condo.id);

    if (!resident) {
      throw new AuthenticationError('Sessão inválida para este condomínio.');
    }

    const snapshot = resident.toSnapshot();

    return {
      residentId: resident.id,
      fullName: snapshot.fullName,
      unitNumber: snapshot.unit,
      emailHint: maskEmail(snapshot.email),
      condominiumName: condo.name,
    };
  }
}
