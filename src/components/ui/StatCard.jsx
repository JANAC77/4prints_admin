import React from 'react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'from-[#FFD40C] to-amber-500',
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-amber-300 dark:hover:border-zinc-700 group font-poppins">
      {/* Background soft glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#FFD40C]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-zinc-100 tracking-tight">
              {value}
            </h3>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trendType === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : trendType === 'down'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-500'
                }`}
              >
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-[#110C0B] shadow-sm group-hover:scale-105 transition-transform shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
