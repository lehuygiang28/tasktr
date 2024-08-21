'use client';

import Link from 'next/link';
import { HttpError, useParsed, useInvalidate } from '@refinedev/core';
import { List, ShowButton, useTable, RefreshButton } from '@refinedev/antd';
import { Breadcrumb, Grid, Space, Table } from 'antd';
import { format } from 'date-fns/format';
import { useState } from 'react';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ChartData,
    PointElement,
    LineElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HttpStatus } from '@nestjs/common';

import { HttpMethodTag } from '~/components/tag/http-method-tag';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { type TaskLogDto } from '~be/app/task-logs';
import { formatDateToHumanReadable, getJitter, sortArrayByKey } from '~/libs/utils/common';
import { HttpStatusTag } from '~/components/tag/http-status-tag';
import { TaskLogsModal } from '~/components/modal';

ChartJS.register(LineElement, PointElement, Title, Tooltip, Legend);
const { useBreakpoint } = Grid;

export default function LogList() {
    const screens = useBreakpoint();
    const { pathname } = useParsed();
    const id = pathname?.replace(/\/$/, '')?.split('/')?.pop();
    const {
        tableProps: { pagination, ...tableProps },
        tableQueryResult: { data },
    } = useTable<TaskLogDto, HttpError>({
        resource: `tasks/logs/${id}`,
        syncWithLocation: true,
        pagination: {
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [
                {
                    field: 'executedAt',
                    order: 'desc',
                },
            ],
        },
    });
    const invalidate = useInvalidate();

    const [selectedLog, setSelectedLog] = useState<TaskLogDto | null>(null);

    const ascSortedData = sortArrayByKey(data?.data, 'executedAt', 'asc');
    const chartData: ChartData<'line'> = {
        labels: ascSortedData?.map((log) => format(new Date(log.executedAt), 'HH:mm:ss dd/MM/yy')),
        datasets: [
            {
                label: 'Duration',
                data: ascSortedData?.map((log) => log.timings?.total),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Wait',
                data: ascSortedData?.map((log) => log.timings?.wait),
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'DNS',
                data: ascSortedData?.map((log) => log.timings?.dns),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'TCP',
                data: ascSortedData?.map((log) => log.timings?.tcp),
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'TLS',
                data: ascSortedData?.map((log) => log.timings?.tls),
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Request',
                data: ascSortedData?.map((log) => log.timings?.request),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'First Byte',
                data: ascSortedData?.map((log) => log.timings?.firstByte),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Download',
                data: ascSortedData?.map((log) => log.timings?.download),
                borderColor: 'rgb(201, 203, 207)',
                backgroundColor: 'rgba(201, 203, 207, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Response Size (KB)',
                data: ascSortedData?.map((log) => Number(log.responseSizeBytes / 1024)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y1',
            },
        ],
    };

    return (
        <>
            <List
                title="Task Logs"
                breadcrumb={
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link href="/tasks">Tasks</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link
                                href={`/tasks/show/${pathname?.replace(/\/$/, '')?.split('/')?.pop()}`}
                            >
                                Show
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Task Logs</Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {pathname?.replace(/\/$/, '')?.split('/')?.pop()}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                }
                canCreate={false}
                headerButtons={({ defaultButtons }) => (
                    <>
                        {defaultButtons}
                        <RefreshButton
                            onClick={() =>
                                invalidate({
                                    resource: `tasks/logs/${id}`,
                                    invalidates: ['list'],
                                })
                            }
                        />
                    </>
                )}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    {screens.md && (
                        <Line
                            style={{ width: '100%', maxHeight: '500px' }}
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    title: {
                                        text: 'Task execution timings and size response',
                                        display: true,
                                    },
                                    legend: {
                                        position: 'top' as const,
                                    },
                                    tooltip: {
                                        mode: 'index',
                                    },
                                },
                                scales: {
                                    y: {
                                        type: 'linear',
                                        display: true,
                                        position: 'left' as const,
                                        title: {
                                            display: true,
                                            text: 'Timings (ms)',
                                        },
                                    },
                                    y1: {
                                        type: 'linear',
                                        display: true,
                                        position: 'right' as const,
                                        title: {
                                            display: true,
                                            text: 'Response Size (KB)',
                                        },
                                    },
                                },
                                interaction: {
                                    mode: 'index',
                                    intersect: false,
                                },
                                animation: {
                                    duration: 1000,
                                    easing: 'easeOutQuart',
                                },
                            }}
                        />
                    )}

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
                            render={(_, record) => <HttpStatusTag statusCode={record.statusCode} />}
                            filters={Object.values(HttpStatus).map((value: number) => ({
                                value: value,
                                text: <HttpStatusTag statusCode={value} />,
                            }))}
                            onFilter={(value, record) => record.statusCode === value}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="executedAt"
                            title={'Executed'}
                            render={(_, record) => formatDateToHumanReadable(record.executedAt)}
                            sorter={(a: TaskLogDto, b: TaskLogDto) =>
                                new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
                            }
                            sortDirections={['descend', 'ascend']}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="scheduledAt"
                            title={'Scheduled'}
                            render={(_, record) => formatDateToHumanReadable(record.scheduledAt)}
                            sorter={(a: TaskLogDto, b: TaskLogDto) =>
                                new Date(a.scheduledAt).getTime() -
                                new Date(b.scheduledAt).getTime()
                            }
                            sortDirections={['descend', 'ascend']}
                        />
                        <Table.Column<TaskLogDto>
                            dataIndex="jitter"
                            title={'Jitter'}
                            render={(_, record) => <>{`${getJitter(record)} s`}</>}
                            sorter={(a: TaskLogDto, b: TaskLogDto) => getJitter(a) - getJitter(b)}
                            sortDirections={['descend', 'ascend']}
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
                                    <ShowButton
                                        size="small"
                                        recordItemId={record._id.toString()}
                                        onClick={() => setSelectedLog(record)}
                                    >
                                        Details
                                    </ShowButton>
                                </Space>
                            )}
                        />
                    </Table>
                </Space>
            </List>
            <TaskLogsModal type="logs" selectedLog={selectedLog} setSelectedLog={setSelectedLog} />
        </>
    );
}
