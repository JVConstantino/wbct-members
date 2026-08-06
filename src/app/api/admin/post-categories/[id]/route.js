import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';
import { createAuditLog } from '@/lib/audit-log';

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Category id is required' }, { status: 400 });
        }

        // Block delete if any post still references this category
        const linked = await db.listDocuments(DB_ID, COLS.posts, [
            Query.equal('categoryId', id),
            Query.limit(1),
        ]);
        if (linked.total > 0) {
            return NextResponse.json(
                { success: false, error: `Cannot delete: ${linked.total} post(s) still use this category. Reassign or unlink them first.` },
                { status: 409 }
            );
        }

        let existing = null;
        try {
            existing = await db.getDocument(DB_ID, COLS.postCategories, id);
        } catch (e) {
            if (e?.code === 404 || e?.status === 404) {
                return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
            }
            throw e;
        }

        await db.deleteDocument(DB_ID, COLS.postCategories, id);
        await createAuditLog(session.user.id, 'post_category_deleted', 'post_category', id, { name: existing.name, slug: existing.slug });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post category:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
