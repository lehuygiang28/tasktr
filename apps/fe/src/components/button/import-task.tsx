import { ImportButton, useImport } from '@refinedev/antd';
import { ImportErrorResult, useNotification } from '@refinedev/core';
import { Modal, List, Typography, Spin } from 'antd';
import { useState } from 'react';

import type { TaskImport } from '~be/app/tasks/dtos';

export function ImportTask() {
    const { open } = useNotification();
    const [modalOpen, setModalOpen] = useState(false);
    const [failedTasks, setFailedTasks] = useState<ImportErrorResult<TaskImport>[]>([]);

    const { isLoading: importLoading, ...importProps } = useImport<
        Omit<TaskImport, 'options'> & { options?: string }
    >({
        resource: 'tasks',
        batchSize: 50,
        mapData: (item) => {
            const { options = '', ...rest } = item;
            try {
                return {
                    ...rest,
                    options: options ? JSON.parse(options) : undefined,
                } satisfies TaskImport;
            } catch (error) {
                open({
                    type: 'error',
                    message:
                        'Your import file contains invalid data, please make sure it is exported from TaskTr',
                });
                throw error;
            }
        },
        onFinish: (result) => {
            if (result?.errored?.length > 0) {
                setFailedTasks(result.errored);
                setModalOpen(true);
            }
        },
    });

    return (
        <>
            <ImportButton {...importProps} loading={importLoading} />
            {importLoading && <Spin size="large" fullscreen />}
            <Modal
                title="Failed Task Imports"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
            >
                <List>
                    {failedTasks.map((item, index) => {
                        return item.request.map((req, reqIndex) => (
                            <List.Item key={reqIndex}>
                                <List.Item.Meta
                                    title={
                                        <Typography.Text type="danger">
                                            {req?.name || 'Unknown Task'}
                                        </Typography.Text>
                                    }
                                    description={
                                        <div key={reqIndex}>
                                            {
                                                <div>
                                                    <b>Error:</b>{' '}
                                                    {item?.response[reqIndex]?.response?.data
                                                        ?.detail || 'Unknown error'}
                                                </div>
                                            }
                                        </div>
                                    }
                                />
                            </List.Item>
                        ));
                    })}
                </List>
            </Modal>
        </>
    );
}
