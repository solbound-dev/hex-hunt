import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    //   handleRequest(err, user, info, context) {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //     console.log('JwtAuthGuard triggered:', { err, user, info });
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    //     return super.handleRequest(err, user, info, context);
    //   }
}
