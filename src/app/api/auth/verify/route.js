import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
        }

        const users = await query(
            'SELECT id, name, email, password, role, status FROM User WHERE email = ?',
            [email]
        );

        const user = users[0];

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
        }

        // Verificar status de aprovação
        if (user.status === 'PENDING') {
            return NextResponse.json({ error: 'Sua conta aguarda aprovação de um administrador.' }, { status: 403 });
        }

        // Bloquear rejeitados também, se aplicável
        if (user.status === 'REJECTED') {
            return NextResponse.json({ error: 'Seu cadastro foi recusado. Entre em contato com o suporte.' }, { status: 403 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }

        // Registrar login na tabela UserActivity para analytics
        try {
            const activityId = `login_${user.id.slice(0, 8)}_${Date.now().toString(36)}`;
            await query(
                'INSERT INTO UserActivity (id, userId, type, createdAt) VALUES (?, ?, ?, NOW())',
                [activityId, user.id, 'LOGIN']
            );

            // Atualizar lastActiveAt para tracking de usuários online
            await query(
                'UPDATE User SET lastActiveAt = NOW() WHERE id = ?',
                [user.id]
            );
        } catch (activityError) {
            // Não bloquear login se falhar o registro de atividade
            console.error('Erro ao registrar atividade de login:', activityError);
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
