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
