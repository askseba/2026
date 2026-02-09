'use client';

import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BackButtonProps {
  /** Optional: specific destination (uses Next.js Link when provided) */
  href?: string;
  /** Optional: custom click handler (takes precedence over router.back when no href) */
  onClick?: () => void;
  /** Optional: override default label */
  label?: string;
  /** Visual variant */
  variant?: 'link' | 'button' | 'ghost';
  /** Optional: additional CSS classes */
  className?: string;
  /** Optional: override aria-label for accessibility */
  ariaLabel?: string;
}

const variantStyles = {
  link: 'text-primary hover:text-primary-dark dark:text-accent-primary dark:hover:text-accent-primary/90 underline-offset-4 hover:underline bg-transparent',
  button: 'border border-text-secondary dark:border-border-subtle text-text-primary dark:text-text-primary rounded-lg px-4 py-2 hover:bg-surface-muted dark:hover:bg-surface-elevated/50 min-h-touch',
  ghost: 'text-text-primary dark:text-text-primary hover:bg-cream-bg dark:hover:bg-surface-muted rounded-lg px-3 py-2 min-h-touch',
} as const;

export function BackButton({
  href,
  onClick,
  label,
  variant = 'link',
  className,
  ariaLabel,
}: BackButtonProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');

  const isRTL = locale === 'ar';
  const defaultLabel = label ?? t('back');
  const defaultAriaLabel = ariaLabel ?? t('backAriaLabel');

  const icon = (
    <ChevronLeft
      className={cn('h-4 w-4 flex-shrink-0 me-2', isRTL && 'rotate-180')}
      aria-hidden
    />
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!href) {
      router.back();
    }
  };

  const baseClasses = cn(
    'inline-flex items-center',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-accent-primary',
    'min-w-touch',
    variantStyles[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} aria-label={defaultAriaLabel}>
        {icon}
        <span>{defaultLabel}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={baseClasses}
      aria-label={defaultAriaLabel}
    >
      {icon}
      <span>{defaultLabel}</span>
    </button>
  );
}
