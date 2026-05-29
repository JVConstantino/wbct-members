import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// PATCH - Atualizar curso
export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const { title, description, image } = await request.json();

        await query(`
            UPDATE Course 
            SET title = ?, description = ?, image = ?, updatedAt = NOW()
            WHERE id = ?
        `, [title, description ?? null, image ?? null, id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remover curso
export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;
        await query('DELETE FROM Course WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
