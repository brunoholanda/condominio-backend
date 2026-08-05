import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
  ValidateNested,
  validateSync,
} from 'class-validator';
import type { ValidationError } from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

const asBoolean = ({ value }: { value: unknown }): boolean =>
  value === true || String(value).toLowerCase() === 'true';

/** One login of the restricted area, as described in `SEED_ACCOUNTS`. */
export class SeedAccount {
  @IsString()
  @Length(2, 150)
  name: string;

  @IsEmail()
  email: string;

  /** Plain text, read only by the seed, which stores just the hash. */
  @IsString()
  password: string;
}

/**
 * Contas bootstrap esperadas no seed (documentação / produção).
 * Os papéis reais são aplicados por e-mail em `database/seeds/seed-users.ts`,
 * não pela ordem deste array.
 *
 * - holanda_rodrigues@hotmail.com → SYSTEM_OWNER (dono/gestor da plataforma)
 * - hellennamello@hotmail.com → plano Prime ACTIVE, sem SYSTEM_OWNER
 */

/** Anything that is not a well-formed list is left untouched, so `@IsArray` reports it. */
const asSeedAccounts = ({ value }: { value: unknown }): unknown => {
  const raw: unknown = typeof value === 'string' ? tryParseJson(value) : value;

  return Array.isArray(raw) ? plainToInstance(SeedAccount, raw) : raw;
};

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3333;

  @IsString()
  API_PREFIX: string = 'api';

  @IsString()
  CORS_ORIGINS: string = 'http://localhost:5173';

  /**
   * URL base do frontend, usada nos QR Codes de compartilhamento
   * (ex.: https://app.condogest.com.br). Se omitida, usa a primeira origem de CORS.
   */
  @IsOptional()
  @IsString()
  PUBLIC_APP_URL?: string;

  @IsString()
  DATABASE_HOST: string;

  @Type(() => Number)
  @IsInt()
  DATABASE_PORT: number = 5432;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsOptional()
  @Transform(asBoolean)
  @IsBoolean()
  DATABASE_SSL: boolean = false;

  @IsOptional()
  @Transform(asBoolean)
  @IsBoolean()
  DATABASE_LOGGING: boolean = false;

  /**
   * Quando `false`, o app usa cache em memória do processo (útil em testes).
   * Em produção / Docker, mantenha `true` e suba o serviço Redis.
   */
  @IsOptional()
  @Transform(asBoolean)
  @IsBoolean()
  REDIS_ENABLED: boolean = true;

  @IsOptional()
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number = 6379;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD: string = '';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(15)
  REDIS_DB: number = 0;

  /** Prefixo de todas as chaves (ex.: `condogest:`). */
  @IsOptional()
  @IsString()
  REDIS_KEY_PREFIX: string = 'condogest:';

  /** Endpoint S3-compatível do Cloudflare R2 (ex.: https://<accountid>.r2.cloudflarestorage.com). */
  @IsString()
  @MinLength(1)
  R2_ENDPOINT: string;

  @IsString()
  @MinLength(1)
  R2_BUCKET: string;

  @IsString()
  @MinLength(1)
  R2_ACCESS_KEY_ID: string;

  @IsString()
  @MinLength(1)
  R2_SECRET_ACCESS_KEY: string;

  /** Região do cliente S3; no R2 use `auto`. */
  @IsString()
  @MinLength(1)
  R2_REGION: string = 'auto';

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET deve ter no mínimo 32 caracteres.' })
  JWT_SECRET: string;

  /**
   * Segredo dedicado aos JWTs de funcionários (ponto). Se omitido, deriva de JWT_SECRET.
   * Em produção, use um valor distinto.
   */
  @IsOptional()
  @IsString()
  @MinLength(32, { message: 'JWT_STAFF_SECRET deve ter no mínimo 32 caracteres.' })
  JWT_STAFF_SECRET?: string;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  JWT_EXPIRES_IN_SECONDS: number = 28_800;

  /**
   * Material para AES-256-GCM (API keys Asaas etc.). Se omitido, deriva de JWT_SECRET.
   */
  @IsOptional()
  @IsString()
  @MinLength(32)
  ENCRYPTION_KEY?: string;

  /** Dias de retenção de selfies de ponto no R2 (purge automático). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(7)
  @Max(3650)
  PUNCH_SELFIE_RETENTION_DAYS: number = 90;

  @IsString()
  SMTP_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  SMTP_PORT: number = 587;

  /** `true` apenas para portas com TLS implícito, como a 465. */
  @IsOptional()
  @Transform(asBoolean)
  @IsBoolean()
  SMTP_SECURE: boolean = false;

  @IsString()
  SMTP_USER: string;

  @IsString()
  SMTP_PASS: string;

  /** Remetente exibido no e-mail, no formato `Nome <endereço>`. */
  @IsString()
  MAIL_FROM: string;

  /** Validade do código enviado na segunda etapa do login. */
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(3600)
  LOGIN_CODE_TTL_SECONDS: number = 600;

  /** Destinatário dos avisos de novos chamados de suporte. */
  @IsOptional()
  @IsString()
  @IsEmail()
  SUPPORT_NOTIFY_EMAIL: string = 'holanda_rodrigues@hotmail.com';

  /** Duração do período de teste gratuito da assinatura SaaS. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  BILLING_TRIAL_DAYS: number = 30;

  @IsOptional()
  @IsString()
  BILLING_CURRENCY: string = 'BRL';

  /** Stripe: chave secreta da API (sk_...). */
  @IsOptional()
  @IsString()
  STRIPE_SECRET_KEY?: string;

  /** Stripe: secret do endpoint de webhook. */
  @IsOptional()
  @IsString()
  STRIPE_WEBHOOK_SECRET?: string;

  /** Price ID do plano Lite. */
  @IsOptional()
  @IsString()
  STRIPE_PRICE_ID?: string;

  /** Price ID do plano Prime. */
  @IsOptional()
  @IsString()
  STRIPE_PRIME_PRICE_ID?: string;

  /** Price ID do plano Gestor. */
  @IsOptional()
  @IsString()
  STRIPE_GESTOR_PRICE_ID?: string;

  /**
   * URL base da API Asaas. Se omitida, usa sandbox ou produção conforme o
   * prefixo da chave do condomínio (`$aact_hmlg` → sandbox).
   */
  @IsOptional()
  @IsString()
  ASAAS_API_URL?: string;

  /**
   * Token configurado no webhook Asaas (header `asaas-access-token`).
   * Obrigatório para confirmar pagamentos PIX automaticamente.
   */
  @IsOptional()
  @IsString()
  ASAAS_WEBHOOK_TOKEN?: string;

  /**
   * Accounts with access to the residents area, created by `npm run seed`.
   * JSON keeps any password character safe and lets the list grow without new
   * variables. The API boots without it; only the seed needs it filled.
   */
  @IsOptional()
  @Transform(asSeedAccounts)
  @IsArray({ message: 'SEED_ACCOUNTS deve ser um JSON com a lista de contas.' })
  @ValidateNested({ each: true })
  SEED_ACCOUNTS: SeedAccount[] = [];
}

/** Nested lists report their problems in `children`, so the message walks the tree. */
function describe(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...describe(error.children ?? []),
  ]);
}

/**
 * Fails fast at boot when the environment is misconfigured, so the app never
 * starts in a half-working state.
 */
export function validateEnvironment(raw: Record<string, unknown>): EnvironmentVariables {
  const parsed = plainToInstance(EnvironmentVariables, raw, {
    enableImplicitConversion: false,
    exposeDefaultValues: true,
  });

  const errors = validateSync(parsed, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Variáveis de ambiente inválidas: ${describe(errors).join('; ')}`);
  }

  return parsed;
}
