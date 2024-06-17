'use client';

import 'react-js-cron/dist/styles.css';

import { useForm as useFormAnt } from '@refinedev/antd';

import { TaskFormValidator } from '~/validators';
import { TaskForm } from '~/components/form/task-form';

export default function TaskEdit() {
    const {
        onFinish,
        queryResult: { data: taskResponse },
        formProps,
    } = useFormAnt<TaskFormValidator>({
        warnWhenUnsavedChanges: true,
    });

    return (
        <>
            <TaskForm
                mode="edit"
                defaultValues={taskResponse?.data}
                onSubmit={onFinish}
                formProps={formProps}
            />
        </>
    );
}
