import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await db.updateDocument(DB_ID, COLS.users, session.user.id, {
            lastActiveAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating activity:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const res = await db.listDocuments(DB_ID, COLS.users, [
            Query.greaterThanEqual('lastActiveAt', fiveMinutesAgo),
            Query.limit(1),
        ]);
        return NextResponse.json({ success: true, online: res.total });
    } catch (error) {
        console.error('Error fetching online users:', error);
        return NextResponse.json({ success: true, online: 0 });
    }
}
