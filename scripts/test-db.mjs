// Teste de conexão com o banco usando a nova lib
import { testConnection, query } from '../src/lib/db.js';

async function main() {
    console.log('--- Testando nova configuração de banco ---\n');

    // Teste 1: Conexão básica
    const connected = await testConnection();

    if (!connected) {
        console.log('\n❌ Não foi possível conectar ao banco.');
        process.exit(1);
    }

    // Teste 2: Query simples
    try {
        const result = await query('SELECT NOW() as agora, DATABASE() as banco');
        console.log('📊 Informações do banco:');
        console.log('   - Hora do servidor:', result[0].agora);
        console.log('   - Banco conectado:', result[0].banco);

        // Teste 3: Verificar tabelas existentes
        const tables = await query('SHOW TABLES');
        console.log('\n📋 Tabelas no banco:', tables.length > 0 ? '' : '(nenhuma tabela encontrada)');
        tables.forEach((table, i) => {
            const tableName = Object.values(table)[0];
            console.log(`   ${i + 1}. ${tableName}`);
        });

        console.log('\n✅ Tudo funcionando corretamente!');
    } catch (error) {
        console.error('❌ Erro ao executar queries:', error.message);
    }

    process.exit(0);
}

main();
