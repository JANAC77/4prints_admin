import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Get started by creating your first record.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 mb-4 ring-8 ring-indigo-500/5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
