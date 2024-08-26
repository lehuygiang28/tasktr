'use client';

import { useOne } from '@refinedev/core';
import { Show, ShowButton } from '@refinedev/antd';
import { Card, List, Typography, Space, Row, Col } from 'antd';

import LoadingPage from '~/app/loading';
import { StatsResponseDto } from '~be/app/stats/dtos';
import { useRouter } from 'next/navigation';
import { formatDateToHumanReadable } from '~/libs/utils/common';
import { HttpStatusTag } from '~/components/tag/http-status-tag';
import { HttpMethodTag } from '~/components/tag/http-method-tag';

const { Title, Text } = Typography;

export default function DashboardPage() {
    const router = useRouter();
    const { data, isLoading } = useOne<StatsResponseDto>({
        id: '',
        resource: 'stats',
    });

    if (isLoading) {
        return <LoadingPage />;
    }

    const { enableTask, disableTask, successRate, failedRate, logs } = data?.data || {
        enableTask: 0,
        disableTask: 0,
        successRate: 0,
        failedRate: 0,
        logs: [],
    };

    const getRateColor = (rate: number) => {
        if (rate > 0.8) {
            return 'green';
        } else if (rate >= 0.5) {
            return 'yellow';
        } else {
            return 'red';
        }
    };

    const cartData = [
        {
            title: 'Enabled Task',
            value: enableTask,
        },
        {
            title: 'Disabled Task',
            value: disableTask,
        },
        {
            title: 'Success Rate',
            value: `${successRate * 100}%`,
            color: getRateColor(successRate),
        },
        {
            title: 'Failed Rate',
            value: `${failedRate * 100}%`,
            color: getRateColor(1 - failedRate), // Invert for failed rate
        },
    ];

    return (
        <Show resource="stats" recordItemId={''}>
            <Space direction="vertical" style={{ width: '100%' }} size={'large'}>
                <Row gutter={[16, 16]} justify="center">
                    {cartData.map((data, index) => (
                        <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Card style={{ width: '100%', textAlign: 'center' }} hoverable>
                                <Title level={4} style={{ color: data?.color }}>
                                    {data?.value}
                                </Title>
                                <Title level={5}>{data?.title}</Title>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <List
                    header={<Title level={4}>Last Logs</Title>}
                    itemLayout="horizontal"
                    dataSource={logs}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                title={
                                    <Text strong>
                                        <HttpMethodTag method={item.method} /> {item.endpoint}
                                    </Text>
                                }
                                description={
                                    <>
                                        <div>
                                            Status: <HttpStatusTag statusCode={item.statusCode} />
                                        </div>
                                        <div>
                                            Executed At:{' '}
                                            {formatDateToHumanReadable(item.executedAt)}
                                        </div>
                                    </>
                                }
                            />
                            <ShowButton
                                hideText
                                size="small"
                                onClick={() => router.push(`/tasks/logs/${item.taskId.toString()}`)}
                            />
                        </List.Item>
                    )}
                />
            </Space>
        </Show>
    );
}
