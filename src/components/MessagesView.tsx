import React, { useState, useEffect } from 'react';
import { Message, ChatMessage, AdoptionApplication } from '../types';
import { Check, Dot, Send, MoreHorizontal, MessageSquare, X } from 'lucide-react';
import { messageApi } from '../services/api';

interface MessagesViewProps {
  messages: Message[];
  applications: AdoptionApplication[];
  onSelectPet: (petId: string) => void;
  onUpdateApplicationStatus: (appId: string) => void;
  onUpdateMessages?: (updatedMessages: Message[]) => void;
  backendAvailable?: boolean;
}

export default function MessagesView({
  messages,
  applications,
  onSelectPet,
  onUpdateApplicationStatus,
  onUpdateMessages,
  backendAvailable = false,
}: MessagesViewProps) {
  const [activeChat, setActiveChat] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');

  // Sync active chat if message history changes globally
  useEffect(() => {
    if (activeChat) {
      const updated = messages.find((m) => m.id === activeChat.id);
      if (updated) {
        setActiveChat(updated);
      }
    }
  }, [messages, activeChat?.id]);

  // Find active adoption progress. If none exists, we display a default one.
  const activeApp = applications[0] || {
    id: 'mock-app-1',
    petId: 'bubu',
    petName: 'Bella',
    petBreed: '金毛寻回犬',
    petImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK-8oTzin0sivfBHZYPUCN6v3E1ysYGDzsFoMWL0NdM7P5gKCegtk3HfyKY6KJMpWHTmdEXs90PLLBWmuOolfpzorNgsSHjekctCHOPAcxNGffiDmSxTeIhg0vu8fqnCXJge-xdKHlp9hmqh1iJzndH4mc6bgM8idTrIDKh4o-boiSYEqdBubt5xOyQnAoZsTkObHST4WGiQ2Qnf_YHmUE_R2iFrz-LfhIZG00vvmflBdHo6iqbp-ewFGFp9Ct6OoSTRDmlhlcM46',
    status: 'reviewing',
  };

  const handleMessageClick = (msg: Message) => {
    setActiveChat(msg);
    // Mark message as read
    const updatedMessages = messages.map((m) =>
      m.id === msg.id ? { ...m, unread: false } : m
    );
    if (onUpdateMessages) {
      onUpdateMessages(updatedMessages);
    }
    // 同步到后端
    if (backendAvailable) {
      messageApi.markAsRead(msg.id).catch((err) =>
        console.error('标记消息已读失败:', err)
      );
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChat) return;

    const userMsgText = replyText;
    setReplyText('');

    // Dynamic initial message check
    const currentHistory = activeChat.chatHistory || [
      {
        id: activeChat.id + '-initial',
        senderName: activeChat.senderName,
        senderAvatar: activeChat.senderAvatar,
        messageText: activeChat.messageText,
        time: activeChat.time,
        isUser: false,
      },
    ];

    const newUserMessage: ChatMessage = {
      id: `user-reply-${Date.now()}`,
      senderName: '我',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      messageText: userMsgText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };

    const updatedHistory = [...currentHistory, newUserMessage];
    const updatedChat: Message = {
      ...activeChat,
      messageText: userMsgText,
      time: '刚刚',
      unread: false,
      chatHistory: updatedHistory,
    };

    setActiveChat(updatedChat);

    // 同步用户消息到后端
    if (backendAvailable) {
      messageApi.send({
        senderName: '我',
        senderAvatar: newUserMessage.senderAvatar,
        messageText: userMsgText,
        isShelter: false,
      }).catch((err) => console.error('发送消息到后端失败:', err));
    }

    const updatedList = messages.map((m) => (m.id === activeChat.id ? updatedChat : m));
    if (onUpdateMessages) {
      onUpdateMessages(updatedList);
    }

    // Auto-responder details
    const targetChatId = activeChat.id;
    const senderName = activeChat.senderName;
    const senderAvatar = activeChat.senderAvatar;

    setTimeout(() => {
      // Fetch latest stored list
      const latestSaved = localStorage.getItem('kp_messages');
      let currentList = updatedList;
      if (latestSaved) {
        try {
          currentList = JSON.parse(latestSaved);
        } catch (err) {
          // fallback
        }
      }

      const chatToUpdate = currentList.find((m) => m.id === targetChatId) || updatedChat;
      const chatHistoryToUpdate = chatToUpdate.chatHistory || [];

      // Determine smart response
      let autoReply = '收到您的消息！我们会尽快安排专门的领养志愿者跟您取得联系。❤️';
      const text = userMsgText.toLowerCase();
      if (text.includes('方便') || text.includes('电话') || text.includes('联系') || text.includes('微信号')) {
        autoReply = '非常方便！我们的接待热线是 188-0101-8888，或者您可以直接发送您的微信号和方便接听的时间。我们安排对接志愿者在2小时内为您致电！📞';
      } else if (text.includes('时间') || text.includes('时候') || text.includes('周末') || text.includes('几点') || text.includes('去看看')) {
        autoReply = '我们线下爱心之家周一至周日 9:00 - 18:00 全天开放。非常建议您选择周末过来和毛孩子互动！您看您这周末（周六或周日）有空吗？🐾';
      } else if (text.includes('吃什么') || text.includes('粮食') || text.includes('猫粮') || text.includes('狗粮')) {
        autoReply = '它们平时吃的是救助站统一搭配的低敏配方粮。领养时我们会附赠您一份爱心大礼包（包含过渡粮、罐头和常备益生菌），帮它们顺利度过过渡期。🍚';
      } else if (text.includes('条件') || text.includes('什么要求') || text.includes('流程') || text.includes('领养')) {
        autoReply = '领养流程非常简单：1. 线上提交申请；2. 志愿者电话回访沟通；3. 预约线下见面会并带上您的牵引绳/猫包；4. 签署爱心领养协议和合影留念。免费领养，全流程不收取任何费用。✨';
      } else if (text.includes('好') || text.includes('可以') || text.includes('行') || text.includes('谢谢') || text.includes('么么哒')) {
        autoReply = '不客气！能遇到像您这样温暖又富有爱心的领养人是这些小生命的福气。随时留言，期待与您和毛孩子的相见！💖';
      }

      const responseMsg: ChatMessage = {
        id: `mock-resp-${Date.now()}`,
        senderName: senderName,
        senderAvatar: senderAvatar,
        messageText: autoReply,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
      };

      const finalHistory = [...chatHistoryToUpdate, responseMsg];
      const finalChat: Message = {
        ...chatToUpdate,
        messageText: autoReply,
        time: '刚刚',
        chatHistory: finalHistory,
      };

      // If active chat is still this chat, update active state and keep it as read
      setActiveChat((currentActive) => {
        if (currentActive && currentActive.id === targetChatId) {
          return {
            ...finalChat,
            unread: false,
          };
        }
        return currentActive;
      });

      // Update parent list
      const finalMessagesList = currentList.map((m) => {
        if (m.id === targetChatId) {
          return {
            ...finalChat,
            unread: activeChat?.id === targetChatId ? false : true,
          };
        }
        return m;
      });

      if (onUpdateMessages) {
        onUpdateMessages(finalMessagesList);
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-4 pb-24 font-sans">
      {/* Brand Navigation Header */}
      <div className="flex items-center gap-2 mb-6 border-b border-surface-container pb-2">
        <span className="text-xl">🐾</span>
        <h1 className="font-display font-bold text-lg text-primary">爱宠宜家</h1>
      </div>

      <h2 className="font-display font-bold text-2xl text-on-surface mb-6">消息</h2>

      {/* Adoption Progress Timeline Card (领养进度) */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft border border-surface-container mb-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary block"></span>
            领养进度
          </h3>
          <button className="text-on-surface-variant/40 hover:text-on-surface">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-6 relative pl-3">
          {/* Connecting Line */}
          <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-outline-variant/30"></div>

          {/* Step 1: Submit Application */}
          <div className="flex items-start gap-4 relative">
            <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-soft z-10">
              <Check size={12} className="stroke-[3px]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">提交申请</h4>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">申请材料已成功提交</p>
            </div>
          </div>

          {/* Step 2: Under Review */}
          <div className="flex items-start gap-4 relative">
            <div className="w-6 h-6 rounded-full border-2 border-primary bg-surface flex items-center justify-center z-10 shadow-soft">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                审核中
              </h4>
              <p className="text-xs text-primary font-semibold mt-1 bg-primary/5 px-2.5 py-1 rounded-md inline-block">
                {activeApp.petName} - {activeApp.petBreed}
              </p>
            </div>
          </div>

          {/* Step 3: Handover / Meet up */}
          <div className="flex items-start gap-4 relative">
            <div className="w-6 h-6 rounded-full border-2 border-outline-variant/40 bg-surface flex items-center justify-center z-10 text-on-surface-variant/40 text-[10px] font-bold">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface-variant/50">见面交接</h4>
              <p className="text-xs text-on-surface-variant/40 mt-0.5">线下匹配会面和交接准备</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelectPet(activeApp.petId)}
          className="w-full bg-primary hover:bg-opacity-90 active:scale-98 text-on-primary font-bold text-sm py-3 rounded-button mt-6 shadow-soft transition-all text-center block"
        >
          查看详情
        </button>
      </div>

      {/* Message Inbox Listing */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-sm text-on-surface-variant/70 mb-2">最近对话</h3>

        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => handleMessageClick(msg)}
            className={`flex gap-4 p-4 rounded-2xl border cursor-pointer hover:bg-surface shadow-soft transition-all duration-250 ${
              msg.unread
                ? 'bg-primary/5 border-primary/10 hover:border-primary/20'
                : 'bg-surface-container-lowest border-surface-container'
            }`}
          >
            {/* Avatar with potential indicator badge */}
            <div className="relative flex-shrink-0">
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-12 h-12 rounded-full object-cover shadow-soft border border-surface-container"
                referrerPolicy="no-referrer"
              />
              {msg.unread && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-white"></span>
              )}
            </div>

            {/* Snippet summary */}
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-bold text-on-surface truncate pr-2">
                  {msg.senderName}
                </h4>
                <span className="text-[10px] text-on-surface-variant/50 font-medium">
                  {msg.time}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant/80 truncate font-medium">
                {msg.messageText}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Chat Dialog Modal Overlay */}
      {activeChat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface w-full max-w-2xl mx-auto rounded-t-3xl flex flex-col shadow-soft-2 border-t border-surface-container animate-slide-up" style={{ height: 'calc(85dvh)' }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <img
                  src={activeChat.senderAvatar}
                  alt={activeChat.senderName}
                  className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-sm text-on-surface">{activeChat.senderName}</h3>
                  <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                    在线
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="p-2 hover:bg-surface-container-low rounded-full text-on-surface-variant focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-surface-container-low/30">
              {/* Dynamic list rendering */}
              {(
                activeChat.chatHistory || [
                  {
                    id: activeChat.id + '-initial',
                    senderName: activeChat.senderName,
                    senderAvatar: activeChat.senderAvatar,
                    messageText: activeChat.messageText,
                    time: activeChat.time,
                    isUser: false,
                  },
                ]
              ).map((m) => {
                const isUser = m.isUser;
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <img
                      src={m.senderAvatar}
                      alt={m.senderName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`text-xs p-3.5 rounded-2xl shadow-soft leading-relaxed border ${
                        isUser
                          ? 'bg-primary text-on-primary rounded-tr-none border-primary/20'
                          : 'bg-white text-on-surface rounded-tl-none border-surface-container-low'
                      }`}
                    >
                      <p>{m.messageText}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-surface-container bg-surface flex items-center gap-2 pb-safe">
              <input
                type="text"
                placeholder="发送消息..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-grow bg-surface-container-low border border-transparent rounded-full py-3.5 px-5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:bg-surface outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-3.5 bg-primary text-on-primary rounded-full hover:bg-opacity-95 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center shadow-soft focus:outline-none"
              >
                <Send size={14} className="stroke-[2.5px]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
