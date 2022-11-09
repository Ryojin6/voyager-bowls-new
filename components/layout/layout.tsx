import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { pathname } = useRouter();

    return (
        <>
            <Head>
                <title>Starter Project</title>
                <meta name="description" content="TBD | Voyager Bowls" />
                <link rel="icon" href="/tbd.png" />
            </Head>
            <main>{children}</main>
        </>
    );
}
