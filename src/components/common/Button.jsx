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
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#FFD40C] hover:bg-[#e5bd00] text-[#110C0B] font-semibold shadow-sm hover:shadow-md focus:ring-[#FFD40C]',
    dark:
      'bg-[#110C0B] hover:bg-black text-white font-semibold shadow-sm focus:ring-zinc-700',
    secondary:
      'bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:ring-zinc-400',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:shadow-rose-500/25 focus:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-stone-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 focus:ring-zinc-400',
    outline:
      'bg-transparent border border-zinc-300 dark:border-zinc-700 hover:bg-[#FFD40C]/10 hover:border-[#FFD40C] text-zinc-800 dark:text-zinc-200 focus:ring-[#FFD40C]',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${className}`}
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
