'use client';

import { useContext, useEffect, useState } from 'react';
import { Descriptions, Typography, Spin, Button } from 'antd';
import { Show } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Highlight, themes } from 'prism-react-renderer';
import { format } from 'prettier';
import * as prettierBabel from 'prettier/plugins/babel';
import * as prettierMd from 'prettier/plugins/markdown';
import * as prettierEstree from 'prettier/plugins/estree';

import { type TaskDto } from '~be/app/tasks/dtos';
import { ColorModeContext } from '~/contexts/color-mode';
import { formatDateToHumanReadable } from '~/libs/utils/common';
import Link from 'next/link';
import { FileProtectOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function TaskShow() {
    const { mode } = useContext(ColorModeContext);
    const {
        queryResult: { data: { data: record } = {}, isLoading },
    } = useShow<TaskDto>({});

    const [formattedHeaders, setFormattedHeaders] = useState<string | null>(null);
    const [formattedBody, setFormattedBody] = useState<string | null>(null);
    const [formatting, setFormatting] = useState(false);

    useEffect(() => {
        const formatCode = async () => {
            setFormatting(true);
            if (record?.headers) {
                const formatted = await format(record.headers, {
                    plugins: [prettierEstree, prettierBabel],
                    parser: 'json-stringify',
                });
                setFormattedHeaders(formatted);
            }
            if (record?.body) {
                const formatted = await format(record.body, {
                    plugins: [prettierEstree, prettierMd],
                    parser: 'markdown',
                });
                setFormattedBody(formatted);
            }
            setFormatting(false);
        };

        formatCode();
    }, [record?.headers, record?.body]);

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
                    {formatting ? (
                        <Spin />
                    ) : (
                        <>
                            <Highlight
                                theme={mode === 'light' ? themes.duotoneLight : themes.vsDark}
                                code={formattedHeaders ?? '// empty'}
                                language="ts"
                            >
                                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                    <pre style={{ ...style, whiteSpace: 'pre-wrap' }}>
                                        {tokens.map((line, i) => (
                                            <div key={i} {...getLineProps({ line })}>
                                                {line.map((token, key) => (
                                                    <span key={key} {...getTokenProps({ token })} />
                                                ))}
                                            </div>
                                        ))}
                                    </pre>
                                )}
                            </Highlight>
                        </>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Body" span={12}>
                    {formatting ? (
                        <Spin />
                    ) : (
                        <Highlight
                            theme={mode === 'light' ? themes.duotoneLight : themes.vsDark}
                            code={formattedBody ?? '// empty'}
                            language="ts"
                        >
                            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                <pre style={{ ...style, whiteSpace: 'pre-wrap' }}>
                                    {tokens.map((line, i) => (
                                        <div key={i} {...getLineProps({ line })}>
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token })} />
                                            ))}
                                        </div>
                                    ))}
                                </pre>
                            )}
                        </Highlight>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Show>
    );
}
