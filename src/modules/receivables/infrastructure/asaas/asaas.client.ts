import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import { BusinessRuleError } from '../../../../shared/domain/domain-error';

export interface AsaasCustomerInput {
  name: string;
  cpfCnpj?: string | null;
  externalReference: string;
}

export interface AsaasPaymentInput {
  customerId: string;
  valueReais: number;
  dueDate: string;
  description: string;
  externalReference: string;
}

export interface AsaasPaymentResult {
  id: string;
  invoiceUrl: string | null;
  status: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string | null;
}

interface AsaasErrorBody {
  errors?: Array<{ description?: string; code?: string }>;
}

/** Cliente HTTP da API Asaas (sandbox ou produção conforme a chave). */
@Injectable()
export class AsaasClient {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  baseUrlForApiKey(apiKey: string): string {
    const configured = this.config.get('ASAAS_API_URL', { infer: true })?.trim();

    if (configured) {
      return configured.replace(/\/+$/, '');
    }

    const isSandbox = apiKey.includes('_hmlg_') || apiKey.startsWith('$aact_hmlg');
    return isSandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';
  }

  async createCustomer(apiKey: string, input: AsaasCustomerInput): Promise<{ id: string }> {
    const body: Record<string, string> = {
      name: input.name,
      externalReference: input.externalReference,
    };

    if (input.cpfCnpj) {
      body.cpfCnpj = input.cpfCnpj;
    }

    return this.request<{ id: string }>(apiKey, '/customers', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async createPixPayment(apiKey: string, input: AsaasPaymentInput): Promise<AsaasPaymentResult> {
    const payment = await this.request<{
      id: string;
      invoiceUrl?: string;
      status?: string;
    }>(apiKey, '/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: input.customerId,
        billingType: 'PIX',
        value: input.valueReais,
        dueDate: input.dueDate,
        description: input.description,
        externalReference: input.externalReference,
      }),
    });

    return {
      id: payment.id,
      invoiceUrl: payment.invoiceUrl ?? null,
      status: payment.status ?? 'PENDING',
    };
  }

  async getPixQrCode(apiKey: string, paymentId: string): Promise<AsaasPixQrCode> {
    const qr = await this.request<{
      encodedImage: string;
      payload: string;
      expirationDate?: string;
    }>(apiKey, `/payments/${paymentId}/pixQrCode`, { method: 'GET' });

    return {
      encodedImage: qr.encodedImage,
      payload: qr.payload,
      expirationDate: qr.expirationDate ?? null,
    };
  }

  async deletePayment(apiKey: string, paymentId: string): Promise<void> {
    await this.request<unknown>(apiKey, `/payments/${paymentId}`, { method: 'DELETE' });
  }

  async ping(apiKey: string): Promise<void> {
    await this.request<unknown>(apiKey, '/finance/balance', { method: 'GET' });
  }

  private async request<T>(
    apiKey: string,
    path: string,
    init: RequestInit,
  ): Promise<T> {
    const baseUrl = this.baseUrlForApiKey(apiKey);
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    let payload: unknown = null;

    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = { raw: text };
      }
    }

    if (!response.ok) {
      const errors = (payload as AsaasErrorBody | null)?.errors;
      const message =
        errors?.map((item) => item.description).filter(Boolean).join('; ') ||
        `Asaas retornou HTTP ${response.status}.`;

      throw new BusinessRuleError(message);
    }

    return payload as T;
  }
}
