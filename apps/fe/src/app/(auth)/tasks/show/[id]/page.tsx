'use client';

import Link from 'next/link';
import { Descriptions, Typography, Button, Collapse } from 'antd';
import { ExportButton, Show } from '@refinedev/antd';
import { useExport, useShow } from '@refinedev/core';
import { FileProtectOutlined } from '@ant-design/icons';

import { type TaskDto } from '~be/app/tasks/dtos';
import { formatDateToHumanReadable } from '~/libs/utils/common';
import { HighlightCode } from '~/components/show';

const { Text } = Typography;
const { Panel } = Collapse;
const { Item } = Descriptions;

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
                <Item label="ID">
                    <Text copyable>{record?._id.toString()}</Text>
                </Item>
                <Item label="Name">{record?.name}</Item>
                <Item label="Cron">
                    <Text copyable>{record?.cron}</Text>
                </Item>
                <Item label="Url">
                    <Text copyable>{record?.endpoint}</Text>
                </Item>
                <Item label="Method">{record?.method}</Item>
                <Item label="TimeZone">
                    <Text copyable>{record?.timezone}</Text>
                </Item>
                <Item label="Note">{record?.note}</Item>
                <Item label="Created At">
                    {record?.createdAt && formatDateToHumanReadable(record?.createdAt)}
                </Item>
                <Item label="Updated At">
                    {record?.updatedAt && formatDateToHumanReadable(record?.updatedAt)}
                </Item>
                <Item label="Headers" span={12}>
                    <Collapse ghost>
                        <Panel header="Show Headers" key="1">
                            <HighlightCode source={record?.headers} formatType="json" />
                        </Panel>
                    </Collapse>
                </Item>
                <Item label="Body" span={12}>
                    <HighlightCode source={record?.body} formatType="markdown" />
                </Item>
            </Descriptions>
        </Show>
    );
}
