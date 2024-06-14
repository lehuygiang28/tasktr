import { Account, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthValidatePasswordlessDto, LoginResponseDto } from '~be/app/auth/dtos';
import { AxiosError } from 'axios';
import axios from '../axios';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        GithubProvider({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
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
            if (account?.provider === 'google') {
                try {
                    const { data: userData } = await axios.post<LoginResponseDto>(
                        '/auth/login/google',
                        {
                            idToken: account.id_token,
                        },
                    );

                    Object.assign(user, {
                        ...userData,

                        //remove default properties of google
                        id: undefined,
                        name: undefined,
                        sub: undefined,
                        picture: undefined,
                        image: undefined,
                        iat: undefined,
                        exp: undefined,
                        jti: undefined,
                    });
                    return true;
                } catch (error) {
                    console.error(error);
                    throw new Error('failed_to_login');
                }
            } else if (account?.provider === 'github') {
                try {
                    const { data: userData } = await axios.post<LoginResponseDto>(
                        '/auth/login/github',
                        {
                            accessToken: account.access_token,
                        },
                    );

                    Object.assign(user, {
                        ...userData,

                        //remove default properties of github
                        id: undefined,
                        name: undefined,
                        sub: undefined,
                        picture: undefined,
                        image: undefined,
                        iat: undefined,
                        exp: undefined,
                        jti: undefined,
                    });
                    return true;
                } catch (error) {
                    console.error(error);
                    throw new Error('failed_to_login');
                }
            }
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
    pages: {
        signIn: '/login',
        error: '/login',
    },
    logger: {
        debug: (...data: unknown[]) => console.debug({ ...data }),
        error: (...data: unknown[]) => console.error({ ...data }),
        warn: (...data: unknown[]) => console.warn({ ...data }),
    },
};
