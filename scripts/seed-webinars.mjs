import { query } from '../src/lib/db.js';

async function seedWebinars() {
    console.log('🎬 Semeando webinars de teste...');

    try {
        const testWebinars = [
            {
                id: 'web_1',
                title: 'Aula Inaugural: Mentalidade de Sucesso',
                description: 'Nesta aula discutimos os pilares para construir um negócio digital sólido e escalável.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rickroll as placeholder
                order: 1
            },
            {
                id: 'web_2',
                title: 'Estratégias de Tráfego Pago 2026',
                description: 'Aprenda como dominar os novos algoritmos e reduzir seu CAC drasticamente.',
                videoUrl: 'https://www.youtube.com/watch?v=tgbNymZ7vqY',
                order: 2
            }
        ];

        for (const web of testWebinars) {
            const existing = await query('SELECT id FROM Webinar WHERE id = ?', [web.id]);

            if (existing.length === 0) {
                await query(`
                    INSERT INTO Webinar (id, title, description, videoUrl, \`order\`, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                `, [web.id, web.title, web.description, web.videoUrl, web.order]);
                console.log(`   ✅ Webinar criado: ${web.title}`);
            } else {
                console.log(`   ℹ️ Webinar já existe: ${web.title}`);
            }
        }

        console.log('\n✅ Semeação de webinars concluída!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }

    process.exit(0);
}

seedWebinars();
