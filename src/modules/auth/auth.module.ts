import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { EnvironmentVariables } from '../../config/environment';
import { MailModule } from '../../shared/infrastructure/mail/mail.module';
import { AccessTokenService } from './application/ports/access-token-service';
import { LoginCodeIssuer } from './application/services/login-code-issuer';
import { ConfirmLoginUseCase } from './application/use-cases/confirm-login.use-case';
import { GetAuthenticatedUserUseCase } from './application/use-cases/get-authenticated-user.use-case';
import { IdentifyOperatorUseCase } from './application/use-cases/identify-operator.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { ResendLoginCodeUseCase } from './application/use-cases/resend-login-code.use-case';
import { StartLoginUseCase } from './application/use-cases/start-login.use-case';
import { LoginChallengeRepository } from './domain/repositories/login-challenge.repository';
import { UserRepository } from './domain/repositories/user.repository';
import { PasswordHasher } from './domain/services/password-hasher';
import { JwtAuthGuard } from './infrastructure/http/jwt-auth.guard';
import { LoginChallengeOrmEntity } from './infrastructure/persistence/typeorm/entities/login-challenge.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { TypeormLoginChallengeRepository } from './infrastructure/persistence/typeorm/typeorm-login-challenge.repository';
import { TypeormUserRepository } from './infrastructure/persistence/typeorm/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtAccessTokenService } from './infrastructure/security/jwt-access-token.service';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, LoginChallengeOrmEntity]),
    MailModule,
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
    { provide: LoginChallengeRepository, useClass: TypeormLoginChallengeRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: AccessTokenService, useClass: JwtAccessTokenService },
    // Everything is protected unless a route opts out with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    LoginCodeIssuer,
    StartLoginUseCase,
    ConfirmLoginUseCase,
    ResendLoginCodeUseCase,
    GetAuthenticatedUserUseCase,
    IdentifyOperatorUseCase,
    RegisterUserUseCase,
  ],
  exports: [PasswordHasher, UserRepository, AccessTokenService, JwtModule],
})
export class AuthModule {}
