import { query } from '../src/lib/db.js';

async function updateSchema() {
    console.log('📊 Atualizando esquema para analíticos...');
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS UserActivity (
                id VARCHAR(191) PRIMARY KEY,
                userId VARCHAR(191) NOT NULL,
                type VARCHAR(50) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
            )
        `);

        // Check if we have users to link activity to
        const users = await query('SELECT id FROM User LIMIT 2');
        if (users.length > 0) {
            const userId = users[0].id;
            console.log('📈 Gerando dados de atividade para testes...');

            // Inserir atividade de logins nos últimos 7 dias
            for (let i = 0; i < 7; i++) {
                const count = Math.floor(Math.random() * 5) + 2; // 2 a 6 logins por dia
                for (let j = 0; j < count; j++) {
                    const id = `login_${i}_${j}_${Date.now().toString(36)}`;
                    await query(`
                        INSERT INTO UserActivity (id, userId, type, createdAt) 
                        VALUES (?, ?, 'LOGIN', DATE_SUB(NOW(), INTERVAL ? DAY))
                    `, [id, userId, i]);
                }
            }
        }

        console.log('✅ Analíticos configurados!');
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
    process.exit(0);
}

updateSchema();
