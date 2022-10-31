import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { CustomRpcException } from '../exception/custom-rpc.exception';

@Injectable()
export class TimeOutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>)
  : Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      timeout(30000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          throw new CustomRpcException('Timeout error occurred',
            HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
        }
        throw new CustomRpcException(`Error occurred ${err.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
      })
    );
  }
}