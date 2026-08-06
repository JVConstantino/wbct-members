import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, DB_ID, COLS, Query, listAll } from '@/lib/appwrite';

export async function PUT(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { name, crm, specialty, bio, image, allowMessagesFrom } = await request.json();

        const updates = {
            name, crm, specialty, bio, image,
            updatedAt: new Date().toISOString(),
        };
        if (allowMessagesFrom) updates.allowMessagesFrom = allowMessagesFrom;

        await db.updateDocument(DB_ID, COLS.users, session.user.id, updates);

        return NextResponse.json({ success: true, message: 'Profile updated!' });
    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

const REPLACEABLE_DOC_KEYS = /^(cv|proofOfActivity|motivationLetter|picture|additional-\d+)$/;

export async function PATCH(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { docKey, url } = await request.json();
        if (!docKey || !url || !REPLACEABLE_DOC_KEYS.test(docKey)) {
            return NextResponse.json({ success: false, error: 'Invalid document key.' }, { status: 400 });
        }

        const userDoc = await db.getDocument(DB_ID, COLS.users, session.user.id);
        let parsed = {};
        if (userDoc.applicationDocuments) {
            try { parsed = JSON.parse(userDoc.applicationDocuments) || {}; } catch { parsed = {}; }
        }

        const additionalMatch = docKey.match(/^additional-(\d+)$/);
        if (additionalMatch) {
            const idx = Number(additionalMatch[1]);
            const files = Array.isArray(parsed.additionalFiles) ? [...parsed.additionalFiles] : [];
            files[idx] = url;
            parsed.additionalFiles = files;
        } else {
            parsed[docKey] = url;
        }

        await db.updateDocument(DB_ID, COLS.users, session.user.id, {
            applicationDocuments: JSON.stringify(parsed),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, applicationDocuments: parsed });
    } catch (error) {
        console.error('Profile Document Update Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { password } = await request.json();
        if (!password) {
            return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
        }

        const userDoc = await db.getDocument(DB_ID, COLS.users, session.user.id);
        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(password, userDoc.password || '');
        if (!valid) {
            return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 403 });
        }

        const userId = session.user.id;

        const safeDelete = async (col, queries) => {
            try {
                const docs = await listAll(col, queries);
                await Promise.all(docs.map(d => db.deleteDocument(DB_ID, col, d.$id).catch(() => {})));
            } catch {}
        };

        await safeDelete(COLS.notifications, [Query.equal('userId', userId)]);
        await safeDelete(COLS.messages, [Query.equal('senderId', userId)]);
        await safeDelete(COLS.messages, [Query.equal('receiverId', userId)]);
        await safeDelete(COLS.follows, [Query.equal('followerId', userId)]);
        await safeDelete(COLS.follows, [Query.equal('followingId', userId)]);
        await safeDelete(COLS.userEvents, [Query.equal('userId', userId)]);
        await safeDelete(COLS.eventParticipants, [Query.equal('userId', userId)]);
        await safeDelete(COLS.connections, [Query.equal('requesterId', userId)]);
        await safeDelete(COLS.connections, [Query.equal('receiverId', userId)]);
        await safeDelete(COLS.comments, [Query.equal('authorId', userId)]);
        await safeDelete(COLS.posts, [Query.equal('authorId', userId)]);

        await db.deleteDocument(DB_ID, COLS.users, userId);

        return NextResponse.json({ success: true, message: 'Account permanently deleted.' });
    } catch (error) {
        console.error('Profile Delete Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
