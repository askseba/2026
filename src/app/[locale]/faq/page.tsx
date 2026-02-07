'use client'

import { Link } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, ArrowLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'

type FAQQuestion = { id: string; question: string; answer: string }
type FAQCategory = { name: string; questions: FAQQuestion[] }

export default function FAQPage() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const t = useTranslations('faq')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = t.raw('categories') as FAQCategory[]

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          q.question.includes(searchTerm) || q.answer.includes(searchTerm)
      ),
    }))
    .filter((cat) => cat.questions.length > 0)

  return (
    <div dir={direction} className="min-h-screen bg-cream-bg dark:!bg-surface text-brand-brown dark:text-text-primary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/profile"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 text-brand-brown dark:text-text-primary mb-6 hover:text-brand-gold dark:hover:text-accent-primary transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('backToProfile')}</span>
        </Link>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-cream-bg dark:bg-surface py-12 px-6 text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-brand-brown dark:text-text-primary">
            {t('hero.title')}
          </h1>
          <p className="text-xl font-bold text-brand-brown/80 dark:text-text-secondary">
            {t('hero.subtitle')}
          </p>
        </motion.section>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-brown/40" />
            <input
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={t('searchAriaLabel')}
              className="w-full pr-12 pl-4 py-3 rounded-3xl border border-brand-brown/20 dark:border-text-primary/20 bg-white/90 dark:bg-surface-elevated backdrop-blur-sm shadow-lg text-base text-brand-brown dark:text-text-primary placeholder:text-brand-brown/60 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:focus:ring-accent-primary/50"
            />
          </div>
        </motion.div>

        {/* Accordion Categories - aria-live for dynamic search results */}
        <div className="space-y-8" aria-live="polite">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.section
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-brand-brown dark:text-text-primary">
                {category.name}
              </h2>
              <Accordion.Root type="single" collapsible className="space-y-2">
                {category.questions.map((question) => (
                  <Accordion.Item
                    key={question.id}
                    value={question.id}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-3xl border border-[var(--color-text-primary)]/20 mb-2 overflow-hidden"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger
                        aria-label={`${question.question}`}
                        className="min-h-[44px] min-w-[44px] w-full px-6 py-4 flex flex-row-reverse justify-between items-center text-base font-bold text-brand-brown dark:text-text-primary hover:bg-brand-gold/50 dark:hover:bg-accent-primary/20 transition-colors text-start lg:text-justify touch-manipulation"
                      >
                        <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform duration-300 data-[state=open]:rotate-180" aria-hidden />
                        <span>{question.question}</span>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="px-6 pb-4 text-base text-brand-brown/80 dark:text-text-secondary overflow-hidden lg:text-justify">
                      <div className="py-2">
                        <p className="whitespace-pre-line lg:text-justify">{question.answer}</p>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </motion.section>
          ))}
        </div>

        {/* No Results Message */}
        {filteredCategories.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-base text-brand-brown/60 dark:text-text-muted">
              {t('noResults', { term: searchTerm })}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
