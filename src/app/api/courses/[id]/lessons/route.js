import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET - Listar aulas de um curso
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const lessons = await query(`
            SELECT * FROM Lesson 
            WHERE courseId = ? 
            ORDER BY \`order\` ASC, createdAt ASC
        `, [id]);

        // Buscar anexos para cada aula
        for (let lesson of lessons) {
            lesson.attachments = await query('SELECT * FROM LessonAttachment WHERE lessonId = ?', [lesson.id]);
        }

        return NextResponse.json({
            success: true,
            lessons
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Criar nova aula
export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id: courseId } = await params;
        const { title, description, videoUrl, order, attachments } = await request.json();

        if (!title || !videoUrl) {
            return NextResponse.json({ success: false, error: 'Título e URL do vídeo são obrigatórios' }, { status: 400 });
        }

        const lessonId = 'lesson_' + Date.now().toString(36);

        await query(`
            INSERT INTO Lesson (id, title, description, videoUrl, \`order\`, courseId, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [lessonId, title, description ?? null, videoUrl, order ?? 0, courseId]);

        // Inserir anexos se houver
        if (attachments && Array.isArray(attachments)) {
            for (let att of attachments) {
                const attId = 'att_' + Math.random().toString(36).substr(2, 9);
                await query(`
                    INSERT INTO LessonAttachment (id, title, url, type, lessonId, createdAt)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `, [attId, att.title ?? '', att.url ?? '', att.type ?? 'other', lessonId]);
            }
        }

        return NextResponse.json({ success: true, id: lessonId });
    } catch (error) {
        console.error('Error creating lesson:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
