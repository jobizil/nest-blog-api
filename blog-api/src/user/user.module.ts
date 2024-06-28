import { Module } from '@nestjs/common';
import { UserService } from './user-service/user.service';
import { UserControllerController } from './user-controller/user-controller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user-model/user.entity';
import { AuthModule } from 'src/auth/auth-module.module';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserControllerController],
})
export class UserModule {}
