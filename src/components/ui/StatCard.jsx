import React from 'react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'from-indigo-500 to-purple-600',
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 group">
      {/* Background soft glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100 tracking-tight">
              {value}
            </h3>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trendType === 'up'
                    ? 'text-emerald-500'
                    : trendType === 'down'
                    ? 'text-rose-500'
                    : 'text-slate-500'
                }`}
              >
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
