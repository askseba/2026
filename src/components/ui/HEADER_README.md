# Header Component - Ask Seba PWA

## 📍 الموقع
`src/components/ui/header.tsx`

## 🎯 البنية
```
[❤️ Favorites]  [🌙 Dark Mode] [🌐 Language] [⚙️ Settings] [👤 Account Hub]
```

## ✨ المميزات

### 1. المفضلة (❤️)
- رابط مباشر إلى `/favorites`
- أيقونة Heart من lucide-react
- بدون auth guard (صفحة المفضلة تتولى ذلك)

### 2. الوضع الداكن (🌙)
- DarkModeToggle — تبديل فوري بين الفاتح والداكن

### 3. تبديل اللغة (🌐)
- LanguageSwitcher — قائمة منسدلة (العربية / English)
- تغيير locale بدون إعادة تحميل كامل

### 4. الإعدادات (⚙️)
- رابط مباشر إلى `/settings`
- أيقونة SettingsIcon من AskSebaIcons

### 5. Account Hub (👤)
**للزوار:**
- تسجيل الدخول → `/login`
- إنشاء حساب → `/register`

**للمسجلين:**
- الملف الشخصي → `/profile`
- تسجيل الخروج → `signOut({ callbackUrl: '/' })`

## 📦 التبعيات

| الحزمة | الاستخدام |
|--------|-----------|
| next-auth/react | useSession, signOut |
| next-intl | useTranslations |
| @/i18n/routing | Link, useRouter |
| @/components/ui/button | Button (ghost variant) |
| @/components/ui/dropdown-menu | DropdownMenu (Account Hub) |
| @/components/DarkModeToggle | تبديل الثيم |
| @/components/LanguageSwitcher | تبديل اللغة |
| @/components/AskSebaIcons | SettingsIcon, UserAvatarIcon |
| lucide-react | Heart |

## 🔧 الاستخدام

يُعرض عبر `ConditionalLayout.tsx` — يختفي في صفحات auth:
- `/login`
- `/register`
- `/forgot-password`

## 📱 Responsive

- **Mobile**: `gap-2`
- **Desktop**: `gap-3`
- لا يوجد hamburger menu — جميع الأيقونات ظاهرة دائماً

## 🎯 Accessibility

- `aria-label` لكل زر ورابط (من مفاتيح `nav.*`)
- دعم لوحة المفاتيح عبر Button و Radix DropdownMenu
- `focus-visible:ring-2` على جميع العناصر التفاعلية

## 📝 ملاحظات

- `dir="rtl"` ثابت على `<header>` — مشكلة معروفة (يجب أن يتبع locale)
- `signOut({ callbackUrl: '/' })` غير locale-aware — تحسين مستقبلي
- لا يوجد StatusCircles أو Notifications في الهيدر (نُقلت إلى Settings)
