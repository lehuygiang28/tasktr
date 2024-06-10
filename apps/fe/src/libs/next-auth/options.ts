import { Account, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthValidatePasswordlessDto, LoginResponseDto } from '~be/app/auth/dtos';
import { AxiosError } from 'axios';
import axios from '../axios';

export const authOptions = {
    providers: [
        // !!! Should be stored in .env file.
        GoogleProvider({
            clientId: `1041339102270-e1fpe2b6v6u1didfndh7jkjmpcashs4f.apps.googleusercontent.com`,
            clientSecret: `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`,
        }),
        CredentialsProvider({
            credentials: {
                hash: {
                    label: 'hash',
                },
            },
            async authorize(credentials) {
                const path = '/auth/login/pwdless/validate';
                const payload: AuthValidatePasswordlessDto = {
                    hash: credentials?.hash || '',
                };

                return axios
                    .post<LoginResponseDto>(path, payload)
                    .then((response) => {
                        return response.data as unknown as User;
                    })
                    .catch((err: AxiosError) => {
                        throw err;
                    });
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }: { user: User; account: Account | null }) {
            // if (account?.provider === 'google') {
            //     try {
            //         const { data: userData } = await loginserv

            //         Object.assign(userData.user, {
            //             accessToken: userData.accessToken,
            //             refreshToken: userData.refreshToken,
            //             accessTokenExpires: userData.accessTokenExpires,
            //         });
            //         Object.assign(user, {
            //             // assign custom properties of backend
            //             ...userData.user,

            //             //remove default properties of google
            //             id: undefined,
            //             name: undefined,
            //             sub: undefined,
            //             picture: undefined,
            //             image: undefined,
            //             iat: undefined,
            //             exp: undefined,
            //             jti: undefined,
            //         });
            //         return true;
            //     } catch (error) {
            //         console.error(error);
            //         return false;
            //     }
            // }
            return true;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async jwt({ token, user }: { token: any; user: User | null }) {
            if (user) {
                token = { ...token, ...user };
            }
            return token;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, token }: { session: Session; token: any }) {
            if (token) {
                session.user = token;
            }
            return session;
        },
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
    logger: {
        debug: (...data: unknown[]) => console.debug({ ...data }),
        error: (...data: unknown[]) => console.error({ ...data }),
        warn: (...data: unknown[]) => console.warn({ ...data }),
    },
};
