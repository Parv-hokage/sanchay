import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard, AuthenticatedUser } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  LoginRequestSchema,
  VerifyOtpRequestSchema,
} from '../validation';
import { LoginRequestDto, VerifyOtpRequestDto } from '../types';
import { REQUEST_ID_HEADER } from '../common/middleware/request-id.middleware';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate Authentication Challenge (Passwordless / Mock IDP / OTP)' })
  async login(
    @Body() body: LoginRequestDto,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const validated = LoginRequestSchema.parse(body);
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.authService.startLogin(
      validated.provider,
      validated.identifier,
      requestId,
      ip,
      userAgent,
    );
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Challenge OTP and Establish Session' })
  async verifyOtp(
    @Body() body: VerifyOtpRequestDto,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const validated = VerifyOtpRequestSchema.parse(body);
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.authService.verifyLogin(
      validated.sessionChallengeId,
      validated.otp,
      requestId,
      ip,
      userAgent,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke and Terminate Current Session' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await this.authService.logout(user.sessionToken, user.id, requestId, ip, userAgent);
    return { success: true, message: 'Logged out successfully.' };
  }

  @Get('session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Current Authenticated Session Status' })
  async getSession(@CurrentUser() user: AuthenticatedUser) {
    return {
      authenticated: true,
      user: {
        id: user.id,
        sanchayUid: user.sanchayUid,
        status: user.status,
      },
    };
  }
}
