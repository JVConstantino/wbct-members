import { NextResponse } from 'next/server';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

function rangeToInterval(range) {
    switch (range) {
        case '24h': return { days: 1 };
        case '48h': return { days: 2 };
        case '7d':  return { days: 7 };
        case '30d': return { days: 30 };
        case '90d': return { days: 90 };
        default:    return { days: 7 };
    }
}

function groupByDate(docs, dateField = 'createdAt') {
    const map = {};
    for (const d of docs) {
        const raw = d[dateField] || d.$createdAt;
        if (!raw) continue;
        const date = raw.split('T')[0];
        map[date] = (map[date] || 0) + 1;
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));
}

function groupByMonth(docs, dateField = 'createdAt') {
    const map = {};
    for (const d of docs) {
        const raw = d[dateField] || d.$createdAt;
        if (!raw) continue;
        const month = raw.slice(0, 7); // YYYY-MM
        const label = new Date(raw).toLocaleString('pt-BR', { month: 'short' });
        if (!map[month]) map[month] = { month, label, count: 0 };
        map[month].count++;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '7d';
        const { days } = rangeToInterval(range);
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
        const now = new Date().toISOString();

        // Parallel count queries using total
        const [
            usersRes, pendingPostsRes, pendingMembersRes,
            approvedPostsRes, rejectedPostsRes, allPostsRes,
            upcomingEventsRes, webinarsRes, onlineRes,
        ] = await Promise.all([
            db.listDocuments(DB_ID, COLS.users, [Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.posts, [Query.equal('status', 'PENDING'), Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.users, [Query.equal('status', 'PENDING'), Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.posts, [Query.equal('status', 'APPROVED'), Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.posts, [Query.equal('status', 'REJECTED'), Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.posts, [Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.events, [Query.greaterThanEqual('date', now), Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.webinars, [Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.users, [Query.greaterThanEqual('lastActiveAt', fiveMinutesAgo), Query.limit(1)]),
        ]);

        // Trend data — fetch all docs in the period and group in JS
        const [activities, periodPosts, periodUsers, monthlyUsers, recentMembersRes, pendingPostsList, pendingMembersList, periodComments] =
            await Promise.all([
                listAll(COLS.userActivities, [Query.equal('type', 'LOGIN'), Query.greaterThanEqual('createdAt', since)]),
                listAll(COLS.posts, [Query.greaterThanEqual('createdAt', since)]),
                listAll(COLS.users, [Query.greaterThanEqual('createdAt', since)]),
                listAll(COLS.users, [Query.greaterThanEqual('createdAt', sixMonthsAgo)]),
                db.listDocuments(DB_ID, COLS.users, [Query.orderDesc('createdAt'), Query.limit(5)]),
                db.listDocuments(DB_ID, COLS.posts, [Query.equal('status', 'PENDING'), Query.orderDesc('createdAt'), Query.limit(5)]),
                db.listDocuments(DB_ID, COLS.users, [Query.equal('status', 'PENDING'), Query.orderDesc('createdAt'), Query.limit(8)]),
                listAll(COLS.comments, [Query.greaterThanEqual('createdAt', since)]).catch(() => []),
            ]);

        // Enrich pending posts with author names
        const pendingPostsEnriched = await Promise.all(
            pendingPostsList.documents.map(async (p) => {
                let authorName = 'Desconhecido';
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, p.authorId);
                    authorName = u.name;
                } catch {}
                return { id: p.$id, title: p.title, createdAt: p.createdAt, authorName };
            })
        );

        return NextResponse.json({
            success: true,
            stats: {
                members: usersRes.total,
                online: onlineRes.total,
                pendingPosts: pendingPostsRes.total,
                pendingMembers: pendingMembersRes.total,
                approvedPosts: approvedPostsRes.total,
                rejectedPosts: rejectedPostsRes.total,
                totalPosts: allPostsRes.total,
                upcomingEvents: upcomingEventsRes.total,
                webinars: webinarsRes.total,
            },
            trends: {
                dailyLogins: groupByDate(activities),
                dailyPosts: groupByDate(periodPosts),
                dailyNewMembers: groupByDate(periodUsers),
                monthlyGrowth: groupByMonth(monthlyUsers),
                engagement: groupByDate(periodComments).map(d => ({
                    date: d.date,
                    likes: 0,
                    comments: d.count,
                    follows: 0,
                })),
            },
            recentMembers: recentMembersRes.documents.map(u => ({
                id: u.$id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt,
            })),
            pendingPosts: pendingPostsEnriched,
            pendingMembers: pendingMembersList.documents.map(u => ({
                id: u.$id, name: u.name, email: u.email, createdAt: u.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
