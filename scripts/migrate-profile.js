// Script para adicionar colunas de perfil médico ao banco de dados
const mysql = require('mysql2/promise');

async function addProfileColumns() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('Conectando ao banco de dados...');

        // Verificar se as colunas já existem
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'wbctso41_membros' AND TABLE_NAME = 'User'
        `);

        const existingColumns = columns.map(c => c.COLUMN_NAME);
        console.log('Colunas existentes:', existingColumns);

        // Adicionar colunas que não existem
        if (!existingColumns.includes('stack')) {
            await connection.query('ALTER TABLE User ADD COLUMN stack VARCHAR(255) DEFAULT NULL');
            console.log('✅ Coluna "stack" adicionada');
        } else {
            console.log('⏭️  Coluna "stack" já existe');
        }

        if (!existingColumns.includes('crm')) {
            await connection.query('ALTER TABLE User ADD COLUMN crm VARCHAR(50) DEFAULT NULL');
            console.log('✅ Coluna "crm" adicionada');
        } else {
            console.log('⏭️  Coluna "crm" já existe');
        }

        if (!existingColumns.includes('specialty')) {
            await connection.query('ALTER TABLE User ADD COLUMN specialty VARCHAR(255) DEFAULT NULL');
            console.log('✅ Coluna "specialty" adicionada');
        } else {
            console.log('⏭️  Coluna "specialty" já existe');
        }

        console.log('\n🎉 Migração concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
    }
}

require('dotenv').config();
addProfileColumns();
