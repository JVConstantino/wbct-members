import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { title, description, videoUrl, order, attachments } = await request.json();

        await db.updateDocument(DB_ID, COLS.lessons, id, {
            title,
            description: description ?? null,
            videoUrl,
            order: order ?? 0,
            updatedAt: new Date().toISOString(),
        });

        if (attachments !== undefined) {
            const existing = await listAll(COLS.lessonAttachments, [Query.equal('lessonId', id)]);
            await Promise.all(existing.map(a => db.deleteDocument(DB_ID, COLS.lessonAttachments, a.$id)));

            for (const att of attachments) {
                const attId = 'att_' + Math.random().toString(36).substr(2, 9);
                await db.createDocument(DB_ID, COLS.lessonAttachments, attId, {
                    title: att.title ?? '',
                    url: att.url ?? '',
                    type: att.type ?? 'other',
                    lessonId: id,
                    createdAt: new Date().toISOString(),
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await db.deleteDocument(DB_ID, COLS.lessons, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
