const mysql = require('mysql2/promise');

async function createSocialTables() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('Conectando ao banco de dados...');

        // Tabela de Seguidores
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Follows (
                followerId VARCHAR(30) NOT NULL,
                followingId VARCHAR(30) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (followerId, followingId),
                FOREIGN KEY (followerId) REFERENCES User(id) ON DELETE CASCADE,
                FOREIGN KEY (followingId) REFERENCES User(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabela "Follows" criada/verificada');

        // Tabela de Mensagens
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Message (
                id VARCHAR(36) PRIMARY KEY,
                senderId VARCHAR(30) NOT NULL,
                receiverId VARCHAR(30) NOT NULL,
                content TEXT NOT NULL,
                readAt DATETIME DEFAULT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (senderId) REFERENCES User(id) ON DELETE CASCADE,
                FOREIGN KEY (receiverId) REFERENCES User(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabela "Message" criada/verificada');

        // Índices - Tratamento de erro se já existirem
        try {
            await connection.query('CREATE INDEX idx_message_sender ON Message(senderId)');
            console.log('✅ Índice de remetente criado');
        } catch (e) {
            console.log('ℹ️  Índice de remetente já existe');
        }

        try {
            await connection.query('CREATE INDEX idx_message_receiver ON Message(receiverId)');
            console.log('✅ Índice de destinatário criado');
        } catch (e) {
            console.log('ℹ️  Índice de destinatário já existe');
        }

        console.log('\n🎉 Tabelas sociais criadas com sucesso!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
    }
}

require('dotenv').config();
createSocialTables();
