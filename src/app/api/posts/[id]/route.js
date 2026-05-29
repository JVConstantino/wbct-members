import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const id = (await params).id;

        const posts = await query(`
            SELECT p.*, u.name as authorName, u.email as authorEmail, u.image as authorImage
            FROM Post p 
            JOIN User u ON p.authorId = u.id
            WHERE p.id = ?
        `, [id]);

        if (posts.length === 0) {
            return NextResponse.json({ success: false, error: 'Postagem não encontrada' }, { status: 404 });
        }

        const post = posts[0];

        await query('ALTER TABLE Comment ADD COLUMN parentId VARCHAR(191) NULL').catch(() => {});

        // Se o post não estiver aprovado, apenas o autor ou admin pode ver o detalhe completo via esta rota
        // (Isso protege o acesso a posts pendentes)
        const session = await auth();
        if (post.status !== 'APPROVED') {
            if (!session?.user || (session.user.id !== post.authorId && session.user.role !== 'ADMIN')) {
                return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 });
            }
        }

        // Incrementar visualizações
        if (post.status === 'APPROVED') {
            try {
                await query('UPDATE Post SET views = views + 1 WHERE id = ?', [id]);
            } catch (e) {
                console.warn("Could not increment views:", e.message);
            }
        }

        // Buscar comentários
        let comments = [];
        try {
            comments = await query(`
                SELECT c.*, u.name as authorName, u.image as authorImage, c.parentId
                FROM Comment c
                JOIN User u ON c.authorId = u.id
                WHERE c.postId = ?
                ORDER BY c.createdAt DESC
            `, [id]);
        } catch {
            comments = await query(`
                SELECT c.*, u.name as authorName, u.image as authorImage
                FROM Comment c
                JOIN User u ON c.authorId = u.id
                WHERE c.postId = ?
                ORDER BY c.createdAt DESC
            `, [id]);
            comments = comments.map((c) => ({ ...c, parentId: null }));
        }

        return NextResponse.json({
            success: true,
            post: {
                ...post,
                author: {
                    name: post.authorName,
                    email: post.authorEmail,
                    image: post.authorImage
                },
                comments: comments
            }
        });
    } catch (error) {
        console.error('Error fetching post detail:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const id = (await params).id;
        const { title, content, image } = await request.json();

        // Verificar se é o autor ou admin
        const post = await query('SELECT authorId FROM Post WHERE id = ?', [id]);
        if (post.length === 0) {
            return NextResponse.json({ success: false, error: 'Post não encontrado' }, { status: 404 });
        }

        if (post[0].authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 });
        }

        // Se for membro, o post volta para PENDING ao editar
        const status = session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

        await query(`
            UPDATE Post 
            SET title = ?, content = ?, image = ?, status = ?, updatedAt = NOW()
            WHERE id = ?
        `, [title, content, image, status, id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
