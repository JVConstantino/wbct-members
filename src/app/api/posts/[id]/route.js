import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET(request, { params }) {
    try {
        const id = (await params).id;

        const post = await db.getDocument(DB_ID, COLS.posts, id);

        const session = await auth();
        if (post.status !== 'APPROVED') {
            if (!session?.user || (session.user.id !== post.authorId && session.user.role !== 'ADMIN')) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
            }
        }

        // Increment views
        if (post.status === 'APPROVED') {
            try {
                await db.updateDocument(DB_ID, COLS.posts, id, { views: (post.views || 0) + 1 });
            } catch {}
        }

        // Fetch author
        let author = { name: 'Desconhecido', email: '', image: null };
        try {
            const u = await db.getDocument(DB_ID, COLS.users, post.authorId);
            author = { name: u.name, email: u.email, image: u.image };
        } catch {}

        // Fetch comments with authors
        const commentsRes = await db.listDocuments(DB_ID, COLS.comments, [
            Query.equal('postId', id),
            Query.orderDesc('createdAt'),
            Query.limit(200),
        ]);

        const commentAuthorIds = [...new Set(commentsRes.documents.map(c => c.authorId).filter(Boolean))];
        const commentAuthorMap = {};
        await Promise.all(
            commentAuthorIds.map(async (aid) => {
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, aid);
                    commentAuthorMap[aid] = { name: u.name, image: u.image };
                } catch {}
            })
        );

        const comments = commentsRes.documents.map(c => ({
            ...c,
            id: c.$id,
            authorName: commentAuthorMap[c.authorId]?.name || 'Desconhecido',
            authorImage: commentAuthorMap[c.authorId]?.image || null,
        }));

        return NextResponse.json({
            success: true,
            post: {
                ...post,
                id: post.$id,
                author,
                comments,
            },
        });
    } catch (error) {
        console.error('Error fetching post detail:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const id = (await params).id;
        const { title, content, image } = await request.json();

        const post = await db.getDocument(DB_ID, COLS.posts, id);

        if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const status = session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

        await db.updateDocument(DB_ID, COLS.posts, id, {
            title, content, image,
            status,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
