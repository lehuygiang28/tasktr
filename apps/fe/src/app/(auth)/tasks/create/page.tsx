'use client';

import { Controller } from 'react-hook-form';
import { Form, Input, Select, Row, Col, Switch } from 'antd';
import { Create, useForm as useFormAnt } from '@refinedev/antd';
import { useForm } from '@refinedev/react-hook-form';
import { HttpError } from '@refinedev/core';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';

import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { TaskCreateValidator } from '~/validators';

const { Item } = Form;

export default function TaskCreate() {
    const { formProps, onFinish } = useFormAnt<TaskCreateValidator>({
        warnWhenUnsavedChanges: true,
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<unknown, HttpError, TaskCreateValidator>({
        resolver: classValidatorResolver(TaskCreateValidator),
        warnWhenUnsavedChanges: true,
    });

    return (
        <Create saveButtonProps={{ onClick: handleSubmit(onFinish) }}>
            <Form {...formProps} onFinish={handleSubmit} autoComplete="off" layout="vertical">
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Controller<TaskCreateValidator>
                            name={'name'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskCreateValidator>
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
                        <Controller<TaskCreateValidator>
                            name={'cron'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskCreateValidator>
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
                    <Col sm={4} md={2}>
                        <Controller<TaskCreateValidator>
                            name={'isEnable'}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Item<TaskCreateValidator>
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
                        <Controller<TaskCreateValidator>
                            name={'method'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskCreateValidator>
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
                        <Controller<TaskCreateValidator>
                            name={'timezone'}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                                <Item<TaskCreateValidator>
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

                <Controller<TaskCreateValidator>
                    name={'endpoint'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskCreateValidator>
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
                <Controller<TaskCreateValidator>
                    name={'note'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskCreateValidator>
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
                <Controller<TaskCreateValidator>
                    name={'headers'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskCreateValidator>
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
                <Controller<TaskCreateValidator>
                    name={'body'}
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                        <Item<TaskCreateValidator>
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
        </Create>
    );
}
