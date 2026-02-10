"use client"

import { useSession, signOut } from "next-auth/react"
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { User, Bell, LogOut, Trash2, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, BellRing, Send, ShieldCheck } from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [showNameSheet, setShowNameSheet] = useState(false)
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nameValue, setNameValue] = useState(session?.user?.name || '')
  const [isSaving, setIsSaving] = useState(false)

  // Notifications (local state only — no API)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [testSent, setTestSent] = useState(false)
  const [showPermissionsGuide, setShowPermissionsGuide] = useState(false)

  const BackArrow = isRTL ? ArrowRight : ArrowLeft
  const Chevron = isRTL ? ChevronLeft : ChevronRight

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` })
  }

  const handleSaveName = async () => {
    setIsSaving(true)
    try {
      // TODO: API call to update name
      setShowNameSheet(false)
    } catch (error) {
      console.error('Failed to save name:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // TODO: API call to delete account
      await signOut({ callbackUrl: `/${locale}` })
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const handleTestNotification = useCallback(() => {
    setTestSent(true)
    setTimeout(() => setTestSent(false), 2500)
  }, [])

  return (
    <div className="min-h-screen bg-surface-muted/50 dark:bg-background">
      {/* Navigation Bar */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-surface-elevated/60 border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-muted dark:hover:bg-surface-muted transition-colors"
            aria-label={tCommon('backAriaLabel')}
          >
            <BackArrow className="h-5 w-5 text-text-secondary" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-text-primary">
            {t('title')}
          </h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── Section: Update Name ── */}
        <div className="mb-8">
          <button
            onClick={() => setShowNameSheet(true)}
            className="w-full flex items-center gap-4 px-5 py-4 bg-background dark:bg-surface-elevated rounded-2xl border border-border-subtle/50 dark:border-border-subtle/30 shadow-sm hover:shadow-md hover:border-border-subtle transition-all duration-200 group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted dark:bg-surface-muted">
              <User className="h-5 w-5 text-text-secondary" />
            </div>
            <span className="flex-1 text-start text-base font-medium text-text-primary">
              {t('updateName')}
            </span>
            <Chevron className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" />
          </button>
        </div>

        {/* ── Section: Application ── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest px-5 mb-3">
            {t('applicationSection')}
          </h2>
          <div className="bg-background dark:bg-surface-elevated rounded-2xl border border-border-subtle/50 dark:border-border-subtle/30 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowNotificationsDialog(true)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-muted/50 dark:hover:bg-surface-muted/30 transition-colors group"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted dark:bg-surface-muted">
                <Bell className="h-5 w-5 text-text-secondary" />
              </div>
              <span className="flex-1 text-start text-base font-medium text-text-primary">
                {t('notifications')}
              </span>
              {/* Status badge */}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                notificationsEnabled 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-surface-muted text-text-muted'
              }`}>
                {notificationsEnabled ? t('notifActive') : t('notifInactive')}
              </span>
              <Chevron className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" />
            </button>
          </div>
        </div>

        {/* ── Section: Account ── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest px-5 mb-3">
            {t('accountSection')}
          </h2>
          <div className="bg-background dark:bg-surface-elevated rounded-2xl border border-border-subtle/50 dark:border-border-subtle/30 shadow-sm overflow-hidden">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-muted/50 dark:hover:bg-surface-muted/30 transition-colors group"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted dark:bg-surface-muted">
                <LogOut className="h-5 w-5 text-text-secondary" />
              </div>
              <span className="flex-1 text-start text-base font-medium text-text-primary">
                {t('signOut')}
              </span>
            </button>

            <div className="mx-5">
              <div className="border-t border-border-subtle/60" />
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors group"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100/80 dark:bg-red-900/20">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="flex-1 text-start text-base font-medium text-red-600 dark:text-red-400">
                {t('deleteAccount')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          DIALOGS
      ═══════════════════════════════════════════ */}

      {/* ── Update Name Sheet ── */}
      {showNameSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNameSheet(false)} />
          <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 bg-background dark:bg-surface-elevated rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-border-subtle rounded-full mx-auto mb-5 sm:hidden" />
            <h3 className="text-lg font-bold text-text-primary mb-5">{t('updateName')}</h3>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full px-4 py-3.5 rounded-xl border border-border-subtle bg-surface-muted/50 dark:bg-surface-muted text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent text-base transition-all"
              dir="auto"
              autoFocus
            />
            <div className="flex gap-3 mt-5">
              <Button variant="ghost" onClick={() => setShowNameSheet(false)} className="flex-1">
                {tCommon('cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveName} isLoading={isSaving} className="flex-1">
                {tCommon('save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Dialog (Smart Notifications) ── */}
      {showNotificationsDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNotificationsDialog(false)} />
          <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 bg-background dark:bg-surface-elevated rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-border-subtle rounded-full mx-auto mb-5 sm:hidden" />

            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 dark:bg-accent-primary/20">
                <BellRing className="h-5 w-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Ask Seba</p>
                <h3 className="text-base font-bold text-text-primary">{t('notifSmartTitle')}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-text-secondary text-sm mt-3 mb-5 leading-relaxed">
              {t('notificationsDescription')}
            </p>

            {/* Toggle Row */}
            <div className="flex items-center justify-between p-4 bg-surface-muted/50 dark:bg-surface-muted/30 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">{t('notifications')}</span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  notificationsEnabled
                    ? 'bg-green-500 dark:bg-green-600'
                    : 'bg-border-subtle dark:bg-surface-muted'
                }`}
                role="switch"
                aria-checked={notificationsEnabled}
                aria-label={t('notifications')}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                    notificationsEnabled
                      ? (isRTL ? 'start-0.5' : 'start-[22px]')
                      : (isRTL ? 'start-[22px]' : 'start-0.5')
                  }`}
                />
              </button>
            </div>

            {/* Status indicator */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm font-medium ${
              notificationsEnabled
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-surface-muted/50 text-text-muted dark:bg-surface-muted/30'
            }`}>
              <span className={`h-2 w-2 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-text-muted'}`} />
              {notificationsEnabled ? t('notifActive') : t('notifInactive')}
            </div>

            {/* Test Notification Button */}
            <button
              onClick={handleTestNotification}
              disabled={!notificationsEnabled}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-3 ${
                notificationsEnabled
                  ? 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 dark:bg-accent-primary/20 dark:hover:bg-accent-primary/30'
                  : 'bg-surface-muted/30 text-text-muted cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
              {testSent ? t('notifTestSent') : t('notifTestButton')}
            </button>

            {/* Permissions Guide */}
            <button
              onClick={() => setShowPermissionsGuide(!showPermissionsGuide)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('notifPermissionsHint')}
            </button>

            {showPermissionsGuide && (
              <div className="mt-2 p-4 bg-surface-muted/50 dark:bg-surface-muted/30 rounded-xl text-xs text-text-secondary leading-relaxed space-y-1.5">
                <p className="font-semibold text-text-primary mb-2">{t('notifPermissionsTitle')}</p>
                <p>• {t('notifPermStep1')}</p>
                <p>• {t('notifPermStep2')}</p>
                <p>• {t('notifPermStep3')}</p>
              </div>
            )}

            {/* Close */}
            <div className="mt-5 flex justify-end">
              <Button variant="ghost" onClick={() => setShowNotificationsDialog(false)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Confirmation ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 bg-background dark:bg-surface-elevated rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-border-subtle rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100/80 dark:bg-red-900/20 mb-4">
              <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">{t('deleteConfirmTitle')}</h3>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">{t('deleteConfirmDescription')}</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                {tCommon('cancel')}
              </Button>
              <Button variant="danger" onClick={handleDeleteAccount} className="flex-1">
                {t('deleteConfirmButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
