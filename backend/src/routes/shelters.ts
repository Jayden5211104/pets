import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ============================================
// 获取所有救助站列表
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取救助站列表失败:', error);
      return res.status(500).json({ error: '获取救助站列表失败' });
    }

    // 格式化返回数据以匹配前端类型
    const formattedData = data?.map(shelter => ({
      ...shelter,
      logoUrl: shelter.logo_url
    })) || [];

    res.json({
      success: true,
      count: formattedData.length,
      data: formattedData
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 获取单个救助站详情
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取救助站详情失败:', error);
      return res.status(404).json({ error: '未找到该救助站' });
    }

    const formattedData = {
      ...data,
      logoUrl: data.logo_url
    };

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 创建新救助站（管理员功能）
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const shelterData = {
      id: req.body.id,
      name: req.body.name,
      location: req.body.location || '',
      distance: req.body.distance || '',
      logo_url: req.body.logoUrl || ''
    };

    if (!shelterData.id || !shelterData.name) {
      return res.status(400).json({ error: '救助站ID和名称为必填项' });
    }

    const { data, error } = await supabase
      .from('shelters')
      .insert(shelterData)
      .select()
      .single();

    if (error) {
      console.error('创建救助站失败:', error);
      return res.status(400).json({ error: '创建救助站失败', details: error.message });
    }

    res.status(201).json({
      success: true,
      message: '救助站创建成功',
      data: {
        ...data,
        logoUrl: data.logo_url
      }
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 更新救助站信息（管理员功能）
// ============================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.distance !== undefined) updateData.distance = req.body.distance;
    if (req.body.logoUrl !== undefined) updateData.logo_url = req.body.logoUrl;

    const { data, error } = await supabase
      .from('shelters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新救助站失败:', error);
      return res.status(400).json({ error: '更新救助站失败' });
    }

    res.json({
      success: true,
      message: '救助站信息更新成功',
      data: {
        ...data,
        logoUrl: data.logo_url
      }
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 删除救助站（管理员功能）
// ============================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('shelters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除救助站失败:', error);
      return res.status(400).json({ error: '删除救助站失败' });
    }

    res.json({
      success: true,
      message: '救助站已删除'
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
