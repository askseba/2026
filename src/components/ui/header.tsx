"use client"

import { useSession, signOut } from "next-auth/react"
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Link } from '@/i18n/routing'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import DarkModeToggle from "@/components/DarkModeToggle"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { SettingsIcon, UserAvatarIcon } from "@/components/AskSebaIcons"
import { Heart } from "lucide-react"

export default function Header() {
  const { data: session, status } = useSession()
  const t = useTranslations('nav')
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-surface-elevated/60"
    >
      <div className="container mx-auto h-full px-4 flex items-center justify-between sm:gap-3">
        {/* Left side: Favorites Heart - standalone */}
        <div className="flex items-center">
          <Link
            href="/favorites"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-primary hover:bg-cream-bg dark:hover:bg-surface-muted transition-all duration-200 hover:scale-105"
            aria-label={t('favorites', { defaultValue: 'المفضلة' })}
          >
            <Heart className="h-6 w-6 fill-red-500 text-red-500 hover:fill-red-400 transition-colors" />
          </Link>
        </div>
        
        {/* Right side: Controls */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <DarkModeToggle />
          
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* ⚙️ Settings Link */}
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-primary hover:bg-cream-bg dark:hover:bg-surface-muted transition-all duration-200 hover:scale-105"
            aria-label={t('settings')}
          >
            <SettingsIcon className="h-7 w-7" />
          </Link>

          {/* 👤 Account Hub - Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:scale-105 transition-all duration-200 p-1 h-auto rounded-full"
                aria-label={t('userMenuAriaLabel')}
              >
                <UserAvatarIcon className="h-7 w-7" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-48"
            >
              {session ? (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer text-right"
                  >
                    {t('profile')}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-right text-red-600 focus:text-red-600"
                  >
                    {t('logout')}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push('/login')}
                    className="cursor-pointer text-right"
                  >
                    {t('login')}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push('/register')}
                    className="cursor-pointer text-right"
                  >
                    {t('register')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
