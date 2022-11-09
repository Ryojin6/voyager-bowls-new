import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import Layout from '../components/layout/layout';
import { NotificationsContainer } from '../components/notification';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Layout>
                <Component {...pageProps} />
            </Layout>
            <NotificationsContainer />
        </>
    );
}

export default MyApp;
