import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Heart, X, ChevronDown } from 'lucide-react';
import { Pet, PetCategory } from '../types';

interface SearchViewProps {
  pets: Pet[];
  favorites: string[];
  initialCategory?: PetCategory;
  onToggleFavorite: (petId: string, e: React.MouseEvent) => void;
  onSelectPet: (petId: string) => void;
}

export default function SearchView({
  pets,
  favorites,
  initialCategory,
  onToggleFavorite,
  onSelectPet,
}: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PetCategory | 'all'>(
    initialCategory || 'all'
  );
  const [ageFilter, setAgeFilter] = useState<'all' | 'young' | 'youth' | 'adult'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | '公' | '母'>('all');
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // Filter labels
  const ageLabels = {
    all: '年龄',
    young: '幼犬/幼猫',
    youth: '青年',
    adult: '成年 / 老年',
  };

  const genderLabels = {
    all: '性别',
    公: '男生 (公)',
    母: '女生 (母)',
  };

  const categories: { label: string; key: PetCategory | 'all' }[] = [
    { label: '全部', key: 'all' },
    { label: '狗狗', key: 'dog' },
    { label: '猫咪', key: 'cat' },
    { label: '鸟类', key: 'bird' },
    { label: '仓鼠', key: 'hamster' },
  ];

  // Perform multi-dimensional filtering
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      // 1. Text Search query
      const matchesSearch =
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category selection
      const matchesCategory =
        selectedCategory === 'all' || pet.category === selectedCategory;

      // 3. Age filter
      let matchesAge = true;
      if (ageFilter === 'young') {
        matchesAge = pet.age.includes('月') || pet.age.includes('幼');
      } else if (ageFilter === 'youth') {
        matchesAge = pet.age.includes('青年') || pet.age.includes('1岁') || pet.age.includes('2岁');
      } else if (ageFilter === 'adult') {
        matchesAge = pet.age.includes('成年') || pet.age.includes('老年') || parseInt(pet.age) >= 3;
      }

      // 4. Gender filter
      const matchesGender = genderFilter === 'all' || pet.gender === genderFilter;

      return matchesSearch && matchesCategory && matchesAge && matchesGender;
    });
  }, [pets, searchQuery, selectedCategory, ageFilter, genderFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setAgeFilter('all');
    setGenderFilter('all');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-4 pb-24 font-sans relative">
      {/* Title */}
      <h1 className="font-display font-bold text-2xl text-on-surface mb-6">
        寻找你的新朋友
      </h1>

      {/* Search Input Bar */}
      <div className="relative flex items-center gap-2 mb-6">
        <div className="relative flex-grow">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="搜索品种、名字..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-transparent rounded-xl py-4 pl-12 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:bg-surface outline-none shadow-soft transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={clearFilters}
          className="p-4 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-soft"
          title="清除过滤器"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filter Dropdowns Rows */}
      <div className="flex flex-wrap gap-2 items-center mb-6 relative">
        {/* Age Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAgeDropdown(!showAgeDropdown);
              setShowGenderDropdown(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-semibold transition-all ${
              ageFilter !== 'all'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {ageLabels[ageFilter]}
            <ChevronDown size={14} className={`transition-transform ${showAgeDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showAgeDropdown && (
            <div className="absolute top-10 left-0 w-36 bg-surface border border-outline-variant rounded-xl shadow-soft-2 py-1.5 z-30">
              {(['all', 'young', 'youth', 'adult'] as const).map((age) => (
                <button
                  key={age}
                  onClick={() => {
                    setAgeFilter(age);
                    setShowAgeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-surface-container-low ${
                    ageFilter === age ? 'text-primary bg-primary/5' : 'text-on-surface-variant'
                  }`}
                >
                  {ageLabels[age]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gender Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowGenderDropdown(!showGenderDropdown);
              setShowAgeDropdown(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-semibold transition-all ${
              genderFilter !== 'all'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {genderLabels[genderFilter]}
            <ChevronDown size={14} className={`transition-transform ${showGenderDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showGenderDropdown && (
            <div className="absolute top-10 left-0 w-32 bg-surface border border-outline-variant rounded-xl shadow-soft-2 py-1.5 z-30">
              {(['all', '公', '母'] as const).map((gender) => (
                <button
                  key={gender}
                  onClick={() => {
                    setGenderFilter(gender);
                    setShowGenderDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-surface-container-low ${
                    genderFilter === gender ? 'text-primary bg-primary/5' : 'text-on-surface-variant'
                  }`}
                >
                  {genderLabels[gender]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Active Category Badge Tag */}
        {selectedCategory !== 'all' && (
          <span className="bg-secondary-container text-on-secondary-container px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
            {categories.find((c) => c.key === selectedCategory)?.label}
            <button
              onClick={() => setSelectedCategory('all')}
              className="hover:text-red-500 rounded-full"
            >
              <X size={12} className="stroke-[3px]" />
            </button>
          </span>
        )}
      </div>

      {/* Horizontal Category Badges for selection */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-primary text-on-primary shadow-soft'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Clear Backdrop for dropdowns */}
      {(showAgeDropdown || showGenderDropdown) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowAgeDropdown(false);
            setShowGenderDropdown(false);
          }}
        ></div>
      )}

      {/* Grid List of Pets */}
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet.id)}
              className="bg-surface rounded-2xl overflow-hidden shadow-soft border border-surface-container cursor-pointer group hover:border-primary/20 transition-all flex flex-col"
            >
              <div className="w-full aspect-[4/5] relative overflow-hidden bg-surface-container">
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {/* Favorite button */}
                <button
                  onClick={(e) => onToggleFavorite(pet.id, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 active:scale-90 transition-all z-10"
                >
                  <Heart
                    size={14}
                    className={`transition-colors ${favorites.includes(pet.id) ? 'fill-red-500 stroke-red-500' : 'stroke-white'}`}
                  />
                </button>
                <span className="absolute bottom-2.5 right-2.5 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {pet.distance}
                </span>
              </div>
              <div className="p-3.5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-base text-on-surface mb-0.5">
                    {pet.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant/80 font-medium">
                    {pet.breed} • {pet.age}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-surface rounded-2xl border border-dashed border-outline-variant/60 mt-4 shadow-soft">
          <span className="text-4xl mb-4 block">🐾</span>
          <h3 className="font-display font-bold text-base text-on-surface mb-1">
            没有找到相符的毛孩子
          </h3>
          <p className="text-xs text-on-surface-variant/60 max-w-xs mx-auto mb-6">
            试试调整您的搜索词、分类或者筛选条件，给可爱的毛孩子一个被发现的机会吧。
          </p>
          <button
            onClick={clearFilters}
            className="text-xs font-bold bg-primary text-on-primary py-2 px-5 rounded-full hover:bg-opacity-90 active:scale-95 shadow-soft transition-all"
          >
            重置所有筛选
          </button>
        </div>
      )}

      {/* Load More Button */}
      {filteredPets.length > 0 && (
        <div className="mt-8 text-center pb-8">
          <button
            onClick={() => alert('已加载全部可供领养的毛孩子')}
            className="bg-surface-container-low hover:bg-surface-container-highest text-on-surface-variant font-bold text-xs py-3 px-6 rounded-full active:scale-95 transition-all shadow-soft"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
