import React, { useState, useEffect } from 'react';
import { Pet, AdoptionApplication } from '../types';
import {
  Heart,
  Bookmark,
  History,
  Mail,
  Settings,
  ChevronRight,
  LogOut,
  Edit2,
  Check,
  ArrowRight,
  X,
  Bell,
  Volume2,
  Database,
  Languages,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface ProfileViewProps {
  user: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    joinedDays: number;
    favorites: string[];
  };
  pets: Pet[];
  applications: AdoptionApplication[];
  onLogout: () => void;
  onUpdateUser?: (updated: { name: string; email: string; phone: string }) => void;
  onSelectPet: (petId: string) => void;
  onSelectTab: (tab: 'search' | 'messages') => void;
}

export default function ProfileView({
  user,
  pets,
  applications,
  onLogout,
  onUpdateUser,
  onSelectPet,
  onSelectTab,
}: ProfileViewProps) {
  const [showFavList, setShowFavList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Settings Local states
  const [settingsName, setSettingsName] = useState(user.name);
  const [settingsEmail, setSettingsEmail] = useState(user.email);
  const [settingsPhone, setSettingsPhone] = useState(user.phone);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Synchronize inputs when settings opens or user object updates
  useEffect(() => {
    setSettingsName(user.name);
    setSettingsEmail(user.email);
    setSettingsPhone(user.phone);
  }, [user]);

  // Find user's favorited pets
  const favoritedPets = pets.filter((pet) => user.favorites.includes(pet.id));

  // Options configuration
  const options = [
    {
      id: 'my-adoptions',
      label: '我的领养',
      icon: <Heart size={18} className="text-primary" />,
      badge: applications.length > 0 ? `${applications.length} 申请中` : null,
      action: () => onSelectTab('messages'),
    },
    {
      id: 'my-favorites',
      label: '我的收藏',
      icon: <Bookmark size={18} className="text-secondary" />,
      badge: `${user.favorites.length} 个`,
      action: () => setShowFavList(true),
    },
    {
      id: 'adoption-history',
      label: '领养记录',
      icon: <History size={18} className="text-tertiary" />,
      badge: '暂无记录',
      action: () => setShowHistoryModal(true),
    },
    {
      id: 'messages-inbox',
      label: '收到的消息',
      icon: <Mail size={18} className="text-primary-container" />,
      badge: '3 未读',
      badgeColor: 'bg-red-100 text-red-600',
      action: () => onSelectTab('messages'),
    },
    {
      id: 'settings',
      label: '系统设置',
      icon: <Settings size={18} className="text-on-surface-variant/70" />,
      badge: '编辑偏好',
      badgeColor: 'bg-primary/10 text-primary',
      action: () => setShowSettings(true),
    },
  ];

  const handleSaveSettings = () => {
    if (onUpdateUser) {
      onUpdateUser({
        name: settingsName,
        email: settingsEmail,
        phone: settingsPhone,
      });
    }
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
      setShowSettings(false);
    }, 1500);
  };

  const handleResetApp = () => {
    localStorage.clear();
    onLogout();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-4 pb-24 font-sans relative">
      
      {/* Save Success Toast */}
      {showSaveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary text-xs font-bold py-3 px-6 rounded-full shadow-soft-2 flex items-center gap-2 animate-fade-in">
          <Check size={14} className="stroke-[3px]" /> 设置保存并应用成功！
        </div>
      )}

      {/* Brand Navigation Header */}
      <div className="flex items-center gap-2 mb-6 border-b border-surface-container pb-2">
        <span className="text-xl">🐾</span>
        <h1 className="font-display font-bold text-lg text-primary">爱宠宜家</h1>
      </div>

      {/* Profile Header Dashboard Card */}
      <div className="bg-surface rounded-2xl p-6 shadow-soft border border-surface-container mb-6 relative overflow-hidden">
        {/* Soft amber glow inside card */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center relative z-10">
          {/* Avatar with Edit pencil button */}
          <div className="relative mb-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover shadow-soft border-2 border-primary/20"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setShowSettings(true)}
              className="absolute bottom-0 right-0 p-1.5 bg-primary hover:bg-opacity-95 text-on-primary rounded-full shadow-soft hover:scale-105 transition-all"
              title="编辑个人设置"
            >
              <Edit2 size={12} className="stroke-[2.5px]" />
            </button>
          </div>

          <h2 className="font-display font-bold text-lg text-on-surface mb-1">
            {user.name}
          </h2>
          <p className="text-xs text-on-surface-variant/60 font-semibold mb-6">
            加入 爱宠宜家 {user.joinedDays} 天
          </p>

          {/* Stats breakdown */}
          <div className="w-full grid grid-cols-2 divide-x divide-surface-container text-center border-t border-surface-container pt-4">
            <button onClick={() => setShowFavList(true)} className="hover:opacity-80 transition-opacity focus:outline-none">
              <span className="block font-display font-bold text-lg text-on-surface">
                {user.favorites.length}
              </span>
              <span className="text-xs text-on-surface-variant/60 font-semibold">
                我的收藏
              </span>
            </button>
            <button onClick={() => onSelectTab('messages')} className="hover:opacity-80 transition-opacity focus:outline-none">
              <span className="block font-display font-bold text-lg text-on-surface">
                3
              </span>
              <span className="text-xs text-on-surface-variant/60 font-semibold">
                收到的消息
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Option Listing Card */}
      <div className="bg-surface rounded-2xl shadow-soft border border-surface-container divide-y divide-surface-container overflow-hidden mb-8">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={opt.action}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors duration-200 text-left focus:outline-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-surface-container-low rounded-xl">
                {opt.icon}
              </div>
              <span className="text-sm font-bold text-on-surface">
                {opt.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {opt.badge && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${opt.badgeColor || 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {opt.badge}
                </span>
              )}
              <ChevronRight size={16} className="text-on-surface-variant/40" />
            </div>
          </button>
        ))}
      </div>

      {/* Centered Logout Button */}
      <div className="text-center pb-8">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="bg-surface hover:bg-red-50 text-red-600 border border-red-100 hover:border-red-200 font-bold text-xs py-3.5 px-8 rounded-full flex items-center justify-center gap-2 mx-auto active:scale-95 shadow-soft transition-all focus:outline-none"
        >
          <LogOut size={14} className="stroke-[2.5px]" />
          退出登录
        </button>
      </div>

      {/* --- FAVORITES PANEL --- */}
      {showFavList && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end">
          <div className="bg-surface w-full max-w-2xl rounded-t-3xl flex flex-col shadow-soft-2 border-t border-surface-container animate-slide-up" style={{ maxHeight: '80dvh' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-container">
              <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                ❤️ 我的收藏 ({favoritedPets.length})
              </h3>
              <button
                onClick={() => setShowFavList(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-full text-on-surface-variant focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {favoritedPets.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {favoritedPets.map((pet) => (
                    <div
                      key={pet.id}
                      onClick={() => {
                        onSelectPet(pet.id);
                        setShowFavList(false);
                      }}
                      className="bg-surface-container-low rounded-2xl overflow-hidden shadow-soft cursor-pointer border border-surface-container group hover:border-primary/20 transition-all flex flex-col"
                    >
                      <div className="w-full aspect-square bg-surface-container relative">
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-2 py-0.5 rounded-full">
                          {pet.distance}
                        </span>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-sm text-on-surface">{pet.name}</h4>
                        <p className="text-[10px] text-on-surface-variant/80 mt-0.5">{pet.breed} • {pet.age}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-3xl block mb-2">💔</span>
                  <p className="text-sm font-semibold text-on-surface">目前还没有收藏任何毛孩子</p>
                  <p className="text-xs text-on-surface-variant/60 max-w-xs mx-auto mt-1">
                    快去首页或搜索页面，发现您心仪的小可爱并点击爱心添加收藏吧！
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS DRAWER PANEL --- */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end">
          <div className="bg-surface w-full max-w-2xl rounded-t-3xl flex flex-col shadow-soft-2 border-t border-surface-container animate-slide-up" style={{ maxHeight: '90dvh' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-container">
              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                ⚙️ 偏好与系统设置
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-full text-on-surface-variant focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {/* Profile section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 border-b border-surface-container pb-2">
                  <Edit2 size={14} /> 个人基本资料
                </h4>
                
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1.5">用户昵称</label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full text-xs bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1.5">联系电话</label>
                    <input
                      type="text"
                      value={settingsPhone}
                      onChange={(e) => setSettingsPhone(e.target.value)}
                      className="w-full text-xs bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1.5">电子邮箱</label>
                    <input
                      type="email"
                      value={settingsEmail}
                      onChange={(e) => setSettingsEmail(e.target.value)}
                      className="w-full text-xs bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 border-b border-surface-container pb-2">
                  <Bell size={14} /> 偏好提醒与反馈
                </h4>

                {/* Notifications switch */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">接收领养审核进度提醒</span>
                    <span className="text-[10px] text-on-surface-variant/60">志愿者留言或领养审核进度更新时发送弹窗推送</span>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                      notificationsEnabled ? 'bg-primary' : 'bg-surface-container-high'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-soft absolute ${
                      notificationsEnabled ? 'translate-x-5.5' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                {/* Audio Switch */}
                <div className="flex items-center justify-between py-1 border-t border-surface-container/40 pt-3">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">微交互提示音效</span>
                    <span className="text-[10px] text-on-surface-variant/60">收藏或提交申请时播放轻快反馈声音</span>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                      soundEnabled ? 'bg-primary' : 'bg-surface-container-high'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-soft absolute ${
                      soundEnabled ? 'translate-x-5.5' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                {/* Language selection */}
                <div className="flex items-center justify-between py-1 border-t border-surface-container/40 pt-3">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">界面语言 (Language)</span>
                    <span className="text-[10px] text-on-surface-variant/60">切换应用程序的全局显示语言</span>
                  </div>
                  <div className="flex bg-surface-container-low p-1 border border-surface-container rounded-xl">
                    <button
                      onClick={() => setLanguage('zh')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        language === 'zh' ? 'bg-primary text-on-primary shadow-soft' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      简体中文
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        language === 'en' ? 'bg-primary text-on-primary shadow-soft' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset storage / Clear Cache */}
              <div className="bg-red-50/40 rounded-2xl p-4 border border-red-100 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <Database size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-red-700">危险区域：应用数据清理</h5>
                    <p className="text-[10px] text-red-600/80 mt-1 leading-relaxed">
                      这将彻底清空您的领养申请单、收藏夹和微聊消息，所有数据还原到初次加载时的状态。此操作不可逆。
                    </p>
                  </div>
                </div>
                {showResetConfirm ? (
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="text-[10px] font-bold text-on-surface-variant/70 bg-surface px-3 py-1.5 rounded-lg border border-surface-container"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleResetApp}
                      className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg shadow-soft"
                    >
                      确定清空并重置
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 underline self-start"
                  >
                    清空并重置所有数据
                  </button>
                )}
              </div>

              {/* Version & Credits Footer */}
              <div className="text-center pt-4 text-[10px] text-on-surface-variant/40 font-semibold">
                爱宠宜家 • 🐾 金牌爱心版本 v2.4.0
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 border-t border-surface-container flex gap-3 bg-surface">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 font-bold text-xs text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high py-3.5 rounded-xl transition-all"
              >
                关闭
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 font-bold text-xs text-on-primary bg-primary hover:bg-opacity-95 py-3.5 rounded-xl shadow-soft flex items-center justify-center gap-1.5"
              >
                <Check size={14} className="stroke-[2.5px]" /> 保存并应用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM LOGOUT CONFIRM MODAL --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-surface max-w-sm w-full rounded-2xl p-6 shadow-soft-2 border border-surface-container text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} className="stroke-[2.5px]" />
            </div>
            <h3 className="font-display font-bold text-base text-on-surface mb-2">
              确定要退出登录吗？
            </h3>
            <p className="text-xs text-on-surface-variant/70 leading-relaxed mb-6">
              退出后将清除当前的临时登录状态，您可以随时重新登录并查看您所关注的毛孩子。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 font-bold text-xs text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high py-3 rounded-xl transition-all focus:outline-none"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 font-bold text-xs text-white bg-red-600 hover:bg-red-700 py-3 rounded-xl shadow-soft transition-all focus:outline-none"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM HISTORY MODAL --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-surface max-w-sm w-full rounded-2xl p-6 shadow-soft-2 border border-surface-container text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <History size={22} className="stroke-[2px]" />
            </div>
            <h3 className="font-display font-bold text-base text-on-surface mb-2">
              领养历史记录
            </h3>
            <p className="text-xs text-on-surface-variant/70 leading-relaxed mb-6">
              您目前暂无已经结案的历史结对领养记录。当您的当前领养申请审核通过并完成交接后，相应的记录会归档至此处。
            </p>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full font-bold text-xs text-on-primary bg-primary hover:bg-opacity-95 py-3 rounded-xl shadow-soft transition-all focus:outline-none"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
