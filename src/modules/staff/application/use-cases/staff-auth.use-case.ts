import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { EnvironmentVariables } from '../../../../config/environment';
import {
  AuthenticationError,
  BusinessRuleError,
} from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { PasswordHasher } from '../../../auth/domain/services/password-hasher';
import { GetCondominiumBySlugUseCase } from '../../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { nextPunchType } from '../../domain/enums/staff.enums';
import { CondoEmployeeRepository } from '../../domain/repositories/condo-employee.repository';
import { TimePunchRepository } from '../../domain/repositories/time-punch.repository';
import { StaffLoginLockoutService } from '../../infrastructure/security/staff-login-lockout.service';
import type {
  StaffLoginDto,
  StaffLoginResponseDto,
  StaffMeResponseDto,
} from '../dto/staff-auth.dto';
import { saoPauloDayBounds } from '../utils/sao-paulo-day';

export interface StaffTokenPayload {
  sub: string;
  condominiumId: string;
  fullName: string;
  typ: 'staff';
}

const STAFF_TOKEN_TTL_SECONDS = 12 * 60 * 60;
const STAFF_AUDIENCE = 'condogest-staff';

@Injectable()
export class StaffAccessTokenService {
  private readonly staffSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.staffSecret =
      config.get('JWT_STAFF_SECRET', { infer: true })?.trim() ||
      `${config.get('JWT_SECRET', { infer: true })}:staff`;
  }

  async sign(payload: Omit<StaffTokenPayload, 'typ'>): Promise<{
    token: string;
    expiresInSeconds: number;
  }> {
    const token = await this.jwtService.signAsync(
      { ...payload, typ: 'staff' satisfies StaffTokenPayload['typ'] },
      {
        expiresIn: STAFF_TOKEN_TTL_SECONDS,
        secret: this.staffSecret,
        audience: STAFF_AUDIENCE,
      },
    );

    return { token, expiresInSeconds: STAFF_TOKEN_TTL_SECONDS };
  }

  async verify(token: string): Promise<StaffTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<StaffTokenPayload>(token, {
        secret: this.staffSecret,
        audience: STAFF_AUDIENCE,
      });

      if (payload.typ !== 'staff' || !payload.sub || !payload.condominiumId) {
        throw new AuthenticationError('Sessão de funcionário inválida.');
      }

      return {
        sub: payload.sub,
        condominiumId: payload.condominiumId,
        fullName: payload.fullName,
        typ: 'staff',
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError('Sessão expirada ou inválida. Faça login novamente.');
    }
  }
}

@Injectable()
export class StaffLoginUseCase {
  constructor(
    private readonly getBySlug: GetCondominiumBySlugUseCase,
    private readonly employees: CondoEmployeeRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: StaffAccessTokenService,
    private readonly lockouts: StaffLoginLockoutService,
  ) {}

  async execute(slug: string, input: StaffLoginDto): Promise<StaffLoginResponseDto> {
    const condo = await this.getBySlug.getOrFail(slug);

    if (!condo.hasLocation()) {
      throw new BusinessRuleError(
        'O condomínio ainda não configurou a localização para o ponto eletrônico.',
      );
    }

    const cpf = Cpf.create(input.cpf);
    await this.lockouts.assertNotLocked(condo.id, cpf.value);

    const employee = await this.employees.findByCpf(cpf.value, condo.id);

    if (!employee || !employee.isActive) {
      await this.lockouts.registerFailure(condo.id, cpf.value);
      throw new AuthenticationError('CPF ou PIN inválidos.');
    }

    const ok = await this.passwordHasher.compare(input.pin, employee.pinHash);

    if (!ok) {
      await this.lockouts.registerFailure(condo.id, cpf.value);
      throw new AuthenticationError('CPF ou PIN inválidos.');
    }

    await this.lockouts.registerSuccess(condo.id, cpf.value);

    const signed = await this.tokens.sign({
      sub: employee.id,
      condominiumId: condo.id,
      fullName: employee.fullName,
    });

    return {
      accessToken: signed.token,
      expiresInSeconds: signed.expiresInSeconds,
      employeeId: employee.id,
      fullName: employee.fullName,
      condominiumName: condo.name,
    };
  }
}

@Injectable()
export class StaffMeUseCase {
  constructor(
    private readonly getBySlug: GetCondominiumBySlugUseCase,
    private readonly employees: CondoEmployeeRepository,
    private readonly punches: TimePunchRepository,
  ) {}

  async execute(slug: string, employeeId: string): Promise<StaffMeResponseDto> {
    const condo = await this.getBySlug.getOrFail(slug);
    const employee = await this.employees.findById(employeeId, condo.id);

    if (!employee || !employee.isActive) {
      throw new AuthenticationError('Funcionário não encontrado ou inativo.');
    }

    if (employee.condominiumId !== condo.id) {
      throw new AuthenticationError('Sessão inválida para este condomínio.');
    }

    const { dayStart, dayEnd } = saoPauloDayBounds(new Date());
    const last = await this.punches.findLastAcceptedOfDay(employee.id, dayStart, dayEnd);
    const lastType = last?.type ?? null;

    return {
      employeeId: employee.id,
      fullName: employee.fullName,
      jobTitle: employee.jobTitle,
      condominiumName: condo.name,
      lastPunchType: lastType,
      nextPunchType: nextPunchType(lastType),
      geofenceRadiusMeters: condo.geofenceRadiusMeters ?? 100,
    };
  }
}
