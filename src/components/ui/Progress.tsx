import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'turf' | 'gold' | 'crimson';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function Progress({
  className,
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const baseStyles = 'relative overflow-hidden rounded-full';
  
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };
  
  const variantStyles = {
    default: 'bg-slate-700',
    turf: 'bg-turf-900',
    gold: 'bg-gold-900',
    crimson: 'bg-crimson-900',
  };
  
  const fillVariantStyles = {
    default: 'bg-slate-500',
    turf: 'bg-turf-500',
    gold: 'bg-gold-500',
    crimson: 'bg-crimson-500',
  };
  
  return (
    <div
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={clsx(
          'h-full rounded-full transition-all duration-300 ease-out',
          fillVariantStyles[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
