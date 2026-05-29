import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createPendingUser, getUserByEmail } from '@/lib/user-store';

export async function POST(request) {
    try {
        const { name, email, password, bio, specialty, crm, image } = await request.json();

        // Verificações básicas
        if (!name || !email || !password) {
            return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes.' }, { status: 400 });
        }

        // Verificar se usuário já existe
        const existing = await getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ success: false, error: 'Este e-mail já está cadastrado.' }, { status: 400 });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        await createPendingUser({
            name,
            email,
            password: hashedPassword,
            bio,
            specialty,
            crm,
            image,
        });

        return NextResponse.json({ success: true, message: 'Médico cadastrado com sucesso!' });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
