import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuditAccess } from '../../../shared/infrastructure/http/audit-access.decorator';
import { AuthenticatedUserDto, LoginResponseDto } from '../application/dto/auth-response.dto';
import { ConfirmLoginDto } from '../application/dto/confirm-login.dto';
import { IdentifyOperatorDto } from '../application/dto/identify-operator.dto';
import { LoginChallengeDto, ResendLoginCodeDto } from '../application/dto/login-challenge.dto';
import { LoginDto } from '../application/dto/login.dto';
import type { AccessTokenPayload } from '../application/ports/access-token-service';
import { ConfirmLoginUseCase } from '../application/use-cases/confirm-login.use-case';
import { GetAuthenticatedUserUseCase } from '../application/use-cases/get-authenticated-user.use-case';
import { IdentifyOperatorUseCase } from '../application/use-cases/identify-operator.use-case';
import { ResendLoginCodeUseCase } from '../application/use-cases/resend-login-code.use-case';
import { StartLoginUseCase } from '../application/use-cases/start-login.use-case';
import { CurrentUser } from '../infrastructure/http/current-user.decorator';
import { Public } from '../infrastructure/http/public.decorator';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly startLogin: StartLoginUseCase,
    private readonly confirmLogin: ConfirmLoginUseCase,
    private readonly resendLoginCode: ResendLoginCodeUseCase,
    private readonly getAuthenticatedUser: GetAuthenticatedUserUseCase,
    private readonly identifyOperator: IdentifyOperatorUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confere as credenciais e envia o código de acesso por e-mail' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginChallengeDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'E-mail ou senha inválidos' })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'Falha ao enviar o e-mail' })
  signIn(@Body() body: LoginDto): Promise<LoginChallengeDto> {
    return this.startLogin.execute(body);
  }

  @Public()
  @Post('login/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirma o código recebido e devolve o token de acesso' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Código incorreto' })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: 'Tentativa encerrada: código expirado, já usado ou tentativas esgotadas',
  })
  confirm(@Body() body: ConfirmLoginDto): Promise<LoginResponseDto> {
    return this.confirmLogin.execute(body);
  }

  @Public()
  @Post('login/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenvia o código de acesso da tentativa em andamento' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginChallengeDto })
  @ApiResponse({ status: HttpStatus.GONE, description: 'Tentativa de login encerrada' })
  resend(@Body() body: ResendLoginCodeDto): Promise<LoginChallengeDto> {
    return this.resendLoginCode.execute(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve o usuário da sessão atual' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticatedUserDto })
  me(@CurrentUser() user: AccessTokenPayload): Promise<AuthenticatedUserDto> {
    return this.getAuthenticatedUser.execute(user.sub);
  }

  @Put('me/cpf')
  @ApiBearerAuth()
  @AuditAccess('informou o CPF de responsabilidade')
  @ApiOperation({ summary: 'Registra o CPF de quem opera os dados dos moradores' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticatedUserDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'CPF já vinculado a outra conta' })
  identify(
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: IdentifyOperatorDto,
  ): Promise<AuthenticatedUserDto> {
    return this.identifyOperator.execute(user.sub, body);
  }
}
