'use client';

import { Layout, Button, Typography, Row, Col, Space, Card } from 'antd';
import {
    FieldTimeOutlined,
    MonitorOutlined,
    RocketOutlined,
    FileDoneOutlined,
} from '@ant-design/icons';
import { TypeAnimation } from 'react-type-animation';
import Link from 'next/link';
import AnimatedCard, { type CardData } from '~/components/card/animated-card';

const { Content } = Layout;
const { Title } = Typography;

const cardData: CardData[] = [
    {
        icon: <FieldTimeOutlined />,
        title: 'Job Scheduling',
        description: 'Schedule jobs by using cron expression or interval.',
    },
    {
        icon: <FileDoneOutlined />,
        title: 'Access to logs',
        description: 'Easy access to your logs. View logs in real time.',
    },
    {
        icon: <MonitorOutlined />,
        title: 'Job Monitoring',
        description: 'Set up uptime and running time monitoring for jobs.',
    },
    {
        icon: <RocketOutlined />,
        title: 'Metric insights',
        description: 'Get rich analytics on critical metrics of your tasks.',
    },
];

export default function HomePageContent() {
    return (
        <Content style={{ marginTop: '35px', width: '100%' }}>
            <Space size={150} direction="vertical" style={{ alignItems: 'center', width: '100%' }}>
                <Row justify="center">
                    <Col xs={30} sm={30} md={24} lg={18} xl={16}>
                        <Card
                            style={{
                                textAlign: 'center',
                                marginTop: '50px',
                                border: 'none',
                                backgroundColor: 'transparent',
                            }}
                        >
                            <Title level={1}>
                                Task-to-run: The Simple Way to Schedule and Execute Any Task
                            </Title>
                            <Title level={5}>
                                <TypeAnimation
                                    sequence={[
                                        'Your tasks, on autopilot',
                                        1500,
                                        'Your tasks, under control',
                                        1500,
                                        'Your tasks, with ease by TaskTr',
                                        1500,
                                    ]}
                                    speed={50}
                                    style={{ fontSize: '1.7em', fontWeight: 'lighter' }}
                                    repeat={Infinity}
                                    wrapper="p"
                                />
                            </Title>
                            <Space direction="vertical" size="large">
                                <Link href={'/tasks'} style={{ all: 'unset' }}>
                                    <Button type="primary" size="large">
                                        Schedule Your First Task Now
                                    </Button>
                                </Link>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Space size={40} direction="vertical">
                    <Row justify={'center'}>
                        <Title level={2}>What we have?</Title>
                    </Row>
                    <Row justify={'center'} gutter={[16, 16]}>
                        {cardData.map((data, index) => (
                            <Col key={index} xs={24} sm={24} md={18} lg={12} xl={10}>
                                <AnimatedCard data={data} />
                            </Col>
                        ))}
                    </Row>
                </Space>

                <Row justify="center">
                    <Col xs={30} sm={30} md={24} lg={18} xl={16}>
                        <Card
                            style={{
                                textAlign: 'center',
                                marginTop: '50px',
                                border: 'none',
                                backgroundColor: 'transparent',
                            }}
                        >
                            <Title level={2}>
                                Let&apos;s get your first scheduler up and running.It takes less
                                than a minute.
                            </Title>
                            <Title level={4}>Your tasks, on autopilot</Title>
                            <Space direction="vertical" size="large">
                                <Link href={'/tasks'} style={{ all: 'unset' }}>
                                    <Button type="primary" size="large">
                                        Get Started for Free
                                    </Button>
                                </Link>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </Content>
    );
}
