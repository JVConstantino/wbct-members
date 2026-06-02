import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET(request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // YYYY-MM

        const queries = [Query.orderAsc('date'), Query.limit(200)];

        if (month) {
            const start = `${month}-01T00:00:00.000Z`;
            const [year, m] = month.split('-').map(Number);
            const nextMonth = m === 12 ? `${year + 1}-01` : `${year}-${String(m + 1).padStart(2, '0')}`;
            const end = `${nextMonth}-01T00:00:00.000Z`;
            queries.push(Query.greaterThanEqual('date', start));
            queries.push(Query.lessThan('date', end));
        }

        const res = await db.listDocuments(DB_ID, COLS.events, queries);

        let followedEventIds = new Set();
        if (userId) {
            const ue = await db.listDocuments(DB_ID, COLS.userEvents, [
                Query.equal('userId', userId),
                Query.limit(500),
            ]);
            for (const d of ue.documents) followedEventIds.add(d.eventId);
        }

        return NextResponse.json({
            success: true,
            events: res.documents.map(e => ({
                id: e.$id,
                title: e.title,
                description: e.description,
                date: e.date,
                color: e.color || '#3b82f6',
                link: e.link,
                isFollowing: followedEventIds.has(e.$id),
            })),
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { title, description, date, color, link } = await request.json();
        const id = 'event_' + Date.now().toString(36);
        const now = new Date().toISOString();

        await db.createDocument(DB_ID, COLS.events, id, {
            title, description, date,
            color: color || '#3b82f6',
            link: link || null,
            createdAt: now, updatedAt: now,
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { id, title, description, date, color, link } = await request.json();
        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        await db.updateDocument(DB_ID, COLS.events, id, {
            title, description, date,
            color: color || '#3b82f6',
            link: link || null,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        await db.deleteDocument(DB_ID, COLS.events, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
