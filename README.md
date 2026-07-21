# 🚀 jibuen — 全栈网页项目

> 现代化全栈网页应用，前后端分离架构。

---

## 🛠 技术栈

| 层 | 技术 |
|------|------|
| 前端 | Vite + 原生 HTML/CSS/JS |
| 后端 | Node.js + Express |
| 数据库 | SQLite（开发） |
| 认证 | JWT + bcrypt |

---

## 📁 项目结构

```
jibuen/
├── client/                    # 前端
│   ├── src/
│   │   ├── main.js            # 入口 + 路由
│   │   ├── style.css          # 全局样式
│   │   └── api.js             # API 封装
│   ├── index.html             # HTML 入口
│   └── vite.config.js         # Vite 配置
├── server/                    # 后端
│   └── src/
│       ├── index.js           # 服务入口
│       ├── config/env.js      # 环境配置
│       ├── routes/api.js      # API 路由
│       └── middleware/        # 中间件
└── database/
    └── init.sql               # 建表脚本
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server && npm install
cd ../client && npm install
```

### 2. 启动后端

```bash
cd server && npm run dev
# 运行在 http://localhost:3001
```

### 3. 启动前端

```bash
cd client && npm run dev
# 运行在 http://localhost:5173
```

---

## 👤 作者

**qq212qq**
