import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedUserDto, LoginResponseDto } from '../application/dto/auth-response.dto';
import { LoginDto } from '../application/dto/login.dto';
import type { AccessTokenPayload } from '../application/ports/access-token-service';
import { GetAuthenticatedUserUseCase } from '../application/use-cases/get-authenticated-user.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { CurrentUser } from '../infrastructure/http/current-user.decorator';
import { Public } from '../infrastructure/http/public.decorator';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly getAuthenticatedUser: GetAuthenticatedUserUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica um usuário e devolve o token de acesso' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'E-mail ou senha inválidos' })
  signIn(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.login.execute(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve o usuário da sessão atual' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthenticatedUserDto })
  me(@CurrentUser() user: AccessTokenPayload): Promise<AuthenticatedUserDto> {
    return this.getAuthenticatedUser.execute(user.sub);
  }
}
