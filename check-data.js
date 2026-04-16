
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
        console.log('--- ANÁLISE DE DADOS ---');

        const [posts] = await connection.execute("SELECT id, title, status, authorId FROM Post");
        console.log(`\nTotal de Postagens: ${posts.length}`);
        posts.forEach(p => console.log(`- [${p.status}] ID: ${p.id} | Título: ${p.title} | Autor: ${p.authorId}`));

        const [events] = await connection.execute("SELECT id, title, date FROM Event");
        console.log(`\nTotal de Eventos: ${events.length}`);
        events.forEach(e => console.log(`- ID: ${e.id} | Título: ${e.title} | Data: ${e.date}`));

        const [users] = await connection.execute("SELECT id, name, role FROM User");
        console.log(`\nTotal de Usuários: ${users.length}`);
        users.forEach(u => console.log(`- ID: ${u.id} | Nome: ${u.name} | Role: ${u.role}`));

        await connection.end();
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

checkData();
