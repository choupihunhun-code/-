import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.resolveHttpMessage(exception)
        : '系统错误';

    response.status(status).json({
      code: this.resolveCode(status),
      message,
      data: null,
    });
  }

  private resolveHttpMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const value = (response as { message: unknown }).message;
      return Array.isArray(value) ? value.join('; ') : String(value);
    }
    return exception.message;
  }

  private resolveCode(status: number): number {
    if (status === HttpStatus.BAD_REQUEST) return 400001;
    if (status === HttpStatus.UNAUTHORIZED) return 401001;
    if (status === HttpStatus.FORBIDDEN) return 403001;
    if (status === HttpStatus.NOT_FOUND) return 404001;
    if (status === HttpStatus.CONFLICT) return 409001;
    if (status === HttpStatus.UNPROCESSABLE_ENTITY) return 422001;
    return 500001;
  }
}
