-- 迁移: 为 pets 表添加 is_online 字段
-- 用途: 后台管理审批通过后宠物在App中下线，但管理后台仍可见
-- 执行方式: 在 Supabase SQL Editor 中运行

ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT TRUE;

-- 所有现有宠物默认在线
UPDATE pets SET is_online = TRUE WHERE is_online IS NULL;
