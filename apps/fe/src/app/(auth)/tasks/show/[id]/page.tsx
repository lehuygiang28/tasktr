'use client';

import { useContext } from 'react';
import { Descriptions, Typography } from 'antd';
import { Show } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { CodeBlock } from 'react-code-blocks';

import { type TaskDto } from '~be/app/tasks/dtos';
import { ColorModeContext } from '~/contexts/color-mode';
import { formatDateToHumanReadable } from '~/libs/utils/common';

const { Text } = Typography;

export default function TaskShow() {
    const { queryResult } = useShow<TaskDto>({});
    const { data, isLoading } = queryResult;
    const { mode } = useContext(ColorModeContext);

    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
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
                    <>
                        <CodeBlock
                            text={record?.headers ? record.headers : '// empty'}
                            language={'json'}
                            showLineNumbers={false}
                            theme={{ mode: mode === 'light' ? 'light' : 'dark' }}
                        />
                    </>
                </Descriptions.Item>
                <Descriptions.Item label="Body" span={12}>
                    <>
                        <CodeBlock
                            text={record?.body ? record.body : '// empty'}
                            language={'json'}
                            showLineNumbers={false}
                            theme={{ mode: mode === 'light' ? 'light' : 'dark' }}
                        />
                    </>
                </Descriptions.Item>
            </Descriptions>
        </Show>
    );
}
