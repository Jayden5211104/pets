import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ============================================
// 获取消息列表
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { unread } = req.query;

    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (unread === 'true') {
      query = query.eq('unread', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取消息列表失败:', error);
      return res.status(500).json({ error: '获取消息列表失败' });
    }

    // 格式化返回数据
    const formattedData = data?.map(msg => ({
      ...msg,
      senderName: msg.sender_name,
      senderAvatar: msg.sender_avatar,
      messageText: msg.message_text,
      isShelter: msg.is_shelter
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
// 创建新消息
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const messageData = {
      id: `msg-${Date.now()}`,
      sender_name: req.body.senderName,
      sender_avatar: req.body.senderAvatar,
      message_text: req.body.messageText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      unread: req.body.unread || true,
      is_shelter: req.body.isShelter || false
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('创建消息失败:', error);
      return res.status(400).json({ error: '创建消息失败' });
    }

    res.status(201).json({
      success: true,
      message: '消息创建成功',
      data: {
        ...data,
        senderName: data.sender_name,
        senderAvatar: data.sender_avatar,
        messageText: data.message_text,
        isShelter: data.is_shelter
      }
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================
// 标记消息为已读
// ============================================
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .update({ unread: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新消息状态失败:', error);
      return res.status(400).json({ error: '更新消息状态失败' });
    }

    res.json({
      success: true,
      message: '消息已标记为已读',
      data: {
        ...data,
        senderName: data.sender_name,
        senderAvatar: data.sender_avatar,
        messageText: data.message_text,
        isShelter: data.is_shelter
      }
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;