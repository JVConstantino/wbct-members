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

        const items = await query(`
            SELECT c.requesterId, c.status, c.createdAt, u.name, u.email, u.image
            FROM Connections c
            JOIN User u ON u.id = c.requesterId
            WHERE c.receiverId = ? AND c.status = 'PENDING'
            ORDER BY c.createdAt DESC
        `, [session.user.id]);

        return NextResponse.json({ success: true, requests: items });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
