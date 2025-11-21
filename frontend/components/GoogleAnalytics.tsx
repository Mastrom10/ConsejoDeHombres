import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Declarar gtag en el scope global para TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics() {
  const router = useRouter();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      console.warn('Google Analytics: NEXT_PUBLIC_GA_MEASUREMENT_ID no está configurado');
      return;
    }

    const handleRouteChange = (url: string) => {
      // Esperar un poco para asegurar que gtag esté disponible
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
          });
        }
      }, 100);
    };

    // Trackear la página inicial
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={() => {
          console.log('Google Analytics script cargado');
        }}
        onError={() => {
          console.error('Error al cargar Google Analytics script');
        }}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
            console.log('Google Analytics inicializado con ID: ${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}

