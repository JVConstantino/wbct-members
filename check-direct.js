
const mysql = require('mysql2/promise');

async function checkData() {
    const dbConfig = {
        host: '162.241.60.102',
        user: 'wbctso41_membros_wbct',
        password: 'N4#vUS+dzl*@',
        database: 'wbctso41_membros',
        port: 3306
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('--- TESTE DE CONEXÃO ---');

        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tabelas encontradas:', tables.map(t => Object.values(t)[0]));

        const [posts] = await connection.execute('SELECT COUNT(*) as count FROM Post');
        console.log('Total de Postagens:', posts[0].count);

        if (posts[0].count > 0) {
            const [sample] = await connection.execute('SELECT id, title, status FROM Post LIMIT 3');
            console.log('Amostra de Postagens:', sample);
        }

        const [events] = await connection.execute('SELECT COUNT(*) as count FROM Event');
        console.log('Total de Eventos:', events[0].count);

        if (events[0].count > 0) {
            const [sampleEvents] = await connection.execute('SELECT id, title, date FROM Event LIMIT 3');
            console.log('Amostra de Eventos:', sampleEvents);
        }

        await connection.end();
    } catch (error) {
        console.error('Erro ao acessar o banco:', error.message);
    }
}

checkData();
