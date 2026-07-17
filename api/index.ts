/**
 * Vercel Serverless Function — 爱宠宜家 API
 *
 * 所有 /api/* 请求被 Vercel rewrite 到此函数。
 * Express 路由处理具体分发。
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// 懒加载 Supabase 客户端（运行时从 Vercel 环境变量读取）
// ============================================
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    _supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabase;
}

// ============================================
// Express 应用
// ============================================
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路径规范化：Vercel rewrite 可能保留原始 /api/* 路径，
// 也可能只传递相对于函数的路径。统一去掉 /api 前缀。
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4); // "/api/pets" → "/pets"
  } else if (req.url.startsWith('/api')) {
    req.url = req.url.slice(4) || '/'; // "/api" → "/"
  }
  next();
});

// ---- 根路径 ----
app.get('/', (_req, res) => {
  res.json({
    message: '🐾 爱宠宜家 API 运行中',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// ---- 宠物 ----
app.get('/pets', async (req, res) => {
  try {
    const { category, size, location, search } = req.query;
    let query = getSupabase().from('pets').select('*, shelters(id, name, location, distance, logo_url)');
    if (category) query = query.eq('category', category as string);
    if (size) query = query.eq('size', size as string);
    if (location) query = query.ilike('location', `%${location}%`);
    if (search) query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: '获取宠物列表失败', details: error.message });

    const formatted = (data || []).map((p: any) => formatPet(p));
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/pets/:id', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('pets').select('*, shelters(id, name, location, distance, logo_url)')
      .eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: '未找到该宠物' });
    return res.json({ success: true, data: formatPet(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 用户 ----
app.post('/users/login', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    let { data: user, error } = await getSupabase().from('users').select('*').eq('email', email).single();

    if (!user || error) {
      const { data: newUser, error: createErr } = await getSupabase()
        .from('users').insert({
          email, name: name || '爱宠达人', phone: phone || '',
          avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          joined_days: 0, favorites: [],
        }).select().single();
      if (createErr) return res.status(400).json({ error: '创建用户失败' });
      user = newUser;
    }
    return res.json({ success: true, message: '登录成功', data: formatUser(user) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('users').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: '用户不存在' });
    return res.json({ success: true, data: formatUser(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.avatarUrl !== undefined) updateData.avatar_url = req.body.avatarUrl;
    if (req.body.joinedDays !== undefined) updateData.joined_days = req.body.joinedDays;

    const { data, error } = await getSupabase().from('users').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: '更新失败' });
    return res.json({ success: true, data: formatUser(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/users/:id/favorites', async (req, res) => {
  try {
    const { petId } = req.body;
    const { data: user, error } = await getSupabase().from('users').select('favorites').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: '用户不存在' });

    const favs: string[] = user.favorites || [];
    const updated = favs.includes(petId) ? favs.filter((f: string) => f !== petId) : [...favs, petId];

    await getSupabase().from('users').update({ favorites: updated, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    return res.json({ success: true, message: favs.includes(petId) ? '已取消收藏' : '已添加收藏', favorites: updated });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 领养申请 ----
app.get('/applications', async (req, res) => {
  try {
    const { status, email } = req.query;
    let query = getSupabase().from('adoption_applications').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status as string);
    if (email) query = query.eq('applicant_email', email as string);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: '获取失败' });

    const formatted = (data || []).map((a: any) => formatApplication(a));
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/applications', async (req, res) => {
  try {
    const appData = {
      id: `app-${Date.now()}`,
      pet_id: req.body.petId, pet_name: req.body.petName, pet_breed: req.body.petBreed, pet_image: req.body.petImage,
      applicant_name: req.body.applicantName, applicant_email: req.body.applicantEmail, applicant_phone: req.body.applicantPhone,
      home_type: req.body.homeType, has_yard: req.body.hasYard, reason: req.body.reason,
      status: 'submitted', date: new Date().toLocaleDateString('zh-CN'),
    };

    const { data, error } = await getSupabase().from('adoption_applications').insert(appData).select().single();
    if (error) return res.status(400).json({ error: '创建失败', details: error.message });

    return res.status(201).json({ success: true, message: '提交成功', data: formatApplication(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.patch('/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await getSupabase().from('adoption_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: '更新失败' });
    return res.json({ success: true, data: formatApplication(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 消息 ----
app.get('/messages', async (req, res) => {
  try {
    let query = getSupabase().from('messages').select('*').order('created_at', { ascending: false });
    if (req.query.unread === 'true') query = query.eq('unread', true);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: '获取失败' });
    const formatted = (data || []).map((m: any) => formatMessage(m));
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/messages', async (req, res) => {
  try {
    const msg = {
      id: `msg-${Date.now()}`,
      sender_name: req.body.senderName, sender_avatar: req.body.senderAvatar,
      message_text: req.body.messageText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      unread: req.body.unread ?? true, is_shelter: req.body.isShelter ?? false,
    };
    const { data, error } = await getSupabase().from('messages').insert(msg).select().single();
    if (error) return res.status(400).json({ error: '发送失败' });
    return res.status(201).json({ success: true, data: formatMessage(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.patch('/messages/:id/read', async (req, res) => {
  try {
    const { error } = await getSupabase().from('messages').update({ unread: false }).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: '更新失败' });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 救助站 ----
app.get('/shelters', async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('shelters').select('*');
    if (error) return res.status(500).json({ error: '获取失败' });
    const formatted = (data || []).map((s: any) => ({ ...s, logoUrl: s.logo_url }));
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 404 ----
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;

// ============================================
// 数据格式化工具
// ============================================
function formatPet(p: any) {
  return { ...p, imageUrl: p.image_url, isVaccinated: p.is_vaccinated, isNeutered: p.is_neutered,
    isHouseTrained: p.is_house_trained, isEnergetic: p.is_energetic, isGoodWithKids: p.is_good_with_kids,
    shelterId: p.shelter_id, shelter: p.shelters };
}
function formatUser(u: any) {
  return { ...u, avatarUrl: u.avatar_url, joinedDays: u.joined_days };
}
function formatApplication(a: any) {
  return { ...a, petId: a.pet_id, petName: a.pet_name, petBreed: a.pet_breed, petImage: a.pet_image,
    applicantName: a.applicant_name, applicantEmail: a.applicant_email, applicantPhone: a.applicant_phone,
    homeType: a.home_type, hasYard: a.has_yard };
}
function formatMessage(m: any) {
  return { ...m, senderName: m.sender_name, senderAvatar: m.sender_avatar, messageText: m.message_text,
    isShelter: m.is_shelter };
}
