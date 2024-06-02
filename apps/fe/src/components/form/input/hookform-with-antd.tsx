import {
    Controller,
    FieldErrors,
    FieldValues,
    Path,
    Control,
    useController,
} from 'react-hook-form';
import { Form, Input } from 'antd';

interface FormInputProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    placeholder: string;
    prefix: React.ReactNode;
    errors: FieldErrors<T>;
}

export const FormInput = <T extends FieldValues>({
    control,
    name,
    placeholder,
    prefix,
    errors,
}: FormInputProps<T>) => {
    const { field } = useController({ name, control });

    return (
        <Controller<T>
            name={name}
            control={control}
            render={() => (
                <Form.Item
                    name={String(name)}
                    validateStatus={errors[name] ? 'error' : 'validating'}
                    help={<>{errors[name]?.message}</>}
                >
                    <Input {...field} prefix={prefix} placeholder={placeholder} />
                </Form.Item>
            )}
        />
    );
};
