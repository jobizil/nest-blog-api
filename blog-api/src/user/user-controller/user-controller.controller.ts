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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Res,
} from '@nestjs/common';
import { UserService } from '../user-service/user.service';
import { User, UserRole } from '../user-model/user.interface';
import { Observable, catchError, map, from, tap, of } from 'rxjs';
import { Pagination } from 'nestjs-typeorm-paginate';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/auth-service/guards/jwt-guard';
import { RolesGuard } from 'src/auth/auth-service/guards/roles-guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profile-images',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + '-' + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};
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
    @Query('username') username: string,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : Number(limit);
    const payload = {
      page: Number(page),
      limit: Number(limit),
      route: 'http:localhost:20233/users',
    };
    if (!username || username === null || username === undefined) {
      return this.userService.paginateRes(payload);
    }
    return this.userService.filterBySearch(payload, { username });
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

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req): Observable<object> {
    console.log(file);
    const user = req.user;
    console.log(user.userId);
    return this.userService
      .updateOne(user.userId, { profileImage: file.filename })
      .pipe(tap((user: User) => console.log(user)));
  }

  @Get('profile-image/:imagename')
  getUserProfileImage(
    @Param('imagename') imagename: string,
    @Res() res,
  ): Observable<object> {
    return of(
      res.sendFile(
        path.join(process.cwd(), 'uploads/profile-images/' + imagename),
      ),
    );
  }
}
