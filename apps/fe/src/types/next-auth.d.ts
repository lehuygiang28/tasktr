import { DefaultSession } from 'types/next-auth';
import { LoginResponseDto } from '~be/app/auth/dtos';

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: LoginResponseDto & DefaultSession['user'];
    }
}
