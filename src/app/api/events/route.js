import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

// GET - Listar eventos
export async function GET(request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Expecting YYYY-MM

        let sql = 'SELECT * FROM Event';
        let params = [];

        if (month) {
            sql += ' WHERE DATE_FORMAT(date, "%Y-%m") = ?';
            params = [month];
        }

        sql += ' ORDER BY date ASC';

        const events = await query(sql, params);

        // Se logado, pegar os IDs dos eventos que o usuário segue
        let followedEventIds = [];
        if (userId) {
            const results = await query('SELECT A FROM _UserEvents WHERE B = ?', [userId]);
            followedEventIds = results.map(r => r.A);
        }

        return NextResponse.json({
            success: true,
            events: events.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description,
                date: e.date,
                color: e.color || '#3b82f6',
                link: e.link,
                isFollowing: followedEventIds.includes(e.id)
            }))
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Criar novo evento
export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
        }

        const { title, description, date, color, link } = await request.json();

        const id = 'event_' + Date.now().toString(36);

        await query(`
            INSERT INTO Event (id, title, description, date, color, link, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [id, title, description, date, color || '#3b82f6', link]);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remover evento (apenas ADMIN)
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

        await query('DELETE FROM Event WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
