import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function POST(request) {
    try {
        const session = await auth();
        const body = await request.json();
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown';

        const id = `consent_${Date.now().toString(36)}`;

        await db.createDocument(DB_ID, COLS.consentLog, id, {
            userId: session?.user?.id || null,
            ip,
            mode: body.mode || 'custom',
            preferencesJson: JSON.stringify(body),
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error storing consent:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
