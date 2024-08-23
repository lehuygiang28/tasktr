'use client';

import {
    Descriptions,
    Tag,
    Typography,
    Image,
    Row,
    Col,
    Button,
    Modal,
    Select,
    Input,
    Divider,
} from 'antd';
import { Show } from '@refinedev/antd';
import { useShow, useUpdate, useGetIdentity, useParsed } from '@refinedev/core';

import type { UserDto, BlockUserDto } from '~be/app/users/dtos';
import { formatDateToHumanReadable } from '~/libs/utils/common';
import { useState } from 'react';
import { BlockLogTable } from '~/components/table/block-log';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DEFAULT_BLOCK_REASON = 'Spam';

export default function UserShow() {
    const { data: me, isLoading: isIdentityLoading } = useGetIdentity<UserDto>();
    const { id } = useParsed();

    const {
        queryResult: { data: { data: record } = {}, isLoading },
    } = useShow<UserDto>({});

    const { mutate } = useUpdate({
        mutationOptions: {},
    });

    const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
    const [isUnblockModalVisible, setIsUnblockModalVisible] = useState(false);
    const [blockReason, setBlockReason] = useState(DEFAULT_BLOCK_REASON);
    const [customReason, setCustomReason] = useState('');

    const handleBlock = (data: BlockUserDto) => {
        mutate({
            resource: 'users/block',
            id: record?._id.toString(),
            values: { ...data, reason: blockReason === 'Other' ? customReason : blockReason },
            invalidates: ['all'],
        });
        setIsBlockModalVisible(false);
    };

    const handleUnblock = () => {
        mutate({
            resource: 'users/unblock',
            id: record?._id.toString(),
            values: {},
            invalidates: ['all'],
        });
        setIsUnblockModalVisible(false);
    };

    const handleBlockReasonChange = (value: string) => {
        setBlockReason(value);
        if (value !== 'Other') {
            setCustomReason('');
        }
    };

    const handleCustomReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomReason(e.target.value);
    };

    const restoreDefault = () => {
        setBlockReason(DEFAULT_BLOCK_REASON);
        setCustomReason('');
        setIsBlockModalVisible(false);
        setIsUnblockModalVisible(false);
    };

    return (
        <Show
            canEdit={false}
            isLoading={isLoading}
            headerButtons={({ defaultButtons }) => (
                <>
                    {defaultButtons}
                    {!isIdentityLoading &&
                        me?._id?.toString() !== id?.toString() &&
                        (record?.block?.isBlocked ? (
                            <Button onClick={() => setIsUnblockModalVisible(true)}>Unblock</Button>
                        ) : (
                            <Button danger onClick={() => setIsBlockModalVisible(true)}>
                                Block
                            </Button>
                        ))}
                </>
            )}
        >
            <>
                <Modal
                    title="Confirm Block"
                    open={isBlockModalVisible}
                    onOk={() => {
                        handleBlock({
                            reason: blockReason === 'Other' ? customReason : blockReason,
                        });
                        restoreDefault();
                    }}
                    onCancel={() => {
                        setIsBlockModalVisible(false);
                        restoreDefault();
                    }}
                    destroyOnClose
                >
                    <p>Are you sure you want to block this user?</p>
                    <Select
                        title="Please select a reason"
                        defaultValue="Select a reason"
                        value={blockReason}
                        onChange={handleBlockReasonChange}
                        style={{ width: '100%' }}
                    >
                        <Option value={DEFAULT_BLOCK_REASON}>{DEFAULT_BLOCK_REASON}</Option>
                        <Option value="Other">Other</Option>
                    </Select>
                    {blockReason === 'Other' && (
                        <TextArea
                            placeholder="Please specify the reason"
                            value={customReason}
                            onChange={handleCustomReasonChange}
                            style={{ marginTop: 16 }}
                        />
                    )}
                </Modal>
                <Modal
                    title="Confirm Unblock"
                    open={isUnblockModalVisible}
                    onOk={() => {
                        handleUnblock();
                        restoreDefault();
                    }}
                    onCancel={() => {
                        setIsUnblockModalVisible(false);
                        restoreDefault();
                    }}
                >
                    <p>Are you sure you want to unblock this user?</p>
                </Modal>
            </>
            <div>
                <Row style={{ width: '100%' }}>
                    <Col xs={24} md={4}>
                        <Image src={record?.avatar?.url} width={100} alt="user avatar" />
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
                            <Descriptions.Item label="Status">
                                <Tag color={record?.block?.isBlocked ? 'red' : 'green'}>
                                    {record?.block?.isBlocked ? 'blocked' : 'active'}
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

                {record?.block?.activityLogs && (
                    <>
                        <Divider orientation="left">Block Logs</Divider>
                        <BlockLogTable logs={record?.block?.activityLogs} />
                    </>
                )}
            </div>
        </Show>
    );
}
