import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('targetUserId');
        if (!targetUserId) {
            return NextResponse.json({ success: false, error: 'targetUserId is required' }, { status: 400 });
        }

        const docId = `flw_${session.user.id}_${targetUserId}`;
        try {
            await db.getDocument(DB_ID, COLS.follows, docId);
            return NextResponse.json({ success: true, isFollowing: true });
        } catch {
            return NextResponse.json({ success: true, isFollowing: false });
        }
    } catch (error) {
        console.error('Follow status error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { targetUserId } = await request.json();

        if (session.user.id === targetUserId) {
            return NextResponse.json({ success: false, error: 'You cannot follow yourself' }, { status: 400 });
        }

        const docId = `flw_${session.user.id}_${targetUserId}`;

        try {
            await db.getDocument(DB_ID, COLS.follows, docId);
            // Already following → unfollow
            await db.deleteDocument(DB_ID, COLS.follows, docId);
            return NextResponse.json({ success: true, isFollowing: false });
        } catch {
            // Not following → follow
            await db.createDocument(DB_ID, COLS.follows, docId, {
                followerId: session.user.id,
                followingId: targetUserId,
                createdAt: new Date().toISOString(),
            });
            return NextResponse.json({ success: true, isFollowing: true });
        }
    } catch (error) {
        console.error('Follow Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
