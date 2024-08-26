import { DeleteOutlined } from '@ant-design/icons';
import { useDelete } from '@refinedev/core';
import { Button, Popconfirm } from 'antd';

import type { TaskDto } from '~be/app/tasks/dtos';

export type HardDeleteTaskProps = {
    id: string;
};

export function HardDeleteTask({ id }: HardDeleteTaskProps) {
    const { mutate: mutateDelete, isLoading: deleteLoading } = useDelete<TaskDto>({});

    return (
        <>
            <Popconfirm
                key={`delete-popconfirm-${id}`}
                okText="Yes"
                cancelText="No"
                title="Are you sure you want to delete this task forever?"
                description="This action cannot be undone. Your task data will be permanently deleted."
                onConfirm={() => {
                    mutateDelete({
                        id,
                        resource: 'tasks',
                        invalidates: ['list', 'detail'],
                        meta: {
                            params: ['hard'],
                        },
                    });
                }}
            >
                <Button
                    key={`delete_${id}`}
                    size="small"
                    type="default"
                    icon={<DeleteOutlined style={{ color: 'red' }} />}
                    loading={deleteLoading}
                />
            </Popconfirm>
        </>
    );
}
