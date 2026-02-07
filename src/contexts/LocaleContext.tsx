'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Locale = 'ar' | 'en';
const STORAGE_KEY = 'locale';

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void } | null>(null);

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  return ctx?.locale ?? 'ar';
}

export function useSetLocale() {
  return useContext(LocaleContext)?.setLocale ?? (() => {});
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as Locale | null)) || 'ar';
    setLocaleState(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale, mounted]);

  function setLocale(l: Locale) {
    setLocaleState(l);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
