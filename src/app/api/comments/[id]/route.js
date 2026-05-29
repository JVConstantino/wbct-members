import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const id = (await params).id;
        const rows = await query('SELECT authorId FROM Comment WHERE id = ?', [id]);
        if (!rows.length) {
            return NextResponse.json({ success: false, error: 'Comentário não encontrado' }, { status: 404 });
        }

        const isAdmin = session.user.role === 'ADMIN';
        const isAuthor = rows[0].authorId === session.user.id;
        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 });
        }

        await query('DELETE FROM Comment WHERE id = ? OR parentId = ?', [id, id]).catch(async () => {
            await query('DELETE FROM Comment WHERE id = ?', [id]);
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
