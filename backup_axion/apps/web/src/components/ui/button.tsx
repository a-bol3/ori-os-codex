import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Ori-OS Button Component
 * 
 * Variants:
 * - default: Primary orange CTA - used for main actions
 * - secondary: Dark gunmetal - used for secondary actions
 * - outline: Transparent with border - used for tertiary actions
 * - ghost: Minimal style - used for subtle actions
 * - destructive: Red - used for destructive actions
 * - link: Text only with underline on hover
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-axion-orange focus-visible:ring-offset-1 focus-visible:ring-offset-axion-obsidian uppercase tracking-[0.15em] font-mono",
  {
    variants: {
      variant: {
        // Primary - Axion Orange
        default:
          "bg-axion-orange text-black shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] hover:translate-y-[-1px] active:translate-y-[0px] border border-transparent",

        // Secondary - Dark obsidian glass
        secondary:
          "glass text-white hover:bg-white/5 active:bg-white/10 border border-white/10",

        // Outline - Ghostly orange
        outline:
          "bg-transparent text-axion-orange border border-axion-orange/20 hover:bg-axion-orange/5 hover:border-axion-orange/40 active:bg-axion-orange/10",

        // Ghost - Minimal labels
        ghost:
          "bg-transparent text-white/60 hover:text-white hover:bg-white/5",

        // Destructive - Terminal Red
        destructive:
          "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",

        // Link - Technical Ref
        link:
          "text-axion-orange underline-offset-4 hover:underline",

        // Marketing Primary - Glowing Orange
        "marketing-primary":
          "bg-axion-orange text-black font-extrabold shadow-[0_0_25px_rgba(255,165,0,0.4)] hover:shadow-[0_0_40px_rgba(255,165,0,0.6)]",

        // Marketing Secondary - Outlined technical
        "marketing-secondary":
          "bg-transparent text-white border border-white/20 hover:bg-white/5 hover:border-white/40",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-6 text-base has-[>svg]:px-4",
        xl: "h-14 px-8 text-lg has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
