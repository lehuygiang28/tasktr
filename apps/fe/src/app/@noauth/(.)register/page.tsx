'use client';

import { useIsAuthenticated } from '@refinedev/core';
import { Modal } from 'antd';
import { useRouter } from 'next/navigation';
import Register from '~/components/pages/register';
import Loading from '~/app/loading';

export default function RegisterParallelPage() {
    const router = useRouter();
    const { data: isAuthData, isLoading: isLoadingAuth } = useIsAuthenticated();

    const handleClose = () => {
        router.back();
    };

    if (isLoadingAuth) {
        return <Loading />;
    }

    if (isAuthData?.authenticated) {
        router.push('/');
        return <></>;
    }

    return (
        <Modal
            open={true}
            onCancel={handleClose}
            cancelButtonProps={{ hidden: true }}
            okButtonProps={{ hidden: true }}
            centered
        >
            <Register onBack={handleClose} />
        </Modal>
    );
}
