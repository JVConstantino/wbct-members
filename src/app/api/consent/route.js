import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request) {
    try {
        const session = await auth();
        const body = await request.json();
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

        await query(`
            CREATE TABLE IF NOT EXISTS ConsentLog (
                id VARCHAR(191) PRIMARY KEY,
                userId VARCHAR(191) NULL,
                ip VARCHAR(64) NULL,
                mode VARCHAR(30) NOT NULL,
                preferencesJson TEXT NOT NULL,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const id = `consent_${Date.now().toString(36)}`;
        await query(
            'INSERT INTO ConsentLog (id, userId, ip, mode, preferencesJson) VALUES (?, ?, ?, ?, ?)',
            [id, session?.user?.id || null, ip, body.mode || 'custom', JSON.stringify(body)]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error storing consent:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
