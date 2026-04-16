
const mysql = require('mysql2/promise');

async function testConnection() {
    const dbConfig = {
        host: '162.241.60.102',
        user: 'wbctso41_membros_wbct',
        password: 'N4#vUS+dzl*@',
        database: 'wbctso41_membros',
        port: 3306,
        connectTimeout: 10000 // 10 segundos de timeout
    };

    console.log('🚀 Iniciando teste de conexão direta com o MySQL...');
    console.log(`Configuração: Host=${dbConfig.host}, User=${dbConfig.user}, DB=${dbConfig.database}`);

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ SUCESSO: Conexão estabelecida com o banco de dados!');

        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📊 Tabelas encontradas no banco:', tables.map(t => Object.values(t)[0]));

        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM User');
        console.log('👥 Total de usuários (User):', userCount[0].count);

        await connection.end();
        console.log('🏁 Conexão encerrada com sucesso.');
    } catch (error) {
        console.error('❌ ERRO DE CONEXÃO:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);

        if (error.code === 'ETIMEDOUT') {
            console.error('Dica: O servidor não respondeu. Verifique se o IP do seu ambiente está liberado no firewall do servidor MySQL.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Dica: Usuário ou senha incorretos.');
        }
    }
}

testConnection();
