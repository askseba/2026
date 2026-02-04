import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Ask Seba - اكتشف عطرك المثالي | مساعد العطور الذكي",
  description:
    "اكتشف عطرك المفضل من خلال اختبار ذكي يحلل شخصيتك وذوقك.",
};

export function generateViewport(): Viewport {
  return {
    themeColor: "var(--color-primary)",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

/**
 * Nested layout for [locale] segment only.
 * Does NOT render <html> or <body> — root layout provides those.
 * Only wraps children with NextIntlClientProvider so useLocale() / useTranslations() work for this segment.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
