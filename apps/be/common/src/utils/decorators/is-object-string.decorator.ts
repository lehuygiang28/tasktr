import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsObjectStringConstraint implements ValidatorConstraintInterface {
    validate(text: string) {
        if (text === '') {
            return true;
        }
        try {
            const object = JSON.parse(text);
            return typeof object === 'object' && object !== null;
        } catch {
            return false;
        }
    }
}

export function IsObjectString(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Must be a valid JSON stringified object',
                ...validationOptions,
            },
            constraints: [],
            validator: IsObjectStringConstraint,
        });
    };
}
