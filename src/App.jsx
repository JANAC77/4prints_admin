import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Layout } from './components/layout/Layout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { SubcategoriesPage } from './pages/SubcategoriesPage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { AdminsPage } from './pages/AdminsPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategoryIdForSub, setSelectedCategoryIdForSub] = useState(null);
  const [selectedCategoryIdForProduct, setSelectedCategoryIdForProduct] = useState(null);
  const [selectedSubcategoryIdForProduct, setSelectedSubcategoryIdForProduct] = useState(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF6] flex flex-col items-center justify-center text-[#111111] space-y-4 font-poppins">
        <div className="w-12 h-12 rounded-2xl bg-[#FFD40C] flex items-center justify-center shadow-lg shadow-[#FFD40C]/30 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-[#110C0B]" />
        </div>
        <p className="text-sm font-medium text-zinc-600">Loading 4Prints Console...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigate = (tab, params = {}) => {
    setActiveTab(tab);
    if (params.categoryId) {
      setSelectedCategoryIdForProduct(params.categoryId);
    }
    if (params.subcategoryId) {
      setSelectedSubcategoryIdForProduct(params.subcategoryId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryForSub = (catId) => {
    setSelectedCategoryIdForSub(catId);
    setActiveTab('subcategories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryForProducts = (catId) => {
    setSelectedCategoryIdForProduct(catId);
    setSelectedSubcategoryIdForProduct(null);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubcategoryForProducts = (subId, catId) => {
    setSelectedCategoryIdForProduct(catId || null);
    setSelectedSubcategoryIdForProduct(subId);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout activeTab={activeTab} onSelectTab={handleNavigate}>
      {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {activeTab === 'categories' && (
        <CategoriesPage
          onSelectCategoryForSubcategories={handleSelectCategoryForSub}
          onSelectCategoryForProducts={handleSelectCategoryForProducts}
        />
      )}
      {activeTab === 'subcategories' && (
        <SubcategoriesPage
          initialCategoryId={selectedCategoryIdForSub}
          onSelectSubcategoryForProducts={handleSelectSubcategoryForProducts}
        />
      )}
      {activeTab === 'products' && (
        <ProductsPage
          initialCategoryId={selectedCategoryIdForProduct}
          initialSubcategoryId={selectedSubcategoryIdForProduct}
        />
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
