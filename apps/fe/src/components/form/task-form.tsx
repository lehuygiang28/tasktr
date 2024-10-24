'use client';

import 'react-js-cron/dist/styles.css';

import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import {
    Form,
    Input,
    Select,
    Row,
    Col,
    Switch,
    Space,
    FormProps,
    InputNumber,
    Divider,
    Typography,
} from 'antd';
import { Create, Edit } from '@refinedev/antd';
import { HttpError, useList } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import Cron from 'react-js-cron';
import { createRegex } from '@vn-utils/text';

import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { TaskFormValidator } from '~/validators';
import worldTimeAPIProvider from '~/providers/data-provider/timezone';
import { useCronReducer } from '~/hooks/useCronReducer';
import { HttpMethodTag } from '~/components/tag/http-method-tag';
import { TryRequestButton } from '../button/try-request-btn';
import { AlertOptions, HeadersOption } from '../form-item';

const { Item } = Form;
const { Text } = Typography;

export type TaskFormValues = {
    headerLists?: { key?: string; value?: string }[];
} & TaskFormValidator;

interface TaskFormProps {
    mode: 'create' | 'edit';
    defaultValues?: TaskFormValues;
    onSubmit: (data: TaskFormValues) => void;
    formProps: FormProps;
}

export function TaskForm({ mode, defaultValues, onSubmit, formProps }: TaskFormProps) {
    const isCreateMode = mode === 'create';

    const { data: timeZones } = useList({
        dataProviderName: worldTimeAPIProvider.name,
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        trigger,
    } = useForm<TaskFormValues, HttpError, TaskFormValues>({
        resolver: classValidatorResolver(TaskFormValidator),
        defaultValues,
    });

    const [cronValues, dispatchCronValues] = useCronReducer({
        defaultValue: defaultValues?.cron ?? '*/5 * * * *',
        setFormValue: (value) => setValue('cron', value),
    });

    useEffect(() => {
        setValue('isEnable', false);
        if (defaultValues && Object.keys(defaultValues).length > 0) {
            const taskForm = new TaskFormValidator();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const setTaskFormValue = (key: keyof TaskFormValues, value: any) => {
                switch (key) {
                    case 'headerLists':
                        break;
                    case 'headers': {
                        const parsedHeaders = JSON.parse(String(value));
                        const formattedHeaders = Object.entries(parsedHeaders).map(
                            ([key, value]) => ({
                                key,
                                value: String(value),
                            }),
                        );
                        setValue('headerLists', formattedHeaders);
                        break;
                    }
                    case 'cron': {
                        dispatchCronValues({ type: 'set_values', value: String(value) });
                        break;
                    }
                    default: {
                        if (key in taskForm) {
                            setValue(key, String(value));
                        }
                        break;
                    }
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handleNestedObjects = (object: Record<string, any>, prefix = '') => {
                Object.entries(object).forEach(([key, value]) => {
                    const formKey = prefix ? `${prefix}.${key}` : key;
                    if (
                        value !== null &&
                        value !== undefined &&
                        typeof value === 'object' &&
                        !Array.isArray(value)
                    ) {
                        // Recursively handle nested objects
                        handleNestedObjects(value, formKey);
                    } else {
                        // Handle base case
                        setTaskFormValue(formKey as keyof TaskFormValues, value);
                    }
                });
            };

            handleNestedObjects(defaultValues);
        }
    }, [defaultValues, setValue, dispatchCronValues]);

    const transformSubmit = (data: TaskFormValues) => {
        const { headerLists, ...rest } = data;
        const transformedHeaders = headerLists
            ? headerLists?.reduce((acc: object, { key, value }: { key: string; value: string }) => {
                  if (!key || !value) {
                      return;
                  }
                  return {
                      ...acc,
                      [key]: value,
                  };
              }, {})
            : undefined;

        return {
            ...rest,
            cron: cronValues.inputValue,
            headers: JSON.stringify(transformedHeaders),
        };
    };

    const submit = (data: TaskFormValues) => {
        return onSubmit(transformSubmit(data));
    };

    const WrapCreateOrEdit = isCreateMode ? Create : Edit;

    return (
        <Form {...formProps} autoComplete="off" layout="vertical" onFinish={handleSubmit(submit)}>
            <WrapCreateOrEdit
                saveButtonProps={{ htmlType: 'submit' }}
                footerButtons={({ defaultButtons }) => (
                    <Space>
                        <TryRequestButton
                            getValues={async function () {
                                // Trigger the form validation first
                                const isValid = await trigger();
                                if (!isValid) {
                                    return null;
                                }

                                // Transform the form values to the expected format
                                return transformSubmit(getValues());
                            }}
                        />
                        {defaultButtons}
                    </Space>
                )}
            >
                <Controller<TaskFormValues>
                    name={'name'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskFormValues>
                            {...field}
                            label={'Name'}
                            name={'name'}
                            validateStatus={errors?.name ? 'error' : 'validating'}
                            help={<>{errors?.name?.message}</>}
                        >
                            <Input
                                name={'name'}
                                placeholder="Name of the task"
                                value={field?.value?.toString()}
                            />
                        </Item>
                    )}
                />

                <Controller<TaskFormValues>
                    name={'endpoint'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskFormValues>
                            {...field}
                            label={'Endpoint'}
                            name={'endpoint'}
                            validateStatus={errors?.endpoint ? 'error' : 'validating'}
                            help={<>{errors?.endpoint?.message}</>}
                        >
                            <Input
                                name={'endpoint'}
                                placeholder="Url, can have parameters and query string"
                            />
                        </Item>
                    )}
                />

                <Row gutter={16}>
                    <Col sm={4} md={2}>
                        <Controller<TaskFormValues>
                            name={'isEnable'}
                            control={control}
                            render={({ field }) => (
                                <Item<TaskFormValues> label={'Enable'}>
                                    <Switch
                                        {...field}
                                        value={field?.value === 'true' || field?.value === true}
                                        checked={field?.value == 'true' || field?.value == true}
                                        onChange={field.onChange}
                                    />
                                </Item>
                            )}
                        />
                    </Col>
                    <Col sm={20} md={7}>
                        <Controller<TaskFormValues>
                            name={'method'}
                            control={control}
                            render={({ field }) => (
                                <Item<TaskFormValues>
                                    name={'method'}
                                    label={'Method'}
                                    validateStatus={errors?.method ? 'error' : 'validating'}
                                    help={<>{errors?.method?.message}</>}
                                >
                                    <Select
                                        {...field}
                                        options={Object.values(HttpMethodEnum).map((value) => ({
                                            value: value,
                                            label: <HttpMethodTag method={value} />,
                                        }))}
                                        placeholder="Select a http method"
                                    />
                                </Item>
                            )}
                        />
                    </Col>
                    <Col xs={24} md={15}>
                        <Controller<TaskFormValues>
                            name={'timezone'}
                            control={control}
                            render={({ field }) => (
                                <Item<TaskFormValues>
                                    label={'Timezone'}
                                    name={'timezone'}
                                    validateStatus={errors?.timezone ? 'error' : 'validating'}
                                    help={<>{errors?.timezone?.message}</>}
                                >
                                    <Select
                                        {...field}
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Select timezone"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            createRegex(input).test(option?.label ?? '')
                                        }
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.label ?? '')
                                                .toLowerCase()
                                                .localeCompare((optionB?.label ?? '').toLowerCase())
                                        }
                                        options={timeZones?.data?.map((timezone) => ({
                                            value: timezone.id,
                                            label: timezone.name,
                                        }))}
                                    />
                                </Item>
                            )}
                        />
                    </Col>
                </Row>

                <Controller<TaskFormValues>
                    name={'cron'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskFormValues>
                            {...field}
                            name={'cron'}
                            label={'Scheduler (Cron)'}
                            validateStatus={errors?.cron ? 'error' : 'validating'}
                            help={<>{errors?.cron?.message}</>}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Cron
                                    value={cronValues.cronValue}
                                    setValue={(newValue: string) => {
                                        dispatchCronValues({
                                            type: 'set_values',
                                            value: newValue,
                                        });
                                    }}
                                    leadingZero={false}
                                />
                                <Input
                                    ref={ref}
                                    name={'cron'}
                                    placeholder="Cron expression"
                                    value={cronValues.inputValue}
                                    onChange={(event) => {
                                        dispatchCronValues({
                                            type: 'set_input_value',
                                            value: event.target.value,
                                        });
                                    }}
                                    onBlur={() => {
                                        dispatchCronValues({
                                            type: 'set_cron_value',
                                            value: cronValues.inputValue,
                                        });
                                    }}
                                />
                            </Space>
                        </Item>
                    )}
                />

                <Controller<TaskFormValues>
                    name={'note'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskFormValues>
                            {...field}
                            label={'Note'}
                            name={'note'}
                            validateStatus={errors?.note ? 'error' : 'validating'}
                            help={<>{errors?.note?.message}</>}
                        >
                            <Input.TextArea
                                ref={ref}
                                placeholder="Take a note about this task"
                                autoSize={{ minRows: 2, maxRows: 4 }}
                            />
                        </Item>
                    )}
                />

                <HeadersOption control={control} />

                <Controller<TaskFormValues>
                    name={'body'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskFormValues>
                            {...field}
                            label={'Body'}
                            name={'body'}
                            validateStatus={errors?.body ? 'error' : 'validating'}
                            help={<>{errors?.body?.message}</>}
                        >
                            <Input.TextArea
                                ref={ref}
                                placeholder="Body data for the task"
                                autoSize={{ minRows: 4, maxRows: 12 }}
                            />
                        </Item>
                    )}
                />

                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                        <Divider orientation="left">Options</Divider>
                        <Text type="secondary">
                            You can leave these options empty if you don&apos;t want to use them
                        </Text>
                    </div>

                    <Controller<TaskFormValues>
                        name={'options.stopAfterFailures'}
                        control={control}
                        render={({ field: { ref, ...field } }) => (
                            <Item
                                {...field}
                                validateStatus={
                                    errors?.options?.stopAfterFailures ? 'error' : 'validating'
                                }
                                help={<>{errors?.options?.stopAfterFailures?.message}</>}
                                style={{ marginTop: '20px' }}
                            >
                                <InputNumber
                                    addonBefore="Stop task after"
                                    addonAfter="consecutive failures"
                                    defaultValue={
                                        field?.value && !isNaN(Number(field?.value))
                                            ? Number(field?.value)
                                            : null
                                    }
                                />
                            </Item>
                        )}
                    />
                    <Controller<TaskFormValues>
                        name={'options.saveResponse'}
                        control={control}
                        render={({ field }) => (
                            <Item noStyle>
                                <Space>
                                    <Switch
                                        {...field}
                                        value={field?.value === 'true' || field?.value === true}
                                        checked={field?.value === 'true' || field?.value === true}
                                        onChange={field.onChange}
                                    />
                                    Save response in log history
                                </Space>
                            </Item>
                        )}
                    />
                </Space>

                <AlertOptions control={control} errors={errors} setValue={setValue} />
            </WrapCreateOrEdit>
        </Form>
    );
}
