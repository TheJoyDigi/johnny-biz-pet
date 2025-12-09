import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Essential Document Meta Tags */}
        <meta name="theme-color" content="#f9f5eb" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="text-size-adjust" content="100%" />
        <link rel="icon" href="/favicon_dog.png" />

        {/* Analytics Scripts */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "qvefgax38w");
            `,
          }}
        />
        {/* <!-- Google tag (gtag.js) --> */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-W4PNG5DB4T"
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-W4PNG5DB4T');`,
          }}
        ></script>

        {/* Safari font rendering fix - load early to avoid FOUT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Safari font rendering fix - helps ensure fonts are properly loaded
              (function() {
                // Detect Safari
                var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                
                // Apply Safari-specific optimizations
                if (isSafari) {
                  // Add Safari class to HTML for targeted CSS fixes
                  document.documentElement.classList.add('safari');
                  
                  // Add a load event for Safari font rendering
                  window.addEventListener('load', function() {
                    // Force reflow which helps with font rendering in Safari
                    document.body.style.opacity = '0.99';
                    setTimeout(function() {
                      document.body.style.opacity = '1';
                      document.documentElement.classList.add('fonts-loaded-safari');
                    }, 100);
                  });
                } else {
                  // For non-Safari browsers, just mark fonts as loaded
                  document.documentElement.classList.add('fonts-loaded-safari');
                }
              })();
            `,
          }}
        />

        {/* Preload critical fonts */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com/s/varelaround/v13/w8gdH283Tvk__Lua32TysjIfp8uP.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com/s/fredokaone/v8/k3kUo8kEI-tA1RRcTZGmTlHGCac.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com/s/comicneue/v4/4UaHrEJDsxBrF37olUeD96rp57F2IwM.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
