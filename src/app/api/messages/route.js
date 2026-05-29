import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { receiverId, content } = await request.json();

        if (!receiverId || !content) {
            console.error('Dados incompletos:', { receiverId, hasContent: !!content });
            return NextResponse.json({ success: false, error: 'Destinatário e conteúdo são obrigatórios' }, { status: 400 });
        }

        await query(`
            ALTER TABLE User
            ADD COLUMN allowMessagesFrom VARCHAR(20) NOT NULL DEFAULT 'followers'
        `).catch(() => {});

        let receiverMeta = [];
        try {
            receiverMeta = await query('SELECT role, allowMessagesFrom FROM User WHERE id = ?', [receiverId]);
        } catch {
            receiverMeta = await query('SELECT role FROM User WHERE id = ?', [receiverId]).catch(() => []);
            receiverMeta = receiverMeta.map((r) => ({ ...r, allowMessagesFrom: 'followers' }));
        }

        const receiverRole = String(receiverMeta[0]?.role || '').toUpperCase();

        // Verificar se usuário segue o destinatário OU é ADMIN
        if (session.user.role !== 'ADMIN') {
            const policy = String(receiverMeta[0]?.allowMessagesFrom || 'followers').toLowerCase();

            // Regra especial: se o destinatario for ADMIN, membro pode responder sem seguir.
            if (receiverRole === 'ADMIN') {
                // permitido responder/enviar para admin
            } else {

                const isFollowing = await query(`
                    SELECT 1 FROM Follows WHERE followerId = ? AND followingId = ?
                `, [session.user.id, receiverId]);

                const isConnected = await query(`
                    SELECT 1 FROM Connections
                    WHERE status = 'ACCEPTED'
                      AND ((requesterId = ? AND receiverId = ?) OR (requesterId = ? AND receiverId = ?))
                `, [session.user.id, receiverId, receiverId, session.user.id]).catch(() => []);

                if (policy === 'nobody') {
                    return NextResponse.json({ success: false, error: 'Este usuário não recebe mensagens diretas.' }, { status: 403 });
                }
                if (policy === 'connections' && isConnected.length === 0) {
                    return NextResponse.json({ success: false, error: 'Somente conexões podem enviar mensagem para este usuário.' }, { status: 403 });
                }
                if (policy === 'followers' && isFollowing.length === 0) {
                    return NextResponse.json({ success: false, error: 'Você precisa seguir este usuário para enviar mensagem.' }, { status: 403 });
                }

                if (policy === 'everyone') {
                    // permitido
                }
            }
        }

        const id = globalThis.crypto?.randomUUID?.() || `msg_${Date.now().toString(36)}`;
        console.log(`Tentando enviar mensagem de ${session.user.id} para ${receiverId}`);

        await query(`
            INSERT INTO Message (id, senderId, receiverId, content) 
            VALUES (?, ?, ?, ?)
        `, [id, session.user.id, receiverId, content]);

        // Criar notificacao sem bloquear envio de mensagem em caso de schema antigo
        try {
            const notifId = globalThis.crypto?.randomUUID?.() || `notif_${Date.now().toString(36)}`;
            const senderName = session.user.name || "Um usuário";

            await query(`
                ALTER TABLE Notification
                ADD COLUMN relatedId VARCHAR(191) NULL
            `).catch(() => {});

            await query(`
                INSERT INTO Notification (id, userId, type, content, relatedId, isRead)
                VALUES (?, ?, 'MESSAGE', ?, ?, FALSE)
            `, [notifId, receiverId, `Nova mensagem de ${senderName}`, session.user.id]);
        } catch (notificationError) {
            console.warn('Notification insert skipped:', notificationError?.message || notificationError);
        }

        return NextResponse.json({ success: true, messageId: id });
    } catch (error) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
