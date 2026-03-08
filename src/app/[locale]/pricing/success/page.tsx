import { setRequestLocale } from 'next-intl/server'
import SuccessPage from '../../../pricing/success/page'

type Props = { params: Promise<{ locale: string }> }

export default async function LocalePricingSuccessPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <SuccessPage />
}
