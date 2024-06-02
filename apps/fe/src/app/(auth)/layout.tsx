import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { authOptions } from '~/libs/next-auth';

export default async function AuthLayout({ children }: PropsWithChildren) {
    const data = await getData();

    if (!data.session?.user) {
        return redirect('/login');
    }

    return <>{children}</>;
}

async function getData() {
    const session = await getServerSession(authOptions);

    return {
        session,
    };
}
