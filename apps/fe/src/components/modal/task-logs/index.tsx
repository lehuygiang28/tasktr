'use client';

import { Space, Modal, Typography, Descriptions, Collapse } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { type TaskLogDto } from '~be/app/task-logs';
import { type TryRequestResponseDto } from '~be/app/tasks/dtos';
import { HttpMethodTag } from '~/components/tag/http-method-tag';
import { camelCaseToCapitalizedWords, formatDateToHumanReadable } from '~/libs/utils/common';
import { HttpStatusTag } from '~/components/tag/http-status-tag';
import { HighlightCode } from '~/components/show';

const { Title: TextTitle, Text } = Typography;
const { Item: DesItem } = Descriptions;

ChartJS.register(BarElement, LinearScale, CategoryScale);

export type TaskLogsModalProps =
    | {
          type: 'logs';
          selectedLog: TaskLogDto | null;
          setSelectedLog: (log: TaskLogDto | null) => void;
      }
    | {
          type: 'test';
          selectedLog: TryRequestResponseDto | null;
          setSelectedLog: (log: TryRequestResponseDto | null) => void;
      };

export function TaskLogsModal({ type, selectedLog, setSelectedLog }: TaskLogsModalProps) {
    const isLogs = type === 'logs';

    return (
        <>
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
                                title={
                                    <TextTitle level={3}>
                                        {isLogs ? 'Task Log Details' : 'Try Request Response'}
                                    </TextTitle>
                                }
                            >
                                {isLogs && (
                                    <>
                                        <DesItem label="ID">
                                            <Text>{selectedLog._id.toString()}</Text>
                                        </DesItem>
                                        <DesItem label="Task ID">
                                            <Text>{selectedLog.taskId.toString()}</Text>
                                        </DesItem>
                                    </>
                                )}

                                <DesItem label="Endpoint">
                                    <Text>{selectedLog.endpoint}</Text>
                                </DesItem>
                                <DesItem label="Method">
                                    <HttpMethodTag method={selectedLog.method} />
                                </DesItem>
                                <DesItem label="Status Code">
                                    <HttpStatusTag statusCode={selectedLog.statusCode} />
                                </DesItem>

                                {isLogs && (
                                    <DesItem label="Worker Name">
                                        <Text>{selectedLog.workerName}</Text>
                                    </DesItem>
                                )}

                                {selectedLog?.request && (
                                    <DesItem label="Request" span={3}>
                                        <Collapse
                                            items={[
                                                {
                                                    key: 'request-headers',
                                                    label: 'Headers',
                                                    children: (
                                                        <HighlightCode
                                                            source={JSON.stringify(
                                                                selectedLog.request?.headers,
                                                            )}
                                                            formatType="json"
                                                        />
                                                    ),
                                                },
                                                {
                                                    key: 'request-body',
                                                    label: 'Body',
                                                    children: (
                                                        <HighlightCode
                                                            source={selectedLog.request?.body}
                                                            formatType="auto"
                                                        />
                                                    ),
                                                },
                                            ]}
                                        />
                                    </DesItem>
                                )}

                                {selectedLog?.response && (
                                    <DesItem label="Response" span={3}>
                                        <Collapse
                                            items={[
                                                {
                                                    key: 'response-headers',
                                                    label: 'Headers',
                                                    children: (
                                                        <HighlightCode
                                                            source={JSON.stringify(
                                                                selectedLog.response?.headers,
                                                            )}
                                                            formatType="json"
                                                        />
                                                    ),
                                                },
                                                {
                                                    key: 'response-body',
                                                    label: 'Body',
                                                    children: (
                                                        <HighlightCode
                                                            source={selectedLog.response?.body}
                                                            formatType="auto"
                                                        />
                                                    ),
                                                },
                                            ]}
                                        />
                                    </DesItem>
                                )}
                            </Descriptions>

                            {selectedLog?.errorMessage && (
                                <Descriptions
                                    layout="horizontal"
                                    title={<TextTitle level={3}>Error</TextTitle>}
                                >
                                    <DesItem label="Message">
                                        <Text type="danger">{selectedLog.errorMessage}</Text>
                                    </DesItem>
                                </Descriptions>
                            )}

                            {selectedLog?.timings && (
                                <>
                                    <Descriptions
                                        layout="horizontal"
                                        title={<TextTitle level={3}>Timings</TextTitle>}
                                    >
                                        {isLogs && (
                                            <>
                                                <DesItem label="Executed At">
                                                    <Text>
                                                        {formatDateToHumanReadable(
                                                            selectedLog.executedAt,
                                                        )}
                                                    </Text>
                                                </DesItem>
                                                <DesItem label="Scheduled At">
                                                    <Text>
                                                        {formatDateToHumanReadable(
                                                            selectedLog.scheduledAt,
                                                        )}
                                                    </Text>
                                                </DesItem>
                                            </>
                                        )}

                                        <DesItem label="Response Size">
                                            <Text>
                                                {(selectedLog.responseSizeBytes / 1024).toFixed(2)}{' '}
                                                KB
                                            </Text>
                                        </DesItem>

                                        {Object.entries(selectedLog.timings).map(([key, value]) => {
                                            return (
                                                <DesItem
                                                    label={camelCaseToCapitalizedWords(String(key))}
                                                    key={`timings-${key}-${value}`}
                                                >
                                                    <Text>{value} ms</Text>
                                                </DesItem>
                                            );
                                        })}
                                    </Descriptions>

                                    <div
                                        style={{
                                            maxHeight: '400px',
                                            maxWidth: '100%',
                                            marginBottom: 20,
                                        }}
                                    >
                                        <Typography.Title level={5}>
                                            Durations{' '}
                                            <Typography.Text type="secondary">(ms)</Typography.Text>
                                        </Typography.Title>
                                        <div style={{ height: '70%', width: '100%' }}>
                                            <Bar
                                                data={{
                                                    labels: [''],
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
                                                    maintainAspectRatio: false,
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
                                                    hover: {
                                                        mode: 'index',
                                                        intersect: false,
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </Space>
                    </div>
                )}
            </Modal>
        </>
    );
}
