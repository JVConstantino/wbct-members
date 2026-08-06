import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, ID } from '@/lib/appwrite';
import { createAuditLog } from '@/lib/audit-log';

function slugify(input) {
    return String(input)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 200) || `category-${Date.now().toString(36)}`;
}

export async function GET() {
    try {
        const res = await db.listDocuments(DB_ID, COLS.postCategories, [
            Query.orderAsc('name'),
            Query.limit(200),
        ]);

        const categories = res.documents.map((c) => ({
            id: c.$id,
            name: c.name,
            slug: c.slug,
            createdAt: c.createdAt,
            createdBy: c.createdBy,
        }));

        return NextResponse.json({ success: true, categories });
    } catch (error) {
        console.error('Error fetching post categories:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const name = (body?.name || '').trim();
        if (!name) {
            return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        }
        if (name.length > 200) {
            return NextResponse.json({ success: false, error: 'Name is too long (max 200 characters).' }, { status: 400 });
        }

        const slug = slugify(name);

        // Enforce unique slug by appending a suffix on collision
        const existing = await db.listDocuments(DB_ID, COLS.postCategories, [
            Query.equal('slug', slug),
            Query.limit(1),
        ]);
        if (existing.documents.length > 0) {
            return NextResponse.json({ success: false, error: 'A category with that name already exists.' }, { status: 409 });
        }

        const now = new Date().toISOString();
        const doc = await db.createDocument(DB_ID, COLS.postCategories, ID.unique(), {
            name,
            slug,
            createdAt: now,
            createdBy: session.user.id || '',
        });

        await createAuditLog(session.user.id, 'post_category_created', 'post_category', doc.$id, { name, slug });

        return NextResponse.json({
            success: true,
            category: {
                id: doc.$id,
                name: doc.name,
                slug: doc.slug,
                createdAt: doc.createdAt,
                createdBy: doc.createdBy,
            },
        });
    } catch (error) {
        console.error('Error creating post category:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
