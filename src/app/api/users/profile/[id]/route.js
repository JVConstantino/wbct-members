import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user || session.user.id !== id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const users = await query('SELECT id, name, email, image, bio, stack, crm, specialty, role FROM User WHERE id = ?', [id]);

        if (users.length === 0) {
            return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: users[0] });
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
