import React from 'react';
import { useExport } from '@refinedev/core';
import { ExportButton } from '@refinedev/antd';

import type { TaskDto, TaskImport } from '~be/app/tasks/dtos';

export function ExportTask() {
    const { triggerExport, isLoading: exportLoading } = useExport<TaskDto>({
        mapData: (item) => {
            const { cronHistory, _id, userId, createdAt, updatedAt, options, ...rest } = item;
            return {
                ...rest,
                options: options ? JSON.stringify(options) : '',
            } satisfies Omit<TaskImport, 'options'> & { options?: string };
        },
    });
    return (
        <>
            <ExportButton onClick={triggerExport} loading={exportLoading} />
        </>
    );
}
