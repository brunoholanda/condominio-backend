import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SecretBox } from '../../../../../shared/infrastructure/crypto/secret-box';
import type { CondoAsaasSettings } from '../../../domain/entities/condo-asaas-settings';
import { CondoAsaasSettingsRepository } from '../../../domain/repositories/condo-asaas-settings.repository';
import { CondoAsaasSettingsMapper } from './condo-asaas-settings.mapper';
import { CondoAsaasSettingsOrmEntity } from './entities/condo-asaas-settings.orm-entity';

@Injectable()
export class TypeormCondoAsaasSettingsRepository extends CondoAsaasSettingsRepository {
  constructor(
    @InjectRepository(CondoAsaasSettingsOrmEntity)
    private readonly repository: Repository<CondoAsaasSettingsOrmEntity>,
    private readonly secrets: SecretBox,
  ) {
    super();
  }

  async save(settings: CondoAsaasSettings): Promise<CondoAsaasSettings> {
    const row = CondoAsaasSettingsMapper.toPersistence(settings);
    row.apiKey = this.secrets.encrypt(String(row.apiKey ?? ''));
    await this.repository.save(row);

    const saved = await this.findByCondominiumId(settings.condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir as configurações Asaas de ${settings.condominiumId}.`);
    }

    return saved;
  }

  async findByCondominiumId(condominiumId: string): Promise<CondoAsaasSettings | null> {
    const row = await this.repository.findOne({ where: { condominiumId } });

    if (!row) {
      return null;
    }

    const plainKey = this.secrets.decrypt(row.apiKey);

    // Re-encrypt legacy plaintext keys on read.
    if (!this.secrets.isEncrypted(row.apiKey)) {
      row.apiKey = this.secrets.encrypt(plainKey);
      await this.repository.save(row);
    }

    return CondoAsaasSettingsMapper.toDomain({ ...row, apiKey: plainKey });
  }
}
