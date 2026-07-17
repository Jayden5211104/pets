import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 路由导入
import petRoutes from './routes/pets';
import userRoutes from './routes/users';
import applicationRoutes from './routes/applications';
import messageRoutes from './routes/messages';
import shelterRoutes from './routes/shelters';

// 加载环境变量
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============================================
// 中间件配置
// ============================================
app.use(helmet()); // 安全头设置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev')); // 日志
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码

// ============================================
// 路由配置
// ============================================
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🐾 爱宠宜家 API 服务运行中',
    version: '1.0.0',
    endpoints: {
      pets: '/api/pets',
      users: '/api/users',
      applications: '/api/applications',
      messages: '/api/messages',
      shelters: '/api/shelters'
    }
  });
});

// API路由
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/shelters', shelterRoutes);

// ============================================
// 错误处理中间件
// ============================================
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.method} ${req.path} 不存在`
  });
});

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, () => {
  console.log(`\n🐕 爱宠宜家后端服务已启动！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}\n`);
});

export default app;