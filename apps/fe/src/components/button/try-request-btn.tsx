'use client';

import { useState } from 'react';
import { Button } from 'antd';
import { useNotification } from '@refinedev/core';

import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import type { TryRequestDto, TryRequestResponseDto } from '~be/app/tasks/dtos';

import { useAxios } from '~/hooks/useAxios';
import { TaskLogsModal } from '../modal';
import { TaskFormValues } from '../form/task-form';
import Loading from '~/app/loading';

export function TryRequestButton({
    getValues,
}: {
    getValues: () => Promise<TaskFormValues | null>;
}) {
    const { request } = useAxios();
    const [res, setRes] = useState<TryRequestResponseDto | null>(null);
    const [loadingTryRequest, setLoadingTryRequest] = useState(false);
    const { open } = useNotification();

    if (loadingTryRequest) {
        return <Loading />;
    }

    return (
        <>
            <TaskLogsModal type="test" selectedLog={res} setSelectedLog={setRes} />
            <Button
                onClick={async () => {
                    try {
                        setLoadingTryRequest(true);
                        const data = await getValues();
                        if (!data) {
                            return;
                        }

                        const res = await request<TryRequestResponseDto, TryRequestDto>({
                            method: HttpMethodEnum.POST,
                            url: '/tasks/try',
                            data,
                        });

                        setRes(res);
                    } catch (error) {
                        open({
                            type: 'error',
                            message: 'Try Request Failed',
                            description: error?.message,
                            key: 'try-request-failed',
                        });
                    } finally {
                        setLoadingTryRequest(false);
                    }
                }}
            >
                Try Request
            </Button>
        </>
    );
}
