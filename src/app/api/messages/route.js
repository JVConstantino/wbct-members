import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { receiverId, content } = await request.json();

        if (!receiverId || !content) {
            return NextResponse.json({ success: false, error: 'Recipient and content are required' }, { status: 400 });
        }

        // Fetch receiver info
        let receiver;
        try {
            receiver = await db.getDocument(DB_ID, COLS.users, receiverId);
        } catch {
            return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 });
        }

        const receiverRole = String(receiver.role || '').toUpperCase();

        // Check permissions
        if (session.user.role !== 'ADMIN') {
            const policy = String(receiver.allowMessagesFrom || 'followers').toLowerCase();

            if (receiverRole !== 'ADMIN') {
                if (policy === 'nobody') {
                    return NextResponse.json({ success: false, error: 'This user does not receive direct messages.' }, { status: 403 });
                }

                if (policy === 'connections') {
                    const connId1 = `conn_${session.user.id}_${receiverId}`;
                    const connId2 = `conn_${receiverId}_${session.user.id}`;
                    let connected = false;
                    try {
                        const c = await db.getDocument(DB_ID, COLS.connections, connId1);
                        connected = c.status === 'ACCEPTED';
                    } catch {}
                    if (!connected) {
                        try {
                            const c = await db.getDocument(DB_ID, COLS.connections, connId2);
                            connected = c.status === 'ACCEPTED';
                        } catch {}
                    }
                    if (!connected) {
                        return NextResponse.json({ success: false, error: 'Only connections can message this user.' }, { status: 403 });
                    }
                }

                if (policy === 'followers') {
                    const followDocId = `flw_${session.user.id}_${receiverId}`;
                    try {
                        await db.getDocument(DB_ID, COLS.follows, followDocId);
                    } catch {
                        return NextResponse.json({ success: false, error: 'You need to follow this user to send a message.' }, { status: 403 });
                    }
                }
            }
        }

        const id = `msg_${Date.now().toString(36)}`;
        const now = new Date().toISOString();

        await db.createDocument(DB_ID, COLS.messages, id, {
            senderId: session.user.id,
            receiverId,
            content,
            createdAt: now,
        });

        // Create notification (non-blocking)
        try {
            const notifId = `notif_${Date.now().toString(36)}`;
            const senderName = session.user.name || 'A user';
            await db.createDocument(DB_ID, COLS.notifications, notifId, {
                userId: receiverId,
                type: 'MESSAGE',
                content: `New message from ${senderName}`,
                relatedId: session.user.id,
                isRead: 0,
                createdAt: now,
            });
        } catch (e) {
            console.warn('Notification insert skipped:', e?.message);
        }

        return NextResponse.json({ success: true, messageId: id });
    } catch (error) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
