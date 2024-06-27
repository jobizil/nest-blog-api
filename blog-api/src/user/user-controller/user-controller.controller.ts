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
import { Observable, catchError, map, from, of } from 'rxjs';

@Controller('users')
export class UserControllerController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() user: User): Promise<User | object> {
    return from(this.userService.create(user)).pipe(
      map((user: User) => user),
      catchError((error) => of({ error: error.message })),
    );
  }

  @Post('login')
  // login(@Body email: string, password: string): Observable<object>{
  async login(@Body() user: User): Promise<object> {
    return from(this.userService.login(user)).pipe(
      map((jwt: string) => {
        return { accessToken: jwt };
      }),
    );
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
