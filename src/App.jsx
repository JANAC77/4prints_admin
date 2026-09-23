import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Layout } from './components/layout/Layout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { SubcategoriesPage } from './pages/SubcategoriesPage.jsx';
import { AdminsPage } from './pages/AdminsPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategoryIdForSub, setSelectedCategoryIdForSub] = useState(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading 4Prints Console...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryForSub = (catId) => {
    setSelectedCategoryIdForSub(catId);
    setActiveTab('subcategories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout activeTab={activeTab} onSelectTab={handleNavigate}>
      {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {activeTab === 'categories' && (
        <CategoriesPage
          onSelectCategoryForSubcategories={handleSelectCategoryForSub}
        />
      )}
      {activeTab === 'subcategories' && (
        <SubcategoriesPage initialCategoryId={selectedCategoryIdForSub} />
      )}
      {activeTab === 'admins' && <AdminsPage />}
      {activeTab === 'audit-logs' && <AuditLogsPage />}
      {activeTab === 'settings' && <SettingsPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
