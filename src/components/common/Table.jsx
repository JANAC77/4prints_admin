import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs font-poppins">
      <table className={`w-full text-left text-sm text-[#374151] dark:text-zinc-300 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-[#FDFBF6] dark:bg-zinc-800/60 text-xs uppercase font-semibold text-zinc-600 dark:text-zinc-400 border-b border-[#E5E7EB] dark:border-zinc-800">
      {children}
    </thead>
  );
}

export function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-[#F3F4F6] dark:border-zinc-800/60 transition-colors last:border-0 ${
        onClick
          ? 'cursor-pointer hover:bg-[#FFD40C]/10 dark:hover:bg-[#FFD40C]/10'
          : 'hover:bg-stone-50/80 dark:hover:bg-zinc-800/40'
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', isHeader = false }) {
  if (isHeader) {
    return <th className={`px-4 py-3.5 tracking-wider font-semibold ${className}`}>{children}</th>;
  }
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
}
