import { query } from '../src/lib/db.js';

async function seedMoreActivity() {
    console.log('📊 Gerando dados de atividade mais realistas...');
    try {
        // Buscar todos os usuários
        const users = await query('SELECT id FROM User');
        if (users.length === 0) {
            console.log('⚠️ Nenhum usuário encontrado');
            process.exit(0);
        }

        console.log(`📈 Inserindo atividade para ${users.length} usuários...`);

        // Limpar dados antigos de atividade
        await query('DELETE FROM UserActivity');

        // Para cada dia dos últimos 7 dias
        for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
            // Cada usuário tem chance de ter logado
            for (const user of users) {
                // 60-90% chance de login por dia
                const willLogin = Math.random() > 0.15;
                if (willLogin) {
                    // 1-3 logins por dia por usuário
                    const loginCount = Math.floor(Math.random() * 3) + 1;
                    for (let j = 0; j < loginCount; j++) {
                        const id = `login_${daysAgo}_${user.id.slice(0, 6)}_${j}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
                        await query(`
                            INSERT INTO UserActivity (id, userId, type, createdAt) 
                            VALUES (?, ?, 'LOGIN', DATE_SUB(NOW(), INTERVAL ? DAY))
                        `, [id, user.id, daysAgo]);
                    }
                }
            }
        }

        // Atualizar lastActiveAt de alguns usuários para parecer que estão online
        console.log('🟢 Marcando usuários como ativos...');
        await query(`UPDATE User SET lastActiveAt = NOW() WHERE id = ?`, [users[0].id]);
        if (users.length > 1) {
            await query(`UPDATE User SET lastActiveAt = DATE_SUB(NOW(), INTERVAL 2 MINUTE) WHERE id = ?`, [users[1].id]);
        }
        if (users.length > 2) {
            await query(`UPDATE User SET lastActiveAt = DATE_SUB(NOW(), INTERVAL 3 MINUTE) WHERE id = ?`, [users[2].id]);
        }

        // Contar dados gerados
        const [activityCount] = await query('SELECT COUNT(*) as count FROM UserActivity');
        const [onlineCount] = await query('SELECT COUNT(*) as count FROM User WHERE lastActiveAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)');

        console.log(`✅ ${activityCount.count} registros de atividade criados`);
        console.log(`✅ ${onlineCount.count} usuários marcados como online`);
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
    process.exit(0);
}

seedMoreActivity();
