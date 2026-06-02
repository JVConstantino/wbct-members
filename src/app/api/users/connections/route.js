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

        const [asRequester, asReceiver] = await Promise.all([
            listAll(COLS.connections, [Query.equal('requesterId', userId), Query.equal('status', 'ACCEPTED')]),
            listAll(COLS.connections, [Query.equal('receiverId', userId), Query.equal('status', 'ACCEPTED')]),
        ]);

        const peerIds = [
            ...asRequester.map(c => c.receiverId),
            ...asReceiver.map(c => c.requesterId),
        ].filter(Boolean);

        const list = (await Promise.all(
            peerIds.map(async (pid) => {
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, pid);
                    return { id: u.$id, name: u.name, email: u.email, image: u.image };
                } catch {
                    return null;
                }
            })
        )).filter(Boolean).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        return NextResponse.json({ success: true, connections: list });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
