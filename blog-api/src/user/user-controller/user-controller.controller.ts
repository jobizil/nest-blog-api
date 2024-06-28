import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user-service/user.service';
import { User, UserRole } from '../user-model/user.interface';
import { Observable, catchError, map, from, of } from 'rxjs';
import { Pagination } from 'nestjs-typeorm-paginate';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/auth-service/guards/jwt-guard';
import { RolesGuard } from 'src/auth/auth-service/guards/roles-guards';

@Controller('users')
export class UserControllerController {
  constructor(private userService: UserService) {}

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(Number(params.id));
  }

  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : Number(limit);
    return this.userService.paginateRes({
      page,
      limit,
      route: 'http:localhost:20233/users/8',
    });
  }

  @Delete(':id')
  delete(@Param() params): Observable<any> {
    return this.userService.deleteOne(Number(params.id));
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateUserRole(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateUserRole(Number(id), user);
  }
}
