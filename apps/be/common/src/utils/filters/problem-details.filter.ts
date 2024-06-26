import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetails } from '../dtos/problem-details.dto';
import { PinoLogger } from 'nestjs-pino';

type HttpExceptionResponse = {
    statusCode: number;
    errors: Record<string, unknown>;
    message?: string;
};

@Catch(HttpException)
export class ProblemDetailsFilter implements ExceptionFilter {
    constructor(private readonly logger: PinoLogger) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const exceptionResponse: object | string = exception.getResponse();
        let problemDetails: ProblemDetails;

        if (typeof exceptionResponse === 'object') {
            const {
                statusCode: status,
                errors,
                message = '',
            } = exceptionResponse as HttpExceptionResponse;

            switch (status) {
                case 400:
                    problemDetails = {
                        type: 'urn:problem-type:bad-request',
                        title: 'Bad Request',
                        status,
                        detail:
                            message ||
                            'The request could not be understood by the server due to malformed syntax.',
                        instance: request.url,
                        errors,
                    };
                    break;
                case 401:
                    problemDetails = {
                        type: 'urn:problem-type:unauthorized',
                        title: 'Unauthorized',
                        status,
                        detail: message || 'You are not authorized to access this resource.',
                        instance: request.url,
                        errors,
                    };
                    break;
                case 403:
                    problemDetails = {
                        type: 'urn:problem-type:forbidden',
                        title: 'Forbidden',
                        status,
                        detail: message || 'You are not authorized to access this resource.',
                        instance: request.url,
                        errors,
                    };
                    break;
                case 404:
                    problemDetails = {
                        type: 'urn:problem-type:not-found',
                        title: 'Not Found',
                        status,
                        detail: message || 'The requested resource was not found.',
                        instance: request.url,
                        errors,
                    };
                    break;
                case 405:
                    problemDetails = {
                        type: 'urn:problem-type:method-not-allowed',
                        title: 'Method Not Allowed',
                        status,
                        detail: message || 'The requested method is not allowed.',
                        instance: request.url,
                        errors,
                    };
                    break;
                case 409:
                    problemDetails = {
                        type: 'urn:problem-type:conflict',
                        title: 'Conflict',
                        status,
                        detail: message || 'The requested resource already exists.',
                        instance: request.url,
                        errors,
                    };
                    break;
                case 500:
                    problemDetails = {
                        type: 'urn:problem-type:internal-server-error',
                        title: 'Internal Server Error',
                        status,
                        detail: message || 'An unexpected error occurred.',
                        instance: request.url,
                        errors,
                    };
                    break;
                case 422:
                default:
                    problemDetails = {
                        type: 'urn:problem-type:validation-error',
                        title: 'Validation Error',
                        status,
                        detail: message || 'One or more validation errors occurred.',
                        instance: request.url,
                        errors,
                    };
            }
        } else {
            this.logger.error(exception);
            problemDetails = {
                type: 'urn:problem-type:internal-server-error',
                title: exception?.message || 'Internal Server Error',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                detail: exception?.message || 'An unexpected error occurred.',
                instance: request.url,
                errors: {},
            };
        }

        return response.status(problemDetails.status).json(problemDetails);
    }
}
