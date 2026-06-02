import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: lessonId } = await params;
        const { completed } = await request.json();
        const userId = session.user.id;
        const docId = `prog_${userId}_${lessonId}`;
        const now = new Date().toISOString();

        try {
            await db.updateDocument(DB_ID, COLS.lessonProgress, docId, {
                completed,
                completedAt: completed ? now : null,
                updatedAt: now,
            });
        } catch {
            await db.createDocument(DB_ID, COLS.lessonProgress, docId, {
                userId, lessonId, completed,
                completedAt: completed ? now : null,
                createdAt: now, updatedAt: now,
            });
        }

        return NextResponse.json({ success: true, completed });
    } catch (error) {
        console.error('Error updating lesson progress:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: lessonId } = await params;
        const docId = `prog_${session.user.id}_${lessonId}`;

        try {
            const doc = await db.getDocument(DB_ID, COLS.lessonProgress, docId);
            return NextResponse.json({ success: true, completed: !!doc.completed });
        } catch {
            return NextResponse.json({ success: true, completed: false });
        }
    } catch (error) {
        console.error('Error fetching lesson progress:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
