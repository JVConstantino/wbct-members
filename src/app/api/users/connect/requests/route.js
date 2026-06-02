import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const pending = await listAll(COLS.connections, [
            Query.equal('receiverId', session.user.id),
            Query.equal('status', 'PENDING'),
        ]);

        const requests = (await Promise.all(
            pending.map(async (c) => {
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, c.requesterId);
                    return {
                        requesterId: c.requesterId,
                        status: c.status,
                        createdAt: c.createdAt,
                        name: u.name,
                        email: u.email,
                        image: u.image,
                    };
                } catch {
                    return null;
                }
            })
        )).filter(Boolean);

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
