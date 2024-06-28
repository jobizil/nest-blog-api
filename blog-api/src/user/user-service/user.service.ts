import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user-model/user.entity';
import { InjectRepository } from '@nestjs/typeOrm';
import { Repository } from 'typeorm';
import { Observable, from, map, switchMap } from 'rxjs';
import { User, UserRole } from '../user-model/user.interface';
import { AuthService } from 'src/auth/auth-service/auth-service.service';
import {
  paginate,
  IPaginationOptions,
  Pagination,
} from 'nestjs-typeorm-paginate';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  async create(user: User): Promise<User> {
    try {
      const passwordHash = await this.authService.hashPassword(user.password);

      const newUser = this.userRepository.create({
        ...user,
        role: UserRole.USER,
        password: passwordHash,
      });
      const savedUser = await this.userRepository.save(newUser);
      savedUser.password = undefined;
      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      return new Error(error);
    }
  }

  findOne(id: number): Observable<User> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      map((user: User) => {
        user.password = undefined;
        return user;
      }),
    );
  }

  paginateRes(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepository, options)).pipe(
      map((userPagable: Pagination<User>) => {
        userPagable.items.forEach(function (user) {
          delete user.password;
        });
        return userPagable;
      }),
    );
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        users.forEach(function (user) {
          delete user.password;
        });
        return users;
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  // Updates User Data
  updateOne(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.role;
    return from(this.userRepository.update(id, user));
  }

  // Update UserRole
  updateUserRole(id: number, user: User): Observable<any> {
    return from(this.userRepository.update(id, { role: user.role }));
  }
  // Validate user
  async validateUser(email: string, password: string): Promise<User> {
    return from(this.findByEmail(email))
      .pipe(
        switchMap((user: User) => {
          if (!user) {
            throw new UnauthorizedException('User not found');
          }
          return from(
            this.authService.comparePasswords(password, user.password),
          ).pipe(
            map((match: boolean) => {
              if (match) {
                user.password = undefined;
                return user;
              } else {
                throw new UnauthorizedException('Invalid credentials');
              }
            }),
          );
        }),
      )
      .toPromise();
  }

  // Find user by email
  async findByEmail(email: string): Promise<User> {
    const validUser = await this.userRepository.findOne({ where: { email } });
    return validUser;
  }

  // Login User
  async login(user: User): Promise<string> {
    try {
      const lowerEmail = user.email.toLowerCase();
      const validatedUser = await this.validateUser(lowerEmail, user.password);
      if (validatedUser) {
        return this.authService.generateJwtToken({
          id: validatedUser.id,
          email: validatedUser.email,
        });
      } else {
        throw new UnauthorizedException('Invalid email or password');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
