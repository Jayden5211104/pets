import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Heart, MapPin, ChevronDown, Check, X } from 'lucide-react';
import { Pet, PetCategory } from '../types';
import { REGIONS } from '../data/regions';

interface HomeViewProps {
  pets: Pet[];
  favorites: string[];
  userAvatar: string;
  onToggleFavorite: (petId: string, e: React.MouseEvent) => void;
  onSelectPet: (petId: string) => void;
  onSwitchToSearch: (category?: PetCategory) => void;
}

export default function HomeView({
  pets,
  favorites,
  userAvatar,
  onToggleFavorite,
  onSelectPet,
  onSwitchToSearch,
}: HomeViewProps) {
  // Location states
  const [currentProvince, setCurrentProvince] = useState<string>(() => {
    return localStorage.getItem('kp_province') || '北京市';
  });
  const [currentCity, setCurrentCity] = useState<string>(() => {
    return localStorage.getItem('kp_city') || '北京市';
  });
  const [currentDistrict, setCurrentDistrict] = useState<string>(() => {
    return localStorage.getItem('kp_district') || '朝阳区';
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Selector form temporary values
  const [tempProvince, setTempProvince] = useState(currentProvince);
  const [tempCity, setTempCity] = useState(currentCity);
  const [tempDistrict, setTempDistrict] = useState(currentDistrict);

  // Sync temp variables when selector opens
  useEffect(() => {
    if (isSelectorOpen) {
      setTempProvince(currentProvince);
      setTempCity(currentCity);
      setTempDistrict(currentDistrict);
    }
  }, [isSelectorOpen, currentProvince, currentCity, currentDistrict]);

  // Derived available cities and districts based on selection
  const selectedProvinceObj = REGIONS.find((p) => p.name === tempProvince) || REGIONS[0];
  const availableCities = selectedProvinceObj.cities;
  const selectedCityObj = availableCities.find((c) => c.name === tempCity) || availableCities[0];
  const availableDistricts = selectedCityObj ? selectedCityObj.districts : [];

  // Reset city and district when province changes
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProv = e.target.value;
    setTempProvince(nextProv);
    const nextProvObj = REGIONS.find((p) => p.name === nextProv) || REGIONS[0];
    const nextCity = nextProvObj.cities[0]?.name || '';
    setTempCity(nextCity);
    const nextCityObj = nextProvObj.cities[0];
    const nextDist = nextCityObj?.districts[0] || '';
    setTempDistrict(nextDist);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCity = e.target.value;
    setTempCity(nextCity);
    const nextCityObj = availableCities.find((c) => c.name === nextCity);
    const nextDist = nextCityObj?.districts[0] || '';
    setTempDistrict(nextDist);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempDistrict(e.target.value);
  };

  const handleSelectHotCity = (p: string, c: string, d: string) => {
    setTempProvince(p);
    setTempCity(c);
    setTempDistrict(d);
  };

  const handleSaveLocation = () => {
    setCurrentProvince(tempProvince);
    setCurrentCity(tempCity);
    setCurrentDistrict(tempDistrict);
    localStorage.setItem('kp_province', tempProvince);
    localStorage.setItem('kp_city', tempCity);
    localStorage.setItem('kp_district', tempDistrict);
    setIsSelectorOpen(false);
  };

  // Get specific pets for showcase from the static lists
  const bubu = pets.find((p) => p.id === 'bubu') || pets[0];
  const xueqiu = pets.find((p) => p.id === 'xueqiu') || pets[1];
  const charlie = pets.find((p) => p.id === 'charlie') || pets[2];

  const categories: { label: string; key: PetCategory; colorClass: string; emoji: string }[] = [
    { label: '狗狗', key: 'dog', colorClass: 'bg-blue-100 text-blue-500', emoji: '🐶' },
    { label: '猫咪', key: 'cat', colorClass: 'bg-amber-100 text-amber-500', emoji: '🐱' },
    { label: '鸟类', key: 'bird', colorClass: 'bg-rose-100 text-rose-500', emoji: '🐦' },
    { label: '仓鼠', key: 'hamster', colorClass: 'bg-slate-100 text-slate-500', emoji: '🐹' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-4 pb-20 font-sans">
      {/* Header with Location & Profile */}
      <div className="flex items-center justify-between mb-6 relative">
        <div>
          <span className="text-xs text-on-surface-variant/70 font-medium">当前城市</span>
          <button
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="flex items-center gap-1 text-on-surface hover:text-primary transition-colors text-left focus:outline-none py-1 group"
          >
            <MapPin size={18} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-lg text-on-surface">
              {currentProvince === currentCity
                ? `${currentCity} · ${currentDistrict}`
                : `${currentProvince} · ${currentCity} · ${currentDistrict}`}
            </span>
            <ChevronDown
              size={16}
              className={`text-on-surface-variant/60 transition-transform duration-200 ${
                isSelectorOpen ? 'rotate-180 text-primary' : ''
              }`}
            />
          </button>
        </div>
        <img
          src={userAvatar}
          alt="User Profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shadow-soft"
          referrerPolicy="no-referrer"
        />

        {/* Location Dropdown Selector Drawer/Card */}
        {isSelectorOpen && (
          <div className="absolute top-[64px] left-0 z-50 bg-surface border border-surface-container rounded-2xl p-5 shadow-soft-2 animate-fade-in w-full max-w-md">
            <div className="flex items-center justify-between mb-4 border-b border-surface-container pb-2">
              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                🗺️ 选择或切换定位城市
              </h4>
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="p-1 text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Province */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant/60">选择省份/直辖市</label>
                <div className="relative">
                  <select
                    value={tempProvince}
                    onChange={handleProvinceChange}
                    className="w-full text-xs bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 text-on-surface font-semibold focus:border-primary outline-none cursor-pointer appearance-none pr-8"
                  >
                    {REGIONS.map((prov) => (
                      <option key={prov.name} value={prov.name}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant/60">选择城市</label>
                <div className="relative">
                  <select
                    value={tempCity}
                    onChange={handleCityChange}
                    className="w-full text-xs bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 text-on-surface font-semibold focus:border-primary outline-none cursor-pointer appearance-none pr-8"
                  >
                    {availableCities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* District */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant/60">选择区县</label>
                <div className="relative">
                  <select
                    value={tempDistrict}
                    onChange={handleDistrictChange}
                    className="w-full text-xs bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 text-on-surface font-semibold focus:border-primary outline-none cursor-pointer appearance-none pr-8"
                  >
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick choices / Hot regions */}
            <div className="mt-4 pt-4 border-t border-surface-container">
              <span className="text-[10px] font-bold text-on-surface-variant/60 block mb-2.5">快捷定位</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { p: '北京市', c: '北京市', d: '朝阳区', label: '北京 · 朝阳' },
                  { p: '上海市', c: '上海市', d: '浦东新区', label: '上海 · 浦东' },
                  { p: '广东省', c: '广州市', d: '天河区', label: '广州 · 天河' },
                  { p: '广东省', c: '深圳市', d: '南山区', label: '深圳 · 南山' },
                  { p: '浙江省', c: '杭州市', d: '西湖区', label: '杭州 · 西湖' },
                  { p: '四川省', c: '成都市', d: '武侯区', label: '成都 · 武侯' },
                ].map((hot) => {
                  const isHotSelected =
                    tempProvince === hot.p && tempCity === hot.c && tempDistrict === hot.d;
                  return (
                    <button
                      key={hot.label}
                      onClick={() => handleSelectHotCity(hot.p, hot.c, hot.d)}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        isHotSelected
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-low text-on-surface-variant/80 border-surface-container hover:bg-primary/5 hover:text-primary hover:border-primary/20'
                      }`}
                    >
                      {hot.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="flex-1 text-xs font-bold text-on-surface-variant/70 bg-surface-container-low hover:bg-surface-container-high py-3 rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSaveLocation}
                className="flex-1 text-xs font-bold text-on-primary bg-primary hover:bg-opacity-95 py-3 rounded-xl transition-all shadow-soft flex items-center justify-center gap-1"
              >
                <Check size={14} className="stroke-[2.5px]" /> 确定定位
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Search input bar */}
      <div className="relative flex items-center gap-2 mb-8">
        <div className="relative flex-grow">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="寻找你的毛孩子..."
            onClick={() => onSwitchToSearch()}
            readOnly
            className="w-full bg-surface-container-low border border-transparent rounded-xl py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:bg-surface outline-none cursor-pointer shadow-soft transition-all"
          />
        </div>
        <button
          onClick={() => onSwitchToSearch()}
          className="p-4 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:bg-opacity-90 active:scale-95 transition-all shadow-soft"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Categories Circles */}
      <div className="mb-8">
        <h3 className="font-display font-bold text-base text-on-surface mb-4">寻找毛孩子</h3>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onSwitchToSearch(cat.key)}
              className="flex flex-col items-center group transition-transform active:scale-95"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-soft mb-2 bg-surface-container-low group-hover:bg-primary/5 transition-colors`}>
                <span>{cat.emoji}</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-colors">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* New Pets Arrivals */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-on-surface">新宠到来</h3>
          <button
            onClick={() => onSwitchToSearch()}
            className="text-xs font-bold text-primary hover:underline transition-all"
          >
            查看全部
          </button>
        </div>

        {/* Large Prominent Showcase Card for Bubu */}
        {bubu && (
          <div
            onClick={() => onSelectPet(bubu.id)}
            className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative shadow-soft cursor-pointer group mb-4 border border-surface-container hover:border-primary/20 transition-all"
          >
            <img
              src={bubu.imageUrl}
              alt={bubu.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Favorite Indicator heart */}
            <button
              onClick={(e) => onToggleFavorite(bubu.id, e)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 active:scale-90 transition-all"
            >
              <Heart
                size={18}
                className={`transition-colors ${favorites.includes(bubu.id) ? 'fill-red-500 stroke-red-500' : 'stroke-white'}`}
              />
            </button>

            {/* Content overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <h4 className="font-display font-bold text-xl mb-1">{bubu.name}</h4>
                <p className="text-xs text-white/95">
                  {bubu.breed} • {bubu.age}
                </p>
              </div>
              <span className="bg-white/20 backdrop-blur-md text-xs px-3 py-1.5 rounded-full font-semibold">
                {bubu.distance}
              </span>
            </div>
          </div>
        )}

        {/* Dual Column list below (Xueqiu and Charlie) */}
        <div className="grid grid-cols-2 gap-4">
          {[xueqiu, charlie].map((pet) => {
            if (!pet) return null;
            return (
              <div
                key={pet.id}
                onClick={() => onSelectPet(pet.id)}
                className="bg-surface rounded-2xl overflow-hidden shadow-soft border border-surface-container cursor-pointer group hover:border-primary/20 transition-all flex flex-col"
              >
                <div className="w-full aspect-square relative overflow-hidden bg-surface-container">
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Favorite button */}
                  <button
                    onClick={(e) => onToggleFavorite(pet.id, e)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/45 active:scale-90 transition-all"
                  >
                    <Heart
                      size={14}
                      className={`transition-colors ${favorites.includes(pet.id) ? 'fill-red-500 stroke-red-500' : 'stroke-white'}`}
                    />
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                    {pet.distance}
                  </span>
                </div>
                <div className="p-3.5">
                  <h4 className="font-display font-bold text-base text-on-surface mb-0.5">
                    {pet.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant/80 font-medium">
                    {pet.breed} • {pet.age}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
