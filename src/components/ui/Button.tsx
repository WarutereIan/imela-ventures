import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'accent' | 'soft' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-[background-color,color,box-shadow,transform] duration-quick ease-gentle disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-ink-strong text-ivory hover:bg-ink shadow-soft',
  accent: 'bg-lavender-ink text-white hover:bg-[#43338A] shadow-soft',
  soft: 'bg-lavender-soft text-lavender-ink hover:bg-lavender/60',
  outline: 'border-2 border-ink-strong/80 text-ink-strong hover:bg-ink-strong hover:text-ivory',
  ghost: 'text-ink-strong hover:bg-ink/5',
  danger: 'bg-danger text-white hover:bg-[#962030]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.95rem]',
  lg: 'h-14 px-8 text-base',
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  )
);
Button.displayName = 'Button';

type LinkButtonProps = CommonProps & { to: string; state?: unknown } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export function LinkButton({ variant = 'primary', size = 'md', className, children, to, state, ...rest }: LinkButtonProps) {
  return (
    <Link to={to} state={state} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
