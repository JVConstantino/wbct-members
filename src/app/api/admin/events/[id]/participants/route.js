import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const userEvents = await listAll(COLS.userEvents, [Query.equal('eventId', id)]);
        const userIds = userEvents.map(ue => ue.userId).filter(Boolean);

        const participants = (await Promise.all(
            userIds.map(async (uid) => {
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, uid);
                    const epsId = `eps_${id}_${uid}`;
                    let status = 'PENDING';
                    try {
                        const eps = await db.getDocument(DB_ID, COLS.eventParticipants, epsId);
                        status = eps.status;
                    } catch {}
                    return { id: u.$id, name: u.name, email: u.email, role: u.role, status };
                } catch {
                    return null;
                }
            })
        )).filter(Boolean).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        return NextResponse.json({ success: true, participants });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { userId, status } = await request.json();

        if (!userId || !status) {
            return NextResponse.json({ success: false, error: 'userId and status are required' }, { status: 400 });
        }

        const normalizedStatus = String(status).toUpperCase();
        if (!['PENDING', 'CONFIRMED', 'REJECTED'].includes(normalizedStatus)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        const epsId = `eps_${id}_${userId}`;
        try {
            await db.updateDocument(DB_ID, COLS.eventParticipants, epsId, {
                status: normalizedStatus,
                updatedAt: new Date().toISOString(),
            });
        } catch {
            await db.createDocument(DB_ID, COLS.eventParticipants, epsId, {
                eventId: id,
                userId,
                status: normalizedStatus,
                updatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating participant status:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
