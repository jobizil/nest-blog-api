import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user-model/user.entity';
import { InjectRepository } from '@nestjs/typeOrm';
import { Repository } from 'typeorm';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { User } from '../user-model/user.interface';
import { AuthService } from 'src/auth/auth-service/auth-service.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  async create(user: User): Promise<User> {
    return from(this.authService.hashPassword(user.password))
      .pipe(
        switchMap((passwordHash: string) => {
          const newUser = new UserEntity();
          newUser.name = user.name;
          newUser.username = user.username;
          newUser.email = user.email;
          newUser.password = passwordHash;

          return from(this.userRepository.save(newUser)).pipe(
            map((user: User) => {
              const { password, ...rest } = user;
              return rest;
            }),
            catchError((error) => {
              console.error('Error creating user:', error);
              return throwError(() => new Error(error));
            }),
          );
        }),
      )
      .toPromise();
  }

  findOne(id: number): Observable<User> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      map((user: User) => {
        const { password, ...rest } = user;
        return rest;
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

  updateOne(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    return from(this.userRepository.update(id, user));
  }

  // async validateUser(email: string, password: string): Promise<User> {
  //   return this.findByEmail(email).pipe(
  //     switchMap((user: User) =>
  //       this.authService.comparePasswords(password, user.password).pipe(
  //         map((match: boolean) => {
  //           if (match) {
  //             const { password, ...rest } = user;
  //             return rest;
  //           } else {
  //             throw Error;
  //           }
  //         }),
  //       ),
  //     ),
  //   );
  // }
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
                const { password, ...result } = user;
                return result;
              } else {
                throw new UnauthorizedException('Invalid credentials');
              }
            }),
          );
        }),
      )
      .toPromise();
  }

  async findByEmail(email: string): Promise<User> {
    console.log(email);
    const validUser = await this.userRepository.findOne({ where: { email } });
    return validUser;
  }

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

  // login(user: User): Observable<string> {
  //   return this.validateUser(user.email, user.password).pipe(
  //     switchMap((user: User) => {
  //       if (user) {
  //         return this.authService
  //           .generateJwtToken({
  //             id: user.id,
  //             email: user.email,
  //           })
  //           .pipe(map((jwt: string) => jwt));
  //       } else {
  //         return 'Invalid email or password';
  //       }
  //     }),
  //   );
  // }
}
