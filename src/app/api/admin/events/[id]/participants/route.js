import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = params;

        // Buscar usuários inscritos no evento através da tabela de junção _UserEvents
        // A = EventId, B = UserId
        const participants = await query(`
            SELECT u.id, u.name, u.email, u.role
            FROM User u
            JOIN _UserEvents ue ON u.id = ue.B
            WHERE ue.A = ?
            ORDER BY u.name ASC
        `, [id]);

        return NextResponse.json({
            success: true,
            participants
        });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
