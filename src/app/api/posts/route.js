import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

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

        const { id, ids, status } = await request.json();

        if ((!id && (!Array.isArray(ids) || !ids.length)) || !status) {
            return NextResponse.json({ success: false, error: 'ID(s) e Status são obrigatórios' }, { status: 400 });
        }

        const targetIds = Array.isArray(ids) && ids.length ? ids : [id];
        const placeholders = targetIds.map(() => '?').join(',');
        await query(`UPDATE Post SET status = ? WHERE id IN (${placeholders})`, [status, ...targetIds]);

        try {
            const authors = await query(
                `SELECT p.title, u.email FROM Post p JOIN User u ON u.id = p.authorId WHERE p.id IN (${placeholders})`,
                targetIds
            );
            const subject = status === 'APPROVED' ? 'Sua postagem foi aprovada' : 'Atualização sobre sua postagem';
            for (const row of authors) {
                await sendEmail({
                    to: row.email,
                    subject,
                    html: `<p>Olá! A postagem <strong>${row.title}</strong> foi atualizada para o status <strong>${status}</strong>.</p>`
                });
            }
        } catch (e) {
            console.error('Email notification error:', e);
        }

        return NextResponse.json({ success: true, affected: targetIds.length });
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
        const idsParam = searchParams.get('ids');
        const ids = idsParam ? idsParam.split(',').map(v => v.trim()).filter(Boolean) : [];

        if (!id && !ids.length) {
            return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });
        }

        const targetIds = ids.length ? ids : [id];
        const placeholders = targetIds.map(() => '?').join(',');

        // Se não for ADMIN, verificar se é o autor (opcional, mas bom pra segurança)
        if (session.user.role !== 'ADMIN') {
            const rows = await query(`SELECT id, authorId FROM Post WHERE id IN (${placeholders})`, targetIds);
            const forbidden = rows.some((post) => post.authorId !== session.user.id);
            if (forbidden || rows.length !== targetIds.length) {
                return NextResponse.json({ success: false, error: 'Sem permissão para excluir esta postagem' }, { status: 403 });
            }
        }

        await query(`DELETE FROM Post WHERE id IN (${placeholders})`, targetIds);

        return NextResponse.json({ success: true, affected: targetIds.length });
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
