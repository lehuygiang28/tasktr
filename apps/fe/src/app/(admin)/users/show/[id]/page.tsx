'use client';

import { Descriptions, Tag, Typography, Image, Row, Col } from 'antd';
import { Show } from '@refinedev/antd';
import { useShow } from '@refinedev/core';

import { type UserDto } from '~be/app/users/dtos';
import { formatDateToHumanReadable } from '~/libs/utils/common';

const { Text } = Typography;

export default function UserShow() {
    const {
        queryResult: { data: { data: record } = {}, isLoading },
    } = useShow<UserDto>({});

    return (
        <Show isLoading={isLoading} headerButtons={({ defaultButtons }) => <>{defaultButtons}</>}>
            <div>
                <Row style={{ width: '100%' }}>
                    <Col xs={24} md={4}>
                        <Image src={record?.avatar.url} width={100} alt="user avatar" />
                    </Col>
                    <Col xs={24} md={18}>
                        <Descriptions>
                            <Descriptions.Item label="ID">
                                <Text copyable>{record?._id.toString()}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Full Name">
                                {record?.fullName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <Text copyable>{record?.email}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email Verified">
                                <Tag color={record?.emailVerified ? 'green' : 'red'}>
                                    {record?.emailVerified ? 'verified' : 'unverified'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Role">
                                <Tag color={record?.role === 'admin' ? 'geekblue' : 'green'}>
                                    {record?.role}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                {record?.createdAt && formatDateToHumanReadable(record?.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Updated At">
                                {record?.updatedAt && formatDateToHumanReadable(record?.updatedAt)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </div>
        </Show>
    );
}
