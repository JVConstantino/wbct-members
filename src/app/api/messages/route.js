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

        // Verificar se usuário segue o destinatário OU é ADMIN
        if (session.user.role !== 'ADMIN') {
            const isFollowing = await query(`
                SELECT 1 FROM Follows WHERE followerId = ? AND followingId = ?
            `, [session.user.id, receiverId]);

            if (isFollowing.length === 0) {
                return NextResponse.json({ success: false, error: 'Você precisa seguir este usuário para enviar mensagem.' }, { status: 403 });
            }
        }

        const id = crypto.randomUUID();
        console.log(`Tentando enviar mensagem de ${session.user.id} para ${receiverId}`);

        await query(`
            INSERT INTO Message (id, senderId, receiverId, content) 
            VALUES (?, ?, ?, ?)
        `, [id, session.user.id, receiverId, content]);

        // Criar NOTIFICAÇÃO para o destinatário
        const notifId = crypto.randomUUID();
        const senderName = session.user.name || "Um usuário";
        await query(`
            INSERT INTO Notification (id, userId, type, content, relatedId, isRead)
            VALUES (?, ?, 'MESSAGE', ?, ?, FALSE)
        `, [notifId, receiverId, `Nova mensagem de ${senderName}`, session.user.id]);

        return NextResponse.json({ success: true, messageId: id });
    } catch (error) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
