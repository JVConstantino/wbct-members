import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST - Marcar aula como assistida/não assistida
export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id: lessonId } = await params;
        const { completed } = await request.json();
        const userId = session.user.id;

        const id = `prog_${userId}_${lessonId}`;

        // Usar UPSERT logic (INSERT ... ON DUPLICATE KEY UPDATE)
        await query(`
            INSERT INTO LessonProgress (id, userId, lessonId, completed, completedAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            completed = VALUES(completed),
            completedAt = IF(VALUES(completed), NOW(), NULL),
            updatedAt = NOW()
        `, [id, userId, lessonId, completed, completed ? new Date() : null]);

        return NextResponse.json({
            success: true,
            completed
        });
    } catch (error) {
        console.error('Error updating lesson progress:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// GET - Verificar progresso da aula para o usuário atual
export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id: lessonId } = await params;
        const userId = session.user.id;

        const progress = await query(`
            SELECT completed FROM LessonProgress 
            WHERE userId = ? AND lessonId = ?
        `, [userId, lessonId]);

        return NextResponse.json({
            success: true,
            completed: progress.length > 0 ? !!progress[0].completed : false
        });
    } catch (error) {
        console.error('Error fetching lesson progress:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
