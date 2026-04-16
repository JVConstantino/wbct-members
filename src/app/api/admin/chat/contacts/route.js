import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar usuários com quem o admin já trocou mensagens (enviadas ou recebidas)
        // Isso popula a sidebar inicial
        const contacts = await query(`
            SELECT u.id, u.name, u.image, u.role, u.email, MAX(m.createdAt) as lastMessageAt
            FROM User u
            JOIN Message m ON (m.senderId = u.id AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = u.id)
            GROUP BY u.id, u.name, u.image, u.role, u.email
            ORDER BY lastMessageAt DESC
        `, [session.user.id, session.user.id]);

        return NextResponse.json({ success: true, contacts });
    } catch (error) {
        console.error('Admin Chat Contacts Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
