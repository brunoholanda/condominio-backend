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

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET deve ter no mínimo 32 caracteres.' })
  JWT_SECRET: string;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  JWT_EXPIRES_IN_SECONDS: number = 28_800;

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
