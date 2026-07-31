import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

const asBoolean = ({ value }: { value: unknown }): boolean =>
  value === true || String(value).toLowerCase() === 'true';

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
  SEED_ADMIN_NAME: string = 'Administrador';

  @IsEmail()
  SEED_ADMIN_EMAIL: string;

  @IsString()
  SEED_ADMIN_PASSWORD: string;
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
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');

    throw new Error(`Variáveis de ambiente inválidas: ${details}`);
  }

  return parsed;
}
