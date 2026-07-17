import React, { useState, useEffect, useCallback } from 'react';
import { Pet, User, AdoptionApplication, Message, ViewState, ActiveTab, PetCategory } from './types';
import { INITIAL_PETS, INITIAL_MESSAGES, SHELTERS } from './data';
import LoginView from './components/LoginView';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import MessagesView from './components/MessagesView';
import ProfileView from './components/ProfileView';
import PetDetailsView from './components/PetDetailsView';
import AdoptionFormView from './components/AdoptionFormView';
import { Home, Search, MessageSquare, User as UserIcon, Heart } from 'lucide-react';
import { petApi, userApi, applicationApi, messageApi, checkBackendHealth } from './services/api';

export default function App() {
  // --- 后端可用状态 ---
  const [backendAvailable, setBackendAvailable] = useState(false);

  // --- 用户ID（后端分配）---
  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('kp_user_id') || '';
  });

  // --- Persistent LocalState Keys ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kp_is_logged_in') === 'true';
  });

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('kp_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      name: '爱宠达人',
      email: 'zhangsan@example.com',
      phone: '138 1234 5678',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      joinedDays: 342,
      favorites: ['luna-bc', 'bubu'],
    };
  });

  const [applications, setApplications] = useState<AdoptionApplication[]>(() => {
    const saved = localStorage.getItem('kp_applications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('kp_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_MESSAGES;
  });

  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('kp_pets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PETS;
  });

  // Nav views state
  const [viewState, setViewState] = useState<ViewState>(() => {
    const savedLoggedIn = localStorage.getItem('kp_is_logged_in') === 'true';
    return savedLoggedIn ? { type: 'tab', tab: 'home' } : { type: 'login' };
  });

  const [initialSearchCat, setInitialSearchCat] = useState<PetCategory | undefined>(undefined);

  // --- 检查后端并加载数据 ---
  useEffect(() => {
    async function initBackend() {
      const healthy = await checkBackendHealth();
      setBackendAvailable(healthy);

      if (healthy) {
        console.log('✅ 后端API已连接，正在同步数据...');

        // 从后端加载宠物列表
        const backendPets = await petApi.getAll();
        if (backendPets.length > 0) {
          setPets(backendPets);
          localStorage.setItem('kp_pets', JSON.stringify(backendPets));
          console.log(`📦 从后端加载了 ${backendPets.length} 只宠物`);
        }

        // 如果已登录且有userId，同步用户数据
        if (isLoggedIn && userId) {
          const backendUser = await userApi.getById(userId);
          if (backendUser) {
            setUser(backendUser);
            localStorage.setItem('kp_user', JSON.stringify(backendUser));
            console.log('👤 用户数据已同步');
          }

          // 同步领养申请
          if (backendUser?.email) {
            const backendApps = await applicationApi.getAll({ email: backendUser.email });
            if (backendApps.length > 0) {
              setApplications(backendApps);
              localStorage.setItem('kp_applications', JSON.stringify(backendApps));
              console.log(`📋 从后端加载了 ${backendApps.length} 条申请`);
            }
          }

          // 同步消息
          const backendMessages = await messageApi.getAll();
          if (backendMessages.length > 0) {
            setMessages(backendMessages);
            localStorage.setItem('kp_messages', JSON.stringify(backendMessages));
            console.log(`💬 从后端加载了 ${backendMessages.length} 条消息`);
          }
        }
      } else {
        console.log('⚠️ 后端API不可用，使用本地存储模式');
      }
    }

    initBackend();
  }, []); // 仅在首次挂载时执行

  // --- Save State side-effects (local缓存始终保存) ---
  useEffect(() => {
    localStorage.setItem('kp_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('kp_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kp_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('kp_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('kp_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('kp_user_id', userId);
    }
  }, [userId]);

  // --- Callbacks & Handlers ---
  const handleLoginSuccess = useCallback(async (name: string, email: string, phone: string) => {
    const updatedUser: User = {
      ...user,
      name,
      email,
      phone,
    };

    if (backendAvailable) {
      // 通过后端登录/注册
      const backendUser = await userApi.login(email, name, phone);
      if (backendUser) {
        // 后端返回的数据可能包含id字段
        const mergedUser = { ...updatedUser, ...backendUser };
        setUser(mergedUser);
        // 保存后端用户ID
        if ((backendUser as any).id) {
          setUserId((backendUser as any).id);
        }
      } else {
        setUser(updatedUser);
      }
    } else {
      setUser(updatedUser);
    }

    setIsLoggedIn(true);
    setViewState({ type: 'tab', tab: 'home' });
  }, [backendAvailable, user]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setViewState({ type: 'login' });
  }, []);

  const handleUpdateUser = useCallback(async (updatedUser: Partial<User>) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedUser };
      // 异步同步到后端
      if (backendAvailable && userId) {
        userApi.update(userId, newUser).catch((err) =>
          console.error('同步用户数据失败:', err)
        );
      }
      return newUser;
    });
  }, [backendAvailable, userId]);

  const handleUpdateMessages = useCallback((updatedMessages: Message[]) => {
    setMessages(updatedMessages);
  }, []);

  const handleToggleFavorite = useCallback(async (petId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUser((prev) => {
      const alreadyFav = prev.favorites.includes(petId);
      const updated = alreadyFav
        ? prev.favorites.filter((id) => id !== petId)
        : [...prev.favorites, petId];

      // 异步同步到后端
      if (backendAvailable && userId) {
        userApi.toggleFavorite(userId, petId).catch((err) =>
          console.error('同步收藏失败:', err)
        );
      }

      return { ...prev, favorites: updated };
    });
  }, [backendAvailable, userId]);

  const handleSelectPet = useCallback((petId: string) => {
    setViewState((current) => ({
      type: 'pet-details',
      petId,
      fromView: current,
    }));
  }, []);

  const handleStartAdopt = useCallback((petId: string) => {
    setViewState({ type: 'adopt-form', petId });
  }, []);

  const handleSwitchToSearch = useCallback((category?: PetCategory) => {
    setInitialSearchCat(category);
    setViewState({ type: 'tab', tab: 'search' });
  }, []);

  const handleAdoptionSubmit = useCallback(async (formData: {
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    homeType: 'apartment' | 'house';
    hasYard: boolean;
    reason: string;
  }) => {
    const activePet = pets.find((p) => p.id === (viewState as any).petId) || pets[0];

    const newApp: AdoptionApplication = {
      id: `app-${Date.now()}`,
      petId: activePet.id,
      petName: activePet.name,
      petBreed: activePet.breed,
      petImage: activePet.imageUrl,
      applicantName: formData.applicantName,
      applicantEmail: formData.applicantEmail,
      applicantPhone: formData.applicantPhone,
      homeType: formData.homeType,
      hasYard: formData.hasYard,
      reason: formData.reason,
      status: 'submitted',
      date: new Date().toLocaleDateString('zh-CN'),
    };

    // 异步提交到后端
    if (backendAvailable) {
      applicationApi.create(newApp).then((result) => {
        if (result) {
          // 用后端返回的数据替换（有正确的ID和时间戳）
          setApplications((prev) =>
            prev.map((app) => (app.id === newApp.id ? result : app))
          );
        }
      }).catch((err) => console.error('提交申请到后端失败:', err));
    }

    setApplications((prev) => [newApp, ...prev]);

    // 创建欢迎消息
    const newWelcomeMsg: Message = {
      id: `welcome-${Date.now()}`,
      senderName: '快乐爪子救助站',
      senderAvatar: SHELTERS['happy-paws'].logoUrl,
      messageText: `您的申请表格已进入"${activePet.name}"的候选队列中。我们将在稍后为您分配专属跟进志愿者。`,
      time: '刚刚',
      unread: true,
      isShelter: true,
    };

    // 异步发送到后端
    if (backendAvailable) {
      messageApi.send({
        senderName: newWelcomeMsg.senderName,
        senderAvatar: newWelcomeMsg.senderAvatar,
        messageText: newWelcomeMsg.messageText,
        isShelter: true,
      }).catch((err) => console.error('发送消息到后端失败:', err));
    }

    setMessages((prev) => [newWelcomeMsg, ...prev]);
  }, [pets, viewState, backendAvailable]);

  const handleUpdateApplicationStatus = useCallback(async (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newStatus = app.status === 'submitted' ? 'reviewing' : 'handover';
          // 异步同步到后端
          if (backendAvailable) {
            applicationApi.updateStatus(appId, newStatus).catch((err) =>
              console.error('同步申请状态失败:', err)
            );
          }
          return { ...app, status: newStatus as AdoptionApplication['status'] };
        }
        return app;
      })
    );
  }, [backendAvailable]);

  // Render Core Frame
  return (
    <div className="min-h-dvh bg-background text-on-background flex flex-col justify-between font-sans overscroll-none">

      {/* 1. Desktop Anchor Header (Shown only on larger screens md+) */}
      {isLoggedIn && (
        <header className="hidden md:block w-full sticky top-0 bg-surface border-b border-surface-container z-40 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState({ type: 'tab', tab: 'home' })}>
              <span className="text-2xl">🐾</span>
              <h1 className="font-display font-bold text-xl text-primary">爱宠宜家</h1>
            </div>
            <nav className="flex items-center gap-8">
              <button
                onClick={() => setViewState({ type: 'tab', tab: 'home' })}
                className={`font-semibold text-sm transition-colors ${
                  viewState.type === 'tab' && viewState.tab === 'home' ? 'text-primary' : 'text-on-surface-variant/80 hover:text-primary'
                }`}
              >
                首页
              </button>
              <button
                onClick={() => handleSwitchToSearch()}
                className={`font-semibold text-sm transition-colors ${
                  viewState.type === 'tab' && viewState.tab === 'search' ? 'text-primary' : 'text-on-surface-variant/80 hover:text-primary'
                }`}
              >
                发现
              </button>
              <button
                onClick={() => setViewState({ type: 'tab', tab: 'messages' })}
                className={`font-semibold text-sm transition-colors ${
                  viewState.type === 'tab' && viewState.tab === 'messages' ? 'text-primary' : 'text-on-surface-variant/80 hover:text-primary'
                }`}
              >
                消息对话
              </button>
              <button
                onClick={() => setViewState({ type: 'tab', tab: 'profile' })}
                className={`font-semibold text-sm transition-colors ${
                  viewState.type === 'tab' && viewState.tab === 'profile' ? 'text-primary' : 'text-on-surface-variant/80 hover:text-primary'
                }`}
              >
                个人中心
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* 后端状态指示器 */}
      {isLoggedIn && (
        <div className={`w-full text-center text-[10px] py-0.5 font-medium transition-colors ${
          backendAvailable
            ? 'bg-green-50 text-green-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {backendAvailable ? '🟢 在线' : '🟡 离线'}
        </div>
      )}

      {/* 2. Main Sub-view Routing Renderer */}
      <div className="flex-grow w-full max-w-4xl mx-auto md:px-4">
        {(() => {
          switch (viewState.type) {
            case 'login':
              return <LoginView onLoginSuccess={handleLoginSuccess} />;

            case 'tab':
              switch (viewState.tab) {
                case 'home':
                  return (
                    <HomeView
                      pets={pets}
                      favorites={user.favorites}
                      userAvatar={user.avatarUrl}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectPet={handleSelectPet}
                      onSwitchToSearch={handleSwitchToSearch}
                    />
                  );
                case 'search':
                  return (
                    <SearchView
                      pets={pets}
                      favorites={user.favorites}
                      initialCategory={initialSearchCat}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectPet={handleSelectPet}
                    />
                  );
                case 'messages':
                  return (
                    <MessagesView
                      messages={messages}
                      applications={applications}
                      onSelectPet={handleSelectPet}
                      onUpdateApplicationStatus={handleUpdateApplicationStatus}
                      onUpdateMessages={handleUpdateMessages}
                      backendAvailable={backendAvailable}
                    />
                  );
                case 'profile':
                  return (
                    <ProfileView
                      user={user}
                      pets={pets}
                      applications={applications}
                      onLogout={handleLogout}
                      onUpdateUser={handleUpdateUser}
                      onSelectPet={handleSelectPet}
                      onSelectTab={(tab) => setViewState({ type: 'tab', tab })}
                    />
                  );
              }
              break;

            case 'pet-details': {
              const activePet = pets.find((p) => p.id === viewState.petId) || pets[0];
              const activeShelter = SHELTERS[activePet.shelterId] || SHELTERS['happy-paws'];
              return (
                <PetDetailsView
                  pet={activePet}
                  shelter={activeShelter}
                  favorites={user.favorites}
                  onBack={() => setViewState(viewState.fromView)}
                  onToggleFavorite={handleToggleFavorite}
                  onStartAdopt={handleStartAdopt}
                />
              );
            }

            case 'adopt-form': {
              const activePet = pets.find((p) => p.id === viewState.petId) || pets[0];
              return (
                <AdoptionFormView
                  pet={activePet}
                  onSubmit={handleAdoptionSubmit}
                  onBack={() => setViewState({ type: 'pet-details', petId: activePet.id, fromView: { type: 'tab', tab: 'home' } })}
                  onFinishRedirect={() => setViewState({ type: 'tab', tab: 'messages' })}
                />
              );
            }
          }
        })()}
      </div>

      {/* 3. Mobile Dynamic Navigation pill bar (Hidden on desktop screen md+) */}
      {isLoggedIn && viewState.type === 'tab' && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 px-4 pt-2 bg-surface shadow-[0_-4px_24px_rgba(0,0,0,0.06)] border-t border-surface-container/50 flex justify-around items-center pb-safe">

          {/* TAB 1: HOME */}
          <button
            onClick={() => setViewState({ type: 'tab', tab: 'home' })}
            className={`transition-all duration-200 ${
              viewState.tab === 'home'
                ? 'bg-primary text-on-primary rounded-full px-4 py-2 flex items-center gap-1.5 shadow-soft'
                : 'flex flex-col items-center justify-center text-on-surface-variant/60 px-3 py-1 hover:text-primary'
            }`}
          >
            <Home size={18} className="stroke-[2px]" />
            {viewState.tab === 'home' && <span className="text-xs font-bold font-display">首页</span>}
            {viewState.tab !== 'home' && <span className="text-[10px] font-semibold mt-1">首页</span>}
          </button>

          {/* TAB 2: SEARCH */}
          <button
            onClick={() => handleSwitchToSearch()}
            className={`transition-all duration-200 ${
              viewState.tab === 'search'
                ? 'bg-primary text-on-primary rounded-full px-4 py-2 flex items-center gap-1.5 shadow-soft'
                : 'flex flex-col items-center justify-center text-on-surface-variant/60 px-3 py-1 hover:text-primary'
            }`}
          >
            <Search size={18} className="stroke-[2px]" />
            {viewState.tab === 'search' && <span className="text-xs font-bold font-display">搜索</span>}
            {viewState.tab !== 'search' && <span className="text-[10px] font-semibold mt-1">搜索</span>}
          </button>

          {/* TAB 3: MESSAGES */}
          <button
            onClick={() => setViewState({ type: 'tab', tab: 'messages' })}
            className={`transition-all duration-200 relative ${
              viewState.tab === 'messages'
                ? 'bg-primary text-on-primary rounded-full px-4 py-2 flex items-center gap-1.5 shadow-soft'
                : 'flex flex-col items-center justify-center text-on-surface-variant/60 px-3 py-1 hover:text-primary'
            }`}
          >
            {messages.some((m) => m.unread) && viewState.tab !== 'messages' && (
              <span className="absolute top-1.5 right-3 w-2.5 h-2.5 bg-primary rounded-full border border-white animate-pulse"></span>
            )}
            <MessageSquare size={18} className="stroke-[2px]" />
            {viewState.tab === 'messages' && <span className="text-xs font-bold font-display">消息</span>}
            {viewState.tab !== 'messages' && <span className="text-[10px] font-semibold mt-1">消息</span>}
          </button>

          {/* TAB 4: PROFILE */}
          <button
            onClick={() => setViewState({ type: 'tab', tab: 'profile' })}
            className={`transition-all duration-200 ${
              viewState.tab === 'profile'
                ? 'bg-primary text-on-primary rounded-full px-4 py-2 flex items-center gap-1.5 shadow-soft'
                : 'flex flex-col items-center justify-center text-on-surface-variant/60 px-3 py-1 hover:text-primary'
            }`}
          >
            <UserIcon size={18} className="stroke-[2px]" />
            {viewState.tab === 'profile' && <span className="text-xs font-bold font-display">我的</span>}
            {viewState.tab !== 'profile' && <span className="text-[10px] font-semibold mt-1">我的</span>}
          </button>

        </nav>
      )}
    </div>
  );
}
