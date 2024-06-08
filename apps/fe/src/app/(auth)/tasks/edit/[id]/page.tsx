'use client';

import 'react-js-cron/dist/styles.css';

import { Controller, useFieldArray } from 'react-hook-form';
import { Form, Input, Select, Row, Col, Switch, Space, Button } from 'antd';
import { Edit, useForm as useFormAnt } from '@refinedev/antd';
import { HttpError, useList } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { TaskEditValidator } from '~/validators';
import { useEffect } from 'react';
import worldTimeAPIProvider from '~/providers/data-provider/timezone';
import Cron from 'react-js-cron';
import { useCronReducer } from '~/hooks/useCronReducer';

const { Item } = Form;
const { Option } = Select;

type FormValues = {
    headers?: { key?: string; value?: string }[];
} & Omit<TaskEditValidator, 'headers'>;

export default function TaskEdit() {
    const {
        formProps,
        onFinish,
        queryResult: { data: taskResponse },
    } = useFormAnt<FormValues>({});

    const [values, dispatchValues] = useCronReducer('* * * * *');
    const { data: timeZones } = useList({
        dataProviderName: worldTimeAPIProvider.name,
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<unknown, HttpError, FormValues>({
        resolver: classValidatorResolver(TaskEditValidator),
    });

    useEffect(() => {
        if (taskResponse?.data?.headers) {
            const parsedHeaders = JSON.parse(String(taskResponse.data.headers));
            const formattedHeaders = Object.entries(parsedHeaders).map(([key, value]) => ({
                key,
                value: String(value),
            }));
            setValue('headers', formattedHeaders);
        }

        if (taskResponse?.data?.cron) {
            dispatchValues({ type: 'set_values', value: taskResponse.data.cron });
        }
    }, [taskResponse, setValue, dispatchValues]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'headers',
    });

    const submitHandle = (data: FormValues) => {
        const { headers, ...rest } = data;
        const transformedHeaders = headers
            ? headers?.reduce((acc: object, { key, value }: { key: string; value: string }) => {
                  if (!key || !value) {
                      return;
                  }
                  return {
                      ...acc,
                      [key]: value,
                  };
              }, {})
            : undefined;
        onFinish({ ...rest, headers: JSON.stringify(transformedHeaders) });
    };

    return (
        <Form
            {...formProps}
            autoComplete="off"
            layout="vertical"
            onFinish={handleSubmit(submitHandle)}
        >
            <Edit saveButtonProps={{ htmlType: 'submit' }}>
                <Controller<FormValues>
                    name={'name'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<FormValues>
                            {...field}
                            label={'Name'}
                            name={'name'}
                            validateStatus={errors?.name ? 'error' : 'validating'}
                            help={<>{errors?.name?.message}</>}
                        >
                            <Input ref={ref} placeholder="Name of the task" />
                        </Item>
                    )}
                />

                <Controller<FormValues>
                    name={'endpoint'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<FormValues>
                            {...field}
                            label={'Endpoint'}
                            name={'endpoint'}
                            validateStatus={errors?.endpoint ? 'error' : 'validating'}
                            help={<>{errors?.endpoint?.message}</>}
                        >
                            <Input
                                ref={ref}
                                placeholder="Url, can have parameters and query string"
                                addonBefore={
                                    <Select defaultValue="https://">
                                        <Option value="https://">https://</Option>
                                        <Option value="http://">http://</Option>
                                    </Select>
                                }
                            />
                        </Item>
                    )}
                />

                <Row gutter={16}>
                    <Col sm={4} md={2}>
                        <Controller<FormValues>
                            name={'isEnable'}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Item<FormValues>
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
                        <Controller<FormValues>
                            name={'method'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<FormValues>
                                    name={'method'}
                                    label={'Method'}
                                    validateStatus={errors?.method ? 'error' : 'validating'}
                                    help={<>{errors?.method?.message}</>}
                                >
                                    <Select
                                        ref={ref}
                                        {...field}
                                        options={Object.values(HttpMethodEnum).map((value) => ({
                                            value: value,
                                            label: value,
                                        }))}
                                        placeholder="Select a http method"
                                        style={{ width: '100%' }}
                                    />
                                </Item>
                            )}
                        />
                    </Col>
                    <Col xs={24} md={15}>
                        <Controller<FormValues>
                            name={'timezone'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<FormValues>
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

                <Controller<FormValues>
                    name={'cron'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<FormValues>
                            {...field}
                            label={'Cron'}
                            name={'cron'}
                            validateStatus={errors?.cron ? 'error' : 'validating'}
                            help={<>{errors?.cron?.message}</>}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Input
                                    ref={ref}
                                    placeholder="Cron expression"
                                    value={values.inputValue}
                                    onChange={(event) => {
                                        dispatchValues({
                                            type: 'set_input_value',
                                            value: event.target.value,
                                        });
                                    }}
                                    onBlur={() => {
                                        dispatchValues({
                                            type: 'set_cron_value',
                                            value: values.inputValue,
                                        });
                                    }}
                                />
                                <Cron
                                    value={values.cronValue}
                                    setValue={(newValue: string) => {
                                        dispatchValues({
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

                <Controller<FormValues>
                    name={'note'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<FormValues>
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
                                            name={`headers.${index}.key`}
                                            control={control}
                                            rules={{ required: 'Key is required' }}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Key" />
                                            )}
                                        />
                                    </Col>
                                    <Col span={11}>
                                        <Controller
                                            name={`headers.${index}.value`}
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

                <Controller<FormValues>
                    name={'body'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<FormValues>
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
            </Edit>
        </Form>
    );
}
