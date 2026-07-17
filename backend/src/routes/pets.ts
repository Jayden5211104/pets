import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ============================================
// 获取所有宠物列表（支持筛选）
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, size, location, search } = req.query;

    let query = supabase
      .from('pets')
      .select(`
        *,
        shelters (
          id,
          name,
          location,
          distance,
          logo_url
        )
      `);

    // 应用筛选条件
    if (category) {
      query = query.eq('category', category as string);
    }
    if (size) {
      query = query.eq('size', size as string);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取宠物列表失败:', error);
      return res.status(500).json({ error: '获取宠物列表失败' });
    }

    // 格式化返回数据以匹配前端类型
    const formattedData = data?.map(pet => ({
      ...pet,
      imageUrl: pet.image_url,
      isVaccinated: pet.is_vaccinated,
      isNeutered: pet.is_neutered,
      isHouseTrained: pet.is_house_trained,
      isEnergetic: pet.is_energetic,
      isGoodWithKids: pet.is_good_with_kids,
      shelterId: pet.shelter_id,
      shelter: pet.shelters
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
// 获取单个宠物详情
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        shelters (
          id,
          name,
          location,
          distance,
          logo_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取宠物详情失败:', error);
      return res.status(404).json({ error: '未找到该宠物' });
    }

    // 格式化返回数据
    const formattedData = {
      ...data,
      imageUrl: data.image_url,
      isVaccinated: data.is_vaccinated,
      isNeutered: data.is_neutered,
      isHouseTrained: data.is_house_trained,
      isEnergetic: data.is_energetic,
      isGoodWithKids: data.is_good_with_kids,
      shelterId: data.shelter_id,
      shelter: data.shelters
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
// 创建新宠物（管理员功能）
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const petData = {
      ...req.body,
      id: req.body.id || `pet-${Date.now()}`,
      image_url: req.body.imageUrl,
      is_vaccinated: req.body.isVaccinated || false,
      is_neutered: req.body.isNeutered || false,
      is_house_trained: req.body.isHouseTrained || false,
      is_energetic: req.body.isEnergetic || false,
      is_good_with_kids: req.body.isGoodWithKids || false,
      shelter_id: req.body.shelterId
    };

    const { data, error } = await supabase
      .from('pets')
      .insert(petData)
      .select()
      .single();

    if (error) {
      console.error('创建宠物失败:', error);
      return res.status(400).json({ error: '创建宠物失败', details: error.message });
    }

    res.status(201).json({
      success: true,
      message: '宠物创建成功',
      data
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 更新宠物信息（管理员功能）
// ============================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      image_url: req.body.imageUrl,
      is_vaccinated: req.body.isVaccinated,
      is_neutered: req.body.isNeutered,
      is_house_trained: req.body.isHouseTrained,
      is_energetic: req.body.isEnergetic,
      is_good_with_kids: req.body.isGoodWithKids,
      shelter_id: req.body.shelterId,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新宠物失败:', error);
      return res.status(400).json({ error: '更新宠物失败' });
    }

    res.json({
      success: true,
      message: '宠物信息更新成功',
      data
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 删除宠物（管理员功能）
// ============================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除宠物失败:', error);
      return res.status(400).json({ error: '删除宠物失败' });
    }

    res.json({
      success: true,
      message: '宠物已删除'
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;