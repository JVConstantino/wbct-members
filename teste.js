const mysql = require('mysql2');

// Configurações fornecidas
const connection = mysql.createConnection({
    host: '162.241.60.102',
    user: 'wbctso41_membros_wbct',
    password: 'N4#vUS+dzl*@',
    database: 'wbctso41_membros',
    port: 3306
});

console.log('--- Iniciando teste de conexão ---');

connection.connect((err) => {
    if (err) {
        console.error('❌ FALHA NA CONEXÃO:', err.message);
        if (err.message.includes('Access denied')) {
            console.log('\nDICA: O IP 177.10.144.170 ainda não foi liberado no cPanel.');
        }
        process.exit(1);
    }

    console.log('✅ CONECTADO COM SUCESSO!');

    // Teste de consulta simples
    connection.query('SELECT NOW() as agora', (error, results) => {
        if (error) {
            console.error('❌ Erro na consulta:', error.message);
        } else {
            console.log('🕒 Hora no servidor do banco:', results[0].agora);
        }

        connection.end();
        console.log('--- Teste finalizado ---');
        process.exit(0);
    });
});