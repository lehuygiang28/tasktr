import '~/libs/helper/dayjs';

import { Dispatch, SetStateAction } from 'react';
import { ShowButton } from '@refinedev/antd';
import { SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Space, Table, Typography } from 'antd';
import type { ColumnsType, ColumnType, TableProps } from 'antd/lib/table';
import dayjs, { type Dayjs } from 'dayjs/esm';

import { TaskLogDto } from '~be/app/task-logs';
import { HttpMethodTag } from '../tag/http-method-tag';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { HttpStatusTag } from '../tag/http-status-tag';
import { HttpStatus } from '@nestjs/common/enums';
import { formatDateToHumanReadable, getJitter } from '~/libs/utils/common';
import { DATE_RANGE_SEPARATOR } from '~/constants';

const { Link } = Typography;

export type TaskLogTableProps = {
    tableProps: TableProps<TaskLogDto>;
    setSelectedLog: Dispatch<SetStateAction<TaskLogDto>>;
};

export function TaskLogTable({ tableProps, setSelectedLog }: TaskLogTableProps) {
    const getColumnSearchProps = (dataIndex: keyof TaskLogDto): ColumnType<TaskLogDto> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys: selectedKeys2,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys2[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]
                      .toString()
                      .toLowerCase()
                      .includes(value?.toString().toLowerCase())
                : false,
    });

    const tableColumns: ColumnsType<TaskLogDto> = [
        {
            dataIndex: 'method',
            title: 'Method',
            render: (method) => <HttpMethodTag method={method} />,
            filters: Object.values(HttpMethodEnum).map((value: string) => ({
                value: value,
                text: <HttpMethodTag method={value} />,
            })),
            onFilter: (value, record) => record.method.indexOf(String(value)) === 0,
            sorter: (a, b) => a.method.localeCompare(b.method),
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('method'),
        },
        {
            dataIndex: 'endpoint',
            title: 'Url',
            onFilter: (value, record) => record.endpoint.indexOf(value as string) === 0,
            sorter: (a, b) => a.endpoint.localeCompare(b.endpoint),
            sortDirections: ['descend', 'ascend'],
            render: (_, record) => (
                <Link href={record.endpoint} target="_blank">
                    {record.endpoint.length > 40
                        ? `${record.endpoint.substring(0, 37)}...`
                        : record.endpoint}
                </Link>
            ),
            ...getColumnSearchProps('endpoint'),
        },
        {
            dataIndex: 'statusCode',
            title: 'Status',
            render: (_, record) => <HttpStatusTag statusCode={record.statusCode} />,
            filters: Object.values(HttpStatus).map((value: number) => ({
                value: value,
                text: <HttpStatusTag statusCode={value} />,
            })),
            onFilter: (value, record) => record.statusCode === value,
        },
        {
            dataIndex: 'scheduledAt',
            title: 'Scheduled',
            render: (_, record) => formatDateToHumanReadable(record.scheduledAt),
            sorter: (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
            sortDirections: ['descend', 'ascend'],
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                return (
                    <Space direction="vertical">
                        <DatePicker.RangePicker
                            showTime
                            style={{ marginBottom: 8 }}
                            value={
                                selectedKeys[0] &&
                                selectedKeys[0].toString().includes(DATE_RANGE_SEPARATOR)
                                    ? (selectedKeys[0]
                                          .toString()
                                          .split(DATE_RANGE_SEPARATOR)
                                          .map((d) => dayjs(d)) as [Dayjs, Dayjs])
                                    : null
                            }
                            onChange={(dates) => {
                                if (dates) {
                                    setSelectedKeys([
                                        dayjs(dates[0]).startOf('day').toISOString() +
                                            DATE_RANGE_SEPARATOR +
                                            dayjs(dates[1]).endOf('day').toISOString(),
                                    ]);
                                } else {
                                    setSelectedKeys([]);
                                }
                            }}
                        />
                        <Space>
                            <Button onClick={() => confirm()} type="primary">
                                Search
                            </Button>
                            <Button
                                onClick={() => {
                                    clearFilters();
                                    setSelectedKeys([]);
                                }}
                                type="dashed"
                            >
                                Reset
                            </Button>
                        </Space>
                    </Space>
                );
            },
            onFilter: (value, record) => {
                if (value && value?.toString().includes(DATE_RANGE_SEPARATOR)) {
                    const [start, end] = value.toString().split(DATE_RANGE_SEPARATOR);
                    const scheduledAt = dayjs(record.scheduledAt);
                    return scheduledAt.isAfter(dayjs(start)) && scheduledAt.isBefore(dayjs(end));
                }
                return true;
            },
        },
        {
            dataIndex: 'executedAt',
            title: 'Executed',
            render: (_, record) => formatDateToHumanReadable(record.executedAt),
            sorter: (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime(),
            sortDirections: ['descend', 'ascend'],
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                return (
                    <Space direction="vertical">
                        <DatePicker.RangePicker
                            showTime
                            style={{ marginBottom: 8 }}
                            value={
                                selectedKeys[0] &&
                                selectedKeys[0].toString().includes(DATE_RANGE_SEPARATOR)
                                    ? (selectedKeys[0]
                                          .toString()
                                          .split(DATE_RANGE_SEPARATOR)
                                          .map((d) => dayjs(d)) as [Dayjs, Dayjs])
                                    : null
                            }
                            onChange={(dates) => {
                                if (dates) {
                                    setSelectedKeys([
                                        dayjs(dates[0]).startOf('day').toISOString() +
                                            DATE_RANGE_SEPARATOR +
                                            dayjs(dates[1]).endOf('day').toISOString(),
                                    ]);
                                } else {
                                    setSelectedKeys([]);
                                }
                            }}
                        />
                        <Space>
                            <Button onClick={() => confirm()} type="primary">
                                Search
                            </Button>
                            <Button
                                onClick={() => {
                                    clearFilters();
                                    setSelectedKeys([]);
                                }}
                                type="dashed"
                            >
                                Reset
                            </Button>
                        </Space>
                    </Space>
                );
            },
            onFilter: (value, record) => {
                if (value && value?.toString().includes(DATE_RANGE_SEPARATOR)) {
                    const [start, end] = value.toString().split(DATE_RANGE_SEPARATOR);
                    const executedAt = dayjs(record.executedAt);
                    return executedAt.isAfter(dayjs(start)) && executedAt.isBefore(dayjs(end));
                }
                return true;
            },
        },
        {
            dataIndex: 'jitter',
            title: 'Jitter',
            render: (_, record) => <>{`${getJitter(record)} s`}</>,
            sorter: (a, b) => getJitter(a) - getJitter(b),
            sortDirections: ['descend', 'ascend'],
        },
        {
            dataIndex: 'duration',
            title: 'Duration',
            render: (_, record) => <>{`${record.duration} ms`}</>,
            sorter: (a, b) => a.duration - b.duration,
            sortDirections: ['descend', 'ascend'],
        },
        {
            dataIndex: 'responseSizeBytes',
            title: 'Response Size',
            render: (_, record) => <>{`${(record.responseSizeBytes / 1024).toFixed(2)} KB`}</>,
            sorter: (a, b) => a.responseSizeBytes - b.responseSizeBytes,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (_, record) => (
                <Space>
                    <ShowButton
                        size="small"
                        recordItemId={record._id.toString()}
                        onClick={() => setSelectedLog(record)}
                    >
                        Details
                    </ShowButton>
                </Space>
            ),
        },
    ];

    return (
        <Table<TaskLogDto>
            {...tableProps}
            rowKey="_id"
            pagination={{
                ...tableProps.pagination,
                position: ['topRight', 'bottomRight'],
                size: 'small',
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} logs`,
                defaultPageSize: 5,
                pageSizeOptions: [5, 10, 20, 50, 100, 200, 500],
                showTitle: false,
            }}
            columns={tableColumns}
        />
    );
}
