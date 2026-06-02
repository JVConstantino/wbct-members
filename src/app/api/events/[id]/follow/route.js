import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const ueId = `ue_${id}_${userId}`;
        const epsId = `eps_${id}_${userId}`;

        try {
            await db.getDocument(DB_ID, COLS.userEvents, ueId);
            // Already following → unfollow
            await db.deleteDocument(DB_ID, COLS.userEvents, ueId);
            try { await db.deleteDocument(DB_ID, COLS.eventParticipants, epsId); } catch {}
            return NextResponse.json({ success: true, following: false });
        } catch {
            // Not following → follow
            const now = new Date().toISOString();
            await db.createDocument(DB_ID, COLS.userEvents, ueId, {
                eventId: id,
                userId,
                createdAt: now,
            });

            try {
                await db.updateDocument(DB_ID, COLS.eventParticipants, epsId, { status: 'PENDING' });
            } catch {
                await db.createDocument(DB_ID, COLS.eventParticipants, epsId, {
                    eventId: id,
                    userId,
                    status: 'PENDING',
                    updatedAt: now,
                });
            }

            return NextResponse.json({ success: true, following: true });
        }
    } catch (error) {
        console.error('Follow Event Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
