// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { AuthProvider } from '../components/AuthProvider';
import { initializeDatabase } from '../lib/initDatabase';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize database on app start
    initializeDatabase();
  }, []);

  return (
      <Head>
        {/* Default title that can be overridden by individual pages */}
        <title>BrandPawa - Build Your Dominant Brand</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
