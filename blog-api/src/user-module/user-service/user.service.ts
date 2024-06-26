import { Injectable } from '@nestjs/common';
import { UserEntity } from '../user-model/user.enntity';
import { InjectRepository } from '@nestjs/typeOrm';
import { Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { User } from '../user-model/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  create(user: User): Observable<User> {
    return from(this.userRepository.save(user));
  }

  findOne(id: number): Observable<User> {
    console.log(id);
    return from(this.userRepository.findOne({ where: { id } }));
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find());
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    return from(this.userRepository.update(id, user));
  }
}
