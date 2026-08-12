import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '@ori-os/db/nestjs'; // Assuming PrismaModule is exported from @ori-os/db
import type { SignOptions } from 'jsonwebtoken';

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'ori-os-test-only-secret';
  }

  throw new Error('JWT_SECRET is required');
}

function jwtExpiresIn(): SignOptions['expiresIn'] {
  return (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: requireJwtSecret(),
      // Keep the API token lifetime aligned with the browser session. The
      // value remains configurable so a refresh-token flow can reduce it
      // later without another code change.
      signOptions: { expiresIn: jwtExpiresIn() },
    }),
    PrismaModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
