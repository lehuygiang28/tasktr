import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetails } from '../dtos/problem-details.dto';

type HttpExceptionResponse = {
    status: number;
    errors: Record<string, unknown>;
    message?: string;
};

@Catch(HttpException)
export class ProblemDetailsFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse: object | string = exception.getResponse();
        let problemDetails: ProblemDetails;

        if (typeof exceptionResponse === 'object') {
            const { status, errors, message = '' } = exceptionResponse as HttpExceptionResponse;
            problemDetails = {
                type: 'urn:problem-type:validation-error',
                title: 'Validation Error',
                status,
                detail: message || 'One or more validation errors occurred.',
                instance: request.url,
                errors,
            };
        } else {
            problemDetails = {
                type: 'urn:problem-type:internal-server-error',
                title: exception.message || 'Internal Server Error',
                status,
                detail: exception.message || 'An unexpected error occurred.',
                instance: request.url,
                errors: {},
            };
        }

        return response.status(status).json(problemDetails);
    }
}
