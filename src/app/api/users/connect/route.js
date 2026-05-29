import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

async function ensureTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS Connections (
            requesterId VARCHAR(191) NOT NULL,
            receiverId VARCHAR(191) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (requesterId, receiverId)
        )
    `);
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { targetUserId } = await request.json();
        if (!targetUserId || targetUserId === session.user.id) {
            return NextResponse.json({ success: false, error: 'Destino inválido' }, { status: 400 });
        }

        await ensureTable();
        const existing = await query('SELECT status FROM Connections WHERE requesterId = ? AND receiverId = ?', [session.user.id, targetUserId]);

        if (existing.length > 0) {
            await query('DELETE FROM Connections WHERE requesterId = ? AND receiverId = ?', [session.user.id, targetUserId]);
            return NextResponse.json({ success: true, status: 'NONE' });
        }

        await query('INSERT INTO Connections (requesterId, receiverId, status) VALUES (?, ?, ?)', [session.user.id, targetUserId, 'PENDING']);
        return NextResponse.json({ success: true, status: 'PENDING' });
    } catch (error) {
        console.error('Connect Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
