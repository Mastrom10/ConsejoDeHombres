import type { AppProps } from 'next/app';
import '../styles/globals.css';
import GoogleAnalytics from '../components/GoogleAnalytics';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </>
  );
}
