'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useTransition } from 'react'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const t = useTranslations('nav.languageToggle')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function onSelectLanguage(newLocale: 'ar' | 'en') {
    if (newLocale === locale) return

    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="relative hover:scale-105 transition-all duration-200 p-1 h-auto"
          aria-label={t('ariaLabel')}
        >
          <Globe className="h-7 w-7" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-32">
        <DropdownMenuItem
          onClick={() => onSelectLanguage('ar')}
          className={`cursor-pointer text-right ${
            locale === 'ar' ? 'bg-accent' : ''
          }`}
        >
          العربية
          {locale === 'ar' && <span className="ms-2">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSelectLanguage('en')}
          className={`cursor-pointer text-right ${
            locale === 'en' ? 'bg-accent' : ''
          }`}
        >
          English
          {locale === 'en' && <span className="ms-2">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
