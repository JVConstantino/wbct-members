import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function POST(request, { params }) {
    try {
        const { id } = params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const userId = session.user.id;

        // Verificar se já segue
        // Como é uma relação m:n no Prisma, na query direta MySQL precisamos da tabela de junção.
        // O Prisma cria automaticamente _UserEvents (A = EventId, B = UserId)
        const existing = await query('SELECT * FROM _UserEvents WHERE A = ? AND B = ?', [id, userId]);

        if (existing.length > 0) {
            // Unfollow
            await query('DELETE FROM _UserEvents WHERE A = ? AND B = ?', [id, userId]);
            return NextResponse.json({ success: true, following: false });
        } else {
            // Follow
            await query('INSERT INTO _UserEvents (A, B) VALUES (?, ?)', [id, userId]);
            return NextResponse.json({ success: true, following: true });
        }

    } catch (error) {
        console.error('Follow Event Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
