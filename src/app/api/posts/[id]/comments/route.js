import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const { content, parentId } = await request.json();

        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!content) {
            return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
        }

        const commentId = 'comment_' + Date.now().toString(36);

        await db.createDocument(DB_ID, COLS.comments, commentId, {
            content,
            postId: id,
            authorId: session.user.id,
            parentId: parentId || null,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, id: commentId });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
