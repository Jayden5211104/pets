/**
 * Vercel Serverless Function 入口
 *
 * 所有 /api/* 请求都会被 Vercel 路由到这里，
 * Express 应用负责处理具体的路由分发。
 *
 * 在 Vercel 上部署时，此文件被自动识别为 Serverless Function。
 */

import app from '../backend/src/index';

export default app;
