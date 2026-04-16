
const mysql = require('mysql2/promise');

async function testConnection() {
    // Decodificando a senha da URL: N4%23vUS%2Bdzl*%40
    // %23 = #
    // %2B = +
    // %40 = @
    // Resultado: N4#vUS+dzl*@

    const dbConfig = {
        host: '162.241.60.102',
        user: 'wbctso41_membros_wbct',
        password: 'N4#vUS+dzl*@',
        database: 'wbctso41_membros',
        port: 3306
    };

    console.log('🚀 Testando conexão com credenciais decodificadas...');

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ SUCESSO: Conexão direta via node estabelecida!');

        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📊 Tabelas:', tables.map(t => Object.values(t)[0]));

        await connection.end();
    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.error('Código:', error.code);
    }
}

testConnection();
