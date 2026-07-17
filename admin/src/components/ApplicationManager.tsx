import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import type { AdoptionApplication } from '../types';
import { Check, X, Eye, MessageSquare, Home, TreePine } from 'lucide-react';

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  submitted: { text: '待审核', color: 'bg-amber-100 text-amber-700' },
  reviewing: { text: '审核中', color: 'bg-blue-100 text-blue-700' },
  handover: { text: '已完成', color: 'bg-green-100 text-green-700' },
};

export default function ApplicationManager() {
  const [apps, setApps] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailApp, setDetailApp] = useState<AdoptionApplication | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getApplications({
      status: statusFilter || undefined,
      limit: 100,
    });
    if (res.success && res.data) setApps(res.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleApprove = async (id: string, petName: string) => {
    if (!confirm(`确认通过「${petName}」的领养申请吗？宠物将在App中自动下线，并发送通知给用户。`)) return;
    setActionLoading(id);
    const res = await adminApi.approveApplication(id);
    setActionLoading('');
    if (res.success) {
      alert('✅ 审批通过！宠物已下线，通知已发送。');
      fetchApps();
    } else {
      alert('操作失败: ' + (res.error || ''));
    }
  };

  const handleReject = async (id: string, petName: string) => {
    if (!confirm(`确认拒绝「${petName}」的领养申请吗？将发送通知给用户。`)) return;
    setActionLoading(id);
    const res = await adminApi.rejectApplication(id, reason || undefined);
    setActionLoading('');
    if (res.success) {
      setReason('');
      alert('已拒绝该申请，通知已发送。');
      fetchApps();
    } else {
      alert('操作失败: ' + (res.error || ''));
    }
  };

  return (
    <div className="p-8">
      <h2 className="font-display font-bold text-xl text-on-surface mb-6">领养审批</h2>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { value: '', label: '全部' },
          { value: 'submitted', label: '待审核' },
          { value: 'reviewing', label: '审核中' },
          { value: 'handover', label: '已完成' },
        ].map(s => (
          <button key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              statusFilter === s.value
                ? 'bg-primary text-on-primary shadow-soft'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Application Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-on-surface-variant/60 text-sm">加载中...</div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-outline-variant/60 shadow-soft">
            <span className="text-3xl block mb-2">📋</span>
            <p className="text-sm font-bold text-on-surface">暂无领养申请</p>
          </div>
        ) : (
          apps.map(app => {
            const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS['submitted'];
            const isBusy = actionLoading === app.id;

            return (
              <div key={app.id} className="bg-surface rounded-2xl p-5 shadow-soft border border-surface-container">
                <div className="flex items-start gap-4">
                  {/* Pet Image */}
                  <img src={app.petImage} alt={app.petName}
                    className="w-16 h-16 rounded-xl object-cover bg-surface-container shrink-0" referrerPolicy="no-referrer" />

                  {/* Main Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-sm text-on-surface">{app.petName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant/70">{app.petBreed} · 申请日期: {app.date}</p>

                    {/* Applicant Info */}
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-on-surface-variant/50">申请人</span>
                        <p className="font-semibold text-on-surface">{app.applicantName}</p>
                      </div>
                      <div>
                        <span className="text-on-surface-variant/50">电话</span>
                        <p className="font-semibold text-on-surface">{app.applicantPhone}</p>
                      </div>
                      <div>
                        <span className="text-on-surface-variant/50">邮箱</span>
                        <p className="font-semibold text-on-surface truncate">{app.applicantEmail}</p>
                      </div>
                      <div>
                        <span className="text-on-surface-variant/50">居住环境</span>
                        <p className="font-semibold text-on-surface flex items-center gap-1">
                          {app.homeType === 'house' ? <Home size={12} /> : <TreePine size={12} />}
                          {app.homeType === 'house' ? '住宅' : '公寓'} · {app.hasYard ? '有院子' : '无院子'}
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    {app.reason && (
                      <details className="mt-2">
                        <summary className="text-[10px] text-primary font-bold cursor-pointer hover:underline">
                          查看领养理由
                        </summary>
                        <p className="mt-1 text-xs text-on-surface-variant/80 bg-surface-container-low p-2 rounded-lg">{app.reason}</p>
                      </details>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {app.status !== 'handover' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-container">
                    <button
                      onClick={() => handleApprove(app.id, app.petName)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2.5 px-5 rounded-button shadow-soft transition-all active:scale-98 disabled:opacity-50"
                    >
                      <Check size={14} className="stroke-[2.5px]" />
                      {isBusy ? '处理中...' : '通过审批'}
                    </button>
                    <div className="flex-grow flex items-center gap-2">
                      <input
                        type="text" placeholder="可选: 拒绝原因..."
                        value={reason} onChange={e => setReason(e.target.value)}
                        className="flex-grow bg-surface-container-low border border-outline-variant/40 rounded-xl py-2.5 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:border-red-400 outline-none"
                      />
                      <button
                        onClick={() => handleReject(app.id, app.petName)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 bg-surface-container-high hover:bg-red-50 hover:text-red-600 text-on-surface-variant font-bold text-xs py-2.5 px-4 rounded-button transition-all active:scale-98 disabled:opacity-50"
                      >
                        <X size={14} className="stroke-[2.5px]" />
                        拒绝
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
