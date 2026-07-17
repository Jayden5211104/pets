import React, { useState } from 'react';
import { Pet } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle2, Home, Building, Check, Sparkles, Smile } from 'lucide-react';

interface AdoptionFormViewProps {
  pet: Pet;
  onSubmit: (data: {
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    homeType: 'apartment' | 'house';
    hasYard: boolean;
    reason: string;
  }) => void;
  onBack: () => void;
  onFinishRedirect: () => void;
}

export default function AdoptionFormView({
  pet,
  onSubmit,
  onBack,
  onFinishRedirect,
}: AdoptionFormViewProps) {
  const [step, setStep] = useState(1);
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [homeType, setHomeType] = useState<'apartment' | 'house'>('house');
  const [hasYard, setHasYard] = useState(true);
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  // Handle step transitions
  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setValidationError('请输入姓名');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setValidationError('请输入合法的电子邮箱');
        return;
      }
      if (!phone.trim() || phone.length < 8) {
        setValidationError('请输入合法的联系电话');
        return;
      }
      setValidationError('');
      setStep(2);
    } else if (step === 2) {
      if (!reason.trim()) {
        setValidationError('请简单填写您想领养的原因');
        return;
      }
      setValidationError('');
      
      // Call onSubmit callback
      onSubmit({
        applicantName: name,
        applicantEmail: email,
        applicantPhone: phone,
        homeType,
        hasYard,
        reason,
      });
      
      setStep(3); // Show Success view
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-background min-h-dvh pb-24 font-sans relative">
      {/* Header Navigation */}
      <header className="w-full top-0 sticky bg-surface/90 backdrop-blur shadow-sm z-40 flex items-center justify-between px-5 py-3 h-[64px] border-b border-surface-container">
        <button
          onClick={step === 3 ? onFinishRedirect : onBack}
          aria-label="返回"
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-150"
        >
          <ArrowLeft size={20} className="stroke-[2.5px]" />
        </button>
        <div className="font-display font-bold text-lg text-primary">领养申请</div>
        <div className="w-10 h-10"></div>
      </header>

      <main className="px-5 mt-4">
        {/* Banner Image (only shown in input steps to match mockup) */}
        {step < 3 && (
          <div className="w-full h-40 md:h-52 rounded-2xl overflow-hidden mb-6 relative shadow-soft">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPK-8oTzin0sivfBHZYPUCN6v3E1ysYGDzsFoMWL0NdM7P5gKCegtk3HfyKY6KJMpWHTmdEXs90PLLBWmuOolfpzorNgsSHjekctCHOPAcxNGffiDmSxTeIhg0vu8fqnCXJge-xdKHlp9hmqh1iJzndH4mc6bgM8idTrIDKh4o-boiSYEqdBubt5xOyQnAoZsTkObHST4WGiQ2Qnf_YHmUE_R2iFrz-LfhIZG00vvmflBdHo6iqbp-ewFGFp9Ct6OoSTRDmlhlcM46"
              alt="Golden Retriever Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <h2 className="absolute bottom-4 left-6 font-display font-bold text-xl md:text-2xl text-white">
              带它们回家
            </h2>
          </div>
        )}

        {/* Multi-step Progressive Indicator bar */}
        <div className="mb-8 bg-surface rounded-2xl p-4 shadow-soft border border-surface-container">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-primary">
              步骤 {step === 3 ? '3/3' : `${step}/3`}
            </span>
            <span className="text-xs text-on-surface-variant/70 font-semibold">
              {step === 1 ? '个人信息' : step === 2 ? '你的生活环境' : '申请成功'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 relative px-2">
            {/* Connecting lines */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-container rounded-full -z-10"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary rounded-full -z-10 transition-all duration-300"
              style={{
                width: step === 1 ? '15%' : step === 2 ? '50%' : '100%',
              }}
            ></div>

            {/* Nodes */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold shadow-soft transition-all ${
                step >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant/50'
              }`}
            >
              1
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold shadow-soft transition-all ${
                step >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant/50 border-2 border-background'
              }`}
            >
              2
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold shadow-soft transition-all ${
                step >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant/50 border-2 border-background'
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Form Body Wrapper Card */}
        {step < 3 ? (
          <div className="bg-surface rounded-2xl p-6 shadow-soft border border-surface-container">
            {validationError && (
              <div className="bg-red-50 text-red-600 border border-red-100 text-xs p-3.5 rounded-xl mb-4 text-center font-medium animate-pulse">
                ⚠️ {validationError}
              </div>
            )}

            {/* STEP 1: Personal details (关于你) */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-on-surface mb-2">关于你</h3>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-2" htmlFor="fullName">
                    姓名
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="张三"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-2" htmlFor="email">
                      电子邮箱
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="zhangsan@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-2" htmlFor="phone">
                      联系电话
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="138 1234 5678"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Living Environment (你的生活环境) */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-base text-on-surface">你的生活环境</h3>

                {/* Residential Type options */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-3">居住类型</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setHomeType('apartment')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        homeType === 'apartment'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      <Building size={20} className={homeType === 'apartment' ? 'text-primary' : 'text-on-surface-variant/70'} />
                      <span className="text-xs font-semibold">公寓</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHomeType('house')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        homeType === 'house'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      <Home size={20} className={homeType === 'house' ? 'text-primary' : 'text-on-surface-variant/70'} />
                      <span className="text-xs font-semibold">住宅</span>
                    </button>
                  </div>
                </div>

                {/* Yard selections */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-3">是否有独立院落？</label>
                  <div className="flex gap-6 pl-1">
                    <button
                      type="button"
                      onClick={() => setHasYard(true)}
                      className="flex items-center gap-2.5 group focus:outline-none"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        hasYard ? 'border-primary' : 'border-outline-variant group-hover:border-on-surface-variant'
                      }`}>
                        {hasYard && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                      </div>
                      <span className="text-sm font-semibold text-on-surface">有</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasYard(false)}
                      className="flex items-center gap-2.5 group focus:outline-none"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        !hasYard ? 'border-primary' : 'border-outline-variant group-hover:border-on-surface-variant'
                      }`}>
                        {!hasYard && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                      </div>
                      <span className="text-sm font-semibold text-on-surface">没有</span>
                    </button>
                  </div>
                </div>

                {/* Why Adopt? */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    为什么想领养？
                  </label>
                  <p className="text-[11px] text-on-surface-variant/60 mb-3">
                    请简单介绍一下你的生活方式，以及为什么准备好迎接新伙伴。
                  </p>
                  <textarea
                    rows={4}
                    placeholder="我一直很喜欢小动物..."
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface outline-none resize-none transition-all"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Bottom action button */}
            <div className="mt-8 border-t border-surface-container pt-6">
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-primary hover:bg-opacity-95 text-on-primary font-display font-bold text-base py-4 rounded-button shadow-soft-2 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                {step === 1 ? '下一步' : '提交申请'}
                {step === 1 ? <ArrowRight size={18} /> : <Check size={18} className="stroke-[2.5px]" />}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 3: SUCCESS CONGRATS VIEW */
          <div className="bg-surface rounded-2xl p-8 shadow-soft border border-surface-container text-center py-10 animate-fade-in">
            {/* Confetti celebration icon */}
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 shadow-soft">
              <CheckCircle2 size={36} className="stroke-[2px]" />
            </div>

            <h3 className="font-display font-bold text-xl text-on-surface mb-2">
              领养申请提交成功！
            </h3>
            
            {/* Visual highlight on applied pet */}
            <div className="bg-surface-container-low rounded-2xl p-4 max-w-sm mx-auto my-6 border border-surface-container flex items-center gap-4">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-16 h-16 rounded-xl object-cover shadow-soft border"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <h4 className="font-bold text-sm text-on-surface">{pet.name}</h4>
                <p className="text-xs text-on-surface-variant/60">{pet.breed}</p>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block">
                  审核等待中
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant/70 leading-relaxed max-w-sm mx-auto mb-8">
              快乐爪子救助站的志愿者会在 <strong>1-3 个工作日</strong>内仔细审核您的生活环境。我们会通过系统消息通知您的申请进度。感谢您的耐心和对领养小动物的无限善意！❤️
            </p>

            <button
              onClick={onFinishRedirect}
              className="w-full max-w-xs bg-primary hover:bg-opacity-95 text-on-primary font-display font-bold text-sm py-4 rounded-button shadow-soft-2 active:scale-98 transition-all"
            >
              查看我的领养进度
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
