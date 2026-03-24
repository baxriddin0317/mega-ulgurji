import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const alertVariants = cva('flex items-stretch w-full gap-2', {
  variants: {
    variant: {
      secondary: '',
      primary: '',
      destructive: '',
      success: '',
      info: '',
      mono: '',
      warning: '',
    },
    appearance: {
      solid: '',
      outline: '',
      light: '',
    },
    size: {
      lg: 'rounded-lg p-4 gap-3 text-base [&>[data-slot=alert-icon]>svg]:size-6 *:data-slot=alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-1',
      md: 'rounded-lg p-3.5 gap-2.5 text-sm [&>[data-slot=alert-icon]>svg]:size-5 *:data-slot=alert-icon:mt-0 [&_[data-slot=alert-close]]:mt-0.5',
      sm: 'rounded-md px-3 py-2.5 gap-2 text-xs [&>[data-slot=alert-icon]>svg]:size-4 [&_[data-slot=alert-close]_svg]:size-3.5',
    },
  },
  compoundVariants: [
    /* Solid */
    { variant: 'secondary', appearance: 'solid', className: 'bg-muted text-foreground' },
    { variant: 'primary', appearance: 'solid', className: 'bg-primary text-primary-foreground' },
    { variant: 'destructive', appearance: 'solid', className: 'bg-destructive text-white' },
    { variant: 'success', appearance: 'solid', className: 'bg-green-500 text-white' },
    { variant: 'info', appearance: 'solid', className: 'bg-violet-600 text-white' },
    { variant: 'warning', appearance: 'solid', className: 'bg-yellow-500 text-white' },
    { variant: 'mono', appearance: 'solid', className: 'bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black' },

    /* Outline */
    { variant: 'secondary', appearance: 'outline', className: 'border border-border bg-background text-foreground' },
    { variant: 'primary', appearance: 'outline', className: 'border border-border bg-background text-primary' },
    { variant: 'destructive', appearance: 'outline', className: 'border border-border bg-background text-destructive' },
    { variant: 'success', appearance: 'outline', className: 'border border-border bg-background text-green-600' },
    { variant: 'info', appearance: 'outline', className: 'border border-border bg-background text-violet-600' },
    { variant: 'warning', appearance: 'outline', className: 'border border-border bg-background text-yellow-600' },
    { variant: 'mono', appearance: 'outline', className: 'border border-border bg-background text-foreground' },

    /* Light */
    { variant: 'secondary', appearance: 'light', className: 'bg-muted border border-border text-foreground' },
    { variant: 'primary', appearance: 'light', className: 'text-foreground bg-blue-50 border border-blue-100 [&_[data-slot=alert-icon]]:text-primary dark:bg-blue-950 dark:border-blue-900' },
    { variant: 'destructive', appearance: 'light', className: 'bg-red-50 border border-red-100 text-foreground [&_[data-slot=alert-icon]]:text-destructive dark:bg-red-950 dark:border-red-900' },
    { variant: 'success', appearance: 'light', className: 'bg-green-50 border border-green-200 text-foreground [&_[data-slot=alert-icon]]:text-green-600 dark:bg-green-950 dark:border-green-900' },
    { variant: 'info', appearance: 'light', className: 'bg-violet-50 border border-violet-100 text-foreground [&_[data-slot=alert-icon]]:text-violet-600 dark:bg-violet-950 dark:border-violet-900' },
    { variant: 'warning', appearance: 'light', className: 'bg-yellow-50 border border-yellow-200 text-foreground [&_[data-slot=alert-icon]]:text-yellow-600 dark:bg-yellow-950 dark:border-yellow-900' },
  ],
  defaultVariants: {
    variant: 'secondary',
    appearance: 'solid',
    size: 'md',
  },
});

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  close?: boolean;
  onClose?: () => void;
}

function Alert({ className, variant, size, appearance, close = false, onClose, children, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, size, appearance }), className)}
      {...props}
    >
      {children}
      {close && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Yopish"
          data-slot="alert-close"
          className={cn('shrink-0 size-6 p-0')}
        >
          <X className="opacity-60 hover:opacity-100 size-4" />
        </Button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <div data-slot="alert-title" className={cn('grow tracking-tight font-semibold', className)} {...props} />;
}

function AlertIcon({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="alert-icon" className={cn('shrink-0', className)} {...props}>
      {children}
    </div>
  );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-sm [&_p]:leading-relaxed [&_p]:mb-2', className)}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="alert-content"
      className={cn('space-y-1 [&_[data-slot=alert-title]]:font-semibold', className)}
      {...props}
    />
  );
}

export { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle };
