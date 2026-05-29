import { query } from '../src/lib/db.js';

async function addOnlineTracking() {
    console.log('🔌 Adicionando suporte para tracking de usuários online...');
    try {
        // Verificar se a coluna já existe
        const columns = await query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'User' AND COLUMN_NAME = 'lastActiveAt'
        `);

        if (columns.length === 0) {
            console.log('📝 Adicionando coluna lastActiveAt...');
            await query(`
                ALTER TABLE User 
                ADD COLUMN lastActiveAt DATETIME DEFAULT NULL
            `);
            console.log('✓ Coluna adicionada');
        } else {
            console.log('✓ Coluna lastActiveAt já existe');
        }

        // Criar índice para busca rápida de usuários online
        try {
            await query(`
                CREATE INDEX idx_user_last_active ON User(lastActiveAt)
            `);
            console.log('✓ Índice criado');
        } catch (e) {
            console.log('✓ Índice já existe');
        }

        // Atualizar lastActiveAt para usuários existentes com data atual
        const result = await query(`
            UPDATE User SET lastActiveAt = NOW() WHERE lastActiveAt IS NULL
        `);
        console.log(`✓ ${result.affectedRows || 0} usuários atualizados`);

        console.log('✅ Tracking de usuários online configurado!');
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
    process.exit(0);
}

addOnlineTracking();
