import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const userEvents = await listAll(COLS.userEvents, [Query.equal('userId', userId)]);
        const eventIds = userEvents.map(ue => ue.eventId).filter(Boolean);

        if (!eventIds.length) {
            return NextResponse.json({ success: true, events: [] });
        }

        const events = (await Promise.all(
            eventIds.map(async (eid) => {
                try {
                    const e = await db.getDocument(DB_ID, COLS.events, eid);
                    const epsId = `eps_${eid}_${userId}`;
                    let status = 'PENDING';
                    try {
                        const eps = await db.getDocument(DB_ID, COLS.eventParticipants, epsId);
                        status = eps.status;
                    } catch {}

                    return {
                        id: e.$id,
                        title: e.title,
                        description: e.description,
                        date: e.date,
                        color: e.color,
                        link: e.link,
                        status,
                    };
                } catch {
                    return null;
                }
            })
        )).filter(Boolean).sort((a, b) => new Date(a.date) - new Date(b.date));

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error('Error fetching user events:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
