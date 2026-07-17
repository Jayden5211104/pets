import React from 'react';
import { Pet, Shelter } from '../types';
import { ArrowLeft, Heart, Cake, Smile, Scale, Maximize2, ShieldCheck, HeartHandshake, Info, ArrowUpRight } from 'lucide-react';

interface PetDetailsViewProps {
  pet: Pet;
  shelter: Shelter;
  favorites: string[];
  onBack: () => void;
  onToggleFavorite: (petId: string, e: React.MouseEvent) => void;
  onStartAdopt: (petId: string) => void;
}

export default function PetDetailsView({
  pet,
  shelter,
  favorites,
  onBack,
  onToggleFavorite,
  onStartAdopt,
}: PetDetailsViewProps) {
  const isFav = favorites.includes(pet.id);

  return (
    <div className="w-full max-w-2xl mx-auto bg-background min-h-dvh pb-32 font-sans relative">
      {/* Top Navigation Sticky Bar */}
      <header className="w-full top-0 sticky bg-surface/90 backdrop-blur shadow-sm z-40 flex items-center justify-between px-5 py-3 h-[64px] border-b border-surface-container">
        <button
          onClick={onBack}
          aria-label="返回"
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-150"
        >
          <ArrowLeft size={20} className="stroke-[2.5px]" />
        </button>
        <div className="font-display font-bold text-lg text-primary">{pet.name}</div>
        <div className="w-10 h-10"></div> {/* Placeholder for balance */}
      </header>

      <main className="md:mt-4 px-5">
        {/* Hero Image Container */}
        <div className="w-full aspect-[4/5] md:aspect-video relative overflow-hidden rounded-2xl shadow-soft bg-surface-container mb-6">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

          {/* overlay info details */}
          <div className="absolute bottom-0 left-0 w-full p-5 flex justify-between items-end text-white">
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl mb-1">{pet.name}</h1>
              <p className="text-xs text-white/90 font-medium">
                {pet.breed} • {pet.location}
              </p>
            </div>
            
            {/* Heart Toggle overlay */}
            <button
              onClick={(e) => onToggleFavorite(pet.id, e)}
              className="w-12 h-12 bg-white/20 hover:bg-white/35 active:scale-90 backdrop-blur rounded-full flex items-center justify-center text-white transition-all shadow-soft"
            >
              <Heart
                size={22}
                className={`transition-colors ${isFav ? 'fill-red-500 stroke-red-500 animate-pulse' : 'stroke-white'}`}
              />
            </button>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-soft border border-surface-container/40">
            <Cake size={18} className="text-primary mb-1.5" />
            <span className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">年龄</span>
            <span className="font-display font-bold text-sm text-on-surface mt-0.5">{pet.age}</span>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-soft border border-surface-container/40">
            <Smile size={18} className="text-primary mb-1.5" />
            <span className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">性别</span>
            <span className="font-display font-bold text-sm text-on-surface mt-0.5">{pet.gender}</span>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-soft border border-surface-container/40">
            <Scale size={18} className="text-primary mb-1.5" />
            <span className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">体重</span>
            <span className="font-display font-bold text-sm text-on-surface mt-0.5">{pet.weight}</span>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-soft border border-surface-container/40">
            <Maximize2 size={18} className="text-primary mb-1.5" />
            <span className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">体型</span>
            <span className="font-display font-bold text-sm text-on-surface mt-0.5">{pet.size}</span>
          </div>
        </div>

        {/* Health & Tags Chips */}
        <div className="mb-6">
          <h2 className="font-display font-bold text-base text-on-surface mb-3">健康与特征</h2>
          <div className="flex flex-wrap gap-2">
            {pet.isVaccinated && (
              <span className="bg-secondary-container text-on-secondary-container px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
                🛡️ 已接种疫苗
              </span>
            )}
            {pet.isNeutered && (
              <span className="bg-secondary-container text-on-secondary-container px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
                ✂️ 已绝育
              </span>
            )}
            {pet.isHouseTrained && (
              <span className="bg-secondary-container text-on-secondary-container px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
                🏠 已受室内训练
              </span>
            )}
            {pet.isEnergetic && (
              <span className="bg-surface-container-highest text-on-surface-variant px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
                ⚡ 精力充沛
              </span>
            )}
            {pet.isGoodWithKids && (
              <span className="bg-surface-container-highest text-on-surface-variant px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
                👶 喜欢孩子
              </span>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-surface rounded-2xl p-5 shadow-soft border border-surface-container mb-6">
          <h2 className="font-display font-bold text-base text-on-surface mb-3 flex items-center gap-2 border-b border-surface-container pb-2">
            <Info size={16} className="text-primary" />
            关于{pet.name}
          </h2>
          <div className="space-y-3">
            {pet.description.map((para, idx) => (
              <p key={idx} className="text-sm text-on-surface-variant leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Shelter Info */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-2xl shadow-soft border border-surface-container">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface-container border border-surface-container-high shadow-soft">
              <img
                src={shelter.logoUrl}
                alt={shelter.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">{shelter.name}</h3>
              <p className="text-[10px] text-on-surface-variant/60 font-semibold mt-0.5">{shelter.location} • {shelter.distance}</p>
            </div>
          </div>
          <button
            onClick={() => alert('已呼叫快乐爪子救助站，正在为您建立会面预约...')}
            className="p-2 bg-surface-container-low hover:bg-surface-container-highest text-primary rounded-full transition-all"
            title="联系站长"
          >
            <ArrowUpRight size={18} className="stroke-[2.5px]" />
          </button>
        </div>
      </main>

      {/* Sticky Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur border-t border-surface-container z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="max-w-2xl mx-auto p-4">
          <button
            onClick={() => onStartAdopt(pet.id)}
            className="w-full bg-primary hover:bg-opacity-95 text-on-primary font-display font-bold text-base py-4 rounded-button shadow-soft-2 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            🐾 立即领养{pet.name}
          </button>
        </div>
      </div>
    </div>
  );
}
