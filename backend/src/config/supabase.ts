import dotenv from 'dotenv';
import path from 'path';

// 确保环境变量在模块加载时就被读取
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置！请检查.env文件中的SUPABASE_URL和SUPABASE_ANON_KEY');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 测试连接
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('pets').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase数据库连接失败:', error);
    return false;
  }
}