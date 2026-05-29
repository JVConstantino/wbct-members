import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

async function ensureNotificationTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS Notification (
            id VARCHAR(191) PRIMARY KEY,
            userId VARCHAR(191) NOT NULL,
            type VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            relatedId VARCHAR(191),
            isRead BOOLEAN NOT NULL DEFAULT FALSE,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_notification_user_created (userId, createdAt),
            INDEX idx_notification_user_read (userId, isRead)
        )
    `);
}

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        await ensureNotificationTable();

        // Buscar notificações do usuário
        const notifications = await query(`
            SELECT id, type, content, relatedId, isRead, createdAt 
            FROM Notification 
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT 20
        `, [session.user.id]);

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error('Notification Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        await ensureNotificationTable();

        // Marcar todas como lidas (ao abrir dropdown)
        await query(`
            UPDATE Notification
            SET isRead = TRUE
            WHERE userId = ? AND isRead = FALSE
        `, [session.user.id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
