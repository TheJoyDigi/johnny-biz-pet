import { DefaultMetaData } from "@/components/meta-data";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPortalPage = router.pathname.startsWith('/admin') || router.pathname.startsWith('/sitter');

  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add("fonts-loaded");
      });
    } else {
      setTimeout(() => {
        document.documentElement.classList.add("fonts-loaded");
      }, 300);
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <style>{`
          html:not(.fonts-loaded) * {
            transition: none !important;
          }
          @supports (-webkit-touch-callout: none) {
            body {
              -webkit-text-size-adjust: 100%;
            }
            h1, h2, h3, h4, h5, h6, .text-logo {
              -webkit-font-smoothing: antialiased;
            }
          }
        `}</style>
      </Head>
      <DefaultMetaData />
      <div className="font-sans">
        {!isPortalPage && <Header />}
        <main>
          <Component {...pageProps} />
        </main>
        {!isPortalPage && <Footer />}
      </div>

      {/* Google Tag Manager */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17780183336"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17780183336');
        `}
      </Script>
    </>
  );
}