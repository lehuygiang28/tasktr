import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Register - TaskTr',
    description: 'Register - TaskTr',
};

export default function LayoutRegisterPage({ children }: PropsWithChildren) {
    return <>{children}</>;
}
