import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar todos os usuários (médicos) com contagem de posts
        const users = await query(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.image, 
                u.bio, 
                u.stack, 
                u.crm, 
                u.specialty,
                (SELECT COUNT(*) FROM Post WHERE authorId = u.id AND status = 'APPROVED') as postCount
            FROM User u
            WHERE u.id != ?
            ORDER BY u.name ASC
        `, [session.user.id]);

        // Formatar resposta
        const formattedUsers = users.map(u => ({
            ...u,
            _count: {
                posts: u.postCount || 0
            }
        }));

        return NextResponse.json({ success: true, users: formattedUsers });
    } catch (error) {
        console.error('Directory Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
