'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CounterUp, type CounterUpProps } from '@/components/ui/counter-up'
import { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  /** Label/title for the stat */
  label: string
  /** Target value for the counter */
  value: number
  /** Counter format type */
  format?: 'number' | 'percentage' | 'currency' | 'compact' | 'time' | 'none'
  /** Prefix (e.g., "$" for currency) */
  prefix?: string
  /** Suffix (e.g., "+" for "1000+") */
  suffix?: string
  /** Subtitle or description */
  subtitle?: string
  /** Icon to display */
  icon?: LucideIcon
  /** Icon color class */
  iconColor?: string
  /** Animation delay (ms) */
  delay?: number
  /** Custom className */
  className?: string
  /** Click handler */
  onClick?: () => void
  /** Whether this is a small stat */
  size?: 'default' | 'sm' | 'lg'
  /** Trend indicator */
  trend?: 'up' | 'down' | 'neutral'
  /** Trend value */
  trendValue?: string
  /** Decimal places */
  decimals?: number
}

export function StatCard({
  label,
  value,
  format = 'number',
  prefix,
  suffix,
  subtitle,
  icon: Icon,
  iconColor = 'text-ori-orange',
  delay = 0,
  className,
  onClick,
  size = 'default',
  trend,
  trendValue,
  decimals,
}: StatCardProps) {
  const sizeClasses = {
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }

  const valueSizeClasses = {
    sm: 'text-2xl',
    default: 'text-3xl',
    lg: 'text-4xl md:text-5xl',
  }

  const labelSizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
  }

  // Determine decimals based on format if not specified
  const autoDecimals = decimals ?? (format === 'percentage' && value % 1 !== 0 ? 1 : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className={cn(
        'bg-ori-panel border border-border-subtle transition-all duration-200',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:border-ori-orange/30 hover:bg-ori-panel-light',
        className
      )}
      onClick={onClick}
    >
      {Icon && (
        <div className={cn('mb-3', iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div className={cn('font-bold text-text-primary tabular-nums', valueSizeClasses[size])}>
        {prefix && <span>{prefix}</span>}
        <CounterUp
          value={value}
          format={format}
          suffix={suffix}
          decimals={autoDecimals}
          duration={2000 + delay}
        />
      </div>

      <p className={cn('text-text-secondary mt-1', labelSizeClasses[size])}>
        {label}
      </p>

      {subtitle && (
        <p className="text-xs text-text-muted mt-2">{subtitle}</p>
      )}

      {trend && trendValue && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs font-medium',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-error',
          trend === 'neutral' && 'text-text-muted'
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </motion.div>
  )
}

// Grid component for multiple stats
export interface StatGridProps {
  stats: StatCardProps[]
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({ stats, columns = 4, className }: StatGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} delay={index * 100} />
      ))}
    </div>
  )
}

// Simple inline stat for use in text
export interface InlineStatProps {
  value: number
  format?: CounterUpProps['format']
  prefix?: string
  suffix?: string
  label?: string
  className?: string
}

export function InlineStat({
  value,
  format = 'number',
  prefix,
  suffix,
  label,
  className,
}: InlineStatProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      {prefix && <span className="text-ori-orange">{prefix}</span>}
      <CounterUp
        value={value}
        format={format}
        suffix={suffix}
        duration={1500}
        className="font-bold text-text-primary"
      />
      {label && <span className="text-text-secondary text-sm ml-1">{label}</span>}
    </span>
  )
}

export default StatCard
