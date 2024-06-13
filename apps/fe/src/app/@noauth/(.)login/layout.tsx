import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Login - TaskTr',
    description: 'Login - TaskTr',
};

export default function LayoutLoginPage({ children }: PropsWithChildren) {
    return <>{children}</>;
}
