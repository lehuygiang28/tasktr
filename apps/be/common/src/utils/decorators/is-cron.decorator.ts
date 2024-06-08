import {
    registerDecorator,
    ValidationOptions,
    buildMessage,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { stringToArray } from 'cron-converter';

@ValidatorConstraint()
export class IsCronValidator implements ValidatorConstraintInterface {
    validate(id: string): boolean {
        try {
            stringToArray(id.normalize() ?? '');
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    defaultMessage(): string {
        return buildMessage((eachPrefix) => eachPrefix + `$property must be a Valid Cron`)();
    }
}

export function IsCron(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsCron',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsCronValidator,
        });
    };
}
