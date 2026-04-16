import { query, testConnection } from '../src/lib/db.js';

async function checkAndFixTables() {
    console.log('🔍 Verificando estrutura do banco de dados...');

    try {
        // Testar conexão
        const connected = await testConnection();
        if (!connected) {
            console.log('❌ Não foi possível conectar ao banco');
            process.exit(1);
        }

        // Verificar se a coluna lastActiveAt existe na tabela User
        console.log('\n📋 Verificando coluna lastActiveAt na tabela User...');
        const columns = await query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'User' AND COLUMN_NAME = 'lastActiveAt'
        `);

        if (columns.length === 0) {
            console.log('⚠️ Coluna lastActiveAt não existe. Criando...');
            await query('ALTER TABLE User ADD COLUMN lastActiveAt DATETIME DEFAULT NULL');
            console.log('✅ Coluna lastActiveAt criada');
        } else {
            console.log('✅ Coluna lastActiveAt existe');
        }

        // Verificar se a tabela UserActivity existe
        console.log('\n📋 Verificando tabela UserActivity...');
        const tables = await query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'UserActivity'
        `);

        if (tables.length === 0) {
            console.log('⚠️ Tabela UserActivity não existe. Criando...');
            await query(`
                CREATE TABLE UserActivity (
                    id VARCHAR(191) PRIMARY KEY,
                    userId VARCHAR(191) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Tabela UserActivity criada');
        } else {
            console.log('✅ Tabela UserActivity existe');
        }

        // Contar registros
        const [userCount] = await query('SELECT COUNT(*) as count FROM User');
        const [activityCount] = await query('SELECT COUNT(*) as count FROM UserActivity');

        console.log(`\n📊 Resumo:`);
        console.log(`   - Usuários: ${userCount.count}`);
        console.log(`   - Registros de atividade: ${activityCount.count}`);

        console.log('\n✅ Verificação concluída!');
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
    process.exit(0);
}

checkAndFixTables();
