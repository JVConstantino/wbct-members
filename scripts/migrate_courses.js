const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log('Iniciando migração...');

    try {
        // Criar tabela Course
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Course (
                id VARCHAR(191) PRIMARY KEY,
                title VARCHAR(191) NOT NULL,
                description TEXT,
                image VARCHAR(191),
                createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            )
        `);
        console.log('Tabela Course criada ou já existe.');

        // Criar tabela Lesson
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Lesson (
                id VARCHAR(191) PRIMARY KEY,
                title VARCHAR(191) NOT NULL,
                description TEXT,
                videoUrl VARCHAR(191) NOT NULL,
                \`order\` INT DEFAULT 0,
                courseId VARCHAR(191) NOT NULL,
                createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (courseId) REFERENCES Course(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabela Lesson criada ou já existe.');

        // Criar tabela LessonAttachment
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS LessonAttachment (
                id VARCHAR(191) PRIMARY KEY,
                title VARCHAR(191) NOT NULL,
                url VARCHAR(191) NOT NULL,
                type VARCHAR(191) NOT NULL,
                lessonId VARCHAR(191) NOT NULL,
                createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
                FOREIGN KEY (lessonId) REFERENCES Lesson(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabela LessonAttachment criada ou já existe.');

        // Criar tabela LessonProgress
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS LessonProgress (
                id VARCHAR(191) PRIMARY KEY,
                userId VARCHAR(191) NOT NULL,
                lessonId VARCHAR(191) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                completedAt DATETIME(3),
                updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
                FOREIGN KEY (lessonId) REFERENCES Lesson(id) ON DELETE CASCADE,
                UNIQUE KEY LessonProgress_userId_lessonId_key (userId, lessonId)
            )
        `);
        console.log('Tabela LessonProgress criada ou já existe.');

        console.log('Migração concluída com sucesso!');
    } catch (error) {
        console.error('Erro na migração:', error);
    } finally {
        await connection.end();
    }
}

migrate();
