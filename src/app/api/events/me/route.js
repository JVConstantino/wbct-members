import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
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

        const events = await query(`
            SELECT e.id, e.title, e.description, e.date, e.color, e.link,
                   COALESCE(eps.status, 'PENDING') as status
            FROM Event e
            JOIN _UserEvents ue ON ue.A = e.id
            LEFT JOIN EventParticipantStatus eps ON eps.eventId = e.id AND eps.userId = ue.B
            WHERE ue.B = ?
            ORDER BY e.date ASC
        `, [userId]);

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error('Error fetching user events:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
