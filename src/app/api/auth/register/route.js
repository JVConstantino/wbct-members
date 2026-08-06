import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createPendingUser, getUserByEmail } from '@/lib/user-store';
import { db, DB_ID, COLS, ID } from '@/lib/appwrite';

const ALLOWED_APPLICATION_TYPES = new Set(['MEMBER', 'ACADEMIC_AFFILIATE']);

function validateApplicationDocuments(applicationType, rawDocs) {
    const docs = (rawDocs && typeof rawDocs === 'object') ? rawDocs : {};
    const errors = {};

    const requireString = (key, label) => {
        const v = docs[key];
        if (typeof v !== 'string' || !v.trim()) {
            errors[key] = `${label} is required.`;
        }
    };

    if (applicationType === 'MEMBER') {
        requireString('cv', 'CV with list of publications');
        requireString('proofOfActivity', 'Proof of current professional activity');
        requireString('motivationLetter', 'Motivation Letter');
    } else if (applicationType === 'ACADEMIC_AFFILIATE') {
        requireString('cv', 'CV with list of publications');
        requireString('motivationLetter', 'Motivation Letter');
    }

    // picture and additionalFiles are always optional; just sanity-check
    // additionalFiles is an array of strings when present.
    if (docs.picture !== undefined && (typeof docs.picture !== 'string' || !docs.picture.trim())) {
        errors.picture = 'Picture must be a valid file path.';
    }
    if (docs.additionalFiles !== undefined) {
        if (!Array.isArray(docs.additionalFiles) || docs.additionalFiles.some((p) => typeof p !== 'string' || !p)) {
            errors.additionalFiles = 'Additional files must be a list of file paths.';
        }
    }

    return errors;
}

export async function POST(request) {
    try {
        const {
            name, email, password, bio, specialty, crm, image,
            termsAccepted, emailNewsletter,
            applicationType, applicationDocuments,
        } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, error: 'Required fields are missing.' }, { status: 400 });
        }

        if (!termsAccepted) {
            return NextResponse.json({ success: false, error: 'You must agree to the Terms of Use and Privacy Policy.' }, { status: 400 });
        }

        const normalizedApplicationType = applicationType || 'MEMBER';
        if (!ALLOWED_APPLICATION_TYPES.has(normalizedApplicationType)) {
            return NextResponse.json(
                { success: false, error: 'Invalid application type. Must be MEMBER or ACADEMIC_AFFILIATE.' },
                { status: 400 }
            );
        }

        if (!applicationType) {
            // Older client forms may omit it; treat as default but log so it shows up in server logs.
            console.warn('Registration without applicationType — defaulting to MEMBER.');
        }

        const docErrors = validateApplicationDocuments(normalizedApplicationType, applicationDocuments);
        if (Object.keys(docErrors).length > 0) {
            const messages = Object.values(docErrors);
            return NextResponse.json(
                { success: false, error: messages.join(' '), fieldErrors: docErrors },
                { status: 400 }
            );
        }

        const existing = await getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ success: false, error: 'This email is already registered.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImage = image || (applicationDocuments && typeof applicationDocuments === 'object' ? applicationDocuments.picture : '') || '';
        const userId = await createPendingUser({
            name,
            email,
            password: hashedPassword,
            bio,
            specialty,
            crm,
            image: profileImage,
            emailNewsletter: emailNewsletter || false,
            applicationType: normalizedApplicationType,
            applicationDocuments: applicationDocuments && typeof applicationDocuments === 'object' ? applicationDocuments : {},
        });

        // Log terms acceptance in the consent audit trail
        try {
            const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
            await db.createDocument(DB_ID, COLS.consentLog, ID.unique(), {
                userId,
                mode: 'registration_terms',
                preferencesJson: JSON.stringify({
                    termsAccepted: true,
                    privacyPolicyAccepted: true,
                    emailNewsletter: emailNewsletter || false,
                    applicationType: normalizedApplicationType,
                }),
                ip,
                createdAt: new Date().toISOString(),
            });
        } catch (logError) {
            console.error('Consent log error:', logError);
        }

        return NextResponse.json({ success: true, message: 'Member registered successfully!' });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
