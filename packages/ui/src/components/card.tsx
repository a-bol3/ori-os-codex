import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const cardVariants = cva(
    'transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground border border-border shadow-sm',
                glass: 'glass-card',
                'glass-lg': 'glass-card-lg',
                ghost: 'bg-transparent',
                elevated: 'bg-card text-card-foreground shadow-glass',
                outline: 'border border-border bg-transparent',
            },
            hover: {
                none: '',
                lift: 'axion-card-hover',
                glow: 'hover:shadow-glow axion-card-hover',
                scale: 'hover:scale-[1.02] axion-card-hover',
            },
            padding: {
                none: '',
                sm: 'p-4',
                default: 'p-6',
                lg: 'p-8',
            },
            rounded: {
                default: 'rounded-none',
                md: 'rounded-none',
                lg: 'rounded-none',
                none: 'rounded-none',
            },
        },
        defaultVariants: {
            variant: 'default',
            hover: 'none',
            padding: 'default',
            rounded: 'default',
        },
    }
);

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, hover, padding, rounded, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant, hover, padding, rounded, className }))}
            {...props}
        />
    )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 pb-4', className)}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center pt-4', className)}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
