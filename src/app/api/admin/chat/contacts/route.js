import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const me = session.user.id;

        const [sent, received] = await Promise.all([
            listAll(COLS.messages, [Query.equal('senderId', me)]),
            listAll(COLS.messages, [Query.equal('receiverId', me)]),
        ]);

        // Build contact map with last message time
        const contactMap = new Map();

        for (const m of sent) {
            const cid = m.receiverId;
            if (cid && cid !== me) {
                const t = m.createdAt;
                const existing = contactMap.get(cid);
                if (!existing || t > existing) contactMap.set(cid, t);
            }
        }
        for (const m of received) {
            const cid = m.senderId;
            if (cid && cid !== me) {
                const t = m.createdAt;
                const existing = contactMap.get(cid);
                if (!existing || t > existing) contactMap.set(cid, t);
            }
        }

        const contacts = (await Promise.all(
            [...contactMap.entries()].map(async ([uid, lastMessageAt]) => {
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, uid);
                    return {
                        id: u.$id,
                        name: u.name,
                        image: u.image,
                        role: u.role,
                        email: u.email,
                        lastMessageAt,
                    };
                } catch {
                    return null;
                }
            })
        )).filter(Boolean).sort((a, b) => b.lastMessageAt?.localeCompare(a.lastMessageAt || '') || 0);

        return NextResponse.json({ success: true, contacts });
    } catch (error) {
        console.error('Admin Chat Contacts Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
