import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { requesterId, action } = await request.json();
        if (!requesterId || !['accept', 'reject'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
        }

        const docId = `conn_${requesterId}_${session.user.id}`;

        if (action === 'accept') {
            await db.updateDocument(DB_ID, COLS.connections, docId, { status: 'ACCEPTED' });
        } else {
            await db.deleteDocument(DB_ID, COLS.connections, docId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
