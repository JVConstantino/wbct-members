// Script para verificar as colunas da tabela User
const mysql = require('mysql2/promise');

async function checkColumns() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'wbctso41_membros' AND TABLE_NAME = 'User'
        `);

        console.log('Colunas da tabela User:');
        columns.forEach(c => console.log(`  - ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        await connection.end();
    }
}

require('dotenv').config();
checkColumns();
