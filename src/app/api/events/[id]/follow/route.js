import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const userId = session.user.id;

        await query(`
            CREATE TABLE IF NOT EXISTS EventParticipantStatus (
                eventId VARCHAR(191) NOT NULL,
                userId VARCHAR(191) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (eventId, userId)
            )
        `);

        // Verificar se já segue
        // Como é uma relação m:n no Prisma, na query direta MySQL precisamos da tabela de junção.
        // O Prisma cria automaticamente _UserEvents (A = EventId, B = UserId)
        const existing = await query('SELECT * FROM _UserEvents WHERE A = ? AND B = ?', [id, userId]);

        if (existing.length > 0) {
            // Unfollow
            await query('DELETE FROM _UserEvents WHERE A = ? AND B = ?', [id, userId]);
            await query('DELETE FROM EventParticipantStatus WHERE eventId = ? AND userId = ?', [id, userId]);
            return NextResponse.json({ success: true, following: false });
        } else {
            // Follow
            await query('INSERT INTO _UserEvents (A, B) VALUES (?, ?)', [id, userId]);
            await query(`
                INSERT INTO EventParticipantStatus (eventId, userId, status)
                VALUES (?, ?, 'PENDING')
                ON DUPLICATE KEY UPDATE status = VALUES(status)
            `, [id, userId]);
            return NextResponse.json({ success: true, following: true });
        }

    } catch (error) {
        console.error('Follow Event Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
