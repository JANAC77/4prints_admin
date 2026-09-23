import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Server,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { checkBackendHealth, getApiBaseUrl } from '../../api/client.js';

export function Header({ activeTab, onToggleMobileSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { isDemoMode } = useAuth();
  const [serverStatus, setServerStatus] = useState({
    checking: true,
    online: false,
    latency: null,
  });

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', sub: 'Overview & system health' };
      case 'categories':
        return { title: 'Categories', sub: 'Product catalog hierarchy' };
      case 'subcategories':
        return { title: 'Subcategories', sub: 'Granular product classifications' };
      case 'admins':
        return { title: 'Admin Team', sub: 'Manage administrators & security' };
      case 'audit-logs':
        return { title: 'Audit Logs', sub: 'Security events & activity timeline' };
      case 'settings':
        return { title: 'Settings & 2FA', sub: 'API connection & authentication' };
      default:
        return { title: 'Admin Console', sub: '4Prints Store Administration' };
    }
  };

  const pingServer = async () => {
    setServerStatus((prev) => ({ ...prev, checking: true }));
    const result = await checkBackendHealth();
    setServerStatus({
      checking: false,
      online: result.online,
      latency: result.latency,
    });
  };

  useEffect(() => {
    pingServer();
    const interval = setInterval(pingServer, 30000); // Ping every 30s
    return () => clearInterval(interval);
  }, []);

  const page = getPageTitle();

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile trigger & Page Info */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-slate-100 leading-tight">
            {page.title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            {page.sub}
          </p>
        </div>
      </div>

      {/* Right: Server Status, Theme Toggle, Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Server Status Pill */}
        <div
          onClick={pingServer}
          title={
            serverStatus.online
              ? `Backend Connected (${serverStatus.latency}ms latency). Click to refresh.`
              : 'Backend not reachable on ' + (getApiBaseUrl() || 'localhost:3000') + '. Click to retry.'
          }
          className={`cursor-pointer px-2.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all ${
            serverStatus.online
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                serverStatus.online ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                serverStatus.online ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="hidden md:inline">
            {serverStatus.checking
              ? 'Checking...'
              : serverStatus.online
              ? `Backend Live (${serverStatus.latency}ms)`
              : 'Backend Offline'}
          </span>
          <RefreshCw className={`w-3 h-3 ${serverStatus.checking ? 'animate-spin' : 'opacity-60'}`} />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle dark/light theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
}
