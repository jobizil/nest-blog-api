import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, of } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/user-model/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('BCRYPT') private readonly bcryptLib: typeof bcrypt,
  ) {}

  async generateJwtToken(payload: User): Promise<string> {
    return this.jwtService.signAsync({ payload });
  }

  //  async hashPassword(password: string): Promise<string> {
  //     console.log(password, 12);
  //     console.log(bcrypt);
  //     return await bcrypt.hash(password, 12);
  //   }
  async hashPassword(password: string): Promise<string> {
    console.log('Password:', password);
    console.log('Bcrypt object:', bcrypt);
    if (!bcrypt || typeof bcrypt.hash !== 'function') {
      throw new Error('Bcrypt is not properly initialized');
    }
    return bcrypt.hash(password, 12);
  }

  comparePasswords(
    plainPassword: string,
    password: string,
  ): Observable<boolean | any> {
    return of<boolean | any>(bcrypt.compare(plainPassword, password));
  }
}
