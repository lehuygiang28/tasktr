'use client';

import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useGetIdentity } from '@refinedev/core';

import LoadingPage from '../loading';
import { ThemedLayout } from '~/components/themed-layout';
import { UserRoleEnum } from '~be/app/users/users.enum';
import { type UserDto } from '~be/app/users';

export default function AdminLayout({ children }: PropsWithChildren) {
    const router = useRouter();
    const { data, isLoading } = useIsAuthenticated();
    const { data: user, isLoading: isIdentityLoading } = useGetIdentity<UserDto>();

    if (isLoading || isIdentityLoading) {
        return <LoadingPage />;
    }

    if (!data?.authenticated) {
        return router.replace('/login');
    }

    if (user?.role !== UserRoleEnum.Admin) {
        return router.replace('/dashboard');
    }

    return <ThemedLayout>{children}</ThemedLayout>;
}
