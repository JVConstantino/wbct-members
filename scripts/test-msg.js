const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function testSendMessage() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        // Pegar dois usuários
        const [users] = await connection.query('SELECT id, name FROM User LIMIT 2');
        if (users.length < 2) {
            console.log('Preciso de 2 usuários para testar');
            return;
        }

        const sender = users[0];
        const receiver = users[1];

        console.log(`Enviando de ${sender.name} (${sender.id}) para ${receiver.name} (${receiver.id})`);

        const id = uuidv4();
        await connection.query(`
            INSERT INTO Message (id, senderId, receiverId, content) 
            VALUES (?, ?, ?, ?)
        `, [id, sender.id, receiver.id, 'Teste de mensagem via script']);

        console.log('✅ Mensagem enviada com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    } finally {
        await connection.end();
    }
}

require('dotenv').config();
testSendMessage();
