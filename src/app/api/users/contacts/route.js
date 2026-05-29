import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        // Sidebar de contatos:
        // 1) usuarios com quem ja trocou mensagens
        // 2) usuarios que segue (fallback para iniciar conversa)
        // Evita duplicacao e prioriza conversas recentes.
        const contacts = await query(`
            SELECT
                u.id,
                u.name,
                u.image,
                u.stack,
                u.specialty,
                MAX(CASE WHEN fl.followerId IS NULL THEN 0 ELSE 1 END) as isFollowing,
                MAX(src.lastMessageAt) as lastMessageAt
            FROM (
                SELECT
                    CASE
                        WHEN m.senderId = ? THEN m.receiverId
                        ELSE m.senderId
                    END as contactId,
                    m.createdAt as lastMessageAt
                FROM Message m
                WHERE m.senderId = ? OR m.receiverId = ?

                UNION ALL

                SELECT f.followingId as contactId, NULL as lastMessageAt
                FROM Follows f
                WHERE f.followerId = ?
            ) src
            JOIN User u ON u.id = src.contactId
            LEFT JOIN Follows fl ON fl.followerId = ? AND fl.followingId = u.id
            WHERE u.id <> ?
            GROUP BY u.id, u.name, u.image, u.stack, u.specialty
            ORDER BY
                CASE WHEN MAX(src.lastMessageAt) IS NULL THEN 1 ELSE 0 END,
                MAX(src.lastMessageAt) DESC,
                u.name ASC
        `, [session.user.id, session.user.id, session.user.id, session.user.id, session.user.id, session.user.id]);

        return NextResponse.json({ success: true, contacts });
    } catch (error) {
        console.error('Contacts Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
