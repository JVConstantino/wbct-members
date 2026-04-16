import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST: Atualizar lastActiveAt do usuário (ping de atividade)
export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        await query(
            'UPDATE User SET lastActiveAt = NOW() WHERE id = ?',
            [session.user.id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating activity:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// GET: Contar usuários online (ativos nos últimos 5 minutos)
export async function GET() {
    try {
        const [result] = await query(`
            SELECT COUNT(*) as count 
            FROM User 
            WHERE lastActiveAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        `);

        return NextResponse.json({
            success: true,
            online: result.count || 0
        });
    } catch (error) {
        console.error('Error fetching online users:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
