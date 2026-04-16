import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function PUT(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { name, stack, crm, specialty, bio, image } = await request.json();

        await query(`
            UPDATE User 
            SET name = ?, stack = ?, crm = ?, specialty = ?, bio = ?, image = ?, updatedAt = NOW()
            WHERE id = ?
        `, [name, stack, crm, specialty, bio, image, session.user.id]);

        return NextResponse.json({ success: true, message: 'Perfil atualizado!' });
    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
