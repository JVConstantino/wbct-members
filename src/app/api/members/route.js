import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

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
            members: docs.map(m => ({
                id: m.$id,
                name: m.name || 'Unnamed',
                email: m.email,
                image: m.image,
                role: m.role,
                status: m.status || 'PENDING',
                crm: m.crm,
                specialty: m.specialty,
                bio: m.bio,
                createdAt: m.createdAt,
            })),
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
        const { id, ids, password, ...otherFields } = body;
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

        if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date().toISOString();
            await Promise.all(targetIds.map(uid => db.updateDocument(DB_ID, COLS.users, uid, updates)));
        }

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

        return NextResponse.json({ success: true, affected: targetIds.length });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
