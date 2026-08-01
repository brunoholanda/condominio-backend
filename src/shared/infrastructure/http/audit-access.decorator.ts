import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACCESS_KEY = 'audit:access';

/**
 * Marks an endpoint that touches personal data, describing in Portuguese what
 * the operator did — the text goes straight to the access trail. Only the
 * decorated routes are recorded, so the log stays readable and meaningful.
 */
export const AuditAccess = (action: string) => SetMetadata(AUDIT_ACCESS_KEY, action);
