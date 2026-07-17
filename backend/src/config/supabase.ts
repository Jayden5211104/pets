import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// 在非 Vercel 环境下从 .env 文件加载
// Vercel 会自动注入环境变量，无需 .env 文件
if (process.env.VERCEL !== '1') {
  // 尝试多种路径解析方式，兼容 ESM 和 CJS
  const envPath = path.resolve(process.cwd(), 'backend/.env');
  dotenv.config({ path: envPath });
}

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置！请检查环境变量 SUPABASE_URL 和 SUPABASE_ANON_KEY');
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
