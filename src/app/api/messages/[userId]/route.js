import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;
        const me = session.user.id;

        // Fetch messages sent by me to userId
        const [sent, received] = await Promise.all([
            listAll(COLS.messages, [
                Query.equal('senderId', me),
                Query.equal('receiverId', userId),
            ]),
            listAll(COLS.messages, [
                Query.equal('senderId', userId),
                Query.equal('receiverId', me),
            ]),
        ]);

        const all = [...sent, ...received].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        // Fetch sender info for all messages
        const senderIds = [...new Set(all.map(m => m.senderId).filter(Boolean))];
        const senderMap = {};
        await Promise.all(
            senderIds.map(async (sid) => {
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, sid);
                    senderMap[sid] = { name: u.name, image: u.image };
                } catch {}
            })
        );

        const messages = all.map(m => ({
            id: m.$id,
            content: m.content,
            senderId: m.senderId,
            receiverId: m.receiverId,
            createdAt: m.createdAt,
            readAt: m.readAt || null,
            senderName: senderMap[m.senderId]?.name || 'Desconhecido',
            senderImage: senderMap[m.senderId]?.image || null,
        }));

        return NextResponse.json({ success: true, messages });
    } catch (error) {
        console.error('List Messages Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
