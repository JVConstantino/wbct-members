import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function PUT(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { name, crm, specialty, bio, image, allowMessagesFrom } = await request.json();

        await query(`
            ALTER TABLE User
            ADD COLUMN IF NOT EXISTS allowMessagesFrom VARCHAR(20) NOT NULL DEFAULT 'followers'
        `).catch(() => {});

        await query(`
            ALTER TABLE User
            ADD COLUMN IF NOT EXISTS specialty VARCHAR(255) NULL
        `).catch(() => {});

        await query(`
            ALTER TABLE User
            ADD COLUMN IF NOT EXISTS crm VARCHAR(255) NULL
        `).catch(() => {});

        await query(`
            UPDATE User 
            SET name = ?, crm = ?, specialty = ?, bio = ?, image = ?, allowMessagesFrom = COALESCE(?, allowMessagesFrom), updatedAt = NOW()
            WHERE id = ?
        `, [name, crm, specialty, bio, image, allowMessagesFrom || null, session.user.id]);

        return NextResponse.json({ success: true, message: 'Perfil atualizado!' });
    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { password } = await request.json();
        if (!password) {
            return NextResponse.json({ success: false, error: 'Senha é obrigatória' }, { status: 400 });
        }

        const rows = await query('SELECT password FROM User WHERE id = ?', [session.user.id]);
        if (!rows.length) {
            return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
        }

        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(password, rows[0].password || '');
        if (!valid) {
            return NextResponse.json({ success: false, error: 'Senha inválida' }, { status: 403 });
        }

        const userId = session.user.id;

        const safeDelete = async (sql, params = []) => {
            try { await query(sql, params); } catch {}
        };

        await safeDelete('DELETE FROM Notification WHERE userId = ?', [userId]);
        await safeDelete('DELETE FROM Message WHERE senderId = ? OR receiverId = ?', [userId, userId]);
        await safeDelete('DELETE FROM Follows WHERE followerId = ? OR followingId = ?', [userId, userId]);
        await safeDelete('DELETE FROM _UserEvents WHERE B = ?', [userId]);
        await safeDelete('DELETE FROM EventParticipantStatus WHERE userId = ?', [userId]);
        await safeDelete('DELETE FROM Connections WHERE requesterId = ? OR receiverId = ?', [userId, userId]);
        await safeDelete('DELETE FROM Comment WHERE authorId = ?', [userId]);
        await safeDelete('DELETE FROM Post WHERE authorId = ?', [userId]);
        await safeDelete('DELETE FROM User WHERE id = ?', [userId]);

        return NextResponse.json({ success: true, message: 'Conta excluída permanentemente.' });
    } catch (error) {
        console.error('Profile Delete Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
