import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { name, email, password, bio, specialty, crm, image } = await request.json();

        // Verificações básicas
        if (!name || !email || !password) {
            return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes.' }, { status: 400 });
        }

        // Verificar se usuário já existe
        const existing = await query('SELECT id FROM User WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json({ success: false, error: 'Este e-mail já está cadastrado.' }, { status: 400 });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = 'user_' + Date.now().toString(36);

        // Inserir usuário
        await query(`
            INSERT INTO User (id, name, email, password, bio, specialty, crm, image, role, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MEMBER', 'PENDING', NOW(), NOW())
        `, [id, name, email, hashedPassword, bio || '', specialty || '', crm || '', image || null]);

        return NextResponse.json({ success: true, message: 'Médico cadastrado com sucesso!' });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
