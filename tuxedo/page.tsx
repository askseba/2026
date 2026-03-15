import { HeroSection } from '@/components/landing/HeroSection';
import { QuestionsSection } from '@/components/landing/QuestionsSection';
import { CTASection } from '@/components/landing/CTASection';
import { StatsSection } from '@/components/landing/StatsSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { HeadlineSection } from '@/components/landing/HeadlineSection';
import { ValuePropSection } from '@/components/landing/ValuePropSection';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('metadata.title') || 'Ask Seba',
    description: t('metadata.description') || 'Perfume discovery',
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-cream dark:!bg-surface">
      <HeroSection />
      <QuestionsSection />
      <StatsSection />
      <ValuePropSection />
      <BenefitsSection />
      <HeadlineSection />
      <CTASection />
    </main>
  );
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { ResultsContent } from '@/components/results/ResultsContent'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'results' })
  const title = t('metadata.title')
  const description = t('metadata.description')
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/og-results.jpg'],
      type: 'website',
    },
    robots: { index: false },
  }
}

export default async function ResultsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ResultsContent />
}

