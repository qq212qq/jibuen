-- ============================================
-- jibuen 数据库初始化脚本
-- 数据库：SQLite
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,           -- bcrypt 哈希
    avatar      VARCHAR(255) DEFAULT NULL,
    bio         TEXT         DEFAULT '',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       VARCHAR(200) NOT NULL,
    content     TEXT         NOT NULL,
    author_id   INTEGER      NOT NULL,
    status      VARCHAR(20)  DEFAULT 'published',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL,
    content     TEXT         NOT NULL,
    is_read     INTEGER      DEFAULT 0,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);
