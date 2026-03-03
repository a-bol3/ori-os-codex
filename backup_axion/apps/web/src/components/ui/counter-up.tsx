'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface CounterUpProps {
  /** The target value to count up to */
  value: number
  /** Duration of the animation in milliseconds */
  duration?: number
  /** Number of decimal places to show */
  decimals?: number
  /** Format type */
  format?: 'number' | 'percentage' | 'currency' | 'compact' | 'time' | 'none'
  /** Currency symbol (for currency format) */
  currencySymbol?: string
  /** Prefix to add before the value */
  prefix?: string
  /** Suffix to add after the value */
  suffix?: string
  /** Whether to start animation automatically when in view */
  startOnView?: boolean
  /** Custom class name */
  className?: string
  /** Additional text/label below the counter */
  label?: string
  /** Easing function */
  easing?: 'linear' | 'easeOut' | 'easeInOut'
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
}

// Format number based on type
function formatValue(
  value: number,
  format: CounterUpProps['format'],
  decimals: number,
  currencySymbol: string
): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(decimals)}%`
    case 'currency':
      if (value >= 1000000) {
        return `${currencySymbol}${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${currencySymbol}${(value / 1000).toFixed(0)}K`
      }
      return `${currencySymbol}${value.toFixed(decimals)}`
    case 'compact':
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toFixed(decimals)
    case 'time':
      if (value >= 60) {
        const hours = Math.floor(value / 60)
        return `${hours}h`
      }
      return `${value.toFixed(0)}m`
    case 'none':
      return value.toFixed(decimals)
    case 'number':
    default:
      return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
  }
}

export function CounterUp({
  value,
  duration = 2000,
  decimals = 0,
  format = 'number',
  currencySymbol = '$',
  prefix = '',
  suffix = '',
  startOnView = true,
  className,
  easing = 'easeOut',
}: CounterUpProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(!startOnView)
  const elementRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Intersection Observer to start animation when in view
  useEffect(() => {
    if (!startOnView) return

    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true)
            observer.unobserve(element)
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [startOnView, hasStarted])

  // Start animation when hasStarted becomes true
  useEffect(() => {
    if (!hasStarted) return

    // Store refs to avoid stale closure issues
    const animateRef = animationRef
    const startRef = startTimeRef

    const animate = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp
      }

      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFunctions[easing](progress)
      const currentValue = easedProgress * value

      setDisplayValue(currentValue)

      if (progress < 1) {
        animateRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    animateRef.current = requestAnimationFrame(animate)

    return () => {
      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current)
      }
    }
  }, [hasStarted, value, duration, easing])

  const formattedValue = formatValue(displayValue, format, decimals, currencySymbol)

  return (
    <span ref={elementRef} className={cn('tabular-nums', className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

// Preset components for common use cases
export function CounterPercentage({
  value,
  className,
  ...props
}: Omit<CounterUpProps, 'format' | 'value'> & { value: number }) {
  return (
    <CounterUp
      value={value}
      format="percentage"
      decimals={value % 1 === 0 ? 0 : 1}
      className={className}
      {...props}
    />
  )
}

export function CounterCurrency({
  value,
  className,
  currencySymbol = '$',
  ...props
}: Omit<CounterUpProps, 'format' | 'value'> & { value: number }) {
  return (
    <CounterUp
      value={value}
      format="currency"
      currencySymbol={currencySymbol}
      decimals={0}
      className={className}
      {...props}
    />
  )
}

export function CounterCompact({
  value,
  className,
  suffix = '',
  ...props
}: Omit<CounterUpProps, 'format' | 'value'> & { value: number }) {
  return (
    <CounterUp
      value={value}
      format="compact"
      suffix={suffix}
      decimals={1}
      className={className}
      {...props}
    />
  )
}

export function CounterNumber({
  value,
  className,
  suffix = '',
  ...props
}: Omit<CounterUpProps, 'format' | 'value'> & { value: number }) {
  return (
    <CounterUp
      value={value}
      format="number"
      suffix={suffix}
      decimals={0}
      className={className}
      {...props}
    />
  )
}

export default CounterUp
