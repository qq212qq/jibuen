# jibuen — 软件设计文档（SDD）

> **版本**：V1.0  
> **日期**：2026-07-23  
> **作者**：qq212qq  
> **项目状态**：🧪 试验阶段，功能持续迭代  
> **目标部署**：阿里云 ECS 云服务器

---

## 目录

1. [项目愿景与目标](#1-项目愿景与目标)
2. [系统架构设计](#2-系统架构设计)
3. [项目目录结构](#3-项目目录结构)
4. [前端设计——现状](#4-前端设计现状)
5. [前端设计——未来规划](#5-前端设计未来规划)
6. [后端设计](#6-后端设计)
7. [数据库设计](#7-数据库设计)
8. [API 接口设计](#8-api-接口设计)
9. [安全设计](#9-安全设计)
10. [云服务器部署方案](#10-云服务器部署方案)
11. [技术演进路线图](#11-技术演进路线图)
12. [开发规范](#12-开发规范)
13. [附录](#13-附录)

---

## 1. 项目愿景与目标

### 1.1 项目定位

**jibuen** 是一个带有强烈个人品牌色彩的**全栈个人网站**。它不只是"个人主页"，而是集**知识分享、技术博客、代码笔记、互动交流、AI 对话**于一体的个人数字空间。

最终形态：
```
             ┌─────────────────────────────────┐
             │       jibuen 个人数字空间         │
             │                                 │
             │  🏠 主页    📝 博客    📒 笔记   │
             │  💬 留言    🤖 AI对话  🔗 友链  │
             │  📊 后台    👤 关于    🌙 主题   │
             │                                 │
             │  "探索 · 创造 · 分享"            │
             └─────────────────────────────────┘
```

### 1.2 核心目标

| 目标 | 描述 | 状态 |
|------|------|------|
| 个人品牌展示 | 英雄区、技能、项目、联系方式 | ✅ 已有基础 |
| 代码知识库 | Python/JS 对比笔记、可搜索/收藏 | ✅ 已有基础 |
| 算法竞赛笔记 | C++ STL 详解，面向竞赛选手 | ✅ 已有基础，可继续扩展 |
| 用户系统 | 注册/登录/JWT 认证 | 🔶 后端已有，前端待接入 |
| 技术博客 | 文章发布/列表/详情 | 🔶 后端 API 已有，前端待开发 |
| 访客留言 | 留言板提交与展示 | 🔶 后端 API 已有，前端待开发 |
| AI 对话 | 接入大模型 API，智能问答 | ⬜ 规划中 |
| 后台管理 | 笔记/文章/留言的后台管理界面 | ⬜ 规划中 |
| 云部署 | 阿里云 ECS + Nginx + 域名 | ⬜ 规划中 |
| 评论系统 | 文章评论/回复 | ⬜ 规划中 |

### 1.3 设计原则

1. **渐进增强**：核心内容不依赖 JS 也能访问，交互层由 JS 增强
2. **单文件自包含**：每个 HTML 页面独立可用，不依赖构建工具
3. **前后端分离**：前端 HTML 通过 fetch 调用 API，两者独立开发部署
4. **移动端优先**：所有页面适配手机/平板/桌面三种尺寸
5. **可扩展性**：规划阶段为未来功能预留接口和数据结构
6. **个人化体验**：深色/浅色主题、自定义布局、个性化推荐

---

## 2. 系统架构设计

### 2.1 总体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                            │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │index.html│ │login.html│ │notes.html│ │cxx-notes.html│  │
│  │ 主页      │ │ 登录     │ │ 代码笔记 │ │ C++ STL      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │blog.html │ │chat.html │ │admin.html│ │messages.html │  │
│  │ 博客     │ │ AI对话   │ │ 后台管理 │ │ 留言板       │  │
│  │  ⬜ 待建 │ │  ⬜ 待建 │ │  ⬜ 待建 │ │  ⬜ 待建    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP REST API (JSON)
                          │ WebSocket (AI 对话流式响应)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx 反向代理 (:80/:443)                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ 静态文件托管     │  │ API 代理 → Express              │  │
│  │ *.html, *.css,  │  │ /api/* → http://localhost:3001  │  │
│  │ *.js, 图片等    │  │ /ws/*  → WebSocket              │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express 后端 (:3001)                        │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ 认证模块 │ │ 文章模块 │ │ 留言模块 │ │ AI 对话模块  │  │
│  │ JWT+     │ │ CRUD +   │ │ 提交+    │ │ LLM API     │  │
│  │ bcrypt   │ │ 分页     │ │ 展示     │ │ 代理 ⬜     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ 笔记模块 │ │ 评论模块 │ │ 文件上传 │ │ 中间件       │  │
│  │ CRUD ⬜  │ │ CRUD ⬜  │ │   ⬜     │ │ auth/error/  │  │
│  │          │ │          │ │          │ │ logger       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  SQLite 数据库 (data.db)                     │
│                                                             │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ users  │ │ posts  │ │ messages │ │ notes      ⬜    │  │
│  └────────┘ └────────┘ └──────────┘ └──────────────────┘  │
│  ┌────────────┐ ┌──────────┐ ┌──────────────────────────┐  │
│  │ comments ⬜│ │ tags  ⬜ │ │ chat_history        ⬜   │  │
│  └────────────┘ └──────────┘ └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

> ⬜ = 规划中，尚未实现

### 2.2 技术栈明细

| 层级 | 技术选型 | 版本 | 选型理由 |
|------|----------|------|----------|
| 前端语言 | HTML5 + CSS3 + ES6+ JavaScript | — | 零依赖，直接运行 |
| 代码高亮 | highlight.js | 11.9.0 | 轻量，支持 190+ 语言 |
| 图标 | Font Awesome | 6.4.0 | 免费 CDN，图标丰富 |
| 后端框架 | Express | 4.19.x | 生态成熟，中文资料多 |
| 数据库 | SQLite（better-sqlite3） | 11.1.x | 零配置，单文件存储 |
| 认证 | jsonwebtoken + bcryptjs | 9.0.x / 2.4.x | 行业标准 |
| 反向代理 | Nginx | 最新稳定版 | 高性能，阿里云标配 |
| 云服务 | 阿里云 ECS | — | 国内访问快，学生优惠 |
| 域名 | 待定（.com / .cn） | — | 配合个人品牌 |
| HTTPS | Let's Encrypt / 阿里云 SSL | — | 免费证书 |
| AI 对话 | OpenAI API / 通义千问 API | — | 待评估成本 |

### 2.3 为什么选 SQLite 而非 MySQL

| 对比维度 | SQLite | MySQL |
|----------|--------|-------|
| 安装维护 | 零配置 | 需安装服务 |
| 并发能力 | 读并发好，写串行 | 高并发读写 |
| 适合场景 | 个人站点（日 PV < 10万） | 多用户高并发 |
| 备份 | 复制文件即可 | 需 mysqldump |
| 迁移成本 | 极低 | 中等 |

> **结论**：个人网站在可预见的未来不会超过 SQLite 的承载上限。如果未来流量增长，可通过更换驱动（`better-sqlite3` → `mysql2`）平滑迁移到 MySQL，SQL 语法基本兼容。

---

## 3. 项目目录结构

```
jibuen/
│
├── 📄 index.html               # 个人主页（英雄区 + 关于 + 技能 + 项目 + 联系）
├── 📄 login.html               # 登录/注册页（晨雾山脉背景 + 毛玻璃卡片）
├── 📄 notes.html               # 代码笔记知识库（Python/JS 对比，搜索/筛选/收藏）
├── 📄 cxx-notes.html           # C++ STL 算法竞赛笔记（梵高星空主题）
│
├── 📄 blog.html                # ⬜ 技术博客列表页
├── 📄 blog-detail.html         # ⬜ 博客详情页
├── 📄 messages.html            # ⬜ 留言板独立页面
├── 📄 chat.html                # ⬜ AI 对话页面
├── 📄 admin.html               # ⬜ 后台管理页面
├── 📄 about.html               # ⬜ 关于页面（独立版）
│
├── 📄 README.md                # 项目说明
├── 📄 SDD_软件设计文档.md       # 本文件
├── 📄 TODO.md                  # ⬜ 待办清单
│
├── 📁 server/                  # 后端服务
│   ├── package.json
│   ├── .env                    # 环境变量（不提交到 Git）
│   ├── .env.example            # 环境变量示例
│   └── src/
│       ├── index.js            # 服务入口 + 数据库初始化
│       ├── config/
│       │   └── env.js          # 环境配置读取
│       ├── routes/
│       │   ├── api.js          # 当前 API（认证/文章/留言）
│       │   ├── auth.js         # ⬜ 认证路由（拆分）
│       │   ├── posts.js        # ⬜ 文章路由（拆分）
│       │   ├── messages.js     # ⬜ 留言路由（拆分）
│       │   ├── notes.js        # ⬜ 笔记路由
│       │   ├── comments.js     # ⬜ 评论路由
│       │   ├── chat.js         # ⬜ AI 对话路由
│       │   └── upload.js       # ⬜ 文件上传路由
│       └── middleware/
│           ├── auth.js         # JWT 认证中间件
│           ├── errorHandler.js # 全局错误处理
│           └── logger.js       # ⬜ 请求日志中间件
│
├── 📁 database/
│   ├── init.sql                # 建表脚本
│   └── seed.sql                # ⬜ 测试数据填充脚本
│
├── 📁 client/                  # ⚠️ 已废弃的 Vite 脚手架，待清理
│
├── 📁 deploy/                  # ⬜ 部署相关
│   ├── nginx.conf              # Nginx 配置文件
│   ├── jibuen.service          # systemd 服务文件
│   └── deploy.sh               # 一键部署脚本
│
└── 📁 assets/                  # ⬜ 静态资源
    ├── images/                  # 图片
    ├── fonts/                   # 字体
    └── favicon.svg              # 网站图标
```

---

## 4. 前端设计——现状

### 4.1 index.html — 个人主页

| 属性 | 值 |
|------|-----|
| 文件大小 | ~484 行 |
| 主题风格 | 亮色，白底 + 蓝色点缀（`#4A90D9`） |
| 外部依赖 | 无 |

**页面区块（从上到下）：**

```
┌──────────────────────────────┐
│  导航栏（固定顶部）           │
│  Logo · 关于我 · 技能 ·      │
│  项目 · 联系方式 · [登录]    │
├──────────────────────────────┤
│                              │
│   🎯 英雄区（全屏）          │
│   头像 J · 你好我是 jibuen   │
│   全栈开发者 · 开源爱好者    │
│   [了解更多 ↓]              │
│   渐变背景                   │
│                              │
├──────────────────────────────┤
│   👤 关于我                  │
│   照片占位 + 三段文字介绍    │
│   左右双栏布局               │
├──────────────────────────────┤
│   ⚡ 核心技能                │
│   4 张卡片（带进度条动画）   │
│   前端/后端/数据库/工具      │
│   灰色背景区                 │
├──────────────────────────────┤
│   📁 项目作品                │
│   3 张卡片（图片+标题+描述） │
│   仪表盘/聊天应用/任务管理器 │
├──────────────────────────────┤
│   📧 联系方式                │
│   左：邮箱/位置/社交链接     │
│   右：留言表单               │
├──────────────────────────────┤
│   页脚 © 2026 jibuen         │
│   [返回顶部 ↑] 浮动按钮      │
└──────────────────────────────┘
```

**交互功能：**
- 导航栏滚动阴影 + 滚动高亮当前锚点
- 移动端（≤768px）汉堡菜单展开导航
- IntersectionObserver 滚动渐入动画（`fade-in` → `visible`）
- 技能条滚动到可见区域时宽度动画填充
- 登录按钮：当前跳转到独立 `login.html`
- 右下角返回顶部按钮（滚动 > 400px 显示）
- 联系表单提交反馈（前端模拟，未接入后端）

**CSS 变量：**
```css
--bg: #fff
--text: #1a1a2e
--text-light: #555
--muted: #888
--accent: #4A90D9
--accent-light: #e8f0fa
--accent-dark: #357ABD
--border: #e0e0e0
--card-bg: #fafafa
```

---

### 4.2 login.html — 登录页

| 属性 | 值 |
|------|-----|
| 文件大小 | ~150 行 |
| 主题风格 | 晨雾山脉 Unsplash 照片 + 毛玻璃卡片 |
| 外部依赖 | Unsplash CDN（背景图） |

**页面结构：**
```
全屏山脉背景（blur + 暗化遮罩）
        │
        ▼
┌──────────────────────┐
│   毛玻璃登录卡片     │
│   background:        │
│   rgba(255,255,255,  │
│   0.12) blur(20px)   │
│                      │
│   🚀 登录            │
│   欢迎回到 jibuen    │
│                      │
│   [用户名/邮箱]      │
│   [密码]             │
│                      │
│   [登 录]  墨绿按钮  │
│                      │
│   还没有账号？立即注册│
│   返回首页 · 代码笔记│
└──────────────────────┘
```

**当前认证逻辑：**
```javascript
// 硬编码验证 — 待改为调用后端 API
if (u === 'admin' && p === '123456') {
    window.location.href = 'index.html';
}
```

> ⚠️ **待改进**：接入后端 `POST /api/auth/login`，支持真实注册/登录，JWT token 存入 `localStorage`。

---

### 4.3 notes.html — 代码笔记知识库

| 属性 | 值 |
|------|-----|
| 文件大小 | ~892 行 |
| 主题风格 | 亮/暗双主题切换 |
| 外部依赖 | Font Awesome 6.4.0 CDN、highlight.js 11.9.0 CDN |
| 数据量 | 8 条笔记（硬编码） |

**页面布局：**
```
┌──────────────────────────────────────────────────────┐
│ 顶部导航栏（粘性定位）                                │
│ [jibuen·代码笔记] [🔍 搜索框 Ctrl+K]                │
│ [全部] [🐍Python] [🟨JS] [🔷C++] [🏠返回主页] [🌙] │
├──────────────────────────────────────────────────────┤
│ 统计看板                                              │
│ [📚 总笔记数:8]  [⭐ 已收藏:2]  [🌐 语言种类:2]      │
├────────────┬─────────────────────────────────────────┤
│ 侧边栏     │ 卡片网格区                               │
│ (粘性定位) │ ┌──────────┐ ┌──────────┐              │
│            │ │ 变量定义  │ │ 标准输入  │              │
│ 📋 快速目录│ │ 🐍 Python │ │ 🐍 Python │              │
│ · 变量定义 │ │ 🟨 JS    │ │ 🟨 JS    │              │
│ · 标准输入 │ │ ⭐ 收藏   │ │          │              │
│ · 格式化   │ │ 展开详情▼│ │ 展开详情▼│              │
│ · ...      │ └──────────┘ └──────────┘              │
│            │ ┌──────────┐ ┌──────────┐              │
│ 🕐 最近浏览│ │ if-else  │ │ for循环  │              │
│ · ...      │ │ ...      │ │ ...      │              │
│            │ └──────────┘ └──────────┘              │
└────────────┴─────────────────────────────────────────┘
```

**核心功能清单：**

| 功能 | 状态 | 实现方式 |
|------|------|----------|
| 语言筛选 | ✅ | `filter-btn` 按钮，切换 `currentLang` |
| 文本搜索 | ✅ | `debounce(fn, 200)` 防抖，匹配标题/描述/标签 |
| 收藏/取消 | ✅ | `localStorage['jb_notes_fav']`，收藏置顶 + 星标 |
| 最近浏览 | ✅ | `localStorage['jb_notes_recent']`，最多 3 条 |
| 主题切换 | ✅ | `data-theme` 切换 CSS 变量，`localStorage` 持久化 |
| 代码 Tab 切换 | ✅ | Python / JavaScript 代码面板切换 |
| 代码复制 | ✅ | `navigator.clipboard.writeText()` |
| 展开详情 | ✅ | 折叠/展开卡片的详细说明区域 |
| 长按拖拽排序 | ✅ | 400ms 长按触发拖拽，排序存入 `localStorage` |
| 代码高亮 | ✅ | highlight.js 自动着色 `<pre><code>` |
| 统计看板 | ✅ | 实时计算：总数/收藏数/语言种类 |
| 侧边栏目录 | ✅ | 动态渲染当前筛选结果的目录 |
| 键盘快捷键 | ✅ | `Ctrl+K` 聚焦搜索框 |
| 移动端适配 | ✅ | 侧边栏滑出式，卡片单列 |
| 空状态 | ✅ | 无匹配时显示"没有找到匹配的笔记" |

**数据模型（当前硬编码）：**
```javascript
{
  id: Number,           // 唯一标识
  title: String,        // 笔记标题，如"变量定义"
  desc: String,         // 一句话描述
  tags: String[],       // 标签，如 ['#基础', '#变量']
  python: String,       // Python 代码示例
  js: String,           // JavaScript 代码示例
  detail: String        // 详细说明（HTML）
}
```

> ⚠️ **待改进**：数据目前硬编码在 JS 中（`cardsData` 数组），需改为从后端 API 动态加载，支持在线新增/编辑/删除笔记。

---

### 4.4 cxx-notes.html — C++ STL 算法竞赛笔记

| 属性 | 值 |
|------|-----|
| 文件大小 | ~1486 行 |
| 主题风格 | 梵高《星月夜》深色油画 + 亮/暗切换 |
| 外部依赖 | Font Awesome 6.4.0 CDN、highlight.js 11.9.0 CDN |
| 数据量 | 12 章 STL + 附录，约 30 个子节 |

**页面布局：**
```
┌──────────────────────────────────────────────┐
│ 顶部导航栏                                    │
│ [🏠 主页面] [📝 代码笔记] (active)          │
├────────────┬─────────────────────────────────┤
│ 左侧目录栏 │ 右侧内容区（梵高星空动态背景）  │
│ (300px)    │                                 │
│            │  ╭─ 阅读进度条 ─╮              │
│ 📑 目录    │  ★  ·  ☽  ·  ★               │
│            │    ★  ·  ☽                     │
│ ▶ 1.vector│  ┌──────────────────────┐       │
│ ▶ 2.stack │  │ 1. vector — 动态数组  │       │
│ ▶ 3.queue │  │                      │       │
│ ▶ 4.deque │  │ vector 是 C++ STL    │       │
│ ▶ 5.pri.. │  │ 中使���频率最高...    │       │
│ ▶ 6.map   │  │                      │       │
│ ▶ 7.set   │  │ ┌─ 代码块 ─┐       │       │
│ ▶ 8.pair  │  │ │ C++      │ [📋]  │       │
│ ▶ 9.string│  │ │ #include │       │       │
│ ▶ 10.bits.│  │ │ ...      │       │       │
│ ▶ 11.array│  │ └──────────┘       │       │
│ ▶ 12.tuple│  │                      │       │
│ ▶ 附录    │  │ 💡 提示：...        │       │
│            │  │ ⚠️ 注意：...        │       │
│ 📦 头文件  │  └──────────────────────┘       │
│ #include   │    ★        ★                   │
│ <vector>   │       ★                         │
└────────────┴─────────────────────────────────┘
```

**STL 章节完整清单：**

| # | 章节 | 头文件 | 子节 |
|---|------|--------|------|
| 1 | vector | `<vector>` | 介绍 → 初始化 → 方法函数 → 深入探索（遍历/排序/内存） → 元素访问 → 输入与输出（3 种方式） |
| 2 | stack | `<stack>` | 基本操作（5 核心） → 应用（括号匹配 + 单调栈模板） → 注意事项（无clear/遍历技巧） |
| 3 | queue | `<queue>` | 基本操作 → BFS 模板应用 |
| 4 | deque | `<deque>` | 基本操作 → 与 vector 对比 |
| 5 | priority_queue | `<queue>` | 大顶堆 → 小顶堆 + 自定义比较 → 应用（Dijkstra/TopK） |
| 6 | map | `<map>` | 基本操作 → 遍历与查找 → unordered_map 对比 |
| 7 | set | `<set>` | set → multiset（erase 大坑提醒） → unordered_set |
| 8 | pair | `<utility>` | 基本操作 → 常见用法（排序/容器） |
| 9 | string | `<string>` | 基本操作 → 常用方法 → 数值转换 |
| 10 | bitset | `<bitset>` | 基本操作 → 位运算 |
| 11 | array | `<array>` | 基本操作 → 与 C 数组对比 |
| 12 | tuple | `<tuple>` | 基本操作 → 结构化绑定（C++17） |
| 附录 | 基础输入输出 | `<iostream>` | cout → cin（加速技巧） → 格式化（printf + iomanip 对比） |

**核心技术亮点：**

| 技术点 | 实现 |
|--------|------|
| 星空背景 | 10 层 CSS 渐变叠加（径向渐变星星 + 椭圆月晕 + 重复笔触纹理 + 夜空基底） |
| 星云旋转 | `conic-gradient` + `nebula-rotate` 80s 线性无限旋转动画 |
| 呼吸效果 | `stars-breathe` 4.5s `background-size` 缩放动画 |
| 树形目录 | 递归渲染 TREE 数据，箭头图标 `▶/▼`，手风琴互斥（顶层节点只展开一个） |
| 滚动联动 | IntersectionObserver 监听锚点，`rootMargin: -20px 0px -70% 0px` 保证顶部高亮 |
| 阅读进度 | `content.scrollTop / scrollHeight` 实时计算百分比 |
| 展开状态 | `localStorage['cxx_tree_expanded']` 持久化展开/收起 |
| 代码复制 | `navigator.clipboard.writeText()` + Toast 提示 |
| 移动端 | 侧边栏滑出 + 汉堡按钮 + 覆盖层半透明遮罩 |

**C++ 代码示范质量：**
- 每段示例代码都是完整可运行的
- 竞赛模板风格（如 BFS 模板、单调栈模板、排序去重三步曲）
- 包含常见大坑提醒（如 multiset 的 `erase(x)` vs `erase(find(x))`）
- 附加速技巧（`ios::sync_with_stdio(false)`、`reserve` vs `resize` 区别）

---

## 5. 前端设计——未来规划

### 5.1 整体页面体系

```
                    ┌─────────────────┐
                    │   index.html    │
                    │   个人主页       │
                    │   (门户入口)     │
                    └───┬───┬───┬─────┘
        ┌───────────────┘   │   └───────────────┐
        ▼                   ▼                   ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  about.html  │ │  blog.html   │ │ notes.html   │
│  关于我      │ │  技术博客    │ │  代码笔记    │
│  ⬜ 新建     │ │  ⬜ 新建     │ │  ✅ 已有     │
└──────────────┘ └──────┬───────┘ └──────┬───────┘
                        │                │
              ┌─────────▼──────┐  ┌──────▼──────────┐
              │ blog-detail.   │  │ cxx-notes.html   │
              │    html        │  │  C++ STL 笔记    │
              │  ⬜ 新建       │  │  ✅ 已有         │
              └────────────────┘  └──────────────────┘
                        │
              ┌─────────▼──────┐
              │ comments 模块  │
              │  (评论系统)    │
              │  ⬜ 新建       │
              └────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ login.html   │ │messages.html │ │  chat.html   │
│ 登录/注册    │ │  留言板      │ │  AI 对话     │
│ ✅ 已有      │ │  ⬜ 新建     │ │  ⬜ 新建     │
└──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐
│  admin.html  │
│  后台管理     │
│  ⬜ 新建     │
└──────────────┘
```

### 5.2 各页面详细规划

#### 5.2.1 blog.html — 技术博客列表（⬜ 待建）

**功能：**
- 文章卡片列表，按时间倒序
- 分页/无限滚动加载
- 按标签筛选（前端/后端/算法/生活...）
- 搜索文章标题和内容
- 每篇文章显示：标题、摘要、发布日期、标签、阅读量
- 点击进入 `blog-detail.html`

**数据来源：** `GET /api/posts?page=&limit=&tag=`

**估计代码量：** ~500 行

#### 5.2.2 blog-detail.html — 博客详情页（⬜ 待建）

**功能：**
- Markdown 渲染文章正文
- 代码高亮（highlight.js）
- 文章目录（TOC 侧边栏，自动从标题生成）
- 评论区（底部，支持回复嵌套）
- 上一篇 / 下一篇导航
- 阅读量统计
- 分享按钮（复制链接）

**技术要点：**
- 引入 Markdown 渲染库（如 marked.js）
- 评论需登录后才能发表
- URL 格式：`blog-detail.html?id=123`

**估计代码量：** ~600 行

#### 5.2.3 messages.html — 留言板（⬜ 待建）

**功能：**
- 访客留言展示（头像、昵称、时间、内容）
- 留言表单（昵称 + 邮箱 + 内容）
- 分页加载 / 无限滚动
- 留言通知（邮件提醒，可选）

**数据来源：** `GET /api/messages` / `POST /api/messages`

**估计代码量：** ~350 行

#### 5.2.4 chat.html — AI 对话页面（⬜ 待建）

**功能：**
- 类似 ChatGPT 的对话界面
- 对话历史列表（左侧栏）
- 消息气泡（用户右 / AI 左）
- 流式输出（打字机效果）
- Markdown 渲染 AI 回复（代码块 + 高亮）
- 复制 AI 回复
- 预设提示词（Prompt 模板）
- 对话上下文管理

**技术要点：**
- 后端代理 LLM API（保护 API Key）
- WebSocket 或 SSE（Server-Sent Events）实现流式输出
- `localStorage` 存储对话历史
- API 可选：OpenAI / 通义千问 / DeepSeek

**估计代码量：** ~800 行

#### 5.2.5 admin.html — 后台管理（⬜ 待建）

**功能：**
- 仪表盘：总览统计（文章数/留言数/用户数/笔记数）
- 文章管理：新建/编辑/删除，Markdown 编辑器
- 笔记管理：新增/编辑/删除代码笔记
- C++ 笔记管理：增删改 STL 章节内容
- 留言管理：查看/标记已读/删除/回复
- 用户管理：查看/禁用（可选）
- 登录保护：仅管理员可访问

**技术要点：**
- 简易 Markdown 编辑器（textarea + 实时预览）
- 需要管理员权限验证
- 响应式表格展示

**估计代码量：** ~1200 行

#### 5.2.6 about.html — 关于页面（⬜ 待建）

**功能：**
- 从 index.html 的"关于我"区块独立出来
- 更详细的个人介绍（时间线形式）
- 教育经历、工作经历
- 技术栈可视化（图表/百分比）
- GitHub 贡献日历嵌入
- 友情链接

**估计代码量：** ~400 行

### 5.3 前端公共组件规划

为避免重复代码，提取公共逻辑到独立 JS 文件：

| 文件 | 功能 |
|------|------|
| `js/common.js` | 公共工具函数（escapeHtml、formatDate、debounce 等） |
| `js/auth.js` | 认证模块（login/logout/getUser/checkAuth） |
| `js/api.js` | API 请求封装（统一 fetch + JWT token 注入） |
| `js/theme.js` | 主题管理（读取/切换/持久化） |
| `js/components.js` | 可复用组件（导航栏、页脚、Toast 提示、加载动画） |
| `css/common.css` | 全局样式变量 + 基础重置 |
| `css/themes.css` | 亮色/暗色主题变量 |

> ⚠️ **注意**：引入公共 JS/CSS 后，每个 HTML 页面不再是"完全独立"，需要以相对路径引用。如果仍希望保持单文件可用的特性，可在构建时做内联打包。

### 5.4 前端技术演进路径

```
阶段 1（当前）：独立 HTML 文件，零构建
│  优点：简单直接，双击即看
│  缺点：代码重复，维护成本随页面增多而上升
│
阶段 2（中期）：引入公共 JS/CSS 模块
│  优点：代码复用，统一风格
│  缺点：需要本地服务器或 CDN 部署
│
阶段 3（远期）：考虑 Vue/React 单页应用
│  优点：组件化、状态管理、路由
│  缺点：构建工具链复杂
│
决策点：当页面数 > 8 时，建议迁移到阶段 2；> 15 时考虑阶段 3
```

---

## 6. 后端设计

### 6.1 当前架构

**文件结构：**
```
server/src/
├── index.js            # 一切的起点
├── config/
│   └── env.js          # 读取 .env 配置
├── routes/
│   └── api.js          # 所有路由混在一个文件
└── middleware/
    ├── auth.js         # JWT 验证
    └── errorHandler.js # 错误兜底
```

**当前问题：**
- `routes/api.js` 承载了所有路由（认证+文章+留言），随功能增多会膨胀
- 缺少请求日志
- 路由未做模块化拆分

### 6.2 推荐重构方向

```
server/src/
├── index.js                 # 入口：初始化 DB + Express
├── config/
│   └── env.js               # 环境配置
├── routes/
│   ├── index.js             # 路由汇总（注册所有子路由）
│   ├── auth.js              # /api/auth/*
│   ├── posts.js             # /api/posts/*
│   ├── messages.js          # /api/messages/*
│   ├── notes.js             # /api/notes/*      ⬜
│   ├── comments.js          # /api/comments/*    ⬜
│   ├── chat.js              # /api/chat/*        ⬜
│   └── upload.js            # /api/upload/*      ⬜
├── controllers/             # ⬜ 业务逻辑（从 routes 中抽取）
├── middleware/
│   ├── auth.js              # JWT 认证
│   ├── adminAuth.js         # 管理员认证     ⬜
│   ├── errorHandler.js      # 错误处理
│   └── logger.js            # 请求日志       ⬜
└── utils/                   # ⬜ 工具
    ├── response.js          # 统一响应格式
    └── validator.js         # 输入校验
```

### 6.3 环境配置

```env
# .env 文件（不提交到 Git）
PORT=3001
JWT_SECRET=your-strong-random-secret-here
JWT_EXPIRES=7d
DB_PATH=./database/data.db

# 阿里云 OSS（未来文件上传）
OSS_REGION=cn-hangzhou
OSS_BUCKET=jibuen-assets
OSS_ACCESS_KEY=xxx
OSS_SECRET_KEY=xxx

# AI 对话 API（未来）
AI_API_URL=https://api.openai.com/v1
AI_API_KEY=sk-xxx
AI_MODEL=gpt-4o-mini
```

---

## 7. 数据库设计

### 7.1 现有表

#### users（用户）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| username | VARCHAR(50) | NOT NULL UNIQUE | 用户名 |
| email | VARCHAR(100) | NOT NULL UNIQUE | 邮箱 |
| password | VARCHAR(255) | NOT NULL | bcrypt 哈希，10 轮 |
| avatar | VARCHAR(255) | DEFAULT NULL | 头像 URL |
| bio | TEXT | DEFAULT '' | 个人简介 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 注册时间 |

#### posts（文章）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | TEXT | NOT NULL | 正文（Markdown） |
| author_id | INTEGER | NOT NULL FK→users | 作者 |
| status | VARCHAR(20) | DEFAULT 'published' | published/draft |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

#### messages（留言）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| name | VARCHAR(50) | NOT NULL | 昵称 |
| email | VARCHAR(100) | NOT NULL | 邮箱 |
| content | TEXT | NOT NULL | 内容 |
| is_read | INTEGER | DEFAULT 0 | 0=未读, 1=已读 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 时间 |

### 7.2 未来新增表

#### notes（代码笔记）⬜

```sql
CREATE TABLE notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    tags        VARCHAR(500) DEFAULT '',      -- JSON 数组字符串
    python_code TEXT,
    javascript_code TEXT,
    detail      TEXT,                          -- 详细说明（HTML/Markdown）
    author_id   INTEGER NOT NULL,
    is_favorite INTEGER DEFAULT 0,
    view_count  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### cxx_notes（C++ STL 笔记）⬜

```sql
CREATE TABLE cxx_notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id   INTEGER,                      -- 父节点 ID，支持树形结构
    sort_order  INTEGER DEFAULT 0,            -- 排序序号
    chapter_num VARCHAR(20),                  -- 如 "1.1.2"
    title       VARCHAR(200) NOT NULL,
    header_file VARCHAR(100),                 -- 如 "#include <vector>"
    content     TEXT,                          -- HTML/Markdown 内容
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES cxx_notes(id)
);
```

#### comments（评论）⬜

```sql
CREATE TABLE comments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id     INTEGER NOT NULL,             -- 评论所属文章
    parent_id   INTEGER,                      -- 父评论 ID（支持嵌套回复）
    user_id     INTEGER,                      -- 登录用户 ID（可为 NULL 表示匿名）
    guest_name  VARCHAR(50),                  -- 匿名访客昵称
    content     TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### tags（标签）⬜

```sql
CREATE TABLE tags (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 文章-标签 多对多关联
CREATE TABLE post_tags (
    post_id INTEGER NOT NULL,
    tag_id  INTEGER NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

#### chat_history（AI 对话历史）⬜

```sql
CREATE TABLE chat_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    session_id  VARCHAR(50) NOT NULL,         -- 对话会话标识
    role        VARCHAR(20) NOT NULL,          -- user / assistant / system
    content     TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_chat_session ON chat_history(session_id);
```

### 7.3 ER 图（完整版）

```
                              ┌──────────────┐
                              │    users     │
                              │──────────────│
                              │ id (PK)      │
                              │ username     │
                              │ email        │
                              │ password     │
                              │ avatar       │
                              │ bio          │
                              │ role     ⬜  │
                              │ created_at   │
                              └──┬───┬───┬───┘
                                 │   │   │
              ┌──────────────────┘   │   └──────────────────┐
              ▼                      ▼                      ▼
       ┌──────────┐          ┌──────────────┐       ┌──────────────┐
       │  posts   │          │    notes  ⬜  │       │chat_history ⬜│
       │──────────│          │──────────────│       │──────────────│
       │ id (PK)  │          │ id (PK)      │       │ id (PK)      │
       │ title    │          │ title        │       │ user_id (FK) │
       │ content  │          │ description  │       │ session_id   │
       │author_id │──┐       │ python_code  │       │ role         │
       │ status   │  │       │ js_code      │       │ content      │
       │created_at│  │       │ detail       │       │ created_at   │
       │updated_at│  │       │author_id(FK) │       └──────────────┘
       └────┬─────┘  │       │ created_at   │
            │        │       │ updated_at   │
            ▼        │       └──────────────┘
   ┌────────────┐    │
   │  comments ⬜│    │
   │────────────│    │
   │ id (PK)    │    │
   │ post_id(FK)│◄───┘
   │ parent_id  │
   │ user_id(FK)│◄──────────────┐
   │ guest_name │               │
   │ content    │               │
   │ created_at │               │
   └────────────┘               │
                                │
   ┌──────────────┐             │
   │  messages    │             │
   │──────────────│             │
   │ id (PK)      │             │
   │ name         │             │
   │ email        │             │
   │ content      │             │
   │ is_read      │             │
   │ created_at   │             │
   └──────────────┘             │
                                │
   ┌──────────────────────┐     │
   │cxx_notes         ⬜  │     │
   │──────────────────────│     │
   │ id (PK)              │     │
   │ parent_id (自引用FK) │     │
   │ sort_order           │     │
   │ chapter_num          │     │
   │ title                │     │
   │ header_file          │     │
   │ content              │     │
   │ author_id (FK) ──────┘     │
   │ created_at / updated_at    │
   └────────────────────────────┘

   ┌──────────┐    ┌──────────────┐
   │   tags ⬜│    │ post_tags  ⬜ │
   │──────────│    │──────────────│
   │ id (PK)  │◄───│ post_id (FK) │
   │ name     │    │ tag_id  (FK) │
   └──────────┘    └──────────────┘
```

---

## 8. API 接口设计

### 8.1 通用规范

| 项目 | 规范 |
|------|------|
| Base URL | `http://{host}:{port}/api` |
| 请求格式 | JSON（`Content-Type: application/json`） |
| 响应格式 | `{ "success": true/false, ... }` |
| 认证方式 | `Authorization: Bearer <JWT_TOKEN>` |
| 分页参数 | `?page=1&limit=10` |

### 8.2 现有接口

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/health` | — | 健康检查 |
| POST | `/auth/register` | — | 用户注册 |
| POST | `/auth/login` | — | 用户登录 |
| GET | `/auth/me` | Bearer | 当前用户信息 |
| GET | `/posts` | — | 文章列表（分页） |
| GET | `/messages` | — | 留言列表 |
| POST | `/messages` | — | 提交留言 |

### 8.3 未来新增接口

#### 文章模块

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/posts/:id` | — | 文章详情 |
| POST | `/posts` | Bearer | 创建文章 |
| PUT | `/posts/:id` | Bearer | 更新文章 |
| DELETE | `/posts/:id` | Bearer+Admin | 删除文章 |
| GET | `/posts?tag=xxx` | — | 按标签筛选 |

#### 笔记模块 ⬜

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/notes` | — | 笔记列表 |
| GET | `/notes/:id` | — | 笔记详情 |
| POST | `/notes` | Bearer | 创建笔记 |
| PUT | `/notes/:id` | Bearer | 更新笔记 |
| DELETE | `/notes/:id` | Bearer+Admin | 删除笔记 |
| POST | `/notes/:id/favorite` | Bearer | 切换收藏 |

#### C++ 笔记管理 ⬜

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/cxx-notes` | — | 获取完整树形结构 |
| GET | `/cxx-notes/:id` | — | 获取某章节详情 |
| PUT | `/cxx-notes/:id` | Bearer+Admin | 更新章节内容 |
| POST | `/cxx-notes` | Bearer+Admin | 新增章节 |
| DELETE | `/cxx-notes/:id` | Bearer+Admin | 删除章节 |

#### 评论模块 ⬜

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/posts/:id/comments` | — | 文章评论列表 |
| POST | `/posts/:id/comments` | 可选 | 发表评论（登录或匿名） |
| DELETE | `/comments/:id` | Bearer+Admin | 删除评论 |

#### AI 对话 ⬜

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| POST | `/chat/send` | 可选 | 发送消息（SSE 流式返回） |
| GET | `/chat/history` | Bearer | 对话历史列表 |
| GET | `/chat/history/:sessionId` | Bearer | 某次对话完整记录 |
| DELETE | `/chat/history/:sessionId` | Bearer | 删除对话记录 |

#### 文件上传 ⬜

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| POST | `/upload/image` | Bearer+Admin | 上传图片（文章配图等） |
| POST | `/upload/avatar` | Bearer | 上传头像 |

#### 后台统计 ⬜

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/admin/stats` | Bearer+Admin | 仪表盘统计数据 |

---

## 9. 安全设计

### 9.1 安全措施清单

| 威胁 | 防护措施 | 状态 |
|------|----------|------|
| 密码泄露 | bcrypt 哈希（10 轮 salt），永不存明文 | ✅ |
| 身份伪造 | JWT 签名验证 + 过期时间（7 天） | ✅ |
| SQL 注入 | 预编译语句（`db.prepare()`），永不拼接 SQL | ✅ |
| XSS 攻击 | `escapeHtml()` 转义用户输入 | ✅ 已使用但不全面 |
| CSRF | JWT Bearer Token（非 Cookie），天然免疫 | ✅ |
| 暴力破解 | ⬜ 登录频率限制（express-rate-limit） | ⬜ |
| 文件上传攻击 | ⬜ 校验文件类型+大小限制+病毒扫描 | ⬜ |
| API Key 泄露 | `.env` 文件 + `.gitignore`，不提交到 Git | ✅ |
| HTTPS 中间人 | ⬜ Let's Encrypt / 阿里云 SSL 证书 | ⬜ |
| DDoS | ⬜ 阿里云安全组 + Nginx 限流 | ⬜ |
| 敏感信息泄露 | ⬜ API 响应不返回 password 字段 | ✅ |

### 9.2 认证流程

```
注册：
  用户输入 → 前端校验格式 → POST /api/auth/register
  → 后端校验重复 → bcrypt 哈希密码 → INSERT → 返回成功

登录：
  用户输入 → POST /api/auth/login
  → 查数据库 → bcrypt.compareSync() → jwt.sign()
  → 返回 { token, user }

后续请求：
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  → authMiddleware → jwt.verify() → req.user → 业务逻辑
```

---

## 10. 云服务器部署方案

### 10.1 阿里云 ECS 配置建议

| 配置项 | 建议（入门级） | 建议（标准级） | 说明 |
|--------|---------------|---------------|------|
| 实例规格 | ecs.e-c1m1.large（1vCPU 2GB） | ecs.e-c2m2.large（2vCPU 4GB） | 学生优惠 |
| 系统盘 | 40GB ESSD | 40GB ESSD | 够用 |
| 操作系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | 资料最多 |
| 带宽 | 1-3 Mbps（按量） | 3-5 Mbps（按量） | 个人站够用 |
| 安全组 | 开放 80/443/22 | 同左 + 限制 IP | 22 端口建议仅限自己 IP |
| 月费用 | ~¥35-60（学生价） | ~¥70-100 | 阿里云有学生优惠 |

### 10.2 服务器环境搭建

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 Nginx
sudo apt install -y nginx

# 4. 安装 Git
sudo apt install -y git

# 5. 安装 PM2（进程守护）
sudo npm install -g pm2

# 6. 创建项目目录
mkdir -p /var/www/jibuen
cd /var/www/jibuen
git clone <你的仓库地址> .

# 7. 安装后端依赖
cd server && npm install

# 8. 配置 .env
cp .env.example .env
nano .env  # 修改 JWT_SECRET 等

# 9. 启动后端（PM2 守护）
pm2 start src/index.js --name jibuen-api
pm2 save
pm2 startup  # 开机自启
```

### 10.3 Nginx 配置

```nginx
# /etc/nginx/sites-available/jibuen
server {
    listen 80;
    server_name your-domain.com;  # 替换为实际域名

    # 日志
    access_log /var/log/nginx/jibuen-access.log;
    error_log  /var/log/nginx/jibuen-error.log;

    # 静态文件（前端 HTML）
    root /var/www/jibuen;
    index index.html;

    # 前端页面
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket（AI 对话流式输出）
    location /ws/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 10.4 HTTPS 配置

```bash
# 使用 Let's Encrypt 免费证书
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
# 证书自动续期
sudo certbot renew --dry-run
```

### 10.5 部署自动化脚本

```bash
#!/bin/bash
# deploy/deploy.sh
cd /var/www/jibuen
git pull origin main
cd server && npm install --production
pm2 restart jibuen-api
echo "✅ 部署完成"
```

### 10.6 监控与备份

| 项目 | 方案 |
|------|------|
| 进程监控 | PM2（自动重启 + 日志） |
| 数据库备份 | Crontab 每天凌晨 `cp data.db backup/data_$(date).db` |
| 日志轮转 | Nginx 自带 logrotate |
| 性能监控 | `htop` / `pm2 monit` |
| 外网监控 | ⬜ Uptime Kuma（可选） |

---

## 11. 技术演进路线图

### 11.1 阶段规划

```
Phase 0（当前）：基础建设 ✅
├── ✅ 个人主页 index.html
├── ✅ 登录页 login.html
├── ✅ 代码笔记 notes.html
├── ✅ C++ STL 笔记 cxx-notes.html
├── ✅ 后端 Express + SQLite
├── ✅ JWT 认证
└── ✅ API 接口（部分）

Phase 1（短期）：补全核心功能
├── ⬜ 前端接入后端 API（登录/留言）
├── ⬜ 统一登录状态管理
├── ⬜ 消息板独立页面 messages.html
├── ⬜ 后端路由模块化拆分
├── ⬜ 清理废弃 client/ 目录
├── ⬜ 引入公共 JS/CSS 模块
└── ⬜ 博客列表页 blog.html + 详情页 blog-detail.html

Phase 2（中期）：功能扩展
├── ⬜ AI 对话页面 chat.html + 后端代理
├── ⬜ 后台管理 admin.html
├── ⬜ 评论系统
├── ⬜ 笔记动态管理（notes 表 + API）
├── ⬜ 标签系统
├── ⬜ 文件上传（头像/配图）
└── ⬜ 笔记数据迁移到数据库

Phase 3（远期）：云部署 & 优化
├── ⬜ 阿里云 ECS 购买与配置
├── ⬜ Nginx + HTTPS + 域名
├── ⬜ 自动化部署脚本
├── ⬜ 数据库备份策略
├── ⬜ 性能优化（CDN、缓存）
├── ⬜ SEO 优化
└── ⬜ 访问统计（百度统计 / Google Analytics）

Phase 4（未来畅想）：
├── ⬜ Vue/React SPA 重构（如果页面数 > 15）
├── ⬜ 多语言支持（中/英）
├── ⬜ RSS 订阅
├── ⬜ PWA（离线访问）
├── ⬜ Docker 容器化
└── ⬜ CI/CD（GitHub Actions 自动部署）
```

---

## 12. 开发规范

### 12.1 代码规范

| 规范 | 说明 |
|------|------|
| HTML | 语义化标签，`lang="zh-CN"` |
| CSS | 使用 CSS 变量，亮/暗双主题用 `data-theme` 切换 |
| JavaScript | ES6+ 语法，优先 `const`/`let`，避免 `var` |
| 命名 | CSS 用 kebab-case，JS 用 camelCase，HTML ID 用 camelCase |
| 注释 | 每个区块用 `// ==== 区块名 ====` 标记分隔 |
| 转义 | 所有用户输入必须经过 `escapeHtml()` 处理 |

### 12.2 Git 提交规范

```
<类型>: <简述>

类型：
  feat:     新功能
  fix:      修复 Bug
  style:    样式调整
  refactor: 重构
  docs:     文档更新
  chore:    杂项（清理/配置等）
  deploy:   部署相关

示例：
  feat: 新增留言板独立页面 messages.html
  fix: 修复 notes.html 搜索框在移动端溢出
  docs: 更新 SDD 文档，补充云部署方案
  refactor: 后端路由按模块拆分
```

### 12.3 文件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| HTML 页面 | 小写 + 连字符 | `blog-detail.html` |
| JS 模块 | 小写 + 连字符 | `auth.js` |
| CSS 文件 | 小写 + 连字符 | `common.css` |
| 数据库文件 | 蛇形命名 | `chat_history` |
| 部署脚本 | 小写 | `deploy.sh` |

---

## 13. 附录

### 13.1 代码统计

| 文件 | 行数 | 类型 | 状态 |
|------|------|------|------|
| index.html | ~484 | 前端 | ✅ |
| login.html | ~150 | 前端 | ✅ |
| notes.html | ~892 | 前端 | ✅ |
| cxx-notes.html | ~1486 | 前端 | ✅ |
| server/src/index.js | ~55 | 后端 | ✅ |
| server/src/routes/api.js | ~122 | 后端 | ✅ |
| server/src/config/env.js | ~14 | 后端 | ✅ |
| server/src/middleware/auth.js | ~20 | 后端 | ✅ |
| server/src/middleware/errorHandler.js | ~14 | 后端 | ✅ |
| database/init.sql | ~37 | 数据库 | ✅ |
| **当前合计** | **~3274** | — | — |
| blog.html | ~500 | 前端 | ⬜ 待建 |
| blog-detail.html | ~600 | 前端 | ⬜ 待建 |
| messages.html | ~350 | 前端 | ⬜ 待建 |
| chat.html | ~800 | 前端 | ⬜ 待建 |
| admin.html | ~1200 | 前端 | ⬜ 待建 |
| about.html | ~400 | 前端 | ⬜ 待建 |
| **未来合计** | **~7124+** | — | — |

### 13.2 外部依赖清单

| 依赖 | 用途 | 加载方式 | 免费额度 |
|------|------|----------|----------|
| highlight.js | 代码语法高亮 | CDN | 完全免费 |
| Font Awesome 6.4 | 图标库 | CDN | 免费版够用 |
| Unsplash | 背景图片 | CDN 链接 | 免费使用 |
| OpenAI API | AI 对话 | 后端代理 | 按量付费 |
| 通义千问 API | AI 对话（备选） | 后端代理 | 有免费额度 |
| 阿里云 ECS | 服务器 | — | 学生优惠 |
| 阿里云 OSS | 文件存储 | SDK | 按量付费 |
| Let's Encrypt | SSL 证书 | certbot | 完全免费 |

### 13.3 参考资料

- [Express.js 官方文档](https://expressjs.com/)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [highlight.js 使用指南](https://highlightjs.org/)
- [MDN Web 文档](https://developer.mozilla.org/zh-CN/)
- [阿里云 ECS 新手上路](https://help.aliyun.com/document_detail/25422.html)
- [Nginx 入门指南](https://nginx.org/en/docs/beginners_guide.html)
- [PM2 进程管理](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [JWT 介绍](https://jwt.io/introduction)

---

> **文档维护**：本文档随项目持续更新，每次重大功能变更后同步修改。  
> **最后更新**：2026-07-23  
> **下次计划更新**：Phase 1 完成后
