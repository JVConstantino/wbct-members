import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createPendingUser, getUserByEmail } from '@/lib/user-store';

export async function POST(request) {
    try {
        const { name, email, password, bio, specialty, crm, image } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, error: 'Required fields are missing.' }, { status: 400 });
        }

        const existing = await getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ success: false, error: 'This email is already registered.' }, { status: 400 });
        }

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

        return NextResponse.json({ success: true, message: 'Doctor registered successfully!' });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
