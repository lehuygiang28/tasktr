import { HttpException, HttpStatus, ValidationError, ValidationPipeOptions } from '@nestjs/common';

/**
 * Generates an object that represents the validation errors.
 *
 * @param {ValidationError[]} errors - An array of validation errors.
 * @return {unknown} An object that represents the validation errors. Type this can be nested object.
 */
function generateErrors(errors: ValidationError[]): unknown {
    return errors.reduce(
        (accumulator, currentValue) => ({
            ...accumulator,
            [currentValue.property]:
                (currentValue.children?.length ?? 0) > 0
                    ? generateErrors(currentValue.children ?? [])
                    : Object.values(currentValue.constraints ?? {}).join(', '),
        }),
        {},
    );
}

export const validationOptions: ValidationPipeOptions = {
    transform: true,
    whitelist: true,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: (errors: ValidationError[]) => {
        return new HttpException(
            {
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: generateErrors(errors),
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    },
};
