import { setRequestLocale } from 'next-intl/server'
import PricingPage from '../../pricing/page'

type Props = { params: Promise<{ locale: string }> }

export default async function LocalePricingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PricingPage />
}
