const mysql = require('mysql2/promise');

async function createNotificationTable() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('Conectando ao banco de dados...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Notification (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(30) NOT NULL,
                type VARCHAR(50) NOT NULL,
                content TEXT,
                relatedId VARCHAR(255),
                isRead BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabela "Notification" criada/verificada');

        // Índices
        try {
            await connection.query('CREATE INDEX idx_notification_user ON Notification(userId, isRead)');
        } catch (e) {
            console.log('ℹ️  Índice já existe');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
    }
}

require('dotenv').config();
createNotificationTable();
