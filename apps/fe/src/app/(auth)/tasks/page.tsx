'use client';

import { useUpdate } from '@refinedev/core';
import { DeleteButton, EditButton, List, ShowButton, useTable } from '@refinedev/antd';
import { Space, Table, Switch, Typography } from 'antd';
import { toString as cronReadable } from 'cronstrue';

import { type TaskDto } from '~be/app/tasks/dtos';
import { useDebouncedCallback } from '~/hooks/useDebouncedCallback';
import { HttpMethodTag } from '~/components/tag/http-method-tag';

const { Text } = Typography;

export default function TaskList() {
    const { tableProps } = useTable<TaskDto>({
        syncWithLocation: true,
    });

    const { mutate: update } = useUpdate<TaskDto>({});

    const debouncedUpdate = useDebouncedCallback(update, 200);

    return (
        <List>
            <Table<TaskDto> {...tableProps} rowKey="_id">
                <Table.Column dataIndex="name" title={'Name'} />
                <Table.Column
                    dataIndex="method"
                    title={'Method'}
                    render={(method) => <HttpMethodTag method={method} />}
                />
                <Table.Column
                    dataIndex="cron"
                    title={'Cron'}
                    render={(_, record: TaskDto) => (
                        <>
                            <Space direction="vertical">
                                <Text>{record.cron}</Text>
                                <Text type="secondary">
                                    {cronReadable(record.cron, {
                                        throwExceptionOnParseError: false,
                                        locale: 'en',
                                        use24HourTimeFormat: true,
                                    })}
                                </Text>
                            </Space>
                        </>
                    )}
                />
                <Table.Column
                    dataIndex="isEnable"
                    title={'On/Off'}
                    render={(_, record: TaskDto) => (
                        <Switch
                            onChange={(val) =>
                                debouncedUpdate({
                                    resource: 'tasks',
                                    id: record._id.toString(),
                                    values: { isEnable: val },
                                    mutationMode: 'optimistic',
                                    successNotification: false,
                                })
                            }
                            checked={record.isEnable}
                            checkedChildren={true}
                            unCheckedChildren={false}
                        />
                    )}
                />
                <Table.Column
                    title={'Actions'}
                    dataIndex="actions"
                    render={(_, record: TaskDto) => (
                        <Space>
                            <EditButton
                                hideText
                                size="small"
                                recordItemId={record._id.toString()}
                            />
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record._id.toString()}
                            />
                            <DeleteButton
                                hideText
                                size="small"
                                recordItemId={record._id.toString()}
                            />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
