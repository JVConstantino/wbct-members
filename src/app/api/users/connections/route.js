import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        await query(`
            CREATE TABLE IF NOT EXISTS Connections (
                requesterId VARCHAR(191) NOT NULL,
                receiverId VARCHAR(191) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (requesterId, receiverId)
            )
        `);

        const userId = session.user.id;
        const list = await query(`
            SELECT u.id, u.name, u.email, u.image
            FROM Connections c
            JOIN User u ON (u.id = c.requesterId OR u.id = c.receiverId)
            WHERE c.status = 'ACCEPTED'
              AND (c.requesterId = ? OR c.receiverId = ?)
              AND u.id <> ?
            ORDER BY u.name ASC
        `, [userId, userId, userId]);

        return NextResponse.json({ success: true, connections: list });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
