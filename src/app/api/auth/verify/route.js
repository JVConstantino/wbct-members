import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createLoginActivity, getUserByEmail, updateLastActiveAt } from '@/lib/user-store';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await getUserByEmail(email);

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        if (user.status === 'PENDING') {
            return NextResponse.json({ error: 'Your account is awaiting administrator approval.' }, { status: 403 });
        }

        if (user.status === 'REJECTED') {
            return NextResponse.json({ error: 'Your registration was rejected. Please contact support.' }, { status: 403 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }

        try {
            await createLoginActivity(user.id);
            await updateLastActiveAt(user.id);
        } catch (activityError) {
            console.error('Failed to record login activity:', activityError);
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
