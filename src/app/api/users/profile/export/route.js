import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const [profile, posts, comments, followsBy, followsOf, messages, userEventsData, consents] =
            await Promise.all([
                db.getDocument(DB_ID, COLS.users, userId).catch(() => null),
                listAll(COLS.posts, [Query.equal('authorId', userId)]),
                listAll(COLS.comments, [Query.equal('authorId', userId)]),
                listAll(COLS.follows, [Query.equal('followerId', userId)]),
                listAll(COLS.follows, [Query.equal('followingId', userId)]),
                listAll(COLS.messages, [Query.equal('senderId', userId)]),
                listAll(COLS.userEvents, [Query.equal('userId', userId)]),
                listAll(COLS.consentLog, [Query.equal('userId', userId)]),
            ]);

        // Fetch event details for user's events
        const events = await Promise.all(
            userEventsData.map(async (ue) => {
                try {
                    const e = await db.getDocument(DB_ID, COLS.events, ue.eventId);
                    return { id: e.$id, title: e.title, date: e.date };
                } catch {
                    return null;
                }
            })
        ).then(arr => arr.filter(Boolean));

        const follows = [
            ...followsBy.map(f => ({ followerId: f.followerId, followingId: f.followingId, createdAt: f.createdAt })),
            ...followsOf.map(f => ({ followerId: f.followerId, followingId: f.followingId, createdAt: f.createdAt })),
        ];

        return NextResponse.json({
            success: true,
            exportedAt: new Date().toISOString(),
            data: {
                profile: profile ? { id: profile.$id, name: profile.name, email: profile.email, bio: profile.bio, crm: profile.crm, specialty: profile.specialty, role: profile.role, createdAt: profile.createdAt } : null,
                posts: posts.map(p => ({ id: p.$id, title: p.title, status: p.status, createdAt: p.createdAt, updatedAt: p.updatedAt })),
                comments: comments.map(c => ({ id: c.$id, content: c.content, postId: c.postId, createdAt: c.createdAt })),
                follows,
                messages: messages.map(m => ({ id: m.$id, senderId: m.senderId, receiverId: m.receiverId, createdAt: m.createdAt })),
                events,
                consents: consents.map(c => ({ mode: c.mode, preferencesJson: c.preferencesJson, createdAt: c.createdAt })),
            },
        });
    } catch (error) {
        console.error('Profile Export Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
