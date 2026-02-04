import type { Metadata, Viewport } from "next";
import Script from 'next/script';
import { Noto_Sans_Arabic, Manrope, Cormorant_Garamond } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { Toaster } from 'sonner';
import { PWARegister } from "@/components/PWARegister";
import { SessionProvider } from "@/components/SessionProvider";
import { QuizProvider } from "@/contexts/QuizContext";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatusToast } from "@/components/NetworkStatusToast";
import { ThemeProvider } from "next-themes";
import { PostHogProviderWrapper } from "@/components/PostHogProviderWrapper";
import { SentryLazyExtras } from "@/components/SentryLazyExtras";
import { StructuredData } from "@/components/SEO/StructuredData";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-arabic",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-manrope",
  fallback: ["system-ui", "sans-serif"],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-logo",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://askseba.com'),
  title: {
    default: 'Ask Seba - اكتشف عطرك المثالي | مساعد العطور الذكي',
    template: '%s | Ask Seba',
  },
  description: 'اكتشف عطرك المفضل من خلال اختبار ذكي يحلل شخصيتك وذوقك. أكثر من 10,000 مستخدم وجدوا عطرهم المثالي مع صبا.',
  keywords: ['عطور', 'عطر', 'اختبار عطور', 'عطور نسائية', 'عطور رجالية', 'عطور آمنة', 'صبا'],
  authors: [{ name: 'Ask Seba Team' }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    title: "Ask Seba",
    statusBarStyle: "default",
    capable: true,
    startupImage: [
      {
        url: "/pwa-192.png",
        media: "(device-width: 375px) and (device-height: 667px)",
      },
      {
        url: "/pwa-512.png",
        media: "(device-width: 414px) and (device-height: 896px)",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://askseba.com',
    siteName: 'Ask Seba',
    title: 'Ask Seba - اكتشف عطرك المثالي',
    description: 'اختبار ذكي لاكتشاف العطور المثالية لك',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ask Seba',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask Seba - اكتشف عطرك المثالي',
    description: 'اختبار ذكي لاكتشاف العطور المثالية لك',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    languages: {
      'ar-SA': 'https://askseba.com',
      'en-US': 'https://askseba.com/en',
    },
  },
};

export function generateViewport(): Viewport {
  return {
    themeColor: "var(--color-primary)", // Using brand-gold color
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${notoSansArabic.variable} ${manrope.variable} ${cormorantGaramond.variable} ${notoSansArabic.className} antialiased`}>
      <head>
        <StructuredData />
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Hotjar */}
        {HOTJAR_ID && (
          <Script id="hotjar" strategy="afterInteractive">
            {`
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `}
          </Script>
        )}
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" storageKey="theme" enableSystem>
          <PostHogProviderWrapper>
          <ErrorBoundary>
            <SessionProvider>
              <QuizProvider>
                <NextIntlClientProvider locale={locale} messages={messages}>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                </NextIntlClientProvider>
                {/* HARDCODED TEST: red=light, blue=dark – remove after verifying */}
                <div className="bg-red-500 dark:bg-blue-500 h-20 w-20 fixed bottom-4 left-4 z-50 flex items-center justify-center text-white text-xs font-bold p-1 text-center rounded-lg shadow-lg">
                  HARDCODED TEST
                </div>
                <Toaster 
                  position="top-center" 
                  richColors={false}
                  toastOptions={{
                    duration: 3500,
                    style: {
                      direction: 'rtl',
                      textAlign: 'right'
                    }
                  }}
                />
                <NetworkStatusToast />
                <PWARegister />
                <SentryLazyExtras />
              </QuizProvider>
            </SessionProvider>
          </ErrorBoundary>
          </PostHogProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
