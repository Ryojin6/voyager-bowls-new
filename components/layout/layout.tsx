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
                <meta name="description" content="Starter Project" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossorigin
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,300;0,400;0,600;1,700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <main>{children}</main>
        </>
    );
}
