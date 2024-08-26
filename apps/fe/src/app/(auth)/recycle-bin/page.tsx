'use client';

import Link from 'next/link';
import { HttpError } from '@refinedev/core';
import { List, useTable } from '@refinedev/antd';
import { Space, Table, Typography, Button } from 'antd';
import { FileProtectOutlined } from '@ant-design/icons';
import { toString as cronReadable } from 'cronstrue';
import { getSchedule, stringToArray } from 'cron-converter';

import { type TaskDto } from '~be/app/tasks/dtos';
import { HttpMethodTag } from '~/components/tag/http-method-tag';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { HardDeleteTask } from '~/components/button/hard-delete-task';
import { RestoreTask } from '~/components/button/restore-task';

const { Text } = Typography;

interface TableSearch {
    name?: string;
}

export default function TaskList() {
    const {
        tableProps: { pagination, ...tableProps },
    } = useTable<TaskDto, HttpError, TableSearch>({
        resource: 'tasks',
        syncWithLocation: true,
        pagination: {
            mode: 'server',
        },
        filters: {
            mode: 'server',
            initial: [
                {
                    field: 'isDeleted',
                    value: true,
                    operator: 'eq',
                },
            ],
        },
        sorters: {
            mode: 'server',
            initial: [
                {
                    field: 'deletedAt',
                    order: 'desc',
                },
            ],
        },
    });

    return (
        <List>
            <Table<TaskDto>
                {...tableProps}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    position: ['bottomRight'],
                    size: 'small',
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} tasks`,
                    defaultPageSize: 5,
                    pageSizeOptions: [5, 10, 20, 50, 100],
                    showTitle: false,
                }}
            >
                <Table.Column
                    dataIndex="name"
                    title={'Name'}
                    onFilter={(value, record) => record.name.indexOf(value as string) === 0}
                    sorter={(a: TaskDto, b: TaskDto) => a.name.localeCompare(b.name)}
                    sortDirections={['descend', 'ascend']}
                />
                <Table.Column
                    dataIndex="method"
                    title={'Method'}
                    render={(method) => <HttpMethodTag method={method} />}
                    filters={Object.values(HttpMethodEnum).map((value: string) => ({
                        value: value,
                        text: <HttpMethodTag method={value} />,
                    }))}
                    onFilter={(value, record) => record.method.indexOf(String(value)) === 0}
                    sorter={(a: TaskDto, b: TaskDto) => a.method.localeCompare(b.method)}
                    sortDirections={['descend', 'ascend']}
                />
                <Table.Column
                    dataIndex="cron"
                    title={'Cron'}
                    render={(_, record: TaskDto) => (
                        <>
                            <Space direction="vertical">
                                <Text>
                                    <pre style={{ display: 'inline' }}>{record.cron}</pre>
                                </Text>
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
                    filters={[
                        { text: 'More than once a day', value: 'more-once-day' },
                        { text: 'Less than once a day', value: 'less-once-day' },
                        { text: 'Every hour', value: 'hour' },
                        { text: 'Every day', value: 'day' },
                        { text: 'Every week', value: 'week' },
                    ]}
                    onFilter={(value, record) => {
                        const schedule = getSchedule(stringToArray(record.cron));
                        const nextRun1 = schedule.next();
                        const nextRun2 = schedule.next();
                        const diffInHours = Math.abs(nextRun1 - nextRun2) / 36e5;

                        switch (value) {
                            case 'more-once-day':
                                return diffInHours < 24;
                            case 'less-once-day':
                                return diffInHours >= 24;
                            case 'hour':
                                return diffInHours <= 1;
                            case 'day':
                                return diffInHours <= 24 && diffInHours > 1;
                            case 'week':
                                return diffInHours <= 168 && diffInHours > 24;
                            default:
                                return true;
                        }
                    }}
                    sorter={(a: TaskDto, b: TaskDto) => {
                        const scheduleA = getSchedule(stringToArray(a.cron));
                        const scheduleB = getSchedule(stringToArray(b.cron));
                        const nextRunA = scheduleA.next();
                        const nextRunB = scheduleB.next();
                        return nextRunA - nextRunB;
                    }}
                />
                <Table.Column
                    title={'Actions'}
                    dataIndex="actions"
                    render={(_, record: TaskDto) => (
                        <Space>
                            <Link href={`/tasks/logs/${record._id}`}>
                                <Button size="small" type="default">
                                    <FileProtectOutlined />
                                </Button>
                            </Link>
                            <RestoreTask id={record._id?.toString()} />
                            <HardDeleteTask id={record._id?.toString()} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
