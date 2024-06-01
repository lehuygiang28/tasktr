import React from 'react';
import { ThemedLayout } from '~/components/themed-layout';
import authOptions from '~/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: React.PropsWithChildren) {
    const data = await getData();

    if (!data.session?.user) {
        return redirect('/login');
    }

    return <ThemedLayout>{children}</ThemedLayout>;
}

async function getData() {
    const session = await getServerSession(authOptions);
    return {
        session,
    };
}
