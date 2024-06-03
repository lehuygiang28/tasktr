/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import cronValidate from 'cron-validate';

export function IsCron(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsCron',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const result = cronValidate(value, {
                        preset: 'default',
                        override: {
                            useSeconds: true,
                        },
                    });
                    return result.isValid();
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Invalid cron expression';
                },
            },
        });
    };
}
