# Header DOM-to-Code + Accessibility Evidence (Read-Only)

**Goal:** List every interactive element in the header in DOM order and map it to source code and accessibility output.  
**Method:** Repo search and code-derived DOM/accessibility attributes. No code changes. No recommendations.

**Scope:** Header bar on `/ar` and `/en` home. Interactive = focusable (link, button, menuitem). Dropdown content is rendered in a portal (DOM order after header) but is part of the header UI.

---

## 1. DOM inventory table

DOM order matches the source: StatusCircles (left), then controls div: DarkModeToggle, LanguageSwitcher trigger, Notifications button, User menu trigger. Dropdown items appear in DOM when open (portal).

| # | Element | DOM selector (best unique) | Tag | Visible label text | Accessibility Name | aria-* attributes | href |
|---|--------|----------------------------|-----|--------------------|--------------------|-------------------|------|
| 1 | Favorites (Heart) | `header a[href*="favorites"]` | a | (none; icon only) | **ar:** المفضلة / Favorites<br>**en:** المفضلة / Favorites | aria-label="المفضلة / Favorites" | /ar/favorites or /en/favorites (locale from router) |
| 2 | Dark mode toggle | `header button.theme-toggle` | button | (none; icon only) | **ar:** Switch to dark mode / Switch to light mode<br>**en:** Same (hardcoded EN) | aria-label (see Name) | — |
| 3 | Language switcher trigger | `header [aria-label="تبديل اللغة"]` (ar) or `header [aria-label="Switch language"]` (en) | button | (none; icon only) | **ar:** تبديل اللغة<br>**en:** Switch language | aria-label from nav.languageToggle.ariaLabel | — |
| 4 | Notifications | `header button[aria-label*="الإشعارات"], header button[aria-label*="Notifications"], header button[aria-label*="تسجيل الدخول للإشعارات"], header button[aria-label*="Log in for notifications"]` | button | (none; icon only) | **ar (auth):** الإشعارات<br>**ar (guest):** تسجيل الدخول للإشعارات<br>**en (auth):** Notifications<br>**en (guest):** Log in for notifications | aria-label (see Name); disabled when status === 'loading' | — |
| 5 | User menu trigger | `header [aria-label="قائمة المستخدم"]` (ar) or `header [aria-label="User menu"]` (en) | button | (none; icon only) | **ar:** قائمة المستخدم<br>**en:** User menu | aria-label from nav.userMenuAriaLabel | — |
| 6a | Language menu: العربية | (when open) In portal; item with text "العربية" | div (role="menuitem") | العربية (and ✓ when active) | العربية | (Radix default role menuitem) | — |
| 6b | Language menu: English | (when open) In portal; item with text "English" | div (role="menuitem") | English (and ✓ when active) | English | (Radix default role menuitem) | — |
| 7a | User menu: Profile | (when open, session) In portal; item with text from t('profile') | div (role="menuitem") | **ar:** الملف الشخصي<br>**en:** Profile | Same as visible text | — | — |
| 7b | User menu: Log out | (when open, session) In portal | div (role="menuitem") | **ar:** تسجيل الخروج<br>**en:** Log out | Same as visible text | — | — |
| 7c | User menu: Log in | (when open, guest) In portal | div (role="menuitem") | **ar:** تسجيل الدخول<br>**en:** Log in | Same as visible text | — | — |
| 7d | User menu: Sign up | (when open, guest) In portal | div (role="menuitem") | **ar:** إنشاء حساب<br>**en:** Sign up | Same as visible text | — | — |

**Notes:**

- **Locale:** Visible label and Accessibility Name for nav entries differ by locale (ar vs en). Dark mode toggle uses English-only aria-label in code.
- **StatusCircles:** Two decorative divs (green dot `title="الخدمة متاحة"`, yellow dot `title="تحديثات قادمة"`) are not focusable; they are not in the interactive list above.
- **Placeholder (DarkModeToggle):** Before mount, a disabled button with `aria-hidden` and no aria-label is rendered; it is not interactive.

---

## 2. DOM → Source mapping table

| # | Element | Component name | File path | Snippet identifier (className, translation key, icon) |
|---|--------|----------------|-----------|--------------------------------------------------------|
| 1 | Favorites (Heart) | StatusCircles | `src/components/landing/StatusCircles.tsx` | `<Link href="/favorites" className="flex h-6 w-6 items-center justify-center p-0" aria-label="المفضلة / Favorites">`; inner `<Heart className="h-[26px] w-[24px] -translate-y-[1px] fill-red-500 text-red-500 hover:fill-red-400" />` (lucide-react) |
| 2 | Dark mode toggle | DarkModeToggle | `src/components/DarkModeToggle.tsx` | `<button className="theme-toggle group" ... aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>`; icons: sun SVG, moon SVG (inline in file) |
| 3 | Language switcher trigger | LanguageSwitcher | `src/components/LanguageSwitcher.tsx` | `<Button ... className="relative hover:scale-105 transition-all duration-200 p-1 h-auto" aria-label={t('ariaLabel')}>`; translation key: `nav.languageToggle.ariaLabel`; `<Globe className="h-7 w-7" />` (lucide-react) |
| 4 | Notifications | (Header) | `src/components/ui/header.tsx` | `<Button ... aria-label={status === 'authenticated' ? t('notifications') : t('notificationsLoginPrompt')}>`; keys: `nav.notifications`, `nav.notificationsLoginPrompt`; `<NotificationBellIcon className="h-7 w-7" />` from `@/components/AskSebaIcons` |
| 5 | User menu trigger | (Header) | `src/components/ui/header.tsx` | `<DropdownMenuTrigger asChild><Button ... className="relative hover:scale-105 transition-all duration-200 p-1 h-auto rounded-full" aria-label={t('userMenuAriaLabel')}>`; key: `nav.userMenuAriaLabel`; `<UserAvatarIcon className="h-7 w-7" />` from `@/components/AskSebaIcons` |
| 6a, 6b | Language menu items | LanguageSwitcher | `src/components/LanguageSwitcher.tsx` | `<DropdownMenuContent align="start" className="w-32">`; items: `DropdownMenuItem` with text "العربية", "English"; item className includes `cursor-pointer text-right` and `locale === 'ar' ? 'bg-accent' : ''` (and en equivalent) |
| 7a–7d | User menu items | (Header) | `src/components/ui/header.tsx` | `<DropdownMenuContent align="start" className="w-48">`; `DropdownMenuItem` with `className="cursor-pointer text-right"` (and variants); text from `t('profile')`, `t('logout')`, `t('login')`, `t('register')` — keys: `nav.profile`, `nav.logout`, `nav.login`, `nav.register` |

**Translation key reference (messages/ar.json, messages/en.json):**

| Key | ar | en |
|-----|----|----|
| nav.languageToggle.ariaLabel | تبديل اللغة | Switch language |
| nav.notifications | الإشعارات | Notifications |
| nav.notificationsLoginPrompt | تسجيل الدخول للإشعارات | Log in for notifications |
| nav.userMenuAriaLabel | قائمة المستخدم | User menu |
| nav.profile | الملف الشخصي | Profile |
| nav.logout | تسجيل الخروج | Log out |
| nav.login | تسجيل الدخول | Log in |
| nav.register | إنشاء حساب | Sign up |

**Radix / Button:** Dropdown triggers and content use `@radix-ui/react-dropdown-menu`; trigger renders the `Button` from `@/components/ui/button` (variant="ghost", size="sm"). Menu content is rendered via `DropdownMenuPrimitive.Portal` in `src/components/ui/dropdown-menu.tsx`.
