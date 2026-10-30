import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-xl font-semibold',
  };

  const variantStyles = {
    default: 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
    primary: 'bg-[#FFF3C4] text-amber-950 dark:bg-[#FFD40C]/20 dark:text-yellow-300 border border-yellow-300 dark:border-[#FFD40C]/40 font-semibold',
    yellow: 'bg-[#FFF3C4] text-amber-900 border border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800/50',
    dark: 'bg-[#110C0B] text-white border border-zinc-800',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none tracking-wide select-none ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {children}
    </span>
  );
}
