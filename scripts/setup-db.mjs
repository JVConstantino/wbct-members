import { query } from '../src/lib/db.js';

async function createTables() {
    console.log('🔧 Criando tabelas no banco de dados...\n');

    try {
        // Tabela User
        console.log('📋 Criando tabela User...');
        await query(`
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
            )
        `);
        console.log('   ✅ User criada');

        // Tabela Post
        console.log('📋 Criando tabela Post...');
        await query(`
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
            )
        `);
        console.log('   ✅ Post criada');

        // Tabela Comment
        console.log('📋 Criando tabela Comment...');
        await query(`
            CREATE TABLE IF NOT EXISTS Comment (
                id VARCHAR(30) PRIMARY KEY,
                content TEXT NOT NULL,
                postId VARCHAR(30) NOT NULL,
                authorId VARCHAR(30) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE,
                FOREIGN KEY (authorId) REFERENCES User(id) ON DELETE CASCADE
            )
        `);
        console.log('   ✅ Comment criada');

        // Tabela Event
        console.log('📋 Criando tabela Event...');
        await query(`
            CREATE TABLE IF NOT EXISTS Event (
                id VARCHAR(30) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                date DATETIME NOT NULL,
                color VARCHAR(20) DEFAULT '#3b82f6',
                link VARCHAR(500),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('   ✅ Event criada');

        // Tabela intermediária User-Event
        console.log('📋 Criando tabela _UserEvents...');
        await query(`
            CREATE TABLE IF NOT EXISTS _UserEvents (
                A VARCHAR(30) NOT NULL,
                B VARCHAR(30) NOT NULL,
                PRIMARY KEY (A, B),
                FOREIGN KEY (A) REFERENCES Event(id) ON DELETE CASCADE,
                FOREIGN KEY (B) REFERENCES User(id) ON DELETE CASCADE
            )
        `);
        console.log('   ✅ _UserEvents criada');

        // Tabela Webinar
        console.log('📋 Criando tabela Webinar...');
        await query(`
            CREATE TABLE IF NOT EXISTS Webinar (
                id VARCHAR(30) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                videoUrl VARCHAR(500) NOT NULL,
                \`order\` INT DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('   ✅ Webinar criada');

        // Criar índices
        console.log('\n📊 Criando índices...');
        try {
            await query('CREATE INDEX idx_post_authorId ON Post(authorId)');
            console.log('   ✅ Índice idx_post_authorId');
        } catch (e) {
            if (!e.message.includes('Duplicate')) console.log('   ⚠️ idx_post_authorId já existe');
        }

        try {
            await query('CREATE INDEX idx_comment_postId ON Comment(postId)');
            console.log('   ✅ Índice idx_comment_postId');
        } catch (e) {
            if (!e.message.includes('Duplicate')) console.log('   ⚠️ idx_comment_postId já existe');
        }

        try {
            await query('CREATE INDEX idx_comment_authorId ON Comment(authorId)');
            console.log('   ✅ Índice idx_comment_authorId');
        } catch (e) {
            if (!e.message.includes('Duplicate')) console.log('   ⚠️ idx_comment_authorId já existe');
        }

        console.log('\n✅ Todas as tabelas foram criadas com sucesso!');

        // Listar tabelas criadas
        const tables = await query('SHOW TABLES');
        console.log('\n📋 Tabelas no banco:');
        tables.forEach((t, i) => {
            console.log(`   ${i + 1}. ${Object.values(t)[0]}`);
        });

    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error.message);
    }

    process.exit(0);
}

createTables();
