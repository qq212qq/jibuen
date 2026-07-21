import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../index.js';
import config from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ==================== 健康检查 ====================
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'jibuen API 运行中 🚀', time: new Date().toISOString() });
});

// ==================== 用户注册 ====================
router.post('/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: '请填写所有字段' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码至少 6 位' });
    }

    const db = getDB();
    const hashed = bcrypt.hashSync(password, 10);

    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(username, email, hashed);

    res.json({ success: true, message: '注册成功', userId: result.lastInsertRowid });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: '用户名或邮箱已被注册' });
    }
    throw err;
  }
});

// ==================== 用户登录 ====================
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, {
    expiresIn: config.jwtExpires,
  });

  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
  });
});

// ==================== 获取当前用户 ====================
router.get('/auth/me', authMiddleware, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  res.json({ success: true, user });
});

// ==================== 文章列表 ====================
router.get('/posts', (req, res) => {
  const db = getDB();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const posts = db
    .prepare(
      `SELECT p.id, p.title, p.content, p.created_at, u.username AS author
       FROM posts p JOIN users u ON p.author_id = u.id
       WHERE p.status = 'published'
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    )
    .all(limit, offset);

  const total = db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'published'").get().count;

  res.json({ success: true, posts, total, page, totalPages: Math.ceil(total / limit) });
});

// ==================== 留言板 ====================
router.get('/messages', (req, res) => {
  const db = getDB();
  const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50').all();
  res.json({ success: true, messages });
});

router.post('/messages', (req, res) => {
  const { name, email, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ success: false, message: '请填写昵称和留言内容' });
  }

  const db = getDB();
  const stmt = db.prepare('INSERT INTO messages (name, email, content) VALUES (?, ?, ?)');
  const result = stmt.run(name, email || '', content);

  res.json({ success: true, message: '留言成功', messageId: result.lastInsertRowid });
});

export default router;
