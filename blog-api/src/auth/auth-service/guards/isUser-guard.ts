import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Observable, from, map } from 'rxjs';
import { User } from 'src/user/user-model/user.interface';
import { UserService } from 'src/user/user-service/user.service';

@Injectable()
export class IsUserGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const { id } = request.params;
    const { userId } = request.user;

    return from(this.userService.findOne(userId)).pipe(
      map((user: User) => {
        let hasPermission = false;
        console.log(user.id === Number(id));
        if (user.id === Number(id)) {
          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
    return true;
  }
}
