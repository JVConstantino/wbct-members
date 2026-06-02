import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

const KEYS = ['email.resendApiKey', 'email.fromEmail', 'email.fromName'];

async function getSetting(key) {
    try {
        const doc = await db.getDocument(DB_ID, COLS.appSettings, key);
        return doc.settingValue || '';
    } catch {
        return '';
    }
}

async function setSetting(key, value) {
    try {
        await db.updateDocument(DB_ID, COLS.appSettings, key, {
            settingValue: value,
            updatedAt: new Date().toISOString(),
        });
    } catch {
        await db.createDocument(DB_ID, COLS.appSettings, key, {
            settingKey: key,
            settingValue: value,
            updatedAt: new Date().toISOString(),
        });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const [resendApiKey, fromEmail, fromName] = await Promise.all(KEYS.map(getSetting));

        return NextResponse.json({ success: true, data: { resendApiKey, fromEmail, fromName } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { resendApiKey, fromEmail, fromName } = await request.json();

        await Promise.all([
            setSetting('email.resendApiKey', resendApiKey || ''),
            setSetting('email.fromEmail', fromEmail || ''),
            setSetting('email.fromName', fromName || ''),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
