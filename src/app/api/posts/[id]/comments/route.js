import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const { content } = await request.json();

        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const authorId = session.user.id;

        if (!content) {
            return NextResponse.json({ success: false, error: 'Conteúdo é obrigatório' }, { status: 400 });
        }

        const commentId = 'comment_' + Date.now().toString(36);

        await query(`
            INSERT INTO Comment (id, content, postId, authorId, createdAt) 
            VALUES (?, ?, ?, ?, NOW())
        `, [commentId, content, id, authorId]);

        return NextResponse.json({ success: true, id: commentId });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
