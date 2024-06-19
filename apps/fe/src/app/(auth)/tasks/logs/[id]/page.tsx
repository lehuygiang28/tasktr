'use client';

import Link from 'next/link';
import { HttpError, useParsed } from '@refinedev/core';
import { List, ShowButton, useTable } from '@refinedev/antd';
import { Breadcrumb, Space, Table, Modal, Typography, Descriptions } from 'antd';
import { format } from 'date-fns';
import { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    PointElement,
    LineElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import { HttpMethodTag } from '~/components/tag/http-method-tag';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { type TaskLogDto } from '~be/app/task-logs';
import { formatDateToHumanReadable, sortArrayByKey } from '~/libs/utils/common';
import { HttpStatusTag } from '~/components/tag/http-status-tag';

const { Title: TextTitle, Text } = Typography;
const { Item: DesItem } = Descriptions;

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    BarElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
);

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

    const [selectedLog, setSelectedLog] = useState<TaskLogDto | null>(null);

    const sortedData = sortArrayByKey(data?.data, 'executedAt');
    const chartData: ChartData<'line'> = {
        labels: sortedData?.map((log) => format(new Date(log.executedAt), 'HH:mm:ss dd/MM/yy')),
        datasets: [
            {
                label: 'Duration',
                data: sortedData?.map((log) => log.timings?.total),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Wait',
                data: sortedData?.map((log) => log.timings?.wait),
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'DNS',
                data: sortedData?.map((log) => log.timings?.dns),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'TCP',
                data: sortedData?.map((log) => log.timings?.tcp),
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'TLS',
                data: sortedData?.map((log) => log.timings?.tls),
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Request',
                data: sortedData?.map((log) => log.timings?.request),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'First Byte',
                data: sortedData?.map((log) => log.timings?.firstByte),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Download',
                data: sortedData?.map((log) => log.timings?.download),
                borderColor: 'rgb(201, 203, 207)',
                backgroundColor: 'rgba(201, 203, 207, 0.5)',
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Response Size (KB)',
                data: sortedData?.map((log) => Number(log.responseSizeBytes / 1024)),
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
            >
                <Space direction="vertical" style={{ width: '100%' }}>
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
            <Modal
                open={!!selectedLog}
                onCancel={() => setSelectedLog(null)}
                footer={null}
                width={'70%'}
            >
                {selectedLog && (
                    <div>
                        <Space direction="vertical">
                            <Descriptions
                                layout="vertical"
                                title={<TextTitle level={3}>Task Log Details</TextTitle>}
                            >
                                <DesItem label="ID">
                                    <Text>{selectedLog._id.toString()}</Text>
                                </DesItem>
                                <DesItem label="Task ID">
                                    <Text>{selectedLog.taskId.toString()}</Text>
                                </DesItem>
                                <DesItem label="Endpoint">
                                    <Text>{selectedLog.endpoint}</Text>
                                </DesItem>
                                <DesItem label="Method">{selectedLog.method}</DesItem>
                                <DesItem label="Status Code">{selectedLog.statusCode}</DesItem>
                                <DesItem label="Worker Name">
                                    <Text>{selectedLog.workerName}</Text>
                                </DesItem>
                            </Descriptions>

                            <Descriptions
                                layout="vertical"
                                title={<TextTitle level={3}>Timings</TextTitle>}
                            >
                                <DesItem label="Executed At">
                                    <Text>{formatDateToHumanReadable(selectedLog.executedAt)}</Text>
                                </DesItem>
                                <DesItem label="Scheduled At">
                                    <Text>
                                        {formatDateToHumanReadable(selectedLog.scheduledAt)}
                                    </Text>
                                </DesItem>
                                <DesItem label="Duration">
                                    <Text>{selectedLog.timings?.total} ms</Text>
                                </DesItem>
                                <DesItem label="Response Size">
                                    <Text>
                                        {(selectedLog.responseSizeBytes / 1024).toFixed(2)} KB
                                    </Text>
                                </DesItem>
                            </Descriptions>

                            {selectedLog.timings && (
                                <div
                                    style={{
                                        maxHeight: '400px',
                                        maxWidth: '100%',
                                        marginBottom: 20,
                                    }}
                                >
                                    <Typography.Title level={5}>Detailed Timings</Typography.Title>
                                    <div style={{ height: '70%', width: '100%' }}>
                                        <Bar
                                            data={{
                                                labels: ['Duration (ms)'],
                                                datasets: [
                                                    {
                                                        label: 'Wait Time',
                                                        data: [selectedLog.timings.wait],
                                                        backgroundColor: 'rgb(255, 99, 132)',
                                                        stack: 'timings',
                                                    },
                                                    {
                                                        label: 'DNS Lookup',
                                                        data: [selectedLog.timings.dns],
                                                        backgroundColor: 'rgb(255, 159, 64)',
                                                        stack: 'timings',
                                                    },
                                                    {
                                                        label: 'TCP Connection',
                                                        data: [selectedLog.timings.tcp],
                                                        backgroundColor: 'rgb(255, 205, 86)',
                                                        stack: 'timings',
                                                    },
                                                    {
                                                        label: 'TLS Handshake',
                                                        data: [selectedLog.timings.tls],
                                                        backgroundColor: 'rgb(75, 192, 192)',
                                                        stack: 'timings',
                                                    },
                                                    {
                                                        label: 'Request Time',
                                                        data: [selectedLog.timings.request],
                                                        backgroundColor: 'rgb(54, 162, 235)',
                                                        stack: 'timings',
                                                    },
                                                    {
                                                        label: 'Time to First Byte',
                                                        data: [selectedLog.timings.firstByte],
                                                        backgroundColor: 'rgb(153, 102, 255)',
                                                        stack: 'timings',
                                                    },
                                                    {
                                                        label: 'Download Time',
                                                        data: [selectedLog.timings.download],
                                                        backgroundColor: 'rgb(201, 203, 207)',
                                                        stack: 'timings',
                                                    },
                                                    {
                                                        label: 'Total',
                                                        data: [selectedLog.timings.total],
                                                        backgroundColor: 'rgb(0, 128, 0)',
                                                    },
                                                ],
                                            }}
                                            options={{
                                                indexAxis: 'y',
                                                responsive: true,
                                                scales: {
                                                    x: {
                                                        stacked: true,
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        display: true,
                                                    },
                                                    tooltip: {
                                                        mode: 'index',
                                                        intersect: false,
                                                    },
                                                },
                                                maintainAspectRatio: false,
                                                hover: {
                                                    mode: 'index',
                                                    intersect: false,
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </Space>
                    </div>
                )}
            </Modal>
        </>
    );
}
