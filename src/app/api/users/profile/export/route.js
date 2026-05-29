import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const userId = session.user.id;

        const [profile] = await query('SELECT id, name, email, image, bio, stack, crm, specialty, role, createdAt FROM User WHERE id = ?', [userId]);
        const posts = await query('SELECT id, title, status, createdAt, updatedAt FROM Post WHERE authorId = ? ORDER BY createdAt DESC', [userId]);
        const comments = await query('SELECT id, content, postId, createdAt FROM Comment WHERE authorId = ? ORDER BY createdAt DESC', [userId]);
        const follows = await query('SELECT followerId, followingId, createdAt FROM Follows WHERE followerId = ? OR followingId = ?', [userId, userId]).catch(() => []);
        const messages = await query('SELECT id, senderId, receiverId, createdAt FROM Message WHERE senderId = ? OR receiverId = ? ORDER BY createdAt DESC', [userId, userId]).catch(() => []);
        const events = await query(`
            SELECT e.id, e.title, e.date
            FROM Event e JOIN _UserEvents ue ON ue.A = e.id
            WHERE ue.B = ?
            ORDER BY e.date DESC
        `, [userId]).catch(() => []);
        const consents = await query('SELECT mode, preferencesJson, createdAt FROM ConsentLog WHERE userId = ? ORDER BY createdAt DESC', [userId]).catch(() => []);

        return NextResponse.json({
            success: true,
            exportedAt: new Date().toISOString(),
            data: { profile, posts, comments, follows, messages, events, consents }
        });
    } catch (error) {
        console.error('Profile Export Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
