import { LoginResponseDto } from '~be/app/auth/dtos';

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    declare interface Session {
        user: LoginResponseDto;
    }

    interface JWT extends DefaultJWT, LoginResponseDto {}
}
