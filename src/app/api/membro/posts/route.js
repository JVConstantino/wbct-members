import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const userId = session.user.id;

        // Buscar postagens do usuário logado, incluindo contagem de comentários
        const posts = await query(`
            SELECT p.*, COUNT(c.id) as commentCount
            FROM Post p
            LEFT JOIN Comment c ON p.id = c.postId
            WHERE p.authorId = ?
            GROUP BY p.id
            ORDER BY p.createdAt DESC
        `, [userId]);

        return NextResponse.json({
            success: true,
            posts: posts.map(p => ({
                id: p.id,
                title: p.title,
                content: p.content,
                image: p.image,
                status: p.status,
                views: p.views || 0,
                commentCount: p.commentCount || 0,
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching my posts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
