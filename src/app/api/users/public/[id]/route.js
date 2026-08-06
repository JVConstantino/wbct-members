import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const u = await db.getDocument(DB_ID, COLS.users, id);

        // Check if current user follows target
        const followDocId = `flw_${session.user.id}_${id}`;
        let isFollowing = false;
        try {
            await db.getDocument(DB_ID, COLS.follows, followDocId);
            isFollowing = true;
        } catch {}

        return NextResponse.json({
            success: true,
            user: {
                id: u.$id,
                name: u.name,
                image: u.image,
                bio: u.bio,
                crm: u.crm,
                specialty: u.specialty,
                createdAt: u.createdAt,
                isFollowing,
            },
        });
    } catch (error) {
        if (error?.code === 404) {
            return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
        }
        console.error('Public Profile Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
