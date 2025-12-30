import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const baseStyles = 'card';
  
  const variantStyles = {
    default: 'bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 lg:p-6',
    elevated: 'bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 lg:p-6 shadow-xl shadow-slate-900/50',
    bordered: 'bg-slate-900 border-2 border-turf-600 rounded-xl p-4 md:p-5 lg:p-6',
  };
  
  return (
    <div className={clsx(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mb-3 md:mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx('font-display font-bold text-lg md:text-xl text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('text-slate-300', className)} {...props}>
      {children}
    </div>
  );
}
