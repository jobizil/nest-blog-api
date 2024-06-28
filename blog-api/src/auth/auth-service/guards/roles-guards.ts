import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { User } from 'src/user/user-model/user.interface';
import { UserService } from 'src/user/user-service/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.userService.findOne(user.userId).pipe(
      map((user: User) => {
        const validRole = () => {
          return roles.indexOf(user.role) > -1;
        };
        let hasPermission: boolean = false;

        if (validRole()) {
          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
  }
}
