import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { parseExpression } from 'cron-parser';

function validateCron(value: string) {
    try {
        parseExpression(value);
        return true;
    } catch (error) {
        return false;
    }
}

export function IsCron(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsCron',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: `Invalid ${propertyName} expression`,
                ...validationOptions,
            },
            validator: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                validate(value: unknown, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return validateCron(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `Invalid ${args.property} expression`;
                },
            },
        });
    };
}
