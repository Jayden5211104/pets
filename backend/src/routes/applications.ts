import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ============================================
// 获取所有领养申请
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, email } = req.query;

    let query = supabase
      .from('adoption_applications')
      .select('*')
      .order('created_at', { ascending: false });

    // 应用筛选
    if (status) {
      query = query.eq('status', status as string);
    }
    if (email) {
      query = query.eq('applicant_email', email as string);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取领养申请失败:', error);
      return res.status(500).json({ error: '获取领养申请失败' });
    }

    // 格式化返回数据
    const formattedData = data?.map(app => ({
      ...app,
      petId: app.pet_id,
      petName: app.pet_name,
      petBreed: app.pet_breed,
      petImage: app.pet_image,
      applicantName: app.applicant_name,
      applicantEmail: app.applicant_email,
      applicantPhone: app.applicant_phone,
      homeType: app.home_type,
      hasYard: app.has_yard
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
// 获取单个领养申请详情
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('adoption_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取申请详情失败:', error);
      return res.status(404).json({ error: '未找到该申请' });
    }

    const formattedData = {
      ...data,
      petId: data.pet_id,
      petName: data.pet_name,
      petBreed: data.pet_breed,
      petImage: data.pet_image,
      applicantName: data.applicant_name,
      applicantEmail: data.applicant_email,
      applicantPhone: data.applicant_phone,
      homeType: data.home_type,
      hasYard: data.has_yard
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
// 创建领养申请
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const applicationData = {
      id: `app-${Date.now()}`,
      pet_id: req.body.petId,
      pet_name: req.body.petName,
      pet_breed: req.body.petBreed,
      pet_image: req.body.petImage,
      applicant_name: req.body.applicantName,
      applicant_email: req.body.applicantEmail,
      applicant_phone: req.body.applicantPhone,
      home_type: req.body.homeType,
      has_yard: req.body.hasYard,
      reason: req.body.reason,
      status: 'submitted',
      date: new Date().toLocaleDateString('zh-CN')
    };

    const { data, error } = await supabase
      .from('adoption_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) {
      console.error('创建领养申请失败:', error);
      return res.status(400).json({ error: '创建领养申请失败', details: error.message });
    }

    res.status(201).json({
      success: true,
      message: '领养申请提交成功',
      data: {
        ...data,
        petId: data.pet_id,
        petName: data.pet_name,
        petBreed: data.pet_breed,
        petImage: data.pet_image,
        applicantName: data.applicant_name,
        applicantEmail: data.applicant_email,
        applicantPhone: data.applicant_phone,
        homeType: data.home_type,
        hasYard: data.has_yard
      }
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 更新领养申请状态
// ============================================
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['submitted', 'reviewing', 'handover'].includes(status)) {
      return res.status(400).json({ error: '无效的申请状态' });
    }

    const { data, error } = await supabase
      .from('adoption_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新申请状态失败:', error);
      return res.status(400).json({ error: '更新申请状态失败' });
    }

    res.json({
      success: true,
      message: '申请状态更新成功',
      data: {
        ...data,
        petId: data.pet_id,
        petName: data.pet_name,
        petBreed: data.pet_breed,
        petImage: data.pet_image,
        applicantName: data.applicant_name,
        applicantEmail: data.applicant_email,
        applicantPhone: data.applicant_phone,
        homeType: data.home_type,
        hasYard: data.has_yard
      }
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;