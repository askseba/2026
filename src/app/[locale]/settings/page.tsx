"use client"

import { useSession, signOut } from "next-auth/react"
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Bell, LogOut, Trash2, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, Mail, Globe, AlertTriangle } from "lucide-react"

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
  const [confirmDeleteText, setConfirmDeleteText] = useState('')

  const [notifOrders, setNotifOrders] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(false)
  const [notifReminders, setNotifReminders] = useState(true)

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

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const CONFIRM_PHRASE = t('deleteConfirmPhrase')
  const isDeleteConfirmed = confirmDeleteText.trim() === CONFIRM_PHRASE

  return (
    <div className="min-h-screen bg-surface-muted/50 dark:bg-background">

      {/* ── Navigation Bar ── */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-surface-elevated/60 border-b border-border-subtle">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-muted dark:hover:bg-surface-muted transition-colors"
            aria-label={tCommon('backAriaLabel')}
          >
            <BackArrow className="h-5 w-5 text-text-secondary" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-text-primary">
            {t('title')}
          </h1>
          <div className="w-9" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-lg mx-auto px-4 py-5">

        {/* ── User Card ── */}
        <div className="flex items-center gap-3 px-4 py-3.5 mb-5 bg-background dark:bg-surface-elevated rounded-2xl border border-border-subtle/30 dark:border-border-subtle/30 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-400 shadow-md shadow-red-500/20">
            <span className="text-white text-sm font-bold">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {session?.user?.name || t('updateName')}
            </p>
            <p className="text-xs text-text-muted truncate">
              {session?.user?.email || ''}
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100/80 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-800/40">
            {t('statusActive')}
          </span>
        </div>

        {/* ── Section: Profile ── */}
        <div className="mb-4">
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1 mb-2">
            {t('profileSection')}
          </h2>
          <div className="bg-background dark:bg-surface-elevated rounded-2xl border border-border-subtle/30 dark:border-border-subtle/30 shadow-sm overflow-hidden">

            {/* Update Name */}
            <button
              onClick={() => setShowNameSheet(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/50 dark:hover:bg-surface-muted/30 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-text-primary">{t('updateName')}</p>
                <p className="text-xs text-text-muted">{session?.user?.name || '—'}</p>
              </div>
              <Chevron className="h-3.5 w-3.5 text-text-muted group-hover:text-text-secondary transition-colors" />
            </button>

            <div className="mx-4 border-t border-border-subtle/30" />

            {/* Email (display only) */}
            <div className="w-full flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/40">
                <Mail className="h-4 w-4 text-text-secondary" />
              </div>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-text-primary">
                  {t('email')}
                </p>
                <p className="text-xs text-text-muted">{session?.user?.email || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: Application ── */}
        <div className="mb-4">
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1 mb-2">
            {t('applicationSection')}
          </h2>
          <div className="bg-background dark:bg-surface-elevated rounded-2xl border border-border-subtle/30 dark:border-border-subtle/30 shadow-sm overflow-hidden">

            {/* Notifications */}
            <button
              onClick={() => setShowNotificationsDialog(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/50 dark:hover:bg-surface-muted/30 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-text-primary">{t('notifications')}</p>
                <p className="text-xs text-text-muted">
                  {t('notificationsManage')}
                </p>
              </div>
              <Chevron className="h-3.5 w-3.5 text-text-muted group-hover:text-text-secondary transition-colors" />
            </button>

            <div className="mx-4 border-t border-border-subtle/30" />

            {/* Language */}
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/50 dark:hover:bg-surface-muted/30 transition-colors group">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-text-primary">
                  {t('language')}
                </p>
                <p className="text-xs text-text-muted">{t('languageCurrent')}</p>
              </div>
              <Chevron className="h-3.5 w-3.5 text-text-muted group-hover:text-text-secondary transition-colors" />
            </button>
          </div>
        </div>

        {/* ── Section: Account ── */}
        <div className="mb-4">
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1 mb-2">
            {t('accountSection')}
          </h2>
          <div className="bg-background dark:bg-surface-elevated rounded-2xl border border-border-subtle/30 dark:border-border-subtle/30 shadow-sm overflow-hidden">

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/50 dark:hover:bg-surface-muted/30 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/40">
                <LogOut className="h-4 w-4 text-text-secondary" />
              </div>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-text-primary">{t('signOut')}</p>
                <p className="text-xs text-text-muted">
                  {t('signOutDescription')}
                </p>
              </div>
            </button>

            <div className="mx-4 border-t border-border-subtle/30" />

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100/80 dark:bg-red-900/20">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{t('deleteAccount')}</p>
                <p className="text-xs text-red-400/70 dark:text-red-500/60">
                  {t('deleteAccountDescription')}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-text-muted py-4">
          {t('securityNote')}
        </p>

      </div>

      {/* ═══════════════════════════════════
          DIALOGS
      ═══════════════════════════════════ */}

      {/* ── Update Name Sheet ── */}
      {showNameSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNameSheet(false)}
          />
          <div className="relative w-full sm:max-w-sm mx-0 sm:mx-4 bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-1 bg-gray-200 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            {/* modal header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-slate-600">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">{t('updateName')}</h3>
                <p className="text-xs !text-text-secondary">
                  {t('nameVisibility')}
                </p>
              </div>
            </div>

            {/* modal body */}
            <div className="px-5 py-4">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                {t('fullName')}
              </label>
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base transition-all"
                dir="auto"
                autoFocus
              />
            </div>

            {/* modal footer */}
            <div className="flex gap-2.5 px-5 pb-5">
              <Button
                variant="ghost"
                onClick={() => setShowNameSheet(false)}
                className="flex-1"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveName}
                isLoading={isSaving}
                className="flex-1 !bg-amber-700 hover:!bg-amber-800 text-white dark:!bg-amber-600 dark:hover:!bg-amber-700"
              >
                {tCommon('save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Dialog ── */}
      {showNotificationsDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNotificationsDialog(false)}
          />
          <div className="relative w-full sm:max-w-sm mx-0 sm:mx-4 bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-1 bg-gray-200 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            {/* modal header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-slate-600">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold !text-text-primary">{t('notifications')}</h3>
                <p className="text-xs !text-text-secondary">
                  {t('notificationsPreferences')}
                </p>
              </div>
            </div>

            {/* notification rows */}
            <div className="px-5 py-3 divide-y divide-gray-200 dark:divide-slate-600">

              {/* Orders */}
              <div className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20 text-base">🛒</div>
                <div className="flex-1 text-start">
                  <p className="text-sm font-medium !text-text-primary">
                    {t('notifOrders')}
                  </p>
                  <p className="text-xs !text-text-secondary">
                    {t('notifOrdersDesc')}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={notifOrders}
                  onClick={() => setNotifOrders(v => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${notifOrders ? 'bg-gold' : 'bg-border-subtle'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5 ${notifOrders ? (isRTL ? 'translate-x-0.5' : 'translate-x-4') : (isRTL ? 'translate-x-4' : 'translate-x-0.5')}`} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-base">💬</div>
                <div className="flex-1 text-start">
                  <p className="text-sm font-medium !text-text-primary">
                    {t('notifMessages')}
                  </p>
                  <p className="text-xs !text-text-secondary">
                    {t('notifMessagesDesc')}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={notifMessages}
                  onClick={() => setNotifMessages(v => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${notifMessages ? 'bg-gold' : 'bg-border-subtle'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5 ${notifMessages ? (isRTL ? 'translate-x-0.5' : 'translate-x-4') : (isRTL ? 'translate-x-4' : 'translate-x-0.5')}`} />
                </button>
              </div>

              {/* Updates */}
              <div className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 text-base">🔔</div>
                <div className="flex-1 text-start">
                  <p className="text-sm font-medium !text-text-primary">
                    {t('notifUpdates')}
                  </p>
                  <p className="text-xs !text-text-secondary">
                    {t('notifUpdatesDesc')}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={notifUpdates}
                  onClick={() => setNotifUpdates(v => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${notifUpdates ? 'bg-gold' : 'bg-border-subtle'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5 ${notifUpdates ? (isRTL ? 'translate-x-0.5' : 'translate-x-4') : (isRTL ? 'translate-x-4' : 'translate-x-0.5')}`} />
                </button>
              </div>

              {/* Reminders */}
              <div className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-base">⏰</div>
                <div className="flex-1 text-start">
                  <p className="text-sm font-medium !text-text-primary">
                    {t('notifReminders')}
                  </p>
                  <p className="text-xs !text-text-secondary">
                    {t('notifRemindersDesc')}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={notifReminders}
                  onClick={() => setNotifReminders(v => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${notifReminders ? 'bg-gold' : 'bg-border-subtle'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5 ${notifReminders ? (isRTL ? 'translate-x-0.5' : 'translate-x-4') : (isRTL ? 'translate-x-4' : 'translate-x-0.5')}`} />
                </button>
              </div>

            </div>

            {/* modal footer */}
            <div className="flex gap-2.5 px-5 pb-5 pt-1">
              <Button
                variant="primary"
                onClick={() => setShowNotificationsDialog(false)}
                className="flex-1 !bg-amber-700 hover:!bg-amber-800 text-white dark:!bg-amber-600 dark:hover:!bg-amber-700"
              >
                {tCommon('save')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowNotificationsDialog(false)}
                className="flex-1 text-gray-600 dark:text-slate-400"
              >
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Confirmation ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full sm:max-w-sm mx-0 sm:mx-4 bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-1 bg-gray-200 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            {/* modal header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-red-100/80 dark:border-red-900/20 bg-red-50/50 dark:bg-red-950/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100/80 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-600 dark:text-red-400">
                  {t('deleteConfirmTitle')}
                </h3>
                <p className="text-xs text-red-400/80 dark:text-red-500/70">
                  {t('deleteIrreversible')}
                </p>
              </div>
            </div>

            {/* warning box */}
            <div className="mx-5 mt-4 flex gap-2.5 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              <span className="text-sm shrink-0">⚠️</span>
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                {t('deleteConfirmDescription')}
              </p>
            </div>

            {/* confirmation input */}
            <div className="px-5 pt-3 pb-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                {t('deleteConfirmLabel')} <span className="text-red-500 font-bold">{t('deleteConfirmPhrase')}</span>
              </label>
              <input
                type="text"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-base transition-all"
                dir="auto"
              />
            </div>

            {/* modal footer */}
            <div className="flex gap-2.5 px-5 pb-5 pt-3">
              <Button
                variant="ghost"
                onClick={() => { setShowDeleteConfirm(false); setConfirmDeleteText('') }}
                className="flex-1"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={!isDeleteConfirmed}
                className={`flex-1 transition-opacity ${isDeleteConfirmed ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
              >
                {t('deleteConfirmButton')}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
