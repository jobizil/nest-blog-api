import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth-service/auth-service.service';
import * as bcrypt from 'bcrypt';
import { RolesGuard } from './auth-service/guards/roles-guards';
import { JwtAuthGuard } from './auth-service/guards/jwt-guard';
import { JwtStrategy } from './auth-service/guards/jwt-strategy';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    forwardRef(() => UserModule),
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
    RolesGuard,
    JwtAuthGuard,
    JwtStrategy,
    {
      provide: 'BCRYPT',
      useValue: bcrypt,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
