import { useState, type FormEvent } from 'react';
import { adminApi } from '../services/api';
import { LogIn, Shield } from 'lucide-react';

export default function AdminLogin({ onLogin }: { onLogin: (ok: boolean) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError('请输入管理密码'); return; }
    setLoading(true);
    setError('');
    const ok = await adminApi.login(password);
    setLoading(false);
    if (ok) onLogin(true);
    else setError('密码错误');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="bg-surface rounded-2xl p-8 shadow-soft-2 border border-surface-container w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 shadow-soft">
            <Shield size={26} className="stroke-[2px]" />
          </div>
          <h1 className="font-display font-bold text-xl text-on-surface">爱宠宜家</h1>
          <p className="text-xs text-on-surface-variant/60 mt-1">后台管理系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 text-xs p-3 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface mb-2">管理密码</label>
            <input
              type="password"
              placeholder="请输入管理密码"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-opacity-90 active:scale-98 text-on-primary font-bold text-sm py-4 rounded-button shadow-soft-2 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn size={16} className="stroke-[2.5px]" />
            {loading ? '验证中...' : '登入后台'}
          </button>
        </form>
      </div>
    </div>
  );
}
