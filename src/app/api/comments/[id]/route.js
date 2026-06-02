import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const id = (await params).id;
        const doc = await db.getDocument(DB_ID, COLS.comments, id);

        const isAdmin = session.user.role === 'ADMIN';
        const isAuthor = doc.authorId === session.user.id;
        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Delete replies first
        const replies = await listAll(COLS.comments, [Query.equal('parentId', id)]);
        await Promise.all(replies.map(r => db.deleteDocument(DB_ID, COLS.comments, r.$id)));
        await db.deleteDocument(DB_ID, COLS.comments, id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
