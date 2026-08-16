import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

export interface AuthenticatedUser {
  id: string;
  sanchayUid: string;
  status: string;
  sessionToken: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authentication token required.');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token || token.trim().length === 0) {
      throw new UnauthorizedException('Invalid authorization format. Bearer token expected.');
    }

    const sessionData = await this.authService.validateSession(token.trim());

    if (!sessionData) {
      throw new UnauthorizedException('Session is invalid, expired, or has been revoked.');
    }

    request.user = {
      id: sessionData.user.id,
      sanchayUid: sessionData.user.sanchayUid,
      status: sessionData.user.status,
      sessionToken: token.trim(),
    };

    return true;
  }
}
