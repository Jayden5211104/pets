-- 爱宠宜家数据库表结构
-- Supabase PostgreSQL 数据库

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  joined_days INTEGER DEFAULT 0,
  favorites TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户索引
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 救助站表
-- ============================================
CREATE TABLE shelters (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  distance VARCHAR(50),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 宠物表
-- ============================================
CREATE TABLE pets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100) NOT NULL,
  age VARCHAR(50) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('公', '母')),
  weight VARCHAR(20),
  size VARCHAR(20) CHECK (size IN ('小型', '中型', '大型')),
  location VARCHAR(200),
  distance VARCHAR(50),
  image_url TEXT,
  tags TEXT[],
  description TEXT[],
  is_vaccinated BOOLEAN DEFAULT FALSE,
  is_neutered BOOLEAN DEFAULT FALSE,
  is_house_trained BOOLEAN DEFAULT FALSE,
  is_energetic BOOLEAN DEFAULT FALSE,
  is_good_with_kids BOOLEAN DEFAULT FALSE,
  category VARCHAR(20) CHECK (category IN ('dog', 'cat', 'bird', 'hamster')),
  shelter_id VARCHAR(50) REFERENCES shelters(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 宠物索引
CREATE INDEX idx_pets_category ON pets(category);
CREATE INDEX idx_pets_shelter ON pets(shelter_id);
CREATE INDEX idx_pets_size ON pets(size);
CREATE INDEX idx_pets_location ON pets(location);

-- ============================================
-- 领养申请表
-- ============================================
CREATE TABLE adoption_applications (
  id VARCHAR(50) PRIMARY KEY,
  pet_id VARCHAR(50) REFERENCES pets(id) ON DELETE CASCADE,
  pet_name VARCHAR(100),
  pet_breed VARCHAR(100),
  pet_image TEXT,
  applicant_name VARCHAR(100) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(20) NOT NULL,
  home_type VARCHAR(20) CHECK (home_type IN ('apartment', 'house')),
  has_yard BOOLEAN DEFAULT FALSE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'handover')),
  date VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 领养申请索引
CREATE INDEX idx_applications_pet ON adoption_applications(pet_id);
CREATE INDEX idx_applications_status ON adoption_applications(status);
CREATE INDEX idx_applications_email ON adoption_applications(applicant_email);

-- ============================================
-- 消息表
-- ============================================
CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY,
  sender_name VARCHAR(200) NOT NULL,
  sender_avatar TEXT,
  message_text TEXT NOT NULL,
  time VARCHAR(50),
  unread BOOLEAN DEFAULT FALSE,
  is_shelter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 消息索引
CREATE INDEX idx_messages_unread ON messages(unread);

-- ============================================
-- 聊天记录表
-- ============================================
CREATE TABLE chat_messages (
  id VARCHAR(50) PRIMARY KEY,
  message_id VARCHAR(50) REFERENCES messages(id) ON DELETE CASCADE,
  sender_name VARCHAR(200) NOT NULL,
  sender_avatar TEXT,
  message_text TEXT NOT NULL,
  time VARCHAR(50),
  is_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天记录索引
CREATE INDEX idx_chat_messages_message ON chat_messages(message_id);

-- ============================================
-- 用户收藏关系表（用于多对多关系）
-- ============================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pet_id VARCHAR(50) REFERENCES pets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

-- 用户收藏索引
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_pet ON user_favorites(pet_id);

-- ============================================
-- 自动更新 updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shelters_updated_at BEFORE UPDATE ON shelters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON adoption_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 初始数据插入（救助站）
-- ============================================
INSERT INTO shelters (id, name, location, distance, logo_url) VALUES
('happy-paws', '快乐爪子救助站', '德克萨斯州休斯顿 / 北京市朝阳区', '距您12英里 / 2.5km', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4qzi_LEoPxyz05CMUE5Yqyg4rcrNCqnugPFkbTIpvwvbw1tnuJCJ93QX9czKYc2OPUfFttsS7hzLhILysuJbwJOhV7iCDbo0PVtqPAH4Vhy91c3zEdpKcEfHROyx-1pFtMYE8-Ih5bk_JoyQMgTLVdT_lx5X7knLZn70f18jequrAhVO7fOG4oKxKCqmI7F2F5Pp4J1-ecJRsp7Nwj8mZbZX2xDt5lxlzpEbiJqND9YiFPofAStWViy5sch4v-qvRzWcbb2Y-N0iX');

-- ============================================
-- 初始数据插入（宠物）
-- ============================================
INSERT INTO pets (id, name, breed, age, gender, weight, size, location, distance, image_url, tags, description, is_vaccinated, is_neutered, is_house_trained, is_energetic, is_good_with_kids, category, shelter_id) VALUES
('luna-bc', '露娜', '边境牧羊犬混血', '2岁', '母', '15公斤', '中型', '德克萨斯州休斯顿', '距您12英里', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL0PaGA9O0PrEbacb6pEAfs-O33xvBz98vkspyTBCQ7GpCjrUTn3DTQo3IGfWqPEGvjg2yWrEpe_z_jBkKQIhOjziJvgr-PWKyQTCCiFU-0OX8pRo5n-0o8iIAK4RLfs6Y-7vGY8d2Zmz8bg3YbUyT2eB8EyCKQxrxQ6H_8_FTFcKTxEFGqs33IjSsRwGgjg8wnmLBk9zct6gYoqW4TvpQCGqrA71FrX2Dn3iPxDIm47nnTvvQBYAEbaoBwXfV3cmjIG0wcVL1B9IO', 
 ARRAY['已接种疫苗', '已绝育', '已受室内训练', '精力充沛', '喜欢孩子'], 
 ARRAY['露娜是一只聪明、充满活力的甜心，正在寻找一个热爱运动的家庭。她的前任主人意识到无法适应她的工作犬天性后，她来到了我们的救助中心。', '她擅长敏捷训练，喜欢接飞盘，而且对孩子非常温柔。露娜需要一个带院子的家，以及喜欢每天跑步或长途徒步的主人。她已经完全接受了室内训练，并懂得坐下、停留和握手等基本指令。'], 
 true, true, true, true, true, 'dog', 'happy-paws'),

('bubu', '布布', '金毛寻回犬', '3个月', '公', '6公斤', '小型', '北京海淀区', '2.5km', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK-8oTzin0sivfBHZYPUCN6v3E1ysYGDzsFoMWL0NdM7P5gKCegtk3HfyKY6KJMpWHTmdEXs90PLLBWmuOolfpzorNgsSHjekctCHOPAcxNGffiDmSxTeIhg0vu8fqnCXJge-xdKHlp9hmqh1iJzndH4mc6bgM8idTrIDKh4o-boiSYEqdBubt5xOyQnAoZsTkObHST4WGiQ2Qnf_YHmUE_R2iFrz-LfhIZG00vvmflBdHo6iqbp-ewFGFp9Ct6OoSTRDmlhlcM46', 
 ARRAY['已接种疫苗', '未绝育', '正在室内训练', '精力充沛', '极其亲人'], 
 ARRAY['布布是一个超级粘人的金毛小家伙！它对世界充满好奇，对任何人都百分之百的热情友好。', '它总是摇着尾巴跟在你身后，特别喜欢和人互动，玩巡回游戏，非常适合家庭抚养。目前正在志愿者帮助下接受定点排便训练。'], 
 true, false, false, true, true, 'dog', 'happy-paws'),

('xueqiu', '雪球', '波斯猫', '1岁', '母', '4公斤', '小型', '北京朝阳区', '1.8km', 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?auto=format&fit=crop&w=600&q=80', 
 ARRAY['已接种疫苗', '已绝育', '已受室内训练', '温顺黏人'], 
 ARRAY['雪球是一只纯白色的波斯猫，毛发蓬松柔软，眼睛像蓝宝石一样美丽闪亮。', '它性格非常安静优雅，喜欢在温暖的阳光下打盹、玩羽毛逗猫棒，或者安静地趴在你的大腿上。它期待一个温馨、轻声细语的家庭。'], 
 true, true, true, false, true, 'cat', 'happy-paws'),

('charlie', '查理', '比格犬', '2岁', '公', '11公斤', '中型', '北京东城区', '3.1km', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80', 
 ARRAY['已接种疫苗', '已绝育', '已受室内训练', '精力充沛', '嗅觉灵敏'], 
 ARRAY['查理是一只聪明又有些贪吃的经典比格犬，标志性的宽大耳朵走起路来一摇一摆，特别滑稽可爱。', '它对气味十分敏锐，非常喜欢户外探索和玩追逐游戏，它性格开朗，需要每天有充足的户外活动时间和高品质的散步陪伴。'], 
 true, true, true, true, true, 'dog', 'happy-paws');

-- ============================================
-- 行级安全策略（Row Level Security）
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 公开读取宠物信息
CREATE POLICY "Pets are viewable by everyone" ON pets
  FOR SELECT USING (true);

-- 公开读取救助站信息
CREATE POLICY "Shelters are viewable by everyone" ON shelters
  FOR SELECT USING (true);

-- 用户只能更新自己的数据
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 用户可以查看自己的领养申请
CREATE POLICY "Users can view own applications" ON adoption_applications
  FOR SELECT USING (true);

-- 公开创建领养申请
CREATE POLICY "Anyone can create applications" ON adoption_applications
  FOR INSERT WITH CHECK (true);

-- 公开查看消息
CREATE POLICY "Messages are viewable by everyone" ON messages
  FOR SELECT USING (true);