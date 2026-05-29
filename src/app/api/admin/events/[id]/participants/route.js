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

        await query(`
            CREATE TABLE IF NOT EXISTS EventParticipantStatus (
                eventId VARCHAR(191) NOT NULL,
                userId VARCHAR(191) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (eventId, userId)
            )
        `);

// Buscar usuários inscritos no evento através da tabela de junção _UserEvents
        // A = EventId, B = UserId
        const rawParticipants = await query(`
            SELECT u.id, u.name, u.email, u.role, COALESCE(eps.status, 'PENDING') as status, ue.A as event_id_in_junction
            FROM User u
            JOIN _UserEvents ue ON u.id = ue.B
            LEFT JOIN EventParticipantStatus eps ON eps.eventId = ue.A AND eps.userId = u.id
            WHERE ue.A = ?
            ORDER BY u.name ASC
        `, [id]);

        console.log('[participants] eventId received:', id, '| typeof:', typeof id, '| length:', id?.length);
        console.log('[participants] rows found:', rawParticipants.length);
        if (rawParticipants.length > 0) console.log('[participants] sample row:', JSON.stringify(rawParticipants[0]));
        if (rawParticipants.length === 0) {
            const allEntries = await query('SELECT * FROM _UserEvents LIMIT 10');
            console.log('[participants] all _UserEvents entries (sample):', JSON.stringify(allEntries));
        }

        return NextResponse.json({
            success: true,
            participants: rawParticipants.map(p => ({ id: p.id, name: p.name, email: p.email, role: p.role, status: p.status }))
        });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = params;
        const { userId, status } = await request.json();

        if (!userId || !status) {
            return NextResponse.json({ success: false, error: 'userId e status são obrigatórios' }, { status: 400 });
        }

        const normalizedStatus = String(status).toUpperCase();
        if (!["PENDING", "CONFIRMED", "REJECTED"].includes(normalizedStatus)) {
            return NextResponse.json({ success: false, error: 'Status inválido' }, { status: 400 });
        }

        await query(`
            INSERT INTO EventParticipantStatus (eventId, userId, status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status)
        `, [id, userId, normalizedStatus]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating participant status:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
