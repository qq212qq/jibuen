/**
 * jibuen 前端主入口
 * 简易 SPA 路由 + 页面渲染
 */
import './style.css';
import { authAPI, postAPI, messageAPI } from './api.js';

// ==================== DOM 引用 ====================
const app = document.getElementById('app');

// ==================== 路由 ====================
const routes = {
  home: renderHome,
  login: renderLogin,
  register: renderRegister,
  posts: renderPosts,
  messages: renderMessages,
};

function getCurrentRoute() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/login') return 'login';
  if (path === '/register') return 'register';
  if (path === '/posts') return 'posts';
  if (path === '/messages') return 'messages';
  return 'home';
}

function navigate(path) {
  history.pushState({}, '', path);
  render();
}

// ==================== 工具函数 ====================
function isLoggedIn() {
  return !!localStorage.getItem('jibuen_token');
}

function getCurrentUser() {
  const user = localStorage.getItem('jibuen_user');
  return user ? JSON.parse(user) : null;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==================== 导航栏 ====================
function renderNavbar() {
  const user = getCurrentUser();
  const currentPath = window.location.pathname;

  const links = [
    { href: '/', label: '🏠 首页' },
    { href: '/posts', label: '📝 文章' },
    { href: '/messages', label: '💬 留言' },
  ];

  return `
    <nav class="navbar">
      <a href="/" class="navbar-brand" onclick="event.preventDefault(); navigate('/')">
        <span>jibuen</span>
      </a>
      <ul class="navbar-links">
        ${links
          .map(
            (l) =>
              `<li><a href="${l.href}" onclick="event.preventDefault(); navigate('${l.href}')" class="${currentPath === l.href ? 'active' : ''}">${l.label}</a></li>`
          )
          .join('')}
        <li>
          ${user
            ? `<span style="color:var(--text-muted);font-size:13px;">👤 ${escapeHtml(user.username)}</span>
               <button class="btn btn-outline btn-sm" onclick="handleLogout()" style="margin-left:8px;">退出</button>`
            : `<a href="/login" onclick="event.preventDefault(); navigate('/login')" class="btn btn-primary btn-sm">登录</a>`
          }
        </li>
      </ul>
    </nav>
  `;
}

// ==================== 页面渲染 ====================
function renderHome() {
  return `
    <div class="container">
      <section class="hero">
        <div class="hero-avatar">J</div>
        <h1>jibuen</h1>
        <p class="subtitle">探索 · 创造 · 分享</p>
        <div class="hero-buttons">
          <a href="/posts" onclick="event.preventDefault(); navigate('/posts')" class="btn btn-primary">📝 阅读文章</a>
          <a href="/messages" onclick="event.preventDefault(); navigate('/messages')" class="btn btn-outline">💬 留言板</a>
        </div>
      </section>

      <h2 class="section-title">🛸 关于我</h2>
      <div class="card">
        <p style="color:var(--text-muted); line-height:1.8;">
          欢迎来到 jibuen 的个人空间。这里记录着我的学习笔记、项目心得和日常思考。
          热爱技术，喜欢探索新鲜事物，相信代码可以改变世界。
        </p>
      </div>

      <h2 class="section-title">⚡ 技能</h2>
      <div class="card">
        <div class="tags">
          <span class="tag">HTML / CSS</span>
          <span class="tag">JavaScript</span>
          <span class="tag">Node.js</span>
          <span class="tag">React</span>
          <span class="tag">Python</span>
          <span class="tag">SQL</span>
          <span class="tag">Git</span>
          <span class="tag">Vite</span>
        </div>
      </div>
    </div>
    <footer class="footer">
      <p>© 2026 jibuen | Built with ❤️</p>
    </footer>
  `;
}

// ==================== 登录页 ====================
function renderLogin() {
  if (isLoggedIn()) {
    navigate('/');
    return '';
  }

  return `
    <div class="container" style="max-width:420px;">
      <div class="card" style="margin-top:40px;">
        <h3 style="text-align:center;">🚀 登录</h3>
        <form id="loginForm" onsubmit="return handleLogin(event)">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="loginUsername" class="form-input" placeholder="请输入用户名" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="loginPassword" class="form-input" placeholder="请输入密码" required>
          </div>
          <div id="loginError"></div>
          <button type="submit" class="btn btn-primary" style="width:100%;">登 录</button>
        </form>
        <p class="text-center mt-20" style="font-size:13px;color:var(--text-muted);">
          还没有账号？
          <a href="/register" onclick="event.preventDefault(); navigate('/register')">立即注册</a>
        </p>
      </div>
    </div>
  `;
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) return;

  try {
    const data = await authAPI.login(username, password);
    localStorage.setItem('jibuen_token', data.token);
    localStorage.setItem('jibuen_user', JSON.stringify(data.user));
    navigate('/');
  } catch (err) {
    document.getElementById('loginError').innerHTML =
      `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

function handleLogout() {
  localStorage.removeItem('jibuen_token');
  localStorage.removeItem('jibuen_user');
  navigate('/');
}

// ==================== 注册页 ====================
function renderRegister() {
  if (isLoggedIn()) {
    navigate('/');
    return '';
  }

  return `
    <div class="container" style="max-width:420px;">
      <div class="card" style="margin-top:40px;">
        <h3 style="text-align:center;">🪐 注册</h3>
        <form id="registerForm" onsubmit="return handleRegister(event)">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="regUsername" class="form-input" placeholder="3-20个字符" required minlength="3" maxlength="20">
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input type="email" id="regEmail" class="form-input" placeholder="your@email.com" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="regPassword" class="form-input" placeholder="至少6位" required minlength="6">
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input type="password" id="regPassword2" class="form-input" placeholder="再次输入密码" required>
            <div id="regPwdError" class="form-error"></div>
          </div>
          <div id="regError"></div>
          <button type="submit" class="btn btn-primary" style="width:100%;">注 册</button>
        </form>
        <p class="text-center mt-20" style="font-size:13px;color:var(--text-muted);">
          已有账号？
          <a href="/login" onclick="event.preventDefault(); navigate('/login')">去登录</a>
        </p>
      </div>
    </div>
  `;
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;

  if (password !== password2) {
    document.getElementById('regPwdError').textContent = '两次密码输入不一致';
    return;
  }

  try {
    await authAPI.register(username, email, password);
    document.getElementById('regError').innerHTML =
      '<div class="alert alert-success">注册成功！请登录</div>';
    setTimeout(() => navigate('/login'), 1000);
  } catch (err) {
    document.getElementById('regError').innerHTML =
      `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

// ==================== 文章列表页 ====================
async function renderPosts() {
  let postsHtml = '<p style="color:var(--text-muted);">加载中...</p>';

  try {
    const data = await postAPI.getList();
    if (data.posts.length === 0) {
      postsHtml = '<p style="color:var(--text-muted);text-align:center;padding:40px;">📝 还没有文章</p>';
    } else {
      postsHtml = data.posts
        .map(
          (p) => `
        <div class="card">
          <h3>${escapeHtml(p.title)}</h3>
          <p style="color:var(--text-muted);font-size:13px;margin-bottom:8px;">
            👤 ${escapeHtml(p.author)} · 🕒 ${formatDate(p.created_at)}
          </p>
          <p style="color:var(--text-muted);">${escapeHtml(p.content?.slice(0, 200) || '')}${p.content?.length > 200 ? '...' : ''}</p>
        </div>
      `
        )
        .join('');
    }
  } catch {
    postsHtml = '<p style="color:var(--danger);">加载失败，请确保后端服务已启动</p>';
  }

  return `
    <div class="container">
      <h2 class="section-title">📝 文章</h2>
      ${postsHtml}
    </div>
    <footer class="footer">
      <p>© 2026 jibuen | Built with ❤️</p>
    </footer>
  `;
}

// ==================== 留言板页 ====================
async function renderMessages() {
  let messagesHtml = '<p style="color:var(--text-muted);">加载中...</p>';

  try {
    const data = await messageAPI.getList();
    if (data.messages.length === 0) {
      messagesHtml = '<p style="color:var(--text-muted);text-align:center;padding:20px;">💬 还没有留言，来做第一个留言的人吧！</p>';
    } else {
      messagesHtml = data.messages
        .map(
          (m) => `
        <div class="message-item">
          <div class="msg-header">
            <span class="msg-name">${escapeHtml(m.name)}</span>
            <span class="msg-time">${formatDate(m.created_at)}</span>
          </div>
          <p class="msg-content">${escapeHtml(m.content)}</p>
        </div>
      `
        )
        .join('');
    }
  } catch {
    messagesHtml = '<p style="color:var(--danger);">加载失败，请确保后端服务已启动</p>';
  }

  return `
    <div class="container">
      <h2 class="section-title">💬 留言板</h2>
      <div class="card" style="margin-bottom:20px;">
        <form id="msgForm" onsubmit="return handleSendMessage(event)">
          <div class="form-group">
            <label>昵称</label>
            <input type="text" id="msgName" class="form-input" placeholder="你的昵称" required>
          </div>
          <div class="form-group">
            <label>邮箱（选填）</label>
            <input type="email" id="msgEmail" class="form-input" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>留言内容</label>
            <textarea id="msgContent" class="form-input" rows="3" placeholder="说点什么..." required></textarea>
          </div>
          <div id="msgError"></div>
          <button type="submit" class="btn btn-primary">发送留言</button>
        </form>
      </div>
      <div class="card">${messagesHtml}</div>
    </div>
    <footer class="footer">
      <p>© 2026 jibuen | Built with ❤️</p>
    </footer>
  `;
}

async function handleSendMessage(event) {
  event.preventDefault();
  const name = document.getElementById('msgName').value.trim();
  const email = document.getElementById('msgEmail').value.trim();
  const content = document.getElementById('msgContent').value.trim();

  if (!name || !content) return;

  try {
    await messageAPI.create(name, email, content);
    document.getElementById('msgForm').reset();
    render();
  } catch (err) {
    document.getElementById('msgError').innerHTML =
      `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

// ==================== 渲染入口 ====================
async function render() {
  const route = getCurrentRoute();
  const renderFn = routes[route];

  let pageHtml = '';
  if (typeof renderFn === 'function') {
    const result = renderFn();
    pageHtml = result instanceof Promise ? await result : result;
  }

  app.innerHTML = renderNavbar() + pageHtml;
}

// ==================== 全局函数暴露（给 onclick 用） ====================
window.navigate = navigate;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.handleSendMessage = handleSendMessage;

// ==================== 启动 ====================
window.addEventListener('popstate', render);
document.addEventListener('DOMContentLoaded', render);
