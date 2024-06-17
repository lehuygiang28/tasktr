'use client';

import 'react-js-cron/dist/styles.css';

import { useForm as useFormAnt } from '@refinedev/antd';

import { TaskFormValidator } from '~/validators';
import { TaskForm } from '~/components/form/task-form';

export default function TaskCreate() {
    const { onFinish, formProps } = useFormAnt<TaskFormValidator>({
        warnWhenUnsavedChanges: true,
    });

    return (
        <>
            <TaskForm mode="create" onSubmit={onFinish} formProps={formProps} />
        </>
    );
}
