# 🐾 爱宠宜家 (AiChongYiJia)

一个温馨的全栈宠物领养平台 — 连接等待领养的毛孩子与充满爱心的家庭。

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19 + TypeScript + Vite + Tailwind CSS |
| **后端** | Express.js + TypeScript |
| **数据库** | Supabase (PostgreSQL) |
| **图标** | Lucide React |

## 项目结构

```
aichongyijia/
├── src/                    # 前端 React 源码
│   ├── components/         # UI 组件
│   │   ├── LoginView.tsx       # 登录页
│   │   ├── HomeView.tsx        # 首页（定位、分类、精选宠物）
│   │   ├── SearchView.tsx      # 搜索筛选页
│   │   ├── MessagesView.tsx    # 消息对话页（含领养进度）
│   │   ├── ProfileView.tsx     # 个人中心（收藏、设置）
│   │   ├── PetDetailsView.tsx  # 宠物详情页
│   │   └── AdoptionFormView.tsx # 多步骤领养申请表
│   ├── services/
│   │   └── api.ts          # 后端 API 调用层
│   ├── data/               # 静态数据（区域、初始宠物）
│   ├── types.ts            # TypeScript 类型定义
│   ├── App.tsx             # 主应用（路由、状态管理）
│   └── main.tsx            # 入口
├── backend/                # 后端 Express API
│   └── src/
│       ├── index.ts        # 服务器入口
│       ├── config/
│       │   └── supabase.ts # Supabase 客户端配置
│       ├── routes/         # API 路由
│       │   ├── pets.ts         # 宠物 CRUD
│       │   ├── users.ts        # 用户登录/注册/收藏
│       │   ├── applications.ts # 领养申请 CRUD
│       │   ├── messages.ts     # 消息收发
│       │   └── shelters.ts     # 救助站 CRUD
│       └── scripts/
│           └── seed.ts     # 数据库种子脚本
├── database/
│   └── schema.sql          # 完整数据库表结构 + RLS 策略
└── .env.example            # 前端环境变量模板
```

## 快速启动

### 1. Supabase 数据库配置

1. 前往 [supabase.com](https://supabase.com) 创建项目
2. 在 **Settings > API** 中复制 `Project URL` 和 `anon public key`
3. 在 **SQL Editor** 中运行 `database/schema.sql` 创建表结构
4. 配置 `backend/.env`（参考 `backend/.env.example`）：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 2. 安装依赖

```bash
# 前端依赖
npm install

# 后端依赖
cd backend && npm install && cd ..
```

### 3. 初始化数据库

```bash
cd backend
npm run seed
cd ..
```

### 4. 启动服务

打开两个终端：

```bash
# 终端 1: 启动后端 (端口 3001)
cd backend
npm run dev

# 终端 2: 启动前端 (端口 3000)
npm run dev
```

访问 `http://localhost:3000` 即可使用应用。

## 运行模式

### 🟢 在线模式（后端可用）
- 数据从 Supabase 加载和同步
- 用户、收藏、申请、消息全部持久化到云端
- 页面顶部显示绿色连接状态指示器

### 🟡 离线模式（后端不可用）
- 自动降级为 `localStorage` 本地存储
- 应用功能完全正常，数据保存在浏览器中
- 页面顶部显示琥珀色离线状态指示器
- 启动后端后自动同步

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/pets` | 获取宠物列表（支持筛选） |
| GET | `/api/pets/:id` | 获取宠物详情 |
| POST | `/api/users/login` | 用户登录/注册 |
| GET | `/api/users/:id` | 获取用户信息 |
| PUT | `/api/users/:id` | 更新用户信息 |
| POST | `/api/users/:id/favorites` | 切换收藏 |
| GET | `/api/applications` | 获取领养申请列表 |
| POST | `/api/applications` | 创建领养申请 |
| PATCH | `/api/applications/:id/status` | 更新申请状态 |
| GET | `/api/messages` | 获取消息列表 |
| POST | `/api/messages` | 发送消息 |
| PATCH | `/api/messages/:id/read` | 标记消息已读 |
| GET | `/api/shelters` | 获取救助站列表 |

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户账户信息 |
| `shelters` | 救助站信息 |
| `pets` | 宠物信息档案 |
| `adoption_applications` | 领养申请表 |
| `messages` | 站内消息 |
| `chat_messages` | 聊天记录 |
| `user_favorites` | 用户收藏关系 |
