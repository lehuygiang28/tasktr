'use client';

import { useUpdate } from '@refinedev/core';
import { DeleteButton, EditButton, List, ShowButton, useTable } from '@refinedev/antd';
import { Space, Table, Switch } from 'antd';

import { type TaskDto } from '~be/app/tasks/dtos';
import { useDebouncedCallback } from '~/hooks/useDebouncedCallback';

export default function TaskList() {
    const { tableProps } = useTable<TaskDto>({
        syncWithLocation: true,
    });

    const { mutate: update } = useUpdate<TaskDto>({
        mutationOptions: {
            cacheTime: 1000,
        },
    });

    const debouncedUpdate = useDebouncedCallback(update, 200);

    return (
        <List>
            <Table<TaskDto> {...tableProps} rowKey="_id">
                <Table.Column dataIndex="name" title={'Name'} />
                <Table.Column dataIndex="method" title={'Method'} />
                <Table.Column dataIndex="cron" title={'Cron Expression'} />
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
