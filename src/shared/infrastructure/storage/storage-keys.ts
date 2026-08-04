/**
 * Chaves (paths) no Cloudflare R2.
 *
 * Layout multi-tenant (contrato de pastas; helpers extras ficam prontos para
 * documentos/assinaturas quando esses fluxos passarem a usar FileStorage):
 *   condominiums/{condoId}/payables/{payableId}/{tipo}/{uuid}{ext}
 *   condominiums/{condoId}/documents/{documentId}/{uuid}{ext}
 *   condominiums/{condoId}/signatures/residents/{residentId}.png
 *   condominiums/{condoId}/signatures/deliveries/{packageId}.png
 */
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { BusinessRuleError } from '../../domain/domain-error';

const SAFE_KEY = /^[a-zA-Z0-9._\-/]+$/;
const MAX_KEY_LENGTH = 500;

function assertSafeSegment(value: string, label: string): string {
  const trimmed = value.trim();

  if (!trimmed || trimmed.includes('..') || trimmed.includes('\\') || !SAFE_KEY.test(trimmed)) {
    throw new BusinessRuleError(`${label} inválido para armazenamento.`);
  }

  return trimmed;
}

function assertSafeKey(key: string): string {
  const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '');

  if (
    !normalized ||
    normalized.length > MAX_KEY_LENGTH ||
    normalized.includes('..') ||
    !SAFE_KEY.test(normalized)
  ) {
    throw new BusinessRuleError('Chave de armazenamento inválida.');
  }

  return normalized;
}

/** Extensão segura a partir do nome original (só letras/números, máx. 10). */
function safeExtension(originalName: string): string {
  const ext = extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');

  return ext.length > 0 && ext.length <= 10 ? ext : '';
}

export const StorageKeys = {
  assertSafeKey,

  payableAttachment(input: {
    condominiumId: string;
    payableId: string;
    type: string;
    originalName: string;
  }): string {
    const condo = assertSafeSegment(input.condominiumId, 'Condomínio');
    const payable = assertSafeSegment(input.payableId, 'Conta');
    const type = assertSafeSegment(input.type.toLowerCase(), 'Tipo de anexo');
    const ext = safeExtension(input.originalName);

    return assertSafeKey(
      `condominiums/${condo}/payables/${payable}/${type}/${randomUUID()}${ext}`,
    );
  },

  documentFile(input: {
    condominiumId: string;
    documentId: string;
    originalName: string;
  }): string {
    const condo = assertSafeSegment(input.condominiumId, 'Condomínio');
    const document = assertSafeSegment(input.documentId, 'Documento');
    const ext = safeExtension(input.originalName);

    return assertSafeKey(`condominiums/${condo}/documents/${document}/${randomUUID()}${ext}`);
  },

  residentSignature(condominiumId: string, residentId: string): string {
    const condo = assertSafeSegment(condominiumId, 'Condomínio');
    const resident = assertSafeSegment(residentId, 'Morador');

    return assertSafeKey(`condominiums/${condo}/signatures/residents/${resident}.png`);
  },

  deliverySignature(condominiumId: string, packageId: string): string {
    const condo = assertSafeSegment(condominiumId, 'Condomínio');
    const parcel = assertSafeSegment(packageId, 'Encomenda');

    return assertSafeKey(`condominiums/${condo}/signatures/deliveries/${parcel}.png`);
  },

  timePunchSelfie(input: {
    condominiumId: string;
    punchId: string;
    originalName: string;
  }): string {
    const condo = assertSafeSegment(input.condominiumId, 'Condomínio');
    const punch = assertSafeSegment(input.punchId, 'Ponto');
    const ext = safeExtension(input.originalName) || '.jpg';

    return assertSafeKey(`condominiums/${condo}/time-punches/${punch}/selfie${ext}`);
  },

  absenceAttachment(input: {
    condominiumId: string;
    absenceId: string;
    originalName: string;
  }): string {
    const condo = assertSafeSegment(input.condominiumId, 'Condomínio');
    const absence = assertSafeSegment(input.absenceId, 'Falta');
    const ext = safeExtension(input.originalName);

    return assertSafeKey(
      `condominiums/${condo}/absences/${absence}/attachment/${randomUUID()}${ext}`,
    );
  },
};
