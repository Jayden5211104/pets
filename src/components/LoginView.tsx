import React, { useState } from 'react';
import { Eye, EyeOff, MessageCircle, Globe } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (name: string, email: string, phone: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError('请输入手机号或邮箱');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    
    // Auto-login or create sample credentials
    const sampleName = '爱宠达人';
    const sampleEmail = emailOrPhone.includes('@') ? emailOrPhone : 'user@example.com';
    const samplePhone = emailOrPhone.match(/^\d+$/) ? emailOrPhone : '138 1234 5678';
    
    onLoginSuccess(sampleName, sampleEmail, samplePhone);
  };

  const handleQuickLogin = () => {
    onLoginSuccess('爱宠达人', 'zhangsan@example.com', '138 1234 5678');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-background flex flex-col justify-between py-8 px-6 font-sans">
      {/* Brand Title */}
      <div className="text-center mt-2">
        <h1 className="font-display font-bold text-2xl text-primary tracking-wide">
          🐾 爱宠宜家
        </h1>
      </div>

      {/* Cozy Dog Banner Image */}
      <div className="my-6 w-full h-48 rounded-2xl overflow-hidden shadow-soft relative bg-surface-container">
        <img
          src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
          alt="爱宠宜家 Cozy Home"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Main Login Card */}
      <div className="bg-surface rounded-2xl p-6 shadow-soft border border-surface-container flex-grow flex flex-col justify-center">
        <h2 className="font-display text-2xl font-bold text-on-surface text-center mb-6">
          欢迎回来
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">
              手机号 / 邮箱
            </label>
            <input
              type="text"
              placeholder="请输入您的手机号或邮箱"
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                setError('');
              }}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-on-surface-variant">
                密码
              </label>
              <button
                type="button"
                className="text-xs text-primary font-medium hover:underline"
                onClick={() => alert('请在模拟界面直接输入密码或点击“立即登录”进行快捷登录。')}
              >
                忘记密码？
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-opacity-90 active:scale-98 text-on-primary font-bold text-base py-4 rounded-button shadow-soft-2 mt-4 transition-all duration-200"
          >
            登录
          </button>
        </form>

        {/* Guest Skip Action */}
        <div className="mt-4 text-center">
          <button
            onClick={handleQuickLogin}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors py-1 px-3 border border-outline-variant rounded-full bg-surface-container-low hover:bg-surface-container-highest font-medium"
          >
            ⚡ 快捷通道直接登录
          </button>
        </div>

        {/* Third-Party Logins */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px bg-outline-variant w-12"></span>
            <span className="text-xs text-on-surface-variant/60 font-medium">
              第三方账号登录
            </span>
            <span className="h-px bg-outline-variant w-12"></span>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={handleQuickLogin}
              className="w-12 h-12 rounded-full border border-outline-variant bg-surface-container-low flex items-center justify-center text-secondary hover:bg-secondary/5 hover:border-secondary transition-all"
              title="微信登录"
            >
              <MessageCircle size={20} className="stroke-[2px]" />
            </button>
            <button
              onClick={handleQuickLogin}
              className="w-12 h-12 rounded-full border border-outline-variant bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary/5 hover:border-primary transition-all"
              title="社交网登录"
            >
              <Globe size={20} className="stroke-[2px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Registration Option */}
      <div className="text-center mt-6">
        <p className="text-sm text-on-surface-variant/80">
          还没有账号？{' '}
          <button
            onClick={handleQuickLogin}
            className="text-primary font-bold hover:underline"
          >
            立即注册
          </button>
        </p>
      </div>
    </div>
  );
}
