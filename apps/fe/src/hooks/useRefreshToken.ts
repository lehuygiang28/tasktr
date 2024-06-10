import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import axios from '~/libs/axios';
import { LoginResponseDto } from '~be/app/auth/dtos';

export function useRefreshToken() {
    const { data: session, update } = useSession();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshToken = async () => {
        if (isRefreshing || !session?.user.refreshToken) {
            return;
        }

        setIsRefreshing(true);

        try {
            const path = '/auth/refresh';
            const res = await axios.post<LoginResponseDto>(path, {
                refreshToken: session.user.refreshToken,
            });

            session.user = res.data;
            update((prev: Session) => ({ ...prev, ...session }));
        } catch (error) {
            console.error('Failed to refresh tokens:', error);
            signIn();
        } finally {
            setIsRefreshing(false);
        }
    };

    return refreshToken;
}
