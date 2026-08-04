import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { CondoAsaasSettings } from '../../domain/entities/condo-asaas-settings';
import { CondoAsaasSettingsRepository } from '../../domain/repositories/condo-asaas-settings.repository';
import { AsaasClient } from '../../infrastructure/asaas/asaas.client';
import type { AsaasSettingsResponseDto } from '../dto/charge-response.dto';
import type { UpsertAsaasSettingsDto } from '../dto/receivables.dto';

@Injectable()
export class UpsertAsaasSettingsUseCase {
  constructor(
    private readonly settings: CondoAsaasSettingsRepository,
    private readonly asaas: AsaasClient,
  ) {}

  async execute(
    condominiumId: string,
    input: UpsertAsaasSettingsDto,
  ): Promise<AsaasSettingsResponseDto> {
    const apiKey = input.apiKey.trim();
    await this.asaas.ping(apiKey);

    const existing = await this.settings.findByCondominiumId(condominiumId);
    const saved = existing
      ? await this.settings.save(
          existing.withCredentials({
            apiKey,
            walletId: input.walletId,
            enabled: input.enabled,
          }),
        )
      : await this.settings.save(
          CondoAsaasSettings.create({
            condominiumId,
            apiKey,
            walletId: input.walletId,
            enabled: input.enabled,
          }),
        );

    return toSettingsResponse(saved);
  }
}

@Injectable()
export class GetAsaasSettingsUseCase {
  constructor(private readonly settings: CondoAsaasSettingsRepository) {}

  async execute(condominiumId: string): Promise<AsaasSettingsResponseDto> {
    const existing = await this.settings.findByCondominiumId(condominiumId);

    if (!existing) {
      return {
        configured: false,
        enabled: false,
        apiKeyHint: null,
        walletId: null,
      };
    }

    return toSettingsResponse(existing);
  }
}

@Injectable()
export class RequireAsaasSettingsUseCase {
  constructor(private readonly settings: CondoAsaasSettingsRepository) {}

  async execute(condominiumId: string): Promise<CondoAsaasSettings> {
    const existing = await this.settings.findByCondominiumId(condominiumId);

    if (!existing || !existing.enabled) {
      throw new BusinessRuleError(
        'Configure a integração Asaas deste condomínio antes de gerar cobranças PIX.',
      );
    }

    return existing;
  }
}

function toSettingsResponse(settings: CondoAsaasSettings): AsaasSettingsResponseDto {
  const snapshot = settings.toSnapshot();
  const key = snapshot.apiKey;

  return {
    configured: true,
    enabled: snapshot.enabled,
    apiKeyHint: key.length > 8 ? `••••${key.slice(-6)}` : '••••',
    walletId: snapshot.walletId,
  };
}
