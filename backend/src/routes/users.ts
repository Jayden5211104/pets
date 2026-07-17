import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ============================================
// 获取用户信息
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取用户信息失败:', error);
      return res.status(404).json({ error: '用户不存在' });
    }

    // 格式化返回数据
    const formattedData = {
      ...data,
      avatarUrl: data.avatar_url,
      joinedDays: data.joined_days
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
// 用户登录/注册
// ============================================
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, name, phone } = req.body;

    // 查找用户
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // 如果用户不存在，创建新用户
    if (!user || error) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          name: name || '爱宠达人',
          phone: phone || '',
          avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          joined_days: 0,
          favorites: []
        })
        .select()
        .single();

      if (createError) {
        console.error('创建用户失败:', createError);
        return res.status(400).json({ error: '创建用户失败' });
      }

      user = newUser;
    }

    // 格式化返回数据
    const formattedUser = {
      ...user,
      avatarUrl: user.avatar_url,
      joinedDays: user.joined_days
    };

    res.json({
      success: true,
      message: user ? '登录成功' : '注册成功',
      data: formattedUser
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 更新用户信息
// ============================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      avatar_url: req.body.avatarUrl,
      joined_days: req.body.joinedDays,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新用户信息失败:', error);
      return res.status(400).json({ error: '更新用户信息失败' });
    }

    const formattedData = {
      ...data,
      avatarUrl: data.avatar_url,
      joinedDays: data.joined_days
    };

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: formattedData
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 添加/移除收藏
// ============================================
router.post('/:id/favorites', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { petId } = req.body;

    // 获取当前用户收藏列表
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('favorites')
      .eq('id', id)
      .single();

    if (getUserError) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const currentFavorites: string[] = user.favorites || [];
    const alreadyFavorited = currentFavorites.includes(petId);

    let updatedFavorites: string[];
    if (alreadyFavorited) {
      // 移除收藏
      updatedFavorites = currentFavorites.filter(fid => fid !== petId);
    } else {
      // 添加收藏
      updatedFavorites = [...currentFavorites, petId];
    }

    // 更新数据库
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        favorites: updatedFavorites,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('更新收藏失败:', updateError);
      return res.status(400).json({ error: '更新收藏失败' });
    }

    res.json({
      success: true,
      message: alreadyFavorited ? '已取消收藏' : '已添加收藏',
      favorites: updatedFavorites
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 获取用户收藏列表
// ============================================
router.get('/:id/favorites', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 获取用户收藏的宠物ID列表
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('favorites')
      .eq('id', id)
      .single();

    if (userError) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const favorites: string[] = user.favorites || [];

    if (favorites.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    // 获取收藏的宠物详情
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .in('id', favorites);

    if (petsError) {
      console.error('获取收藏宠物失败:', petsError);
      return res.status(500).json({ error: '获取收藏宠物失败' });
    }

    // 格式化返回数据
    const formattedPets = pets?.map(pet => ({
      ...pet,
      imageUrl: pet.image_url,
      isVaccinated: pet.is_vaccinated,
      isNeutered: pet.is_neutered,
      isHouseTrained: pet.is_house_trained,
      isEnergetic: pet.is_energetic,
      isGoodWithKids: pet.is_good_with_kids,
      shelterId: pet.shelter_id
    })) || [];

    res.json({
      success: true,
      count: formattedPets.length,
      data: formattedPets
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;