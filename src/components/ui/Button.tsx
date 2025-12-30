import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'btn font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'btn-primary hover:shadow-lg hover:shadow-turf-500/20',
      secondary: 'btn-secondary hover:shadow-lg hover:shadow-slate-500/20',
      gold: 'btn-gold hover:shadow-lg hover:shadow-gold-500/20',
      ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white',
      danger: 'bg-crimson-600 hover:bg-crimson-500 text-white hover:shadow-lg hover:shadow-crimson-500/20',
    };
    
    const sizeStyles = {
      sm: 'px-3.5 py-2 text-xs',
      md: 'px-3 py-2 md:px-4 text-sm md:text-base',
      lg: 'px-5 py-2.5 md:px-6 text-base md:text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
