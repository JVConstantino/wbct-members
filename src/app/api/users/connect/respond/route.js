import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { requesterId, action } = await request.json();
        if (!requesterId || !["accept", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
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

        if (action === 'accept') {
            await query('UPDATE Connections SET status = ? WHERE requesterId = ? AND receiverId = ?', ['ACCEPTED', requesterId, session.user.id]);
        } else {
            await query('DELETE FROM Connections WHERE requesterId = ? AND receiverId = ?', [requesterId, session.user.id]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
