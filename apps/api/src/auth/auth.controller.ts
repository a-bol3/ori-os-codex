import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
  requireUserId,
} from '../common/request-context';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Post('login')
  async login(
    @Body()
    body: { email: string; password: string; organizationId?: string },
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user, body.organizationId);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken?: string }) {
    if (!body.refreshToken) throw new UnauthorizedException();
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthenticatedRequest) {
    const sessionId = req.user?.sessionId;
    if (!sessionId) {
      throw new UnauthorizedException('Session context is required');
    }

    return this.authService.revokeSession(
      sessionId,
      requireUserId(req),
      requireOrganizationId(req),
    );
  }
}
