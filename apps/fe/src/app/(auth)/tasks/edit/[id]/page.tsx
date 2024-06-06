'use client';

import { Controller } from 'react-hook-form';
import { Form, Input, Select, Row, Col, Switch } from 'antd';
import { Edit, useForm as useFormAnt } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';

import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { TaskEditValidator } from '~/validators';

const { Item } = Form;

export default function TaskEdit() {
    const { formProps, onFinish } = useFormAnt<TaskEditValidator>({});

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<unknown, HttpError, TaskEditValidator>({
        resolver: classValidatorResolver(TaskEditValidator),
    });

    return (
        <Edit saveButtonProps={{ onClick: handleSubmit(onFinish) }}>
            <Form onFinish={handleSubmit} autoComplete="off" {...formProps} layout="vertical">
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Controller<TaskEditValidator>
                            name={'name'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskEditValidator>
                                    {...field}
                                    label={'Name'}
                                    name={'name'}
                                    validateStatus={errors?.name ? 'error' : 'validating'}
                                    help={<>{errors?.name?.message}</>}
                                >
                                    <Input placeholder="Name of the task" />
                                </Item>
                            )}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Controller<TaskEditValidator>
                            name={'cron'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskEditValidator>
                                    {...field}
                                    label={'Cron'}
                                    name={'cron'}
                                    validateStatus={errors?.cron ? 'error' : 'validating'}
                                    help={<>{errors?.cron?.message}</>}
                                >
                                    <Input placeholder="Cron expression" />
                                </Item>
                            )}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col sm={2} md={2}>
                        <Controller<TaskEditValidator>
                            name={'isEnable'}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Item<TaskEditValidator>
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
                    <Col sm={22} md={7}>
                        <Controller<TaskEditValidator>
                            name={'method'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskEditValidator>
                                    name={'method'}
                                    label={'Method'}
                                    validateStatus={errors?.method ? 'error' : 'validating'}
                                    help={<>{errors?.method?.message}</>}
                                >
                                    <Select
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
                        <Controller<TaskEditValidator>
                            name={'timezone'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskEditValidator>
                                    {...field}
                                    label={'Timezone'}
                                    name={'timezone'}
                                    validateStatus={errors?.timezone ? 'error' : 'validating'}
                                    help={<>{errors?.timezone?.message}</>}
                                >
                                    <Input ref={ref} placeholder="Timezone of the task" />
                                </Item>
                            )}
                        />
                    </Col>
                </Row>

                <Controller<TaskEditValidator>
                    name={'endpoint'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskEditValidator>
                            {...field}
                            label={'Endpoint'}
                            name={'endpoint'}
                            validateStatus={errors?.endpoint ? 'error' : 'validating'}
                            help={<>{errors?.endpoint?.message}</>}
                        >
                            <Input.TextArea
                                placeholder="Url, can have parameters and query string"
                                autoSize={{ minRows: 3, maxRows: 8 }}
                            />
                        </Item>
                    )}
                />
                <Controller<TaskEditValidator>
                    name={'note'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskEditValidator>
                            {...field}
                            label={'Note'}
                            name={'note'}
                            validateStatus={errors?.note ? 'error' : 'validating'}
                            help={<>{errors?.note?.message}</>}
                        >
                            <Input.TextArea
                                placeholder="Take a note about this task"
                                autoSize={{ minRows: 2, maxRows: 4 }}
                            />
                        </Item>
                    )}
                />
                <Controller<TaskEditValidator>
                    name={'headers'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskEditValidator>
                            {...field}
                            label={'Headers'}
                            name={'headers'}
                            validateStatus={errors?.headers ? 'error' : 'validating'}
                            help={<>{errors?.headers?.message}</>}
                        >
                            <Input.TextArea
                                placeholder="Headers in stringified JSON format"
                                autoSize={{ minRows: 4, maxRows: 12 }}
                            />
                        </Item>
                    )}
                />
                <Controller<TaskEditValidator>
                    name={'body'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskEditValidator>
                            {...field}
                            label={'Body'}
                            name={'body'}
                            validateStatus={errors?.body ? 'error' : 'validating'}
                            help={<>{errors?.body?.message}</>}
                        >
                            <Input.TextArea
                                placeholder="Body data for the task"
                                autoSize={{ minRows: 4, maxRows: 12 }}
                            />
                        </Item>
                    )}
                />
            </Form>
        </Edit>
    );
}
