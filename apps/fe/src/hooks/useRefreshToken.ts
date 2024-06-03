import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { refreshTokens } from '~/services/auth.service';

export function useRefreshToken() {
    const { data: session } = useSession();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshToken = async () => {
        if (isRefreshing || !session?.user.refreshToken) {
            return;
        }

        setIsRefreshing(true);

        try {
            const res = await refreshTokens(session.user.refreshToken);
            session.user = res.data;
        } catch (error) {
            console.error('Failed to refresh tokens:', error);
            signIn();
        } finally {
            setIsRefreshing(false);
        }
    };

    return refreshToken;
}
