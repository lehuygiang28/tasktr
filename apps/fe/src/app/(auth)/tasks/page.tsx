'use client';

import { DeleteButton, EditButton, List, ShowButton, useTable } from '@refinedev/antd';
import { Space, Table } from 'antd';

import { type TaskDto } from '~be/app/tasks/dtos';

export default function TaskList() {
    const { tableProps } = useTable<TaskDto>({
        syncWithLocation: true,
    });

    return (
        <List>
            <Table<TaskDto> {...tableProps} rowKey="_id">
                <Table.Column dataIndex="name" title={'name'} />
                <Table.Column dataIndex="method" title={'method'} />
                <Table.Column dataIndex="cron" title={'cron'} />
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
