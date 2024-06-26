import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from '../user-service/user.service';
import { User } from '../user-model/user.interface';
import { Observable } from 'rxjs';

@Controller('users')
export class UserControllerController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User> {
    return this.userService.create(user);
  }

  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(Number(params.id));
  }

  @Get()
  findAll(): Observable<User[]> {
    return this.userService.findAll();
  }

  @Delete(':id')
  delete(@Param() params): Observable<any> {
    return this.userService.deleteOne(Number(params.id));
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }
}
