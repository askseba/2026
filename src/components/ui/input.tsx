'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** @deprecated Use startIcon with Lucide. Still maps: "email"|"lock"|"person" → Lucide icon */
  icon?: 'email' | 'lock' | 'person' | string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  label?: string
  error?: string
  helperText?: string
}

const iconMap = {
  email: Mail,
  lock: Lock,
  person: User,
} as const

export const Input = ({
  icon,
  startIcon,
  endIcon,
  label,
  error,
  helperText,
  type,
  className,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const StartIconLucide =
    icon && iconMap[icon as keyof typeof iconMap]
      ? iconMap[icon as keyof typeof iconMap]
      : null
  const hasStartIcon = startIcon || StartIconLucide

  return (
    <div className="w-full relative" dir="rtl">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2 ms-1">
          {label}
        </label>
      )}

      <div className="relative">
        {hasStartIcon && (
          <div className="absolute top-1/2 -translate-y-1/2 start-3 text-text-secondary pointer-events-none flex items-center justify-center z-10">
            {startIcon ? (
              startIcon
            ) : StartIconLucide ? (
              <StartIconLucide
                className={cn('size-5', error && 'text-destructive')}
                aria-hidden
              />
            ) : null}
          </div>
        )}

        <input
          type={inputType}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-2xl border-2 border-border bg-background dark:bg-surface text-base transition-all',
            'px-4 py-3',
            'placeholder:text-text-muted/80 dark:placeholder:text-slate-200/90 placeholder:opacity-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:bg-primary/5 focus-visible:border-primary',
            'dark:focus-visible:ring-accent-primary/70 dark:focus-visible:ring-offset-background dark:focus-visible:border-accent-primary',
            /* RTL-safe: ps=padding-inline-start, pe=padding-inline-end (match start-3/end-3 icon positions) */
            hasStartIcon && 'ps-12',
            (isPassword || endIcon) && 'pe-12',
            error &&
              'border-destructive bg-destructive/5 focus-visible:ring-destructive/70 focus-visible:border-destructive',
            'disabled:opacity-60 disabled:bg-muted disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />

        <div className="absolute top-1/2 -translate-y-1/2 end-3 flex items-center">
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-muted transition-colors min-touch-target flex items-center justify-center -me-1"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? (
                <EyeOff className="size-5" aria-hidden />
              ) : (
                <Eye className="size-5" aria-hidden />
              )}
            </button>
          ) : (
            endIcon && (
              <div className="text-text-secondary flex items-center justify-center p-2">
                {endIcon}
              </div>
            )
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive dark:text-red-500 mt-1.5 flex items-center gap-1 ms-1">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-text-secondary dark:text-text-muted mt-1.5 ms-1">
          {helperText}
        </p>
      )}
    </div>
  )
}
