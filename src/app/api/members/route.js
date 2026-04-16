import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET - Listar todos os membros (apenas ADMIN)
export async function GET(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let sql = 'SELECT id, name, email, image, role, status, crm, specialty, bio, createdAt FROM User';
        let params = [];

        if (search) {
            sql += ' WHERE name LIKE ? OR email LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        sql += ' ORDER BY createdAt DESC';

        const members = await query(sql, params);

        return NextResponse.json({
            success: true,
            members: members.map(m => ({
                id: m.id,
                name: m.name || 'Sem nome',
                email: m.email,
                image: m.image,
                role: m.role,
                status: m.status || 'PENDING',
                crm: m.crm,
                specialty: m.specialty,
                bio: m.bio,
                createdAt: m.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Atualizar status/role/dados do membro (apenas ADMIN)
export async function PUT(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
        }

        const body = await request.json();
        const { id, password, ...otherFields } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });
        }

        const updates = [];
        const values = [];

        // Campos diretos
        const allowedFields = ['name', 'email', 'role', 'status', 'crm', 'specialty', 'bio', 'image'];

        for (const field of allowedFields) {
            if (otherFields[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(otherFields[field]);
            }
        }

        // Senha (Hash se fornecida)
        if (password && password.trim()) {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        if (updates.length > 0) {
            values.push(id);
            await query(`UPDATE User SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Criar novo membro (apenas ADMIN)
export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
        }

        const { name, email, password, role } = await request.json();
        const bcrypt = await import('bcryptjs');

        const id = 'user_' + Date.now().toString(36);
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(`
            INSERT INTO User (id, name, email, password, role)
            VALUES (?, ?, ?, ?, ?)
        `, [id, name, email, hashedPassword, role || 'MEMBER']);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating member:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remover membro (apenas ADMIN)
export async function DELETE(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });
        }

        await query('DELETE FROM User WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
