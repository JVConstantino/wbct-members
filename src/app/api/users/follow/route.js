import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { targetUserId } = await request.json();

        if (session.user.id === targetUserId) {
            return NextResponse.json({ success: false, error: 'Você não pode seguir a si mesmo' }, { status: 400 });
        }

        // Verificar se já segue
        const existing = await query(
            'SELECT 1 FROM Follows WHERE followerId = ? AND followingId = ?',
            [session.user.id, targetUserId]
        );

        if (existing.length > 0) {
            // Deixar de seguir
            await query(
                'DELETE FROM Follows WHERE followerId = ? AND followingId = ?',
                [session.user.id, targetUserId]
            );
            return NextResponse.json({ success: true, isFollowing: false });
        } else {
            // Seguir
            await query(
                'INSERT INTO Follows (followerId, followingId) VALUES (?, ?)',
                [session.user.id, targetUserId]
            );
            return NextResponse.json({ success: true, isFollowing: true });
        }

    } catch (error) {
        console.error('Follow Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
