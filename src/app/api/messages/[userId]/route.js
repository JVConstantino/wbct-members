import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { userId } = await params;

        // Buscar todas as mensagens trocadas com o usuário
        const messages = await query(`
            SELECT 
                m.id, m.content, m.senderId, m.receiverId, m.createdAt, m.readAt,
                u.name as senderName, u.image as senderImage
            FROM Message m
            JOIN User u ON m.senderId = u.id
            WHERE (m.senderId = ? AND m.receiverId = ?)
               OR (m.senderId = ? AND m.receiverId = ?)
            ORDER BY m.createdAt ASC
        `, [session.user.id, userId, userId, session.user.id]);

        return NextResponse.json({ success: true, messages });
    } catch (error) {
        console.error('List Messages Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
