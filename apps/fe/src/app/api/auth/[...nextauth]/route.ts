import NextAuth from 'next-auth/next';
import { authOptions } from '~/libs/next-auth';

const auth = NextAuth(authOptions);
export { auth as GET, auth as POST };
