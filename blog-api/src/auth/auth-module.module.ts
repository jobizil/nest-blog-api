import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth-service/auth-service.service';
import * as bcrypt from 'bcrypt';
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
        signOptions: {
          expiresIn: configService.get('jwtExpiresIn'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    {
      provide: 'BCRYPT',
      useValue: bcrypt,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
