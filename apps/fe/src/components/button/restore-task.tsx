import { RollbackOutlined } from '@ant-design/icons';
import { useUpdate } from '@refinedev/core';
import { Button, Popconfirm } from 'antd';

import type { TaskDto } from '~be/app/tasks/dtos';

export type RestoreTaskProps = {
    id: string;
};

export function RestoreTask({ id }: RestoreTaskProps) {
    const { mutate: mutateRestore, isLoading: restoreLoading } = useUpdate<TaskDto>({});

    return (
        <>
            <Popconfirm
                key={`restore-popconfirm-${id}`}
                okText="Yes"
                cancelText="No"
                icon={<RollbackOutlined style={{ color: 'green' }} />}
                title="Are you sure you want to restore this task?"
                onConfirm={() => {
                    mutateRestore({
                        id,
                        resource: 'tasks',
                        invalidates: ['list', 'detail'],
                        values: {
                            deletedAt: null,
                        },
                    });
                }}
            >
                <Button
                    key={`restore_${id}`}
                    size="small"
                    type="default"
                    icon={<RollbackOutlined />}
                    loading={restoreLoading}
                />
            </Popconfirm>
        </>
    );
}
