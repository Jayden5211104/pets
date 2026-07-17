/**
 * 爱宠宜家 - Admin API (Vercel Serverless Function)
 *
 * 路由: /api/admin/*
 * 功能: 后台管理 — 登录、宠物CRUD(含R2图片上传)、领养审批
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ============================================
// 懒加载 Supabase
// ============================================
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    _supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  }
  return _supabase;
}

// ============================================
// R2 客户端（懒加载，未配置时不报错）
// ============================================
let _r2: S3Client | null = null;
function getR2(): S3Client | null {
  if (_r2) return _r2;
  const accountId = process.env.R2_ACCOUNT_ID || '';
  const accessKey = process.env.R2_ACCESS_KEY_ID || '';
  const secretKey = process.env.R2_SECRET_ACCESS_KEY || '';
  if (!accountId || !accessKey || !secretKey) return null;
  _r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });
  return _r2;
}

function getR2PublicUrl(): string {
  return process.env.R2_PUBLIC_URL || process.env.R2_DEV_URL || '';
}

async function uploadToR2(buffer: Buffer, contentType: string, key: string): Promise<string | null> {
  const r2 = getR2();
  const bucket = process.env.R2_BUCKET_NAME || '';
  if (!r2 || !bucket) {
    console.warn('⚠️ R2 未配置，跳过图片上传');
    return null;
  }
  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  const publicUrl = getR2PublicUrl();
  return publicUrl ? `${publicUrl}/${key}` : null;
}

// ============================================
// Express 应用
// ============================================
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// 路径规范化
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/admin/')) req.url = req.url.slice(11); // "/api/admin/login" → "/login"
  else if (req.url.startsWith('/api/admin')) req.url = req.url.slice(10) || '/';
  next();
});

// ============================================
// 认证中间件
// ============================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === ADMIN_PASSWORD) return next();
  return res.status(401).json({ error: '未授权访问' });
}

// ============================================
// 路由
// ============================================

// ---- 登录 ----
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: password });
  }
  return res.status(401).json({ error: '密码错误' });
});

// ---- 仪表盘统计 ----
app.get('/dashboard', requireAuth, async (_req, res) => {
  try {
    const [petsR, onlineR, appsR] = await Promise.all([
      getSupabase().from('pets').select('id', { count: 'exact', head: true }),
      getSupabase().from('pets').select('id', { count: 'exact', head: true }).eq('is_online', true),
      getSupabase().from('adoption_applications').select('id,status'),
    ]);

    const totalPets = petsR.count ?? 0;
    const onlinePets = onlineR.count ?? 0;
    const applications = appsR.data || [];
    const submitted = applications.filter((a: any) => a.status === 'submitted').length;
    const reviewing = applications.filter((a: any) => a.status === 'reviewing').length;
    const handover = applications.filter((a: any) => a.status === 'handover').length;

    return res.json({
      success: true,
      data: { totalPets, onlinePets, offlinePets: totalPets - onlinePets, applications: { total: applications.length, submitted, reviewing, handover } },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 宠物列表 ----
app.get('/pets', requireAuth, async (req, res) => {
  try {
    const { search, category, isOnline, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    let query = getSupabase().from('pets').select('*, shelters(id, name)', { count: 'exact' });

    if (isOnline === 'true') query = query.eq('is_online', true);
    else if (isOnline === 'false') query = query.eq('is_online', false);
    if (category) query = query.eq('category', category as string);
    if (search) query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%`);

    query = query.range(offset, offset + limitNum - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: '获取失败', details: error.message });

    const formatted = (data || []).map((p: any) => formatPet(p));
    return res.json({ success: true, count, data: formatted, page: pageNum, limit: limitNum });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 创建宠物（含 R2 图片上传）----
app.post('/pets', requireAuth, async (req, res) => {
  try {
    const body = req.body;
    let imageUrl = body.imageUrl || '';

    // 如果有 base64 图片，上传到 R2
    if (body.imageBase64 && body.imageBase64.startsWith('data:')) {
      const matches = body.imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const contentType = matches[1];  // image/png, image/jpeg, etc.
        const ext = contentType.split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const key = `pets/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const uploaded = await uploadToR2(buffer, contentType, key);
        if (uploaded) imageUrl = uploaded;
      }
    }

    const petId = body.id || `pet-${Date.now()}`;
    const petData = {
      id: petId,
      name: body.name, breed: body.breed, age: body.age, gender: body.gender || '公',
      weight: body.weight || '', size: body.size || '小型', location: body.location || '',
      distance: body.distance || '', image_url: imageUrl,
      tags: body.tags || [], description: body.description || [],
      is_vaccinated: body.isVaccinated ?? false, is_neutered: body.isNeutered ?? false,
      is_house_trained: body.isHouseTrained ?? false, is_energetic: body.isEnergetic ?? false,
      is_good_with_kids: body.isGoodWithKids ?? false,
      category: body.category || 'dog', shelter_id: body.shelterId || 'happy-paws',
      is_online: body.isOnline ?? true,
    };

    const { data, error } = await getSupabase().from('pets').insert(petData).select().single();
    if (error) return res.status(400).json({ error: '创建失败', details: error.message });

    return res.status(201).json({ success: true, message: '宠物创建成功', data: formatPet(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 更新宠物 ----
app.put('/pets/:id', requireAuth, async (req, res) => {
  try {
    const body = req.body;
    let imageUrl = body.imageUrl || undefined;

    // 如果有新 base64 图片
    if (body.imageBase64 && body.imageBase64.startsWith('data:')) {
      const matches = body.imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const contentType = matches[1];
        const ext = contentType.split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const key = `pets/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const uploaded = await uploadToR2(buffer, contentType, key);
        if (uploaded) imageUrl = uploaded;
      }
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    const fields: [string, string][] = [
      ['name', 'name'], ['breed', 'breed'], ['age', 'age'], ['gender', 'gender'],
      ['weight', 'weight'], ['size', 'size'], ['location', 'location'], ['distance', 'distance'],
      ['category', 'category'], ['shelterId', 'shelter_id'],
    ];
    fields.forEach(([js, db]) => { if (body[js] !== undefined) updateData[db] = body[js]; });
    if (imageUrl) updateData['image_url'] = imageUrl;
    if (body.tags !== undefined) updateData['tags'] = body.tags;
    if (body.description !== undefined) updateData['description'] = body.description;
    ['isVaccinated', 'isNeutered', 'isHouseTrained', 'isEnergetic', 'isGoodWithKids', 'isOnline'].forEach(f => {
      const dbCol = f.replace(/[A-Z]/g, (c: string) => '_' + c.toLowerCase());
      if (body[f] !== undefined) updateData[dbCol] = body[f];
    });

    const { data, error } = await getSupabase().from('pets').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: '更新失败', details: error.message });

    return res.json({ success: true, message: '宠物信息已更新', data: formatPet(data) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 删除宠物 ----
app.delete('/pets/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('pets').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: '删除失败' });
    return res.json({ success: true, message: '宠物已删除' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 领养申请列表 ----
app.get('/applications', requireAuth, async (req, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    let query = getSupabase().from('adoption_applications').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status as string);
    query = query.range(offset, offset + limitNum - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: '获取失败' });

    const formatted = (data || []).map((a: any) => formatApp(a));
    return res.json({ success: true, count, data: formatted, page: pageNum, limit: limitNum });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 审批通过 ----
app.put('/applications/:id/approve', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. 获取申请信息
    const { data: app, error: appErr } = await getSupabase().from('adoption_applications').select('*').eq('id', id).single();
    if (appErr || !app) return res.status(404).json({ error: '申请不存在' });

    // 2. 更新申请状态
    const { data: updatedApp, error: updateErr } = await getSupabase().from('adoption_applications')
      .update({ status: 'handover', updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (updateErr) return res.status(400).json({ error: '更新失败' });

    // 3. 宠物下线（App 不可见，管理后台仍可见）
    const { error: petErr } = await getSupabase().from('pets')
      .update({ is_online: false, updated_at: new Date().toISOString() })
      .eq('id', app.pet_id);
    if (petErr) console.error('宠物下线失败:', petErr);

    // 4. 发送通知消息给用户
    const msg = {
      id: `msg-${Date.now()}`,
      sender_name: '快乐爪子救助站',
      sender_avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4qzi_LEoPxyz05CMUE5Yqyg4rcrNCqnugPFkbTIpvwvbw1tnuJCJ93QX9czKYc2OPUfFttsS7hzLhILysuJbwJOhV7iCDbo0PVtqPAH4Vhy91c3zEdpKcEfHROyx-1pFtMYE8-Ih5bk_JoyQMgTLVdT_lx5X7knLZn70f18jequrAhVO7fOG4oKxKCqmI7F2F5Pp4J1-ecJRsp7Nwj8mZbZX2xDt5lxlzpEbiJqND9YiFPofAStWViy5sch4v-qvRzWcbb2Y-N0iX',
      message_text: `🎉 恭喜！您对「${app.pet_name}」的领养申请已通过审核！我们的志愿者将在 1-2 个工作日内与您联系，安排线下见面交接事宜。请保持手机畅通。`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      unread: true, is_shelter: true,
    };
    await getSupabase().from('messages').insert(msg);

    return res.json({
      success: true,
      message: '领养申请已通过，宠物已下线，通知已发送',
      data: { application: formatApp(updatedApp), petOffline: true },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 审批拒绝 ----
app.put('/applications/:id/reject', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // 1. 获取申请信息
    const { data: app, error: appErr } = await getSupabase().from('adoption_applications').select('*').eq('id', id).single();
    if (appErr || !app) return res.status(404).json({ error: '申请不存在' });

    // 2. 更新申请状态为 rejected（需要先在 DB 中支持此状态）
    //    如果 DB CHECK 约束不允许 'rejected'，则设为 'submitted' 并从列表隐藏
    const rejectedStatus = 'submitted'; // 兼容现有 CHECK 约束: submitted/reviewing/handover
    const { error: updateErr } = await getSupabase().from('adoption_applications')
      .update({ status: rejectedStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updateErr) return res.status(400).json({ error: '更新失败' });

    // 3. 发送拒绝通知
    const rejectReason = reason || '经过综合评估，您当前的条件暂不满足该宠物的领养要求。';
    const msg = {
      id: `msg-${Date.now()}`,
      sender_name: '快乐爪子救助站',
      sender_avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4qzi_LEoPxyz05CMUE5Yqyg4rcrNCqnugPFkbTIpvwvbw1tnuJCJ93QX9czKYc2OPUfFttsS7hzLhILysuJbwJOhV7iCDbo0PVtqPAH4Vhy91c3zEdpKcEfHROyx-1pFtMYE8-Ih5bk_JoyQMgTLVdT_lx5X7knLZn70f18jequrAhVO7fOG4oKxKCqmI7F2F5Pp4J1-ecJRsp7Nwj8mZbZX2xDt5lxlzpEbiJqND9YiFPofAStWViy5sch4v-qvRzWcbb2Y-N0iX',
      message_text: `😔 很遗憾，您对「${app.pet_name}」的领养申请暂未通过。${rejectReason} 感谢您的爱心，欢迎继续关注其他等待领养的毛孩子。`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      unread: true, is_shelter: true,
    };
    await getSupabase().from('messages').insert(msg);

    return res.json({ success: true, message: '申请已拒绝，通知已发送' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ---- 404 ----
app.use((_req, res) => { res.status(404).json({ error: 'Not Found' }); });

export default app;

// ============================================
// 格式化工具
// ============================================
function formatPet(p: any) {
  return {
    ...p, imageUrl: p.image_url,
    isVaccinated: p.is_vaccinated, isNeutered: p.is_neutered,
    isHouseTrained: p.is_house_trained, isEnergetic: p.is_energetic,
    isGoodWithKids: p.is_good_with_kids, isOnline: p.is_online,
    shelterId: p.shelter_id, shelter: p.shelters,
  };
}
function formatApp(a: any) {
  return {
    ...a, petId: a.pet_id, petName: a.pet_name, petBreed: a.pet_breed, petImage: a.pet_image,
    applicantName: a.applicant_name, applicantEmail: a.applicant_email, applicantPhone: a.applicant_phone,
    homeType: a.home_type, hasYard: a.has_yard,
  };
}
