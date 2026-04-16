import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// PATCH - Atualizar aula
export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const { title, description, videoUrl, order, attachments } = await request.json();

        await query(`
            UPDATE Lesson 
            SET title = ?, description = ?, videoUrl = ?, \`order\` = ?, updatedAt = NOW()
            WHERE id = ?
        `, [title, description ?? null, videoUrl, order ?? 0, id]);

        // Gerenciar anexos (simplificado: remove todos e insere novamente ou apenas insere novos)
        // Para simplificar agora, removeremos os existentes e inseriremos os novos se fornecidos
        if (attachments) {
            await query('DELETE FROM LessonAttachment WHERE lessonId = ?', [id]);
            for (let att of attachments) {
                const attId = 'att_' + Math.random().toString(36).substr(2, 9);
                await query(`
                    INSERT INTO LessonAttachment (id, title, url, type, lessonId, createdAt)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `, [attId, att.title ?? '', att.url ?? '', att.type ?? 'other', id]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remover aula
export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;
        await query('DELETE FROM Lesson WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
