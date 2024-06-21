'use client';

import Link from 'next/link';
import { Descriptions, Typography, Button } from 'antd';
import { ExportButton, Show } from '@refinedev/antd';
import { useExport, useShow } from '@refinedev/core';
import { FileProtectOutlined } from '@ant-design/icons';

import { type TaskDto } from '~be/app/tasks/dtos';
import { formatDateToHumanReadable } from '~/libs/utils/common';
import { HighlightCode } from '~/components/show';

const { Text } = Typography;

export default function TaskShow() {
    const {
        queryResult: { data: { data: record } = {}, isLoading },
    } = useShow<TaskDto>({});
    const { triggerExport, isLoading: exportLoading } = useExport<TaskDto>({
        maxItemCount: 1,
        filters: [{ field: '_id', operator: 'eq', value: record?._id }],
        mapData: (item) => {
            const { cronHistory, ...rest } = item;
            return rest;
        },
    });

    return (
        <Show
            isLoading={isLoading}
            headerButtons={({ defaultButtons }) => (
                <>
                    {defaultButtons}
                    <Link href={`/tasks/logs/${record?._id}`}>
                        <Button size="middle" type="default">
                            <FileProtectOutlined /> See Logs
                        </Button>
                    </Link>
                    <ExportButton onClick={triggerExport} loading={exportLoading} />
                </>
            )}
        >
            <Descriptions>
                <Descriptions.Item label="ID">
                    <Text copyable>{record?._id.toString()}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Name">{record?.name}</Descriptions.Item>
                <Descriptions.Item label="Cron">
                    <Text copyable>{record?.cron}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Url">
                    <Text copyable>{record?.endpoint}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Method">{record?.method}</Descriptions.Item>
                <Descriptions.Item label="TimeZone">
                    <Text copyable>{record?.timezone}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Note">{record?.note}</Descriptions.Item>
                <Descriptions.Item label="Created At">
                    {record?.createdAt && formatDateToHumanReadable(record?.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                    {record?.updatedAt && formatDateToHumanReadable(record?.updatedAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Headers" span={12}>
                    <HighlightCode source={record?.headers} formatType="json" />
                </Descriptions.Item>
                <Descriptions.Item label="Body" span={12}>
                    <HighlightCode source={record?.body} formatType="markdown" />
                </Descriptions.Item>
            </Descriptions>
        </Show>
    );
}
