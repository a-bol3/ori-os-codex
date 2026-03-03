import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Ori-OS Card Component
 * 
 * Features:
 * - Dark panel background with subtle border
 * - Optional hover effects
 * - Consistent padding and spacing
 * - No rounded corners (design system)
 */

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-black text-white flex flex-col gap-6 border border-white/10 shadow-3xl transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

function CardHover({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-hover"
      className={cn(
        "bg-black text-white flex flex-col gap-6 border border-white/5 shadow-2xl transition-all duration-500",
        "hover:border-axion-orange/40 hover:shadow-[0_0_30px_rgba(255,92,0,0.1)] hover:bg-axion-obsidian/50 hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-extrabold text-lg text-white uppercase tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-white/50 text-[10px] font-mono uppercase tracking-widest", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6 border-t border-border-subtle", className)}
      {...props}
    />
  )
}

// Feature Card with gradient tint
function CardFeature({
  className,
  tint = "default",
  ...props
}: React.ComponentProps<"div"> & {
  tint?: "default" | "orange" | "blue" | "green" | "purple" | "teal" | "brown"
}) {
  return (
    <div
      data-slot="card-feature"
      className={cn(
        "bg-black text-white flex flex-col border border-white/10 shadow-3xl transition-all duration-500",
        "glass overflow-hidden relative",
        "hover:border-axion-orange/40 hover:shadow-[0_0_40px_rgba(255,92,0,0.15)]",
        className
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-axion-orange/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

// Stat Card for dashboard metrics
function CardStat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-stat"
      className={cn(
        "bg-axion-obsidian/40 text-white flex flex-col border border-white/5 p-5 shadow-inner transition-all duration-300",
        "glass-active telemetry-grid",
        "hover:border-axion-orange/40 hover:bg-axion-obsidian/60",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHover,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardFeature,
  CardStat,
}
