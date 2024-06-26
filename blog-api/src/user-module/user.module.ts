import { Module } from '@nestjs/common';
import { UserService } from './user-service/user.service';
import { UserControllerController } from './user-controller/user-controller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user-model/user.enntity';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService],
  controllers: [UserControllerController],
})
export class UserModule {}
