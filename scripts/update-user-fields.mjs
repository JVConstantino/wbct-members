import { query } from '../src/lib/db.js';

async function updateSchema() {
    console.log('🩺 Adicionando campos médicos ao perfil do usuário...');
    try {
        const columns = await query('SHOW COLUMNS FROM User');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('crm')) {
            await query('ALTER TABLE User ADD COLUMN crm VARCHAR(50)');
            console.log('   ✅ Coluna "crm" adicionada.');
        }

        if (!columnNames.includes('specialty')) {
            await query('ALTER TABLE User ADD COLUMN specialty VARCHAR(100)');
            console.log('   ✅ Coluna "specialty" adicionada.');
        }

        console.log('✅ Verificação concluída!');
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
    process.exit(0);
}

updateSchema();
