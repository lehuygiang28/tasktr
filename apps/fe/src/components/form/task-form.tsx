'use client';

import 'react-js-cron/dist/styles.css';

import { useEffect } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Form, Input, Select, Row, Col, Switch, Space, Button, FormProps } from 'antd';
import { Create, Edit } from '@refinedev/antd';
import { HttpError, useList } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Cron from 'react-js-cron';

import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { TaskFormValidator } from '~/validators';
import worldTimeAPIProvider from '~/providers/data-provider/timezone';
import { useCronReducer } from '~/hooks/useCronReducer';
import { HttpMethodTag } from '~/components/tag/http-method-tag';
import { TryRequestButton } from '../button/try-request-btn';

const { Item } = Form;

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
        defaultValue: defaultValues?.cron,
        setFormValue: (value) => setValue('cron', value),
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'headerLists',
    });

    useEffect(() => {
        setValue('isEnable', false);
        if (defaultValues && Object.keys(defaultValues).length > 0) {
            const taskForm = new TaskFormValidator();
            Object.entries(defaultValues).forEach(([key, value]) => {
                // Handle some special cases
                const keyName: keyof TaskFormValues = key as keyof TaskFormValues;
                switch (keyName) {
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
                    case 'isEnable': {
                        setValue(keyName, value === 'true' || value === true);
                        break;
                    }
                    default: {
                        if (keyName in taskForm) {
                            setValue(keyName, String(value));
                        }
                        break;
                    }
                }
            });
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
                            render={({ field: { onChange, value } }) => (
                                <Item<TaskFormValues>
                                    name={'isEnable'}
                                    label={'Enable'}
                                    validateStatus={errors?.isEnable ? 'error' : 'validating'}
                                    help={<>{errors?.isEnable?.message}</>}
                                >
                                    <Switch
                                        checked={value == 'true' || value == true}
                                        onChange={onChange}
                                        checkedChildren={true}
                                        unCheckedChildren={false}
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
                                            (option?.label ?? '').includes(input)
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
                            label={'Cron'}
                            validateStatus={errors?.cron ? 'error' : 'validating'}
                            help={<>{errors?.cron?.message}</>}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
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

                <Form.Item label="Headers">
                    <div>
                        {fields.map((field, index) => {
                            return (
                                <Row key={field.id} gutter={16} style={{ marginBottom: 8 }}>
                                    <Col span={11}>
                                        <Controller
                                            name={`headerLists.${index}.key`}
                                            control={control}
                                            rules={{ required: 'Key is required' }}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Key" />
                                            )}
                                        />
                                    </Col>
                                    <Col span={11}>
                                        <Controller
                                            name={`headerLists.${index}.value`}
                                            control={control}
                                            rules={{ required: 'Value is required' }}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Value" />
                                            )}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <MinusCircleOutlined onClick={() => remove(index)} />
                                    </Col>
                                </Row>
                            );
                        })}
                    </div>
                    <Button
                        type="dashed"
                        onClick={() => append({ key: '', value: '' })}
                        block
                        icon={<PlusOutlined />}
                    >
                        Add Header
                    </Button>
                </Form.Item>

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
            </WrapCreateOrEdit>
        </Form>
    );
}
