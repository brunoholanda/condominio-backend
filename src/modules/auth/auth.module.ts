import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { EnvironmentVariables } from '../../config/environment';
import { AccessTokenService } from './application/ports/access-token-service';
import { GetAuthenticatedUserUseCase } from './application/use-cases/get-authenticated-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { UserRepository } from './domain/repositories/user.repository';
import { PasswordHasher } from './domain/services/password-hasher';
import { JwtAuthGuard } from './infrastructure/http/jwt-auth.guard';
import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { TypeormUserRepository } from './infrastructure/persistence/typeorm/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtAccessTokenService } from './infrastructure/security/jwt-access-token.service';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: UserRepository, useClass: TypeormUserRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: AccessTokenService, useClass: JwtAccessTokenService },
    // Everything is protected unless a route opts out with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    LoginUseCase,
    GetAuthenticatedUserUseCase,
  ],
  exports: [PasswordHasher, UserRepository],
})
export class AuthModule {}
