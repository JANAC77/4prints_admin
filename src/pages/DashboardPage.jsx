import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Boxes,
  Users,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Server,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { categoryApi } from '../api/category.api.js';
import { subcategoryApi } from '../api/subcategory.api.js';
import { adminApi } from '../api/admin.api.js';
import { auditApi } from '../api/audit.api.js';
import { mockCategories, mockSubcategories, mockAdminsList, mockAuditLogs } from '../utils/mockData.js';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';

export function DashboardPage({ onNavigate }) {
  const { isDemoMode, admin } = useAuth();

  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    admins: 0,
    auditLogs: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentCategories, setRecentCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      if (isDemoMode) {
        setStats({
          categories: mockCategories.length,
          subcategories: mockSubcategories.length,
          admins: mockAdminsList.length,
          auditLogs: mockAuditLogs.length,
        });
        setRecentLogs(mockAuditLogs.slice(0, 5));
        setRecentCategories(mockCategories.slice(0, 4));
        setLoading(false);
        return;
      }

      try {
        const [catRes, subRes, admRes, auditRes] = await Promise.allSettled([
          categoryApi.list(),
          subcategoryApi.list({}),
          adminApi.listAdmins(),
          auditApi.list({ limit: 5 }),
        ]);

        const categoriesData = catRes.status === 'fulfilled' ? catRes.value?.categories || [] : [];
        const categoriesTotal = catRes.status === 'fulfilled' ? catRes.value?.total || categoriesData.length : 0;
        const subcategoriesData = subRes.status === 'fulfilled' ? subRes.value?.subcategories || [] : [];
        const subcategoriesTotal = subRes.status === 'fulfilled' ? subRes.value?.total || subcategoriesData.length : 0;
        const adminsData = admRes.status === 'fulfilled' ? admRes.value?.admins || [] : [];
        const adminsTotal = admRes.status === 'fulfilled' ? admRes.value?.total || adminsData.length : 0;
        const auditData = auditRes.status === 'fulfilled' ? auditRes.value?.logs || [] : [];
        const auditTotal = auditRes.status === 'fulfilled' ? auditRes.value?.total || auditData.length : 0;

        setStats({
          categories: categoriesTotal || mockCategories.length,
          subcategories: subcategoriesTotal || subcategoriesData.length,
          admins: adminsTotal || mockAdminsList.length,
          auditLogs: auditTotal || mockAuditLogs.length,
        });

        setRecentCategories(categoriesData.length > 0 ? categoriesData : mockCategories.slice(0, 4));
        setRecentLogs(auditData.length > 0 ? auditData : mockAuditLogs.slice(0, 5));
      } catch (err) {
        console.warn('Using fallback data for dashboard:', err);
        setStats({
          categories: mockCategories.length,
          subcategories: mockSubcategories.length,
          admins: mockAdminsList.length,
          auditLogs: mockAuditLogs.length,
        });
        setRecentLogs(mockAuditLogs.slice(0, 5));
        setRecentCategories(mockCategories.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isDemoMode]);

  const getActionBadgeVariant = (action) => {
    if (action?.includes('CREATE')) return 'success';
    if (action?.includes('UPDATE')) return 'primary';
    if (action?.includes('DELETE')) return 'danger';
    if (action?.includes('LOGIN') || action?.includes('TFA')) return 'purple';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#FFD40C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-lg bg-[#FFD40C] text-slate-950 font-bold">
                4PRINTS Admin Console
              </span>
              {admin?.tfaEnabled && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  2FA Protected
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
              Welcome back, {admin?.name || 'Administrator'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Manage product hierarchy, subcategories, staff permissions, and review security logs from one unified control center.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => onNavigate('categories')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Add Category
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => onNavigate('subcategories')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Add Subcategory
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Categories"
          value={stats.categories}
          subtitle="Top-level product groups"
          icon={FolderTree}
          gradient="from-indigo-500 to-indigo-600"
          trend="+12% this month"
          trendType="up"
        />
        <StatCard
          title="Subcategories"
          value={stats.subcategories}
          subtitle="Nested product types"
          icon={Boxes}
          gradient="from-blue-500 to-cyan-600"
          trend="Active in catalog"
          trendType="neutral"
        />
        <StatCard
          title="Admins & Staff"
          value={stats.admins}
          subtitle="Authorized team members"
          icon={Users}
          gradient="from-purple-500 to-pink-600"
          trend="Role-governed"
          trendType="neutral"
        />
        <StatCard
          title="Audit Security Events"
          value={stats.auditLogs}
          subtitle="Logged admin actions"
          icon={ShieldCheck}
          gradient="from-emerald-500 to-teal-600"
          trend="Full audit trail"
          trendType="up"
        />
      </div>

      {/* Content Grid: Recent Categories & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Category Catalog Overview */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                Active Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primary sections displayed in the 4Prints storefront
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowUpRight}
              onClick={() => onNavigate('categories')}
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {recentCategories.map((cat) => (
              <div
                key={cat._id || cat.slug}
                onClick={() => onNavigate('categories')}
                className="group cursor-pointer p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center space-x-3.5"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-700">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h4>
                    <Badge variant={cat.isActive !== false ? 'success' : 'default'} size="sm">
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                    /{cat.slug}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): Recent Security & Audit Logs */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                  Recent Audit Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest administrative operations
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowUpRight}
                onClick={() => onNavigate('audit-logs')}
              >
                Explore
              </Button>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log, idx) => (
                <div
                  key={log._id || idx}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-start space-x-3 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                        {log.adminEmail || 'Admin'}
                      </span>
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatRelativeTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onNavigate('audit-logs')}
            >
              View Full Security Audit Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
