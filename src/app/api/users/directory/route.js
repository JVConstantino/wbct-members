import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const res = await db.listDocuments(DB_ID, COLS.users, [
            Query.orderAsc('name'),
            Query.limit(500),
        ]);

        // Count approved posts per user in parallel
        const users = await Promise.all(
            res.documents
                .filter(u => u.$id !== session.user.id)
                .map(async (u) => {
                    const postsRes = await db.listDocuments(DB_ID, COLS.posts, [
                        Query.equal('authorId', u.$id),
                        Query.equal('status', 'APPROVED'),
                        Query.limit(1),
                    ]);
                    return {
                        id: u.$id,
                        name: u.name,
                        email: u.email,
                        image: u.image,
                        bio: u.bio,
                        crm: u.crm,
                        specialty: u.specialty,
                        _count: { posts: postsRes.total },
                    };
                })
        );

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Directory Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
