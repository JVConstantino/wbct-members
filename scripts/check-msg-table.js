const mysql = require('mysql2/promise');

async function checkMessageTable() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        const [rows] = await connection.query('DESCRIBE Message');
        console.log('Estrutura da tabela Message:', rows);
    } catch (error) {
        console.error('Erro ao verificar tabela:', error.message);
    } finally {
        await connection.end();
    }
}

require('dotenv').config();
checkMessageTable();
