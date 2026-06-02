import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const postsRes = await db.listDocuments(DB_ID, COLS.posts, [
            Query.equal('authorId', userId),
            Query.orderDesc('createdAt'),
            Query.limit(100),
        ]);

        // Count comments per post in parallel
        const posts = await Promise.all(
            postsRes.documents.map(async (p) => {
                const commentsRes = await db.listDocuments(DB_ID, COLS.comments, [
                    Query.equal('postId', p.$id),
                    Query.limit(1),
                ]);
                return {
                    id: p.$id,
                    title: p.title,
                    content: p.content,
                    image: p.image,
                    status: p.status,
                    views: p.views || 0,
                    commentCount: commentsRes.total,
                    createdAt: p.createdAt,
                };
            })
        );

        return NextResponse.json({ success: true, posts });
    } catch (error) {
        console.error('Error fetching my posts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
