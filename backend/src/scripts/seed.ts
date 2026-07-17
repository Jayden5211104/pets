/**
 * 爱宠宜家 - 数据库种子脚本
 *
 * 运行方式: 在 backend 目录下执行 npx tsx src/scripts/seed.ts
 *
 * 此脚本会将初始数据（救助站、宠物）插入到 Supabase 数据库中。
 * 运行前请确保:
 * 1. .env 文件已配置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
 * 2. 已在 Supabase SQL Editor 中运行 database/schema.sql 创建表结构
 */

import dotenv from 'dotenv';
import path from 'path';

// 加载 backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 配置！请在 backend/.env 中设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// 初始数据
// ============================================
const SHELTER_DATA = {
  id: 'happy-paws',
  name: '快乐爪子救助站',
  location: '德克萨斯州休斯顿 / 北京市朝阳区',
  distance: '距您12英里 / 2.5km',
  logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4qzi_LEoPxyz05CMUE5Yqyg4rcrNCqnugPFkbTIpvwvbw1tnuJCJ93QX9czKYc2OPUfFttsS7hzLhILysuJbwJOhV7iCDbo0PVtqPAH4Vhy91c3zEdpKcEfHROyx-1pFtMYE8-Ih5bk_JoyQMgTLVdT_lx5X7knLZn70f18jequrAhVO7fOG4oKxKCqmI7F2F5Pp4J1-ecJRsp7Nwj8mZbZX2xDt5lxlzpEbiJqND9YiFPofAStWViy5sch4v-qvRzWcbb2Y-N0iX',
};

const PETS_DATA = [
  {
    id: 'luna-bc', name: '露娜', breed: '边境牧羊犬混血', age: '2岁', gender: '母',
    weight: '15公斤', size: '中型', location: '德克萨斯州休斯顿', distance: '距您12英里',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL0PaGA9O0PrEbacb6pEAfs-O33xvBz98vkspyTBCQ7GpCjrUTn3DTQo3IGfWqPEGvjg2yWrEpe_z_jBkKQIhOjziJvgr-PWKyQTCCiFU-0OX8pRo5n-0o8iIAK4RLfs6Y-7vGY8d2Zmz8bg3YbUyT2eB8EyCKQxrxQ6H_8_FTFcKTxEFGqs33IjSsRwGgjg8wnmLBk9zct6gYoqW4TvpQCGqrA71FrX2Dn3iPxDIm47nnTvvQBYAEbaoBwXfV3cmjIG0wcVL1B9IO',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '精力充沛', '喜欢孩子'],
    description: ['露娜是一只聪明、充满活力的甜心，正在寻找一个热爱运动的家庭。她的前任主人意识到无法适应她的工作犬天性后，她来到了我们的救助中心。', '她擅长敏捷训练，喜欢接飞盘，而且对孩子非常温柔。露娜需要一个带院子的家，以及喜欢每天跑步或长途徒步的主人。她已经完全接受了室内训练，并懂得坐下、停留和握手等基本指令。'],
    is_vaccinated: true, is_neutered: true, is_house_trained: true, is_energetic: true, is_good_with_kids: true,
    category: 'dog', shelter_id: 'happy-paws',
  },
  {
    id: 'bubu', name: '布布', breed: '金毛寻回犬', age: '3个月', gender: '公',
    weight: '6公斤', size: '小型', location: '北京海淀区', distance: '2.5km',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK-8oTzin0sivfBHZYPUCN6v3E1ysYGDzsFoMWL0NdM7P5gKCegtk3HfyKY6KJMpWHTmdEXs90PLLBWmuOolfpzorNgsSHjekctCHOPAcxNGffiDmSxTeIhg0vu8fqnCXJge-xdKHlp9hmqh1iJzndH4mc6bgM8idTrIDKh4o-boiSYEqdBubt5xOyQnAoZsTkObHST4WGiQ2Qnf_YHmUE_R2iFrz-LfhIZG00vvmflBdHo6iqbp-ewFGFp9Ct6OoSTRDmlhlcM46',
    tags: ['已接种疫苗', '未绝育', '正在室内训练', '精力充沛', '极其亲人'],
    description: ['布布是一个超级粘人的金毛小家伙！它对世界充满好奇，对任何人都百分之百的热情友好。', '它总是摇着尾巴跟在你身后，特别喜欢和人互动，玩巡回游戏，非常适合家庭抚养。目前正在志愿者帮助下接受定点排便训练。'],
    is_vaccinated: true, is_neutered: false, is_house_trained: false, is_energetic: true, is_good_with_kids: true,
    category: 'dog', shelter_id: 'happy-paws',
  },
  {
    id: 'xueqiu', name: '雪球', breed: '波斯猫', age: '1岁', gender: '母',
    weight: '4公斤', size: '小型', location: '北京朝阳区', distance: '1.8km',
    image_url: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?auto=format&fit=crop&w=600&q=80',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '温顺黏人'],
    description: ['雪球是一只纯白色的波斯猫，毛发蓬松柔软，眼睛像蓝宝石一样美丽闪亮。', '它性格非常安静优雅，喜欢在温暖的阳光下打盹、玩羽毛逗猫棒，或者安静地趴在你的大腿上。它期待一个温馨、轻声细语的家庭。'],
    is_vaccinated: true, is_neutered: true, is_house_trained: true, is_energetic: false, is_good_with_kids: true,
    category: 'cat', shelter_id: 'happy-paws',
  },
  {
    id: 'charlie', name: '查理', breed: '比格犬', age: '2岁', gender: '公',
    weight: '11公斤', size: '中型', location: '北京东城区', distance: '3.1km',
    image_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '精力充沛', '嗅觉灵敏'],
    description: ['查理是一只聪明又有些贪吃的经典比格犬，标志性的宽大耳朵走起路来一摇一摆，特别滑稽可爱。', '它对气味十分敏锐，非常喜欢户外探索和玩追逐游戏，它性格开朗，需要每天有充足的户外活动时间和高品质的散步陪伴。'],
    is_vaccinated: true, is_neutered: true, is_house_trained: true, is_energetic: true, is_good_with_kids: true,
    category: 'dog', shelter_id: 'happy-paws',
  },
];

// ============================================
// 执行种子脚本
// ============================================
async function seed() {
  console.log('🌱 开始初始化爱宠宜家数据库...\n');

  // 1. 插入救助站
  console.log('📦 插入救助站数据...');
  const { error: shelterError } = await supabase
    .from('shelters')
    .upsert(SHELTER_DATA, { onConflict: 'id' });

  if (shelterError) {
    console.error('❌ 救助站插入失败:', shelterError.message);
  } else {
    console.log('✅ 救助站数据就绪');
  }

  // 2. 插入宠物
  console.log('🐾 插入宠物数据...');
  for (const pet of PETS_DATA) {
    const { error: petError } = await supabase
      .from('pets')
      .upsert(pet, { onConflict: 'id' });

    if (petError) {
      console.error(`❌ 宠物 ${pet.name} 插入失败:`, petError.message);
    } else {
      console.log(`  ✅ ${pet.name} (${pet.breed})`);
    }
  }

  console.log('\n🎉 数据库初始化完成！');
  console.log('📊 数据统计:');
  console.log(`   - 救助站: 1 个`);
  console.log(`   - 宠物: ${PETS_DATA.length} 只`);
}

seed().catch(console.error);
