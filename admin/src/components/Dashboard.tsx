import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import type { DashboardStats } from '../types';
import { PawPrint, Heart, Clock, CheckCircle2, Package } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then(res => {
      if (res.success && res.data) setStats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-sm text-on-surface-variant/60">加载中...</div>;
  if (!stats) return <div className="p-8 text-sm text-red-500">加载失败</div>;

  const cards = [
    { label: '宠物总数', value: stats.totalPets, sub: `${stats.onlinePets} 在线 / ${stats.offlinePets} 已领养`, icon: <PawPrint size={22} className="stroke-[2px]" />, color: 'bg-primary/10 text-primary' },
    { label: '待审核申请', value: stats.applications.submitted, sub: '需要处理', icon: <Clock size={22} className="stroke-[2px]" />, color: 'bg-amber-100 text-amber-600' },
    { label: '审核中', value: stats.applications.reviewing, sub: '正在处理', icon: <Heart size={22} className="stroke-[2px]" />, color: 'bg-secondary-container/30 text-secondary' },
    { label: '已完成领养', value: stats.applications.handover, sub: '已交接', icon: <CheckCircle2 size={22} className="stroke-[2px]" />, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="p-8">
      <h2 className="font-display font-bold text-xl text-on-surface mb-6">仪表盘</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-surface rounded-2xl p-5 shadow-soft border border-surface-container">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <p className="font-display font-bold text-2xl text-on-surface">{c.value}</p>
            <p className="text-xs text-on-surface-variant/70 font-semibold mt-1">{c.label}</p>
            <p className="text-[10px] text-on-surface-variant/50 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
