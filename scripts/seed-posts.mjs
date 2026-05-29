import { query } from '../src/lib/db.js';

async function seedPosts() {
    console.log('📝 Semeando postagens de teste...');

    try {
        // Obter um usuário (membro) para ser o autor
        const members = await query('SELECT id FROM User LIMIT 1');

        if (members.length === 0) {
            console.log('❌ Nenhum usuário encontrado para ser autor das postagens.');
            return;
        }

        const authorId = members[0].id;

        const testPosts = [
            {
                id: 'post_1',
                title: 'Dicas de Produtividade em 2026',
                content: 'Neste post, exploramos as melhores ferramentas de IA para aumentar sua produtividade diária em até 50%.',
                image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=400',
                status: 'PENDING',
                authorId: authorId
            },
            {
                id: 'post_2',
                title: 'O Futuro do Desenvolvimento Web',
                content: 'Como os novos frameworks estão mudando a forma como construímos interfaces modernas e rápidas.',
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400',
                status: 'APPROVED',
                authorId: authorId
            }
        ];

        for (const post of testPosts) {
            // Verificar se já existe
            const existing = await query('SELECT id FROM Post WHERE id = ?', [post.id]);

            if (existing.length === 0) {
                await query(`
                    INSERT INTO Post (id, title, content, image, status, authorId, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [post.id, post.title, post.content, post.image, post.status, post.authorId]);
                console.log(`   ✅ Postagem criada: ${post.title}`);
            } else {
                console.log(`   ℹ️ Postagem já existe: ${post.title}`);
            }
        }

        console.log('\n✅ Semeação de postagens concluída!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }

    process.exit(0);
}

seedPosts();
