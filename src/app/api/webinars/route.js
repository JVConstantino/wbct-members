import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Listar webinars
export async function GET(request) {
    try {
        const webinars = await query('SELECT * FROM Webinar ORDER BY `order` ASC, createdAt DESC');
        return NextResponse.json({
            success: true,
            webinars
        });
    } catch (error) {
        console.error('Error fetching webinars:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Criar webinar
export async function POST(request) {
    try {
        const { title, description, videoUrl, order } = await request.json();
        const id = 'webinar_' + Date.now().toString(36);

        await query(`
            INSERT INTO Webinar (id, title, description, videoUrl, \`order\`, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [id, title, description, videoUrl, order || 0]);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating webinar:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH - Atualizar webinar
export async function PATCH(request) {
    try {
        const { id, title, description, videoUrl, order } = await request.json();

        await query(`
            UPDATE Webinar 
            SET title = ?, description = ?, videoUrl = ?, \`order\` = ?, updatedAt = NOW()
            WHERE id = ?
        `, [title, description, videoUrl, order || 0, id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating webinar:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remover webinar
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });
        }

        await query('DELETE FROM Webinar WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting webinar:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
