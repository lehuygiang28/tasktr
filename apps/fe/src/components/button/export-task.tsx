import React from 'react';
import { useExport, useNotification, useList } from '@refinedev/core';
import { ExportButton } from '@refinedev/antd';
import { Spin } from 'antd';

import type { TaskDto, TaskImport } from '~be/app/tasks/dtos';

export function ExportTask() {
    const { open } = useNotification();
    const { data: { data: tasks = [] } = {} } = useList({
        resource: 'tasks',
        pagination: {
            pageSize: 1,
            mode: 'server',
        },
    });
    const { triggerExport, isLoading: exportLoading } = useExport<TaskDto>({
        resource: 'tasks',
        pageSize: 50,
        mapData: (item) => {
            const { cronHistory, _id, userId, createdAt, updatedAt, options, ...rest } = item;
            return {
                ...rest,
                options: options ? JSON.stringify(options) : '',
            } satisfies Omit<TaskImport, 'options'> & { options?: string };
        },
        onError: (error) => {
            console.log(error);
            open({
                type: 'error',
                message: 'Error',
                description: 'Export failed',
            });
        },
    });

    const handleOnExport = () => {
        if (tasks?.length <= 0) {
            open({
                type: 'error',
                message: 'Error',
                description: 'You have no tasks to export',
            });
            return;
        }

        triggerExport();
    };
    return (
        <>
            <ExportButton onClick={handleOnExport} loading={exportLoading} />
            {exportLoading && <Spin size="large" fullscreen />}
        </>
    );
}
