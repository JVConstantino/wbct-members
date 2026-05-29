import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

async function ensureTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS AppSetting (
            settingKey VARCHAR(191) PRIMARY KEY,
            settingValue TEXT NULL,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

export async function GET() {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
        }

        await ensureTable();
        const rows = await query(`
            SELECT settingKey, settingValue FROM AppSetting
            WHERE settingKey IN ('email.resendApiKey', 'email.fromEmail', 'email.fromName')
        `);

        const map = Object.fromEntries(rows.map((r) => [r.settingKey, r.settingValue || '']));
        return NextResponse.json({
            success: true,
            data: {
                resendApiKey: map['email.resendApiKey'] || '',
                fromEmail: map['email.fromEmail'] || '',
                fromName: map['email.fromName'] || '',
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
        }

        const { resendApiKey, fromEmail, fromName } = await request.json();
        await ensureTable();

        const entries = [
            ['email.resendApiKey', resendApiKey || ''],
            ['email.fromEmail', fromEmail || ''],
            ['email.fromName', fromName || ''],
        ];

        for (const [key, value] of entries) {
            await query(
                'INSERT INTO AppSetting (settingKey, settingValue) VALUES (?, ?) ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue)',
                [key, value]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
