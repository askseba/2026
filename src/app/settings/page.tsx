'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Settings, Bell, Globe, Shield, User } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/settings');
    return (
      <div className="min-h-screen bg-cream-bg/50 dark:!bg-surface flex items-center justify-center">
        <LoadingSpinner message="جاري التحويل..." />
      </div>
    );
  }

  // Show loading while checking session
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-cream-bg/50 dark:!bg-surface flex items-center justify-center">
        <LoadingSpinner message="جاري التحميل..." />
      </div>
    );
  }

  const settingsSections = [
    {
      id: 'profile',
      title: 'الملف الشخصي',
      icon: <User className="w-5 h-5 text-brown-text" />,
      description: 'إدارة معلوماتك الشخصية',
      href: '/profile',
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: <Bell className="w-5 h-5 text-brown-text" />,
      description: 'التحكم في الإشعارات',
      href: '#',
    },
    {
      id: 'language',
      title: 'اللغة',
      icon: <Globe className="w-5 h-5 text-brown-text" />,
      description: 'اختر لغة الواجهة',
      href: '#',
    },
    {
      id: 'privacy',
      title: 'الخصوصية والأمان',
      icon: <Shield className="w-5 h-5 text-brown-text" />,
      description: 'إعدادات الخصوصية',
      href: '/privacy',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-bg/50 dark:!bg-surface" dir="rtl">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-brown-text mb-4 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            الإعدادات
          </h1>
          <p className="text-lg text-brown-text/85">
            إدارة إعدادات حسابك وتفضيلاتك
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {settingsSections.map((section) => (
            <a
              key={section.id}
              href={section.href}
              className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-2 border-brown-text/5 hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-brown-text mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-brown-text/75">
                    {section.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
