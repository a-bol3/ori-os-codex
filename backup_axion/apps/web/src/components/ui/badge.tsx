import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Ori-OS Badge Component
 * 
 * Variants:
 * - default: Primary orange
 * - secondary: Dark panel background
 * - outline: Transparent with border
 * - success: Green for positive states
 * - warning: Yellow for warnings
 * - error: Red for errors
 */

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2.5 py-0.5 text-[10px] font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-300 overflow-hidden uppercase tracking-[0.1em] font-mono",
  {
    variants: {
      variant: {
        // Primary - Axion Orange Glow
        default:
          "border-axion-orange/30 bg-axion-orange/10 text-axion-orange shadow-[0_0_10px_rgba(255,165,0,0.2)]",

        // Secondary - Obsidian Tech
        secondary:
          "border-white/10 bg-white/5 text-white/80",

        // Outline - Technical Frame
        outline:
          "bg-transparent text-white/60 border-white/20",

        // Success - System Access Green
        success:
          "bg-axion-green/10 text-axion-green border-axion-green/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]",

        // Warning - High Volatility Orange
        warning:
          "bg-orange-500/10 text-orange-400 border-orange-500/30",

        // Error/Destructive - Terminal Alert Red
        destructive:
          "bg-red-500/10 text-red-500 border-red-500/30",

        // Info - Core Stream Blue
        info:
          "bg-blue-500/10 text-blue-400 border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
