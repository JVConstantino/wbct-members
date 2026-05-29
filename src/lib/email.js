import { Resend } from 'resend';
import { query } from '@/lib/db';

async function getEmailConfig() {
    const rows = await query(`
        SELECT settingKey, settingValue FROM AppSetting
        WHERE settingKey IN ('email.resendApiKey', 'email.fromEmail', 'email.fromName')
    `);
    const map = Object.fromEntries(rows.map((r) => [r.settingKey, r.settingValue || '']));
    return {
        apiKey: process.env.RESEND_API_KEY || map['email.resendApiKey'] || '',
        fromEmail: process.env.RESEND_FROM_EMAIL || map['email.fromEmail'] || '',
        fromName: process.env.RESEND_FROM_NAME || map['email.fromName'] || 'WBCT',
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
