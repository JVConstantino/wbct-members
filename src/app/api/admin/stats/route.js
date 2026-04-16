import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Estatísticas Básicas
        const [userCount] = await query('SELECT COUNT(*) as total FROM User');
        const [postCount] = await query('SELECT COUNT(*) as total FROM Post WHERE status = "PENDING"');
        const [approvedPosts] = await query('SELECT COUNT(*) as total FROM Post WHERE status = "APPROVED"');
        const [rejectedPosts] = await query('SELECT COUNT(*) as total FROM Post WHERE status = "REJECTED"');
        const [totalPosts] = await query('SELECT COUNT(*) as total FROM Post');
        const [eventCount] = await query('SELECT COUNT(*) as total FROM Event WHERE date >= NOW()');
        const [webinarCount] = await query('SELECT COUNT(*) as total FROM Webinar');

        // Usuários online (ativos nos últimos 5 minutos)
        const [onlineCount] = await query(`
            SELECT COUNT(*) as count 
            FROM User 
            WHERE lastActiveAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        `);

        // Dados de Tendência: Logins nos últimos 7 dias
        const activityData = await query(`
            SELECT DATE(createdAt) as date, COUNT(*) as count 
            FROM UserActivity 
            WHERE type = 'LOGIN' AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `);

        // Postagens por dia nos últimos 7 dias
        const postsData = await query(`
            SELECT DATE(createdAt) as date, COUNT(*) as count 
            FROM Post 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `);

        // Novos membros por dia nos últimos 7 dias
        const newMembersData = await query(`
            SELECT DATE(createdAt) as date, COUNT(*) as count 
            FROM User 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `);

        // Crescimento de Membros por Mês
        const memberGrowth = await query(`
            SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, 
                   DATE_FORMAT(createdAt, '%b') as label,
                   COUNT(*) as count
            FROM User
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
            ORDER BY month ASC
        `);

        // Engajamento: Likes, Comments, Follows nos últimos 7 dias
        let engagementData = [];
        try {
            const likes = await query(`
                SELECT DATE(createdAt) as date, COUNT(*) as count 
                FROM \`Like\` 
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(createdAt)
            `);
            const comments = await query(`
                SELECT DATE(createdAt) as date, COUNT(*) as count 
                FROM Comment 
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(createdAt)
            `);
            const follows = await query(`
                SELECT DATE(createdAt) as date, COUNT(*) as count 
                FROM Follow 
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(createdAt)
            `);

            // Merge data by date
            const dates = new Set([
                ...likes.map(l => l.date?.toISOString?.()?.split('T')[0] || l.date),
                ...comments.map(c => c.date?.toISOString?.()?.split('T')[0] || c.date),
                ...follows.map(f => f.date?.toISOString?.()?.split('T')[0] || f.date)
            ]);

            engagementData = Array.from(dates).sort().map(date => ({
                date,
                likes: likes.find(l => (l.date?.toISOString?.()?.split('T')[0] || l.date) === date)?.count || 0,
                comments: comments.find(c => (c.date?.toISOString?.()?.split('T')[0] || c.date) === date)?.count || 0,
                follows: follows.find(f => (f.date?.toISOString?.()?.split('T')[0] || f.date) === date)?.count || 0
            }));
        } catch (e) {
            console.log('Engagement tables may not exist:', e.message);
        }

        const recentMembers = await query('SELECT id, name, email, role, createdAt FROM User ORDER BY createdAt DESC LIMIT 5');
        const pendingPosts = await query(`
            SELECT p.id, p.title, p.createdAt, u.name as authorName 
            FROM Post p 
            JOIN User u ON p.authorId = u.id 
            WHERE p.status = "PENDING" 
            ORDER BY p.createdAt DESC 
            LIMIT 5
        `);

        return NextResponse.json({
            success: true,
            stats: {
                members: userCount.total,
                online: onlineCount.count || 0,
                pendingPosts: postCount.total,
                approvedPosts: approvedPosts.total,
                rejectedPosts: rejectedPosts.total,
                totalPosts: totalPosts.total,
                upcomingEvents: eventCount.total,
                webinars: webinarCount.total
            },
            trends: {
                dailyLogins: activityData,
                dailyPosts: postsData,
                dailyNewMembers: newMembersData,
                monthlyGrowth: memberGrowth,
                engagement: engagementData
            },
            recentMembers,
            pendingPosts
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
