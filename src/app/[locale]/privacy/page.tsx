'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Mail, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { motion } from 'framer-motion'

type PrivacySection = { id: string; title: string; content: string[] }
type PrivacyContact = { email: string; response_time: string }
type PrivacyCompliance = { title: string; standards: string[]; note: string }

export default function PrivacyPage() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const t = useTranslations('privacy')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = t.raw('sections') as PrivacySection[]
  const summaryBullets = t.raw('summaryBullets') as string[]
  const contact = t.raw('contact') as PrivacyContact
  const compliance = t.raw('compliance') as PrivacyCompliance
  const sectionIds = sections.map((s) => s.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )
    sectionIds.forEach((sec) => {
      const el = document.getElementById(sec)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sectionIds])

  const scrollToSection = (id: string) => {
    const next = activeSection === id ? null : id
    setActiveSection(next)
    if (next) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div dir={direction} className="min-h-screen bg-cream-bg dark:!bg-surface text-brand-brown dark:text-text-primary">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <BackButton
          variant="link"
          label={t('backButton')}
          ariaLabel={t('backAriaLabel')}
          className="mb-6"
        />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-cream-bg dark:bg-surface py-12 px-6 text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-brand-brown dark:text-text-primary">
            {t('hero.title')}
          </h1>
          <p className="text-xl font-bold mb-2 text-brand-brown/80 dark:text-text-secondary">
            {t('hero.subtitle')}
          </p>
          <p className="text-sm text-brand-brown/60 dark:text-text-muted">
            {t('hero.lastUpdatedPrefix')} {t('hero.last_updated')}
          </p>
        </motion.section>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-3xl p-6 border border-brand-brown/20 dark:border-text-primary/20"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-brand-brown dark:text-text-primary">{t('tocTitle')}</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      'w-full px-4 py-2 rounded-xl text-sm transition-colors lg:text-justify',
                      direction === 'rtl' ? 'text-right' : 'text-left',
                      activeSection === section.id
                        ? 'bg-brand-gold/20 dark:bg-accent-primary/20 text-brand-gold dark:text-accent-primary font-bold'
                        : 'text-brand-brown/70 dark:text-text-secondary hover:bg-brand-gold/10 dark:hover:bg-accent-primary/10 hover:text-brand-brown dark:hover:text-text-primary'
                    )}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </motion.div>
          </aside>

          <div className="flex-1 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-brand-gold/10 dark:bg-accent-primary/10 border-2 border-brand-gold dark:border-accent-primary rounded-3xl p-6 mb-8"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-brand-brown dark:text-text-primary">{t('summaryTitle')}</h3>
              {summaryBullets.map((bullet, idx) => (
                <div key={idx} className="flex gap-3 items-start mb-4 last:mb-0">
                  <Shield className="w-5 h-5 text-brand-gold mt-1 flex-shrink-0" />
                  <p className="text-base text-brand-brown dark:text-text-primary lg:text-justify">{bullet}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Accordion.Root
                type="single"
                collapsible
                className="space-y-2"
                defaultValue={sections[0]?.id}
              >
                {sections.map((section) => (
                  <Accordion.Item
                    key={section.id}
                    id={section.id}
                    value={section.id}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-3xl border border-brand-brown/20 mb-2 overflow-hidden"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className={cn(
                        'w-full px-6 py-4 flex justify-between items-center text-base font-bold text-brand-brown dark:text-text-primary hover:bg-brand-gold/50 dark:hover:bg-accent-primary/20 transition-colors lg:text-justify',
                        direction === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'
                      )}>
                        <span>{section.title}</span>
                        <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform duration-300 data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className={cn(
                      'px-6 pb-4 text-base text-brand-brown/80 dark:text-text-secondary overflow-hidden lg:text-justify',
                      direction === 'rtl' ? 'text-right' : 'text-left'
                    )}>
                      <div className="py-2 space-y-2">
                        {section.content.map((paragraph, pIdx) => (
                          <p key={pIdx} className="whitespace-pre-line lg:text-justify">{paragraph}</p>
                        ))}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-3xl p-6 border border-brand-brown/20 mb-8"
            >
              <div className="flex gap-3 items-center mb-3">
                <Mail className="w-6 h-6 text-[var(--color-primary)]" />
                <h3 className="text-lg font-bold">{t('contactTitle')}</h3>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="text-[var(--color-primary)] hover:underline text-base block mb-1"
              >
                {contact.email}
              </a>
              <p className="text-sm text-[var(--color-text-primary)]/60">{contact.response_time}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-green-50/10 border-2 border-green-200 rounded-3xl p-6 text-center"
            >
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold mb-2">{compliance.title}</h3>
              <div className="flex gap-2 justify-center mb-3 flex-wrap">
                {compliance.standards.map((standard, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {standard}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-primary)]/60">{compliance.note}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
