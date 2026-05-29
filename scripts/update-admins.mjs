import { query } from '../src/lib/db.js';
import bcrypt from 'bcryptjs';

async function updateAdmins() {
    console.log('🔧 Atualizando administradores...\n');

    try {
        // 1. Atualizar o admin existente
        console.log('📝 Atualizando admin existente...');
        const newPassword1 = await bcrypt.hash('Lets291224#', 10);

        await query(`
            UPDATE User 
            SET email = ?, password = ?, name = ?
            WHERE role = 'ADMIN'
        `, ['constantino.dev.br@gmail.com', newPassword1, 'Constantino']);

        console.log('   ✅ Admin atualizado:');
        console.log('      Email: constantino.dev.br@gmail.com');
        console.log('      Senha: Lets291224#');

        // 2. Criar segundo admin
        console.log('\n📝 Criando segundo admin...');
        const id2 = 'admin_' + Date.now().toString(36) + '_2';
        const newPassword2 = await bcrypt.hash('2026#criativa', 10);

        // Verificar se já existe
        const existing = await query('SELECT id FROM User WHERE email = ?', ['agenciacriativadigital@gmail.com']);

        if (existing.length > 0) {
            // Atualizar existente
            await query(`
                UPDATE User 
                SET password = ?, role = 'ADMIN', name = ?
                WHERE email = ?
            `, [newPassword2, 'Agência Criativa Digital', 'agenciacriativadigital@gmail.com']);
        } else {
            // Criar novo
            await query(`
                INSERT INTO User (id, name, email, password, role) 
                VALUES (?, ?, ?, ?, ?)
            `, [id2, 'Agência Criativa Digital', 'agenciacriativadigital@gmail.com', newPassword2, 'ADMIN']);
        }

        console.log('   ✅ Segundo admin criado:');
        console.log('      Email: agenciacriativadigital@gmail.com');
        console.log('      Senha: 2026#criativa');

        // Listar todos os admins
        console.log('\n📋 Administradores no sistema:');
        const admins = await query('SELECT id, name, email, role FROM User WHERE role = ?', ['ADMIN']);
        admins.forEach((admin, i) => {
            console.log(`   ${i + 1}. ${admin.name} (${admin.email})`);
        });

        console.log('\n✅ Operação concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }

    process.exit(0);
}

updateAdmins();
