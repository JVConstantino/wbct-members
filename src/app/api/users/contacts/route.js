import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const me = session.user.id;

        // Fetch messages involving me
        const [sent, received] = await Promise.all([
            listAll(COLS.messages, [Query.equal('senderId', me)]),
            listAll(COLS.messages, [Query.equal('receiverId', me)]),
        ]);

        // Build contact map with last message time
        const contactMap = new Map();

        for (const m of sent) {
            const cid = m.receiverId;
            if (cid && cid !== me) {
                const existing = contactMap.get(cid);
                const t = m.createdAt;
                if (!existing || t > existing.lastMessageAt) {
                    contactMap.set(cid, { id: cid, lastMessageAt: t });
                }
            }
        }
        for (const m of received) {
            const cid = m.senderId;
            if (cid && cid !== me) {
                const existing = contactMap.get(cid);
                const t = m.createdAt;
                if (!existing || t > existing.lastMessageAt) {
                    contactMap.set(cid, { id: cid, lastMessageAt: t });
                }
            }
        }

        // Also add followed users
        const follows = await listAll(COLS.follows, [Query.equal('followerId', me)]);
        for (const f of follows) {
            if (!contactMap.has(f.followingId)) {
                contactMap.set(f.followingId, { id: f.followingId, lastMessageAt: null });
            }
        }

        // Fetch user info for all contacts
        const followingIds = new Set(follows.map(f => f.followingId));

        const contacts = (
            await Promise.all(
                [...contactMap.values()].map(async (c) => {
                    try {
                        const u = await db.getDocument(DB_ID, COLS.users, c.id);
                        return {
                            id: u.$id,
                            name: u.name,
                            image: u.image,
                            specialty: u.specialty,
                            isFollowing: followingIds.has(u.$id) ? 1 : 0,
                            lastMessageAt: c.lastMessageAt,
                        };
                    } catch {
                        return null;
                    }
                })
            )
        ).filter(Boolean);

        contacts.sort((a, b) => {
            if (a.lastMessageAt && !b.lastMessageAt) return -1;
            if (!a.lastMessageAt && b.lastMessageAt) return 1;
            if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt);
            return (a.name || '').localeCompare(b.name || '');
        });

        return NextResponse.json({ success: true, contacts });
    } catch (error) {
        console.error('Contacts Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
