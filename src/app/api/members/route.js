import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';
import { createAuditLog } from '@/lib/audit-log';

const DEFAULT_REJECTION_REASON = 'Your application did not meet the current membership criteria. Please contact us for details.';

export async function GET(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let docs;
        if (search) {
            // Appwrite doesn't support OR search across multiple fields natively;
            // fetch all and filter in JS for small datasets
            const all = await listAll(COLS.users, [Query.orderDesc('createdAt')]);
            const term = search.toLowerCase();
            docs = all.filter(u =>
                (u.name || '').toLowerCase().includes(term) ||
                (u.email || '').toLowerCase().includes(term)
            );
        } else {
            const res = await db.listDocuments(DB_ID, COLS.users, [
                Query.orderDesc('createdAt'),
                Query.limit(500),
            ]);
            docs = res.documents;
        }

        return NextResponse.json({
            success: true,
            members: docs.map(m => {
                let parsedDocs = null;
                if (m.applicationDocuments) {
                    try { parsedDocs = JSON.parse(m.applicationDocuments); } catch { parsedDocs = null; }
                }
                return {
                    id: m.$id,
                    name: m.name || 'Unnamed',
                    email: m.email,
                    image: m.image,
                    role: m.role,
                    status: m.status || 'PENDING',
                    crm: m.crm,
                    specialty: m.specialty,
                    bio: m.bio,
                    applicationType: m.applicationType || 'MEMBER',
                    applicationDocuments: parsedDocs,
                    rejectionReason: m.rejectionReason || '',
                    createdAt: m.createdAt,
                };
            }),
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();
        const { id, ids, password, rejectionReason, ...otherFields } = body;
        const targetIds = Array.isArray(ids) && ids.length ? ids : (id ? [id] : []);

        if (!targetIds.length) {
            return NextResponse.json({ success: false, error: 'ID(s) are required' }, { status: 400 });
        }

        const allowedFields = ['name', 'email', 'role', 'status', 'crm', 'specialty', 'bio', 'image'];
        const updates = {};
        for (const field of allowedFields) {
            if (otherFields[field] !== undefined) updates[field] = otherFields[field];
        }

        if (password && password.trim()) {
            const bcrypt = await import('bcryptjs');
            updates.password = await bcrypt.hash(password, 10);
        }

        let persistedRejectionReason = null;
        if (updates.status === 'REJECTED') {
            const trimmed = typeof rejectionReason === 'string' ? rejectionReason.trim() : '';
            persistedRejectionReason = trimmed || DEFAULT_REJECTION_REASON;
            updates.rejectionReason = persistedRejectionReason;
        }

        if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date().toISOString();
            await Promise.all(targetIds.map(uid => db.updateDocument(DB_ID, COLS.users, uid, updates)));
        }

        const action = updates.status === 'APPROVED' ? 'user_approved'
            : updates.status === 'REJECTED' ? 'user_rejected'
            : 'user_updated';
        const auditDetails = { fields: Object.keys(updates) };
        if (persistedRejectionReason) {
            auditDetails.rejectionReason = persistedRejectionReason;
        }
        await createAuditLog(session.user.id, action, 'user', targetIds.join(','), auditDetails);

        return NextResponse.json({ success: true, affected: targetIds.length });
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { name, email, password, role } = await request.json();
        const bcrypt = await import('bcryptjs');

        const id = 'user_' + Date.now().toString(36);
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();

        await db.createDocument(DB_ID, COLS.users, id, {
            name, email,
            password: hashedPassword,
            role: role || 'MEMBER',
            status: 'APPROVED',
            createdAt: now, updatedAt: now,
        });

        await createAuditLog(session.user.id, 'user_created', 'user', id, { name, email, role: role || 'MEMBER' });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating member:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const idsParam = searchParams.get('ids');
        const ids = idsParam ? idsParam.split(',').map(v => v.trim()).filter(Boolean) : [];
        const targetIds = ids.length ? ids : (id ? [id] : []);

        if (!targetIds.length) {
            return NextResponse.json({ success: false, error: 'ID(s) are required' }, { status: 400 });
        }

        // Delete users and their Appwrite documents
        await Promise.all(targetIds.map(uid => db.deleteDocument(DB_ID, COLS.users, uid).catch(() => {})));

        await createAuditLog(session.user.id, 'user_deleted', 'user', targetIds.join(','), { count: targetIds.length });

        return NextResponse.json({ success: true, affected: targetIds.length });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
