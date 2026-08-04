import { randomUUID } from 'node:crypto';

import { optionalText, requireText } from '../../../../shared/domain/guards';

export interface CondoAsaasSettingsProps {
  condominiumId: string;
  apiKey: string;
  walletId?: string | null;
  enabled?: boolean;
}

export interface CondoAsaasSettingsSnapshot extends CondoAsaasSettingsProps {
  id: string;
  walletId: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CondoAsaasSettingsState {
  id: string;
  condominiumId: string;
  apiKey: string;
  walletId: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Credenciais Asaas do condomínio para emissão de cobranças PIX. */
export class CondoAsaasSettings {
  private constructor(private readonly state: CondoAsaasSettingsState) {}

  static create(props: CondoAsaasSettingsProps): CondoAsaasSettings {
    const now = new Date();

    return new CondoAsaasSettings({
      ...CondoAsaasSettings.parse(props),
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: CondoAsaasSettingsSnapshot): CondoAsaasSettings {
    return new CondoAsaasSettings({
      ...CondoAsaasSettings.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  withCredentials(props: Omit<CondoAsaasSettingsProps, 'condominiumId'>): CondoAsaasSettings {
    return new CondoAsaasSettings({
      ...this.state,
      ...CondoAsaasSettings.parse({
        condominiumId: this.state.condominiumId,
        ...props,
      }),
      updatedAt: new Date(),
    });
  }

  private static parse(
    props: CondoAsaasSettingsProps,
  ): Omit<CondoAsaasSettingsState, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      apiKey: requireText('chave API Asaas', props.apiKey, { min: 10, max: 500 }),
      walletId: optionalText('carteira Asaas', props.walletId, { min: 1, max: 64 }),
      enabled: props.enabled !== false,
    };
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get apiKey(): string {
    return this.state.apiKey;
  }

  get enabled(): boolean {
    return this.state.enabled;
  }

  toSnapshot(): CondoAsaasSettingsSnapshot {
    return { ...this.state };
  }
}
