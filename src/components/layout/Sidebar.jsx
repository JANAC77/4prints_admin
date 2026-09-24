import React from 'react';
import {
  LayoutDashboard,
  FolderTree,
  Boxes,
  Users,
  ShieldAlert,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../common/Badge.jsx';
import logoImg from '../../assets/whitelogo.png';

export function Sidebar({ activeTab, onSelectTab, isMobileOpen, setIsMobileOpen }) {
  const { admin, logout, isDemoMode } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'subcategories', label: 'Subcategories', icon: Boxes },
    { id: 'admins', label: 'Admin Team', icon: Users },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'settings', label: 'Settings & 2FA', icon: Settings },
  ];

  const handleNavClick = (id) => {
    onSelectTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#0a0d14] text-slate-100 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Official 4-PRINTS Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-3">
            <img
              src={logoImg}
              alt="4PRINTS Logo"
              className="h-9 w-auto object-contain max-w-[130px]"
            />
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-[#FFD40C] text-slate-950 shadow-sm">
              ADMIN
            </span>
          </div>
        </div>

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-xs font-medium">
            <Sparkles className="w-4 h-4 shrink-0 text-[#FFD40C]" />
            <span>Demo Mode Active</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">
            Main Management
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#FFD40C] text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-[#FFD40C]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-slate-950" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom: User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {admin?.name || 'Administrator'}
                  </p>
                  {admin?.tfaEnabled && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="2FA Enabled" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {admin?.email || 'admin@4prints.com'}
                </p>
              </div>
            </div>
            <Badge variant="purple" size="sm" className="shrink-0 uppercase">
              {admin?.role || 'Admin'}
            </Badge>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
