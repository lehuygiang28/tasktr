import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { parseExpression } from 'cron-parser';

export function IsCron(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsCron',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    try {
                        parseExpression(String(value));
                        return true;
                    } catch (error) {
                        return false;
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    return `Invalid ${args.property} expression`;
                },
            },
        });
    };
}
