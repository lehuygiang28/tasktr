import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import React, { Suspense } from 'react';
import { RefineContext } from './_refine_context';

export const metadata: Metadata = {
    title: 'TaskTr - The Simple Way to Schedule and Execute Any Task',
    description: 'TaskTr - The Simple Way to Schedule and Execute Any Task',
    icons: {
        icon: '/images/logo-favicon.webp',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = cookies();
    const theme = cookieStore.get('theme');
    const defaultMode = theme?.value === 'light' ? 'light' : 'dark';

    return (
        <html lang="en">
            <body>
                <Suspense>
                    <RefineContext defaultMode={defaultMode}>{children}</RefineContext>
                </Suspense>
            </body>
        </html>
    );
}
