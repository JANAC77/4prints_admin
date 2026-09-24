import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#FFD40C] hover:bg-[#e5bd00] text-slate-950 font-bold shadow-md hover:shadow-amber-500/25 focus:ring-amber-400',
    secondary:
      'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-md hover:shadow-rose-500/25 focus:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 focus:ring-slate-400',
    outline:
      'bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-[#FFD40C]/10 text-slate-800 dark:text-slate-200 focus:ring-amber-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
