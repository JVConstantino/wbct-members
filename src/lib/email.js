import { Resend } from 'resend';
import { db, DB_ID, COLS } from '@/lib/appwrite';

async function getSetting(key) {
    try {
        const doc = await db.getDocument(DB_ID, COLS.appSettings, key);
        return doc.settingValue || '';
    } catch {
        return '';
    }
}

async function getEmailConfig() {
    const [resendApiKey, fromEmail, fromName] = await Promise.all([
        getSetting('email.resendApiKey'),
        getSetting('email.fromEmail'),
        getSetting('email.fromName'),
    ]);
    return {
        apiKey: process.env.RESEND_API_KEY || resendApiKey,
        fromEmail: process.env.RESEND_FROM_EMAIL || fromEmail,
        fromName: process.env.RESEND_FROM_NAME || fromName || 'WBCT',
    };
}

export async function sendEmail({ to, subject, html }) {
    const cfg = await getEmailConfig();
    if (!cfg.apiKey || !cfg.fromEmail || !to) {
        return { success: false, error: 'Email config missing' };
    }

    const resend = new Resend(cfg.apiKey);
    const from = `${cfg.fromName} <${cfg.fromEmail}>`;
    const result = await resend.emails.send({ from, to, subject, html });
    return { success: true, result };
}
