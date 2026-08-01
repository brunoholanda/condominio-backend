import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import type { EnvironmentVariables } from './config/environment';
import { NodeEnvironment } from './config/environment';
import { DomainExceptionFilter } from './shared/infrastructure/http/domain-exception.filter';

function parseOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const apiPrefix = config.get('API_PREFIX', { infer: true });
  const port = config.get('PORT', { infer: true });

  // The default 100 kB limit would reject a form carrying the signature image.
  app.useBodyParser('json', { limit: '1mb' });
  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: parseOrigins(config.get('CORS_ORIGINS', { infer: true })),
    // The browser only sees the report file name when the header is exposed.
    exposedHeaders: ['Content-Disposition'],
  });
  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // A documentação descreve rotas com dados pessoais e ainda oferece o "try it
  // out": fora do desenvolvimento ela não sobe.
  if (config.get('NODE_ENV', { infer: true }) !== NodeEnvironment.Production) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Condomínio Porto Imperial - Cadastro de Moradores')
      .setDescription('API para o formulário digital de cadastro de moradores.')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    SwaggerModule.setup(`${apiPrefix}/docs`, app, () =>
      SwaggerModule.createDocument(app, swaggerConfig),
    );
  }

  await app.listen(port);

  new Logger('Bootstrap').log(`API disponível em http://localhost:${port}/${apiPrefix}`);
}

void bootstrap();
