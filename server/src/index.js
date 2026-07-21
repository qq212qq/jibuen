import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import apiRoutes from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==================== 初始化数据库 ====================
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 执行建表脚本
const initSQL = fs.readFileSync(path.join(__dirname, '../../database/init.sql'), 'utf-8');
db.exec(initSQL);
console.log('✅ 数据库初始化完成');

export function getDB() {
  return db;
}

// ==================== 启动 Express 服务 ====================
const app = express();

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', apiRoutes);

// 静态文件（生产环境托管前端构建产物）
const distPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 错误处理
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 jibuen 服务已启动: http://localhost:${config.port}`);
  console.log(`📡 API 地址: http://localhost:${config.port}/api`);
});
