import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MulterError } from 'multer';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof MulterError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${request.method} ${request.url}] ${exception.stack}`,
      );
      message = exception.message;
    }

    // If the exception response is already a structured object, use it directly.
    // Otherwise, create a standard response shape.
    const responseBody =
      typeof message === 'object' && message !== null
        ? message
        : { statusCode: status, message, path: request.url };

    response.status(status).json(responseBody);
  }
}
