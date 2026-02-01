import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'strong' | 'subtle'
  hover?: boolean
}

export function Card({
  children,
  className,
  variant = 'glass',
  hover = false
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        {
          'glass-card': variant === 'glass',
          'glass-strong': variant === 'strong',
          'glass-subtle': variant === 'subtle',
          'bg-white/80 backdrop-blur-lg border border-white/30 shadow-xl':
            variant === 'default',
          'card-hover': hover,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-white/20', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-slate-900', className)}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-600 mt-1', className)}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-white/20', className)}>
      {children}
    </div>
  )
}
