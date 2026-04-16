import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET - Listar postagens
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let sql = `
            SELECT p.*, u.name as authorName, u.email as authorEmail 
            FROM Post p 
            JOIN User u ON p.authorId = u.id
        `;
        let params = [];

        if (status) {
            sql += ' WHERE p.status = ?';
            params = [status];
        }

        sql += ' ORDER BY p.createdAt DESC';

        const posts = await query(sql, params);

        return NextResponse.json({
            success: true,
            posts: posts.map(p => ({
                id: p.id,
                title: p.title,
                content: p.content,
                image: p.image,
                status: p.status,
                views: p.views || 0,
                author: {
                    name: p.authorName,
                    email: p.authorEmail
                },
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH - Atualizar status da postagem (Aprovar/Reprovar)
export async function PATCH(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Apenas administradores podem moderar postagens' }, { status: 403 });
        }

        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: 'ID e Status são obrigatórios' }, { status: 400 });
        }

        await query('UPDATE Post SET status = ? WHERE id = ?', [status, id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remover postagem
export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });
        }

        // Se não for ADMIN, verificar se é o autor (opcional, mas bom pra segurança)
        if (session.user.role !== 'ADMIN') {
            const post = await query('SELECT authorId FROM Post WHERE id = ?', [id]);
            if (post[0]?.authorId !== session.user.id) {
                return NextResponse.json({ success: false, error: 'Sem permissão para excluir esta postagem' }, { status: 403 });
            }
        }

        await query('DELETE FROM Post WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
// POST - Criar nova postagem
export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { title, content, image } = await request.json();

        if (!title || !content) {
            return NextResponse.json({ success: false, error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
        }

        const id = 'post_' + Date.now().toString(36);
        const authorId = session.user.id;
        const status = session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

        await query(`
            INSERT INTO Post (id, title, content, image, status, authorId, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [id, title, content, image || null, status, authorId]);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
