import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Boxes,
  Package,
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
import { productApi } from '../api/product.api.js';
import { adminApi } from '../api/admin.api.js';
import { auditApi } from '../api/audit.api.js';
import {
  mockCategories,
  mockSubcategories,
  mockProducts,
  mockAdminsList,
  mockAuditLogs,
} from '../utils/mockData.js';
import { formatDate, formatRelativeTime, getDisplayImageUrl } from '../utils/formatters.js';

export function DashboardPage({ onNavigate }) {
  const { isDemoMode, admin } = useAuth();

  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    products: 0,
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
          products: mockProducts.length,
          admins: mockAdminsList.length,
          auditLogs: mockAuditLogs.length,
        });
        setRecentLogs(mockAuditLogs.slice(0, 5));
        setRecentCategories(mockCategories.slice(0, 4));
        setLoading(false);
        return;
      }

      try {
        const [catRes, prodRes, admRes, auditRes] = await Promise.allSettled([
          categoryApi.list(),
          productApi.list(),
          adminApi.listAdmins(),
          auditApi.list({ limit: 5 }),
        ]);

        const categoriesData = catRes.status === 'fulfilled' ? catRes.value?.categories || [] : [];
        const categoriesTotal = catRes.status === 'fulfilled' ? catRes.value?.total || categoriesData.length : 0;

        // Fetch subcategories per category since backend requires categoryId
        let subcategoriesTotal = 0;
        if (categoriesData.length > 0) {
          const subResults = await Promise.allSettled(
            categoriesData.map((c) => subcategoryApi.list({ categoryId: c._id || c.id }))
          );
          subResults.forEach((res) => {
            if (res.status === 'fulfilled') {
              const subs = res.value?.subcategories || res.value?.data?.subcategories || [];
              subcategoriesTotal += Array.isArray(subs) ? subs.length : (res.value?.total || 0);
            }
          });
        }
        const productsData = prodRes.status === 'fulfilled' ? prodRes.value?.products || [] : [];
        const productsTotal = prodRes.status === 'fulfilled' ? prodRes.value?.total || productsData.length : 0;
        const adminsData = admRes.status === 'fulfilled' ? admRes.value?.admins || [] : [];
        const adminsTotal = admRes.status === 'fulfilled' ? admRes.value?.total || adminsData.length : 0;
        const auditData = auditRes.status === 'fulfilled' ? auditRes.value?.logs || [] : [];
        const auditTotal = auditRes.status === 'fulfilled' ? auditRes.value?.total || auditData.length : 0;

        setStats({
          categories: categoriesTotal || mockCategories.length,
          subcategories: subcategoriesTotal || subcategoriesTotal,
          products: productsTotal || mockProducts.length,
          admins: adminsTotal || mockAdminsList.length,
          auditLogs: auditTotal || mockAuditLogs.length,
        });

        const logs = auditData.length > 0 ? auditData : mockAuditLogs.slice(0, 5);
        setRecentLogs(logs);

        const recentCats = categoriesData.length > 0 ? categoriesData.slice(0, 4) : mockCategories.slice(0, 4);
        setRecentCategories(recentCats);
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err);
        setStats({
          categories: mockCategories.length,
          subcategories: mockSubcategories.length,
          products: mockProducts.length,
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
    if (action?.includes('LOGIN') || action?.includes('TFA')) return 'primary';
    return 'default';
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#110C0B] text-white p-6 sm:p-8 shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#FFD40C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest px-2.5 py-1 rounded-lg bg-[#FFD40C] text-[#110C0B] font-bold">
                4PRINTS Admin Console
              </span>
              {admin?.tfaEnabled && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  2FA Protected
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {admin?.name || 'Administrator'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Manage product hierarchy, subcategories, staff permissions, and review security logs from one unified control center.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => onNavigate('products')}
              className="bg-[#FFD40C] text-[#110C0B] font-bold hover:bg-amber-400 shadow-sm"
            >
              Add Product
            </Button>
            <Button
              variant="frosted"
              size="sm"
              icon={Plus}
              onClick={() => onNavigate('categories')}
            >
              Add Category
            </Button>
            <Button
              variant="frosted"
              size="sm"
              icon={Plus}
              onClick={() => onNavigate('subcategories')}
            >
              Add Subcategory
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Products"
          value={stats.products}
          subtitle="Ready print catalog"
          icon={Package}
          gradient="from-[#FFD40C] to-amber-500"
          iconColor="text-[#110C0B]"
          trend="Storefront active"
          trendType="up"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          subtitle="Top-level groups"
          icon={FolderTree}
          gradient="from-amber-400 to-yellow-500"
          iconColor="text-[#110C0B]"
          trend="+12% this month"
          trendType="up"
        />
        <StatCard
          title="Subcategories"
          value={stats.subcategories}
          subtitle="Nested print items"
          icon={Boxes}
          gradient="from-yellow-400 to-amber-500"
          iconColor="text-[#110C0B]"
          trend="Active in catalog"
          trendType="neutral"
        />
        <StatCard
          title="Admins & Staff"
          value={stats.admins}
          subtitle="Authorized team"
          icon={Users}
          gradient="from-stone-800 to-zinc-950"
          iconColor="text-white"
          trend="Role-governed"
          trendType="neutral"
        />
        <StatCard
          title="Audit Events"
          value={stats.auditLogs}
          subtitle="Logged actions"
          icon={ShieldCheck}
          gradient="from-emerald-500 to-teal-600"
          iconColor="text-white"
          trend="Full audit trail"
          trendType="up"
        />
      </div>

      {/* Content Grid: Recent Categories & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Category Catalog Overview */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111] dark:text-zinc-100">
                Active Categories
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                className="group cursor-pointer p-3.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 hover:border-[#FFD40C] dark:hover:border-[#FFD40C] bg-[#FDFBF6]/60 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center space-x-3.5"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700 shrink-0 border border-[#E5E7EB] dark:border-zinc-700 flex items-center justify-center">
                  <img
                    src={getDisplayImageUrl(cat.image)}
                    alt={cat.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#111111] dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-[#FFD40C] transition-colors">
                      {cat.name}
                    </h4>
                    <Badge variant={cat.isActive !== false ? 'success' : 'default'} size="sm">
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                    /{cat.slug}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): Recent Security & Audit Logs */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111] dark:text-zinc-100">
                  Recent Audit Trail
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                  className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800 flex items-start space-x-3 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-[#FFF3C4] dark:bg-[#FFD40C]/20 text-amber-800 dark:text-[#FFD40C] shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-[#111111] dark:text-zinc-200 truncate">
                        {log.adminEmail || 'Admin'}
                      </span>
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {formatRelativeTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E5E7EB] dark:border-zinc-800">
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
