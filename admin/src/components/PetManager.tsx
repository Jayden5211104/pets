import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import type { Pet, PetCategory } from '../types';
import { Search, Plus, Edit3, Trash2, X, Circle, CircleDot } from 'lucide-react';
import PetForm from './PetForm';

export default function PetManager() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [onlineFilter, setOnlineFilter] = useState<string>('');

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getPets({
      search: search || undefined,
      category: categoryFilter || undefined,
      isOnline: onlineFilter || undefined,
      limit: 100,
    });
    if (res.success && res.data) setPets(res.data);
    setLoading(false);
  }, [search, categoryFilter, onlineFilter]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除宠物「${name}」吗？此操作不可逆。`)) return;
    const res = await adminApi.deletePet(id);
    if (res.success) fetchPets();
    else alert('删除失败: ' + (res.error || ''));
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditPet(null);
    fetchPets();
  };

  const categories: { label: string; value: PetCategory | '' }[] = [
    { label: '全部分类', value: '' },
    { label: '🐶 狗狗', value: 'dog' },
    { label: '🐱 猫咪', value: 'cat' },
    { label: '🐦 鸟类', value: 'bird' },
    { label: '🐹 仓鼠', value: 'hamster' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-on-surface">宠物管理</h2>
        <button
          onClick={() => { setEditPet(null); setShowForm(true); }}
          className="bg-primary hover:bg-opacity-90 text-on-primary font-bold text-sm py-2.5 px-5 rounded-button shadow-soft flex items-center gap-2 transition-all active:scale-98"
        >
          <Plus size={16} className="stroke-[2.5px]" />
          添加宠物
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-grow max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            type="text" placeholder="搜索宠物名称或品种..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary outline-none transition-all"
          />
        </div>
        <select
          value={onlineFilter}
          onChange={e => setOnlineFilter(e.target.value)}
          className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface font-medium outline-none focus:border-primary cursor-pointer"
        >
          <option value="">全部状态</option>
          <option value="true">在线</option>
          <option value="false">已领养(下线)</option>
        </select>
        <div className="flex gap-1">
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                categoryFilter === c.value
                  ? 'bg-primary text-on-primary shadow-soft'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl shadow-soft border border-surface-container overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-container text-on-surface-variant/60 text-xs font-bold">
              <th className="text-left p-4">宠物</th>
              <th className="text-left p-4">分类</th>
              <th className="text-left p-4">品种</th>
              <th className="text-left p-4">年龄</th>
              <th className="text-left p-4">性别</th>
              <th className="text-left p-4">状态</th>
              <th className="text-right p-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant/60">加载中...</td></tr>
            ) : pets.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant/50">暂无宠物数据</td></tr>
            ) : (
              pets.map(pet => (
                <tr key={pet.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={pet.imageUrl} alt={pet.name} className="w-10 h-10 rounded-lg object-cover bg-surface-container" referrerPolicy="no-referrer" />
                      <span className="font-bold text-on-surface">{pet.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant text-xs font-medium">
                    {{ dog: '🐶 狗', cat: '🐱 猫', bird: '🐦 鸟', hamster: '🐹 仓鼠' }[pet.category]}
                  </td>
                  <td className="p-4 text-on-surface-variant text-xs">{pet.breed}</td>
                  <td className="p-4 text-on-surface-variant text-xs">{pet.age}</td>
                  <td className="p-4 text-on-surface-variant text-xs">{pet.gender}</td>
                  <td className="p-4">
                    {pet.isOnline ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        <Circle size={8} className="fill-green-500 stroke-green-500" /> 在线
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant/60 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        <CircleDot size={8} /> 已下线
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditPet(pet); setShowForm(true); }}
                        className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                        title="编辑"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(pet.id, pet.name)}
                        className="p-2 hover:bg-red-50 rounded-lg text-on-surface-variant/40 hover:text-red-500 transition-all"
                        title="删除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pet Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-10 p-4">
          <div className="bg-surface rounded-2xl shadow-soft-2 border border-surface-container w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-surface-container sticky top-0 bg-surface z-10">
              <h3 className="font-display font-bold text-base text-on-surface">
                {editPet ? '编辑宠物' : '添加宠物'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditPet(null); }}
                className="p-1.5 hover:bg-surface-container-low rounded-full text-on-surface-variant">
                <X size={18} />
              </button>
            </div>
            <PetForm
              pet={editPet}
              onSaved={handleFormSaved}
              onCancel={() => { setShowForm(false); setEditPet(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
