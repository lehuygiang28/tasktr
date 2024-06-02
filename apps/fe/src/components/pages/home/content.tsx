'use client';

import { Layout, Button, Typography, Row, Col, Space, Card } from 'antd';
import {
    FieldTimeOutlined,
    MonitorOutlined,
    RocketOutlined,
    FileDoneOutlined,
} from '@ant-design/icons';
import { TypeAnimation } from 'react-type-animation';

const { Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

interface CardData {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const cardData: CardData[] = [
    {
        icon: <FieldTimeOutlined />,
        title: 'Job Scheduling',
        description: 'Schedule jobs by using any time interval or cron expression.',
    },
    {
        icon: <MonitorOutlined />,
        title: 'Job Monitoring',
        description: 'Set up one-click uptime and running time monitoring for your recurring jobs.',
    },
    {
        icon: <RocketOutlined />,
        title: 'Metric insights',
        description: 'Get rich analytics on critical metrics of your jobs and monitors.',
    },
    {
        icon: <FileDoneOutlined />,
        title: 'Access to logs',
        description: 'Easy access to your logs. All in one place nicely organized.',
    },
];

export default function HomePageContent() {
    return (
        <Content style={{ marginTop: '35px' }}>
            <Space
                size={100}
                direction="vertical"
                style={{ justifySelf: 'center', alignItems: 'center' }}
            >
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
                                <Button type="primary" size="large">
                                    Get Started for Free
                                </Button>
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
                                <Card
                                    style={{
                                        marginTop: '20px',
                                        maxWidth: '80%',
                                        justifyContent: 'center',
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                    }}
                                >
                                    <Meta
                                        avatar={data.icon}
                                        title={data.title}
                                        description={data.description}
                                    />
                                </Card>
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
                                <Button type="primary" size="large">
                                    Get Started for Free
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </Content>
    );
}
