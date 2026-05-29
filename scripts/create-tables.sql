-- Script para criar as tabelas do sistema de membros
-- Baseado no schema.prisma

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS User (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    image VARCHAR(500),
    bio TEXT,
    role ENUM('ADMIN', 'MEMBER') DEFAULT 'MEMBER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS Post (
    id VARCHAR(30) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    image VARCHAR(500),
    status ENUM('PENDING', 'APPROVED') DEFAULT 'PENDING',
    authorId VARCHAR(30) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES User(id) ON DELETE CASCADE
);

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS Comment (
    id VARCHAR(30) PRIMARY KEY,
    content TEXT NOT NULL,
    postId VARCHAR(30) NOT NULL,
    authorId VARCHAR(30) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES User(id) ON DELETE CASCADE
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS Event (
    id VARCHAR(30) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6',
    link VARCHAR(500),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela intermediária para relação User-Event (muitos para muitos)
CREATE TABLE IF NOT EXISTS _UserEvents (
    A VARCHAR(30) NOT NULL,
    B VARCHAR(30) NOT NULL,
    PRIMARY KEY (A, B),
    FOREIGN KEY (A) REFERENCES Event(id) ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES User(id) ON DELETE CASCADE
);

-- Tabela de Webinars
CREATE TABLE IF NOT EXISTS Webinar (
    id VARCHAR(30) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    videoUrl VARCHAR(500) NOT NULL,
    `order` INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_post_authorId ON Post(authorId);
CREATE INDEX idx_comment_postId ON Comment(postId);
CREATE INDEX idx_comment_authorId ON Comment(authorId);
CREATE INDEX idx_user_email ON User(email);
