import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { adminApi } from '../services/api';
import type { Pet, PetFormData, PetCategory } from '../types';
import { Upload, X } from 'lucide-react';

const EMPTY_FORM: PetFormData = {
  name: '', breed: '', age: '', gender: '公', weight: '', size: '中型',
  location: '', distance: '', category: 'dog',
  tags: '', description: '',
  isVaccinated: false, isNeutered: false, isHouseTrained: false,
  isEnergetic: false, isGoodWithKids: false,
  shelterId: 'happy-paws',
};

export default function PetForm({ pet, onSaved, onCancel }: { pet: Pet | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<PetFormData>(EMPTY_FORM);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name, breed: pet.breed, age: pet.age, gender: pet.gender,
        weight: pet.weight, size: pet.size, location: pet.location,
        distance: pet.distance, category: pet.category,
        tags: pet.tags.join('，'), description: pet.description.join('\n'),
        isVaccinated: pet.isVaccinated, isNeutered: pet.isNeutered,
        isHouseTrained: pet.isHouseTrained, isEnergetic: pet.isEnergetic,
        isGoodWithKids: pet.isGoodWithKids, shelterId: pet.shelterId || 'happy-paws',
      });
      setPreviewUrl(pet.imageUrl);
    }
  }, [pet]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('图片不能超过 10MB'); return; }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: keyof PetFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('请输入宠物名称'); return; }
    if (!form.breed.trim()) { setError('请输入品种'); return; }
    if (!form.age.trim()) { setError('请输入年龄'); return; }

    setSaving(true);
    setError('');

    const payload = {
      ...form,
      tags: form.tags.split(/[,，]/).map(s => s.trim()).filter(Boolean),
      description: form.description.split('\n').map(s => s.trim()).filter(Boolean),
      ...(imageBase64 ? { imageBase64 } : {}),
    };

    const res = pet
      ? await adminApi.updatePet(pet.id, payload)
      : await adminApi.createPet(payload);

    setSaving(false);
    if (res.success) onSaved();
    else setError(res.error || '保存失败');
  };

  const categories: { label: string; value: PetCategory }[] = [
    { label: '🐶 狗', value: 'dog' }, { label: '🐱 猫', value: 'cat' },
    { label: '🐦 鸟', value: 'bird' }, { label: '🐹 仓鼠', value: 'hamster' },
  ];

  const boolFields: { key: keyof PetFormData; label: string }[] = [
    { key: 'isVaccinated', label: '已接种疫苗' },
    { key: 'isNeutered', label: '已绝育' },
    { key: 'isHouseTrained', label: '已受室内训练' },
    { key: 'isEnergetic', label: '精力充沛' },
    { key: 'isGoodWithKids', label: '喜欢孩子' },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {error && <div className="bg-red-50 text-red-600 border border-red-100 text-xs p-3 rounded-xl text-center">{error}</div>}

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-bold text-on-surface mb-2">宠物照片</label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant/60 flex items-center justify-center overflow-hidden shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
            ) : (
              <Upload size={24} className="text-on-surface-variant/30" />
            )}
          </div>
          <div className="flex-grow">
            <label className="inline-block bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant font-bold text-xs py-2.5 px-5 rounded-button cursor-pointer transition-all">
              {previewUrl ? '更换图片' : '选择图片'}
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
            <p className="text-[10px] text-on-surface-variant/50 mt-2">
              支持 JPG/PNG/WebP，最大 10MB。图片将上传至 Cloudflare R2 存储。
              {!previewUrl && ' 或直接填写下方图片URL。'}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">名称 *</label>
          <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none" placeholder="宠物名字" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">品种 *</label>
          <input type="text" value={form.breed} onChange={e => handleChange('breed', e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none" placeholder="如: 金毛寻回犬" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">年龄 *</label>
          <input type="text" value={form.age} onChange={e => handleChange('age', e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none" placeholder="如: 2岁" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">性别</label>
          <select value={form.gender} onChange={e => handleChange('gender', e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none cursor-pointer">
            <option value="公">公</option><option value="母">母</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">体重</label>
          <input type="text" value={form.weight} onChange={e => handleChange('weight', e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none" placeholder="如: 15公斤" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">体型</label>
          <select value={form.size} onChange={e => handleChange('size', e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none cursor-pointer">
            <option value="小型">小型</option><option value="中型">中型</option><option value="大型">大型</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">分类</label>
          <div className="flex gap-1">
            {categories.map(c => (
              <button key={c.value} type="button"
                onClick={() => handleChange('category', c.value)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  form.category === c.value ? 'bg-primary text-on-primary shadow-soft' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface mb-1.5">所在地</label>
          <input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none" placeholder="如: 北京朝阳区" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-on-surface mb-1.5">标签（逗号分隔）</label>
        <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none" placeholder="如: 已接种疫苗, 温顺黏人, 喜欢孩子" />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-on-surface mb-1.5">描述（每行一段）</label>
        <textarea rows={3} value={form.description} onChange={e => handleChange('description', e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:border-primary outline-none resize-none" placeholder="描述宠物的性格、习惯、故事..." />
      </div>

      {/* Health/Behavior Toggles */}
      <div>
        <label className="block text-xs font-bold text-on-surface mb-2">健康与特征</label>
        <div className="flex flex-wrap gap-2">
          {boolFields.map(f => (
            <button key={f.key} type="button"
              onClick={() => handleChange(f.key, !form[f.key as keyof PetFormData])}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all border ${
                form[f.key as keyof PetFormData]
                  ? 'bg-secondary-container/30 text-secondary border-secondary/20'
                  : 'bg-surface-container-low text-on-surface-variant/60 border-outline-variant/30 hover:bg-surface-container-high'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-surface-container">
        <button type="button" onClick={onCancel}
          className="flex-1 font-bold text-xs text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high py-3 rounded-xl transition-all">
          取消
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 font-bold text-xs text-on-primary bg-primary hover:bg-opacity-95 py-3 rounded-xl shadow-soft transition-all disabled:opacity-60">
          {saving ? '保存中...' : pet ? '保存修改' : '添加宠物'}
        </button>
      </div>
    </form>
  );
}
