import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const lessonsRes = await db.listDocuments(DB_ID, COLS.lessons, [
            Query.equal('courseId', id),
            Query.orderAsc('order'),
            Query.limit(200),
        ]);

        const lessons = await Promise.all(
            lessonsRes.documents.map(async (l) => {
                const attRes = await db.listDocuments(DB_ID, COLS.lessonAttachments, [
                    Query.equal('lessonId', l.$id),
                    Query.limit(50),
                ]);
                return {
                    ...l,
                    id: l.$id,
                    attachments: attRes.documents.map(a => ({ ...a, id: a.$id })),
                };
            })
        );

        return NextResponse.json({ success: true, lessons });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: courseId } = await params;
        const { title, description, videoUrl, order, attachments } = await request.json();

        if (!title || !videoUrl) {
            return NextResponse.json({ success: false, error: 'Title and video URL are required' }, { status: 400 });
        }

        const lessonId = 'lesson_' + Date.now().toString(36);
        const now = new Date().toISOString();

        await db.createDocument(DB_ID, COLS.lessons, lessonId, {
            title,
            description: description ?? null,
            videoUrl,
            order: order ?? 0,
            courseId,
            createdAt: now, updatedAt: now,
        });

        if (Array.isArray(attachments)) {
            for (const att of attachments) {
                const attId = 'att_' + Math.random().toString(36).substr(2, 9);
                await db.createDocument(DB_ID, COLS.lessonAttachments, attId, {
                    title: att.title ?? '',
                    url: att.url ?? '',
                    type: att.type ?? 'other',
                    lessonId,
                    createdAt: now,
                });
            }
        }

        return NextResponse.json({ success: true, id: lessonId });
    } catch (error) {
        console.error('Error creating lesson:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
