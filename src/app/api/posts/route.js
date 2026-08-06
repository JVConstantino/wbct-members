import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';
import { sendEmail } from '@/lib/email';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const authorId = searchParams.get('authorId');

        const queries = [Query.orderDesc('createdAt'), Query.limit(100)];
        if (status) {
            queries.push(Query.equal('status', status));
        } else {
            // Drafts are private scratch work — never leak into an unfiltered listing
            // (feed, admin "All" tab). Fetch them explicitly via ?status=DRAFT instead.
            queries.push(Query.notEqual('status', 'DRAFT'));
        }
        if (authorId) queries.push(Query.equal('authorId', authorId));

        const res = await db.listDocuments(DB_ID, COLS.posts, queries);

        // Fetch authors in parallel
        const authorIds = [...new Set(res.documents.map(p => p.authorId).filter(Boolean))];
        const authorMap = {};
        await Promise.all(
            authorIds.map(async (aid) => {
                try {
                    const u = await db.getDocument(DB_ID, COLS.users, aid);
                    authorMap[aid] = { id: u.$id, name: u.name, email: u.email, image: u.image };
                } catch {}
            })
        );

        const posts = res.documents.map(p => ({
            id: p.$id,
            title: p.title,
            content: p.content,
            image: p.image,
            status: p.status,
            views: p.views || 0,
            categoryId: p.categoryId || null,
            author: authorMap[p.authorId] || { name: 'Desconhecido', email: '', image: null },
            createdAt: p.createdAt,
        }));

        return NextResponse.json({ success: true, posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Only administrators can moderate posts' }, { status: 403 });
        }

        const { id, ids, status } = await request.json();
        if ((!id && (!Array.isArray(ids) || !ids.length)) || !status) {
            return NextResponse.json({ success: false, error: 'ID(s) and status are required' }, { status: 400 });
        }

        const targetIds = Array.isArray(ids) && ids.length ? ids : [id];

        await Promise.all(
            targetIds.map(pid => db.updateDocument(DB_ID, COLS.posts, pid, {
                status,
                updatedAt: new Date().toISOString(),
            }))
        );

        try {
            const posts = await Promise.all(targetIds.map(pid => db.getDocument(DB_ID, COLS.posts, pid)));
            const subject = status === 'APPROVED' ? 'Your post was approved' : 'Post update';
            for (const post of posts) {
                try {
                    const author = await db.getDocument(DB_ID, COLS.users, post.authorId);
                    await sendEmail({
                        to: author.email,
                        subject,
                        html: `<p>Hello! The post <strong>${post.title}</strong> was updated to status <strong>${status}</strong>.</p>`,
                    });
                } catch {}
            }
        } catch (e) {
            console.error('Email notification error:', e);
        }

        return NextResponse.json({ success: true, affected: targetIds.length });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const idsParam = searchParams.get('ids');
        const ids = idsParam ? idsParam.split(',').map(v => v.trim()).filter(Boolean) : [];

        if (!id && !ids.length) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        const targetIds = ids.length ? ids : [id];

        if (session.user.role !== 'ADMIN') {
            const posts = await Promise.all(targetIds.map(pid => db.getDocument(DB_ID, COLS.posts, pid)));
            const forbidden = posts.some(post => post.authorId !== session.user.id);
            if (forbidden) {
                return NextResponse.json({ success: false, error: 'Forbidden to delete this post' }, { status: 403 });
            }
        }

        await Promise.all(targetIds.map(pid => db.deleteDocument(DB_ID, COLS.posts, pid)));
        return NextResponse.json({ success: true, affected: targetIds.length });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, image, categoryId, status: requestedStatus } = await request.json();
        if (!title || !content) {
            return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
        }

        const id = 'post_' + Date.now().toString(36);
        const now = new Date().toISOString();
        // A member may explicitly opt into saving as a draft; any other requested
        // status is ignored so a member can't self-approve by forging the field.
        const status = requestedStatus === 'DRAFT'
            ? 'DRAFT'
            : (session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING');

        await db.createDocument(DB_ID, COLS.posts, id, {
            title, content,
            image: image || null,
            status,
            authorId: session.user.id,
            views: 0,
            categoryId: categoryId || null,
            createdAt: now, updatedAt: now,
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
