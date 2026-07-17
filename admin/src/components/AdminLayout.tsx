import type { AdminPage } from '../types';
import type { ReactNode } from 'react';
import { LayoutDashboard, PawPrint, FileText, LogOut } from 'lucide-react';

interface Props {
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
  children: ReactNode;
}

const NAV: { key: AdminPage; label: string; icon: ReactNode }[] = [
  { key: 'dashboard', label: '仪表盘', icon: <LayoutDashboard size={18} className="stroke-[2px]" /> },
  { key: 'pets', label: '宠物管理', icon: <PawPrint size={18} className="stroke-[2px]" /> },
  { key: 'applications', label: '领养审批', icon: <FileText size={18} className="stroke-[2px]" /> },
];

export default function AdminLayout({ page, onNavigate, onLogout, children }: Props) {
  return (
    <div className="min-h-screen bg-background font-sans flex">
      {/* Sidebar */}
      <aside className="w-56 bg-surface border-r border-surface-container flex flex-col shrink-0">
        <div className="p-5 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <h1 className="font-display font-bold text-base text-primary">爱宠宜家</h1>
          </div>
          <p className="text-[10px] text-on-surface-variant/50 mt-1 font-medium">后台管理系统</p>
        </div>

        <nav className="flex-grow p-3 space-y-1">
          {NAV.map(n => (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                page === n.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-container">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant/60 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} className="stroke-[2px]" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto">
        {children}
      </main>
    </div>
  );
}
