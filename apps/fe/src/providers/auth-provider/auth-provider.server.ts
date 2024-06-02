'use server';

import { AuthProvider } from '@refinedev/core';
import { cookies } from 'next/headers';

export const authProviderServer: Pick<AuthProvider, 'check'> = {
    check: async () => {
        const cookieStore = cookies();
        const auth = cookieStore.get('auth');

        if (auth) {
            return {
                authenticated: true,
                redirectTo: '/',
            };
        }

        return {
            authenticated: false,
            logout: true,
            redirectTo: '/login',
        };
    },
};
