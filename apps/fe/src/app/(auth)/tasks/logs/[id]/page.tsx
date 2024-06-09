'use client';

import Link from 'next/link';
import { HttpError, useParsed } from '@refinedev/core';
import { List, ShowButton, useTable } from '@refinedev/antd';
import { Breadcrumb, Space, Table, Tag } from 'antd';
import {
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Line,
    Legend,
    Label,
} from 'recharts';
import { format } from 'date-fns';

import { HttpMethodTag } from '~/components/tag/http-method-tag';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { type TaskLogDto } from '~be/app/task-logs';
import { formatDateToHumanReadable, sortArrayByKey } from '~/libs/utils/common';

export default function LogList() {
    const { pathname } = useParsed();
    const {
        tableProps: { pagination, ...tableProps },
        tableQueryResult: { data },
    } = useTable<TaskLogDto, HttpError>({
        resource: `tasks/logs/${pathname?.replace(/\/$/, '')?.split('/')?.pop()}`,
        syncWithLocation: true,
        pagination: {
            mode: 'server',
        },
    });

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link href="/tasks">Tasks</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Link href={`/tasks/show/${pathname?.replace(/\/$/, '')?.split('/')?.pop()}`}>
                        Show
                    </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Task Logs</Breadcrumb.Item>
                <Breadcrumb.Item>{pathname?.replace(/\/$/, '')?.split('/')?.pop()}</Breadcrumb.Item>
            </Breadcrumb>
            <List>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                            data={sortArrayByKey(data?.data, 'executedAt')?.map((log) => ({
                                ...log,
                                executedAt: format(new Date(log.executedAt), 'H:m:s d/M/yy'),
                            }))}
                        >
                            <XAxis
                                dataKey={'executedAt'}
                                name="Executed At"
                                angle={-30}
                                textAnchor="end"
                                label={
                                    <Label
                                        value="Executed At"
                                        position="insideBottom"
                                        offset={-50}
                                        style={{ textAnchor: 'middle' }}
                                    />
                                }
                            />
                            <YAxis
                                dataKey={'duration'}
                                name="Duration"
                                label={{
                                    value: 'Duration',
                                    position: 'insideLeft',
                                    angle: -90,
                                }}
                            />
                            <Legend verticalAlign="top" height={15} />
                            <Line type="monotone" dataKey="duration" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="responseSizeBytes" stroke="#8884d8" />
                            <Tooltip />
                        </LineChart>
                    </ResponsiveContainer>

                    <Table<TaskLogDto>
                        {...tableProps}
                        rowKey="_id"
                        pagination={{
                            ...pagination,
                            position: ['topRight', 'bottomRight'],
                            size: 'small',
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} logs`,
                            defaultPageSize: 5,
                            pageSizeOptions: [5, 10, 20, 50, 100],
                            showTitle: false,
                        }}
                    >
                        <Table.Column<TaskLogDto>
                            dataIndex="method"
                            title={'Method'}
                            render={(method) => <HttpMethodTag method={method} />}
                            filters={Object.values(HttpMethodEnum).map((value: string) => ({
                                value: value,
                                text: <HttpMethodTag method={value} />,
                            }))}
                            onFilter={(value, record) => record.method.indexOf(String(value)) === 0}
                            sorter={(a: TaskLogDto, b: TaskLogDto) =>
                                a.method.localeCompare(b.method)
                            }
                            sortDirections={['descend', 'ascend']}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="endpoint"
                            title={'Url'}
                            onFilter={(value, record) =>
                                record.endpoint.indexOf(value as string) === 0
                            }
                            sorter={(a: TaskLogDto, b: TaskLogDto) =>
                                a.endpoint.localeCompare(b.endpoint)
                            }
                            sortDirections={['descend', 'ascend']}
                            render={(_, record: TaskLogDto) => (
                                <Link href={record.endpoint} target="_blank">
                                    {record.endpoint.length > 40
                                        ? `${record.endpoint.substring(0, 37)}...`
                                        : record.endpoint}
                                </Link>
                            )}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="statusCode"
                            title={'Status'}
                            render={(_, record) => {
                                let color = 'green';
                                if (record.statusCode >= 400 && record.statusCode < 500) {
                                    color = 'orange';
                                } else if (record.statusCode >= 500 || record.statusCode === 0) {
                                    color = 'red';
                                }
                                return <Tag color={color}>{record.statusCode}</Tag>;
                            }}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="executedAt"
                            title={'Executed'}
                            render={(_, record) => formatDateToHumanReadable(record.executedAt)}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="scheduledAt"
                            title={'Scheduled'}
                            render={(_, record) => formatDateToHumanReadable(record.scheduledAt)}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="jitter"
                            title={'Jitter'}
                            render={(_, record) => {
                                const diff =
                                    (new Date(record.executedAt).getTime() -
                                        new Date(record?.scheduledAt).getTime()) /
                                    1000;
                                return <>{`${diff} s`}</>;
                            }}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="duration"
                            title={'Duration'}
                            render={(_, record) => <>{`${record.duration} ms`}</>}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="responseSizeBytes"
                            title={'Response Size'}
                            render={(_, record) => (
                                <>{`${(record.responseSizeBytes / 1024).toFixed(2)} KB`}</>
                            )}
                        />
                        <Table.Column
                            title={'Actions'}
                            dataIndex="actions"
                            render={(_, record: TaskLogDto) => (
                                <Space>
                                    <ShowButton size="small" recordItemId={record._id.toString()}>
                                        Details
                                    </ShowButton>
                                </Space>
                            )}
                        />
                    </Table>
                </Space>
            </List>
        </>
    );
}
