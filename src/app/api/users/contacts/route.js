import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar usuários que eu sigo
        const contacts = await query(`
            SELECT u.id, u.name, u.image, u.stack, u.specialty
            FROM Follows f
            JOIN User u ON f.followingId = u.id
            WHERE f.followerId = ?
            ORDER BY u.name ASC
        `, [session.user.id]);

        return NextResponse.json({ success: true, contacts });
    } catch (error) {
        console.error('Contacts Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
