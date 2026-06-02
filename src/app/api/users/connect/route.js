import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { targetUserId } = await request.json();
        if (!targetUserId || targetUserId === session.user.id) {
            return NextResponse.json({ success: false, error: 'Invalid target' }, { status: 400 });
        }

        const docId = `conn_${session.user.id}_${targetUserId}`;

        try {
            await db.getDocument(DB_ID, COLS.connections, docId);
            // Exists → cancel request
            await db.deleteDocument(DB_ID, COLS.connections, docId);
            return NextResponse.json({ success: true, status: 'NONE' });
        } catch {
            // Doesn't exist → create request
            await db.createDocument(DB_ID, COLS.connections, docId, {
                requesterId: session.user.id,
                receiverId: targetUserId,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
            });
            return NextResponse.json({ success: true, status: 'PENDING' });
        }
    } catch (error) {
        console.error('Connect Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
