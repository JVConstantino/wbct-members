import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query } from '@/lib/appwrite';

export async function GET() {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const res = await db.listDocuments(DB_ID, COLS.adminAuditLog, [
            Query.orderDesc('createdAt'),
            Query.limit(200),
        ]);

        return NextResponse.json({
            success: true,
            logs: res.documents.map(d => ({
                id: d.$id,
                adminId: d.adminId,
                action: d.action,
                targetType: d.targetType,
                targetId: d.targetId,
                details: d.details,
                createdAt: d.createdAt,
            })),
        });
    } catch (error) {
        console.error('Audit log fetch error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
