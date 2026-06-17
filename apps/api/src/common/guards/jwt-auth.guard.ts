import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>();
    const auth = request.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) {
      throw new UnauthorizedException('未登录或登录已过期');
    }

    try {
      request.user = this.jwtService.verify<CurrentUserPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('未登录或登录已过期');
    }
  }
}
