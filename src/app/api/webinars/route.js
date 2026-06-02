import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, ID, Query } from '@/lib/appwrite';

export async function GET() {
    try {
        const res = await db.listDocuments(DB_ID, COLS.webinars, [
            Query.orderAsc('order'),
            Query.limit(100),
        ]);
        return NextResponse.json({ success: true, webinars: res.documents.map(d => ({ ...d, id: d.$id })) });
    } catch (error) {
        console.error('Error fetching webinars:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { title, description, videoUrl, order } = await request.json();
        const id = 'webinar_' + Date.now().toString(36);
        const now = new Date().toISOString();

        await db.createDocument(DB_ID, COLS.webinars, id, {
            title, description, videoUrl,
            order: order ?? 0,
            createdAt: now, updatedAt: now,
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating webinar:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { id, title, description, videoUrl, order } = await request.json();
        await db.updateDocument(DB_ID, COLS.webinars, id, {
            title, description, videoUrl,
            order: order ?? 0,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating webinar:', error);
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

        await db.deleteDocument(DB_ID, COLS.webinars, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting webinar:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
