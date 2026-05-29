import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET - Listar cursos
export async function GET() {
    try {
        const courses = await query(`
            SELECT c.*, 
            (SELECT COUNT(*) FROM Lesson l WHERE l.courseId = c.id) as lessonCount
            FROM Course c 
            ORDER BY c.createdAt DESC
        `);

        return NextResponse.json({
            success: true,
            courses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Criar novo curso
export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { title, description, image } = await request.json();

        if (!title) {
            return NextResponse.json({ success: false, error: 'Título é obrigatório' }, { status: 400 });
        }

        const id = 'course_' + Date.now().toString(36);

        await query(`
            INSERT INTO Course (id, title, description, image, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [id, title, description || null, image || null]);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
