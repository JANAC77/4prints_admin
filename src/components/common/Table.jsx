import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className={`w-full text-left text-sm text-slate-600 dark:text-slate-300 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
      {children}
    </thead>
  );
}

export function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors last:border-0 ${
        onClick ? 'cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', isHeader = false }) {
  if (isHeader) {
    return <th className={`px-4 py-3.5 tracking-wider ${className}`}>{children}</th>;
  }
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
}
