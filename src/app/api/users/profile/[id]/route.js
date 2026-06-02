import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS } from '@/lib/appwrite';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user || session.user.id !== id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const doc = await db.getDocument(DB_ID, COLS.users, id);

        return NextResponse.json({
            success: true,
            user: {
                id: doc.$id,
                name: doc.name,
                email: doc.email,
                image: doc.image,
                bio: doc.bio,
                crm: doc.crm,
                specialty: doc.specialty,
                role: doc.role,
                allowMessagesFrom: doc.allowMessagesFrom || 'followers',
            },
        });
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
