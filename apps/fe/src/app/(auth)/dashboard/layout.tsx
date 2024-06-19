import React from 'react';
import { ThemedLayout } from '~/components/themed-layout';

export default function Layout({ children }: React.PropsWithChildren) {
    return <ThemedLayout>{children}</ThemedLayout>;
}
