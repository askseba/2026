'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Bell, CheckCircle2, Clock, Info } from 'lucide-react';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/notifications');
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

  // Mock notifications data (يمكن استبدالها بـ API call)
  interface Notification {
    type: 'success' | 'info' | 'pending';
    title: string;
    message: string;
    date: string;
  }
  const notifications: Notification[] = [];

  return (
    <div className="min-h-screen bg-cream-bg/50 dark:!bg-surface" dir="rtl">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-brown-text mb-4 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            الإشعارات
          </h1>
          <p className="text-lg text-brown-text/85">
            عرض جميع إشعاراتك والتحديثات
          </p>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl p-12 shadow-sm border-2 border-brown-text/5 text-center">
              <Bell className="w-16 h-16 text-brown-text/30 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-brown-text mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-brown-text/75">
                لم تصلك أي إشعارات بعد. سيظهر هنا أي تحديثات جديدة.
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-2 border-brown-text/5 hover:border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {notification.type === 'info' && (
                      <Info className="w-5 h-5 text-blue-600" />
                    )}
                    {notification.type === 'pending' && (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brown-text mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-brown-text/75 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-brown-text/40">
                      {notification.date}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
