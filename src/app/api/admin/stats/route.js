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
        const label = new Date(raw).toLocaleString('en-US', { month: 'short' });
        if (!map[month]) map[month] = { month, label, count: 0 };
        map[month].count++;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

function mergeByDate(...series) {
    // series: [{ key, docs }] — merges multiple date-grouped counts into one row per date
    const map = {};
    for (const { key, docs } of series) {
        for (const d of docs) {
            const raw = d.createdAt || d.$createdAt;
            if (!raw) continue;
            const date = raw.split('T')[0];
            if (!map[date]) map[date] = { date };
            map[date][key] = (map[date][key] || 0) + 1;
        }
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

function countBy(docs, field, { top = 6, fallbackLabel = 'Not specified' } = {}) {
    const map = {};
    for (const d of docs) {
        const raw = (d[field] || '').trim();
        const key = raw || fallbackLabel;
        map[key] = (map[key] || 0) + 1;
    }
    const entries = Object.entries(map)
        .filter(([name]) => name !== fallbackLabel)
        .sort(([, a], [, b]) => b - a);
    const top6 = entries.slice(0, top);
    const rest = entries.slice(top).reduce((sum, [, v]) => sum + v, 0);
    const result = top6.map(([name, count]) => ({ name, count }));
    if (rest > 0) result.push({ name: 'Other', count: rest });
    return result;
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
            activeMembersRes, rejectedMembersRes, pendingEventConfirmationsRes,
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
            db.listDocuments(DB_ID, COLS.users, [Query.equal('status', 'APPROVED'), Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.users, [Query.equal('status', 'REJECTED'), Query.limit(1)]),
            db.listDocuments(DB_ID, COLS.eventParticipants, [Query.equal('status', 'PENDING'), Query.limit(1)]),
        ]);

        // Trend data — fetch all docs in the period and group in JS
        const [
            activities, periodPosts, periodUsers, monthlyUsers,
            recentMembersRes, pendingPostsList, pendingMembersList,
            periodComments, periodFollows, allApprovedPosts, allActiveUsers,
            pendingEventConfirmationsList,
        ] = await Promise.all([
                listAll(COLS.userActivities, [Query.equal('type', 'LOGIN'), Query.greaterThanEqual('createdAt', since)]),
                listAll(COLS.posts, [Query.greaterThanEqual('createdAt', since)]),
                listAll(COLS.users, [Query.greaterThanEqual('createdAt', since)]),
                listAll(COLS.users, [Query.greaterThanEqual('createdAt', sixMonthsAgo)]),
                db.listDocuments(DB_ID, COLS.users, [Query.orderDesc('createdAt'), Query.limit(5)]),
                db.listDocuments(DB_ID, COLS.posts, [Query.equal('status', 'PENDING'), Query.orderDesc('createdAt'), Query.limit(5)]),
                db.listDocuments(DB_ID, COLS.users, [Query.equal('status', 'PENDING'), Query.orderDesc('createdAt'), Query.limit(8)]),
                listAll(COLS.comments, [Query.greaterThanEqual('createdAt', since)]).catch(() => []),
                listAll(COLS.follows, [Query.greaterThanEqual('createdAt', since)]).catch(() => []),
                listAll(COLS.posts, [Query.equal('status', 'APPROVED')]),
                listAll(COLS.users, [Query.equal('status', 'APPROVED')]),
                db.listDocuments(DB_ID, COLS.eventParticipants, [Query.equal('status', 'PENDING'), Query.orderDesc('updatedAt'), Query.limit(5)]),
            ]);

        // Enrich pending event confirmations with event title + member name
        const pendingEventConfirmationsEnriched = await Promise.all(
            pendingEventConfirmationsList.documents.map(async (p) => {
                let eventTitle = 'Unknown event';
                let memberName = 'Unknown member';
                try {
                    const ev = await db.getDocument(DB_ID, COLS.events, p.eventId);
                    eventTitle = ev.title;
                } catch {}
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, p.userId);
                    memberName = u.name;
                } catch {}
                return { eventId: p.eventId, userId: p.userId, eventTitle, memberName, updatedAt: p.updatedAt };
            })
        );

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

        // Top authors by approved post count
        const postCountByAuthor = {};
        for (const p of allApprovedPosts) {
            if (!p.authorId) continue;
            postCountByAuthor[p.authorId] = (postCountByAuthor[p.authorId] || 0) + 1;
        }
        const topAuthorIds = Object.entries(postCountByAuthor)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        const activeUserById = Object.fromEntries(allActiveUsers.map(u => [u.$id, u]));
        const topAuthors = topAuthorIds.map(([authorId, count]) => {
            const u = activeUserById[authorId];
            return { id: authorId, name: u?.name || 'Unknown', image: u?.image || null, posts: count };
        });

        const specialties = countBy(allActiveUsers, 'specialty', { top: 6, fallbackLabel: 'Not specified' });

        const applicationTypeCounts = { MEMBER: 0, ACADEMIC_AFFILIATE: 0 };
        for (const u of allActiveUsers) {
            const type = u.applicationType === 'ACADEMIC_AFFILIATE' ? 'ACADEMIC_AFFILIATE' : 'MEMBER';
            applicationTypeCounts[type]++;
        }

        return NextResponse.json({
            success: true,
            stats: {
                members: usersRes.total,
                online: onlineRes.total,
                pendingPosts: pendingPostsRes.total,
                pendingMembers: pendingMembersRes.total,
                activeMembers: activeMembersRes.total,
                rejectedMembers: rejectedMembersRes.total,
                approvedPosts: approvedPostsRes.total,
                rejectedPosts: rejectedPostsRes.total,
                totalPosts: allPostsRes.total,
                upcomingEvents: upcomingEventsRes.total,
                webinars: webinarsRes.total,
                newFollows: periodFollows.length,
                pendingEventConfirmations: pendingEventConfirmationsRes.total,
            },
            trends: {
                dailyLogins: groupByDate(activities),
                dailyPosts: groupByDate(periodPosts),
                dailyNewMembers: groupByDate(periodUsers),
                monthlyGrowth: groupByMonth(monthlyUsers),
                engagement: mergeByDate(
                    { key: 'comments', docs: periodComments },
                    { key: 'follows', docs: periodFollows },
                ).map(d => ({ date: d.date, comments: d.comments || 0, follows: d.follows || 0 })),
            },
            breakdowns: {
                specialties,
                applicationTypes: [
                    { name: 'Member', count: applicationTypeCounts.MEMBER },
                    { name: 'Academic Affiliate', count: applicationTypeCounts.ACADEMIC_AFFILIATE },
                ].filter(d => d.count > 0),
                memberStatus: [
                    { name: 'Active', status: 'APPROVED', count: activeMembersRes.total },
                    { name: 'Pending', status: 'PENDING', count: pendingMembersRes.total },
                    { name: 'Blocked', status: 'REJECTED', count: rejectedMembersRes.total },
                ].filter(d => d.count > 0),
            },
            topAuthors,
            recentMembers: recentMembersRes.documents.map(u => ({
                id: u.$id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt,
            })),
            pendingPosts: pendingPostsEnriched,
            pendingMembers: pendingMembersList.documents.map(u => ({
                id: u.$id, name: u.name, email: u.email, createdAt: u.createdAt,
            })),
            pendingEventConfirmations: pendingEventConfirmationsEnriched,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
