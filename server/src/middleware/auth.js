import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * JWT 认证中间件
 */
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未登录，请先登录' });
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
  }
}
