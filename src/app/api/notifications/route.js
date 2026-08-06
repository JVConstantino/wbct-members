import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const res = await db.listDocuments(DB_ID, COLS.notifications, [
            Query.equal('userId', session.user.id),
            Query.orderDesc('createdAt'),
            Query.limit(20),
        ]);

        const notifications = res.documents.map(d => ({
            id: d.$id,
            type: d.type,
            content: d.content,
            relatedId: d.relatedId,
            isRead: d.isRead,
            createdAt: d.createdAt,
        }));

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error('Notification Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const unread = await listAll(COLS.notifications, [
            Query.equal('userId', session.user.id),
            Query.equal('isRead', 0),
        ]);

        await Promise.all(
            unread.map(d => db.updateDocument(DB_ID, COLS.notifications, d.$id, { isRead: 1 }))
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
