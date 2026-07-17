import { useState, useEffect } from 'react';
import { adminApi } from './services/api';
import type { AdminPage } from './types';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import PetManager from './components/PetManager';
import ApplicationManager from './components/ApplicationManager';

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState<AdminPage>('dashboard');

  useEffect(() => {
    setLoggedIn(adminApi.isLoggedIn());
    setChecking(false);
  }, []);

  const handleLogin = (ok: boolean) => {
    setLoggedIn(ok);
    if (ok) setPage('dashboard');
  };

  const handleLogout = () => {
    adminApi.logout();
    setLoggedIn(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <p className="text-on-surface-variant/60 text-sm">加载中...</p>
      </div>
    );
  }

  if (!loggedIn) return <AdminLogin onLogin={handleLogin} />;

  return (
    <AdminLayout page={page} onNavigate={setPage} onLogout={handleLogout}>
      {page === 'dashboard' && <Dashboard />}
      {page === 'pets' && <PetManager />}
      {page === 'applications' && <ApplicationManager />}
    </AdminLayout>
  );
}
