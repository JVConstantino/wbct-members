
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testEnv() {
    const url = process.env.DATABASE_URL;
    console.log('URL do .env:', url);

    if (!url) {
        console.error('DATABASE_URL não encontrada no .env');
        return;
    }

    try {
        // Parse da URL manual (simples)
        // mysql://user:pass@host:port/db
        const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
        const match = url.match(regex);

        if (!match) {
            console.error('Formato de DATABASE_URL inválido');
            return;
        }

        const [_, user, pass, host, port, db] = match;

        // Decodificar componentes da URL
        const decodedPass = decodeURIComponent(pass);

        console.log('Tentando conectar com:');
        console.log(`Host: ${host}`);
        console.log(`User: ${user}`);
        console.log(`Password (decodificada): ${decodedPass}`);
        console.log(`DB: ${db}`);

        const connection = await mysql.createConnection({
            host,
            user,
            password: decodedPass,
            database: db,
            port: parseInt(port)
        });

        console.log('✅ SUCESSO: Conexão via .env estabelecida!');
        await connection.end();
    } catch (error) {
        console.error('❌ ERRO:', error.message);
    }
}

testEnv();
