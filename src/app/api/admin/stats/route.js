import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

function rangeToInterval(range) {
    switch (range) {
        case '24h':  return { days: 1,  label: '24 horas' };
        case '48h':  return { days: 2,  label: '48 horas' };
        case '7d':   return { days: 7,  label: '7 dias' };
        case '30d':  return { days: 30, label: '30 dias' };
        case '90d':  return { days: 90, label: '90 dias' };
        default:     return { days: 7,  label: '7 dias' };
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '7d';
        const { days } = rangeToInterval(range);

        // Estatísticas Básicas
        const [userCount] = await query('SELECT COUNT(*) as total FROM User');
        const [postCount] = await query('SELECT COUNT(*) as total FROM Post WHERE status = "PENDING"');
        const [pendingMembersCount] = await query('SELECT COUNT(*) as total FROM User WHERE status = "PENDING"');
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

        // Dados de Tendência: Logins no período
        const activityData = await query(`
            SELECT DATE(createdAt) as date, COUNT(*) as count 
            FROM UserActivity 
            WHERE type = 'LOGIN' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `, [days]);

        // Postagens por dia no período
        const postsData = await query(`
            SELECT DATE(createdAt) as date, COUNT(*) as count 
            FROM Post 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `, [days]);

        // Novos membros por dia no período
        const newMembersData = await query(`
            SELECT DATE(createdAt) as date, COUNT(*) as count 
            FROM User 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `, [days]);

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

        // Engajamento: Likes, Comments, Follows no período
        let engagementData = [];
        try {
            const likes = await query(`
                SELECT DATE(createdAt) as date, COUNT(*) as count 
                FROM \`Like\` 
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE(createdAt)
            `, [days]);
            const comments = await query(`
                SELECT DATE(createdAt) as date, COUNT(*) as count 
                FROM Comment 
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE(createdAt)
            `, [days]);
            const follows = await query(`
                SELECT DATE(createdAt) as date, COUNT(*) as count 
                FROM Follow 
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE(createdAt)
            `, [days]);

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

        const pendingMembers = await query(`
            SELECT id, name, email, createdAt
            FROM User
            WHERE status = "PENDING"
            ORDER BY createdAt DESC
            LIMIT 8
        `);

        return NextResponse.json({
            success: true,
            stats: {
                members: userCount.total,
                online: onlineCount.count || 0,
                pendingPosts: postCount.total,
                pendingMembers: pendingMembersCount.total,
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
            pendingPosts,
            pendingMembers
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
