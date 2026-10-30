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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center font-poppins">
      <div className="p-4 rounded-2xl bg-[#FFF3C4] dark:bg-[#FFD40C]/10 text-amber-800 dark:text-[#FFD40C] mb-4 ring-8 ring-[#FFD40C]/15">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[#111111] dark:text-zinc-100">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-5 leading-relaxed">
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
