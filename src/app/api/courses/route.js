import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET() {
    try {
        const coursesRes = await db.listDocuments(DB_ID, COLS.courses, [
            Query.orderDesc('createdAt'),
            Query.limit(100),
        ]);

        // Count lessons per course
        const courses = await Promise.all(
            coursesRes.documents.map(async (c) => {
                const lessonsRes = await db.listDocuments(DB_ID, COLS.lessons, [
                    Query.equal('courseId', c.$id),
                    Query.limit(1),
                ]);
                return { ...c, id: c.$id, lessonCount: lessonsRes.total };
            })
        );

        return NextResponse.json({ success: true, courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, image } = await request.json();
        if (!title) return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });

        const id = 'course_' + Date.now().toString(36);
        const now = new Date().toISOString();

        await db.createDocument(DB_ID, COLS.courses, id, {
            title,
            description: description || null,
            image: image || null,
            createdAt: now, updatedAt: now,
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
