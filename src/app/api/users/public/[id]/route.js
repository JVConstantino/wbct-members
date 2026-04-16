import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        // Verificar autenticação (apenas membros logados podem ver perfis)
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;

        // Buscar dados públicos do usuário e status de follow
        const users = await query(`
            SELECT 
                u.id, 
                u.name, 
                u.image, 
                u.bio, 
                u.stack, 
                u.crm, 
                u.specialty, 
                u.createdAt,
                (SELECT COUNT(*) FROM Follows WHERE followerId = ? AND followingId = u.id) as isFollowing
            FROM User u 
            WHERE u.id = ?
        `, [session.user.id, id]);

        if (users.length === 0) {
            return NextResponse.json({ success: false, error: 'Médico não encontrado' }, { status: 404 });
        }

        const user = users[0];
        return NextResponse.json({
            success: true,
            user: {
                ...user,
                isFollowing: user.isFollowing > 0
            }
        });
    } catch (error) {
        console.error('Public Profile Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
