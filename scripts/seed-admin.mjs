import { query } from '../src/lib/db.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    console.log('🌱 Criando usuário administrador...\n');

    try {
        // Gerar ID único
        const id = 'admin_' + Date.now().toString(36);

        // Hash da senha
        const password = await bcrypt.hash('admin123', 10);

        // Verificar se já existe um admin
        const existing = await query('SELECT id FROM User WHERE role = ?', ['ADMIN']);

        if (existing.length > 0) {
            console.log('⚠️ Já existe um administrador no sistema.');
            console.log('   Email: admin@sistema.com');
            console.log('   Senha: admin123');
            process.exit(0);
        }

        // Inserir admin
        await query(`
            INSERT INTO User (id, name, email, password, role) 
            VALUES (?, ?, ?, ?, ?)
        `, [id, 'Administrador', 'admin@sistema.com', password, 'ADMIN']);

        console.log('✅ Administrador criado com sucesso!');
        console.log('\n📧 Email: admin@sistema.com');
        console.log('🔑 Senha: admin123');
        console.log('\n⚠️ Importante: Altere a senha após o primeiro login!');

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error.message);
    }

    process.exit(0);
}

seedAdmin();
